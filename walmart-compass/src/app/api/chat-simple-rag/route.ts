import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { ragSystem, RAGContext } from '@/lib/rag';

// Function to fetch real store items from database
async function getStoreInventory() {
  try {
    const supabase = await createClient();
    const { data: items, error } = await supabase
      .from('store_items')
      .select('name, category')
      .order('category, name');

    if (error) {
      console.error('Error fetching store items:', error);
      return null;
    }

    // Group items by category
    const inventoryByCategory: { [key: string]: string[] } = {};
    items?.forEach(item => {
      if (!inventoryByCategory[item.category]) {
        inventoryByCategory[item.category] = [];
      }
      inventoryByCategory[item.category].push(item.name);
    });

    // Format for the prompt
    const inventoryText = Object.entries(inventoryByCategory)
      .map(([category, items]) => `- ${category.charAt(0).toUpperCase() + category.slice(1)}: ${items.join(', ')}`)
      .join('\n');

    return inventoryText;
  } catch (error) {
    console.error('Error in getStoreInventory:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      message, 
      userContext, 
      context,
      language = 'en',
      detectedLanguage = 'en'
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


    // Get user context from database if available
    let preferences = userContext?.preferences || {
      dietaryRestrictions: [],
      brandPreferences: [],
      organicPreference: false
    };

    let shoppingHistory = userContext?.shoppingHistory || [];

    // Try to get user context from database if user is authenticated
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user profile with preferences
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();

        if (profile?.preferences) {
          preferences = {
            dietaryRestrictions: profile.preferences.dietaryRestrictions || [],
            brandPreferences: profile.preferences.brandPreferences || [],
            organicPreference: profile.preferences.organicPreference || false
          };
        }

        // Get recent shopping history
        const { data: historyData } = await supabase
          .from('shopping_history')
          .select('items, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (historyData) {
          shoppingHistory = historyData.map(entry => ({
            items: entry.items.map((item: { name: string }) => item.name),
            date: entry.created_at,
            context: 'Completed shopping trip'
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching user context from database:', error);
      // Fall back to provided userContext
    }

    // Initialize RAG system with user context
    let ragContext: RAGContext | null = null;
    try {
      await ragSystem.initialize({
        preferences,
        shoppingHistory,
        currentSession: {
          items: [],
          context: context || message
        }
      });

      // Build RAG context for enhanced recommendations
      ragContext = await ragSystem.buildRAGContext(message, context);
    } catch (error) {
      console.error('RAG system initialization failed:', error);
      // Continue without RAG context
    }

    // Determine the response language based on detected language or current language setting
    const responseLanguage = detectedLanguage !== 'en' ? detectedLanguage : language;
    const isSpanish = responseLanguage === 'es';
    
    // Fetch real store inventory from database
    const storeInventory = await getStoreInventory();
    const inventoryText = storeInventory || `- Dairy: Organic Whole Milk, 2% Reduced Fat Milk, Free Range Eggs, Sharp Cheddar Cheese, Greek Yogurt
- Bakery: Whole Wheat Bread, White Sandwich Bread, Everything Bagels
- Produce: Organic Bananas, Red Delicious Apples, Romaine Lettuce, Roma Tomatoes
- Meat: Boneless Chicken Breast, Ground Beef, Atlantic Salmon Fillet
- Frozen: Vanilla Ice Cream, Mixed Frozen Vegetables, Pepperoni Pizza
- Pantry: Spaghetti Pasta, Basmati Rice, Honey Nut Cheerios, Chocolate Chip Cookies, Crushed Tomatoes, Extra Virgin Olive Oil
- Beverages: Spring Water (24 pack), Coca-Cola (12 pack), Ground Coffee
- Health: Moisturizing Shampoo, Fluoride Toothpaste, Daily Multivitamin
- Household: Liquid Laundry Detergent, Paper Towels, Toilet Paper, Dish Soap`;
    
    // Create enhanced system prompt with RAG context and language awareness
    const ragContextText = ragContext ? `
CONTEXTO RAG (Recomendaciones Inteligentes):
- Artículos Relevantes Encontrados: ${ragContext.relevantItems.map(item => `${item.item.name} (${item.item.category})`).join(', ')}
- Recomendaciones Contextuales: ${ragContext.recommendations.join(', ')}
- Similitud de Búsqueda: ${ragContext.relevantItems.length > 0 ? 'Encontrados artículos semánticamente similares' : 'Búsqueda semántica no disponible'}
` : '';

    const systemPrompt = isSpanish 
      ? `Eres Sam, un asistente de compras de Walmart amigable y útil con capacidades avanzadas de IA. Tienes acceso a las preferencias del usuario, su historial de compras, y un sistema RAG (Retrieval-Augmented Generation) para recomendaciones inteligentes.

CONTEXTO DEL USUARIO:
- Restricciones Dietéticas: ${preferences.dietaryRestrictions.join(', ') || 'Ninguna'}
- Preferencias de Marca: ${preferences.brandPreferences.join(', ') || 'Ninguna'}
- Preferencia Orgánica: ${preferences.organicPreference ? 'Sí' : 'No'}
- Contexto Actual: ${context || message}

HISTORIAL DE COMPRAS (Últimas 3 sesiones):
${shoppingHistory.slice(-3).map((session: { date?: string; items?: string[]; context?: string }) => 
  `- ${session.date?.split('T')[0] || 'Reciente'}: ${session.items?.join(', ') || 'Sin artículos'} ${session.context ? `(${session.context})` : ''}`
).join('\n') || 'No hay historial de compras disponible'}
${ragContextText}
INVENTARIO DE LA TIENDA (Artículos Disponibles):
${inventoryText}

TUS CAPACIDADES MEJORADAS:
1. Usa las restricciones dietéticas del usuario para filtrar recomendaciones
2. Prioriza las marcas preferidas al sugerir artículos
3. Considera opciones orgánicas cuando el usuario prefiere orgánico
4. Usa el historial de compras para sugerir artículos comprados frecuentemente
5. Proporciona recomendaciones conscientes del contexto basadas en la situación
6. Sé útil y natural en tus respuestas
7. **IMPORTANTE: Responde SIEMPRE en español, sin importar el idioma de la pregunta**

FORMATO DE RESPUESTA:
Primero, da una respuesta natural y útil (1-2 oraciones) que reconozca el contexto y preferencias del usuario. Luego, en una nueva línea, devuelve SOLO el documento YAML sin marcadores de código:

items:
  - name: <nombre exacto del artículo del inventario>
  - name: <nombre exacto del artículo del inventario>
  - name: <nombre exacto del artículo del inventario>

EJEMPLO:
Usuario: "Estoy teniendo una fiesta este fin de semana"
Respuesta: "¡Eso suena como que va a ser increíble! Basándome en tus preferencias y lo que es popular para fiestas, agregaré algunos excelentes bocadillos y bebidas a tu lista.

items:
  - name: Chocolate Chip Cookies
  - name: Coca-Cola (12 pack)
  - name: Spring Water (24 pack)
  - name: Sharp Cheddar Cheese
  - name: Organic Bananas
  - name: Paper Towels"

Recuerda: ¡Sé natural, útil y usa los nombres exactos de los artículos de nuestro inventario! Considera las restricciones dietéticas y preferencias del usuario en tus recomendaciones.`
      : `You are Sam, a friendly and helpful Walmart shopping assistant with advanced AI capabilities. You have access to the user's preferences, shopping history, and a RAG (Retrieval-Augmented Generation) system for intelligent recommendations.

USER CONTEXT:
- Dietary Restrictions: ${preferences.dietaryRestrictions.join(', ') || 'None'}
- Brand Preferences: ${preferences.brandPreferences.join(', ') || 'None'}
- Organic Preference: ${preferences.organicPreference ? 'Yes' : 'No'}
- Current Context: ${context || message}

SHOPPING HISTORY (Last 3 sessions):
${shoppingHistory.slice(-3).map((session: { date?: string; items?: string[]; context?: string }) => 
  `- ${session.date?.split('T')[0] || 'Recent'}: ${session.items?.join(', ') || 'No items'} ${session.context ? `(${session.context})` : ''}`
).join('\n') || 'No shopping history available'}
${ragContextText}
STORE INVENTORY (Available Items):
${inventoryText}

YOUR ENHANCED CAPABILITIES:
1. Use the user's dietary restrictions to filter recommendations
2. Prioritize preferred brands when suggesting items
3. Consider organic options when user prefers organic
4. Use shopping history to suggest frequently bought items
5. Provide context-aware recommendations based on the situation
6. Be helpful and natural in your responses
7. **IMPORTANT: Always respond in English, regardless of the question language**

RESPONSE FORMAT:
First, give a natural, helpful response (1-2 sentences) that acknowledges the user's context and preferences. Then, on a new line, return ONLY the YAML document without code markers:

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
      ragContext: ragContext ? {
        relevantItems: ragContext.relevantItems.map(item => ({
          name: item.item.name,
          category: item.item.category,
          similarity: item.similarity,
          coordinates: item.item.coordinates
        })),
        recommendations: ragContext.recommendations,
        userPreferences: ragContext.userPreferences,
        currentContext: ragContext.currentContext
      } : {
        relevantItems: [],
        recommendations: [],
        userPreferences: preferences,
        currentContext: context || message
      }
    });

  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
