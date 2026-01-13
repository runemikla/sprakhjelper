# Språkhjelperen - Standalone Version

En selvstending Next.js-applikasjon som hjelper brukere med å lære norsk ved hjelp av AI-drevet språkanalyse.

## ✨ Funksjoner

- 📝 **Språkanalyse**: AI-drevet analyse av norsk tekst
- 🤖 **Azure AI**: Bruker Azure OpenAI for sikker og pålitelig AI-analyse
- 🌍 **Flerspråklig støtte**: Forklaringer på 18 ulike morsmål
- 🎯 **Interaktiv læring**: Prøv å korrigere setninger og få umiddelbar tilbakemelding
- 📊 **Statistikk**: Se fremgang og nøyaktighet
- 💾 **Lokal lagring**: Alle resultater lagres kun i nettleseren (ingen database)
- 🎨 **Moderne UI**: Bygget med Tailwind CSS og shadcn/ui
- 🌙 **Mørk modus**: Støtte for lys og mørk tema

## 🚀 Kom i gang

### Forutsetninger

- Node.js 18+ installert
- Azure OpenAI-tilgang
- pnpm (anbefalt) eller npm

### Installasjon

1. **Klon eller kopier prosjektet**
   ```bash
   cd standalone-spraakhjelper
   ```

2. **Installer avhengigheter**
   ```bash
   pnpm install
   # eller
   npm install
   ```

3. **Sett opp miljøvariabler**
   
   Opprett en `.env.local` fil i prosjektets rotmappe:
   
   ```bash
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
   AZURE_OPENAI_API_KEY=your_azure_openai_api_key_here
   AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
   AZURE_OPENAI_API_VERSION=2024-08-01-preview
   ```
   
   📖 **Se [AZURE_SETUP.md](./AZURE_SETUP.md) for detaljert Azure-oppsett**

4. **Start utviklingsserveren**
   ```bash
   pnpm dev
   # eller
   npm run dev
   ```

5. **Åpne nettleseren**
   
   Gå til [http://localhost:3000](http://localhost:3000)

## 📦 Bygg for produksjon

```bash
pnpm build
pnpm start
```

## 🛠️ Teknologier

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Komponenter**: shadcn/ui (Radix UI)
- **AI**: Azure OpenAI
- **Validering**: Zod
- **Notifikasjoner**: Sonner (toast)
- **Markdown**: react-markdown

## 📁 Prosjektstruktur

```
standalone-spraakhjelper/
├── app/
│   ├── api/
│   │   ├── spraakhjelper-azure/
│   │   │   └── route.ts         # API-endepunkt for Azure OpenAI
│   │   ├── check-sentence-azure/
│   │   ├── split-sentences-azure/
│   │   └── generate-summary-azure/
│   ├── globals.css              # Global styling
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Hovedside
├── components/
│   └── ui/                      # UI-komponenter (shadcn/ui)
├── hooks/
│   └── use-audio.ts             # Audio hook
├── lib/
│   └── utils.ts                 # Utility-funksjoner
├── public/
│   ├── audio/                   # Lydfiler
│   └── images/                  # Bildefiler
├── AZURE_SETUP.md               # Azure-oppsettguide
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🌍 Støttede språk

Språkhjelperen støtter forklaringer på følgende morsmål:

- 🇸🇦 Arabisk
- 🇦🇫 Dari
- 🇬🇧 Engelsk
- 🇮🇷 Farsi/Persisk
- 🏴 Kurmandsji (Kurdisk)
- 🇨🇳 Mandarin (Kinesisk)
- 🇵🇱 Polsk
- 🇵🇹 Portugisisk
- 🇷🇺 Russisk
- 🇸🇴 Somali
- 🇪🇸 Spansk
- 🇹🇿 Swahili
- 🇹🇭 Thai
- 🇪🇷 Tigrinja
- 🇹🇷 Tyrkisk
- 🇺🇦 Ukrainsk
- 🇭🇺 Ungarsk
- 🇻🇳 Vietnamesisk

## 💡 Bruk

1. **Velg morsmål**: Velg ditt morsmål fra nedtrekkslisten
3. **Skriv tekst**: Lim inn eller skriv norsk tekst du vil få hjelp med
4. **Analyser**: Klikk "Analyser tekst" for å få AI-analyse
5. **Bla gjennom**: Gå gjennom hver setning for å se tilbakemeldinger
6. **Øv**: Prøv å korrigere feil setninger og få umiddelbar feedback
7. **Sammendrag**: Se full statistikk og sammendrag av fremgangen din

## 🔒 Sikkerhet og personvern

- **Ingen database**: All data lagres kun i nettleseren din (localStorage)
- **Privacy-first**: Teksten din sendes kun til Azure OpenAI for analyse
- **API-nøkkel**: Din Azure OpenAI API-nøkkel lagres kun på serveren (ikke i nettleseren)

## ⚙️ Konfigurasjon

### Azure OpenAI Oppsett

Se [AZURE_SETUP.md](./AZURE_SETUP.md) for detaljert informasjon om Azure-oppsett.

### Tilpass AI-modellen

I `.env.local`:
```bash
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o  # Endre til din deployment
```

### Tilpass språklisten

I `app/page.tsx` kan du legge til eller fjerne språk:

```typescript
const languages = [
  { code: 'arabisk', name: 'Arabisk', flag: '🇸🇦' },
  // Legg til flere språk her
];
```

## 📝 Lisens

Dette er en standalone versjon laget for personlig bruk og læring.

## 🤝 Bidra

Dette er et standalone prosjekt. For forbedringer:
1. Gjør endringer lokalt
2. Test grundig
3. Dokumenter endringene dine

## ❓ Feilsøking

### "Empty response from Azure OpenAI"
- Sjekk at din Azure OpenAI API-nøkkel er gyldig
- Sjekk at AZURE_OPENAI_ENDPOINT og AZURE_OPENAI_DEPLOYMENT_NAME er korrekt konfigurert

### Komponenter vises ikke riktig
- Kjør `pnpm install` på nytt
- Slett `.next` mappen og bygg på nytt

### TypeScript-feil
- Kjør `pnpm tsc --noEmit` for å se alle typefeil
- Sjekk at alle dependencies er installert

## 📧 Support

For spørsmål eller problemer, opprett et issue eller kontakt utvikleren.

---

**Lykke til med norsk-læringen! 🇳🇴**

