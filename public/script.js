// TIDAK ADA LAGI API KEY DI SINI. INI AMAN.
// URL sekarang menunjuk ke endpoint backend kita.
const API_URL = '/api/generate-news'; 

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

categorySelector.addEventListener('change', function() {
    // ... (Logika ini tetap sama persis seperti kode asli Anda) ...
    const selectedCategory = this.value;
    allFormContainers.forEach(form => form.style.display = 'none');
    actionButtonContainer.style.display = 'none';
    outputSection.style.display = 'none'; 
    mainInputSection.style.display = 'block'; 
    
    if (selectedCategory) {
        const formToShow = document.getElementById(`form-${selectedCategory}`);
        if (formToShow) {
            formToShow.style.display = 'block';
            actionButtonContainer.style.display = 'block';
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
    
    // ... (Logika validasi form tetap sama) ...
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

    showLoading(true);
    
    try {
        // === PERUBAHAN UTAMA DI SINI ===
        // 1. Payload sekarang hanya berisi prompt.
        const payload = {
            prompt: prompt 
        };

        // 2. Fetch memanggil backend kita, bukan Google langsung.
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
            // Menangkap error dari backend kita
            throw new Error(result.error || `API Error: Status ${response.status}`);
        }
        
        // 3. Hasilnya ada di dalam properti yang kita tentukan di backend (misal: newsText)
        const newsText = result.newsText;
        displayResult(newsText);

    } catch (error) {
        console.error("Error saat memanggil backend:", error);
        displayResult(`Terjadi kesalahan:\n\n${error.message}\n\nPastikan semua input sudah benar dan coba lagi.`);
    } finally {
        showLoading(false);
    }
});

function buildPrompt(category, data) {
    // ... (Fungsi buildPrompt tetap sama persis seperti kode asli Anda) ...
    // ... Tidak perlu mengubah apapun di sini ...
    if (category === 'apel') {
        return `...prompt apel Anda...`;
    } else if (category === 'bimtek') {
        return `...prompt bimtek Anda...`;
    }
    return null;
}

function showLoading(isLoading) {
    // ... (Fungsi ini tetap sama) ...
}
        
function displayResult(newsText) {
    // ... (Fungsi ini tetap sama) ...
}

copyBtn.addEventListener('click', function() {
    // ... (Fungsi ini tetap sama) ...
});
        
whatsappBtn.addEventListener('click', function() {
    // ... (Fungsi ini tetap sama) ...
});
        
function showNotification(message, isError = false) {
    // ... (Fungsi ini tetap sama) ...
}