const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }
  
  try {
      const requestData = JSON.parse(event.body);
      
      const requiredFields = ['plaka', 'name', 'description', 'type', 'address', 'website'];
      for (const field of requiredFields) {
          if (!requestData[field]) {
              return { statusCode: 400, body: JSON.stringify({ error: `${field} alanı gereklidir.` }) };
          }
      }
      
      const institutionData = {
          ...requestData,
          image: ""
      };
      
      const repoOwner = process.env.GITHUB_OWNER;
      const repoName = process.env.GITHUB_REPO;
      const filePath = 'public/data/russian_institutions.json';
      const token = process.env.GITHUB_TOKEN;
      
      const fileResponse = await axios.get(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
          { headers: { Authorization: `token ${token}` } }
      );
      
      const content = Buffer.from(fileResponse.data.content, 'base64').toString();
      const existingData = JSON.parse(content);
      
      if (!existingData[requestData.plaka]) {
          existingData[requestData.plaka] = [];
      }
      existingData[requestData.plaka].push(institutionData);
      
      await axios.put(
          `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
          {
              message: `Yeni kurum eklendi: ${requestData.name}`,
              content: Buffer.from(JSON.stringify(existingData, null, 2)).toString('base64'),
              sha: fileResponse.data.sha
          },
          { headers: { Authorization: `token ${token}` } }
      );
      
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
