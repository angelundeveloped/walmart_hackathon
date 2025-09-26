#!/usr/bin/env node

/**
 * Simple Store Items Population Script
 * 
 * This script populates the store_items table with 100+ realistic Walmart items
 * without embeddings (for quick testing).
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Store layout coordinates (simulating a typical Walmart layout)
const storeLayout = {
  dairy: { x: 5, y: 10, width: 8, height: 6 },
  bakery: { x: 15, y: 5, width: 6, height: 4 },
  produce: { x: 25, y: 8, width: 10, height: 8 },
  meat: { x: 5, y: 20, width: 8, height: 6 },
  frozen: { x: 15, y: 18, width: 8, height: 6 },
  pantry: { x: 25, y: 20, width: 12, height: 10 },
  beverages: { x: 40, y: 15, width: 6, height: 8 },
  health: { x: 50, y: 10, width: 6, height: 6 },
  household: { x: 50, y: 20, width: 8, height: 8 }
};

// Generate random coordinates within a section
function getRandomCoordinates(section) {
  const layout = storeLayout[section];
  return {
    x: Math.round((layout.x + Math.random() * layout.width) * 100) / 100,
    y: Math.round((layout.y + Math.random() * layout.height) * 100) / 100
  };
}

// Generate realistic Walmart items
const storeItems = [
  // Dairy Section
  { name: 'Organic Whole Milk', category: 'dairy', price: 4.98, description: 'Fresh organic whole milk, 1 gallon' },
  { name: '2% Reduced Fat Milk', category: 'dairy', price: 3.48, description: 'Fresh 2% reduced fat milk, 1 gallon' },
  { name: 'Free Range Eggs', category: 'dairy', price: 4.28, description: 'Large free range eggs, 12 count' },
  { name: 'Sharp Cheddar Cheese', category: 'dairy', price: 5.98, description: 'Sharp cheddar cheese block, 8 oz' },
  { name: 'Greek Yogurt', category: 'dairy', price: 6.48, description: 'Plain Greek yogurt, 32 oz' },
  { name: 'Butter', category: 'dairy', price: 4.98, description: 'Salted butter, 4 sticks' },
  { name: 'Cream Cheese', category: 'dairy', price: 2.98, description: 'Original cream cheese, 8 oz' },
  { name: 'Sour Cream', category: 'dairy', price: 2.48, description: 'Original sour cream, 16 oz' },
  { name: 'Cottage Cheese', category: 'dairy', price: 3.98, description: 'Low-fat cottage cheese, 24 oz' },
  { name: 'Mozzarella Cheese', category: 'dairy', price: 4.48, description: 'Shredded mozzarella cheese, 8 oz' },
  { name: 'Swiss Cheese', category: 'dairy', price: 5.48, description: 'Swiss cheese slices, 8 oz' },
  { name: 'Provolone Cheese', category: 'dairy', price: 4.98, description: 'Provolone cheese slices, 8 oz' },

  // Bakery Section
  { name: 'Whole Wheat Bread', category: 'bakery', price: 2.98, description: 'Fresh whole wheat bread loaf' },
  { name: 'White Sandwich Bread', category: 'bakery', price: 2.48, description: 'Fresh white sandwich bread loaf' },
  { name: 'Everything Bagels', category: 'bakery', price: 3.98, description: 'Fresh everything bagels, 6 count' },
  { name: 'Croissants', category: 'bakery', price: 4.98, description: 'Buttery croissants, 4 count' },
  { name: 'Dinner Rolls', category: 'bakery', price: 2.98, description: 'Fresh dinner rolls, 12 count' },
  { name: 'Chocolate Chip Cookies', category: 'bakery', price: 3.98, description: 'Fresh baked chocolate chip cookies' },
  { name: 'Donuts', category: 'bakery', price: 4.98, description: 'Assorted donuts, 12 count' },
  { name: 'Muffins', category: 'bakery', price: 5.98, description: 'Blueberry muffins, 6 count' },
  { name: 'Cake', category: 'bakery', price: 12.98, description: 'Chocolate layer cake, 8 inch' },
  { name: 'Pie', category: 'bakery', price: 8.98, description: 'Apple pie, 9 inch' },
  { name: 'Sourdough Bread', category: 'bakery', price: 3.48, description: 'Fresh sourdough bread loaf' },
  { name: 'Cinnamon Rolls', category: 'bakery', price: 4.98, description: 'Fresh cinnamon rolls, 8 count' },

  // Produce Section
  { name: 'Organic Bananas', category: 'produce', price: 1.98, description: 'Fresh organic bananas, per lb' },
  { name: 'Red Delicious Apples', category: 'produce', price: 2.98, description: 'Fresh red delicious apples, per lb' },
  { name: 'Romaine Lettuce', category: 'produce', price: 2.48, description: 'Fresh romaine lettuce head' },
  { name: 'Roma Tomatoes', category: 'produce', price: 2.98, description: 'Fresh roma tomatoes, per lb' },
  { name: 'Carrots', category: 'produce', price: 1.98, description: 'Fresh carrots, 2 lb bag' },
  { name: 'Broccoli', category: 'produce', price: 2.48, description: 'Fresh broccoli crowns' },
  { name: 'Spinach', category: 'produce', price: 2.98, description: 'Fresh baby spinach, 5 oz bag' },
  { name: 'Bell Peppers', category: 'produce', price: 3.98, description: 'Mixed bell peppers, 3 count' },
  { name: 'Onions', category: 'produce', price: 1.98, description: 'Yellow onions, 3 lb bag' },
  { name: 'Potatoes', category: 'produce', price: 2.98, description: 'Russet potatoes, 5 lb bag' },
  { name: 'Avocados', category: 'produce', price: 2.98, description: 'Fresh avocados, 4 count' },
  { name: 'Strawberries', category: 'produce', price: 4.98, description: 'Fresh strawberries, 1 lb container' },
  { name: 'Blueberries', category: 'produce', price: 3.98, description: 'Fresh blueberries, 6 oz container' },
  { name: 'Grapes', category: 'produce', price: 2.98, description: 'Red seedless grapes, per lb' },
  { name: 'Oranges', category: 'produce', price: 2.98, description: 'Navel oranges, 4 lb bag' },
  { name: 'Lemons', category: 'produce', price: 2.48, description: 'Fresh lemons, 2 lb bag' },
  { name: 'Limes', category: 'produce', price: 2.48, description: 'Fresh limes, 2 lb bag' },
  { name: 'Cucumbers', category: 'produce', price: 1.98, description: 'Fresh cucumbers, 3 count' },
  { name: 'Celery', category: 'produce', price: 2.48, description: 'Fresh celery bunch' },
  { name: 'Mushrooms', category: 'produce', price: 3.98, description: 'Fresh white mushrooms, 8 oz package' },

  // Meat Section
  { name: 'Boneless Chicken Breast', category: 'meat', price: 6.98, description: 'Fresh boneless chicken breast, per lb' },
  { name: 'Ground Beef', category: 'meat', price: 5.98, description: 'Fresh ground beef, 80/20, per lb' },
  { name: 'Atlantic Salmon Fillet', category: 'meat', price: 12.98, description: 'Fresh Atlantic salmon fillet, per lb' },
  { name: 'Pork Chops', category: 'meat', price: 4.98, description: 'Fresh pork chops, per lb' },
  { name: 'Ground Turkey', category: 'meat', price: 5.48, description: 'Fresh ground turkey, 93/7, per lb' },
  { name: 'Bacon', category: 'meat', price: 6.98, description: 'Thick cut bacon, 12 oz' },
  { name: 'Sausage', category: 'meat', price: 4.98, description: 'Italian sausage links, 1 lb' },
  { name: 'Ham', category: 'meat', price: 5.98, description: 'Spiral sliced ham, per lb' },
  { name: 'Steak', category: 'meat', price: 15.98, description: 'Ribeye steak, per lb' },
  { name: 'Chicken Thighs', category: 'meat', price: 3.98, description: 'Fresh chicken thighs, per lb' },
  { name: 'Ground Pork', category: 'meat', price: 4.48, description: 'Fresh ground pork, per lb' },
  { name: 'Tilapia Fillet', category: 'meat', price: 8.98, description: 'Fresh tilapia fillet, per lb' },

  // Frozen Section
  { name: 'Vanilla Ice Cream', category: 'frozen', price: 4.98, description: 'Premium vanilla ice cream, 48 oz' },
  { name: 'Mixed Frozen Vegetables', category: 'frozen', price: 2.98, description: 'Mixed frozen vegetables, 16 oz bag' },
  { name: 'Pepperoni Pizza', category: 'frozen', price: 6.98, description: 'Frozen pepperoni pizza, 12 inch' },
  { name: 'Frozen Berries', category: 'frozen', price: 3.98, description: 'Mixed frozen berries, 10 oz bag' },
  { name: 'Frozen Waffles', category: 'frozen', price: 3.48, description: 'Frozen waffles, 10 count' },
  { name: 'Frozen Chicken Nuggets', category: 'frozen', price: 5.98, description: 'Frozen chicken nuggets, 2 lb bag' },
  { name: 'Frozen French Fries', category: 'frozen', price: 2.98, description: 'Frozen french fries, 32 oz bag' },
  { name: 'Frozen Shrimp', category: 'frozen', price: 8.98, description: 'Frozen cooked shrimp, 1 lb bag' },
  { name: 'Frozen Corn', category: 'frozen', price: 1.98, description: 'Frozen corn kernels, 12 oz bag' },
  { name: 'Frozen Broccoli', category: 'frozen', price: 2.48, description: 'Frozen broccoli florets, 12 oz bag' },
  { name: 'Frozen Peas', category: 'frozen', price: 1.98, description: 'Frozen peas, 12 oz bag' },
  { name: 'Frozen Hash Browns', category: 'frozen', price: 3.48, description: 'Frozen hash browns, 30 oz bag' },

  // Pantry Section
  { name: 'Spaghetti Pasta', category: 'pantry', price: 1.98, description: 'Spaghetti pasta, 1 lb box' },
  { name: 'Basmati Rice', category: 'pantry', price: 3.98, description: 'Premium basmati rice, 2 lb bag' },
  { name: 'Honey Nut Cheerios', category: 'pantry', price: 4.98, description: 'Honey nut cheerios cereal, 18 oz box' },
  { name: 'Crushed Tomatoes', category: 'pantry', price: 1.98, description: 'Crushed tomatoes, 28 oz can' },
  { name: 'Extra Virgin Olive Oil', category: 'pantry', price: 8.98, description: 'Extra virgin olive oil, 17 oz bottle' },
  { name: 'Black Beans', category: 'pantry', price: 1.48, description: 'Black beans, 15 oz can' },
  { name: 'Quinoa', category: 'pantry', price: 5.98, description: 'Organic quinoa, 12 oz bag' },
  { name: 'Oatmeal', category: 'pantry', price: 3.98, description: 'Old fashioned oats, 42 oz container' },
  { name: 'Peanut Butter', category: 'pantry', price: 4.98, description: 'Creamy peanut butter, 40 oz jar' },
  { name: 'Almonds', category: 'pantry', price: 8.98, description: 'Whole almonds, 16 oz bag' },
  { name: 'Granola Bars', category: 'pantry', price: 5.98, description: 'Mixed granola bars, 20 count' },
  { name: 'Crackers', category: 'pantry', price: 3.98, description: 'Saltine crackers, 16 oz box' },
  { name: 'Canned Soup', category: 'pantry', price: 2.48, description: 'Chicken noodle soup, 10.5 oz can' },
  { name: 'Pasta Sauce', category: 'pantry', price: 2.98, description: 'Marinara pasta sauce, 24 oz jar' },
  { name: 'Flour', category: 'pantry', price: 2.98, description: 'All-purpose flour, 5 lb bag' },
  { name: 'Sugar', category: 'pantry', price: 2.48, description: 'Granulated sugar, 4 lb bag' },
  { name: 'Salt', category: 'pantry', price: 1.48, description: 'Table salt, 26 oz container' },
  { name: 'Black Pepper', category: 'pantry', price: 2.98, description: 'Ground black pepper, 2.5 oz container' },
  { name: 'Garlic Powder', category: 'pantry', price: 2.48, description: 'Garlic powder, 2.5 oz container' },
  { name: 'Cumin', category: 'pantry', price: 3.98, description: 'Ground cumin, 2.5 oz container' },
  { name: 'Cinnamon', category: 'pantry', price: 2.98, description: 'Ground cinnamon, 2.5 oz container' },
  { name: 'Oregano', category: 'pantry', price: 2.48, description: 'Dried oregano, 1 oz container' },

  // Beverages Section
  { name: 'Spring Water', category: 'beverages', price: 4.98, description: 'Spring water, 24 pack bottles' },
  { name: 'Coca-Cola', category: 'beverages', price: 6.98, description: 'Coca-Cola, 12 pack cans' },
  { name: 'Ground Coffee', category: 'beverages', price: 8.98, description: 'Premium ground coffee, 12 oz bag' },
  { name: 'Orange Juice', category: 'beverages', price: 4.98, description: 'Fresh orange juice, 64 oz bottle' },
  { name: 'Green Tea', category: 'beverages', price: 3.98, description: 'Green tea bags, 20 count' },
  { name: 'Energy Drink', category: 'beverages', price: 2.98, description: 'Energy drink, 16 oz can' },
  { name: 'Sports Drink', category: 'beverages', price: 1.98, description: 'Sports drink, 32 oz bottle' },
  { name: 'Sparkling Water', category: 'beverages', price: 4.98, description: 'Sparkling water, 12 pack cans' },
  { name: 'Apple Juice', category: 'beverages', price: 3.98, description: 'Apple juice, 64 oz bottle' },
  { name: 'Hot Chocolate', category: 'beverages', price: 4.98, description: 'Hot chocolate mix, 16 oz container' },
  { name: 'Pepsi', category: 'beverages', price: 6.98, description: 'Pepsi, 12 pack cans' },
  { name: 'Gatorade', category: 'beverages', price: 1.98, description: 'Gatorade sports drink, 32 oz bottle' },

  // Health & Beauty Section
  { name: 'Moisturizing Shampoo', category: 'health', price: 6.98, description: 'Moisturizing shampoo, 25.4 oz bottle' },
  { name: 'Fluoride Toothpaste', category: 'health', price: 3.98, description: 'Fluoride toothpaste, 6 oz tube' },
  { name: 'Daily Multivitamin', category: 'health', price: 12.98, description: 'Daily multivitamin, 100 count' },
  { name: 'Body Lotion', category: 'health', price: 5.98, description: 'Moisturizing body lotion, 20 oz bottle' },
  { name: 'Face Cleanser', category: 'health', price: 7.98, description: 'Gentle face cleanser, 6.7 oz bottle' },
  { name: 'Sunscreen', category: 'health', price: 8.98, description: 'SPF 30 sunscreen, 6 oz bottle' },
  { name: 'Pain Reliever', category: 'health', price: 6.98, description: 'Pain reliever tablets, 100 count' },
  { name: 'Band-Aids', category: 'health', price: 4.98, description: 'Adhesive bandages, 100 count' },
  { name: 'Hand Sanitizer', category: 'health', price: 2.98, description: 'Hand sanitizer, 8 oz bottle' },
  { name: 'Vitamins C', category: 'health', price: 9.98, description: 'Vitamin C tablets, 60 count' },
  { name: 'Conditioner', category: 'health', price: 6.98, description: 'Moisturizing conditioner, 25.4 oz bottle' },
  { name: 'Toothbrush', category: 'health', price: 3.98, description: 'Soft bristle toothbrush, 2 count' },

  // Household Section
  { name: 'Liquid Laundry Detergent', category: 'household', price: 12.98, description: 'Liquid laundry detergent, 100 oz bottle' },
  { name: 'Paper Towels', category: 'household', price: 8.98, description: 'Paper towels, 12 roll pack' },
  { name: 'Toilet Paper', category: 'household', price: 15.98, description: 'Toilet paper, 24 roll pack' },
  { name: 'Dish Soap', category: 'household', price: 2.98, description: 'Dish soap, 25 oz bottle' },
  { name: 'All-Purpose Cleaner', category: 'household', price: 3.98, description: 'All-purpose cleaner, 32 oz bottle' },
  { name: 'Trash Bags', category: 'household', price: 6.98, description: 'Trash bags, 13 gallon, 40 count' },
  { name: 'Light Bulbs', category: 'household', price: 8.98, description: 'LED light bulbs, 4 pack' },
  { name: 'Batteries', category: 'household', price: 12.98, description: 'AA batteries, 24 pack' },
  { name: 'Air Freshener', category: 'household', price: 4.98, description: 'Air freshener spray, 8.8 oz' },
  { name: 'Cleaning Wipes', category: 'household', price: 5.98, description: 'Disinfecting cleaning wipes, 75 count' },
  { name: 'Fabric Softener', category: 'household', price: 4.98, description: 'Fabric softener, 64 oz bottle' },
  { name: 'Sponges', category: 'household', price: 2.98, description: 'Kitchen sponges, 6 count' }
];

// Clear existing items
async function clearExistingItems() {
  logInfo('Clearing existing store items...');
  
  const { error } = await supabase
    .from('store_items')
    .delete()
    .neq('id', 'dummy'); // Delete all items
  
  if (error) {
    logError(`Failed to clear existing items: ${error.message}`);
    return false;
  }
  
  logSuccess('Existing items cleared');
  return true;
}

// Populate store items
async function populateStoreItems() {
  logInfo('Populating store items...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < storeItems.length; i++) {
    const item = storeItems[i];
    const coordinates = getRandomCoordinates(item.category);
    
    // Insert item (without embedding for now)
    const { error } = await supabase
      .from('store_items')
      .insert({
        id: `item_${i + 1}`,
        name: item.name,
        category: item.category,
        description: item.description,
        coordinates: coordinates,
        price: item.price,
        in_stock: true
      });
    
    if (error) {
      logError(`Failed to insert ${item.name}: ${error.message}`);
      errorCount++;
    } else {
      logSuccess(`Added: ${item.name} (${item.category}) - $${item.price}`);
      successCount++;
    }
  }
  
  return { successCount, errorCount };
}

// Main function
async function main() {
  log('🛒 Populating Store Items Database (Simple Version)', 'bold');
  log('=' .repeat(60), 'blue');
  
  try {
    // Clear existing items
    const cleared = await clearExistingItems();
    if (!cleared) {
      logError('Failed to clear existing items. Aborting.');
      process.exit(1);
    }
    
    // Populate new items
    const { successCount, errorCount } = await populateStoreItems();
    
    log('\n📊 Population Results:', 'bold');
    log(`✅ Successfully added: ${successCount} items`, 'green');
    if (errorCount > 0) {
      log(`❌ Failed to add: ${errorCount} items`, 'red');
    }
    
    // Verify the data
    const { data: items, error } = await supabase
      .from('store_items')
      .select('id, name, category, price, coordinates')
      .limit(5);
    
    if (error) {
      logError(`Failed to verify data: ${error.message}`);
    } else {
      log('\n🔍 Sample Items:', 'bold');
      items.forEach(item => {
        log(`- ${item.name} (${item.category}) - $${item.price} at (${item.coordinates.x}, ${item.coordinates.y})`, 'blue');
      });
    }
    
    // Show category breakdown
    const { data: categories } = await supabase
      .from('store_items')
      .select('category')
      .order('category');
    
    if (categories) {
      const categoryCount = categories.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {});
      
      log('\n📈 Items by Category:', 'bold');
      Object.entries(categoryCount).forEach(([category, count]) => {
        log(`- ${category}: ${count} items`, 'blue');
      });
    }
    
    logSuccess(`\n🎉 Store population complete! Added ${successCount} items.`);
    logInfo('You can now test the RAG system and item search functionality.');
    logInfo('Note: Items were added without embeddings. Run the full script to add embeddings.');
    
  } catch (error) {
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  process.exit(1);
});
