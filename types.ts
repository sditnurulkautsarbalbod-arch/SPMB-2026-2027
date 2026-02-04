export interface StudentFormData {
  // Data Siswa
  namaLengkap: string;
  jenisKelamin: string;
  nisn: string;
  asalSekolah: string;
  alamatAsalSekolah: string;
  nik: string;
  noKK: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamatJalan: string;
  desaKelurahan: string;
  kecamatan: string;
  rtRw: string;
  tempatTinggal: string;
  modaTransportasi: string;
  anakKeberapa: string;
  jumlahSaudara: string;
  tinggiBadan: string;
  beratBadan: string;
  jarakSekolah: string;
  riwayatPenyakit: string;
  kelainanJasmani: string;
  penerimaKPS: string; // "Ya" | "Tidak"

  // Ayah
  namaAyah: string;
  nikAyah: string;
  tanggalLahirAyah: string;
  pendidikanAyah: string;
  pekerjaanAyah: string;
  penghasilanAyah: string;

  // Ibu
  namaIbu: string;
  nikIbu: string;
  tanggalLahirIbu: string;
  pendidikanIbu: string;
  pekerjaanIbu: string;
  penghasilanIbu: string;

  // Wali (Opsional)
  namaWali: string;
  nikWali: string;
  tanggalLahirWali: string;
  pendidikanWali: string;
  pekerjaanWali: string;
  penghasilanWali: string;

  // Kontak
  noWhatsapp: string;
  email: string;
}

export interface SubmittedStudentData extends StudentFormData {
  id: number;
  tanggalPendaftaran: string;
  gelombang?: string; // "Gelombang 1" atau "Gelombang 2"
  // Mock links for the dashboard
  linkFoto: string;
  linkKK: string;
  linkAkta: string;
  linkTransfer: string;
}

// Helper function untuk menentukan gelombang berdasarkan tanggal pendaftaran
// Gelombang 1: pendaftaran hingga 07 Februari 2026
// Gelombang 2: pendaftaran setelah 07 Februari 2026
export const getGelombang = (tanggalPendaftaran: string): string => {
  if (!tanggalPendaftaran) return '-';

  // Batas tanggal Gelombang 1 (07 Februari 2026, akhir hari)
  const batasGelombang1 = new Date('2026-02-07T23:59:59');

  // Parse tanggal pendaftaran
  let tanggal: Date;

  // Handle berbagai format tanggal
  if (tanggalPendaftaran.includes('T')) {
    // Format ISO: 2026-02-05T10:30:00
    tanggal = new Date(tanggalPendaftaran);
  } else if (tanggalPendaftaran.includes('-')) {
    const parts = tanggalPendaftaran.split('-');
    if (parts[0].length === 4) {
      // Format YYYY-MM-DD
      tanggal = new Date(tanggalPendaftaran);
    } else {
      // Format DD-MM-YYYY
      tanggal = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  } else if (tanggalPendaftaran.includes('/')) {
    const parts = tanggalPendaftaran.split('/');
    // Format DD/MM/YYYY atau MM/DD/YYYY - assume DD/MM/YYYY
    tanggal = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  } else {
    return '-';
  }

  if (isNaN(tanggal.getTime())) return '-';

  return tanggal <= batasGelombang1 ? 'Gelombang 1' : 'Gelombang 2';
};

export const INITIAL_STATE: StudentFormData = {
  namaLengkap: '',
  jenisKelamin: '',
  nisn: '',
  asalSekolah: '',
  alamatAsalSekolah: '',
  nik: '',
  noKK: '',
  tempatLahir: '',
  tanggalLahir: '',
  alamatJalan: '',
  desaKelurahan: '',
  kecamatan: '',
  rtRw: '',
  tempatTinggal: '',
  modaTransportasi: '',
  anakKeberapa: '',
  jumlahSaudara: '',
  tinggiBadan: '',
  beratBadan: '',
  jarakSekolah: '',
  riwayatPenyakit: '',
  kelainanJasmani: '',
  penerimaKPS: 'Tidak',
  namaAyah: '',
  nikAyah: '',
  tanggalLahirAyah: '',
  pendidikanAyah: '',
  pekerjaanAyah: '',
  penghasilanAyah: '',
  namaIbu: '',
  nikIbu: '',
  tanggalLahirIbu: '',
  pendidikanIbu: '',
  pekerjaanIbu: '',
  penghasilanIbu: '',
  namaWali: '',
  nikWali: '',
  tanggalLahirWali: '',
  pendidikanWali: '',
  pekerjaanWali: '',
  penghasilanWali: '',
  noWhatsapp: '',
  email: '',
};

export const OPTIONS = {
  jenisKelamin: ['Laki-laki', 'Perempuan'],
  tempatTinggal: ['Bersama Ortu', 'Wali', 'Asrama', 'Panti Asuhan', 'Pesantren'],
  modaTransportasi: ['Jalan Kaki', 'Angkutan Umum', 'Ojek', 'Sepeda', 'Sepeda Motor', 'Mobil Pribadi'],
  pendidikan: ['SD/Sederajat', 'SMP/Sederajat', 'SMA/Sederajat', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3', 'Tidak Sekolah'],
  penghasilan: ['Tidak Berpenghasilan', 'Kurang dari 500.000', '500.000 - 999.999', '1.000.000 - 1.999.999', '2.000.000 - 4.999.999', '5.000.000 - 20.000.000', 'Lebih dari 20.000.000'],
  pilihanYaTidak: ['Ya', 'Tidak']
};
