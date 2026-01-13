# Sikkerhetsfikser - 2026-01-13

## Oppsummering av fikser

### 1. ✅ Oppgraderte pakker med sikkerhetssårbarheter

#### jsPDF: External Control of File Name or Path
- **Før:** `jspdf@3.0.3`
- **Etter:** `jspdf@4.0.0`
- **Alvorlighet:** Error
- **Status:** ✅ Fikset

#### Next.js: Deserialization of Untrusted Data
- **Før:** `next@16.0.7`
- **Etter:** `next@16.1.1`
- **Alvorlighet:** Error
- **Status:** ✅ Fikset

#### Next.js: Exposure of Sensitive System Information
- **Før:** `next@16.0.7`
- **Etter:** `next@16.1.1`
- **Alvorlighet:** Warning
- **Status:** ✅ Fikset

### 2. ✅ Fikset XSS-sårbarhet i ReactMarkdown

**Fil:** `app/spraakhjelper/spraakhjelper-client.tsx`

**Problem:** DOM-based Cross-site Scripting (XSS) - Usanitized input fra React useState flyter inn i href-attributt.

**Løsning:** Implementert streng URL-validering:
```typescript
a: ({ children, href }) => {
  // Sanitize URL to prevent XSS
  const sanitizedHref = (() => {
    if (!href) return '#';
    // Only allow http/https URLs
    try {
      const url = new URL(href);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        return href;
      }
    } catch {
      // Invalid URL
    }
    return '#';
  })();
  
  return (
    <a
      href={sanitizedHref}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 hover:underline"
    >
      {children}
    </a>
  );
},
```

**Forbedringer:**
- Bruker `URL` constructor for validering
- Tillater kun `http:` og `https:` protokoller
- Blokkerer `javascript:`, `data:`, og andre farlige protokoller
- Fallback til `#` for ugyldige URLer

### 3. ✅ Fikset CORS Origin Validation Error

**Fil:** `middleware.ts`

**Problem:** Setting `Access-Control-Allow-Origin` til `*` er for permissivt og kan tillate ondsinnede requests.

**Løsning:** Kun tillat wildcard i development:
```typescript
if (request.method === 'OPTIONS') {
  const preflightResponse = new NextResponse(null, { status: 200 });
  
  // Only set origin if it's allowed, never use wildcard in production
  if (origin && (allowedOrigins.includes(origin) || isLocalNetwork)) {
    preflightResponse.headers.set('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // Only allow wildcard in development
    preflightResponse.headers.set('Access-Control-Allow-Origin', '*');
  }
  
  preflightResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  preflightResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  preflightResponse.headers.set('Access-Control-Max-Age', '86400');
  return preflightResponse;
}
```

**Forbedringer:**
- Wildcard (`*`) kun i development
- I production: kun tillatte origins får tilgang
- Støtter fortsatt lokalt nettverk for testing

### 4. ⚠️ Gjenværende advarsler (lavere prioritet)

#### JWS: Improper Verification of Cryptographic Signature
- **Påvirket pakke:** `jws@4.0.0` (indirekte avhengighet)
- **Status:** Venter på oppstrøms oppdatering fra avhengigheter
- **Risiko:** Lav - brukes ikke direkte i applikasjonen

#### mdast-util-to-hast: Improperly Controlled Modification
- **Påvirket pakke:** `mdast-util-to-hast` (indirekte avhengighet via react-markdown)
- **Status:** Venter på oppstrøms oppdatering
- **Risiko:** Lav - vi bruker allerede sanitering

### 5. 📦 Andre oppdateringer

Følgende pakker ble også oppdatert til siste sikre versjoner:
- `@supabase/ssr`: 0.7.0 → 0.8.0
- `@supabase/supabase-js`: 2.84.0 → 2.90.1
- `openai`: 5.23.2 → 6.16.0
- `react`: 19.2.1 → 19.2.3
- `react-dom`: 19.2.1 → 19.2.3
- Diverse andre mindre oppdateringer

### 6. ⚠️ Pakker holdt tilbake

Følgende pakker ble holdt på eldre versjoner pga. breaking changes:
- `tailwindcss`: Holdt på 3.4.19 (4.1.18 tilgjengelig, men krever migrering)
- `zod`: Holdt på 3.25.76 (4.3.5 tilgjengelig, men har breaking API changes)

## Testing

✅ Build test kjørt og bestått:
```bash
pnpm build
```

✅ Alle ruter kompilert uten feil:
- `/api/spraakhjelper-azure`
- `/api/check-sentence-azure`
- `/api/split-sentences-azure`
- `/api/generate-summary-azure`

## Neste steg

1. **Test applikasjonen grundig** i development mode
2. **Overvåk** for nye sikkerhetsvarsler fra Snyk
3. **Vurder migrering** til Tailwind 4 og Zod 4 når tid tillater
4. **Legg til produksjonsdomene** i `middleware.ts` når du deployer

## Kommandoer kjørt

```bash
# Oppgraderte spesifikke pakker
pnpm add jspdf@^4.0.0 next@^16.0.10

# Oppdaterte alle pakker
pnpm update --latest

# Rullet tilbake inkompatible pakker
pnpm add -D tailwindcss@^3.4.1
pnpm add zod@^3.25.54

# Testet build
pnpm build
```
