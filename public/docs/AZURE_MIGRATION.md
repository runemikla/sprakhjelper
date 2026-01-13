# Migration fra OpenAI til Azure OpenAI

## Dato: 2026-01-13

## Endringer

### 1. Fjernet OpenAI API-ruter
Følgende API-ruter har blitt fjernet:
- `/app/api/spraakhjelper/` (OpenAI-versjon)
- `/app/api/check-sentence/` (OpenAI-versjon)
- `/app/api/split-sentences/` (OpenAI-versjon)
- `/app/api/generate-summary/` (OpenAI-versjon)

### 2. Oppdatert klient-kode
I `app/spraakhjelper/spraakhjelper-client.tsx`:
- Fjernet `selectedProvider` state-variabel
- Hardkodet alle API-kall til å bruke Azure-endepunkter:
  - `/api/spraakhjelper-azure`
  - `/api/check-sentence-azure`
  - `/api/split-sentences-azure`
  - `/api/generate-summary-azure`

### 3. Oppdatert sikkerhetskonfigurasjon
I `next.config.ts`:
- Fjernet `https://api.openai.com` fra Content Security Policy
- Beholder kun `https://*.openai.azure.com` for Azure OpenAI

### 4. Oppdatert dokumentasjon
I `public/docs/README.md`:
- Fjernet referanser til OpenAI som alternativ
- Oppdatert til å kun vise Azure OpenAI-oppsett
- Oppdatert feilsøkingsseksjon
- Oppdatert prosjektstruktur-diagram

## Gjenværende Azure-ruter

Applikasjonen bruker nå kun følgende Azure OpenAI API-ruter:
- `/app/api/spraakhjelper-azure/` - Hovedanalyse av tekst
- `/app/api/check-sentence-azure/` - Sjekk av individuelle setninger
- `/app/api/split-sentences-azure/` - Splitting av tekst i setninger
- `/app/api/generate-summary-azure/` - Generering av tekstsammendrag
- `/app/api/send-summary/` - Sending av sammendrag (uavhengig av AI-leverandør)

## Nødvendige miljøvariabler

Kun Azure OpenAI-variabler er nå nødvendig:
```bash
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

## Notater

- `openai` npm-pakken er fortsatt installert, da Azure OpenAI bruker samme SDK
- Ingen endringer i database-skjema eller Supabase-konfigurasjon
- UI-kode for leverandørvalg var allerede kommentert ut, så ingen UI-endringer var nødvendig
