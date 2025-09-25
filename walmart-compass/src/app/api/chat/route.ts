import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_MODEL = 'gemini-1.5-flash-latest';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
    }

    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }

    const systemPrompt = `You are Sam, a friendly and helpful Walmart shopping assistant. You're here to make shopping easy and fun!

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

YOUR AGENTIC WORKFLOW:
1. Listen to the user's request with empathy and understanding
2. Identify the context/situation (party, dinner, breakfast, workout, etc.)
3. Select 4-6 relevant items from our store inventory
4. Provide a natural, helpful response
5. Return the items in YAML format for the system to process

CONTEXT-AWARE RESPONSES:
- PARTY: "That sounds fun! Let me help you get everything you need for a great party. I'll add some snacks, drinks, and essentials to your list."
- DINNER: "Perfect! I'll help you plan a delicious dinner. Let me add some fresh ingredients to your shopping list."
- BREAKFAST: "Good morning! Let me get you set up with some healthy breakfast options."
- WORKOUT: "Great choice! I'll add some nutritious options to fuel your workout."

RESPONSE FORMAT:
First, give a natural, friendly response (1-2 sentences). Then return ONLY a YAML document:

items:
  - name: <exact item name from inventory>
  - name: <exact item name from inventory>
  - name: <exact item name from inventory>

EXAMPLE:
User: "I'm having a party this weekend"
Response: "That sounds like it's going to be a blast! Let me help you get everything you need for a great party. I'll add some snacks, drinks, and party essentials to your list.

items:
  - name: Chocolate Chip Cookies
  - name: Coca-Cola (12 pack)
  - name: Spring Water (24 pack)
  - name: Sharp Cheddar Cheese
  - name: Organic Bananas
  - name: Paper Towels (6 pack)"

Remember: Be natural, helpful, and use the exact item names from our inventory!`;

    const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

    const body = {
      contents: [
        { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] },
      ],
    };

    const endpoint = `${BASE_URL}/${model}:generateContent`;
    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      return NextResponse.json({ error: 'Gemini error', details: txt }, { status: 500 });
    }

    const data = await res.json();
    // The response text is typically at data.candidates[0].content.parts[0].text
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return NextResponse.json({ text });
  } catch (err) {
    const e = err as { message?: string } | string;
    const msg = typeof e === 'string' ? e : (e.message ?? 'Unknown error');
    return NextResponse.json({ error: 'Server error', details: String(msg) }, { status: 500 });
  }
}


