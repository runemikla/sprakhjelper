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

// Transfer errors per language (detailed descriptions)
const TRANSFER_ERRORS: Record<string, string> = {
  'arabisk': `Arabisk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Preteritum vs. perfektum i verb-bøying
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form`,
  
  'dari': `Dari / Farsi / Persisk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • «Det»-setninger, altså setninger der «det» fungerer som formelt subjekt
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Ord med mange ulike konsonanter etter hverandre
  • Plassering av ordet «ikke»
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form`,
  
  'farsi': `Dari / Farsi / Persisk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • «Det»-setninger, altså setninger der «det» fungerer som formelt subjekt
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Ord med mange ulike konsonanter etter hverandre
  • Plassering av ordet «ikke»
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form`,
  
  'persisk': `Dari / Farsi / Persisk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • «Det»-setninger, altså setninger der «det» fungerer som formelt subjekt
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Ord med mange ulike konsonanter etter hverandre
  • Plassering av ordet «ikke»
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form`,
  
  'kurmandsji': `Kurmandsji (kurdisk):
  • Bestemt artikkel (determinativ)
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • «Det»-setninger, altså setninger der «det» fungerer som formelt subjekt
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Ord med mange ulike konsonanter etter hverandre
  • Plassering av ordet «ikke»`,
  
  'kurdisk': `Kurmandsji (kurdisk):
  • Bestemt artikkel (determinativ)
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • «Det»-setninger, altså setninger der «det» fungerer som formelt subjekt
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Ord med mange ulike konsonanter etter hverandre
  • Plassering av ordet «ikke»`,
  
  'mandarin': `Mandarin (kinesisk):
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Ord med mange ulike konsonanter etter hverandre
  • Substantiv-bøying
  • Verb-bøying`,
  
  'kinesisk': `Mandarin (kinesisk):
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Ord med mange ulike konsonanter etter hverandre
  • Substantiv-bøying
  • Verb-bøying`,
  
  'polsk': `Polsk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Preteritum vs. perfektum i verb-bøying
  • Pronomen
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form`,
  
  'portugisisk': `Portugisisk:
  • Bestemt artikkel (determinativ)
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Gradbøying og plassering av adjektiv
  • Konsonanten «s» i opptakt (som på portugisisk uttales «es», noe som kan føre til at eleven feilaktig skriver «es» i ord med «s» som opptakt)
  • Konsonantene «h» og «r» («h» er alltid stum på portugisisk, og kan derfor feilaktig få bortfall i skrift)
  • Korrekt ubestemt artikkel (en, ett) foran substantiv i ubestemt form entall
  • Negasjon
  • Sammensatte substantiv
  • Spørresetninger`,
  
  'russisk': `Russisk / Ukrainsk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Korrekt ubestemt artikkel (en, ett) foran substantiv i ubestemt form entall
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Preteritum vs. perfektum i verb-bøying
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form`,
  
  'ukrainsk': `Russisk / Ukrainsk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Korrekt ubestemt artikkel (en, ett) foran substantiv i ubestemt form entall
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Preteritum vs. perfektum i verb-bøying
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form`,
  
  'somali': `Somali:
  • Bestemt artikkel (determinativ)
  • De norske konsonantene «p», «v» og «kj»
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Den norske vokalen «y»
  • Kjønn på substantiv
  • Preposisjoner`,
  
  'swahili': `Swahili:
  • Adjektiv
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Diftonger
  • Ord med mange ulike konsonanter etter hverandre
  • Pronomen
  • Substantiv-bøying
  • Verb-bøying`,
  
  'thai': `Thai:
  • De norske konsonantene «l» og «r»
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Ord med mange ulike konsonanter etter hverandre
  • Subjektstvang, altså at en setning alltid skal inneholde subjekt
  • Substantiv-bøying
  • Verb-bøying`,
  
  'tigrinja': `Tigrinja:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • «Det»-setninger, altså setninger der «det» fungerer som formelt subjekt
  • Norske vokaler, spesielt «u», «y» og «ø»
  • Ord med mange ulike konsonanter etter hverandre
  • Preteritum vs. perfektum i verb-bøying
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form`,
  
  'tyrkisk': `Tyrkisk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Den norske vokalen «y»
  • Ord med mange ulike konsonanter etter hverandre
  • Pronomen
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form
  • Å lage leddsetninger`,
  
  'vietnamesisk': `Vietnamesisk:
  • De strenge reglene for plassering av ord i setninger, blant annet V2-regelen, altså at verbet skal stå på andre plass i helsetninger
  • Konsonantene «f», «j», «w» og «z»
  • Passive konstruksjoner (som f.eks. «bilen blir kjørt»)
  • Sammensatte substantiv
  • Stavelsene «kj», «sy» og «øy»
  • Substantiv-bøying, bl.a. bestemt vs. ubestemt form
  • Verb-bøying, spesielt i fortid`
};

export async function POST(req: Request) {
  try {
    // Parse and validate input
    const body = await req.json();
    const { text, morsmaal } = spraakhjelpperSchema.parse(body);

    console.log('Processing spraakhjelper request for language:', morsmaal);

    // Get transfer errors for this specific language
    const transferErrors = TRANSFER_ERRORS[morsmaal] || '';

    // Build system prompt (v5)
    const systemPrompt = `Du er en hjelpsom språkveileder for elever som lærer norsk. Skriv på bokmål og ${morsmaal}. Bruk enkelt, tydelig og muntlig språk – som til en venn – men med riktig grammatikk. Skriv korte setninger og forklar én ting om gangen. Bruk bare enkle grammatikkord som «verb» eller «ordstilling». Dersom du bruker et grammatikkbegrep i en forklaring, forklar det kort hver gang, eller så lenge det ikke er brukt tidligere i denne samtalen.
Unngå vanskelige ord og faguttrykk. Når du forklarer feil, bruk små eksempler for å illustrere hva eleven skal gjøre for å forbedre setningen sin. Vær særlig oppmerksom på vanlige utfordringer eller overføringsfeil for elever med ${morsmaal} som morsmål.

##Fremgangsmåte
Analyser hver setning og gi tilbakemelding:
  - Punktvis forklaring (bruk tall) PÅ NORSK hva i elevens setning som eventuelt er galt og hvorfor – på en enkel og tydelig måte. Maksimalt 40 ord per punkt. Start hvert punkt med uthevet tekst som beskriver feilen. Dersom feil i setningen kan knyttes til vanlige utfordringer eller overføringsfeil${transferErrors ? ' (se listen under)' : ''}, skal du alltid forklare dette eksplisitt. Dersom det er gjort en overføringsfeil - Forklar på en enkel måte hvordan strukturer eller vaner fra ${morsmaal} kan ha ført til denne feilen på norsk, gjerne med et lite eksempel. Du skal ALDRI skrive den riktige setningen i forklaringen, men kun hva eleven må gjøre for å forbedre setningen sin. 
Ikke kommenter forskjeller i dialekt- eller stilnivå som ikke påvirker grammatisk riktighet.

##Viktige presiseringer:
- Beskriv hva eleven skal gjøre for å forbedre setningen sin, ikke hva eleven ikke skal gjøre.
- Du kan skrive delene av setningen som er feil i forklaringen, men ALDRI hele den riktige setningen.
- Bare kommenter overføringsfeil som er på listen under.
- Ikke bruk vanskelige ord som «spesifikk», «funksjon», «konstruksjon», «korrekthet», «presist», «formulering», «komplekst» og lignende. 
- Bruk bare helt nødvendige grammatikkbegreper som «subjekt», «verb», «ordstilling» og lignende. Hvis du må bruke et grammatisk begrep som «subjekt», «verb» eller «ordstilling», så forklar det med enkle ord første gang du bruker det.
- Ikke skriv ting som: «Denne konstruksjonen er ukorrekt». Skriv heller: «Dette sier vi ikke sånn på norsk. Her må vi gjøre ... i stedet.»

${transferErrors ? `##Vanlige overføringsfeil fra ${morsmaal}:\n${transferErrors}\n` : ''}

##Eksempler på respons (KUN FOR SYSTEMET – IKKE VIS TIL ELEVEN)
Følgende eksempler viser nøyaktig format på svaret. I faktiske svar skal modellen levere KUN JSON (ingen kodeblokker, ingen ekstra tekst).

Eksempel 1:
{
  "sentences": [
    {
      "bruker_setning": "Hu går til skole.",
      "riktig_setning": "Hun går til skolen.",
      "forklaring": "1. **Hu -> Hun:** På norsk skriver vi «hun» i stedet for «hu».\\n 2. **Skole -> Skolen:** Du skrev: «går til skole». Det er nesten riktig. Men vi sier «til skolen».",
      "forklaring_morsmaal": "...oversatt til ${morsmaal}",
      "setning_status": "feil"
    }
  ]
}

Eksempel 2:
{
  "sentences": [
    {
      "bruker_setning": "Om sommeren jeg reiser Thailand på ferie.",
      "riktig_setning": "Om sommeren reiser jeg til Thailand på ferie.",
      "forklaring": "1. **Jeg reiser:** Verbet «reiser» skal stå på plass nummer to i setningen. Dette følger V2-regelen, som sier at verbet skal stå i den andre posisjonen i setningen.\\n 2. **Til Thailand:** Husk å ta med preposisjonen «til» for å vise hvor du reiser: «til Thailand».",
      "forklaring_morsmaal": "...oversatt til ${morsmaal}",
      "setning_status": "feil"
    }
  ]
}

Eksempel 3:
{
  "sentences": [
    {
      "bruker_setning": "Jeg gifta meg i sommer.",
      "riktig_setning": "Jeg gifta meg i sommer.",
      "forklaring": "Flott! Denne setningen er helt riktig!",
      "forklaring_morsmaal": "...oversatt til ${morsmaal}",
      "setning_status": "riktig"
    }
  ]
}`;

    // Define JSON Schema for structured output (wrap array in object for consistency)
    const responseSchema = {
      type: "object",
      properties: {
        sentences: {
          type: "array",
          items: {
            type: "object",
            properties: {
              bruker_setning: {
                type: "string",
                description: "Den opprinnelige setningen slik eleven skrev den."
              },
              riktig_setning: {
                type: "string",
                description: "Setningen omskrevet korrekt."
              },
              forklaring: {
                type: "string",
                description: "Punktvis forklaring på norsk hva som er galt og hvorfor."
              },
              forklaring_morsmaal: {
                type: "string",
                description: `Forklaringen oversatt til ${morsmaal}.`
              },
              setning_status: {
                type: "string",
                enum: ["riktig", "feil"],
                description: "Status 'riktig' hvis setningen er korrekt (ignorer tegnsetting). Godta a/en-endelser og a/et-endelser i verb."
              }
            },
            required: ["bruker_setning", "riktig_setning", "forklaring", "forklaring_morsmaal", "setning_status"],
            additionalProperties: false
          }
        }
      },
      required: ["sentences"],
      additionalProperties: false
    };

    // Make API call to OpenAI with structured output
    console.log('Calling OpenAI gpt-4o model with structured output...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Tekst fra eleven: ${text}` }
      ],
      temperature: 0,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sentence_analysis",
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
    
    // Extract sentences array from the wrapper object
    const sentences = parsedResponse.sentences || [];

    // Generate a temporary submission ID for client-side tracking
    const submissionId = `local-${Date.now()}-${crypto.randomUUID()}`;

    // Add sentence_id and handle edge cases
    const resultsWithStatus = sentences.map((sentenceObj: any, index: number) => {
      let forklaring = sentenceObj.forklaring;
      let forklaringMorsmaal = sentenceObj.forklaring_morsmaal;
      
      // If sentence is correct but no explanation, provide positive feedback
      if (sentenceObj.setning_status === 'riktig' && (!forklaring || forklaring.trim() === '')) {
        forklaring = 'Denne setningen er riktig! Godt jobbet! 🎉';
      }
      
      if (sentenceObj.setning_status === 'riktig' && (!forklaringMorsmaal || forklaringMorsmaal.trim() === '')) {
        forklaringMorsmaal = forklaring;
      }
      
      return {
        ...sentenceObj,
        forklaring,
        forklaring_morsmaal: forklaringMorsmaal,
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

