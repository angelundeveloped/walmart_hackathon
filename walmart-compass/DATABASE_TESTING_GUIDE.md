# 🧪 Database Testing Guide

This guide explains how to test all the databases and data systems in the Walmart Wavefinder project.

## 🎯 **What Gets Tested**

### **1. Supabase Database**
- ✅ Connection to Supabase
- ✅ Database schema validation
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Authentication system
- ✅ Performance testing

### **2. AI/ML Services**
- ✅ Gemini API connection
- ✅ Embedding generation
- ✅ Vector database functionality

### **3. Environment Configuration**
- ✅ Required environment variables
- ✅ Optional environment variables
- ✅ Configuration validation

---

## 🚀 **Testing Methods**

### **Method 1: Web Interface (Recommended)**

1. **Start your development server:**
   ```bash
   pnpm dev
   ```

2. **Navigate to the test page:**
   ```
   http://localhost:3000/test-databases
   ```

3. **Click "Run All Tests"** and watch the results in real-time

**Advantages:**
- ✅ Visual interface with progress indicators
- ✅ Real-time test results
- ✅ Detailed error messages
- ✅ Performance metrics
- ✅ No command line setup required

### **Method 2: Command Line Script**

1. **Run the simple test script:**
   ```bash
   pnpm test:db
   ```

2. **Or run the advanced TypeScript version:**
   ```bash
   pnpm test:db:ts
   ```

**Advantages:**
- ✅ Quick and automated
- ✅ Can be integrated into CI/CD
- ✅ Detailed console output
- ✅ Exit codes for automation

### **Method 3: Manual Testing**

You can also test individual components manually:

#### **Test Supabase Connection:**
```javascript
import { createClient } from '@/lib/supabase';

const supabase = createClient();
const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
console.log('Supabase connection:', error ? 'Failed' : 'Success');
```

#### **Test Gemini API:**
```javascript
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Test message' }] }]
  })
});
console.log('Gemini API:', response.ok ? 'Success' : 'Failed');
```

---

## 📋 **Test Checklist**

Before running tests, ensure you have:

### **Required Environment Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `GEMINI_API_KEY` - Your Google Gemini API key

### **Optional Environment Variables:**
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - For admin operations
- [ ] `GOOGLE_CLIENT_ID` - For OAuth authentication
- [ ] `GOOGLE_CLIENT_SECRET` - For OAuth authentication

### **Database Setup:**
- [ ] Supabase project created
- [ ] Database schema executed (from `database-schema.sql`)
- [ ] Tables created: `user_profiles`, `store_items`, `chat_sessions`, `shopping_history`

---

## 🔧 **Troubleshooting**

### **Common Issues and Solutions:**

#### **1. "Missing required environment variable"**
**Solution:** Check your `.env.local` file and ensure all required variables are set.

#### **2. "Supabase connection failed"**
**Possible causes:**
- Incorrect Supabase URL or key
- Network connectivity issues
- Supabase project not accessible

**Solution:**
- Verify your Supabase credentials in the dashboard
- Check your internet connection
- Ensure your Supabase project is active

#### **3. "Table access failed"**
**Possible causes:**
- Database schema not executed
- Table doesn't exist
- Permission issues

**Solution:**
- Run the SQL script from `database-schema.sql` in your Supabase SQL editor
- Check the Table Editor in Supabase dashboard
- Verify Row Level Security (RLS) policies

#### **4. "Gemini API connection failed"**
**Possible causes:**
- Invalid API key
- API quota exceeded
- Network issues

**Solution:**
- Verify your Gemini API key in Google AI Studio
- Check your API usage and quotas
- Test the API key in Google AI Studio

#### **5. "CRUD operations failed"**
**Possible causes:**
- Database permissions
- Data validation errors
- Network timeouts

**Solution:**
- Check RLS policies in Supabase
- Verify data types and constraints
- Check network connectivity

---

## 📊 **Understanding Test Results**

### **Test Status Indicators:**
- ✅ **Passed** - Test completed successfully
- ❌ **Failed** - Test failed with error message
- 🔄 **Running** - Test currently in progress
- ⏳ **Pending** - Test waiting to run

### **Performance Metrics:**
- **Response Time** - How long each test took
- **Success Rate** - Percentage of tests that passed
- **Concurrent Queries** - Performance under load

### **Sample Output:**
```
🧪 Walmart Wavefinder Database Testing Suite
==============================================

🔍 Environment Variables Validation
✅ Required env var: NEXT_PUBLIC_SUPABASE_URL
✅ Required env var: NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ Required env var: GEMINI_API_KEY

🔍 Supabase Connection Test
✅ Supabase connection successful

🔍 Database Schema Validation
✅ Table user_profiles exists and accessible
✅ Table store_items exists and accessible
✅ Table chat_sessions exists and accessible
✅ Table shopping_history exists and accessible

🔍 CRUD Operations Test
✅ User profile created successfully
✅ Store item created successfully
✅ User profile read successfully
✅ User profile updated successfully
✅ Test data cleaned up successfully

🔍 Authentication Test
✅ Anonymous authentication working
✅ Public data access working

🔍 Performance Test
✅ Performance test passed - 10 concurrent queries in 1250ms
✅ Performance within acceptable range (1250ms < 5000ms)

🔍 Vector Database Test
✅ Gemini API connection successful
✅ Embedding generation successful

🔍 Test Results Summary
Total Tests: 15
Passed: 15
Failed: 0
Success Rate: 100.0%

🎉 All tests passed! Your database setup is working perfectly.
```

---

## 🚀 **Next Steps**

After successful testing:

1. **Development:** Your database setup is ready for development
2. **Production:** Consider running these tests in your CI/CD pipeline
3. **Monitoring:** Set up monitoring for database performance
4. **Backup:** Implement regular database backups
5. **Security:** Review and update RLS policies as needed

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check the troubleshooting section above**
2. **Review the Supabase documentation:** [supabase.com/docs](https://supabase.com/docs)
3. **Check Gemini API documentation:** [ai.google.dev](https://ai.google.dev)
4. **Verify your environment variables are correct**
5. **Ensure your database schema is properly set up**

---

## 🔄 **Regular Testing**

It's recommended to run these tests:

- ✅ **Before deployment** - Ensure everything works
- ✅ **After configuration changes** - Verify updates
- ✅ **Weekly during development** - Catch issues early
- ✅ **After database migrations** - Ensure schema changes work
- ✅ **When adding new features** - Verify compatibility

Happy testing! 🎉
