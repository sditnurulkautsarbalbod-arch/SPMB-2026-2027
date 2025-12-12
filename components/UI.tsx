import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

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

export const InputField: React.FC<InputProps> = ({ label, error, required, className, helperText, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all ${
        error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
      } ${className}`}
      {...props}
    />
    {helperText && <div className="text-xs text-gray-500 mt-1">{helperText}</div>}
    {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
  </div>
);

export const SelectField: React.FC<SelectProps> = ({ label, options, error, required, ...props }) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <select
        className={`w-full px-4 py-2 rounded-lg border appearance-none bg-white focus:outline-none focus:ring-2 transition-all ${
          error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'
        }`}
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

export const FileInputField: React.FC<FileInputProps> = ({ label, error, required, helperText, ...props }) => (
  <div className="flex flex-col gap-1 md:col-span-2">
    <label className="text-sm font-semibold text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-primary bg-gray-50'}`}>
      <div className="space-y-1 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="flex text-sm text-gray-600 justify-center">
          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
            <span>Upload file</span>
            <input type="file" className="sr-only" {...props} />
          </label>
        </div>
        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
        {helperText && <p className="text-xs text-blue-500 font-medium">{helperText}</p>}
      </div>
    </div>
    {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
  </div>
);

export const InfoHeader: React.FC = () => (
  <div className="bg-yellow-50 border-l-4 border-accent p-4 md:p-6 mb-8 rounded-r-lg shadow-sm">
    <div className="flex items-start">
      <div className="flex-shrink-0">
        <AlertCircle className="h-6 w-6 text-accent" />
      </div>
      <div className="ml-3">
        <h3 className="text-lg font-bold text-yellow-800">WAJIB DIBACA !!!</h3>
        <div className="mt-2 text-sm text-yellow-700 space-y-3">
          <p>
            Orang tua/wali bertanggung jawab secara hukum terhadap kebenaran data yang tercantum.
            Mohon diisi dengan benar dan lengkap karena data ini nantinya akan diinput di <strong>DAPODIK (DATA POKOK PENDIDIKAN)</strong>.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pastikan usia ananda telah mencapai minimal <strong>5 (Lima) Tahun 6 (Enam) Bulan</strong> per tanggal 01 Juli 2026.</li>
            <li>Untuk ananda yang berusia di bawah 6 (Enam) Tahun per tanggal 01 Juli 2026 wajib menyertakan <strong>Surat Keterangan Psikologi</strong>.</li>
          </ul>
          <div className="bg-white/50 p-3 rounded-md border border-yellow-200">
            <p className="font-semibold text-red-600">
              Pastikan Anda telah membayar biaya pendaftaran Rp 150.000,-.
            </p>
            <p className="text-xs mt-1">Pendaftaran tidak akan diproses apabila belum membayar biaya pendaftaran.</p>
            <div className="mt-2 font-mono text-sm bg-white p-2 rounded inline-block">
              <p>Bank BSI</p>
              <p>A/N : Alwi Firsadi</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
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
    <div className="fixed top-4 right-4 z-50 animate-fade-in-left">
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
        <CheckCircle className="w-6 h-6" />
        <div>
          <h4 className="font-bold">Berhasil!</h4>
          <p className="text-sm">Data pendaftaran telah terkirim.</p>
        </div>
        <button onClick={onClose} className="ml-4 text-white/80 hover:text-white">
          ✕
        </button>
      </div>
    </div>
  );
};