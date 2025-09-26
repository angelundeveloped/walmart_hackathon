# 🛒 Populate Store Items for RAG Testing

## 🚀 **Quick Start**

### **Option 1: Simple Population (Recommended for Testing)**
```bash
npm run populate:items
```

### **Option 2: Full Population with Embeddings**
```bash
npm run populate:items:full
```

### **Test the Results**
```bash
npm run test:items
```

## 📋 **What Gets Populated**

### **100+ Realistic Walmart Items Across 9 Categories:**

1. **🥛 Dairy (12 items)**
   - Organic Whole Milk, 2% Reduced Fat Milk, Free Range Eggs
   - Sharp Cheddar Cheese, Greek Yogurt, Butter, Cream Cheese, etc.

2. **🍞 Bakery (12 items)**
   - Whole Wheat Bread, White Sandwich Bread, Everything Bagels
   - Croissants, Dinner Rolls, Chocolate Chip Cookies, etc.

3. **🥬 Produce (20 items)**
   - Organic Bananas, Red Delicious Apples, Romaine Lettuce
   - Roma Tomatoes, Carrots, Broccoli, Spinach, etc.

4. **🥩 Meat (12 items)**
   - Boneless Chicken Breast, Ground Beef, Atlantic Salmon Fillet
   - Pork Chops, Ground Turkey, Bacon, Sausage, etc.

5. **🧊 Frozen (12 items)**
   - Vanilla Ice Cream, Mixed Frozen Vegetables, Pepperoni Pizza
   - Frozen Berries, Frozen Waffles, Frozen Chicken Nuggets, etc.

6. **🥫 Pantry (22 items)**
   - Spaghetti Pasta, Basmati Rice, Honey Nut Cheerios
   - Crushed Tomatoes, Extra Virgin Olive Oil, Black Beans, etc.

7. **🥤 Beverages (12 items)**
   - Spring Water, Coca-Cola, Ground Coffee, Orange Juice
   - Green Tea, Energy Drink, Sports Drink, etc.

8. **💄 Health & Beauty (12 items)**
   - Moisturizing Shampoo, Fluoride Toothpaste, Daily Multivitamin
   - Body Lotion, Face Cleanser, Sunscreen, etc.

9. **🧽 Household (12 items)**
   - Liquid Laundry Detergent, Paper Towels, Toilet Paper
   - Dish Soap, All-Purpose Cleaner, Trash Bags, etc.

## 🗺️ **Store Layout & Coordinates**

Items are placed in realistic store sections with coordinates:

```
Store Layout (approximate):
┌─────────────────────────────────────────────────────────┐
│  🍞 Bakery    🥬 Produce              🥤 Beverages      │
│  (15,5)       (25,8)                  (40,15)           │
│                                                         │
│  🥛 Dairy     🧊 Frozen    🥫 Pantry   💄 Health        │
│  (5,10)       (15,18)      (25,20)     (50,10)          │
│                                                         │
│  🥩 Meat      🧽 Household                              │
│  (5,20)       (50,20)                                  │
└─────────────────────────────────────────────────────────┘
```

## 🔧 **Script Details**

### **Simple Population Script** (`populate-store-items-simple.js`)
- ✅ Adds 100+ items with realistic names, prices, descriptions
- ✅ Assigns random coordinates within appropriate store sections
- ✅ No embeddings (faster, good for basic testing)
- ✅ Takes ~30 seconds to complete

### **Full Population Script** (`populate-store-items.js`)
- ✅ Everything from simple script PLUS:
- ✅ Generates embeddings for each item using Gemini API
- ✅ Enables full RAG functionality
- ✅ Takes ~2-3 minutes to complete (due to API calls)

### **Test Script** (`test-store-items.js`)
- ✅ Verifies item count and categories
- ✅ Tests coordinate validity
- ✅ Tests search functionality
- ✅ Tests embeddings (if present)
- ✅ Shows price ranges and sample data

## 🧪 **Testing the RAG System**

### **1. Basic Item Search**
After populating, test these searches in your app:
- "I need milk" → Should find dairy items
- "I want bread" → Should find bakery items
- "I need chicken" → Should find meat items
- "I want vegetables" → Should find produce items

### **2. Category-Based Requests**
- "I need breakfast items" → Should find bread, milk, eggs, etc.
- "I want to make pasta" → Should find pasta, sauce, cheese, etc.
- "I need cleaning supplies" → Should find household items

### **3. Complex Requests**
- "I'm having a party" → Should suggest snacks, drinks, paper products
- "I need healthy options" → Should prioritize organic, fresh items
- "I'm cooking Italian food" → Should suggest pasta, tomatoes, cheese, etc.

## 📊 **Expected Results**

### **After Simple Population:**
```
✅ Successfully added: 100+ items
📂 Found 9 categories: dairy, bakery, produce, meat, frozen, pantry, beverages, health, household
📍 All coordinates are valid
🔍 Search functionality works
⚠️  No items with embeddings found (expected)
```

### **After Full Population:**
```
✅ Successfully added: 100+ items
📂 Found 9 categories: dairy, bakery, produce, meat, frozen, pantry, beverages, health, household
📍 All coordinates are valid
🔍 Search functionality works
🧠 Found 100+ items with embeddings
```

## 🐛 **Troubleshooting**

### **"Missing Supabase environment variables"**
```bash
# Make sure these are set in your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **"Missing Gemini API key"** (for full population)
```bash
# Add this to your .env.local file:
GEMINI_API_KEY=your_gemini_api_key
```

### **"Failed to clear existing items"**
- Check your Supabase connection
- Verify RLS policies allow deletion
- Make sure you're using the correct database

### **"Failed to insert items"**
- Check if the `store_items` table exists
- Verify the table schema matches the script
- Check for any constraint violations

## 🎯 **Next Steps After Population**

1. **Test the App:**
   - Start your app: `npm run dev`
   - Try adding items via chat
   - Verify items appear on the map

2. **Test RAG Functionality:**
   - Ask for specific items
   - Try complex requests
   - Test category-based searches

3. **Test Session Memory:**
   - Add items to your shopping list
   - Refresh the page
   - Verify persistence

4. **Test Cross-Device Sync:**
   - Open app on another device
   - Log in with same account
   - Verify data syncs

## 📝 **Sample Test Queries**

Try these in your app's chat:

```
"I need milk, bread, and eggs"
"I'm making pasta for dinner"
"I want healthy snacks"
"I need cleaning supplies"
"I'm having a barbecue"
"I want organic options"
"I need breakfast items"
"I'm cooking Italian food"
"I want frozen meals"
"I need personal care items"
```

## 🔄 **Re-populating Data**

To clear and re-populate:
```bash
# The scripts automatically clear existing data before adding new items
npm run populate:items
```

To add more items without clearing:
- Modify the `storeItems` array in the scripts
- Add new items with unique IDs
- Run the population script

---

**Ready to test?** Start with `npm run populate:items` and then `npm run test:items` to verify everything is working!
