import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Info, Upload, RefreshCw, Users } from 'lucide-react';

// --- Types ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: React.ReactNode;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: string[];
  error?: string;
  required?: boolean;
}

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

// --- Components ---

export const FormSection: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
    <div className="flex items-center gap-2 mb-6 border-b pb-2 border-gray-100">
      {icon && <span className="text-primary">{icon}</span>}
      <h2 className="text-xl font-bold text-gray-800">{title}</h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {children}
    </div>
  </div>
);

export const InputField: React.FC<InputProps> = ({ label, error, required, className, helperText, disabled, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className={`text-sm font-semibold ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
        error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
      } ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    />
    {helperText && <div className="text-xs text-gray-500 mt-1">{helperText}</div>}
    {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
  </div>
);

export const SelectField: React.FC<SelectProps> = ({ label, options, error, required, disabled, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className={`text-sm font-semibold ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        className={`w-full px-4 py-2 rounded-lg border appearance-none bg-white focus:outline-none focus:ring-2 transition-all ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
        } ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''}`}
        disabled={disabled}
        {...props}
      >
        <option value="">-- Pilih --</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
    {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
  </div>
);

export const FileInputField: React.FC<FileInputProps> = ({ label, error, required, helperText, onChange, disabled, ...props }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    // Jalankan onChange dari parent (App.tsx) terlebih dahulu untuk validasi
    if (onChange) onChange(e);

    // Cek apakah file masih ada (mungkin dihapus parent jika size > 10MB)
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <label className={`text-sm font-semibold ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className={`flex items-center justify-between p-3 border rounded-xl transition-all duration-200 ${
        disabled
          ? 'border-gray-200 bg-gray-100'
          : error
            ? 'border-red-300 bg-red-50'
            : fileName
              ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
              : 'border-gray-300 bg-white hover:border-primary hover:shadow-sm'
      }`}>
        <div className="flex items-center gap-3 overflow-hidden pr-2">
          <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-colors ${
            disabled ? 'bg-gray-200 text-gray-400' : fileName ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {fileName ? <CheckCircle className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
          </div>
          <div className="flex flex-col min-w-0">
            <span className={`text-sm font-medium truncate ${disabled ? 'text-gray-400' : fileName ? 'text-gray-900' : 'text-gray-500'}`}>
              {fileName || 'Belum ada file dipilih'}
            </span>
            {fileName && !disabled && (
              <span className="text-xs text-green-600 font-bold flex items-center gap-1 animate-pulse">
                Berhasil Upload
              </span>
            )}
          </div>
        </div>

        <label className={`flex-shrink-0 ${disabled ? 'cursor-not-allowed' : ''}`}>
          <span className={`inline-flex items-center px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            disabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : fileName
                ? 'cursor-pointer text-gray-500 hover:text-gray-700 bg-transparent'
                : 'cursor-pointer bg-primary text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-blue-500/40'
          }`}>
            {fileName ? 'Ganti' : 'Pilih File'}
          </span>
          <input
            type="file"
            className="sr-only"
            onChange={handleFileChange}
            disabled={disabled}
            {...props}
          />
        </label>
      </div>

      <div className="flex justify-between items-start px-1">
        <span className="text-xs text-gray-400">{helperText}</span>
        {error && <span className="text-xs font-semibold text-red-500">{error}</span>}
      </div>
    </div>
  );
};

// --- Quota Status Card ---
interface QuotaStatusCardProps {
  kuotaLaki: number;
  kuotaPerempuan: number;
  kuotaTotal: number;
  terisiLaki: number;
  terisiPerempuan: number;
  terisiTotal: number;
  isLoading: boolean;
  onRefresh: () => void;
}

const ProgressBar: React.FC<{
  label: string;
  terisi: number;
  total: number;
  colorClass: string;
  colorFull: string;
}> = ({ label, terisi, total, colorClass, colorFull }) => {
  const sisa = total - terisi;
  const percentage = Math.min((terisi / total) * 100, 100);
  const isFull = sisa <= 0;

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${isFull ? 'text-red-600' : 'text-gray-600'}`}>
          {terisi} / {total} <span className="text-xs font-normal">({sisa > 0 ? `Sisa ${sisa}` : 'Penuh'})</span>
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${isFull ? colorFull : colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const QuotaStatusCard: React.FC<QuotaStatusCardProps> = ({
  kuotaLaki,
  kuotaPerempuan,
  kuotaTotal,
  terisiLaki,
  terisiPerempuan,
  terisiTotal,
  isLoading,
  onRefresh
}) => {
  const sisaTotal = kuotaTotal - terisiTotal;
  const isTotalFull = sisaTotal <= 0;

  return (
    <div className={`p-6 rounded-xl shadow-sm border mb-8 ${isTotalFull ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full ${isTotalFull ? 'bg-red-100' : 'bg-blue-100'}`}>
            <Users className={`w-5 h-5 ${isTotalFull ? 'text-red-600' : 'text-blue-600'}`} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Status Kuota Pendaftaran</h3>
            <p className="text-xs text-gray-500">
              Total: <span className={`font-semibold ${isTotalFull ? 'text-red-600' : 'text-gray-700'}`}>{terisiTotal} / {kuotaTotal}</span>
              {sisaTotal > 0 ? ` (Sisa ${sisaTotal} kursi)` : ' - KUOTA PENUH'}
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-full transition-colors disabled:opacity-50"
          title="Refresh Kuota"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
          <RefreshCw className="w-4 h-4 animate-spin mr-2" />
          Memuat data kuota...
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          <ProgressBar
            label="Laki-laki"
            terisi={terisiLaki}
            total={kuotaLaki}
            colorClass="bg-blue-500"
            colorFull="bg-red-500"
          />
          <ProgressBar
            label="Perempuan"
            terisi={terisiPerempuan}
            total={kuotaPerempuan}
            colorClass="bg-pink-500"
            colorFull="bg-red-500"
          />
        </div>
      )}
    </div>
  );
};

export const InfoHeader: React.FC = () => (
  <div className="bg-yellow-50 border-l-4 border-accent p-4 md:p-6 mb-8 rounded-r-lg shadow-sm">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <AlertCircle className="h-6 w-6 text-accent" />
      </div>
      <div className="ml-3">
        <h3 className="text-lg font-bold text-yellow-800">WAJIB DIBACA!</h3>
        <div className="mt-2 text-sm text-yellow-700 space-y-3">
          <p>
            Orang tua/wali bertanggung jawab secara hukum atas kebenaran data yang tercantum. Mohon diisi dengan benar dan lengkap karena data ini nantinya akan diinput ke <strong>DAPODIK (DATA POKOK PENDIDIKAN)</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pastikan usia ananda telah mencapai minimal <strong>5 (lima) tahun 6 (enam) bulan</strong> per tanggal 1 Juli 2026.</li>
            <li>Ananda yang berusia di bawah 6 (enam) tahun per tanggal 1 Juli 2026 wajib menyertakan <strong>Surat Keterangan Psikologi</strong> dan membawanya pada saat tes.</li>
          </ul>
          <div className="bg-white/50 p-3 rounded-md border border-yellow-200">
            <p className="font-semibold text-red-600">
              Pastikan Anda telah membayar biaya pendaftaran sebesar Rp150.000,-.
            </p>
            <p className="text-xs mt-1">Pendaftaran tidak akan diproses apabila biaya pendaftaran belum dibayarkan.</p>
            <div className="mt-2 font-mono text-sm bg-white p-2 rounded inline-block">
              <p>Bank BSI</p>
              <p>A/N     : Alwi Firsadi</p>
              <p>No. Rek : 1996070691</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ConfirmDialog: React.FC<{ isOpen: boolean; onConfirm: () => void; onCancel: () => void; isSubmitting: boolean }> = ({ isOpen, onConfirm, onCancel, isSubmitting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full mb-4">
          <Info className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Konfirmasi Pengiriman</h3>
        <p className="text-center text-gray-500 mb-6">
          Apakah Anda yakin semua data sudah benar dan ingin mengirim formulir?
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Batal, Cek Lagi
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-white bg-primary hover:bg-blue-700 rounded-lg font-medium shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengirim...
              </>
            ) : (
              'Ya, Kirim Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const SuccessNotification: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in-scale text-center relative overflow-hidden">
        {/* Decorative Background Element */}
        <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h4 className="text-2xl font-bold text-gray-900 mb-3">Berhasil Terkirim!</h4>
        <p className="text-gray-500 mb-6 leading-relaxed">
          Terima kasih. Data pendaftaran formulir Anda telah berhasil kami terima dan simpan.
        </p>
        
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 text-left text-sm">
            <p className="font-bold text-blue-800 mb-2">Langkah Selanjutnya:</p>
            <ol className="list-decimal pl-4 space-y-2 text-gray-700">
                <li>Silakan cek secara berkala dan <strong>cetak / print out</strong> bukti pendaftaran yang terkirim di email Anda.</li>
                <li>
                    Silakan gabung di grup Whatsapp SPMB Nurul Kautsar:<br/>
                    <a 
                        href="https://bit.ly/Grup-WA-SDITNurulKautsar" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline break-words block mt-1"
                    >
                        https://bit.ly/Grup-WA-SDITNurulKautsar
                    </a>
                </li>
            </ol>
        </div>
        
        <button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-500/30 transform hover:-translate-y-0.5"
        >
          Selesai
        </button>
      </div>
    </div>
  );
};
