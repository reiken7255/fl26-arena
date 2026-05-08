# 🚀 FL26 Arena - Netlify Deployment Guide

Bu rehber, FL26 Arena Manager projesini Netlify üzerinde canlıya (production) nasıl alacağınızı adım adım anlatır.

---

## 🛠 Yöntem 1: Netlify CLI ile Hızlı Dağıtım (Terminal Üzerinden)

Eğer projenizi GitHub'a yüklemeden direkt terminalden yayınlamak istiyorsanız bu yöntemi kullanın.

### 1. Netlify CLI Kurulumu
Eğer bilgisayarınızda yüklü değilse, terminale şu komutu yazın:
```bash
npm install -g netlify-cli
```

### 2. Netlify Hesabınıza Giriş Yapın
```bash
netlify login
```
*Bu komut tarayıcınızı açacaktır, giriş yapıp onay verin.*

### 3. Projeyi Dağıtıma Hazırlayın (Build)
Uygulamanın optimize edilmiş halini oluşturun:
```bash
npm run build
```
*Bu işlem sonucunda projenizde `dist` klasörü oluşacaktır.*

### 4. Yayına Alın (Deploy)
İlk kurulum için şu komutu çalıştırın:
```bash
netlify init
```
*Gelen sorularda "Create & configure a new site" seçeneğini seçin.*

Sürekli güncelleme (Production) için:
```bash
netlify deploy --prod
```
*Sistem size `dist` klasörünü ve `netlify/functions` klasörünü otomatik olarak yükleyecektir.*

---

## 🌐 Yöntem 2: GitHub ile Otomatik Dağıtım (Tavsiye Edilen)

Kodunuzu her güncellediğinizde (push) Netlify'ın otomatik olarak güncellenmesini istiyorsanız bu yöntemi kullanın.

### 1. Kodunuzu GitHub'a Yükleyin
Bir GitHub deposu (repository) oluşturun ve kodlarınızı oraya gönderin.

### 2. Netlify Paneline Giriş Yapın
[app.netlify.com](https://app.netlify.com) adresine gidin.

### 3. Yeni Site Ekleyin
- **"Add new site"** butonuna tıklayın.
- **"Import an existing project"** seçeneğini seçin.
- **GitHub**'ı seçin ve projenizin olduğu repoyu işaretleyin.

### 4. Build Ayarlarını Kontrol Edin
Netlify projeyi otomatik tanıyacaktır ama şu ayarların doğruluğundan emin olun:
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Functions Directory:** `netlify/functions`

### 5. "Deploy Site" Butonuna Tıklayın
Netlify projenizi derleyip size canlı bir link (örn: `fl26-arena.netlify.app`) verecektir.

---

## ⚠️ Önemli Notlar

1. **Veri Saklama (Persistence):** Bu proje şu anda yerel bir JSON dosyasını (`_store.js` aracılığıyla) kullanmaktadır. Netlify Functions "serverless" olduğu için, dosya yazma işlemleri geçicidir (sayfa yenilendiğinde veya fonksiyon uyuduğunda veriler sıfırlanabilir).
   - *Çözüm:* Verilerin kalıcı olması için projenin **Supabase** veya **MongoDB** gibi bir gerçek veri tabanına bağlanması tavsiye edilir.

2. **Domain Ayarları:** Kendi özel domaininizi (örn: `turnuva.com`) Netlify panelindeki **"Domain Management"** kısmından bağlayabilirsiniz.

3. **Log Takibi:** Fonksiyonların çalışmasını veya hataları görmek için Netlify panelindeki **"Functions"** sekmesini kullanabilirsiniz.

---

**Tebrikler!** Artık ligini tüm dünya ile paylaşabilirsin. ⚽🏆
