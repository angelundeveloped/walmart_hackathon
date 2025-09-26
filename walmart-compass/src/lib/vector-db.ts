// Vector Database for Smart Item Matching
// Implementation using Gemini embeddings and cosine similarity

import { createEmbedding } from './gemini-embeddings';

export interface ItemEmbedding {
  id: string;
  name: string;
  description: string;
  category: string;
  embedding: number[];
  coordinates: { x: number; y: number };
  price: number;
}

export interface SearchResult {
  item: ItemEmbedding;
  similarity: number;
  distance: number;
}

class VectorDatabase {
  private items: ItemEmbedding[] = [];
  private isInitialized = false;

  // Create embedding using Gemini API with fallback
  private async textToVector(text: string): Promise<number[]> {
    try {
      return await createEmbedding(text);
    } catch (error) {
      console.error('Failed to create Gemini embedding, using fallback:', error);
      return this.createFallbackEmbedding(text);
    }
  }

  // Fallback embedding function (simple bag-of-words)
  private createFallbackEmbedding(text: string): number[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2);
    
    // Create a simple bag-of-words vector with common shopping terms
    const vocabulary = [
      'breakfast', 'lunch', 'dinner', 'snack', 'drink', 'beverage',
      'milk', 'bread', 'eggs', 'cheese', 'meat', 'chicken', 'beef',
      'fruit', 'vegetable', 'produce', 'organic', 'fresh', 'frozen',
      'cereal', 'pasta', 'rice', 'soup', 'sauce', 'oil', 'spice',
      'cookie', 'candy', 'chocolate', 'sweet', 'sugar', 'salt',
      'water', 'soda', 'juice', 'coffee', 'tea', 'beer', 'wine',
      'party', 'celebration', 'entertainment', 'social', 'gathering',
      'healthy', 'diet', 'nutrition', 'protein', 'vitamin', 'fiber',
      'cleaning', 'household', 'laundry', 'bathroom', 'kitchen',
      'beauty', 'health', 'personal', 'care', 'hygiene', 'cosmetic'
    ];
    
    const vector = new Array(vocabulary.length).fill(0);
    
    words.forEach(word => {
      const index = vocabulary.indexOf(word);
      if (index !== -1) {
        vector[index] += 1;
      }
    });
    
    // Add category-based features
    const categories = ['dairy', 'bakery', 'produce', 'meat', 'frozen', 'pantry', 'beverages', 'health', 'household'];
    categories.forEach((category, index) => {
      if (text.toLowerCase().includes(category)) {
        vector[vocabulary.length + index] = 1;
      }
    });
    
    // Normalize vector
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Initialize the vector database with store items from database
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Try to load items from database first
      if (typeof window === 'undefined') {
        // Server-side: use Supabase client
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey);
          const { data: dbItems, error } = await supabase
            .from('store_items')
            .select('id, name, category, description, coordinates, price, embedding')
            .eq('in_stock', true);
          
          if (!error && dbItems && dbItems.length > 0) {
            // Use items from database with embeddings
            this.items = dbItems.map(item => {
              let embedding = [];
              if (item.embedding) {
                if (Array.isArray(item.embedding)) {
                  embedding = item.embedding;
                } else if (typeof item.embedding === 'string') {
                  try {
                    embedding = JSON.parse(item.embedding);
                  } catch (e) {
                    console.error(`Failed to parse embedding for ${item.name}:`, e);
                    embedding = [];
                  }
                }
              }
              
              return {
                id: item.id,
                name: item.name,
                description: item.description || `${item.name} ${item.category}`,
                category: item.category,
                embedding: embedding,
                coordinates: item.coordinates as { x: number; y: number },
                price: item.price || 0
              };
            });
            
            console.log(`Vector DB initialized with ${this.items.length} items from database`);
            if (this.items.length > 0) {
              console.log(`First item: ${this.items[0].name} - embedding length: ${this.items[0].embedding.length}`);
            }
            this.isInitialized = true;
            return;
          } else {
            console.error('Failed to load items from database:', error);
          }
        } else {
          console.error('Missing Supabase environment variables');
        }
      }
      
      // Fallback: Load from YAML file (client-side or if database fails)
      const response = await fetch('/data/store-layout.yaml');
      const text = await response.text();
      
      // Parse items from YAML (simplified parsing)
      const lines = text.split('\n');
      const items: ItemEmbedding[] = [];
      let currentItem: { id: string; name?: string; category?: string; coordinates?: { x: number; y: number }; price?: number } | null = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('- id:')) {
          if (currentItem && currentItem.name && currentItem.coordinates) {
            // Create the full ItemEmbedding object
            const itemEmbedding: ItemEmbedding = {
              id: currentItem.id,
              name: currentItem.name,
              description: `${currentItem.name} ${currentItem.category || ''}`,
              category: currentItem.category || 'Unknown',
              embedding: [],
              coordinates: currentItem.coordinates,
              price: currentItem.price || 0
            };
            items.push(itemEmbedding);
          }
          currentItem = {
            id: trimmed.replace('- id:', '').trim().replace(/^"|"$/g, ''),
          };
        } else if (currentItem && trimmed.startsWith('name:')) {
          currentItem.name = trimmed.replace('name:', '').trim().replace(/^"|"$/g, '');
        } else if (currentItem && trimmed.startsWith('category:')) {
          currentItem.category = trimmed.replace('category:', '').trim().replace(/^"|"$/g, '');
        } else if (currentItem && trimmed.startsWith('coordinates:')) {
          const match = trimmed.match(/\[(\d+),\s*(\d+)\]/);
          if (match) {
            currentItem.coordinates = { x: parseInt(match[1]), y: parseInt(match[2]) };
          }
        } else if (currentItem && trimmed.startsWith('price:')) {
          currentItem.price = parseFloat(trimmed.replace('price:', '').trim());
        }
      }
      
      if (currentItem && currentItem.name && currentItem.coordinates) {
        // Create the full ItemEmbedding object for the last item
        const itemEmbedding: ItemEmbedding = {
          id: currentItem.id,
          name: currentItem.name,
          description: `${currentItem.name} ${currentItem.category || ''}`,
          category: currentItem.category || 'Unknown',
          embedding: [],
          coordinates: currentItem.coordinates,
          price: currentItem.price || 0
        };
        items.push(itemEmbedding);
      }
      
      // Create embeddings for each item
      this.items = await Promise.all(items.map(async (item) => ({
        ...item,
        description: `${item.name} ${item.category}`,
        embedding: await this.textToVector(`${item.name} ${item.category}`)
      })));
      
      this.isInitialized = true;
      
    } catch (error) {
      console.error('Vector database initialization failed:', error);
      // Vector database initialization failed
    }
  }

  // Search for similar items
  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    console.log(`Vector search for query: "${query}" with ${this.items.length} items`);
    
    const queryVector = await this.textToVector(query);
    const results: SearchResult[] = [];
    
    for (const item of this.items) {
      let itemEmbedding = item.embedding;
      
      // If the item has a real embedding (384 dimensions), use it
      // Otherwise, create a fallback embedding
      if (!itemEmbedding || itemEmbedding.length === 0) {
        itemEmbedding = this.createFallbackEmbedding(`${item.name} ${item.description} ${item.category}`);
      }
      
      // Only compare if both embeddings have the same dimensions
      if (queryVector.length === itemEmbedding.length) {
        const similarity = this.cosineSimilarity(queryVector, itemEmbedding);
        if (similarity > 0.01) { // Lower similarity threshold for testing
          results.push({
            item,
            similarity,
            distance: 1 - similarity // Convert similarity to distance
          });
        }
      } else {
        // If dimensions don't match, use fallback embedding for the item too
        const fallbackItemEmbedding = this.createFallbackEmbedding(`${item.name} ${item.description} ${item.category}`);
        const similarity = this.cosineSimilarity(queryVector, fallbackItemEmbedding);
        if (similarity > 0.01) {
          results.push({
            item,
            similarity,
            distance: 1 - similarity
          });
        }
      }
    }
    
    // Debug: show top similarities
    if (results.length === 0 && this.items.length > 0) {
      const allSimilarities = this.items.map(item => {
        let itemEmbedding = item.embedding;
        if (!itemEmbedding || itemEmbedding.length === 0 || queryVector.length !== itemEmbedding.length) {
          itemEmbedding = this.createFallbackEmbedding(`${item.name} ${item.description} ${item.category}`);
        }
        return {
          name: item.name,
          similarity: this.cosineSimilarity(queryVector, itemEmbedding)
        };
      }).sort((a, b) => b.similarity - a.similarity);
      
      console.log('Top 5 similarities (no matches found):', allSimilarities.slice(0, 5));
    }
    
    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
    console.log(`Found ${results.length} similar items for query: "${query}"`);
    
    return results.slice(0, limit);
  }

  // Get similar items based on an existing item
  async getSimilarItems(itemId: string, limit: number = 3): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const targetItem = this.items.find(item => item.id === itemId);
    if (!targetItem) return [];
    
    const results: SearchResult[] = [];
    
    for (const item of this.items) {
      if (item.id === itemId) continue; // Skip the same item
      
      const similarity = this.cosineSimilarity(targetItem.embedding, item.embedding);
      if (similarity > 0.2) { // Higher threshold for similar items
        results.push({
          item,
          similarity,
          distance: 1 - similarity
        });
      }
    }
    
    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results.slice(0, limit);
  }

  // Get all items (for debugging)
  getAllItems(): ItemEmbedding[] {
    return [...this.items];
  }
}

// Export singleton instance
export const vectorDB = new VectorDatabase();
