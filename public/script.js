// TIDAK ADA API KEY DI SINI. INI AMAN.
const API_URL = '/api/generate-news'; 
const DRAFT_STORAGE_KEY = 'beritaGenDrafts';

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

// === FUNGSI-FUNGSI UNTUK MANAJEMEN DRAF ===
function saveDraft(category, fieldId, value) {
    if (!category) return;
    try {
        const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || {};
        if (!allDrafts[category]) allDrafts[category] = {};
        allDrafts[category][fieldId] = value;
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));
    } catch (e) { console.error("Gagal menyimpan draf:", e); }
}

function loadDraft(category) {
    if (!category) return;
    try {
        const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || {};
        const categoryDraft = allDrafts[category];
        if (categoryDraft && Object.keys(categoryDraft).length > 0) {
            console.log(`Memuat draf untuk kategori: ${category}`);
            showNotification(`Draf untuk kategori '${category}' berhasil dimuat.`);
            const form = document.getElementById(`form-${category}`);
            Object.keys(categoryDraft).forEach(fieldId => {
                const field = form.querySelector(`#${fieldId}`);
                if (field) field.value = categoryDraft[fieldId];
            });
        }
    } catch (e) { console.error("Gagal memuat draf:", e); }
}

function clearDraft(category) {
    if (!category) return;
    try {
        const allDrafts = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY)) || {};
        delete allDrafts[category];
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));
        console.log(`Draf untuk kategori '${category}' telah dihapus.`);
    } catch (e) { console.error("Gagal menghapus draf:", e); }
}

// === LOGIKA EVENT LISTENERS ===
dynamicFormArea.addEventListener('input', function(event) {
    const category = categorySelector.value;
    const field = event.target;
    if (field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
        saveDraft(category, field.id, field.value);
    }
});

dynamicFormArea.addEventListener('click', function(event) {
    if (event.target.classList.contains('clear-draft-btn')) {
        const category = categorySelector.value;
        if (category && confirm(`Anda yakin ingin menghapus semua isian (draf) untuk kategori '${category}'?`)) {
            clearDraft(category);
            const form = document.getElementById(`form-${category}`);
            form.querySelectorAll('input, textarea').forEach(field => field.value = '');
            showNotification(`Draf untuk '${category}' telah dihapus.`, true);
        }
    }
});

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
    const prompt = buildPrompt(selectedCategory, data);
    if (!prompt) {
        showNotification("Maaf, kategori ini belum memiliki template prompt.", true);
        return;
    }
    
    appDescription.style.display = 'none'; 
    showLoading(true);
    
    try {
        const payload = { prompt };
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || `API Error: Status ${response.status}`);
        
        displayResult(result.newsText);
        clearDraft(selectedCategory);
    } catch (error) {
        console.error("Error saat memanggil backend:", error);
        displayResult(`Terjadi kesalahan:\n\n${error.message}\n\nPastikan semua input sudah benar dan coba lagi.`);
    } finally {
        showLoading(false);
    }
});

// === FUNGSI buildPrompt YANG DIREFAKTOR ===
function buildPrompt(category, data) {
    if (!PROMPTS[category]) {
        return null;
    }
    let promptText = PROMPTS[category];
    Object.keys(data).forEach(id => {
        const placeholder = `\${data['${id}']}`;
        promptText = promptText.replace(new RegExp(escapeRegExp(placeholder), 'g'), data[id]);
    });
    return promptText;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// === Blok Fungsi Helper ===
function showLoading(isLoading) { /* ... */ }
function displayResult(newsText) { /* ... */ }
copyBtn.addEventListener('click', function() { /* ... */ });
whatsappBtn.addEventListener('click', function() { /* ... */ });
function showNotification(message, isError = false) { /* ... */ }
