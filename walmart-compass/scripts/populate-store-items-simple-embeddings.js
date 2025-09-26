#!/usr/bin/env node

/**
 * Populate Store Items Script with Simple Mock Embeddings
 * 
 * This script populates the store_items table with 100+ realistic Walmart items
 * using simple mock embeddings for testing (no API calls needed).
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';

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

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

// Store layout coordinates (simplified)
const storeLayout = {
  dairy: { x: 10, y: 5 },
  bakery: { x: 15, y: 8 },
  produce: { x: 5, y: 10 },
  meat: { x: 20, y: 12 },
  frozen: { x: 25, y: 15 },
  pantry: { x: 8, y: 18 },
  household: { x: 12, y: 22 },
  health: { x: 18, y: 25 }
};

function getRandomCoordinates(category) {
  const base = storeLayout[category] || { x: 10, y: 10 };
  return {
    x: base.x + (Math.random() - 0.5) * 4,
    y: base.y + (Math.random() - 0.5) * 4
  };
}

// Store items data
const storeItems = [
  // Dairy
  { name: 'Organic Whole Milk', category: 'dairy', price: 4.98, description: 'Organic whole milk, 1 gallon' },
  { name: '2% Reduced Fat Milk', category: 'dairy', price: 3.48, description: '2% reduced fat milk, 1 gallon' },
  { name: 'Free Range Eggs', category: 'dairy', price: 4.28, description: 'Free range eggs, 12 count' },
  { name: 'Sharp Cheddar Cheese', category: 'dairy', price: 3.98, description: 'Sharp cheddar cheese, 8 oz block' },
  { name: 'Greek Yogurt', category: 'dairy', price: 5.98, description: 'Greek yogurt, 32 oz container' },
  { name: 'Butter', category: 'dairy', price: 4.48, description: 'Salted butter, 4 sticks' },
  { name: 'Cream Cheese', category: 'dairy', price: 2.98, description: 'Cream cheese, 8 oz package' },
  { name: 'Sour Cream', category: 'dairy', price: 2.48, description: 'Sour cream, 16 oz container' },
  { name: 'Cottage Cheese', category: 'dairy', price: 3.28, description: 'Cottage cheese, 24 oz container' },
  { name: 'Mozzarella Cheese', category: 'dairy', price: 4.98, description: 'Shredded mozzarella cheese, 8 oz bag' },

  // Bakery
  { name: 'Whole Wheat Bread', category: 'bakery', price: 2.98, description: 'Whole wheat bread loaf' },
  { name: 'White Sandwich Bread', category: 'bakery', price: 1.98, description: 'White sandwich bread loaf' },
  { name: 'Everything Bagels', category: 'bakery', price: 3.48, description: 'Everything bagels, 6 pack' },
  { name: 'Croissants', category: 'bakery', price: 4.98, description: 'Butter croissants, 4 pack' },
  { name: 'Dinner Rolls', category: 'bakery', price: 2.48, description: 'Dinner rolls, 12 pack' },
  { name: 'Chocolate Chip Cookies', category: 'bakery', price: 3.98, description: 'Chocolate chip cookies, 24 count' },
  { name: 'Donuts', category: 'bakery', price: 4.48, description: 'Glazed donuts, 12 pack' },
  { name: 'Muffins', category: 'bakery', price: 5.98, description: 'Blueberry muffins, 6 pack' },
  { name: 'Cake Mix', category: 'bakery', price: 2.98, description: 'Chocolate cake mix, 15.25 oz' },
  { name: 'Pie Crust', category: 'bakery', price: 3.48, description: 'Ready-to-bake pie crust, 2 pack' },

  // Produce
  { name: 'Bananas', category: 'produce', price: 1.48, description: 'Bananas, per pound' },
  { name: 'Apples', category: 'produce', price: 2.98, description: 'Red apples, 3 lb bag' },
  { name: 'Oranges', category: 'produce', price: 3.98, description: 'Navel oranges, 4 lb bag' },
  { name: 'Strawberries', category: 'produce', price: 4.98, description: 'Fresh strawberries, 1 lb container' },
  { name: 'Blueberries', category: 'produce', price: 3.98, description: 'Fresh blueberries, 6 oz container' },
  { name: 'Spinach', category: 'produce', price: 2.98, description: 'Fresh spinach, 5 oz bag' },
  { name: 'Lettuce', category: 'produce', price: 1.98, description: 'Iceberg lettuce head' },
  { name: 'Tomatoes', category: 'produce', price: 2.48, description: 'Roma tomatoes, 3 lb bag' },
  { name: 'Carrots', category: 'produce', price: 1.98, description: 'Carrots, 2 lb bag' },
  { name: 'Broccoli', category: 'produce', price: 2.98, description: 'Fresh broccoli crowns' },

  // Meat
  { name: 'Chicken Breast', category: 'meat', price: 6.98, description: 'Boneless chicken breast, per pound' },
  { name: 'Ground Beef', category: 'meat', price: 5.98, description: 'Ground beef 80/20, per pound' },
  { name: 'Salmon Fillet', category: 'meat', price: 12.98, description: 'Atlantic salmon fillet, per pound' },
  { name: 'Pork Chops', category: 'meat', price: 4.98, description: 'Bone-in pork chops, per pound' },
  { name: 'Turkey Breast', category: 'meat', price: 7.98, description: 'Turkey breast, per pound' },
  { name: 'Bacon', category: 'meat', price: 5.98, description: 'Thick cut bacon, 12 oz package' },
  { name: 'Sausage', category: 'meat', price: 4.48, description: 'Italian sausage links, 19.2 oz' },
  { name: 'Deli Ham', category: 'meat', price: 8.98, description: 'Sliced deli ham, per pound' },
  { name: 'Ribeye Steak', category: 'meat', price: 15.98, description: 'Ribeye steak, per pound' },
  { name: 'Shrimp', category: 'meat', price: 9.98, description: 'Large shrimp, 1 lb bag' },

  // Frozen
  { name: 'Frozen Pizza', category: 'frozen', price: 4.98, description: 'Frozen cheese pizza, 12 inch' },
  { name: 'Ice Cream', category: 'frozen', price: 5.98, description: 'Vanilla ice cream, 1.5 quart' },
  { name: 'Frozen Vegetables', category: 'frozen', price: 2.98, description: 'Mixed frozen vegetables, 16 oz bag' },
  { name: 'Frozen Berries', category: 'frozen', price: 3.98, description: 'Frozen mixed berries, 10 oz bag' },
  { name: 'Frozen Waffles', category: 'frozen', price: 3.48, description: 'Frozen waffles, 10 count' },
  { name: 'Frozen Chicken Nuggets', category: 'frozen', price: 6.98, description: 'Frozen chicken nuggets, 2 lb bag' },
  { name: 'Frozen French Fries', category: 'frozen', price: 3.98, description: 'Frozen french fries, 32 oz bag' },
  { name: 'Frozen Burritos', category: 'frozen', price: 4.98, description: 'Frozen beef burritos, 8 count' },
  { name: 'Frozen Yogurt', category: 'frozen', price: 4.48, description: 'Frozen yogurt bars, 6 count' },
  { name: 'Frozen Lasagna', category: 'frozen', price: 7.98, description: 'Frozen lasagna, 3 lb tray' },

  // Pantry
  { name: 'Rice', category: 'pantry', price: 3.98, description: 'Long grain white rice, 5 lb bag' },
  { name: 'Pasta', category: 'pantry', price: 1.98, description: 'Spaghetti pasta, 1 lb box' },
  { name: 'Olive Oil', category: 'pantry', price: 6.98, description: 'Extra virgin olive oil, 17 oz bottle' },
  { name: 'Canned Tomatoes', category: 'pantry', price: 1.48, description: 'Canned diced tomatoes, 14.5 oz can' },
  { name: 'Black Beans', category: 'pantry', price: 1.28, description: 'Canned black beans, 15 oz can' },
  { name: 'Cereal', category: 'pantry', price: 4.98, description: 'Breakfast cereal, 18 oz box' },
  { name: 'Oatmeal', category: 'pantry', price: 3.98, description: 'Old fashioned oats, 42 oz container' },
  { name: 'Peanut Butter', category: 'pantry', price: 4.98, description: 'Creamy peanut butter, 40 oz jar' },
  { name: 'Honey', category: 'pantry', price: 6.98, description: 'Pure honey, 24 oz bottle' },
  { name: 'Flour', category: 'pantry', price: 2.98, description: 'All-purpose flour, 5 lb bag' },

  // Household
  { name: 'Toilet Paper', category: 'household', price: 12.98, description: 'Toilet paper, 12 roll pack' },
  { name: 'Paper Towels', category: 'household', price: 8.98, description: 'Paper towels, 8 roll pack' },
  { name: 'Laundry Detergent', category: 'household', price: 9.98, description: 'Laundry detergent, 100 oz bottle' },
  { name: 'Dish Soap', category: 'household', price: 2.98, description: 'Dish soap, 25 oz bottle' },
  { name: 'Trash Bags', category: 'household', price: 6.98, description: 'Trash bags, 13 gallon, 40 count' },
  { name: 'Batteries', category: 'household', price: 12.98, description: 'AA batteries, 24 pack' },
  { name: 'Air Freshener', category: 'household', price: 4.98, description: 'Air freshener spray, 8.8 oz' },
  { name: 'Cleaning Wipes', category: 'household', price: 5.98, description: 'Disinfecting cleaning wipes, 75 count' },
  { name: 'Light Bulbs', category: 'household', price: 8.98, description: 'LED light bulbs, 4 pack' },
  { name: 'Shampoo', category: 'household', price: 6.98, description: 'Shampoo, 25.4 oz bottle' },

  // Health & Beauty
  { name: 'Toothpaste', category: 'health', price: 3.98, description: 'Toothpaste, 6 oz tube' },
  { name: 'Vitamins', category: 'health', price: 12.98, description: 'Multivitamins, 100 count bottle' },
  { name: 'Pain Reliever', category: 'health', price: 8.98, description: 'Pain reliever tablets, 200 count' },
  { name: 'Bandages', category: 'health', price: 4.98, description: 'Adhesive bandages, 100 count box' },
  { name: 'Hand Sanitizer', category: 'health', price: 3.98, description: 'Hand sanitizer, 8 oz bottle' },
  { name: 'Sunscreen', category: 'health', price: 7.98, description: 'Sunscreen SPF 30, 6 oz bottle' },
  { name: 'Face Wash', category: 'health', price: 5.98, description: 'Facial cleanser, 6.7 oz bottle' },
  { name: 'Body Lotion', category: 'health', price: 4.98, description: 'Body lotion, 20 oz bottle' },
  { name: 'Deodorant', category: 'health', price: 3.98, description: 'Antiperspirant deodorant, 2.6 oz' },
  { name: 'Razor Blades', category: 'health', price: 8.98, description: 'Razor blade refills, 4 count' }
];

// Generate simple mock embedding (384 dimensions)
function generateMockEmbedding(text) {
  // Create a simple hash-based embedding
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate 384-dimensional vector based on hash
  const embedding = [];
  for (let i = 0; i < 384; i++) {
    // Use hash + i to create deterministic but varied values
    const seed = (hash + i * 31) % 1000;
    const value = (Math.sin(seed) * 0.5 + 0.5) * 2 - 1; // Normalize to [-1, 1]
    embedding.push(value);
  }
  
  return embedding;
}

// Clear existing items
async function clearExistingItems() {
  logInfo('Clearing existing store items...');
  
  const { error } = await supabase
    .from('store_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all items
  
  if (error) {
    logError(`Failed to clear existing items: ${error.message}`);
    throw error;
  }
  
  logSuccess('Existing items cleared');
}

// Populate store items
async function populateStoreItems() {
  logInfo('Populating store items with mock embeddings...');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < storeItems.length; i++) {
    const item = storeItems[i];
    const coordinates = getRandomCoordinates(item.category);
    
    // Generate mock embedding
    const embeddingText = `${item.name} ${item.description} ${item.category}`;
    const embedding = generateMockEmbedding(embeddingText);
    
    // Insert item into database
    const { error } = await supabase
      .from('store_items')
      .insert({
        id: randomUUID(),
        name: item.name,
        description: item.description,
        category: item.category,
        coordinates: coordinates,
        price: item.price,
        in_stock: true,
        embedding: embedding
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

// Main execution
async function main() {
  try {
    console.log(`${colors.bold}${colors.blue}🛒 Populating Store Items Database (Mock Embeddings)${colors.reset}`);
    console.log('============================================================');
    
    // Clear existing items
    await clearExistingItems();
    
    // Populate with new items
    const { successCount, errorCount } = await populateStoreItems();
    
    // Display results
    console.log(`\n${colors.bold}📊 Population Results:${colors.reset}`);
    logSuccess(`Successfully added: ${successCount} items with mock embeddings`);
    if (errorCount > 0) {
      logError(`Failed to add: ${errorCount} items`);
    }
    
    logSuccess(`\n🎉 Store population complete! Added ${successCount} items with mock embeddings.`);
    logInfo('You can now test the RAG system and embeddings functionality.');
    logWarning('Note: These are mock embeddings for testing. For production, use real embeddings.');
    
  } catch (error) {
    logError(`Script failed: ${error.message}`);
    process.exit(1);
  }
}

// Run the script
main();
