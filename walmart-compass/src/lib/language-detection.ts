/**
 * Simple language detection utility
 * Detects if text is primarily in Spanish or English
 */

export type DetectedLanguage = 'en' | 'es' | 'unknown';

/**
 * Spanish words and patterns that indicate Spanish text
 */
const SPANISH_INDICATORS = [
  // Common Spanish words
  'necesito', 'comprar', 'vegetales', 'frutas', 'verduras', 'carne', 'leche', 'pan',
  'huevos', 'queso', 'yogur', 'arroz', 'pasta', 'agua', 'café', 'té', 'azúcar',
  'sal', 'aceite', 'mantequilla', 'jamón', 'pollo', 'pescado', 'cerdo', 'res',
  'tomate', 'cebolla', 'ajo', 'pimiento', 'lechuga', 'zanahoria', 'patata',
  'manzana', 'plátano', 'naranja', 'limón', 'fresa', 'uva', 'melón', 'sandía',
  'helado', 'dulce', 'galleta', 'pastel', 'chocolate', 'caramelo', 'bebida',
  'jugo', 'refresco', 'cerveza', 'vino', 'licor', 'medicina', 'vitamina',
  'shampoo', 'jabón', 'pasta', 'cepillo', 'papel', 'toalla', 'detergente',
  'limpiador', 'desinfectante', 'perfume', 'crema', 'loción', 'maquillaje',
  'esmalte', 'desodorante', 'protector', 'solar', 'casa', 'cocina', 'baño',
  'dormitorio', 'sala', 'comedor', 'garaje', 'jardín', 'balcón', 'terraza',
  
  // Spanish articles and prepositions
  'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'de', 'del', 'en',
  'con', 'por', 'para', 'sobre', 'bajo', 'entre', 'durante', 'después',
  'antes', 'hasta', 'desde', 'hacia', 'contra', 'sin', 'según', 'mediante',
  
  // Spanish pronouns and verbs
  'yo', 'tú', 'él', 'ella', 'nosotros', 'nosotras', 'vosotros', 'vosotras',
  'ellos', 'ellas', 'me', 'te', 'se', 'nos', 'os', 'les', 'lo', 'la', 'los',
  'las', 'le', 'les', 'mi', 'tu', 'su', 'nuestro', 'nuestra', 'vuestro',
  'vuestra', 'mío', 'mía', 'tuyo', 'tuya', 'suyo', 'suya', 'este', 'esta',
  'estos', 'estas', 'ese', 'esa', 'esos', 'esas', 'aquel', 'aquella',
  'aquellos', 'aquellas', 'que', 'quien', 'quienes', 'cual', 'cuales',
  'donde', 'cuando', 'como', 'porque', 'si', 'aunque', 'mientras', 'mientras',
  'tanto', 'tan', 'muy', 'mucho', 'poco', 'bastante', 'demasiado', 'suficiente',
  'todo', 'toda', 'todos', 'todas', 'alguno', 'alguna', 'algunos', 'algunas',
  'ninguno', 'ninguna', 'ningunos', 'ningunas', 'otro', 'otra', 'otros', 'otras',
  'mismo', 'misma', 'mismos', 'mismas', 'diferente', 'diferentes', 'varios',
  'varias', 'cada', 'ambos', 'ambas', 'cualquier', 'cualesquiera', 'tal',
  'tales', 'semejante', 'semejantes', 'igual', 'iguales', 'parecido',
  'parecidos', 'parecida', 'parecidas', 'similar', 'similares', 'distinto',
  'distinta', 'distintos', 'distintas', 'opuesto', 'opuesta', 'opuestos',
  'opuestas', 'contrario', 'contraria', 'contrarios', 'contrarias',
  
  // Spanish verb conjugations (common patterns)
  'estoy', 'estás', 'está', 'estamos', 'estáis', 'están', 'soy', 'eres', 'es',
  'somos', 'sois', 'son', 'tengo', 'tienes', 'tiene', 'tenemos', 'tenéis',
  'tienen', 'hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen', 'voy',
  'vas', 'va', 'vamos', 'vais', 'van', 'puedo', 'puedes', 'puede', 'podemos',
  'podéis', 'pueden', 'quiero', 'quieres', 'quiere', 'queremos', 'queréis',
  'quieren', 'digo', 'dices', 'dice', 'decimos', 'decís', 'dicen', 'veo',
  'ves', 've', 'vemos', 'veis', 'ven', 'sé', 'sabes', 'sabe', 'sabemos',
  'sabéis', 'saben', 'vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen',
  
  // Spanish question words
  'qué', 'quién', 'quiénes', 'cuál', 'cuáles', 'dónde', 'cuándo', 'cómo',
  'por qué', 'para qué', 'cuánto', 'cuánta', 'cuántos', 'cuántas',
  
  // Spanish conjunctions and connectors
  'y', 'o', 'pero', 'sino', 'aunque', 'mientras', 'mientras', 'que', 'si',
  'como', 'porque', 'ya que', 'puesto que', 'dado que', 'visto que',
  'considerando que', 'teniendo en cuenta que', 'además', 'también',
  'asimismo', 'igualmente', 'del mismo modo', 'de la misma manera',
  'por otro lado', 'por otra parte', 'sin embargo', 'no obstante',
  'con todo', 'a pesar de', 'a pesar de que', 'aunque', 'a pesar de',
  'por consiguiente', 'por tanto', 'por lo tanto', 'así que', 'de modo que',
  'de manera que', 'de forma que', 'por eso', 'por ello', 'por lo cual',
  'por lo que', 'en consecuencia', 'en efecto', 'efectivamente', 'ciertamente',
  'verdaderamente', 'realmente', 'de hecho', 'en realidad', 'actualmente',
  'hoy en día', 'en la actualidad', 'en nuestros días', 'en estos momentos',
  'ahora mismo', 'en este momento', 'en este instante', 'inmediatamente',
  'al instante', 'de inmediato', 'pronto', 'rápidamente', 'velozmente',
  'lentamente', 'despacio', 'poco a poco', 'gradualmente', 'progresivamente',
  'finalmente', 'al final', 'por último', 'en último lugar', 'para terminar',
  'para concluir', 'en resumen', 'en síntesis', 'en pocas palabras',
  'brevemente', 'en resumidas cuentas', 'en definitiva', 'en conclusión',
  'para resumir', 'para sintetizar', 'para finalizar', 'para acabar',
  'para terminar', 'para concluir', 'para acabar', 'para finalizar',
  
  // Spanish punctuation and accents
  'ñ', 'á', 'é', 'í', 'ó', 'ú', 'ü', '¿', '¡'
];

/**
 * English words that indicate English text
 */
const ENGLISH_INDICATORS = [
  // Common English words
  'need', 'buy', 'purchase', 'get', 'find', 'looking', 'want', 'would', 'like',
  'vegetables', 'fruits', 'meat', 'milk', 'bread', 'eggs', 'cheese', 'yogurt',
  'rice', 'pasta', 'water', 'coffee', 'tea', 'sugar', 'salt', 'oil', 'butter',
  'ham', 'chicken', 'fish', 'pork', 'beef', 'tomato', 'onion', 'garlic',
  'pepper', 'lettuce', 'carrot', 'potato', 'apple', 'banana', 'orange',
  'lemon', 'strawberry', 'grape', 'melon', 'watermelon', 'ice', 'cream',
  'sweet', 'cookie', 'cake', 'chocolate', 'candy', 'drink', 'juice', 'soda',
  'beer', 'wine', 'liquor', 'medicine', 'vitamin', 'shampoo', 'soap',
  'toothpaste', 'brush', 'paper', 'towel', 'detergent', 'cleaner',
  'disinfectant', 'perfume', 'cream', 'lotion', 'makeup', 'nail', 'polish',
  'deodorant', 'sunscreen', 'house', 'kitchen', 'bathroom', 'bedroom',
  'living', 'room', 'dining', 'garage', 'garden', 'balcony', 'terrace',
  
  // English articles and prepositions
  'the', 'a', 'an', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from',
  'to', 'up', 'down', 'out', 'off', 'over', 'under', 'through', 'during',
  'before', 'after', 'until', 'since', 'toward', 'against', 'without',
  'according', 'through', 'via', 'per', 'plus', 'minus', 'times', 'divided',
  
  // English pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
  'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours',
  'hers', 'ours', 'theirs', 'this', 'that', 'these', 'those', 'who', 'whom',
  'whose', 'which', 'what', 'where', 'when', 'why', 'how', 'because', 'if',
  'although', 'while', 'as', 'so', 'but', 'and', 'or', 'nor', 'yet', 'for',
  
  // English question words
  'what', 'who', 'whom', 'whose', 'which', 'where', 'when', 'why', 'how',
  'how much', 'how many', 'how long', 'how often', 'how far', 'how old',
  
  // English conjunctions and connectors
  'and', 'or', 'but', 'so', 'yet', 'for', 'nor', 'because', 'since', 'as',
  'although', 'though', 'while', 'whereas', 'if', 'unless', 'until', 'till',
  'after', 'before', 'when', 'whenever', 'where', 'wherever', 'why', 'how',
  'that', 'whether', 'than', 'rather', 'instead', 'besides', 'moreover',
  'furthermore', 'however', 'nevertheless', 'nonetheless', 'therefore',
  'thus', 'hence', 'consequently', 'accordingly', 'meanwhile', 'meanwhile',
  'simultaneously', 'previously', 'subsequently', 'finally', 'lastly',
  'in conclusion', 'in summary', 'in brief', 'in short', 'to sum up',
  'to conclude', 'to summarize', 'in other words', 'that is', 'namely',
  'for example', 'for instance', 'such as', 'like', 'unlike', 'similar to',
  'different from', 'compared to', 'in contrast', 'on the other hand',
  'on the contrary', 'in fact', 'indeed', 'actually', 'really', 'truly',
  'certainly', 'definitely', 'absolutely', 'exactly', 'precisely', 'clearly',
  'obviously', 'apparently', 'evidently', 'undoubtedly', 'surely', 'naturally',
  'of course', 'indeed', 'certainly', 'definitely', 'absolutely', 'exactly',
  'precisely', 'clearly', 'obviously', 'apparently', 'evidently', 'undoubtedly',
  'surely', 'naturally', 'of course'
];

/**
 * Detect the language of the input text
 * @param text - The text to analyze
 * @returns The detected language
 */
export function detectLanguage(text: string): DetectedLanguage {
  if (!text || text.trim().length === 0) {
    return 'unknown';
  }

  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);
  
  let spanishScore = 0;
  let englishScore = 0;
  
  // Check for Spanish indicators
  for (const word of words) {
    if (SPANISH_INDICATORS.includes(word)) {
      spanishScore++;
    }
  }
  
  // Check for English indicators
  for (const word of words) {
    if (ENGLISH_INDICATORS.includes(word)) {
      englishScore++;
    }
  }
  
  // Check for Spanish-specific characters
  const spanishChars = /[ñáéíóúü¿¡]/;
  if (spanishChars.test(normalizedText)) {
    spanishScore += 2; // Boost Spanish score for accented characters
  }
  
  // If no clear indicators, return unknown
  if (spanishScore === 0 && englishScore === 0) {
    return 'unknown';
  }
  
  // Return the language with higher score
  if (spanishScore > englishScore) {
    return 'es';
  } else if (englishScore > spanishScore) {
    return 'en';
  } else {
    // If scores are equal, check for Spanish characters as tiebreaker
    return spanishChars.test(normalizedText) ? 'es' : 'en';
  }
}

/**
 * Get a confidence score for the language detection
 * @param text - The text to analyze
 * @returns A confidence score between 0 and 1
 */
export function getLanguageConfidence(text: string): number {
  if (!text || text.trim().length === 0) {
    return 0;
  }

  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);
  
  let spanishScore = 0;
  let englishScore = 0;
  
  // Check for Spanish indicators
  for (const word of words) {
    if (SPANISH_INDICATORS.includes(word)) {
      spanishScore++;
    }
  }
  
  // Check for English indicators
  for (const word of words) {
    if (ENGLISH_INDICATORS.includes(word)) {
      englishScore++;
    }
  }
  
  // Check for Spanish-specific characters
  const spanishChars = /[ñáéíóúü¿¡]/;
  if (spanishChars.test(normalizedText)) {
    spanishScore += 2;
  }
  
  const totalScore = spanishScore + englishScore;
  if (totalScore === 0) {
    return 0;
  }
  
  const maxScore = Math.max(spanishScore, englishScore);
  return maxScore / totalScore;
}

/**
 * Check if the detected language is different from the current language
 * @param text - The text to analyze
 * @param currentLanguage - The current language setting
 * @returns True if the detected language is different
 */
export function shouldSwitchLanguage(text: string, currentLanguage: 'en' | 'es'): boolean {
  const detected = detectLanguage(text);
  const confidence = getLanguageConfidence(text);
  
  // Only switch if confidence is high enough and language is different
  return confidence > 0.6 && detected !== 'unknown' && detected !== currentLanguage;
}
