import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import { checkRateLimit, validateResponseSize } from '@/lib/api-helpers';

// Input validation schema
const summarySchema = z.object({
  originalText: z.string().min(1, 'Text is required').max(5000, 'Text too long (max 5000 characters)'),
  morsmaal: z.string().min(1, 'Mother language is required').max(50, 'Language name too long'),
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    // Rate limiting: 5 requests per minute per IP (lower for summary generation)
    const rateLimitError = checkRateLimit(req, 5, 60000);
    if (rateLimitError) return rateLimitError;
    
    // Parse and validate input
    const body = await req.json();
    const { originalText, morsmaal } = summarySchema.parse(body);

    console.log('Generating summary for language:', morsmaal);

    // Build system prompt for comprehensive analysis
    const systemPrompt = `Du er en erfaren språklærer som gir konstruktiv og motiverende tilbakemelding til elever som lærer norsk. 

Analyser den følgende teksten skrevet av en elev med ${morsmaal} som morsmål. Gi en omfattende vurdering som hjelper eleven å forbedre seg.

## Oppgave
Analyser teksten og gi tilbakemelding på følgende områder:

1. **Hva var bra med teksten** - Vær spesifikk og oppmuntrende. Pek på positive aspekter som:
   - God ordstilling eller setningsstruktur
   - Riktig bruk av grammatikk
   - Variert ordforråd
   - God tekst sammenheng
   - Andre sterke sider

2. **Hva kan bli bedre** - Gi konstruktiv kritikk på:
   - Grammatiske feil som går igjen
   - Områder som trenger mer øvelse (f.eks. verb-bøying, substantiv-bøying, ordstilling, tegnsetting)
   - Konkrete forslag til forbedring
   - Hva eleven bør øve på videre

3. **Ordliste** - Liste over ord eleven har skrevet feil:
   - Feil skrevet ord fra elevens tekst
   - Korrekt stavemåte
   - Kun ord som faktisk er feil stavet (ikke grammatikkfeil)

## Retningslinjer
- Vær oppmuntrende og konstruktiv
- Skriv på bokmål og ${morsmaal}
- Bruk enkelt språk som eleven forstår
- Vær spesifikk og gi konkrete eksempler
- Fokuser på de viktigste forbedringsområdene
- Hvis det er få eller ingen feil, ros eleven og gi tips for videre utvikling

Returner resultatet som JSON.`;

    // Define JSON Schema for structured output
    const responseSchema = {
      type: "object",
      properties: {
        hva_var_bra: {
          type: "string",
          description: "Oppmuntrende tilbakemelding på hva som var bra med teksten. 2-4 setninger."
        },
        hva_var_bra_morsmaal: {
          type: "string",
          description: `Oversettelse av 'hva_var_bra' til ${morsmaal}.`
        },
        hva_kan_bli_bedre: {
          type: "string",
          description: "Konstruktiv kritikk og områder som trenger forbedring. 3-5 punkter."
        },
        hva_kan_bli_bedre_morsmaal: {
          type: "string",
          description: `Oversettelse av 'hva_kan_bli_bedre' til ${morsmaal}.`
        },
        ordliste: {
          type: "array",
          description: "Liste over ord eleven har skrevet feil.",
          items: {
            type: "object",
            properties: {
              feil: {
                type: "string",
                description: "Ordet slik eleven skrev det (feil stavemåte)"
              },
              riktig: {
                type: "string",
                description: "Korrekt stavemåte"
              }
            },
            required: ["feil", "riktig"],
            additionalProperties: false
          }
        }
      },
      required: ["hva_var_bra", "hva_var_bra_morsmaal", "hva_kan_bli_bedre", "hva_kan_bli_bedre_morsmaal", "ordliste"],
      additionalProperties: false
    };

    // Make API call to OpenAI with structured output
    console.log('Calling OpenAI GPT-5 for summary generation...');
    const response = await openai.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tekst fra eleven:\n\n${originalText}` }
      ],
      reasoning_effort: 'medium',
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "text_analysis",
          strict: true,
          schema: responseSchema
        }
      }
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    if (!aiResponse) {
      throw new Error('Empty response from OpenAI');
    }

    // Validate response size (max 50KB)
    validateResponseSize(aiResponse, 50000);

    console.log('Received summary from OpenAI');

    // Parse JSON response
    const parsedResponse = JSON.parse(aiResponse);

    return NextResponse.json({
      success: true,
      analysis: parsedResponse,
      provider: 'openai',
    });

  } catch (error) {
    // Secure logging: Only log error type and message, never full error object
    if (process.env.NODE_ENV === 'development') {
      console.error('Generate summary API error:', error instanceof Error ? error.message : 'Unknown error');
    }
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : 'Unknown error')
          : 'An error occurred processing your request'
      },
      { status: 500 }
    );
  }
}

