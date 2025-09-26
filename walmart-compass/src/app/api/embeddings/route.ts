import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Use a completely free embedding service - no API key required
    const response = await fetch(
      'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: text,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Free embedding API error:', errorData);
      
      // Fallback to simple embedding if API fails
      console.log('Falling back to simple embedding generation');
      const fallbackEmbedding = generateSimpleEmbedding(text);
      return NextResponse.json({ embedding: fallbackEmbedding });
    }

    const data = await response.json();
    
    // The API returns the embedding directly as an array
    if (!Array.isArray(data)) {
      console.error('Unexpected response format from embedding API:', data);
      const fallbackEmbedding = generateSimpleEmbedding(text);
      return NextResponse.json({ embedding: fallbackEmbedding });
    }

    console.log(`Generated free embedding: ${data.length} dimensions`);
    return NextResponse.json({ embedding: data });
    
  } catch (error) {
    console.error('Embedding generation error:', error);
    
    // Fallback to simple embedding on any error
    const { text } = await request.json();
    const fallbackEmbedding = generateSimpleEmbedding(text);
    return NextResponse.json({ embedding: fallbackEmbedding });
  }
}

// Simple fallback embedding generator
function generateSimpleEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const vocabulary = [
    'healthy', 'snacks', 'workout', 'breakfast', 'lunch', 'dinner', 'organic', 'fresh',
    'milk', 'bread', 'eggs', 'cheese', 'yogurt', 'bananas', 'apples', 'water',
    'dairy', 'bakery', 'produce', 'pantry', 'beverages', 'snacks', 'frozen',
    'protein', 'vitamins', 'nutrition', 'energy', 'fitness', 'exercise', 'food',
    'drink', 'eat', 'buy', 'shop', 'store', 'walmart', 'grocery', 'items'
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
