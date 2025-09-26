// RAG (Retrieval-Augmented Generation) System
// Combines user context, preferences, and semantic search for intelligent responses

import { vectorDB, SearchResult } from './vector-db';

export interface UserContext {
  preferences: {
    dietaryRestrictions: string[];
    brandPreferences: string[];
    organicPreference: boolean;
  };
  shoppingHistory: Array<{
    items: string[];
    date: string;
    context?: string; // "party", "dinner", "breakfast", etc.
  }>;
  currentSession: {
    items: string[];
    context?: string;
  };
}

export interface RAGContext {
  relevantItems: SearchResult[];
  userPreferences: UserContext['preferences'];
  shoppingHistory: UserContext['shoppingHistory'];
  currentContext: string;
  recommendations: string[];
}

export class RAGSystem {
  private userContext: UserContext | null = null;
  private supabase: unknown = null;

  // Create fallback embedding when Gemini API is unavailable
  private createFallbackEmbedding(text: string): number[] {
    const words = text.toLowerCase().split(/\s+/);
    const vocabulary = [
      'healthy', 'snacks', 'workout', 'breakfast', 'lunch', 'dinner', 'organic', 'fresh',
      'milk', 'bread', 'eggs', 'cheese', 'yogurt', 'bananas', 'apples', 'water',
      'dairy', 'bakery', 'produce', 'pantry', 'beverages', 'snacks', 'frozen',
      'protein', 'vitamins', 'nutrition', 'energy', 'fitness', 'exercise'
    ];
    
    const embedding = new Array(384).fill(0);
    
    words.forEach(word => {
      const index = vocabulary.indexOf(word);
      if (index !== -1) {
        // Map vocabulary word to embedding dimensions
        const embeddingIndex = index % 384;
        embedding[embeddingIndex] += 1;
      }
    });
    
    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      return embedding.map(val => val / magnitude);
    }
    
    return embedding;
  }

  // Initialize RAG with user context
  async initialize(userContext: UserContext): Promise<void> {
    this.userContext = userContext;
    try {
      // Initialize Supabase client for semantic search
      if (typeof window === 'undefined') {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (supabaseUrl && supabaseKey) {
          this.supabase = createClient(supabaseUrl, supabaseKey);
          console.log('RAG system initialized with Supabase client');
        }
      }
      
      await vectorDB.initialize();
      console.log('RAG system initialized with vector DB');
        } catch (error) {
          console.error('RAG system initialization failed:', error);
          // Continue without vector DB - we can still use basic context
        }
  }

  // Supabase native semantic search
  async searchWithSupabase(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!this.supabase) {
      throw new Error('Supabase client not initialized');
    }

    try {
      // Use fallback embedding directly for now (it's working well)
      const queryEmbedding = this.createFallbackEmbedding(query);
      console.log(`Using fallback embedding for query: "${query}" (${queryEmbedding.length} dimensions)`);

      // Use Supabase RPC function for semantic search
      const { data: results, error } = await this.supabase.rpc('match_store_items', {
        query_embedding: queryEmbedding,
        match_threshold: 0.1,
        match_count: limit
      });

      if (error) {
        throw new Error(`Supabase RPC error: ${error.message}`);
      }

      // Convert to SearchResult format
      return results.map((item: unknown) => ({
        item: {
          id: item.id,
          name: item.name,
          description: item.description || `${item.name} ${item.category}`,
          category: item.category,
          embedding: [], // Not needed for results
          coordinates: item.coordinates,
          price: item.price || 0
        },
        similarity: item.similarity,
        distance: 1 - item.similarity
      }));

    } catch (error) {
      console.error('Supabase semantic search error:', error);
      throw error;
    }
  }

  // Enhanced semantic search with user context
  async searchWithContext(query: string, limit: number = 10): Promise<SearchResult[]> {
    if (!this.userContext) {
      throw new Error('RAG system not initialized');
    }

    console.log(`RAG searchWithContext called with query: "${query}"`);

    // Get base semantic search results using vector DB (Supabase has embedding format issues)
    let baseResults: SearchResult[] = [];
    try {
      baseResults = await vectorDB.search(query, limit * 2);
      console.log(`Vector DB search returned ${baseResults.length} results`);
        } catch (error) {
          console.error('Vector DB search failed:', error);
          // Return empty results if vector search fails
        }

    // Apply user preference filtering and scoring
    const scoredResults = baseResults.map(result => {
      let score = result.similarity;
      
      // Boost organic items if user prefers organic
      if (this.userContext!.preferences.organicPreference && 
          result.item.name.toLowerCase().includes('organic')) {
        score += 0.2;
      }

      // Boost preferred brands
      if (this.userContext!.preferences.brandPreferences.some(brand => 
          result.item.name.toLowerCase().includes(brand.toLowerCase()))) {
        score += 0.15;
      }

      // Filter out items that violate dietary restrictions
      const itemText = `${result.item.name} ${result.item.description}`.toLowerCase();
      const hasRestriction = this.userContext!.preferences.dietaryRestrictions.some(restriction => {
        const restrictionLower = restriction.toLowerCase();
        if (restrictionLower.includes('vegetarian') && 
            (itemText.includes('meat') || itemText.includes('chicken') || itemText.includes('beef'))) {
          return true;
        }
        if (restrictionLower.includes('vegan') && 
            (itemText.includes('dairy') || itemText.includes('milk') || itemText.includes('cheese') || itemText.includes('eggs'))) {
          return true;
        }
        if (restrictionLower.includes('gluten-free') && 
            (itemText.includes('wheat') || itemText.includes('bread') || itemText.includes('pasta'))) {
          return true;
        }
        return false;
      });

      if (hasRestriction) {
        score = 0; // Effectively filter out
      }

      return { ...result, similarity: score };
    }).filter(result => result.similarity > 0);

    // Sort by new score and return top results
    return scoredResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Generate contextual recommendations based on user history and preferences
  async generateRecommendations(context: string): Promise<string[]> {
    if (!this.userContext) {
      throw new Error('RAG system not initialized');
    }

    const recommendations: string[] = [];
    
    // Context-based recommendations
    switch (context.toLowerCase()) {
      case 'party':
      case 'celebration':
        recommendations.push('Chocolate Chip Cookies', 'Coca-Cola (12 pack)', 'Spring Water (24 pack)');
        break;
      case 'dinner':
      case 'cooking':
        recommendations.push('Boneless Chicken Breast', 'Roma Tomatoes', 'Extra Virgin Olive Oil');
        break;
      case 'breakfast':
        recommendations.push('Organic Whole Milk', 'Whole Wheat Bread', 'Free Range Eggs');
        break;
      case 'workout':
      case 'fitness':
        recommendations.push('Greek Yogurt', 'Organic Bananas', 'Spring Water (24 pack)');
        break;
      case 'healthy':
      case 'health':
        recommendations.push('Organic Bananas', 'Romaine Lettuce', 'Greek Yogurt');
        break;
    }

    // Add items from shopping history (frequently bought)
    const frequentItems = this.getFrequentItems();
    recommendations.push(...frequentItems.slice(0, 3));

    // Filter recommendations based on preferences
    return this.filterRecommendations(recommendations);
  }

  // Get frequently bought items from history
  private getFrequentItems(): string[] {
    if (!this.userContext) return [];

    const itemCounts: { [key: string]: number } = {};
    
    this.userContext.shoppingHistory.forEach(session => {
      session.items.forEach(item => {
        itemCounts[item] = (itemCounts[item] || 0) + 1;
      });
    });

    return Object.entries(itemCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([item]) => item);
  }

  // Filter recommendations based on dietary restrictions and preferences
  private filterRecommendations(recommendations: string[]): string[] {
    if (!this.userContext) return recommendations;

    return recommendations.filter(item => {
      const itemLower = item.toLowerCase();
      
      // Check dietary restrictions
      for (const restriction of this.userContext!.preferences.dietaryRestrictions) {
        const restrictionLower = restriction.toLowerCase();
        
        if (restrictionLower.includes('vegetarian') && 
            (itemLower.includes('meat') || itemLower.includes('chicken') || itemLower.includes('beef'))) {
          return false;
        }
        if (restrictionLower.includes('vegan') && 
            (itemLower.includes('dairy') || itemLower.includes('milk') || itemLower.includes('cheese') || itemLower.includes('eggs'))) {
          return false;
        }
        if (restrictionLower.includes('gluten-free') && 
            (itemLower.includes('wheat') || itemLower.includes('bread') || itemLower.includes('pasta'))) {
          return false;
        }
      }
      
      return true;
    });
  }

  // Build comprehensive RAG context for AI
  async buildRAGContext(userQuery: string, context?: string): Promise<RAGContext> {
    if (!this.userContext) {
      throw new Error('RAG system not initialized');
    }

    // Search for relevant items
    const relevantItems = await this.searchWithContext(userQuery, 8);
    
    // Generate contextual recommendations
    const recommendations = await this.generateRecommendations(context || userQuery);

    return {
      relevantItems,
      userPreferences: this.userContext.preferences,
      shoppingHistory: this.userContext.shoppingHistory,
      currentContext: context || userQuery,
      recommendations
    };
  }

  // Update user context with new shopping session
  updateUserContext(newItems: string[], context?: string): void {
    if (!this.userContext) return;

    // Add to current session
    this.userContext.currentSession.items.push(...newItems);
    if (context) {
      this.userContext.currentSession.context = context;
    }

    // Add to shopping history
    this.userContext.shoppingHistory.push({
      items: [...newItems],
      date: new Date().toISOString(),
      context
    });

    // Keep only last 10 shopping sessions
    if (this.userContext.shoppingHistory.length > 10) {
      this.userContext.shoppingHistory = this.userContext.shoppingHistory.slice(-10);
    }
  }
}

// Global RAG instance
export const ragSystem = new RAGSystem();
