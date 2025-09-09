# E-Triage System

Acil servis elektronik triyaj sistemi - RAG (Retrieval Augmented Generation) tabanlı tıbbi önceliklendirme API'si.

## 🏥 Proje Açıklaması

Bu sistem, acil servis hastalarının şikayetlerini analiz ederek ESI (Emergency Severity Index) ölçeğine göre önceliklendirme yapar. Sistem iki ana bileşenden oluşur:

- **RAG Memory Service**: Tıbbi bilgi kartlarını embedding ile arar
- **Triage API**: Hasta bilgilerini alır, RAG'den bilgi çeker ve LLM ile triyaj yapar

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Python 3.8+
- Google API Key (Gemini için)

### Kurulum

1. **Depoyu klonlayın:**
```bash
git clone <repo-url>
cd e-triage
```

2. **Virtual environment oluşturun:**
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# veya
.venv\Scripts\activate     # Windows
```

3. **Bağımlılıkları yükleyin:**
```bash
pip install fastapi uvicorn sentence-transformers google-generativeai numpy requests pydantic
```

4. **Environment değişkenlerini ayarlayın:**
```bash
export GOOGLE_API_KEY="your-gemini-api-key"
export RAG_URL="http://localhost:8000/rag/topk"
export OUTPUT_DIR="output"
```

### Çalıştırma

**İki terminal açın ve sırasıyla çalıştırın:**

**Terminal 1 - RAG Memory Service:**
```bash
uvicorn rag_memory:app --reload --port 8000
```

**Terminal 2 - Triage API:**
```bash
uvicorn triage_api:app --reload --port 9000
```

## 📊 API Kullanımı

### Triage Endpoint

**POST** `http://localhost:9000/triage`

```json
{
  "patient_id": "P001",
  "age": 45,
  "sex": "erkek",
  "complaint_text": "Göğsümde sıkışma hissi var, nefes almakta zorlanıyorum",
  "vitals": {
    "blood_pressure": "140/90",
    "heart_rate": 95,
    "temperature": 36.8
  },
  "pregnancy": "any",
  "chief": "göğüs ağrısı",
  "k": 3
}
```

**Yanıt:**
```json
{
  "triage": {
    "triage_level": "ESI-2",
    "red_flags": ["Göğüs sıkışması", "Nefes darlığı"],
    "immediate_actions": ["EKG çekimi", "Oksijen saturasyonu"],
    "questions_to_ask_next": ["Ağrı ne kadar süredir?", "Kola yayılıyor mu?"],
    "routing": {
      "specialty": "kardiyoloji",
      "priority": "high"
    },
    "rationale_brief": "Kardiyak risk faktörleri mevcut...",
    "evidence_ids": ["chest_pain_adult_v1"]
  },
  "file_path": "output/triage/2025-01-15/chest_pain_45_erkek_14-30-25.json"
}
```

### RAG Search Endpoint

**POST** `http://localhost:8000/rag/topk`

```json
{
  "text": "göğüs ağrısı nefes darlığı",
  "chief": "göğüs ağrısı",
  "age_group": "adult",
  "pregnancy": "any",
  "k": 4
}
```

## 📁 Proje Yapısı

```
e-triage/
├── corpus/triage/          # Ana tıbbi bilgi kartları (15 adet)
├── samples/               # Hastalık örnekleri (15 adet)
├── sides/                 # Vücut bölgesi ağrıları (15 adet)
├── output/                # Triyaj sonuçları
├── rag_memory.py          # RAG servisi
├── triage_api.py          # Ana triyaj API'si
├── llm_client_gemini.py   # Gemini LLM entegrasyonu
├── schemas.py             # Pydantic modelleri
├── utils_output.py        # Dosya kaydetme utilities
└── README.md
```

## 🔧 Konfigürasyon

### Environment Değişkenleri

- `GOOGLE_API_KEY`: Gemini API anahtarı (zorunlu)
- `RAG_URL`: RAG servis URL'i (varsayılan: http://localhost:8000/rag/topk)
- `OUTPUT_DIR`: Çıktı dosyaları dizini (varsayılan: output)
- `GEMINI_MODEL`: Kullanılacak Gemini model (varsayılan: gemini-1.5-flash)

### ESI Seviyeleri

- **ESI-1**: Yaşamsal tehlike (resüsitasyon)
- **ESI-2**: Yüksek risk (10 dakika içinde)
- **ESI-3**: Orta risk (30 dakika içinde)
- **ESI-4**: Düşük risk (1-2 saat)
- **ESI-5**: En düşük risk (24 saat)

## 🧪 Test

**Basit test:**
```bash
curl -X POST "http://localhost:9000/triage" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 30,
    "sex": "F",
    "complaint_text": "gözlerim kaşınıyo çok fazla ve burnum akıyor"
  }'
```

## 📈 Özellikler

- ✅ **Multilingual RAG**: Türkçe optimized embedding (multilingual-e5-large)
- ✅ **Structured Output**: Gemini ile doğrulanmış JSON çıktı
- ✅ **ESI Compliance**: Standart acil servis önceliklendirme
- ✅ **Atomic File Operations**: Güvenli dosya kaydetme
- ✅ **Comprehensive Coverage**: 45 farklı tıbbi senaryo
- ✅ **Filtering & Ranking**: Yaş, cinsiyet, gebelik filtresi

## 🔍 Veri Kaynakları

### Corpus (Ana Bilgi Kartları)
- Karın ağrısı, göğüs ağrısı, baş ağrısı, nefes darlığı
- Boğaz ağrısı, sırt ağrısı, eklem ağrısı, göz ağrısı
- Kulak ağrısı, boyun ağrısı, pelvik ağrı, bacak ağrısı
- Kol ağrısı, diş ağrısı, anal ağrı

### Samples (Hastalık Örnekleri)
- Miyokard infarktüsü, astım atağı, inme, apandisit
- Pnömoni, böbrek taşı, gastroenterit, migren
- Üriner enfeksiyon, vertigo, hipertansif kriz
- Diyabetik ketoasidoz, pulmoner emboli, safra taşı, anafilaksi

## 🛠️ Geliştirme

**Yeni tıbbi kart eklemek:**
1. `corpus/triage/` altına JSON dosyası ekleyin
2. RAG servisini yeniden başlatın

**Model değiştirmek:**
```python
# rag_memory.py içinde
model = SentenceTransformer("your-model-name")
```

## 📝 Lisans

Bu proje tıbbi amaçlı kullanım içindir. Gerçek klinik ortamda kullanmadan önce kapsamlı test edilmelidir.

---

**⚠️ Önemli Uyarı:** Bu sistem tanı koymaz, sadece önceliklendirme yapar. Kesin tanı ve tedavi için mutlaka hekim konsültasyonu gereklidir.# ai-triage
