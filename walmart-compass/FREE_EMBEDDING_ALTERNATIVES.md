# 🆓 Free Embedding Alternatives Guide

Since you've hit the Gemini API quota limit, here are several free alternatives to generate embeddings for your RAG system.

## 🚀 **Recommended: Hugging Face (Implemented)**

### **What I've Created:**
- ✅ **New Script**: `scripts/populate-store-items-huggingface.js`
- ✅ **Database Migration**: `database-migration-huggingface.sql`
- ✅ **New Command**: `pnpm run populate:items:hf`

### **How to Use:**
```bash
# 1. Run the database migration (in Supabase SQL Editor)
# Copy and paste the contents of database-migration-huggingface.sql

# 2. Populate with Hugging Face embeddings
pnpm run populate:items:hf
```

### **Benefits:**
- ✅ **Completely Free** - No API key required
- ✅ **384 Dimensions** - Good quality embeddings
- ✅ **Fast** - Local processing
- ✅ **Reliable** - No quota limits

---

## 🔄 **Other Free Alternatives**

### **1. OpenAI (Free Tier)**
```bash
# If you have OpenAI credits
curl -X POST "https://api.openai.com/v1/embeddings" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": "text to embed",
    "model": "text-embedding-3-small"
  }'
```

### **2. Cohere (Free Tier)**
```bash
# 1000 free requests per month
curl -X POST "https://api.cohere.ai/v1/embed" \
  -H "Authorization: Bearer $COHERE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["text to embed"],
    "model": "embed-english-v3.0"
  }'
```

### **3. Local Sentence Transformers**
```bash
# Install Python dependencies
pip install sentence-transformers

# Use in Python script
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(['text to embed'])
```

### **4. Ollama (Local)**
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull embedding model
ollama pull nomic-embed-text

# Generate embeddings
ollama run nomic-embed-text "text to embed"
```

---

## 📊 **Comparison Table**

| Solution | Cost | Dimensions | Quality | Setup |
|----------|------|------------|---------|-------|
| **Hugging Face** | Free | 384 | Good | Easy |
| OpenAI | Free tier | 1536 | Excellent | Easy |
| Cohere | Free tier | 1024 | Good | Easy |
| Local ST | Free | 384 | Good | Medium |
| Ollama | Free | 768 | Good | Hard |

---

## 🎯 **Quick Start with Hugging Face**

### **Step 1: Update Database**
```sql
-- Run this in Supabase SQL Editor
ALTER TABLE store_items DROP COLUMN IF EXISTS embedding;
ALTER TABLE store_items ADD COLUMN embedding VECTOR(384);
CREATE INDEX IF NOT EXISTS idx_store_items_embedding ON store_items 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### **Step 2: Populate Database**
```bash
pnpm run populate:items:hf
```

### **Step 3: Test RAG System**
```bash
pnpm run test:items
```

---

## 🔧 **Optional: Higher Rate Limits**

If you want higher rate limits with Hugging Face:

1. **Get Free API Key**: https://huggingface.co/settings/tokens
2. **Add to .env.local**:
   ```bash
   HUGGINGFACE_API_KEY=your_token_here
   ```
3. **Run the script** - it will automatically use the API key if available

---

## 🚨 **Important Notes**

- **Hugging Face Model**: `sentence-transformers/all-MiniLM-L6-v2`
- **Dimensions**: 384 (vs 1536 for Gemini)
- **Quality**: Good for most use cases
- **Rate Limits**: 1000 requests/hour (free), unlimited with API key

---

## 🧪 **Testing Your Setup**

After populating with Hugging Face embeddings:

```bash
# Test the populated items
pnpm run test:items

# Test RAG functionality
pnpm run test:memory

# Start your app and test chat
pnpm run dev
```

The RAG system should work seamlessly with the new embeddings!
