import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Input validation schema
const checkSentenceSchema = z.object({
  sentence: z.string().min(1, 'Sentence is required'),
  correctSentence: z.string().min(1, 'Correct sentence is required'),
  morsmaal: z.string().min(1, 'Mother language is required'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // Parse and validate input
    const body = await req.json();
    const { sentence, correctSentence, morsmaal } = checkSentenceSchema.parse(body);

    console.log('Checking sentence for language:', morsmaal);

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

    // Make API call to OpenAI
    console.log('Calling OpenAI gpt-4o model...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: systemPrompt }
      ],
      temperature: 0,
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    if (!aiResponse) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('Received response from OpenAI');

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
      provider: 'openai',
    });

  } catch (error) {
    console.error('Check sentence API error:', error);
    
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

