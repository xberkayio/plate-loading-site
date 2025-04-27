const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Yalnizca POST isteği destekleniyor.' }),
    };
  }

  try {
    const newInstitution = JSON.parse(event.body);

    const dataPath = path.join(__dirname, '../public/data/russian_institutions.json');

    let data = {};
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf8');
      data = JSON.parse(fileContent);
    }

    if (!data[newInstitution.plaka]) {
      data[newInstitution.plaka] = [];
    }

    data[newInstitution.plaka].push({
      name: newInstitution.name,
      description: newInstitution.description,
      type: newInstitution.type,
      address: newInstitution.address,
      website: newInstitution.website,
      image: newInstitution.image || ""
    });

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Kurum başarıyla eklendi.' }),
    };

  } catch (error) {
    console.error('Hata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Sunucu hatası oluştu.' }),
    };
  }
};
