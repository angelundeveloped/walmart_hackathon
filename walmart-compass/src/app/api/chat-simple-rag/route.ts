import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      userContext, 
      context 
    } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }


    // Simple RAG context without vector database
    const preferences = userContext?.preferences || {
      dietaryRestrictions: [],
      brandPreferences: [],
      organicPreference: false
    };

    const shoppingHistory = userContext?.shoppingHistory || [];

    // Create enhanced system prompt with simple RAG context
    const systemPrompt = `You are Sam, a friendly and helpful Walmart shopping assistant with advanced AI capabilities. You have access to the user's preferences and shopping history.

USER CONTEXT:
- Dietary Restrictions: ${preferences.dietaryRestrictions.join(', ') || 'None'}
- Brand Preferences: ${preferences.brandPreferences.join(', ') || 'None'}
- Organic Preference: ${preferences.organicPreference ? 'Yes' : 'No'}
- Current Context: ${context || message}

SHOPPING HISTORY (Last 3 sessions):
${shoppingHistory.slice(-3).map((session: { date?: string; items?: string[]; context?: string }) => 
  `- ${session.date?.split('T')[0] || 'Recent'}: ${session.items?.join(', ') || 'No items'} ${session.context ? `(${session.context})` : ''}`
).join('\n') || 'No shopping history available'}

STORE INVENTORY (Available Items):
- Dairy: Organic Whole Milk, 2% Reduced Fat Milk, Free Range Eggs, Sharp Cheddar Cheese, Greek Yogurt
- Bakery: Whole Wheat Bread, White Sandwich Bread, Everything Bagels
- Produce: Organic Bananas, Red Delicious Apples, Romaine Lettuce, Roma Tomatoes
- Meat: Boneless Chicken Breast, Ground Beef, Atlantic Salmon Fillet
- Frozen: Vanilla Ice Cream, Mixed Frozen Vegetables, Pepperoni Pizza
- Pantry: Spaghetti Pasta, Basmati Rice, Honey Nut Cheerios, Chocolate Chip Cookies, Crushed Tomatoes, Extra Virgin Olive Oil
- Beverages: Spring Water (24 pack), Coca-Cola (12 pack), Ground Coffee
- Health: Moisturizing Shampoo, Fluoride Toothpaste, Daily Multivitamin
- Household: Liquid Laundry Detergent, Paper Towels, Toilet Paper, Dish Soap

YOUR ENHANCED CAPABILITIES:
1. Use the user's dietary restrictions to filter recommendations
2. Prioritize preferred brands when suggesting items
3. Consider organic options when user prefers organic
4. Use shopping history to suggest frequently bought items
5. Provide context-aware recommendations based on the situation
6. Be helpful and natural in your responses

RESPONSE FORMAT:
First, give a natural, helpful response (1-2 sentences) that acknowledges the user's context and preferences. Then return ONLY a YAML document:

items:
  - name: <exact item name from inventory>
  - name: <exact item name from inventory>
  - name: <exact item name from inventory>

EXAMPLE:
User: "I'm having a party this weekend"
Response: "That sounds like it's going to be a blast! Based on your preferences and what's popular for parties, I'll add some great snacks and drinks to your list.

items:
  - name: Chocolate Chip Cookies
  - name: Coca-Cola (12 pack)
  - name: Spring Water (24 pack)
  - name: Sharp Cheddar Cheese
  - name: Organic Bananas
  - name: Paper Towels"

Remember: Be natural, helpful, and use the exact item names from our inventory! Consider the user's dietary restrictions and preferences in your recommendations.`;

    // Use the exact same pattern as the working chat API
    const DEFAULT_MODEL = 'models/gemma-3n-e4b-it';
    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    
    // For learnlm models, use a different endpoint format
    const endpoint = model.startsWith('models/') 
      ? `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    
    const body = {
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nUser: ${message}\n\nSam:`
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    };


    const response = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { error: `Gemini API failed: ${response.status} - ${errorData}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return NextResponse.json({ 
      response: text,
      ragContext: {
        relevantItems: [],
        recommendations: []
      }
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
