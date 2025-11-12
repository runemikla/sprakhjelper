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

    // Build system prompt (based on main route style)
    const systemPrompt = `Du er en hjelpsom språkveileder for elever som lærer norsk. Skriv på bokmål og ${morsmaal}. Bruk enkelt, tydelig og muntlig språk – som til en venn – men med riktig grammatikk. Skriv korte setninger og forklar én ting om gangen. Bruk bare enkle grammatikkord som «verb» eller «ordstilling». Dersom du bruker et grammatikkbegrep i en forklaring, forklar det kort hver gang, eller så lenge det ikke er brukt tidligere i denne samtalen.
Unngå vanskelige ord og faguttrykk. Når du forklarer feil, bruk små eksempler for å illustrere hva eleven skal gjøre for å forbedre setningen sin.

##Fremgangsmåte
1. Sett punktum på slutten av setningen hvis det ikke er det.
2. Sammenlign brukerens setning med den korrekte setningen og gi konstruktiv tilbakemelding.

Brukerens setning: "${sentence}"
Korrekt setning: "${correctSentence}"
Analyser setningen og gi punktvis forklaring (bruk tall) PÅ NORSK hva i elevens setning som eventuelt er galt og hvorfor – på en enkel og tydelig måte. Lag ett punkt for hver feil. Maksimalt 40 ord per punkt. Start hvert punkt med uthevet tekst som beskriver feilen. Dersom feil i setningen kan knyttes til vanlige utfordringer eller overføringsfeil skal du alltid forklare dette eksplisitt. Dersom det er gjort en overføringsfeil - Forklar på en enkel måte hvordan strukturer eller vaner fra ${morsmaal} kan ha ført til denne feilen på norsk, gjerne med et lite eksempel. Du skal ALDRI skrive den riktige setningen i forklaringen, men kun hva eleven må gjøre for å forbedre setningen sin. 

##Viktige retningslinjer for tilbakemelding:
- Hvis setningene er like (ignorer små forskjeller i tegnsetting): sett "er_riktig" til true
- Hvis setningene er forskjellige: sett "er_riktig" til false
- Beskriv hva eleven skal gjøre for å forbedre setningen sin, ikke hva eleven ikke skal gjøre
- Du kan skrive delene av setningen som er feil i forklaringen, men ALDRI hele den riktige setningen
- Ikke bruk vanskelige ord som «spesifikk», «funksjon», «konstruksjon», «korrekthet», «presist», «formulering», «komplekst» og lignende
- Bruk bare helt nødvendige grammatikkbegreper som «subjekt», «verb», «ordstilling» og lignende. Hvis du må bruke et grammatisk begrep, forklar det med enkle ord
- Ikke skriv ting som: «Denne konstruksjonen er ukorrekt». Skriv heller: «Dette sier vi ikke sånn på norsk. Her må vi gjøre ... i stedet.»
- Vær oppmuntrende og vennlig.

##Eksempler på respons (KUN FOR SYSTEMET – IKKE VIS TIL ELEVEN)
Følgende eksempler viser nøyaktig format på svaret. I faktiske svar skal modellen levere KUN JSON (ingen kodeblokker, ingen ekstra tekst).

Eksempel 1 - Setning med feil:
{
  "er_riktig": false,
  "forklaring": "1. **jeg reiser -> reiser jeg:** Verbet «reiser» skal stå på plass nummer to i setningen. Dette følger V2-regelen, som sier at verbet skal stå i den andre posisjonen i setningen.\\n2. **Thailand -> til Thailand:** Husk å ta med preposisjonen «til» for å vise hvor du reiser: «til Thailand».",
  "forklaring_morsmaal": "...oversatt til ${morsmaal}"
}

Eksempel 2 - Riktig setning:
{
  "er_riktig": true,
  "forklaring": "Flott! Denne setningen er helt riktig!",
  "forklaring_morsmaal": "...oversatt til ${morsmaal}"
}`;

    // Define JSON Schema for structured output
    const responseSchema = {
      type: "object",
      properties: {
        er_riktig: {
          type: "boolean",
          description: "True hvis setningene er like (ignorer tegnsetting), false hvis forskjellige"
        },
        forklaring: {
          type: "string",
          description: "Forklaring på norsk om hva som er bra eller hva som må forbedres"
        },
        forklaring_morsmaal: {
          type: "string",
          description: `Samme forklaring oversatt til ${morsmaal}`
        }
      },
      required: ["er_riktig", "forklaring", "forklaring_morsmaal"],
      additionalProperties: false
    };

    // Make API call to OpenAI with structured output
    console.log('Calling OpenAI gpt-4o model with structured output...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Sammenlign setningene og gi tilbakemelding.` }
      ],
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sentence_check",
          strict: true,
          schema: responseSchema
        }
      }
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    if (!aiResponse) {
      throw new Error('Empty response from OpenAI');
    }

    console.log('Received response from OpenAI (structured output)');

    // Parse JSON response - guaranteed valid by JSON Schema
    const parsedResponse = JSON.parse(aiResponse);

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

