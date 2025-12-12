const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    
    if (token) {
        ekranDegistir('dashboard');
        akisGetir();
        kullaniciBilgisiGoster();
    } else {
        ekranDegistir('login');
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/giris`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ e_posta: email, parola: password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user_name', data.kullanici.ad);
            
            ekranDegistir('dashboard');
            akisGetir();
            kullaniciBilgisiGoster();
        } else {
            document.getElementById('error-message').innerText = data.hata;
        }
    } catch (error) {
        console.error('Hata:', error);
    }
});

async function akisGetir() {
    const container = document.getElementById('feed-container');
    
    const response = await fetch(`${API_URL}/posts/akis`);
    const posts = await response.json();

    container.innerHTML = '';

    posts.forEach(post => {
        const tarih = new Date(post.olusturma_tarihi).toLocaleString('tr-TR');
        
        const html = `
            <div class="post-card">
                <div class="post-header">
                    👤 ${post.User.kullanici_adi}
                    <span class="post-time">${tarih}</span>
                </div>
                <div class="post-content">${post.gonderi_metni}</div>
            </div>
        `;
        container.innerHTML += html;
    });
}

async function gonderiPaylas() {
    const metin = document.getElementById('post-text').value;
    const token = localStorage.getItem('token');

    if (!metin) return alert("Boş gönderi paylaşamazsın!");

    const response = await fetch(`${API_URL}/posts/paylas`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ metin: metin })
    });

    if (response.ok) {
        document.getElementById('post-text').value = '';
        akisGetir();
    } else {
        alert("Gönderi paylaşılamadı!");
    }
}

function ekranDegistir(ekran) {
    if (ekran === 'login') {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('nav-menu').style.display = 'none';
    } else {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        document.getElementById('nav-menu').style.display = 'block';
    }
}

function kullaniciBilgisiGoster() {
    const ad = localStorage.getItem('user_name');
    document.getElementById('kullanici-adi').innerText = ad;
}

function cikisYap() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_name');
    location.reload();
}