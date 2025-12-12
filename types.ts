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

  // Files (Stored as dummy string references for cache logic, actual files managed via Input)
  // Note: We don't cache File objects in localStorage due to size limits.
}

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
  penghasilan: ['Kurang dari 500.000', '500.000 - 999.999', '1.000.000 - 1.999.999', '2.000.000 - 4.999.999', '5.000.000 - 20.000.000', 'Lebih dari 20.000.000'],
  pilihanYaTidak: ['Ya', 'Tidak']
};