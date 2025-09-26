// Gemini Embeddings API utility
// Using Google's Gemini API for generating embeddings

export interface EmbeddingResponse {
  embedding: {
    values: number[];
  };
}

export async function createEmbedding(text: string): Promise<number[]> {
  try {
    // Use absolute URL for server-side requests
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Error creating embedding:', error);
    // Fallback to simple bag-of-words embedding
    return createFallbackEmbedding(text);
  }
}

// Fallback embedding function (simple bag-of-words)
function createFallbackEmbedding(text: string): number[] {
  const vocabulary = [
    'milk', 'bread', 'eggs', 'cheese', 'yogurt', 'chicken', 'beef', 'salmon',
    'bananas', 'apples', 'lettuce', 'tomatoes', 'ice cream', 'vegetables', 'pizza',
    'pasta', 'rice', 'cereal', 'cookies', 'tomatoes', 'olive oil', 'water', 'soda',
    'coffee', 'shampoo', 'toothpaste', 'multivitamin', 'detergent', 'paper towels',
    'toilet paper', 'dish soap', 'organic', 'whole wheat', 'free range', 'sharp',
    'greek', 'everything', 'red delicious', 'romaine', 'roma', 'boneless', 'ground',
    'atlantic', 'vanilla', 'mixed', 'pepperoni', 'spaghetti', 'basmati', 'honey nut',
    'chocolate chip', 'crushed', 'extra virgin', 'spring', 'coca-cola', 'dark roast',
    'moisturizing', 'fluoride', 'daily', 'liquid', 'original', 'pack', 'lb', 'qt', 'oz',
    'party', 'celebration', 'dinner', 'cooking', 'breakfast', 'workout', 'fitness',
    'healthy eating', 'baby', 'child', 'cleaning', 'office', 'work', 'travel', 'trip',
    'emergency', 'storage', 'snacks', 'candy', 'beverages', 'health', 'beauty', 'household',
    'electronics', 'toys', 'games'
  ];

  const lowerText = text.toLowerCase();
  const vector = new Array(vocabulary.length).fill(0);
  
  vocabulary.forEach((word, index) => {
    if (lowerText.includes(word)) {
      vector[index] = 1;
    }
  });
  
  return normalizeVector(vector);
}

function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}
