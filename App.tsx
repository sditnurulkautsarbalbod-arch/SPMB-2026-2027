import React, { useState, useEffect, useRef } from 'react';
import { 
  User, MapPin, Users, Smartphone, Send, Save, 
  Settings, Lock, LogOut, ExternalLink, ArrowLeft, RefreshCw,
  ChevronLeft, ChevronRight, UserCheck
} from 'lucide-react';
import { INITIAL_STATE, OPTIONS, StudentFormData, SubmittedStudentData } from './types';
import { 
  FormSection, 
  InputField, 
  SelectField, 
  FileInputField, 
  InfoHeader, 
  ConfirmDialog, 
  SuccessNotification 
} from './components/UI';

// --- CONFIGURATION ---
// PASTE YOUR GOOGLE WEB APP URL HERE
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzAGBga2GnD2FgJtjAxdDACaJ0gHG4o9io418RSYMckxoajiX6TP2mmvZY_UA9veYmB/exec"; 

const STORAGE_KEY = 'spmb_form_data';
const DASHBOARD_CACHE_KEY = 'spmb_dashboard_cache'; // Key untuk cache dashboard
const ADMIN_SESSION_KEY = 'spmb_admin_session'; // Key untuk sesi login admin

// CHANGE: Mengambil password dari Environment Variable (Vercel)
// Jika di Vercel tidak diset, defaultnya adalah 'admin'
const ADMIN_PASSWORD = (import.meta as any).env?.VITE_ADMIN_PASSWORD || 'admin'; 

const ITEMS_PER_PAGE = 10; // Jumlah data per halaman

// --- Views Enum ---
type ViewState = 'form' | 'login' | 'dashboard';

function App() {
  // --- View State ---
  const [currentView, setCurrentView] = useState<ViewState>('form');

  // --- Form State ---
  const [formData, setFormData] = useState<StudentFormData>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0); 
  const isLoaded = useRef(false);

  // File objects for uploading
  const fileInputRefs = useRef<{
    fileFoto: File | null;
    fileKK: File | null;
    fileAkta: File | null;
    fileTransfer: File | null;
  }>({
    fileFoto: null, fileKK: null, fileAkta: null, fileTransfer: null
  });

  // --- Admin State ---
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submissions, setSubmissions] = useState<SubmittedStudentData[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State untuk pagination

  // --- Effects ---
  
  // 1. Check Login Session on Mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    if (isLoggedIn) {
      setCurrentView('dashboard');
    }
  }, []);

  // 2. Load Form Draft
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

  // 3. Save Draft on Change
  useEffect(() => {
    if (isLoaded.current && currentView === 'form') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, currentView]);

  // 4. Load Dashboard Data
  useEffect(() => {
    if (currentView === 'dashboard') {
      // a. Coba load dari LocalStorage dulu (Cache Data)
      const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY);
      if (cachedData) {
        try {
          const parsedCache = JSON.parse(cachedData);
          if (Array.isArray(parsedCache)) {
            setSubmissions(parsedCache);
          }
        } catch (e) {
          console.error("Gagal load cache dashboard", e);
        }
      }
      
      // b. Fetch data terbaru dari server
      fetchSubmissions();
    }
  }, [currentView]);

  // --- Helpers ---
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const fetchSubmissions = async () => {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_")) {
      // Mock data if URL not set
      return; 
    }

    setIsLoadingDashboard(true);
    try {
      console.log("Fetching dashboard data...");
      // UPDATE: Tambahkan redirect follow agar fetch request ke GAS berhasil
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'GET',
        redirect: 'follow' 
      });
      
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.warn("Response is not JSON:", responseText);
        // Jika response HTML (biasanya halaman login Google atau error script), hentikan
        return;
      }
      
      console.log("Dashboard Data Received:", data);

      let finalData: SubmittedStudentData[] = [];

      // Handle jika data dibungkus object { data: [...] } atau array langsung [...]
      if (Array.isArray(data)) {
        finalData = data;
      } else if (data && Array.isArray(data.data)) {
        finalData = data.data;
      } else if (data && data.result === 'error') {
         console.error("Script Error:", data.message);
         return;
      }

      if (finalData.length > 0) {
        // FILTERISASI PENTING:
        // Filter data yang memiliki ID dan Nama Lengkap untuk membuang baris kosong (Ghost Rows)
        // Ini mengatasi bug di mana Google Sheet membaca 1000 baris kosong sebagai data
        const validData = finalData.filter(item => 
          item.id && 
          item.namaLengkap && 
          String(item.namaLengkap).trim() !== ""
        );

        setSubmissions(validData);
        localStorage.setItem(DASHBOARD_CACHE_KEY, JSON.stringify(validData));
      } else {
        setSubmissions([]); // Pastikan kosong jika array empty
        console.log("Data array is empty.");
      }
      
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Gagal mengambil data terbaru. Cek koneksi atau coba lagi nanti.");
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  // --- Form Handlers ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      
      // VALIDASI TIPE FILE: HARUS GAMBAR
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, [name]: 'File harus berupa gambar (JPG, JPEG, PNG)' }));
        e.target.value = ''; // Reset input
        return;
      }

      // 10MB limit for GAS reliability
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, [name]: 'Ukuran file maksimal 10MB' }));
        e.target.value = ''; 
        return;
      }
      
      // Store file object in ref
      fileInputRefs.current = {
        ...fileInputRefs.current,
        [name]: file
      };

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
    const requiredFields: (keyof StudentFormData)[] = [
      'namaLengkap', 'jenisKelamin', 'nisn', 'asalSekolah', 'alamatAsalSekolah', 'nik', 'noKK', 'tempatLahir', 'tanggalLahir',
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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validate files presence
    if (!fileInputRefs.current.fileFoto) newErrors.fileFoto = 'Wajib upload';
    if (!fileInputRefs.current.fileKK) newErrors.fileKK = 'Wajib upload';
    if (!fileInputRefs.current.fileAkta) newErrors.fileAkta = 'Wajib upload';
    if (!fileInputRefs.current.fileTransfer) newErrors.fileTransfer = 'Wajib upload';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onPreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirm(true);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const onFinalSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // 1. Convert files to Payload Objects
      const processFile = async (file: File) => ({
        data: await fileToBase64(file),
        mimeType: file.type,
        fileName: file.name
      });

      const filesPayload: any = {};
      if (fileInputRefs.current.fileFoto) filesPayload.fileFoto = await processFile(fileInputRefs.current.fileFoto);
      if (fileInputRefs.current.fileKK) filesPayload.fileKK = await processFile(fileInputRefs.current.fileKK);
      if (fileInputRefs.current.fileAkta) filesPayload.fileAkta = await processFile(fileInputRefs.current.fileAkta);
      if (fileInputRefs.current.fileTransfer) filesPayload.fileTransfer = await processFile(fileInputRefs.current.fileTransfer);

      // Helper: Format Date YYYY-MM-DD -> DD-MM-YYYY
      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const parts = dateString.split('-');
        if (parts.length === 3) {
          return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateString;
      };

      // 2. Prepare Payload
      const submissionId = Date.now();
      const payload = {
        ...formData,
        // Override date fields with formatted strings
        tanggalLahir: formatDate(formData.tanggalLahir),
        tanggalLahirAyah: formatDate(formData.tanggalLahirAyah),
        tanggalLahirIbu: formatDate(formData.tanggalLahirIbu),
        tanggalLahirWali: formatDate(formData.tanggalLahirWali),
        id: submissionId,
        files: filesPayload
      };

      if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PASTE_")) {
        alert("Konfigurasi Error: URL Google Apps Script belum disetting di kode program (App.tsx).");
        setIsSubmitting(false);
        setShowConfirm(false);
        return;
      }

      console.log("Sending payload...", payload); // Debugging

      // 3. Send to Google Apps Script
      // UPDATE: Menggunakan header text/plain untuk menghindari CORS Preflight
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
      });

      // Handle non-JSON response gracefully
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Server returned non-JSON response:", responseText);
        throw new Error("Respon server tidak valid. Kemungkinan script error.");
      }

      // 4. Validate Success result from Script
      // Script yang baik biasanya mengembalikan { result: 'success' }
      if (data.result === 'error') {
        throw new Error(data.message || "Terjadi kesalahan pada server script.");
      }

      console.log("Server Response:", data);

      // 5. Success handling
      setIsSubmitting(false);
      setShowConfirm(false);
      setShowSuccess(true);
      
      // Clear data
      localStorage.removeItem(STORAGE_KEY);
      setFormData(INITIAL_STATE);
      fileInputRefs.current = { fileFoto: null, fileKK: null, fileAkta: null, fileTransfer: null };
      setFormKey(prev => prev + 1); 

      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error("Submission error:", error);
      alert(`Gagal mengirim data: ${error.message || "Silakan coba lagi atau hubungi admin."}`);
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  // --- Admin Handlers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true'); // Simpan sesi
      setCurrentView('dashboard');
      setLoginError('');
      setPasswordInput('');
    } else {
      setLoginError('Password salah!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY); // Hapus sesi
    setCurrentView('form');
  };

  // --- Renders ---

  const renderHeader = () => (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('form')}>
          <div className="bg-primary text-white p-2 rounded-lg font-bold text-lg">SPMB</div>
          <h1 className="font-bold text-gray-800 hidden sm:block">Formulir Pendaftaran Siswa Baru</h1>
        </div>
        <div>
          {currentView === 'form' ? (
            <button 
              onClick={() => setCurrentView('login')}
              className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
              title="Admin Login"
            >
              <Settings className="w-5 h-5" />
            </button>
          ) : currentView === 'dashboard' ? (
             <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium text-sm px-3 py-1 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          ) : (
            <button 
              onClick={() => setCurrentView('form')}
              className="flex items-center gap-2 text-gray-600 hover:text-primary font-medium text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          )}
        </div>
      </div>
    </header>
  );

  const renderLoginForm = () => (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Lock className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Masukkan password admin"
              autoFocus
            />
          </div>
          {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
          <button 
            type="submit" 
            className="w-full bg-primary hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-500/30 transition-all"
          >
            Masuk Dashboard
          </button>
        </form>
      </div>
    </div>
  );

  const renderDashboard = () => {
    // Logic Stats
    const totalLaki = submissions.filter(s => s.jenisKelamin === 'Laki-laki').length;
    const totalPerempuan = submissions.filter(s => s.jenisKelamin === 'Perempuan').length;

    // Logic Pagination
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentItems = submissions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);

    const handleNextPage = () => {
      if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const handlePrevPage = () => {
      if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    return (
      <div className="max-w-[95%] mx-auto py-8 animate-fade-in-up">
        {/* Header Dashboard & Stats */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Dashboard Admin</h2>
            <p className="text-gray-500 text-sm">Ringkasan data pendaftaran siswa baru</p>
          </div>
          <button 
            onClick={fetchSubmissions}
            disabled={isLoadingDashboard}
            className="flex items-center gap-2 text-white bg-primary hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingDashboard ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
           {/* Card Total */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Pendaftar</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{submissions.length}</p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-full">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
           </div>
           
           {/* Card Laki-laki */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Laki-laki</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalLaki}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
           </div>

           {/* Card Perempuan */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Perempuan</p>
                <p className="text-3xl font-bold text-pink-600 mt-1">{totalPerempuan}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-full">
                <UserCheck className="w-6 h-6 text-pink-600" />
              </div>
           </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 border-b border-gray-200 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">No</th>
                  <th className="px-6 py-4 whitespace-nowrap">Tanggal Pendaftar</th>
                  <th className="px-6 py-4 whitespace-nowrap">Nama Lengkap</th>
                  <th className="px-6 py-4 whitespace-nowrap">Jenis Kelamin</th>
                  <th className="px-6 py-4 whitespace-nowrap">Nama Ayah</th>
                  <th className="px-6 py-4 whitespace-nowrap">Nama Ibu</th>
                  <th className="px-6 py-4 whitespace-nowrap">Whatsapp</th>
                  <th className="px-6 py-4 whitespace-nowrap">Email</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Foto Siswa</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Kartu Keluarga</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Akta Kelahiran</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Bukti Transfer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {submissions.length === 0 ? (
                  isLoadingDashboard ? (
                    <tr>
                      <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex justify-center items-center gap-2">
                          <RefreshCw className="w-5 h-5 animate-spin text-primary" /> Mengambil data...
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-6 py-12 text-center text-gray-400">
                        Belum ada data pendaftaran yang masuk.
                      </td>
                    </tr>
                  )
                ) : (
                  currentItems.map((data, index) => (
                    <tr key={data.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{indexOfFirstItem + index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{data.tanggalPendaftaran || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{data.namaLengkap || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          data.jenisKelamin === 'Laki-laki' 
                            ? 'bg-blue-100 text-blue-700' 
                            : data.jenisKelamin === 'Perempuan' 
                            ? 'bg-pink-100 text-pink-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {data.jenisKelamin || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{data.namaAyah || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{data.namaIbu || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">{data.noWhatsapp || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">{data.email || '-'}</td>
                      
                      {/* Link Drive Columns */}
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {data.linkFoto ? (
                          <a href={data.linkFoto} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold transition-colors">
                            Lihat <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {data.linkKK ? (
                          <a href={data.linkKK} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold transition-colors">
                            Lihat <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {data.linkAkta ? (
                          <a href={data.linkAkta} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold transition-colors">
                            Lihat <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {data.linkTransfer ? (
                          <a href={data.linkTransfer} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold transition-colors">
                            Lihat <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : <span className="text-gray-400">-</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {submissions.length > 0 && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Menampilkan <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> - <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, submissions.length)}</span> dari <span className="font-medium text-gray-900">{submissions.length}</span> data
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                  Halaman {currentPage} dari {totalPages}
                </div>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
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
              required
              error={errors.nisn}
              helperText={
                <span className="block space-y-1">
                  <span className="block">NISN bisa dilihat di halaman identitas rapor siswa atau ijazah</span>
                  <span className="block">Tulis " - " apabila belum memiliki NISN atau tidak sekolah TK/RA</span>
                </span>
              }
            />
            <InputField 
              label="Asal Sekolah (TK/RA)" 
              name="asalSekolah" 
              value={formData.asalSekolah} 
              onChange={handleChange} 
              required
              error={errors.asalSekolah}
              helperText='Tulis " - " apabila tidak sekolah TK/RA'
            />
            <InputField 
              label="Alamat Asal Sekolah" 
              name="alamatAsalSekolah" 
              value={formData.alamatAsalSekolah} 
              onChange={handleChange} 
              required
              error={errors.alamatAsalSekolah}
              helperText='Tulis " - " apabila tidak sekolah TK/RA'
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
              accept="image/*"
              helperText="File Gambar (JPG/PNG), latar belakang merah/biru. Max 10MB"
              error={errors.fileFoto}
            />
            <FileInputField 
              label="Kartu Keluarga (KK)" 
              name="fileKK" 
              required 
              onChange={handleFileChange}
              accept="image/*"
              helperText="File Gambar (JPG/PNG). Max 10MB"
              error={errors.fileKK}
            />
            <FileInputField 
              label="Akta Kelahiran" 
              name="fileAkta" 
              required 
              onChange={handleFileChange}
              accept="image/*"
              helperText="File Gambar (JPG/PNG). Max 10MB"
              error={errors.fileAkta}
            />
            <FileInputField 
              label="Bukti Transfer Pendaftaran" 
              name="fileTransfer" 
              required 
              onChange={handleFileChange} 
              accept="image/*"
              helperText="File Gambar (JPG/PNG). Pastikan nominal Rp 150.000,-. Max 10MB"
              error={errors.fileTransfer}
            />
          </FormSection>

        {/* Submit Action */}
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
    </div>
  );

  return (
    <div className="min-h-screen pb-12 bg-gray-50 font-sans">
      {renderHeader()}
      
      {currentView === 'form' && renderForm()}
      {currentView === 'login' && renderLoginForm()}
      {currentView === 'dashboard' && renderDashboard()}

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
