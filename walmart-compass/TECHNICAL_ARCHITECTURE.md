# 🏗️ Walmart Compass - Technical Architecture

## 📋 **System Overview**

Walmart Compass is built on a modern, scalable architecture designed to handle real-time navigation, AI-powered search, and precise indoor positioning across multiple Walmart stores in México.

---

## 🏛️ **Architecture Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Progressive Web App (PWA)                                     │
│  ├── Next.js 15 (React + TypeScript)                          │
│  ├── Tailwind CSS (Responsive Design)                         │
│  ├── Service Worker (Offline Support)                         │
│  └── PWA Manifest (Native-like Experience)                    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Next.js Middleware                                            │
│  ├── Authentication (Supabase Auth)                           │
│  ├── Request Routing                                          │
│  └── Error Handling                                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  Next.js API Routes                                            │
│  ├── /api/chat (AI Chat Interface)                            │
│  ├── /api/chat-simple-rag (RAG Search)                        │
│  ├── /api/embeddings (Vector Search)                          │
│  └── /auth/callback (OAuth Handler)                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND SERVICES                            │
├─────────────────────────────────────────────────────────────────┤
│  Supabase (Database + Auth)                                    │
│  ├── PostgreSQL Database                                       │
│  ├── Real-time Subscriptions                                  │
│  ├── Row Level Security (RLS)                                 │
│  └── Edge Functions                                            │
│                                                                │
│  Vector Database (AI Search)                                   │
│  ├── Product Embeddings                                        │
│  ├── Semantic Search                                           │
│  └── Similarity Matching                                       │
│                                                                │
│  AI/ML Services                                                │
│  ├── Google Gemini (LLM)                                       │
│  ├── Embeddings Generation                                     │
│  └── Natural Language Processing                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   POSITIONING LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  UWB (Ultra-Wideband)                                          │
│  ├── Anchor Nodes                                              │
│  ├── Tag Positioning                                           │
│  └── Centimeter Accuracy                                       │
│                                                                │
│  BLE Beacons (Fallback)                                        │
│  ├── iBeacon Protocol                                          │
│  ├── Proximity Detection                                       │
│  └── RSSI-based Positioning                                    │
│                                                                │
│  WiFi Fingerprinting                                           │
│  ├── Signal Strength Mapping                                   │
│  ├── MAC Address Tracking                                      │
│  └── Machine Learning Models                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ **Database Schema**

### **Core Tables:**

```sql
-- User Profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  name TEXT,
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Store Information
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  layout_data JSONB,
  coordinates POINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Product Catalog
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  aisle_location TEXT,
  store_id UUID REFERENCES stores(id),
  coordinates POINT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Navigation Sessions
CREATE TABLE navigation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  store_id UUID REFERENCES stores(id),
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  path_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔧 **Technology Stack**

### **Frontend Technologies:**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Context** - State management
- **PWA** - Progressive Web App capabilities

### **Backend Technologies:**
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Primary database
- **Edge Functions** - Serverless compute
- **Real-time** - WebSocket connections

### **AI/ML Technologies:**
- **Google Gemini** - Large Language Model
- **Vector Embeddings** - Semantic search
- **RAG (Retrieval Augmented Generation)** - Context-aware responses
- **Natural Language Processing** - Query understanding

### **Positioning Technologies:**
- **UWB (Ultra-Wideband)** - Primary positioning
- **BLE Beacons** - Proximity detection
- **WiFi Fingerprinting** - Signal-based positioning
- **Computer Vision** - Visual landmark recognition

---

## 🚀 **Deployment Architecture**

### **Production Environment:**
- **Vercel** - Frontend hosting and edge functions
- **Supabase** - Database and authentication
- **Google Cloud** - AI/ML services
- **CDN** - Global content delivery

### **Development Environment:**
- **Local Development** - Next.js dev server
- **Supabase Local** - Local database instance
- **Environment Variables** - Configuration management
- **GitHub** - Version control and CI/CD

---

## 📊 **Performance Optimizations**

### **Frontend Optimizations:**
- **Code Splitting** - Lazy loading of components
- **Image Optimization** - Next.js Image component
- **Service Worker** - Offline functionality
- **Bundle Analysis** - Optimized JavaScript bundles

### **Backend Optimizations:**
- **Database Indexing** - Optimized query performance
- **Connection Pooling** - Efficient database connections
- **Caching** - Redis for frequently accessed data
- **Edge Computing** - Reduced latency

### **AI/ML Optimizations:**
- **Vector Indexing** - Fast similarity search
- **Model Caching** - Reduced inference time
- **Batch Processing** - Efficient embedding generation
- **Streaming Responses** - Real-time AI interactions

---

## 🔒 **Security Architecture**

### **Authentication & Authorization:**
- **Supabase Auth** - Secure user authentication
- **JWT Tokens** - Stateless authentication
- **Row Level Security** - Database-level access control
- **OAuth Integration** - Google Sign-In

### **Data Protection:**
- **HTTPS/TLS** - Encrypted data transmission
- **Environment Variables** - Secure configuration
- **Input Validation** - SQL injection prevention
- **Rate Limiting** - API abuse prevention

### **Privacy Compliance:**
- **GDPR Compliance** - European data protection
- **Data Minimization** - Collect only necessary data
- **User Consent** - Transparent data usage
- **Data Retention** - Automatic data cleanup

---

## 📈 **Scalability Considerations**

### **Horizontal Scaling:**
- **Microservices** - Independent service scaling
- **Load Balancing** - Traffic distribution
- **Auto-scaling** - Dynamic resource allocation
- **Database Sharding** - Distributed data storage

### **Performance Monitoring:**
- **Real-time Metrics** - System performance tracking
- **Error Tracking** - Automated error detection
- **User Analytics** - Usage pattern analysis
- **A/B Testing** - Feature optimization

---

## 🔄 **Data Flow Architecture**

### **1. User Search Flow:**
```
User Query → AI Processing → Vector Search → Database Query → Response
```

### **2. Navigation Flow:**
```
User Location → Positioning System → Route Calculation → Map Update
```

### **3. Real-time Updates:**
```
Store Changes → Database Update → WebSocket Broadcast → Client Update
```

---

## 🛠️ **Development Workflow**

### **Code Organization:**
```
src/
├── app/                 # Next.js App Router
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── types/              # TypeScript type definitions
└── simulation/         # UWB simulation code
```

### **Quality Assurance:**
- **TypeScript** - Compile-time error checking
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **Testing** - Unit and integration tests

---

## 📱 **Mobile Optimization**

### **Progressive Web App Features:**
- **App-like Experience** - Native app feel
- **Offline Support** - Basic functionality without internet
- **Push Notifications** - Real-time updates
- **Home Screen Installation** - No app store required

### **Performance on Mobile:**
- **Touch Optimization** - Large touch targets
- **Responsive Design** - All screen sizes
- **Fast Loading** - Optimized for mobile networks
- **Battery Efficiency** - Minimal resource usage

---

## 🔮 **Future Enhancements**

### **Phase 2 Features:**
- **AR Navigation** - Augmented reality guidance
- **Voice Commands** - Hands-free operation
- **Predictive Analytics** - Shopping pattern analysis
- **Social Features** - Share shopping lists

### **Phase 3 Features:**
- **IoT Integration** - Smart shelf sensors
- **Computer Vision** - Visual product recognition
- **Machine Learning** - Personalized recommendations
- **Multi-store Support** - Cross-store navigation

---

*This architecture provides a solid foundation for Walmart Compass while maintaining flexibility for future enhancements and scaling across all Walmart stores in México.*
