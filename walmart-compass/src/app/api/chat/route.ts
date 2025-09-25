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

    const systemPrompt = `You are an intelligent Walmart shopping assistant with advanced context awareness. 
Your job is to understand the user's intent and suggest relevant items based on context, events, and situations.

CONTEXT-AWARE SUGGESTIONS:
When users mention events or situations, suggest relevant items:

PARTY/CELEBRATION: chips, dip, soda, beer, wine, paper plates, cups, napkins, decorations, snacks, ice, mixers
DINNER/COOKING: meat, vegetables, sides, dessert, wine, cooking oil, spices, rice, pasta, sauce
BREAKFAST: eggs, cereal, milk, bread, fruit, coffee, tea, yogurt, oatmeal, juice
WORKOUT/FITNESS: protein bars, water, sports drinks, healthy snacks, energy drinks, supplements
HEALTHY EATING: organic produce, lean meat, whole grains, nuts, seeds, healthy snacks
BABY/CHILD: diapers, formula, baby food, wipes, toys, snacks, juice boxes
CLEANING: detergent, cleaning supplies, paper towels, trash bags, disinfectant
OFFICE/WORK: coffee, snacks, office supplies, energy drinks, lunch items
TRAVEL/TRIP: snacks, drinks, travel-size items, batteries, chargers
EMERGENCY/STORAGE: canned goods, water, batteries, flashlights, first aid

INTELLIGENT MATCHING:
- If user says "something for breakfast" → suggest eggs, cereal, milk, bread, fruit
- If user says "party this weekend" → suggest party items (chips, drinks, decorations)
- If user says "healthy snacks" → suggest nuts, fruit, yogurt, protein bars
- If user says "cooking dinner" → suggest meat, vegetables, sides, wine
- If user says "workout" → suggest protein bars, water, sports drinks

Return ONLY a YAML document with this structure:

items:
  - name: <canonical product name>
  - name: <canonical product name>
  - name: <canonical product name>

Guidelines:
- Suggest 3-8 relevant items based on context
- Use generic names (e.g., "milk", "bread", "chips")
- Include variety in suggestions
- Be helpful and comprehensive
- Consider the situation/event mentioned
`;

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


