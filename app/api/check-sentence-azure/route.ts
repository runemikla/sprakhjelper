import { NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const checkSentenceSchema = z.object({
  sentence: z.string().min(1, 'Sentence is required'),
  correctSentence: z.string().min(1, 'Correct sentence is required'),
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
    const { sentence, correctSentence, morsmaal } = checkSentenceSchema.parse(body);

    console.log('Checking sentence for language:', morsmaal);
    console.log('Using Azure OpenAI endpoint:', AZURE_ENDPOINT);

    // Build simplified system prompt
    const systemPrompt = `Du er en hjelpsom språkveileder for elever som lærer norsk. Snakk på bokmål og ${morsmaal}. 

Sammenlign brukerens setning med den korrekte setningen og gi konstruktiv tilbakemelding.

Brukerens setning: "${sentence}"
Korrekt setning: "${correctSentence}"

Svar med én JSON-struktur:
{
  "er_riktig": true/false,
  "forklaring": "Forklaring på norsk om hva som er bra eller hva som må forbedres. Bruk enkelt språk.",
  "forklaring_morsmaal": "Samme forklaring oversatt til ${morsmaal}"
}

Regler:
- Hvis setningene er like (ignorer små forskjeller i tegnsetting): sett "er_riktig" til true
- Hvis setningene er forskjellige: sett "er_riktig" til false
- Forklaring skal være kort og tydelig (2-3 setninger)
- Vær oppmuntrende og vennlig
- Bruk konkrete eksempler fra setningen

###OBS!
Returner kun et JSON-objekt (gyldig JSON, uten kodeblokker eller ekstra tekst).`;

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
          { role: 'user', content: systemPrompt }
        ],
        temperature: 0,
        max_tokens: 1000,
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

    return NextResponse.json({
      success: true,
      ...parsedResponse,
      provider: 'azure',
    });

  } catch (error) {
    console.error('Check sentence Azure API error:', error);
    
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

