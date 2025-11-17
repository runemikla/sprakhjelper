# Azure OpenAI Setup Guide

## Oversikt

Språkhjelperen støtter nå både OpenAI og Azure OpenAI som AI-leverandører. Dette dokumentet forklarer hvordan du setter opp Azure OpenAI.

## Miljøvariabler

For å bruke Azure OpenAI, må du legge til følgende miljøvariabler i din `.env.local` fil:

```bash
# OpenAI Configuration (eksisterende)
OPENAI_API_KEY=your_openai_api_key_here

# Azure OpenAI Configuration (nytt)
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

## Slik får du Azure OpenAI-legitimasjon

### 1. Opprett Azure OpenAI Resource

1. Gå til [Azure Portal](https://portal.azure.com)
2. Søk etter "Azure OpenAI" i søkefeltet
3. Klikk på "Create" for å opprette en ny Azure OpenAI-ressurs
4. Fyll ut nødvendig informasjon:
   - Subscription
   - Resource Group
   - Region (velg en region som støtter GPT-4o)
   - Name (dette blir en del av endpoint-URLen)
   - Pricing tier

### 2. Deploy en modell

1. Når ressursen er opprettet, gå til ressursen
2. Klikk på "Model deployments" i menyen til venstre
3. Klikk på "Create new deployment"
4. Velg modell: **gpt-4o** (eller gpt-4o-mini for lavere kostnad)
5. Gi deployment et navn (f.eks. "gpt-4o")
6. Klikk "Create"

### 3. Hent API-nøkkel og endpoint

1. I Azure OpenAI-ressursen, gå til "Keys and Endpoint"
2. Kopier:
   - **Endpoint**: Dette er din `AZURE_OPENAI_ENDPOINT`
   - **Key 1** eller **Key 2**: Dette er din `AZURE_OPENAI_API_KEY`

### 4. Sett miljøvariabler

Opprett eller oppdater `.env.local` filen i prosjektets rotmappe:

```bash
AZURE_OPENAI_ENDPOINT=https://din-ressurs.openai.azure.com
AZURE_OPENAI_API_KEY=din_azure_api_nøkkel
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

## Bruk i applikasjonen

1. Start applikasjonen: `pnpm dev`
2. Åpne http://localhost:3000
3. I skjemaet, velg **"☁️ Azure OpenAI"** fra dropdown-menyen
4. Velg morsmål og skriv inn teksten
5. Klikk "Analyser tekst"

## API-endepunkter

Applikasjonen har nå to API-ruter:

- **`/api/spraakhjelper`** - Bruker OpenAI direkte
- **`/api/spraakhjelper-azure`** - Bruker Azure OpenAI

Frontend velger automatisk riktig endepunkt basert på brukerens valg.

## Forskjeller mellom OpenAI og Azure OpenAI

| Funksjon | OpenAI | Azure OpenAI |
|----------|--------|--------------|
| **Hosting** | OpenAI's servere | Dine Azure-servere |
| **Data residency** | USA | Velg region (Norge, Europa, etc.) |
| **Sikkerhet** | OpenAI's policies | Azure's enterprise security |
| **SLA** | Standard | Enterprise SLA tilgjengelig |
| **Kostnad** | Pay-as-you-go | Azure pricing (kan være lavere) |
| **Compliance** | OpenAI | Azure compliance (GDPR, ISO, etc.) |

## Feilsøking

### "Azure OpenAI configuration missing"

Sjekk at alle nødvendige miljøvariabler er satt i `.env.local`:
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`

### "Azure OpenAI API error: 404"

Sjekk at:
- `AZURE_OPENAI_DEPLOYMENT_NAME` matcher navnet du ga deployment i Azure Portal
- Endpoint-URLen er riktig

### "Azure OpenAI API error: 401"

Sjekk at:
- API-nøkkelen er riktig kopiert
- API-nøkkelen er ikke utløpt

### "Model not found"

Sjekk at:
- Du har deployet modellen i Azure Portal
- Deployment-navnet matcher `AZURE_OPENAI_DEPLOYMENT_NAME`

## Kostnader

Azure OpenAI har lignende priser som OpenAI, men kan variere basert på:
- Region
- Modell (gpt-4o vs gpt-4o-mini)
- Volume (høyere volum kan gi rabatt)

Sjekk [Azure OpenAI Pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/) for oppdaterte priser.

## Sikkerhet

### Best practices:

1. **Aldri commit `.env.local`** til git
2. **Bruk Azure Key Vault** for produksjon
3. **Roter API-nøkler** regelmessig
4. **Begrens tilgang** med Azure RBAC
5. **Overvåk bruk** med Azure Monitor

## Support

For spørsmål om:
- **Azure OpenAI**: [Azure Support](https://azure.microsoft.com/en-us/support/)
- **Applikasjonen**: Se README.md eller QUICK_START.md

