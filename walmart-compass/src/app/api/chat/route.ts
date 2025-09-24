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

    const systemPrompt = `You are a helpful shopping assistant. Parse the user's request and extract a concise list of product names.
Return ONLY a YAML document with this structure and nothing else:

items:
  - name: <canonical product name>

Guidelines:
- Keep names short and generic when possible (e.g., "milk", "bread", "eggs").
- If a quantity is specified, do not include it in the name.
- Ignore chit-chat or unrelated text.
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


