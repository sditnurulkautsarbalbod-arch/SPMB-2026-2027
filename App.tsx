import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Users, FileText, Smartphone, Send, Save } from 'lucide-react';
import { INITIAL_STATE, OPTIONS, StudentFormData } from './types';
import { 
  FormSection, 
  InputField, 
  SelectField, 
  FileInputField, 
  InfoHeader, 
  ConfirmDialog, 
  SuccessNotification 
} from './components/UI';

const STORAGE_KEY = 'spmb_form_data';

function App() {
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Used to force re-render of file inputs on reset
  const [formKey, setFormKey] = useState(0); 
  const isLoaded = useRef(false);

  // --- Auto-Restore from LocalStorage on Mount ---
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData({ ...INITIAL_STATE, ...parsedData });
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    isLoaded.current = true;
  }, []);

  // --- Auto-Save to LocalStorage on Change ---
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // --- Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [name]: 'Ukuran file maksimal 10MB' }));
        e.target.value = ''; // Reset input
        return;
      }
      
      // Clear error
      if (errors[name]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields check
    const requiredFields: (keyof StudentFormData)[] = [
      'namaLengkap', 'jenisKelamin', 'nik', 'noKK', 'tempatLahir', 'tanggalLahir',
      'alamatJalan', 'desaKelurahan', 'kecamatan', 'tempatTinggal', 'modaTransportasi',
      'anakKeberapa', 'jumlahSaudara', 'tinggiBadan', 'beratBadan', 'jarakSekolah',
      'namaAyah', 'nikAyah', 'tanggalLahirAyah', 'pendidikanAyah', 'pekerjaanAyah', 'penghasilanAyah',
      'namaIbu', 'nikIbu', 'tanggalLahirIbu', 'pendidikanIbu', 'pekerjaanIbu', 'penghasilanIbu',
      'noWhatsapp', 'email'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        newErrors[field] = 'Wajib diisi';
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Note: Since we can't easily check file inputs state in React without controlled components 
    // for files (which is tricky/insecure), we assume file inputs are handled by browser 'required' attribute 
    // in conjunction with this check. However, for a better UX, I'll rely on HTML5 'required' 
    // prop for files during the pseudo-submit.
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onPreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    } else {
      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onFinalSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowConfirm(false);
      setShowSuccess(true);
      
      // Auto-clear
      localStorage.removeItem(STORAGE_KEY);
      setFormData(INITIAL_STATE);
      setFormKey(prev => prev + 1); // Reset file inputs

      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  return (
    <div className="min-h-screen pb-12 bg-gray-50 font-sans">
      {/* Navbar / Header - Static */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-lg font-bold text-lg">SPMB</div>
            <h1 className="font-bold text-gray-800 hidden sm:block">Formulir Pendaftaran Siswa Baru</h1>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
             <Save className="w-4 h-4" /> 
             <span className="hidden sm:inline">Auto-save aktif</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        <InfoHeader />

        <form key={formKey} onSubmit={onPreSubmit} noValidate>
          
          {/* Data Siswa */}
          <FormSection title="Data Calon Siswa" icon={<User className="w-5 h-5" />}>
            <InputField 
              label="Nama Lengkap" 
              name="namaLengkap" 
              value={formData.namaLengkap} 
              onChange={handleChange} 
              placeholder="Sesuai Akta Lahir" 
              required 
              error={errors.namaLengkap}
            />
            <SelectField 
              label="Jenis Kelamin" 
              name="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={handleChange}
              options={OPTIONS.jenisKelamin}
              required
              error={errors.jenisKelamin}
            />
            <InputField 
              label="NIK" 
              name="nik" 
              type="number"
              value={formData.nik} 
              onChange={handleChange} 
              required
              error={errors.nik}
            />
            <InputField 
              label="Nomor KK" 
              name="noKK" 
              type="number"
              value={formData.noKK} 
              onChange={handleChange} 
              required
              error={errors.noKK}
            />
            <InputField 
              label="Tempat Lahir" 
              name="tempatLahir" 
              value={formData.tempatLahir} 
              onChange={handleChange} 
              required
              error={errors.tempatLahir}
            />
            <InputField 
              label="Tanggal Lahir" 
              name="tanggalLahir" 
              type="date"
              value={formData.tanggalLahir} 
              onChange={handleChange} 
              required
              error={errors.tanggalLahir}
            />
            <InputField 
              label="NISN" 
              name="nisn" 
              value={formData.nisn} 
              onChange={handleChange} 
              placeholder="Opsional"
              helperText="NISN bisa dilihat di halaman identitas raport siswa atau ijazah"
            />
            <InputField 
              label="Asal Sekolah (TK/RA)" 
              name="asalSekolah" 
              value={formData.asalSekolah} 
              onChange={handleChange} 
              placeholder="Opsional"
            />
            <InputField 
              label="Alamat Asal Sekolah" 
              name="alamatAsalSekolah" 
              value={formData.alamatAsalSekolah} 
              onChange={handleChange} 
              placeholder="Opsional"
            />
            <InputField 
              label="Anak Keberapa" 
              name="anakKeberapa" 
              type="number"
              value={formData.anakKeberapa} 
              onChange={handleChange} 
              required
              error={errors.anakKeberapa}
            />
             <InputField 
              label="Jumlah Saudara" 
              name="jumlahSaudara" 
              type="number"
              value={formData.jumlahSaudara} 
              onChange={handleChange} 
              required
              error={errors.jumlahSaudara}
            />
            <InputField 
              label="Tinggi Badan (cm)" 
              name="tinggiBadan" 
              type="number"
              value={formData.tinggiBadan} 
              onChange={handleChange} 
              required
              error={errors.tinggiBadan}
            />
            <InputField 
              label="Berat Badan (kg)" 
              name="beratBadan" 
              type="number"
              value={formData.beratBadan} 
              onChange={handleChange} 
              required
              error={errors.beratBadan}
            />
            <InputField 
              label="Riwayat Penyakit" 
              name="riwayatPenyakit" 
              value={formData.riwayatPenyakit} 
              onChange={handleChange} 
            />
            <InputField 
              label="Kelainan Jasmani" 
              name="kelainanJasmani" 
              value={formData.kelainanJasmani} 
              onChange={handleChange} 
            />
          </FormSection>

          {/* Alamat & Tempat Tinggal */}
          <FormSection title="Alamat & Tempat Tinggal" icon={<MapPin className="w-5 h-5" />}>
            <InputField 
              label="Alamat Jalan" 
              name="alamatJalan" 
              className="md:col-span-2"
              value={formData.alamatJalan} 
              onChange={handleChange} 
              placeholder="Nama Jalan, Gg, No. Rumah"
              required
              error={errors.alamatJalan}
            />
            <InputField 
              label="Desa / Kelurahan" 
              name="desaKelurahan" 
              value={formData.desaKelurahan} 
              onChange={handleChange} 
              required
              error={errors.desaKelurahan}
            />
            <InputField 
              label="Kecamatan" 
              name="kecamatan" 
              value={formData.kecamatan} 
              onChange={handleChange} 
              required
              error={errors.kecamatan}
            />
            <InputField 
              label="RT / RW" 
              name="rtRw" 
              value={formData.rtRw} 
              onChange={handleChange} 
              placeholder="Contoh: 001/002"
            />
            <SelectField
              label="Tempat Tinggal"
              name="tempatTinggal"
              value={formData.tempatTinggal}
              onChange={handleChange}
              options={OPTIONS.tempatTinggal}
              required
              error={errors.tempatTinggal}
            />
            <SelectField
              label="Moda Transportasi"
              name="modaTransportasi"
              value={formData.modaTransportasi}
              onChange={handleChange}
              options={OPTIONS.modaTransportasi}
              required
              error={errors.modaTransportasi}
            />
            <InputField 
              label="Jarak Rumah ke Sekolah (km)" 
              name="jarakSekolah" 
              type="number"
              step="0.1"
              value={formData.jarakSekolah} 
              onChange={handleChange} 
              required
              error={errors.jarakSekolah}
            />
            <SelectField
              label="Penerima KPS/PKH?"
              name="penerimaKPS"
              value={formData.penerimaKPS}
              onChange={handleChange}
              options={OPTIONS.pilihanYaTidak}
            />
          </FormSection>

          {/* Data Orang Tua */}
          <FormSection title="Data Orang Tua" icon={<Users className="w-5 h-5" />}>
            <div className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mt-2 mb-4">Ayah Kandung</div>
            
            <InputField label="Nama Ayah" name="namaAyah" value={formData.namaAyah} onChange={handleChange} required error={errors.namaAyah} />
            <InputField label="NIK Ayah" name="nikAyah" type="number" value={formData.nikAyah} onChange={handleChange} required error={errors.nikAyah} />
            <InputField label="Tanggal Lahir Ayah" name="tanggalLahirAyah" type="date" value={formData.tanggalLahirAyah} onChange={handleChange} required error={errors.tanggalLahirAyah} />
            <SelectField label="Pendidikan Terakhir" name="pendidikanAyah" value={formData.pendidikanAyah} onChange={handleChange} options={OPTIONS.pendidikan} required error={errors.pendidikanAyah} />
            <InputField label="Pekerjaan Ayah" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleChange} required error={errors.pekerjaanAyah} />
            <SelectField label="Penghasilan Ayah" name="penghasilanAyah" value={formData.penghasilanAyah} onChange={handleChange} options={OPTIONS.penghasilan} required error={errors.penghasilanAyah} />

            <div className="md:col-span-2 text-lg font-semibold text-gray-700 border-b pb-2 mt-6 mb-4">Ibu Kandung</div>

            <InputField label="Nama Ibu" name="namaIbu" value={formData.namaIbu} onChange={handleChange} required error={errors.namaIbu} />
            <InputField label="NIK Ibu" name="nikIbu" type="number" value={formData.nikIbu} onChange={handleChange} required error={errors.nikIbu} />
            <InputField label="Tanggal Lahir Ibu" name="tanggalLahirIbu" type="date" value={formData.tanggalLahirIbu} onChange={handleChange} required error={errors.tanggalLahirIbu} />
            <SelectField label="Pendidikan Terakhir" name="pendidikanIbu" value={formData.pendidikanIbu} onChange={handleChange} options={OPTIONS.pendidikan} required error={errors.pendidikanIbu} />
            <InputField label="Pekerjaan Ibu" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleChange} required error={errors.pekerjaanIbu} />
            <SelectField label="Penghasilan Ibu" name="penghasilanIbu" value={formData.penghasilanIbu} onChange={handleChange} options={OPTIONS.penghasilan} required error={errors.penghasilanIbu} />
          </FormSection>

          {/* Data Wali (Opsional) */}
          <FormSection title="Data Wali (Opsional)" icon={<User className="w-5 h-5" />}>
             <InputField label="Nama Wali" name="namaWali" value={formData.namaWali} onChange={handleChange} />
             <InputField label="NIK Wali" name="nikWali" type="number" value={formData.nikWali} onChange={handleChange} />
             <InputField label="Tanggal Lahir Wali" name="tanggalLahirWali" type="date" value={formData.tanggalLahirWali} onChange={handleChange} />
             <SelectField label="Pendidikan Terakhir" name="pendidikanWali" value={formData.pendidikanWali} onChange={handleChange} options={OPTIONS.pendidikan} />
             <InputField label="Pekerjaan Wali" name="pekerjaanWali" value={formData.pekerjaanWali} onChange={handleChange} />
             <SelectField label="Penghasilan Wali" name="penghasilanWali" value={formData.penghasilanWali} onChange={handleChange} options={OPTIONS.penghasilan} />
          </FormSection>

          {/* Kontak */}
          <FormSection title="Kontak & Berkas" icon={<Smartphone className="w-5 h-5" />}>
            <InputField 
              label="Nomor Whatsapp" 
              name="noWhatsapp" 
              type="tel"
              value={formData.noWhatsapp} 
              onChange={handleChange} 
              placeholder="08xxxxxxxxxx"
              required
              error={errors.noWhatsapp}
            />
            <InputField 
              label="Email" 
              name="email" 
              type="email"
              value={formData.email} 
              onChange={handleChange} 
              required
              error={errors.email}
              helperText={
                <span className="block mt-1 space-y-1">
                  <span className="block">Pastikan Email yang digunakan aktif dan dapat dibuka, bukti pendaftaran ini akan dikirim ke Email anda !!!</span>
                  <span className="block">Contoh: Namasaya@gmail.com</span>
                  <span className="block italic text-red-500">*Cukup input 1 email saja, bukti pendaftaran ini tidak akan terkirim apabila menginput lebih dari 1 email.</span>
                </span>
              }
            />

            <div className="md:col-span-2 border-t my-4"></div>

            <FileInputField 
              label="Foto Calon Siswa" 
              name="fileFoto" 
              required 
              onChange={handleFileChange} 
              helperText="Format formal, latar belakang merah/biru"
              error={errors.fileFoto}
            />
            <FileInputField 
              label="Kartu Keluarga (KK)" 
              name="fileKK" 
              required 
              onChange={handleFileChange}
              error={errors.fileKK}
            />
            <FileInputField 
              label="Akta Kelahiran" 
              name="fileAkta" 
              required 
              onChange={handleFileChange}
              error={errors.fileAkta}
            />
            <FileInputField 
              label="Bukti Transfer Pendaftaran" 
              name="fileTransfer" 
              required 
              onChange={handleFileChange} 
              helperText="Pastikan nominal Rp 150.000,-"
              error={errors.fileTransfer}
            />
          </FormSection>

          {/* Submit Action - Static and Centered */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4">
            <button 
              type="submit" 
              className="bg-primary hover:bg-secondary text-white px-12 py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Send className="w-5 h-5" />
              Kirim Formulir
            </button>
            
          </div>

        </form>
      </main>

      {/* Overlays */}
      <ConfirmDialog 
        isOpen={showConfirm} 
        onCancel={() => setShowConfirm(false)} 
        onConfirm={onFinalSubmit}
        isSubmitting={isSubmitting}
      />
      
      <SuccessNotification 
        isOpen={showSuccess} 
        onClose={() => setShowSuccess(false)} 
      />
    </div>
  );
}

export default App;