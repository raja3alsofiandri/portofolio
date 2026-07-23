/* ============================================================
   CHATBOT CONFIG — RTA Asisten
   Konfigurasi umum bot serta daftar kata kunci per intent yang
   dipakai chatbot.js untuk mendeteksi maksud pengguna. Data
   jawaban tiap intent ada di chatbot/portfolio.json.

   DAFTAR ISI:
     1. Konfigurasi Umum
     2. Daftar Intent & Kata Kunci
   ============================================================ */

const CHATBOT_CONFIG = {
    botName: "RTA Asisten",
    soundEnabled: true,
    similarityThreshold: 0.35,

    intents: {
        salam: ['halo', 'hai', 'pagi', 'siang', 'malam', 'assalamualaikum', 'hei', 'hello', 'permisi'],
        profil: ['siapa', 'biodata', 'tentang', 'about', 'kuliah', 'mahasiswa', 'universitas riau', 'unri', 'informatika', 'software engineer', 'raja', 'tri', 'alsofiandri'],
        skills: ['skill', 'keahlian', 'kemampuan', 'bisa apa', 'bahasa', 'pemrograman', 'javascript', 'php', 'java', 'python', 'ci4', 'figma', 'android studio', 'framework', 'tools', 'data science', 'anaconda', 'jupyter', 'notebook', 'analisis data', 'pengolahan data', 'sains data'],
        proyek: ['proyek', 'project', 'hasil kerja', 'kasir', 'aplikasi', 'website', 'pendidikan', 'puskesmas', 'sipusat', 'bikin apa', 'sistem kasir'],
        industrial: ['industrial', 'visit', 'kunjungan', 'industri', 'sumitomo', 'swsbi', 'pgn', 'pertamina', 'awal bros', 'rumah sakit', 'batam', 'laporan dudi', 'k3', 'wiring harness', 'gas bumi', 'his', 'rekam medis'],
        bisnis: ['bisnis', 'wirausaha', 'usaha', 'wirausahawan', 'entrepreneur', 'jualan', 'jual', 'dagang', 'finansial', 'manajemen bisnis'],
        cv: ['cv', 'resume', 'riwayat hidup', 'download cv', 'berkas', 'dokumen', 'pdf'],
        warna: ['warna', 'putih', 'suka warna'],
        musik: ['musik', 'lagu', 'penyanyi', 'taylor swift', 'swiftie', 'pop', 'dewa 19', 'dewa', 'putar', 'putarin', 'titik nadir'],
        status: ['pacar', 'doi', 'pasangan', 'sendiri', 'jomblo', 'gamon', 'galau', 'hati', 'pergi', 'sad', 'sadboy'],
        kuliner: ['makanan', 'minuman', 'kuliner', 'suka makan', 'suka minum', 'taro', 'udang', 'ayam', 'telur', 'mie', 'alergi', 'ikan', 'es', 'jajan', 'pedas', 'dingin', 'masam', 'asem'],
        kontak: ['kontak', 'hubungi', 'email', 'instagram', 'sosmed', 'github', 'alamat', 'telepon', 'contact', 'rajaalsofiandri@gmail.com', 'wa', 'whatsapp', 'nomor']
    }
};