# AI Triage Sistemi - Adım Adım Tıbbi Değerlendirme Platformu

Adım adım soru-cevap protokolü, RAG destekli bilgi erişimi ve modern React frontend özelliklerine sahip kapsamlı AI destekli tıbbi triyaj sistemi. Bu sistem, etkileşimli sorgulama ve kanıta dayalı karar verme yoluyla ESI uyumlu acil servis önceliklendirmesi sağlar.

## 🏥 Sistem Genel Bakış

AI Triage Sistemi, aşağıdakileri birleştiren sofistike bir tıbbi değerlendirme platformudur:

- **Adım Adım Soru-Cevap Protokolü**: Hasta yanıtlarına göre uyarlanan etkileşimli sorgulama sistemi
- **RAG Destekli Bilgi**: 45+ tıbbi bilgi kartı ile Gelişmiş Bilgi Erişimi
- **OpenAI Entegrasyonu**: Tıbbi akıl yürütme ve triyaj kararları için gelişmiş dil modelleri
- **Modern React Frontend**: TypeScript tabanlı duyarlı web arayüzü
- **Veritabanı Kalıcılığı**: Vaka takibi ve analitik için SQLite/PostgreSQL desteği
- **ESI Uyumluluğu**: Acil Servis Öncelik Endeksi standardı uygulaması

## 🚀 Hızlı Başlangıç

### Gereksinimler

- **Python 3.8+** (önerilen: Python 3.11+)
- **Node.js 16+** (React frontend için)
- **OpenAI API Anahtarı** (GPT modelleri için)
- **8GB+ RAM** (embedding modelleri için)

### Kurulum

1. **Depoyu klonlayın:**
```bash
git clone <repository-url>
cd ai-triage
```

2. **Sanal ortam oluşturun ve etkinleştirin:**
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# veya
.venv\Scripts\activate     # Windows
```

3. **Python bağımlılıklarını yükleyin:**
```bash
pip install -r requirements.txt
```

4. **Frontend bağımlılıklarını yükleyin:**
```bash
cd triage-frontend
npm install
cd ..
```

5. **Ortam değişkenlerini ayarlayın:**
```bash
# .env dosyası oluşturun
cat > .env << EOF
OPENAI_API_KEY=your-openai-api-key-here
RAG_URL=http://localhost:8000/rag/topk
API_HOST=0.0.0.0
API_PORT=9000
DATABASE_URL=sqlite:///./triage.db
ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
EOF
```

### Sistemi Çalıştırma

**Üç ayrı terminalde servisleri başlatın:**

**Terminal 1 - RAG Memory Servisi (Port 8000):**
```bash
uvicorn rag_memory:app --reload --port 8000
```

**Terminal 2 - Triage API (Port 9000):**
```bash
uvicorn triage_api:app --reload --port 9000
```

**Terminal 3 - React Frontend (Port 3000):**
```bash
cd triage-frontend
npm install
npm start
```

Uygulamaya şu adresten erişin: **http://localhost:3000**

## 📊 API Dokümantasyonu

### Adım Adım Triyaj Protokolü

Sistem, AI'nin bir seferde bir soru sorduğu ve devam etmeden önce yanıtları beklediği katı bir adım adım protokol uygular.

#### Triyaj Değerlendirmesini Başlat

**POST** `/triage/start`

```json
{
  "age": 35,
  "sex": "male",
  "complaint_text": "Göğüs ağrısı ve nefes darlığı",
  "vitals": {
    "bp": "140/90",
    "hr": "110",
    "temp": "37.2"
  },
  "pregnancy": "any",
  "chief": "chest_pain",
  "k": 3
}
```

**Yanıt:**
```json
{
  "case_id": "8a0ae0f5",
  "finished": false,
  "next_question": "Göğüs ağrınızın şiddeti nedir ve 1-10 arasında nasıl değerlendirirsiniz?",
  "triage": null
}
```

#### Takip Sorularını Yanıtla

**PATCH** `/triage/{case_id}/answer`

```json
{
  "answers": {
    "Göğüs ağrınızın şiddeti nedir ve 1-10 arasında nasıl değerlendirirsiniz?": "8/10 çok şiddetli"
  },
  "done": false
}
```

**Yanıt:**
```json
{
  "case_id": "8a0ae0f5",
  "finished": false,
  "next_question": "Nefes alma sırasında göğüs ağrınızda artış veya azalma oluyor mu?",
  "triage": null
}
```

#### Değerlendirmeyi Tamamla

**PATCH** `/triage/{case_id}/answer`

```json
{
  "answers": {
    "Nefes alma sırasında göğüs ağrınızda artış veya azalma oluyor mu?": "Evet, nefes alırken daha da artıyor"
  },
  "done": true
}
```

**Final Yanıt:**
```json
{
  "case_id": "8a0ae0f5",
  "finished": true,
  "next_question": null,
  "triage": {
    "triage_level": "ESI-2",
    "red_flags": [
      "Şiddetli göğüs ağrısı",
      "Nefes darlığı",
      "Kola yayılım"
    ],
    "immediate_actions": [
      "12 derivasyon EKG ≤10 dk",
      "O2 satürasyon ölçümü",
      "Vital takibi"
    ],
    "questions_to_ask_next": [],
    "routing": {
      "specialty": "kardiyoloji",
      "priority": "high"
    },
    "rationale_brief": "Göğüs ağrısı ve nefes darlığı ciddi kardiyovasküler acil durumu gösterebilir; red flag'ler ve vital bulgular yüksek öncelik gerektirir.",
    "evidence_ids": ["chest_pain_adult_v1"]
  }
}
```

### Ek Endpoint'ler

#### Tüm Triyaj Kayıtlarını Getir

**GET** `/triage/alltriages`

#### Vaka ID'sine Göre Triyaj Getir

**GET** `/triage/alltriages/byCase/{case_id}`

#### Tarihe Göre Triyaj Getir

**GET** `/triage/alltriages/byDate/{YYYY-MM-DD}`

## 🏗️ Sistem Mimarisi

### Ana Bileşenler

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Triage API    │    │  RAG Memory     │
│   (Port 3000)   │◄──►│   (Port 9000)   │◄──►│   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │   SQLite/PostgreSQL            │
         │              │   Veritabanı    │              │
         │              └─────────────────┘              │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│   OpenAI API    │                            │  Tıbbi Corpus   │
│   (GPT Modelleri)│                            │  (45+ Kart)     │
└─────────────────┘                            └─────────────────┘
```

### Veri Akışı

1. **Hasta Girişi**: Kullanıcı hasta demografik bilgilerini ve ana şikayeti girer
2. **RAG Erişimi**: Sistem tıbbi bilgi corpusunu ilgili bilgiler için arar
3. **Adım Adım Soru-Cevap**: AI, erişilen bilgilere dayalı hedefli takip soruları sorar
4. **Kanıt Entegrasyonu**: Her yanıt tıbbi kanıtlarla birleştirilir
5. **Final Değerlendirme**: AI, gerekçeli ESI uyumlu triyaj kararı üretir
6. **Veritabanı Depolama**: Tam vaka geçmişi analitik için saklanır

## 📁 Proje Yapısı

```
ai-triage/
├── 📁 corpus/
│   ├── 📁 triage/              # Ana tıbbi bilgi kartları (30 dosya)
│   │   ├── chest_pain_adult_v1.json
│   │   ├── abdominal_pain_adult_v1.json
│   │   ├── headache_adult_v1.json
│   │   └── ...
│   └── 📁 sides/               # Vücut bölgesi ağrı kartları (30 dosya)
│       ├── arm_pain_adult_v1.json
│       ├── back_pain_adult_v1.json
│       └── ...
├── 📁 samples/                 # Hastalık örnekleri (15 dosya)
│   ├── myocardial_infarction_adult_v1.json
│   ├── stroke_adult_v1.json
│   └── ...
├── 📁 triage-frontend/         # React TypeScript frontend
│   ├── 📁 src/
│   │   ├── 📁 components/      # React bileşenleri
│   │   │   ├── PatientEntry.tsx
│   │   │   ├── InputSection.tsx
│   │   │   ├── DoctorPage.tsx
│   │   │   └── ...
│   │   ├── 📁 services/        # API servisleri
│   │   │   └── triageApi.ts
│   │   ├── 📁 types/           # TypeScript tanımları
│   │   │   └── TriageTypes.ts
│   │   ├── 📁 contexts/        # React context'leri
│   │   │   └── TriageContext.tsx
│   │   └── App.tsx
│   ├── 📁 public/
│   └── package.json
├── 📁 output/                  # Üretilen triyaj sonuçları
│   └── 📁 triage/
│       └── 📁 2025-01-15/
├── 🔧 Backend Servisleri
│   ├── triage_api.py           # Ana FastAPI uygulaması
│   ├── rag_memory.py           # RAG bilgi erişim servisi
│   ├── llm_client_openai.py    # Adım adım protokol ile OpenAI entegrasyonu
│   ├── database.py             # Veritabanı konfigürasyonu
│   ├── models.py               # SQLAlchemy modelleri
│   ├── schemas.py              # Pydantic şemaları
│   └── config.py               # Uygulama konfigürasyonu
├── 🗄️ Veritabanı
│   ├── triage.db               # SQLite veritabanı (varsayılan)
│   └── reset_db.py             # Veritabanı sıfırlama aracı
├── 📋 Konfigürasyon
│   ├── requirements.txt        # Python bağımlılıkları
│   ├── .env                    # Ortam değişkenleri
│   └── ai-triage.service       # Systemd servis dosyası
└── 📖 Dokümantasyon
    ├── README.md
    └── plan.png
```

## 🔧 Konfigürasyon

### Ortam Değişkenleri

| Değişken | Açıklama | Varsayılan | Gerekli |
|----------|----------|------------|---------|
| `OPENAI_API_KEY` | GPT modelleri için OpenAI API anahtarı | - | ✅ |
| `RAG_URL` | RAG servis endpoint'i | `http://localhost:8000/rag/topk` | ❌ |
| `API_HOST` | API sunucu host'u | `0.0.0.0` | ❌ |
| `API_PORT` | API sunucu port'u | `9000` | ❌ |
| `DATABASE_URL` | Veritabanı bağlantı string'i | `sqlite:///./triage.db` | ❌ |
| `ENV` | Ortam modu | `development` | ❌ |
| `ALLOWED_ORIGINS` | CORS izin verilen origin'ler | `http://localhost:3000,http://localhost:5173` | ❌ |
| `GPT_MODEL` | Kullanılacak OpenAI modeli | `gpt-4.1-mini` | ❌ |

### Veritabanı Konfigürasyonu

**SQLite (Varsayılan):**
```bash
DATABASE_URL=sqlite:///./triage.db
```

**PostgreSQL:**
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/triage_db
```

## 🧪 Test Etme

### Manuel API Testi

**Yeni triyaj vakası başlat:**
```bash
curl -X POST "http://localhost:9000/triage/start" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 35,
    "sex": "male",
    "complaint_text": "Göğüs ağrısı ve nefes darlığı",
    "vitals": {"bp": "140/90", "hr": "110"},
    "pregnancy": "any",
    "chief": "chest_pain",
    "k": 3
  }'
```

**Takip sorusunu yanıtla:**
```bash
curl -X PATCH "http://localhost:9000/triage/8a0ae0f5/answer" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "Göğüs ağrınızın şiddeti nedir?": "8/10 çok şiddetli"
    }
  }'
```

**Değerlendirmeyi tamamla:**
```bash
curl -X PATCH "http://localhost:9000/triage/8a0ae0f5/answer" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {
      "Nefes alma sırasında ağrı artıyor mu?": "Evet"
    },
    "done": true
  }'
```

### Frontend Testi

1. **http://localhost:3000** adresine gidin
2. **"Hasta Girişi"** butonuna tıklayın
3. Hasta bilgilerini doldurun
4. **"Değerlendirmeyi Başlat"** butonuna tıklayın
5. Adım adım soruları yanıtlayın
6. Final triyaj sonuçlarını görüntüleyin

## 📈 Ana Özellikler

### 🎯 Adım Adım Soru-Cevap Protokolü
- **Uyarlanabilir Sorgulama**: AI, yanıtlara dayalı ilgili takip soruları sorar
- **Tekrar Önleme**: Backend aynı soruyu iki kez sormayı önler
- **Erken Tamamlama**: Kullanıcılar değerlendirmeyi istediği zaman tamamlayabilir
- **Bağlam Korunması**: Tüm önceki soru-cevaplar oturum boyunca korunur

### 🧠 RAG Destekli Bilgi
- **45+ Tıbbi Kart**: Kapsamlı tıbbi bilgi tabanı
- **Çok Dilli Destek**: Türkçe optimize edilmiş embedding'ler
- **Kanıt Entegrasyonu**: Her karar erişilen tıbbi kanıtlarla desteklenir
- **Dinamik Erişim**: Değerlendirme sırasında gerçek zamanlı bilgi arama

### 🤖 Gelişmiş AI Entegrasyonu
- **OpenAI GPT Modelleri**: Tıbbi akıl yürütme için en son dil modelleri
- **Yapılandırılmış Çıktı**: Doğrulanmış JSON yanıtları garanti edilir
- **Hata Yönetimi**: Sağlam yeniden deneme mekanizmaları ve yedek yanıtlar
- **Sıcaklık Kontrolü**: Tutarlı tıbbi değerlendirmeler için optimize edilmiş

### 🎨 Modern Frontend
- **React 18 + TypeScript**: Tip güvenli, modern web geliştirme
- **Duyarlı Tasarım**: Mobil öncelikli, tüm cihazlarda çalışır
- **Gerçek Zamanlı Güncellemeler**: Canlı triyaj sonuçları ve soru akışı
- **Karanlık/Açık Tema**: Kullanıcı tercihi desteği
- **Progressive Web App**: Mobil cihazlarda yüklenebilir

### 📊 Veritabanı ve Analitik
- **Vaka Takibi**: Tam hasta yolculuğu kaydı
- **Sorgu Arayüzü**: Tarih, vaka ID'si veya diğer kriterlere göre filtreleme
- **Veri Dışa Aktarma**: Harici analiz için JSON formatı
- **Performans Metrikleri**: Yanıt süresi ve doğruluk takibi

### 🔒 Güvenlik ve Uyumluluk
- **CORS Koruması**: Yapılandırılabilir çapraz kaynak politikaları
- **Giriş Doğrulama**: Pydantic şema doğrulaması
- **Hata Sanitizasyonu**: Hassas veri olmadan güvenli hata mesajları
- **Ortam İzolasyonu**: Ayrı dev/prod konfigürasyonları

## 🏥 Tıbbi Standartlar

### ESI (Acil Servis Öncelik Endeksi) Uyumluluğu

| Seviye | Açıklama | Sağlayıcıya Süre | Örnekler |
|--------|----------|------------------|----------|
| **ESI-1** | Resüsitasyon | Anında | Kalp durması, major travma |
| **ESI-2** | Acil | < 10 dakika | Şiddetli göğüs ağrısı, inme belirtileri |
| **ESI-3** | Acil | < 30 dakika | Orta ağrı, ateş |
| **ESI-4** | Daha az acil | 1-2 saat | Küçük yaralanmalar, rutin şikayetler |
| **ESI-5** | Acil değil | 2-24 saat | Rutin takipler, küçük semptomlar |

### Tıbbi Bilgi Kapsamı

**Ana Şikayet Kategorileri:**
- Kardiyovasküler (göğüs ağrısı, çarpıntı, bayılma)
- Solunum (nefes darlığı, öksürük, göğüs sıkışması)
- Nörolojik (baş ağrısı, baş dönmesi, güçsüzlük)
- Gastrointestinal (karın ağrısı, bulantı, kusma)
- Kas-iskelet (sırt ağrısı, eklem ağrısı, travma)
- Genitoüriner (pelvik ağrı, idrar semptomları)
- Dermatolojik (döküntüler, yaralar, enfeksiyonlar)

**Özelleşmiş Senaryolar:**
- Pediatrik değerlendirmeler
- Geriatrik değerlendirmeler
- Gebelikle ilgili durumlar
- Ruh sağlığı acilleri
- Madde kullanımı sunumları

## 🛠️ Geliştirme

### Yeni Tıbbi Bilgi Ekleme

1. **Bilgi kartı oluşturun:**
```json
{
  "id": "yeni_durum_v1",
  "title": "Durum Adı",
  "content": "Detaylı tıbbi bilgi...",
  "esi_hint": "ESI-2",
  "red_flags": ["Kritik semptom 1", "Kritik semptom 2"],
  "immediate_actions": ["Eylem 1", "Eylem 2"],
  "questions": ["Soru 1", "Soru 2"],
  "routing": {
    "specialty": "uygun_uzmanlık",
    "priority": "high"
  }
}
```

2. **Uygun dizine yerleştirin:**
   - `corpus/triage/` ana durumlar için
   - `corpus/sides/` vücut bölgesi ağrıları için
   - `samples/` hastalık örnekleri için

3. **RAG servisini yeniden başlatın:**
```bash
uvicorn rag_memory:app --reload --port 8000
```

### AI Davranışını Özelleştirme

**`llm_client_openai.py` içinde sistem promptlarını değiştirin:**
```python
SYSTEM_PROMPT = """Özel tıbbi değerlendirme talimatlarınız..."""
```

**`triage_api.py` içinde soru akışını ayarlayın:**
```python
MAX_QA = 5  # Vaka başına maksimum soru sayısı
```

### Veritabanı Şema Güncellemeleri

**`models.py` içine yeni alanlar ekleyin:**
```python
class Triage(Base):
    # ... mevcut alanlar ...
    new_field = Column(String, nullable=True)
```

**Migrasyonu çalıştırın:**
```bash
python reset_db.py  # Yeni şema ile veritabanını yeniden oluşturur
```

## 📊 Performans ve İzleme

### Sistem Gereksinimleri

**Minimum:**
- CPU: 2 çekirdek
- RAM: 4GB
- Depolama: 2GB
- Ağ: OpenAI API için kararlı internet

**Önerilen:**
- CPU: 4+ çekirdek
- RAM: 8GB+
- Depolama: 10GB+ SSD
- Ağ: Yüksek hızlı internet

### İzleme Endpoint'leri

```

**Sistem Durumu:**
```bash
curl http://localhost:9000/status
```



## Tıbbi Sorumluluk Reddi

**ÖNEMLİ**: Bu sistem yalnızca eğitim ve araştırma amaçlıdır. Tıbbi tanı, tedavi veya tavsiye sağlamaz. Tıbbi kararlar için her zaman nitelikli sağlık profesyonellerine danışın. Sistem klinik ortamlarda profesyonel tıbbi yargının yerine kullanılmamalıdır.


