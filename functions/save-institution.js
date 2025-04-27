const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
    // Sadece POST isteklerini kabul et
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }
    
    try {
        // Request body'den veriyi al
        const requestData = JSON.parse(event.body);
        
        // Gerekli alanların kontrolü
        const requiredFields = ['plaka', 'name', 'description', 'type', 'address', 'website'];
        for (const field of requiredFields) {
            if (!requestData[field]) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `${field} alanı gereklidir.` })
                };
            }
        }
        
        // Boş image alanını ekle
        const institutionData = {
            ...requestData,
            image: ""
        };
        
        // JSON dosya yolunu belirle
        const jsonFilePath = path.join(__dirname, '../data/russian_institutions.json');
        
        // Dosya var mı kontrol et, yoksa oluştur
        let existingData = {};
        try {
            const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
            existingData = JSON.parse(fileContent);
        } catch (error) {
            console.log('Dosya bulunamadı veya okunamadı, yeni oluşturuluyor.');
        }
        
        // Plaka kodu için array varsa ona ekle, yoksa oluştur
        if (!existingData[requestData.plaka]) {
            existingData[requestData.plaka] = [];
        }
        
        existingData[requestData.plaka].push(institutionData);
        
        // Dosyaya yaz
        fs.writeFileSync(jsonFilePath, JSON.stringify(existingData, null, 2));
        
        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Kurum başarıyla kaydedildi.',
                data: institutionData
            })
        };
    } catch (error) {
        console.error('Hata:', error);
        
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Sunucu hatası oluştu.' })
        };
    }
};