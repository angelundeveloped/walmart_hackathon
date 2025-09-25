# 🚀 Production Upgrade Checklist - Walmart Wavefinder

## 🎯 **Goal**: Deploy production-ready system to Vercel with persistent data

---

## 📊 **1. DATABASE ARCHITECTURE (Vercel-Compatible)**

### **Required Databases (Minimal Set):**

#### **A. Supabase (Primary Database)**
- **Why**: Vercel-native, PostgreSQL, real-time, auth integration
- **Tables Needed**:
  ```sql
  -- Users table (extends Supabase auth.users)
  CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT,
    name TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Store items (static data)
  CREATE TABLE store_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    coordinates JSONB NOT NULL, -- {x: number, y: number}
    price DECIMAL,
    in_stock BOOLEAN DEFAULT true,
    embedding VECTOR(1536), -- OpenAI embeddings
    created_at TIMESTAMP DEFAULT NOW()
  );

  -- Chat history
  CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    messages JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  -- Shopping history
  CREATE TABLE shopping_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    items JSONB NOT NULL, -- [{id, name, coordinates, completed}]
    route_data JSONB, -- pathfinding results
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

#### **B. Pinecone (Vector Database)**
- **Why**: Production vector search, scales automatically
- **Usage**: Store item embeddings for semantic search
- **Alternative**: Supabase pgvector (if we want to keep it simple)

---

## 🔐 **2. AUTHENTICATION SYSTEM**

### **Google OAuth with Supabase Auth**
```typescript
// Implementation steps:
1. Set up Google OAuth in Supabase dashboard
2. Configure OAuth credentials in Google Cloud Console
3. Implement auth flow in Next.js
4. Add user session management
5. Protect API routes with auth middleware
```

### **Auth Components Needed**:
- [ ] Login/Logout buttons
- [ ] User profile management
- [ ] Session persistence
- [ ] Protected routes

---

## 🧠 **3. PRODUCTION VECTOR EMBEDDINGS**

### **OpenAI Embeddings Integration**
```typescript
// Replace current bag-of-words with real embeddings
const getItemEmbedding = async (item: StoreItem) => {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: `${item.name} ${item.category} ${item.description}`
  });
  return response.data[0].embedding; // 1536-dimensional vector
};
```

### **Implementation Steps**:
- [ ] Set up OpenAI API key
- [ ] Create embedding generation service
- [ ] Batch process all store items
- [ ] Store embeddings in Pinecone/Supabase
- [ ] Update search functions to use real embeddings

---

## 🗺️ **4. MAP TOGGLE ELEMENTS**

### **User Preference Controls**
```typescript
interface MapFilters {
  showSections: string[]; // ['dairy', 'produce', 'meat']
  showItems: boolean;
  showRoute: boolean;
  showAnchors: boolean;
  showServices: boolean;
}
```

### **Toggle Components**:
- [ ] Section visibility toggles (Dairy, Produce, Meat, etc.)
- [ ] Item pin visibility toggle
- [ ] Route visibility toggle
- [ ] UWB anchor visibility toggle
- [ ] Services visibility toggle
- [ ] Save preferences to user profile

---

## 🚀 **5. VERCEL DEPLOYMENT SETUP**

### **Environment Variables Needed**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Pinecone (if using)
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### **Vercel Configuration**:
- [ ] Set up Vercel project
- [ ] Configure environment variables
- [ ] Set up database connections
- [ ] Configure domain (if needed)
- [ ] Set up monitoring/logging

---

## 📋 **IMPLEMENTATION PRIORITY ORDER**

### **Phase 1: Core Infrastructure (2-3 hours)**
1. **Set up Supabase project**
   - Create database tables
   - Set up authentication
   - Configure environment variables

2. **Implement Google OAuth**
   - Set up Google Cloud Console
   - Configure Supabase auth
   - Add login/logout UI

### **Phase 2: Data Migration (1-2 hours)**
3. **Migrate store data to Supabase**
   - Upload store items to database
   - Generate OpenAI embeddings
   - Store embeddings in vector database

4. **Update data loading**
   - Replace YAML loading with Supabase queries
   - Update vector search to use real embeddings

### **Phase 3: User Features (1-2 hours)**
5. **Add map toggles**
   - Create toggle UI components
   - Implement filter logic
   - Save preferences to user profile

6. **Add chat/shopping history**
   - Persist chat sessions
   - Save shopping history
   - Add history viewing

### **Phase 4: Deployment (1 hour)**
7. **Deploy to Vercel**
   - Configure production environment
   - Test all functionality
   - Set up monitoring

---

## 🎯 **SUCCESS CRITERIA**

### **Production Ready When**:
- [ ] Users can sign in with Google
- [ ] Store data persists across sessions
- [ ] Vector search works with real embeddings
- [ ] Map toggles save user preferences
- [ ] Chat history is preserved
- [ ] Shopping history is tracked
- [ ] Deployed and accessible on Vercel
- [ ] All features work in production

---

## 💰 **COST ESTIMATION**

### **Monthly Costs (Approximate)**:
- **Supabase**: $25/month (Pro plan)
- **OpenAI**: $10-20/month (depending on usage)
- **Pinecone**: $70/month (Starter plan) OR use Supabase pgvector (free)
- **Vercel**: Free tier (should be sufficient)
- **Total**: ~$100-115/month

### **Alternative (Cost-Effective)**:
- Use Supabase pgvector instead of Pinecone: **~$35/month**

---

## 🚨 **CRITICAL DECISIONS NEEDED**

1. **Vector Database**: Pinecone vs Supabase pgvector?
2. **Authentication**: Google OAuth only or multiple providers?
3. **Database**: Supabase vs PlanetScale vs Neon?
4. **Deployment**: Vercel vs other platforms?

**Recommendation**: Start with Supabase + pgvector + Google OAuth for simplicity and cost-effectiveness.

---

## 📞 **NEXT STEPS**

1. **Choose database provider** (Supabase recommended)
2. **Set up development environment**
3. **Start with Phase 1 implementation**
4. **Test each phase before moving to next**

**Ready to start? Which phase should we tackle first?**
