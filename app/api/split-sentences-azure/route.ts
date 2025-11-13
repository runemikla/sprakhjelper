import { NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const splitSentencesSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  morsmaal: z.string().min(1, 'Mother language is required'),
});

// Azure OpenAI configuration
const AZURE_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT!;
const AZURE_API_KEY = process.env.AZURE_OPENAI_API_KEY!;
const AZURE_DEPLOYMENT_NAME = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
const AZURE_API_VERSION = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';

export async function POST(req: Request) {
  try {
    // Validate Azure configuration
    if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
      throw new Error('Azure OpenAI configuration missing. Please set AZURE_OPENAI_ENDPOINT and AZURE_OPENAI_API_KEY in .env');
    }

    // Parse and validate input
    const body = await req.json();
    const { text, morsmaal } = splitSentencesSchema.parse(body);

    console.log('Splitting sentences for language:', morsmaal);
    console.log('Using Azure OpenAI endpoint:', AZURE_ENDPOINT);

    // Build system prompt for sentence splitting
    const systemPrompt = `Du er en hjelpsom skriveassistent som hjelper brukeren med å dele tekst i setninger og korrigere tegnsetting.

# Instruksjoner
1. Del teksten inn i separate setninger. 
2. Legg til punktum, spørsmålstegn eller utropstegn på slutten av hver setning hvis det mangler. 
3. Start hver setning med stor bokstav. 
4. IKKE endre noen ord, bøyninger eller grammatikk.

Svar med kun én JSON-struktur på toppnivå – et array hvor hvert objekt representerer én setning:
- "original": Den opprinnelige setningen som brukeren skrev (med korrigert tegnsetting og stor bokstav)
- "corrected": Identisk med "original" (samme verdi)

###OBS!
Returner kun et JSON-objekt (gyldig JSON, uten kodeblokker eller ekstra tekst).

Eksempel:
Input: "Vi danset og holdt på hele natta, jeg tror aldri jeg har hatt det så gøy. Klokka ble alt for mye og jeg glemte helt å dra hjem i tide haha."
Output:
[
  {"original": "Vi danset og holdt på hele natta.", "corrected": "Vi danset og holdt på hele natta."},
  {"original": "Jeg tror aldri jeg har hatt det så gøy.", "corrected": "Jeg tror aldri jeg har hatt det så gøy."},
  {"original": "Klokka ble alt for mye og jeg glemte helt å dra hjem i tide haha.", "corrected": "Klokka ble alt for mye og jeg glemte helt å dra hjem i tide haha."}
]`;

    // Build Azure OpenAI URL
    const azureUrl = `${AZURE_ENDPOINT}/openai/deployments/${AZURE_DEPLOYMENT_NAME}/chat/completions?api-version=${AZURE_API_VERSION}`;

    // Make API call to Azure OpenAI
    console.log('Calling Azure OpenAI...');
    const response = await fetch(azureUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': AZURE_API_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: `${systemPrompt}\n\nTekst: ${text}` }
        ],
        temperature: 0,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Azure OpenAI error:', errorData);
      throw new Error(`Azure OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      throw new Error('Empty response from Azure OpenAI');
    }

    console.log('Received response from Azure OpenAI');

    // Parse JSON response from AI
    let parsedResponse;
    try {
      const cleanedResponse = aiResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Invalid JSON response from AI model');
    }

    // Validate that the response is an array
    if (!Array.isArray(parsedResponse)) {
      throw new Error('AI response is not an array of sentence objects');
    }

    return NextResponse.json({
      success: true,
      sentences: parsedResponse,
      sentenceCount: parsedResponse.length,
      morsmaal,
      originalText: text,
      provider: 'azure',
    });

  } catch (error) {
    console.error('Split sentences Azure API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

