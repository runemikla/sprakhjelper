# 📊 Detaljert Tekstanalyse - Funksjonsdokumentasjon

## Oversikt

Den detaljerte tekstanalysen er en ny funksjon som gir eleven en omfattende vurdering av teksten de har skrevet. Analysen genereres automatisk når eleven trykker på "Vis sammendrag" knappen, og vises nederst på sammendragssiden.

---

## ✨ Funksjoner

### 1. **Hva var bra med teksten** ✅
- Oppmuntrende tilbakemelding på positive aspekter
- Peker på riktig bruk av grammatikk, ordstilling, ordforråd, etc.
- Tilgjengelig på både norsk og elevens morsmål

### 2. **Hva kan bli bedre** 💡
- Konstruktiv kritikk på grammatiske feil
- Konkrete forbedringsområder
- Spesifikke tips for hva eleven bør øve på
- Tilgjengelig på både norsk og elevens morsmål
- Støtter formatering via Markdown

### 3. **Ordliste** 📝
- Tabelloversikt over stavefeil
- To kolonner: "Feil" og "Riktig"
- Kun rent stavefeil (ikke grammatikkfeil)
- Vises bare hvis det er stavefeil
- Positiv melding hvis ingen stavefeil funnet

---

## 🔧 Teknisk Implementering

### API-Ruter

#### `/api/generate-summary-azure`
**Provider:** Azure OpenAI (gpt-4o)

**Input:**
```typescript
{
  originalText: string;  // Den opprinnelige teksten eleven skrev
  morsmaal: string;      // Elevens morsmål (f.eks. "arabisk", "polsk")
}
```

**Output:**
```typescript
{
  success: boolean;
  analysis: {
    hva_var_bra: string;              // Norsk
    hva_var_bra_morsmaal: string;     // Oversatt
    hva_kan_bli_bedre: string;        // Norsk
    hva_kan_bli_bedre_morsmaal: string; // Oversatt
    ordliste: Array<{
      feil: string;
      riktig: string;
    }>;
  };
  provider: 'azure';
}
```

**JSON Schema:**
```typescript
{
  type: "object",
  properties: {
    hva_var_bra: { type: "string", description: "..." },
    hva_var_bra_morsmaal: { type: "string", description: "..." },
    hva_kan_bli_bedre: { type: "string", description: "..." },
    hva_kan_bli_bedre_morsmaal: { type: "string", description: "..." },
    ordliste: {
      type: "array",
      items: {
        type: "object",
        properties: {
          feil: { type: "string" },
          riktig: { type: "string" }
        }
      }
    }
  },
  required: ["hva_var_bra", "hva_var_bra_morsmaal", "hva_kan_bli_bedre", "hva_kan_bli_bedre_morsmaal", "ordliste"]
}
```

#### `/api/generate-summary`
**Provider:** OpenAI (gpt-5)

Samme input/output som Azure-ruten, men bruker OpenAI GPT-5 med `reasoning_effort: 'medium'`.

---

## 🎨 Brukergrensesnitt

### Visningslogikk

1. **Når eleven trykker "Vis sammendrag":**
   - Sammendraget vises
   - Analyse genereres automatisk i bakgrunnen
   - Loading-animasjon vises under "Detaljert tekstanalyse"

2. **Mens analyse genereres:**
   ```
   [LOADING ANIMATION]
   ```

3. **Før analyse er generert:**
   ```
   [Beskrivelse]
   Få en detaljert analyse av hva du gjorde bra og hva du kan forbedre.
   
   [Generer analyse] knapp
   ```

4. **Etter analyse er generert:**
   - Språkvelger (Norsk 🇳🇴 / Morsmål)
   - Tre seksjoner med fargekodede bokser
   - Tabell for stavefeil

### Layout

```
┌─────────────────────────────────────────────────┐
│  📊 Detaljert tekstanalyse                     │
├─────────────────────────────────────────────────┤
│                                      [🇳🇴 Norsk] │
│                                                  │
│  ✅ Hva var bra med teksten                    │
│  ┌────────────────────────────────────────────┐ │
│  │ [Grønn boks med positiv tilbakemelding]   │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  💡 Hva kan bli bedre                          │
│  ┌────────────────────────────────────────────┐ │
│  │ [Oransje boks med konstruktiv kritikk]    │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  📝 Stavefeil                                   │
│  ┌────────────────────────────────────────────┐ │
│  │  Feil       │  Riktig                      │ │
│  │  ───────────┼──────────────────────────    │ │
│  │  komme      │  kommer                      │ │
│  │  gjør       │  gjøre                       │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 🛡️ Sikkerhet

### Rate Limiting
- **Grense:** 5 requests per minutt per IP
- **Årsak:** Lavere enn andre API-er (10/min) fordi analyse er mer kostbar
- **Response:** HTTP 429 med `Retry-After` header

### Input Validering
```typescript
originalText: 
  - min: 1 karakter
  - max: 5000 karakterer
  
morsmaal:
  - min: 1 karakter
  - max: 50 karakterer
```

### Response Validering
- Maksimalt 50KB per AI-respons
- JSON parsing-validering
- Schema-validering (JSON Schema)

### XSS-Beskyttelse
- ReactMarkdown med `disallowedElements`
- Blokkerer: script, iframe, object, embed, form, input
- `unwrapDisallowed: true`
- Link-validering (kun http/https)

---

## 🧪 Testing

### Testscenarioer

1. **Normal tekst med feil:**
   - Forventet: Analyse med forbedringer og ordliste
   
2. **Perfekt tekst:**
   - Forventet: Positive tilbakemeldinger, tom ordliste
   
3. **Veldig kort tekst:**
   - Forventet: Enkel analyse
   
4. **Tekst med mange feil:**
   - Forventet: Lang ordliste, flere forbedringsområder

### Rate Limit Test
```bash
# Send 6 requests innen 1 minutt
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/generate-summary-azure \
    -H "Content-Type: application/json" \
    -d '{"originalText":"Test tekst","morsmaal":"arabisk"}'
done
```

Forventet resultat: 5 OK, 1 HTTP 429

---

## 📊 Performance

### Estimert Responstid
- **Azure OpenAI (gpt-4o):** 5-15 sekunder
- **OpenAI (gpt-5):** 8-20 sekunder

### Token-Bruk
- **Input tokens:** ~500-1500 (avhenger av tekstlengde)
- **Output tokens:** ~300-800 (avhenger av analyse-kompleksitet)

### Kostnader (Estimat)
- **Azure OpenAI:** ~$0.02-0.05 per analyse
- **OpenAI GPT-5:** ~$0.05-0.10 per analyse

---

## 🎓 Pedagogisk Verdi

### For Eleven
✅ **Motivasjon:** Ser hva de har gjort bra  
📈 **Vekst:** Får konkrete forbedringsområder  
🎯 **Fokus:** Vet hva de skal øve på videre  
🌍 **Forståelse:** Kan lese på morsmål

### For Læreren
📊 **Oversikt:** Ser elevens sterke/svake sider  
⏱️ **Tid:** Automatisk generert feedback  
🎯 **Individualisering:** Tilpasset hver elevs morsmål  
📝 **Dokumentasjon:** Lagret for senere referanse

---

## 🚀 Fremtidige Forbedringer

### Mulige Utvidelser
1. **PDF-Eksport:** Last ned analyse som PDF
2. **Historikk:** Vis progresjon over tid
3. **Sammenligning:** Sammenlign med tidligere tekster
4. **Målsetting:** Sett mål basert på analyse
5. **Lærerkommentarer:** Tillat lærere å legge til egne kommentarer
6. **Detaljerte Kategorier:** Del opp grammatikkfeil i subkategorier
7. **Lesbarhetsscore:** Beregn tekstens kompleksitet

---

## 📞 Support

**Problemer eller spørsmål?**
- Sjekk konsolllogger for feilmeldinger
- Verifiser at Azure/OpenAI API-nøkler er konfigurert
- Sjekk rate limit status i responsen
- Test API-ruten direkte med curl/Postman

---

**Opprettet:** 2025-11-17  
**Versjon:** 1.0  
**Status:** ✅ Produksjonsklar

