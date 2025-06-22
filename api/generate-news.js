// File ini akan menjadi endpoint API di: https://nama-proyek-anda.vercel.app/api/generate-news

export default async function handler(req, res) {
    // 1. Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Ambil prompt dari body request yang dikirim frontend
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // 3. Ambil API Key dari Environment Variable (INI BAGIAN AMAN-NYA)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API Key not configured on the server.' });
    }

    const GOOGLE_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    
    try {
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            // Anda bisa menambahkan safetySettings atau generationConfig di sini jika perlu
        };

        // 4. Server kita yang memanggil Google API, bukan browser pengguna
        const apiResponse = await fetch(GOOGLE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            // Jika Google API mengembalikan error, teruskan pesan errornya
            console.error('Google API Error:', data.error);
            return res.status(apiResponse.status).json({ error: data.error.message || 'Failed to fetch data from Google API' });
        }
        
        // 5. Ekstrak teks berita dan kirim kembali ke frontend
        const newsText = data.candidates[0]?.content?.parts[0]?.text || '';
        
        res.status(200).json({ newsText: newsText });

    } catch (error) {
        console.error('Internal Server Error:', error);
        res.status(500).json({ error: 'An unexpected error occurred.' });
    }
}