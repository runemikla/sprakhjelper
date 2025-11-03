import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Input validation schema
const splitSentencesSchema = z.object({
  text: z.string().min(1, 'Text is required'),
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
    const { text, morsmaal } = splitSentencesSchema.parse(body);

    console.log('Splitting sentences for language:', morsmaal);

    // Build system prompt for sentence splitting
    const systemPrompt = `Du er en hjelpsom assistent som deler tekst inn i setninger og korrigerer grunnleggende tegnsetting.

Din oppgave:
1. Del teksten inn i separate setninger
2. Legg til punktum på slutten av hver setning hvis det mangler
3. Start hver setning med stor bokstav
4. IKKE endre ordene eller grammatikken - kun tegnsetting og stor bokstav i begynnelsen

Svar med kun én JSON-struktur på toppnivå – et array hvor hvert objekt representerer én setning:
- "original": Den opprinnelige setningen som brukeren skrev (med korrigert tegnsetting og stor bokstav)
- "corrected": Identisk med "original" (samme verdi)

###OBS!
Returner kun et JSON-objekt (gyldig JSON, uten kodeblokker eller ekstra tekst).

Eksempel:
Input: "jeg heter maksym jeg er fra ukraina"
Output:
[
  {"original": "Jeg heter maksym.", "corrected": "Jeg heter maksym."},
  {"original": "Jeg er fra ukraina.", "corrected": "Jeg er fra ukraina."}
]`;

    // Make API call to OpenAI
    console.log('Calling OpenAI gpt-4o model...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: `${systemPrompt}\n\nTekst: ${text}` }
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
      provider: 'openai',
    });

  } catch (error) {
    console.error('Split sentences API error:', error);
    
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

