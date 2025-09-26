# 🚀 Supabase Setup Instructions

## 📋 **Step-by-Step Setup Guide**

### **1. Create Supabase Project**

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → "New project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `walmart-wavefinder`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for project to be ready (2-3 minutes)
note: finished this step
### **2. Get Supabase Credentials**

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ`)
   - **service_role** key (starts with `eyJ`)
note: i got the url but not sure if i have the anon an service role keys. i do have public and private api keys.

### **3. Set Up Database Schema**

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `database-schema.sql`
3. Paste and run the SQL script
4. Verify tables are created in **Table Editor**
note: the tables where created
### **4. Configure Google OAuth**

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. You'll need Google OAuth credentials (see next section)

### **5. Set Up Google OAuth**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - **Application name**: Walmart Wavefinder
   - **User support email**: Your email
   - **Authorized domains**: Add your domain
6. Create OAuth client:
   - **Application type**: Web application
   - **Authorized redirect URIs**: 
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
7. Copy **Client ID** and **Client Secret**
note: i think i have this setup
### **6. Configure Environment Variables**

Create `.env.local` file with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Gemini Configuration (for embeddings and chat)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemma-3n-e2b-it
```

### **7. Install Dependencies**

Run these commands:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### **8. Test the Setup**

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click "Sign in with Google"
4. Complete OAuth flow
5. Verify user appears in Supabase **Authentication** → **Users**

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Invalid redirect URI"**
   - Check Google OAuth redirect URIs match exactly
   - Include both localhost and production URLs

2. **"Database connection failed"**
   - Verify Supabase URL and keys are correct
   - Check if database schema was created

3. **"Authentication failed"**
   - Verify Google OAuth credentials
   - Check Supabase Google provider is enabled

### **Verification Checklist:**

- [ ] Supabase project created
- [ ] Database schema executed successfully
- [ ] Google OAuth configured in Supabase
- [ ] Google Cloud Console OAuth set up
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Authentication flow works
- [ ] User appears in Supabase dashboard

## 🚀 **Next Steps**

Once setup is complete:
1. Test authentication flow
2. Verify database tables exist
3. Test user profile creation
4. Move to Phase 2: Data Migration

## 📞 **Need Help?**

- Supabase Docs: [supabase.com/docs](https://supabase.com/docs)
- Google OAuth Docs: [developers.google.com/identity/protocols/oauth2](https://developers.google.com/identity/protocols/oauth2)
