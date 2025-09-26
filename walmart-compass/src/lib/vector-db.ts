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

  // Initialize the vector database with store items
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load store layout data
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
      
    } catch {
      // Vector database initialization failed
    }
  }

  // Search for similar items
  async search(query: string, limit: number = 5): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const queryVector = await this.textToVector(query);
    const results: SearchResult[] = [];
    
    for (const item of this.items) {
      const similarity = this.cosineSimilarity(queryVector, item.embedding);
      if (similarity > 0.1) { // Minimum similarity threshold
        results.push({
          item,
          similarity,
          distance: 1 - similarity // Convert similarity to distance
        });
      }
    }
    
    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);
    
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
