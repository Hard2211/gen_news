<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BeritaGen</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="bg-slate-100 text-slate-800">

    <div class="container mx-auto max-w-6xl p-4 sm:p-6 md:p-8">
        
        <header class="text-center mb-8">
            <h1 class="text-3xl sm:text-4xl font-bold text-indigo-700">BeritaGen</h1>
            <p id="app-description" class="max-w-3xl mx-auto mt-3 text-base text-slate-600">
                Otomatiskan penulisan berita Anda. Untuk hasilkan draf yang cepat dan akurat, pilih kategori dan jawab pertanyaan yang relevan dengan kegiatan yang Anda ikuti. Mohon isi dengan sedetail mungkin. Semakin rinci informasi yang diberikan, semakin berkualitas berita yang akan dihasilkan.<br>Terima kasih.
            </p>
        </header>

        <main id="main-input-section" class="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
            
            <div>
                <label for="category-selector" class="block text-lg font-semibold mb-2 text-slate-700">Pilih Kategori Kegiatan</label>
                <select id="category-selector" class="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500">
                    <option value="">-- Pilih Kategori --</option>
                    <option value="apel">Apel Pagi / Gabungan</option>
                    <option value="upacara">Upacara</option>
                    <option value="rapat">Rapat Kerja / Koordinasi</option>
                    <option value="bimtek">Bimtek / Pelatihan / Workshop / Sosialisasi</option>
                    <option value="umum">Aktivitas Umum</option>
                </select>
            </div>

            <div id="dynamic-form-area" class="mt-6 border-t border-slate-200 pt-6">
                
                <div id="form-apel" class="form-container space-y-8">
                    <div class="flex justify-between items-center mb-4">
                        <p class="text-sm bg-indigo-50 text-indigo-700 p-3 rounded-lg flex-grow"><strong>Panduan Umum:</strong> Fokus pada pengisian jawaban yang akurat dan ringkas. Jawaban Anda akan menjadi bahan baku bagi AI untuk menyusun berita lengkap.</p>
                        <button class="clear-draft-btn text-sm text-red-600 hover:text-red-800 font-semibold ml-4 px-3 py-1 flex-shrink-0">Mulai Baru</button>
                    </div>
                    <div>
                        <h3 class="form-section-title">Paragraf 1: Inti Berita (Lead)</h3>
                        <!-- ... Konten form apel ... -->
                    </div>
                </div>

                <div id="form-upacara" class="form-container space-y-8">
                    <div class="flex justify-between items-center mb-4">
                        <p class="text-sm bg-indigo-50 text-indigo-700 p-3 rounded-lg flex-grow"><strong>Panduan Umum:</strong> Isi setiap pertanyaan dengan detail spesifik mengenai jalannya upacara, suasana, dan poin-poin penting dari amanat atau prosesi.</p>
                        <button class="clear-draft-btn text-sm text-red-600 hover:text-red-800 font-semibold ml-4 px-3 py-1 flex-shrink-0">Mulai Baru</button>
                    </div>
                    <div>
                        <h3 class="form-section-title">Paragraf 1: Inti Berita (Lead)</h3>
                        <!-- ... Konten form upacara ... -->
                    </div>
                </div>

                <div id="form-bimtek" class="form-container space-y-8">
                     <div class="flex justify-between items-center mb-4">
                        <p class="text-sm bg-indigo-50 text-indigo-700 p-3 rounded-lg flex-grow"><strong>Panduan Umum:</strong> Fokus pada pengisian jawaban yang akurat dan ringkas. Jawaban Anda akan menjadi bahan baku bagi AI untuk menyusun berita lengkap.</p>
                        <button class="clear-draft-btn text-sm text-red-600 hover:text-red-800 font-semibold ml-4 px-3 py-1 flex-shrink-0">Mulai Baru</button>
                    </div>
                    <div>
                        <h3 class="form-section-title">Paragraf 1: Inti Berita (Lead)</h3>
                        <!-- ... Konten form bimtek ... -->
                    </div>
                </div>

                <div id="form-rapat" class="form-container">Isian untuk Rapat Kerja akan ditambahkan di sini.</div>
                <div id="form-umum" class="form-container">Isian untuk Aktivitas Umum akan ditambahkan di sini.</div>
            </div>

            <div id="action-button-container" class="border-t border-slate-200 pt-6" style="display: none;">
                <!-- ... Tombol Buatkan Berita ... -->
            </div>
        </main>
        
        <section id="output-section" class="mt-8" style="display: none;">
            <!-- ... Konten output section ... -->
        </section>
    </div>

    <div id="notification"></div>
    
    <script src="prompts.js" defer></script>
    <script src="script.js" defer></script>
</body>
</html>
