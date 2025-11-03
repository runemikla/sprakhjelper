import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Input validation schema
const spraakhjelpperSchema = z.object({
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
    const { text, morsmaal } = spraakhjelpperSchema.parse(body);

    console.log('Processing spraakhjelper request for language:', morsmaal);

    // Build system prompt
    const systemPrompt = `Du er en hjelpsom språkveileder for elever som lærer norsk. Snakk på bokmål og ${morsmaal}. Bruk enkelt, tydelig og muntlig språk – som til en venn – men med riktig grammatikk. Skriv korte setninger og forklar én ting om gangen (maks 3–4 setninger). Unngå vanskelige ord og faguttrykk. Bruk bare enkle grammatikkord som «verb» eller «ordstilling», og forklar dem første gang du bruker dem. Når du forklarer feil, bruk små eksempler («Hun går til skole» → «til skolen»). Ikke si «ukorrekt», men «slik sier vi det ikke på norsk – vi sier det sånn i stedet». Skriv alltid vennlig og oppmuntrende. Godta variasjoner i bokmål: døra/døren, snakka/snakket, han/ham, samt konservative, moderate og radikale former.

##Fremgangsmåte
1. Korriger tegnsetting og små bokstaver i elevens tekst. Legg til punktum dersom det ikke er noe punktum i setningen. Start hver setning med stor bokstav.
2. Svar med kun én JSON-struktur på toppnivå – et array hvor hvert objekt representerer én setning og har nøyaktig disse feltene i denne rekkefølgen:
  - "bruker_setning": Den opprinnelige setningen slik eleven skrev den. Legg til punktum dersom det ikke er noe punktum i setningen.
  - "riktig_setning": Setningen omskrevet korrekt. Legg til punktum dersom det ikke er noe punktum i setningen. Start hver setning med stor bokstav.
  - "forklaring": Punktvis forklaring (bruk tall) PÅ NORSK hva i elevens setning som eventuelt er galt og hvorfor – på en enkel og tydelig måte. Start hvert punkt med uthevet tekst som beskriver feilen. Du skal ALDRI skrive den riktige setningen i forklaringen, men kun hva eleven må gjøre for å forbedre setningen sin.
  - "forklaring_morsmaal": Den samme forklaringen oversatt til ${morsmaal}.
  - "setning_status": Sett status til riktig dersom setningen er riktig skrevet. Du skal ignorere feil i tegnsetting. Du skal godta både a-endelse og en-endelse i hunkjønnssubstantiv (f.eks. «døra» og «døren») og både a-endelse og et-endelse i verb i preteritum (f.eks. «snakka» og «snakket»). 

##Viktige presiseringer:
- Beskriv hva eleven skal gjøre for å forbedre setningen sin, ikke hva eleven ikke skal gjøre.
- Ikke bruk vanskelige ord som «spesifikk», «funksjon», «konstruksjon», «korrekthet», «presist», «formulering», «komplekst» og lignende. 
- Bruk bare helt nødvendige grammatikkbegreper som «subjekt», «verb», «ordstilling» og lignende. Hvis du må bruke et grammatisk begrep, forklar det med enkle ord første gang du bruker det.
- Når du forklarer hvorfor noe er feil, bruk eksempler: «Du skrev: 'Hun går til skole.' Det er nesten riktig. Men vi sier 'til skolen'.» 
- Ikke skriv ting som: «Denne konstruksjonen er ukorrekt». Skriv heller: «Dette sier vi ikke sånn på norsk. Her må vi gjøre ... i stedet.»

###OBS!
Returner kun et JSON-objekt (gyldig JSON, uten kodeblokker eller ekstra tekst).`;

    // Make API call to OpenAI
    console.log('Calling OpenAI gpt-4o model...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: `${systemPrompt}\n\nTekst fra eleven: ${text}` }
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

    // Generate a temporary submission ID for client-side tracking
    const submissionId = `local-${Date.now()}-${crypto.randomUUID()}`;

    // Add setning_status to each sentence
    const resultsWithStatus = parsedResponse.map((sentenceObj: any, index: number) => {
      const brukerSetning = sentenceObj.bruker_setning || '';
      const riktigSetning = sentenceObj.riktig_setning || '';
      const setningStatus = sentenceObj.setning_status || 
        (brukerSetning === riktigSetning ? 'riktig' : 'feil');
      
      // Convert forklaring arrays to strings if needed (for consistency with Azure)
      let forklaring = Array.isArray(sentenceObj.forklaring) 
        ? sentenceObj.forklaring.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n\n')
        : sentenceObj.forklaring;
      
      let forklaringMorsmaal = Array.isArray(sentenceObj.forklaring_morsmaal)
        ? sentenceObj.forklaring_morsmaal.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n\n')
        : sentenceObj.forklaring_morsmaal;
      
      // If sentence is correct but no explanation, provide positive feedback
      if (setningStatus === 'riktig' && (!forklaring || forklaring.trim() === '')) {
        forklaring = 'Denne setningen er riktig! Godt jobbet! 🎉';
      }
      
      if (setningStatus === 'riktig' && (!forklaringMorsmaal || forklaringMorsmaal.trim() === '')) {
        forklaringMorsmaal = forklaring;
      }
      
      return {
        ...sentenceObj,
        forklaring,
        forklaring_morsmaal: forklaringMorsmaal,
        setning_status: setningStatus,
        sentence_id: `${submissionId}-${index}`,
      };
    });

    return NextResponse.json({
      success: true,
      submissionId,
      results: resultsWithStatus,
      morsmaal,
      originalText: text,
      savedToDatabase: false,
      isLocal: true,
    });

  } catch (error) {
    console.error('Spraakhjelper API error:', error);
    
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

