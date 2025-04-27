document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('institutionForm');
  const messageDiv = document.getElementById('message');
  const institutionsList = document.getElementById('institutionsList');
  
  // Mevcut kurumları yükle
  loadInstitutions();
  
  // Form gönderimi
  form.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = {
          plaka: document.getElementById('plaka').value.trim(),
          name: document.getElementById('name').value.trim(),
          description: document.getElementById('description').value.trim(),
          type: document.getElementById('type').value,
          address: document.getElementById('address').value.trim(),
          website: document.getElementById('website').value.trim()
      };
      
      try {
          const response = await fetch('/.netlify/functions/save-institution', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(formData)
          });
          
          const result = await response.json();
          
          if (response.ok) {
              showMessage('Kurum başarıyla kaydedildi!', 'success');
              form.reset();
              loadInstitutions(); // Listeyi güncelle
          } else {
              showMessage(`Hata: ${result.error}`, 'error');
          }
      } catch (error) {
          showMessage(`Bir hata oluştu: ${error.message}`, 'error');
      }
  });
  
  // Mesaj gösterme fonksiyonu
  function showMessage(text, type) {
      messageDiv.textContent = text;
      messageDiv.className = `message ${type}`;
      
      // 5 saniye sonra mesajı gizle
      setTimeout(() => {
          messageDiv.style.display = 'none';
      }, 5000);
  }
  
  // Kurumları JSON dosyasından yükle
  async function loadInstitutions() {
      try {
          const response = await fetch('/data/russian_institutions.json');
          const data = await response.json();
          
          displayInstitutions(data);
      } catch (error) {
          console.error('Kurumlar yüklenirken hata oluştu:', error);
          institutionsList.innerHTML = '<p>Kurumlar yüklenirken bir hata oluştu.</p>';
      }
  }
  
  // Kurumları ekranda göster
  function displayInstitutions(data) {
      institutionsList.innerHTML = '';
      
      // Her plaka kodu için kurumları listele
      Object.keys(data).forEach(plaka => {
          const institutions = data[plaka];
          
          // Başlık ekle
          const plakaTitle = document.createElement('h3');
          plakaTitle.textContent = `${plaka} Bölgesi`;
          institutionsList.appendChild(plakaTitle);
          
          // Kurumları listele
          institutions.forEach(institution => {
              const card = document.createElement('div');
              card.className = 'institution-card';
              
              const typeTag = document.createElement('span');
              typeTag.className = 'tag';
              typeTag.textContent = institution.type;
              
              const name = document.createElement('h3');
              name.textContent = institution.name;
              
              const description = document.createElement('p');
              description.textContent = institution.description;
              
              const address = document.createElement('p');
              address.innerHTML = `<strong>Adres:</strong> ${institution.address}`;
              
              const website = document.createElement('p');
              website.innerHTML = `<strong>Website:</strong> <a href="https://${institution.website}" target="_blank">${institution.website}</a>`;
              
              card.appendChild(typeTag);
              card.appendChild(name);
              card.appendChild(description);
              card.appendChild(address);
              card.appendChild(website);
              
              institutionsList.appendChild(card);
          });
      });
  }
});