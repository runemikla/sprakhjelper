# 🚀 Hurtigstart - Språkhjelperen

## 3 enkle steg for å komme i gang:

### 1️⃣ Installer avhengigheter

```bash
pnpm install
```

### 2️⃣ Sett opp AI API-nøkkel

Du kan velge mellom to alternativer: **OpenAI** eller **Azure AI Foundry**.

#### Alternativ A: OpenAI (standard)

Opprett en `.env` fil i rotmappen:

```bash
cp .env.example .env
```

Rediger `.env` og legg inn din OpenAI API-nøkkel:

```
OPENAI_API_KEY=sk-din-openai-api-nøkkel-her
```

> 💡 **Trenger du en API-nøkkel?** Få den på [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)

#### Alternativ B: Azure AI Foundry

For å bruke Azure AI Foundry i stedet for OpenAI, opprett en `.env` fil med følgende variabler:

```
AZURE_OPENAI_API_KEY=din-azure-api-nøkkel-her
AZURE_OPENAI_ENDPOINT=https://ditt-endepunkt.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=ditt-deployment-navn
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

**Slik finner du verdiene:**
1. Gå til [Azure AI Foundry](https://ai.azure.com/)
2. Velg ditt prosjekt og ressurs
3. Under "Keys and Endpoint" finner du `AZURE_OPENAI_API_KEY` og `AZURE_OPENAI_ENDPOINT`
4. Under "Deployments" finner du `AZURE_OPENAI_DEPLOYMENT_NAME` (f.eks. "gpt-4o")

> ⚠️ **Viktig:** Du må også endre koden i `app/api/spraakhjelper/route.ts` for å bruke Azure. Se seksjonen "Bruke Azure AI Foundry" nedenfor.

### 3️⃣ Start utviklingsserveren

```bash
pnpm dev
```

Gå til [http://localhost:3000](http://localhost:3000) i nettleseren din.

---

## 🎯 Bruk av applikasjonen

1. **Velg morsmål** fra nedtrekkslisten
2. **Skriv eller lim inn** norsk tekst
3. **Klikk "Analyser tekst"**
4. **Bla gjennom** setningene og få tilbakemeldinger
5. **Prøv å korrigere** feil setninger
6. **Se sammendrag** med statistikk

---

## 🔧 Bruke Azure AI Foundry

Hvis du vil bruke Azure AI Foundry i stedet for OpenAI, må du endre `app/api/spraakhjelper/route.ts`:

**Endre fra (OpenAI):**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [
    { role: 'user', content: `${systemPrompt}\n\nTekst fra eleven: ${text}` }
  ],
  temperature: 0,
});
```

**Endre til (Azure AI Foundry):**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY!,
  baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT_NAME}`,
  defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY! },
});

const response = await openai.chat.completions.create({
  model: '', // Deployment name er allerede i baseURL
  messages: [
    { role: 'user', content: `${systemPrompt}\n\nTekst fra eleven: ${text}` }
  ],
  temperature: 0,
});
```

> 💡 **Tips:** OpenAI SDK er kompatibelt med Azure OpenAI Service, så du trenger ikke å installere nye pakker!

---

## 📋 Kjøretidsalternativer

### Utvikling (med hot reload)
```bash
pnpm dev
```

### Produksjon (optimalisert)
```bash
pnpm build
pnpm start
```

---

## ⚠️ Feilsøking

**Problem:** "Module not found" feil  
**Løsning:** Kjør `pnpm install` på nytt

**Problem:** "Empty response from OpenAI"  
**Løsning (OpenAI):** Sjekk at din OpenAI API-nøkkel er gyldig i `.env` filen  
**Løsning (Azure):** Verifiser at alle Azure-miljøvariablene er riktig satt, spesielt endpoint-URL og deployment-navn

**Problem:** "Invalid API key" eller "401 Unauthorized" (Azure)  
**Løsning:** 
- Sjekk at `AZURE_OPENAI_API_KEY` er korrekt
- Verifiser at endpoint-URL-en er fullstendig (inkludert `https://`)
- Kontroller at deployment-navnet matcher det du har opprettet i Azure

**Problem:** TypeScript-feil  
**Løsning:** Slett `.next` mappen og kjør `pnpm dev` igjen

---

**Det var alt! Du er klar! 🎉**

