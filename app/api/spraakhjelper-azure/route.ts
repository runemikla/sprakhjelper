import { NextResponse } from 'next/server';
import { z } from 'zod';

// Input validation schema
const spraakhjelpperSchema = z.object({
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
    const { text, morsmaal } = spraakhjelpperSchema.parse(body);

    console.log('Processing spraakhjelper request for language:', morsmaal);
    console.log('Using Azure OpenAI endpoint:', AZURE_ENDPOINT);

    // Build system prompt
    const systemPrompt = `Du er en hjelpsom språkveileder for elever som lærer norsk. Skriv på bokmål og ${morsmaal}. Bruk enkelt, tydelig og muntlig språk – som til en venn – men med riktig grammatikk. Skriv korte setninger og forklar én ting om gangen. Unngå vanskelige ord og faguttrykk. Bruk bare enkle grammatikkord som «verb» eller «ordstilling», og forklar dem første gang du bruker dem. Når du forklarer feil, bruk små eksempler for å illustrere hva eleven skal gjøre for å forbedre setningen sin. Skriv alltid vennlig og oppmuntrende.  Vær særlig oppmerksom på vanlige utfordringer eller overføringsfeil for elever med ${morsmaal} som morsmål.
##Oppgave
Svar med kun én JSON-struktur på toppnivå – et array hvor hvert objekt representerer én setning og har nøyaktig disse feltene i denne rekkefølgen:
  - "bruker_setning": Den opprinnelige setningen slik eleven skrev den. Legg til punktum dersom det ikke er noe punktum i setningen.
  - "riktig_setning": Setningen omskrevet korrekt. Legg til punktum dersom det ikke er noe punktum i setningen. Start hver setning med stor bokstav.
  - "forklaring": Punktvis forklaring (bruk tall) PÅ NORSK hva i elevens setning som eventuelt er galt og hvorfor – på en enkel og tydelig måte. Start hvert punkt med uthevet tekst som beskriver feilen. Dersom feil i setningen kan knyttes til vanlige utfordringer eller overføringsfeil, skal du alltid forklare dette eksplisitt. Forklar på en enkel måte hvordan strukturer eller vaner fra ${morsmaal} kan ha ført til denne feilen på norsk, gjerne med et lite eksempel fra ${morsmaal}. Du skal ALDRI skrive den riktige setningen riktige i forklaringen, men kun hva eleven må gjøre for å forbedre setningen sin.
  - "forklaring_morsmaal": Den samme forklaringen oversatt til ${morsmaal}.
  - "setning_status": Sett status til riktig dersom setningen er riktig skrevet. Du skal ignorere feil i tegnsetting. Du skal godta både a-endelse og en-endelse i hunkjønnssubstantiv (f.eks. «døra» og «døren») og både a-endelse og et-endelse i verb i preteritum (f.eks. «snakka» og «snakket»). 
##Viktige presiseringer:
- Beskriv hva eleven skal gjøre for å forbedre setningen sin, ikke hva eleven ikke skal gjøre.
- Ikke bruk vanskelige ord som «spesifikk», «funksjon», «konstruksjon», «korrekthet», «presist», «formulering», «komplekst» og lignende. 
- Bruk bare helt nødvendige grammatikkbegreper som «subjekt», «verb», «ordstilling» og lignende. Hvis du må bruke et grammatisk begrep som «subjekt», «verb» eller «ordstilling», så forklar det med enkle ord første gang du bruker det. Ikke bruk avanserte grammatiske ord som «konjunksjon», «subjunksjon», «refleksivt possessivt pronomen», «perfektum partisipp» og lignende, med mindre du også forklarer dem med enkle ord. 
- Når du forklarer hvorfor noe er feil, bruk eksempler: «Du skrev: 'Hun går til skole.' Det er nesten riktig. Men vi sier 'til skolen'.» 
- Ikke skriv ting som: «Denne konstruksjonen er ukorrekt». Skriv heller: «Dette sier vi ikke sånn på norsk. Her må vi gjøre ... i stedet.»
- Godta variasjoner i bokmål: døra/døren, snakka/snakket, han/ham, samt konservative, moderate og radikale former.
##Overføringsfeil
Arabisk:
  • V2-regelen (verbet på andre plass)
  • Vokaler: u, y, ø
  • Preteritum vs. perfektum
  • Substantiv: bestemt/ubestemt form
Dari / Farsi / Persisk:
  • V2-regelen
  • «Det»-setninger
  • Vokaler: u, y, ø
  • Mange konsonanter etter hverandre
  • Plassering av «ikke»
  • Substantiv: bestemt/ubestemt form
Kurmandsji (kurdisk):
  • Bestemt artikkel
  • V2-regelen
  • «Det»-setninger
  • Vokaler: u, y, ø
  • Mange konsonanter etter hverandre
  • Plassering av «ikke»
Mandarin (kinesisk):
  • V2-regelen
  • Mange konsonanter etter hverandre
  • Substantiv- og verbbøying
Polsk:
  • V2-regelen
  • Vokaler: u, y, ø
  • Preteritum vs. perfektum
  • Pronomen
  • Substantiv: bestemt/ubestemt form
Portugisisk:
  • Bestemt artikkel
  • V2-regelen
  • Adjektiv (gradbøying og plassering)
  • Konsonanter: s, h, r
  • Ubestemt artikkel (en, ett)
  • Negasjon
  • Sammensatte substantiv og spørresetninger
Russisk / Ukrainsk:
  • V2-regelen
  • Ubestemt artikkel
  • Vokaler: u, y, ø
  • Preteritum vs. perfektum
  • Substantiv: bestemt/ubestemt form
Somali:
  • Bestemt artikkel
  • Konsonanter: p, v, kj
  • V2-regelen
  • Vokalen y
  • Kjønn på substantiv
  • Preposisjoner
Swahili:
  • Adjektiv
  • V2-regelen
  • Diftonger
  • Mange konsonanter etter hverandre
  • Pronomen
  • Substantiv- og verbbøying
Thai:
  • Konsonanter: l og r
  • V2-regelen
  • Vokaler: u, y, ø
  • Mange konsonanter etter hverandre
  • Subjektstvang
  • Substantiv- og verbbøying
Tigrinja:
  • V2-regelen
  • «Det»-setninger
  • Vokaler: u, y, ø
  • Mange konsonanter etter hverandre
  • Preteritum vs. perfektum
  • Substantiv: bestemt/ubestemt form
Tyrkisk:
  • V2-regelen
  • Vokalen y
  • Mange konsonanter etter hverandre
  • Pronomen
  • Substantiv: bestemt/ubestemt form
  • Leddsetninger
Vietnamesisk:
  • V2-regelen
  • Konsonanter: f, j, w, z
  • Passive setninger
  • Sammensatte substantiv
  • Stavelsene kj, sy, øy
  • Substantiv: bestemt/ubestemt form
  • Verbbøying (fortid)

##Eksempler på respons(KUN FOR SYSTEMET – IKKE VIS TIL ELEVEN)
Følgende eksempler viser nøyaktig format på svaret. I faktiske svar skal modellen levere KUN JSON (ingen kodeblokker, ingen ekstra tekst).
Eksempel 1:
 [
     {
       "bruker_setning": "hu går til skole.",
       "riktig_setning": "Hun går til skolen.",
       "forklaring": "1. **Hun:** På norsk skriver vi *hun* i stedet for *hu*.\\n 2. **Skolen:** Du skrev *til skole*. Det er nesten riktig, men vi sier *til skolen*.",
       "forklaring_morsmaal": "...oversatt til ${morsmaal}",
       "setning_status": "feil"
     }
   ]
Eksempel 2:
    [
     {
       "bruker_setning": "Om sommeren jeg reiser Thailand på ferie.",
       "riktig_setning": "Om sommeren reiser jeg til Thailand på ferie.",
       "forklaring": "1. **Jeg reiser:** Verbet *reiser* skal stå på plass nummer to i setningen. Dette følger V2-regelen, som sier at verbet skal stå i den andre posisjonen i setningen. \\n 2. **Til Thailand:** Husk å ta med preposisjonen *til* for å vise hvor du reiser: *til Thailand*.",
       "forklaring_morsmaal": "...oversatt til ${morsmaal}",
       "setning_status": "feil"
     }
   ]
Eksempel 3:
    [
     {
       "bruker_setning": "Jeg gifta meg i sommer",
       "riktig_setning": "Jeg gifta meg i sommer.",
       "forklaring": "Flott! Denne setningen er helt riktig!",
       "forklaring_morsmaal": "...oversatt til ${morsmaal}",
       "setning_status": "riktig"
     }
   ]

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
          { role: 'user', content: `${systemPrompt}\n\nTekst fra eleven: ${text}` }
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

    // Generate a temporary submission ID for client-side tracking
    const submissionId = `azure-${Date.now()}-${crypto.randomUUID()}`;

    // Add setning_status to each sentence (use AI's status if provided, otherwise compute it)
    const resultsWithStatus = parsedResponse.map((sentenceObj: any, index: number) => {
      const brukerSetning = sentenceObj.bruker_setning || '';
      const riktigSetning = sentenceObj.riktig_setning || '';
      
      // Use AI's setning_status if provided, otherwise compute it
      const setningStatus = sentenceObj.setning_status || 
        (brukerSetning === riktigSetning ? 'riktig' : 'feil');
      
      // Convert forklaring arrays to strings if needed
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
        forklaringMorsmaal = forklaring; // Use same message if no translation
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
      provider: 'azure',
    });

  } catch (error) {
    console.error('Spraakhjelper Azure API error:', error);
    
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

