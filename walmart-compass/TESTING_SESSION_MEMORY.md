# 🧪 Testing Session Memory & Data Persistence

## 🚀 **Quick Start Testing**

### **1. Prerequisites**
Make sure you have:
- ✅ Supabase database set up with the new schema
- ✅ Environment variables configured
- ✅ Application running (`npm run dev` or `pnpm dev`)

### **2. Database Setup**
Since your tables already exist, run the migration script:

```sql
-- Run this in your Supabase SQL Editor
-- Copy the contents from database-migration.sql and execute
```

**OR** if you want to run the full schema (safe for existing databases):

```sql
-- Run this in your Supabase SQL Editor
-- Copy the contents from database-schema.sql and execute
-- (Uses IF NOT EXISTS, so it's safe for existing databases)
```

## 🧪 **Testing Scenarios**

### **Test 1: Shopping List Persistence**

#### **Steps:**
1. **Start Fresh**: Open the app in a new browser tab
2. **Add Items**: Use the chat to add items:
   - Type: "I need milk, bread, and eggs"
   - Watch items appear in the shopping list
3. **Toggle Items**: Check off some items as completed
4. **Remove Items**: Remove an item using the remove button
5. **Refresh Page**: Press F5 or refresh the browser
6. **Verify**: Check that all your changes are still there

#### **Expected Results:**
- ✅ Items persist after page refresh
- ✅ Completed status is maintained
- ✅ Removed items stay removed
- ✅ Loading indicator appears during load

### **Test 2: Chat History Persistence**

#### **Steps:**
1. **Start Conversation**: Ask the AI assistant something:
   - "What are some healthy breakfast options?"
   - "I'm planning a dinner party, what should I get?"
2. **Continue Chat**: Have a back-and-forth conversation
3. **Refresh Page**: Press F5 to refresh
4. **Verify**: Check that the entire conversation history is preserved

#### **Expected Results:**
- ✅ All messages (user and AI) are preserved
- ✅ Conversation continues seamlessly
- ✅ Loading indicator shows while loading chat history
- ✅ Timestamps are maintained

### **Test 3: Cross-Device Sync**

#### **Steps:**
1. **Device 1**: Add items and chat on one device/browser
2. **Device 2**: Open the app on another device/browser (same account)
3. **Verify**: Check that data syncs between devices

#### **Expected Results:**
- ✅ Shopping lists sync across devices
- ✅ Chat history appears on both devices
- ✅ Real-time updates when logged in

### **Test 4: User Context & AI Memory**

#### **Steps:**
1. **Set Preferences**: Update your dietary restrictions or preferences
2. **Ask AI**: Ask for recommendations:
   - "What snacks should I get?"
   - "I need something for my gluten-free diet"
3. **Verify**: Check that AI remembers your preferences

#### **Expected Results:**
- ✅ AI considers your dietary restrictions
- ✅ Recommendations are personalized
- ✅ Shopping history influences suggestions

## 🔧 **Manual API Testing**

### **Test Shopping List API**

```bash
# Get shopping list
curl -X GET http://localhost:3000/api/shopping-list \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update shopping list
curl -X POST http://localhost:3000/api/shopping-list \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "id": "1",
        "name": "Organic Milk",
        "category": "Dairy",
        "isCompleted": false,
        "location": {"x": 10, "y": 5}
      }
    ]
  }'
```

### **Test Chat History API**

```bash
# Get chat history
curl -X GET http://localhost:3000/api/chat-history \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send a message
curl -X POST http://localhost:3000/api/chat-history \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "message": "Hello AI!",
    "isUser": true
  }'
```

### **Test User Context API**

```bash
# Get user context
curl -X GET http://localhost:3000/api/user-context \
  -H "Authorization: Bearer YOUR_TOKEN"

# Update preferences
curl -X POST http://localhost:3000/api/user-context \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "preferences": {
      "dietaryRestrictions": ["vegetarian"],
      "brandPreferences": ["organic"],
      "organicPreference": true
    }
  }'
```

## 🐛 **Debugging & Troubleshooting**

### **Check Browser Console**
Open Developer Tools (F12) and look for:
- ✅ API calls to `/api/shopping-list`, `/api/chat-history`, `/api/user-context`
- ✅ No 401/403 errors (authentication issues)
- ✅ No 500 errors (server issues)

### **Check Network Tab**
In Developer Tools → Network tab:
- ✅ API calls return 200 status
- ✅ Response data is correct
- ✅ No failed requests

### **Check Database**
In Supabase Dashboard:
- ✅ Check `active_shopping_lists` table for your data
- ✅ Check `chat_sessions` table for chat history
- ✅ Check `user_profiles` table for preferences

### **Common Issues & Solutions**

#### **Issue: "Unauthorized" errors**
**Solution**: Make sure you're logged in with Google OAuth

#### **Issue: Data not persisting**
**Solution**: Check if database schema is applied correctly

#### **Issue: Loading forever**
**Solution**: Check browser console for API errors

#### **Issue: Chat not loading**
**Solution**: Verify chat history API is working

## 📊 **Database Verification**

### **Check Tables Exist**
```sql
-- Run in Supabase SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('active_shopping_lists', 'chat_sessions', 'user_profiles');
```

### **Check RLS Policies**
```sql
-- Run in Supabase SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('active_shopping_lists', 'chat_sessions', 'user_profiles');
```

### **Check Sample Data**
```sql
-- Run in Supabase SQL Editor (replace with your user ID)
SELECT * FROM active_shopping_lists WHERE user_id = 'your-user-id';
SELECT * FROM chat_sessions WHERE user_id = 'your-user-id';
SELECT * FROM user_profiles WHERE id = 'your-user-id';
```

## 🎯 **Success Criteria**

### **Shopping List Persistence**
- [ ] Items persist after page refresh
- [ ] Completed status is maintained
- [ ] Removed items stay removed
- [ ] Loading indicators work
- [ ] Cross-device sync works

### **Chat History Persistence**
- [ ] All messages are preserved
- [ ] Conversation continues after refresh
- [ ] Loading indicators work
- [ ] Cross-device sync works

### **User Context Persistence**
- [ ] Preferences are remembered
- [ ] AI uses persistent context
- [ ] Shopping history influences recommendations
- [ ] Cross-device sync works

### **Security & Performance**
- [ ] No unauthorized access to other users' data
- [ ] API responses are fast (< 1 second)
- [ ] No excessive API calls
- [ ] Graceful error handling

## 🚀 **Automated Testing Script**

Create a simple test script to verify everything works:

```javascript
// test-persistence.js
async function testPersistence() {
  console.log('🧪 Testing Session Memory...');
  
  // Test 1: Shopping List
  console.log('1. Testing shopping list persistence...');
  const listResponse = await fetch('/api/shopping-list');
  console.log('Shopping list API:', listResponse.ok ? '✅' : '❌');
  
  // Test 2: Chat History
  console.log('2. Testing chat history persistence...');
  const chatResponse = await fetch('/api/chat-history');
  console.log('Chat history API:', chatResponse.ok ? '✅' : '❌');
  
  // Test 3: User Context
  console.log('3. Testing user context persistence...');
  const contextResponse = await fetch('/api/user-context');
  console.log('User context API:', contextResponse.ok ? '✅' : '❌');
  
  console.log('🎉 Testing complete!');
}

// Run in browser console
testPersistence();
```

## 📝 **Test Checklist**

- [ ] Database schema applied
- [ ] Environment variables set
- [ ] User logged in with Google OAuth
- [ ] Shopping list persistence works
- [ ] Chat history persistence works
- [ ] User context persistence works
- [ ] Cross-device sync works
- [ ] Loading indicators work
- [ ] Error handling works
- [ ] Security (RLS) works
- [ ] Performance is acceptable

---

**Ready to test?** Start with the Quick Start Testing section and work through each scenario. Let me know if you encounter any issues!
