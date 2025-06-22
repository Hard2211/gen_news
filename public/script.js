// TIDAK ADA API KEY DI SINI. INI AMAN.
const API_URL = '/api/generate-news'; 
const DRAFT_STORAGE_KEY = 'beritaGenDrafts'; // Kunci untuk localStorage

// === Blok Deklarasi Variabel ===
const categorySelector = document.getElementById('category-selector');
const dynamicFormArea = document.getElementById('dynamic-form-area');
const actionButtonContainer = document.getElementById('action-button-container');
const generateBtn = document.getElementById('generate-btn');
const mainInputSection = document.getElementById('main-input-section');
const outputSection = document.getElementById('output-section');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('result-container');
const newsOutput = document.getElementById('news-output');
const copyBtn = document.getElementById('copy-btn');
const whatsappBtn = document.getElementById('whatsapp-btn');
const notification = document.getElementById('notification');
const allFormContainers = dynamicFormArea.querySelectorAll('.form-container');
const appDescription = document.getElementById('app-description');

// === FUNGSI-FUNGSI UNTUK MANAJEMEN DRAF (localStorage) ===

/**
 * Menyimpan nilai field ke dalam localStorage untuk kategori tertentu.
 * @param {string} category - Kategori draf (misal: 'apel').
 * @param {string} fieldId - ID dari input/textarea.
 * @param {string} value - Nilai dari input/textarea.
 */
function saveDraft(category, fieldId, value) {
    if (!category) return;
    try {
        const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || {};
        if (!allDrafts[category]) {
            allDrafts[category] = {};
        }
        allDrafts[category][fieldId] = value;
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));
    } catch (e) {
        console.error("Gagal menyimpan draf:", e);
    }
}

/**
 * Memuat draf dari localStorage ke dalam formulir untuk kategori tertentu.
 * @param {string} category - Kategori draf yang akan dimuat.
 */
function loadDraft(category) {
    if (!category) return;
    try {
        const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || {};
        const categoryDraft = allDrafts[category];
        if (categoryDraft) {
            console.log(`Memuat draf untuk kategori: ${category}`);
            const form = document.getElementById(`form-${category}`);
            Object.keys(categoryDraft).forEach(fieldId => {
                const field = form.querySelector(`#${fieldId}`);
                if (field) {
                    field.value = categoryDraft[fieldId];
                }
            });
        }
    } catch (e) {
        console.error("Gagal memuat draf:", e);
    }
}

/**
 * Menghapus draf untuk kategori tertentu dari localStorage.
 * @param {string} category - Kategori draf yang akan dihapus.
 */
function clearDraft(category) {
    if (!category) return;
    try {
        const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || {};
        delete allDrafts[category];
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));
        console.log(`Draf untuk kategori '${category}' telah dihapus.`);
    } catch (e) {
        console.error("Gagal menghapus draf:", e);
    }
}


// === LOGIKA UNTUK MENYIMPAN DRAF SECARA OTOMATIS ===
dynamicFormArea.addEventListener('input', function(event) {
    const category = categorySelector.value;
    const field = event.target;
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
        saveDraft(category, field.id, field.value);
    }
});


// === Blok Event Listener Utama ===
categorySelector.addEventListener('change', function() {
    const selectedCategory = this.value;
    allFormContainers.forEach(form => form.style.display = 'none');
    actionButtonContainer.style.display = 'none';
    outputSection.style.display = 'none'; 
    mainInputSection.style.display = 'block'; 
    appDescription.style.display = 'block';
    
    if (selectedCategory) {
        const formToShow = document.getElementById(`form-${selectedCategory}`);
        if (formToShow) {
            formToShow.style.display = 'block';
            actionButtonContainer.style.display = 'block';
            loadDraft(selectedCategory);
        }
    }
});

generateBtn.addEventListener('click', async function() {
    const selectedCategory = categorySelector.value;
    if (!selectedCategory) return;

    const activeForm = document.getElementById(`form-${selectedCategory}`);
    const inputs = activeForm.querySelectorAll('input, textarea');
    let data = {};
    let isValid = true;
    
    for (const input of inputs) {
        const labelText = input.parentElement.previousElementSibling?.querySelector('label')?.textContent || '';
        const isOptional = labelText.includes('(Opsional)');
        const isAllowedEmpty = input.id.includes('kutipan') || input.id.includes('tindaklanjut') || input.id.includes('context');

        if (!input.value.trim() && !isOptional && !isAllowedEmpty) {
            alert(`Harap isi kolom: "${input.dataset.label}"`);
            input.focus();
            isValid = false;
            break; 
        }
        data[input.id] = input.value.trim();
    }

    if (!isValid) return;

    let prompt = buildPrompt(selectedCategory, data);
    
    if (!prompt) {
        showNotification("Maaf, kategori ini belum memiliki template prompt.", true);
        return;
    }
    
    appDescription.style.display = 'none'; 

    showLoading(true);
    
    try {
        const payload = {
            prompt: prompt 
        };

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `API Error: Status ${response.status}`);
        }
        
        const newsText = result.newsText;
        displayResult(newsText);
        clearDraft(selectedCategory);

    } catch (error) {
        console.error("Error saat memanggil backend:", error);
        displayResult(`Terjadi kesalahan:\n\n${error.message}\n\nPastikan semua input sudah benar dan coba lagi.`);
    } finally {
        showLoading(false);
    }
});

// === FUNGSI buildPrompt dengan Perintah Terbaru ===
function buildPrompt(category, data) {
    if (category === 'apel') {
        return `
Anda adalah seorang editor berita senior di sebuah kantor berita pemerintah. Anda sangat ahli dalam mengubah catatan mentah dari reporter lapangan menjadi sebuah berita yang utuh, formal, dan layak terbit. Anda menguasai struktur kalimat bahasa indonesia (SPOK), KBBI, PUEBI, dan penggunaan tanda baca yang benar.

TUGAS UTAMA:
Olah dan kembangkan data mentah yang disediakan oleh pengguna menjadi sebuah naskah berita yang lengkap, formal, dan informatif.

ATURAN WAJIB:
1.  **Struktur Piramida Terbalik:** Paragraf pertama (lead) HARUS merangkum informasi terpenting (5W+1H). Gunakan data dari bagian "LEAD" untuk membangun paragraf ini.
2.  **Bahasa Baku dan Mengalir:** Gunakan Bahasa Indonesia yang baku sesuai KBBI dan PUEBI. Gunakan kata penghubung (konjungsi) dan frasa transisi yang sesuai untuk menciptakan alur yang mulus antar kalimat dan antar paragraf. Pastikan berita terasa sebagai satu kesatuan yang utuh.
3.  **Olah Data, Bukan Salin-Tempel:** Anggap input dari pengguna adalah catatan mentah. Tugas Anda adalah mengembangkannya menjadi kalimat jurnalistik yang baik. Perbaiki sedikit jika ada kesalahan ketik minor dan susun ulang frasa agar lebih efektif dan mudah dibaca.
4.  **Ubah Poin Menjadi Paragraf:** Jika pengguna memberikan jawaban dalam bentuk poin-poin (misalnya menggunakan tanda hubung - atau angka 1.), rangkai poin-poin tersebut menjadi satu paragraf naratif yang koheren. JANGAN menampilkan daftar atau bullet points di hasil akhir.
5.  **Jumlah Paragraf:** Hasil berita harus terdiri dari 3 hingga 4 paragraf. Jangan lebih.
6.  **Judul Efektif:** Buat judul yang menarik, ringkas, dan relevan dengan inti berita, dengan hook penting untuk menarik minat pembaca.
7.  **Integrasi Kutipan:** Jika ada kutipan, integrasikan secara alami ke dalam paragraf, jangan hanya menempelkannya.
8.  **Gaya Formal dan Objektif:** Pertahankan gaya bahasa yang formal dan objektif, hindari opini pribadi.
9.  **Filter Interpretasi Negatif:** Setelah menyusun draf, lakukan pemeriksaan internal sekali lagi. Pastikan tidak ada kata, frasa, atau kalimat yang dapat menimbulkan interpretasi negatif (pesimistis, merugikan, atau ambigu) bagi pembaca.

DATA-DATA BERITA (CATATAN MENTAH DARI REPORTER):

--- BAGIAN LEAD (Paragraf 1) ---
- Pesan/Arahan Utama (What): ${data['apel-lead-what']}
- Pemimpin Apel (Who): ${data['apel-lead-who']}
- Lokasi Apel (Where): ${data['apel-lead-where']}
- Tanggal Apel (When): ${data['apel-lead-when']}
- Tujuan Inti Apel (Why): ${data['apel-lead-why']}

--- BAGIAN DETAIL PENTING (Paragraf 2) ---
- Poin Penting Lainnya: ${data['apel-detail-poin']}
- Kutipan Langsung Relevan: "${data['apel-detail-kutipan']}"

--- BAGIAN DETAIL PENDUKUNG (Paragraf 3) ---
- Suasana Peserta: ${data['apel-support-suasana']}
- Arahan Tindak Lanjut: ${data['apel-support-tindaklanjut']}

--- BAGIAN KONTEKS (Paragraf 4, Opsional) ---
- Informasi Latar Belakang: ${data['apel-context-info']}

FORMAT OUTPUT:
Hasilkan hanya teks berita lengkapnya saja, dimulai dari JUDUL yang dicetak tebal. Jangan sertakan komentar atau teks tambahan di luar naskah berita.
        `;
    }
// === PROMPT BARU UNTUK UPACARA ===
    else if (category === 'upacara') {
        return `
Anda adalah seorang editor berita senior di sebuah kantor berita pemerintah, ahli dalam menyusun laporan kegiatan seremonial menjadi berita yang khidmat, informatif, dan formal. Anda menguasai KBBI, PUEBI, dan dapat merangkai kronologi acara dengan baik.

TUGAS UTAMA:
Olah data mentah berikut menjadi sebuah naskah berita yang lengkap mengenai pelaksanaan sebuah upacara.

ATURAN WAJIB:
1.  **Struktur Piramida Terbalik:** Paragraf pertama (lead) HARUS merangkum informasi kunci: Jenis & Tujuan Upacara, Tokoh Sentral & Peserta, Waktu & Lokasi, dan Poin Menonjol dari prosesi/amanat.
2.  **Bahasa Baku dan Formal:** Gunakan Bahasa Indonesia yang baku, formal, dan sesuai dengan suasana khidmat sebuah upacara.
3.  **Alur Paragraf Logis:**
    *   **Paragraf 1 (Lead):** Rangkum semua informasi dari bagian "Inti Berita (Lead)".
    *   **Paragraf 2 (Detail):** Fokus pada detail jalannya acara. Gabungkan "Alur Singkat Upacara" dan "Isi Pokok Amanat" menjadi satu narasi yang koheren. Integrasikan "Kutipan Langsung" di sini jika ada.
    *   **Paragraf 3 (Suasana):** Deskripsikan "Suasana Upacara" dan "Momen Simbolis Lainnya" untuk memberikan gambaran yang lebih hidup kepada pembaca.
    *   **Paragraf 4 (Konteks):** Gunakan data "Pesan/Dampak" sebagai paragraf penutup yang kuat jika data tersebut diisi.
4.  **Judul Efektif:** Buat judul yang mencerminkan nama atau tujuan utama dari upacara tersebut.
5.  **Filter Interpretasi Negatif:** Setelah menyusun draf, lakukan pemeriksaan internal sekali lagi. Pastikan tidak ada kata, frasa, atau kalimat yang dapat menimbulkan interpretasi negatif (pesimistis, merugikan, atau ambigu) bagi pembaca.

DATA-DATA BERITA (CATATAN MENTAH DARI REPORTER):

--- BAGIAN 1: INTI BERITA (LEAD) ---
- Jenis Upacara dan Tujuan Utama: ${data['upacara-lead-tujuan']}
- Tokoh Sentral dan Peserta Utama: ${data['upacara-lead-tokoh']}
- Waktu dan Lokasi Pelaksanaan: ${data['upacara-lead-waktu-lokasi']}
- Poin Paling Menonjol dari Prosesi/Amanat: ${data['upacara-lead-poin']}

--- BAGIAN 2: DETAIL PENTING ---
- Alur Singkat atau Kronologi Upacara: ${data['upacara-detail-alur']}
- Isi Pokok Amanat Inspektur Upacara: ${data['upacara-detail-amanat']}
- Kutipan Langsung Relevan: "${data['upacara-detail-kutipan']}"

--- BAGIAN 3: DETAIL PENDUKUNG ---
- Suasana dan Respon Umum Peserta: ${data['upacara-support-suasana']}
- Momen atau Prosesi Simbolis Lainnya: ${data['upacara-support-momen']}

--- BAGIAN 4: KONTEKS/DAMPAK (OPSIONAL) ---
- Pesan atau Dampak yang Diharapkan: ${data['upacara-context-dampak']}

FORMAT OUTPUT:
Hasilkan hanya teks berita lengkapnya saja, dimulai dari JUDUL yang dicetak tebal. Jangan sertakan komentar atau teks tambahan di luar naskah berita.
        `;
    }
        
    else if (category === 'bimtek') {
        return `
Anda adalah seorang editor berita senior di sebuah kantor berita pemerintah, ahli dalam mengubah catatan mentah menjadi berita yang utuh dan formal. Anda menguasai struktur kalimat (SPOK), KBBI, PUEBI, dan tanda baca yang benar.

TUGAS UTAMA:
Olah dan kembangkan data mentah berikut, yang merupakan laporan dari seorang peserta/jurnalis, menjadi sebuah naskah berita yang informatif dan layak terbit.

ATURAN WAJIB:
1.  **Struktur Piramida Terbalik:** Paragraf pertama (lead) HARUS merangkum informasi kunci: Jenis & Judul Kegiatan (What), Penyelenggara & Pembuka (Who), Lokasi & Waktu (Where & When), dan Tujuan Utama (Why).
2.  **Bahasa Baku dan Mengalir:** Gunakan Bahasa Indonesia yang baku dan gunakan kata penghubung untuk menciptakan alur yang mulus.
3.  **Olah Data, Bukan Salin-Tempel:** Kembangkan catatan mentah menjadi kalimat jurnalistik yang baik.
4.  **Ubah Poin Menjadi Paragraf:** Jika ada jawaban dalam bentuk poin-poin, rangkai menjadi paragraf naratif yang koheren.
5.  **Alur Paragraf Logis:**
    *   **Paragraf 1:** Gunakan data dari bagian "LEAD".
    *   **Paragraf 2:** Fokus pada substansi acara, gabungkan "Pesan Pembukaan" dan "Materi Narasumber".
    *   **Paragraf 3:** Deskripsikan "Susunan Acara" dan "Respon Peserta" untuk memberi gambaran jalannya kegiatan.
    *   **Paragraf 4 (Jika Ada):** Gunakan data "Manfaat Konkret" sebagai kesimpulan.
6.  **Jumlah Paragraf:** Hasil berita harus terdiri dari 3 hingga 4 paragraf.
7.  **Judul Efektif:** Buat judul yang menarik dan relevan dengan judul atau tujuan kegiatan.
8.  **Gaya Formal dan Objektif:** Pertahankan gaya bahasa yang formal.
9.  **Filter Interpretasi Negatif:** Setelah menyusun draf, lakukan pemeriksaan internal sekali lagi. Pastikan tidak ada kata, frasa, atau kalimat yang dapat menimbulkan interpretasi negatif (pesimistis, merugikan, atau ambigu) bagi pembaca.

DATA-DATA BERITA (CATATAN MENTAH DARI REPORTER/PESERTA):

--- BAGIAN LEAD (Paragraf 1) ---
- Jenis dan Judul Kegiatan: ${data['bimtek-lead-judul']}
- Penyelenggara dan Pembuka Acara: ${data['bimtek-lead-pelaksana']}
- Waktu dan Lokasi Pelaksanaan: ${data['bimtek-lead-waktu-lokasi']}
- Tujuan Utama Kegiatan: ${data['bimtek-lead-tujuan']}

--- BAGIAN DETAIL PENTING (Paragraf 2) ---
- Pesan Kunci dari Sambutan Pembukaan: ${data['bimtek-detail-pesan']}
- Narasumber Inti dan Poin Materi Utama: ${data['bimtek-detail-narasumber']}

--- BAGIAN DETAIL PENDUKUNG (Paragraf 3) ---
- Gambaran Susunan Acara: ${data['bimtek-support-acara']}
- Respon dan Partisipasi Peserta (Perspektif Peliput): ${data['bimtek-support-respon']}

--- BAGIAN KONTEKS/MANFAAT (Paragraf 4, Opsional) ---
- Manfaat Konkret bagi Peserta/Biro: ${data['bimtek-context-manfaat']}

FORMAT OUTPUT:
Hasilkan hanya teks berita lengkapnya saja, dimulai dari JUDUL yang dicetak tebal. Jangan sertakan komentar atau teks tambahan di luar naskah berita.
        `;
    }
    return null;
}


// === Blok Fungsi Helper ===
function showLoading(isLoading) {
    generateBtn.disabled = isLoading;
    if (isLoading) {
        mainInputSection.style.display = 'none';
        outputSection.style.display = 'block';
        loader.style.display = 'block';
        resultContainer.style.display = 'none';
    } else {
        loader.style.display = 'none';
        resultContainer.style.display = 'block';
    }
}
        
function displayResult(newsText) {
    newsOutput.value = newsText.trim();
}

copyBtn.addEventListener('click', function() {
    const textToCopy = newsOutput.value;
    if (!textToCopy) return;

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('Teks berhasil disalin!');
        }).catch(err => {
            console.error('Gagal menyalin teks: ', err);
            showNotification('Gagal menyalin teks.', true);
        });
    } else {
        newsOutput.select();
        try {
            document.execCommand('copy');
            showNotification('Teks berhasil disalin!');
        } catch (err) {
            console.error('Fallback gagal menyalin teks: ', err);
            showNotification('Browser Anda tidak mendukung fitur salin.', true);
        }
    }
});
        
whatsappBtn.addEventListener('click', function() {
    const textToShare = newsOutput.value;
    if(textToShare) {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(textToShare)}`;
        window.open(whatsappUrl, '_blank');
    } else {
        alert('Tidak ada teks untuk dibagikan.');
    }
});
        
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.classList.remove('error');
    if (isError) {
        notification.classList.add('error');
    }
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
