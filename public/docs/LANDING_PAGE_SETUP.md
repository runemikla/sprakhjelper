# Landing Page Setup

## Oversikt

Landingssiden for Språkhjelperen er nå opprettet med følgende komponenter:

### Struktur

```
/
├── app/
│   ├── page.tsx                    # Landingsside (rot-rute)
│   ├── app/page.tsx                # Hovedapplikasjon (flyttet fra root)
│   ├── om/page.tsx                 # Om Språkhjelperen
│   └── lærerveiledning/page.tsx    # Lærerveiledning
├── components/
│   └── landing/
│       ├── navbar.tsx              # Navigasjonsbar
│       ├── hero.tsx                # Hero-seksjon med bakgrunnsbilde
│       └── footer.tsx              # Footer
```

## Bakgrunnsbilde

### Legg til fjordbilde

Landingssiden er konfigurert til å bruke et fjordbilde som bakgrunn. For å legge til bildet:

1. **Plasser bildet** i `/public/images/` mappen
2. **Navngi bildet** som `fjord-background.jpg` (eller oppdater stien i `hero.tsx`)
3. **Anbefalte spesifikasjoner:**
   - Format: JPG eller WebP for best ytelse
   - Oppløsning: Minimum 1920x1080px
   - Filstørrelse: Optimaliser til under 500KB

### Alternativ: Endre bildesti

Hvis du vil bruke et annet navn eller format, oppdater stien i `/components/landing/hero.tsx`:

```typescript
<Image
  src="/images/ditt-bilde.jpg"  // Endre denne linjen
  alt="Norwegian fjord background"
  fill
  className="object-cover"
  priority
  quality={90}
/>
```

## Navigasjon

Navbaren inneholder følgende lenker:

- **Logo** → Tilbake til forsiden (/)
- **Lærerveiledning** → /lærerveiledning
- **Om språkhjelperen** → /om
- **Logg inn** → /app (hovedapplikasjonen)

## Styling

Landingssiden bruker:
- Tailwind CSS for styling
- Shadcn UI komponenter (Button, Card, Badge)
- Gradient overlay over bakgrunnsbildet for bedre lesbarhet
- Responsive design (mobil-først)

## Fargepalett

- **Primærfarge:** Blå (#3B82F6)
- **Bakgrunn overlay:** Gradient fra mørk blå til cyan
- **Tekst:** Hvit på hero, mørk grå på innholdssider

## Funksjoner

### Hero-seksjon
- Stor overskrift med AI-fokus
- Beskrivende undertekst
- To CTA-knapper: "Kom i gang" og "Les mer"
- Tre feature-kort med ikoner
- Animert scroll-indikator

### Om-side
- Informasjon om plattformen
- Oppdrag og visjoner
- Hvordan det fungerer (steg-for-steg)

### Lærerveiledning
- Introduksjon for lærere
- Bruksanvisning for klasserommet
- Beste praksis
- Tips og triks

## Neste steg

1. ✅ Legg til fjordbilde i `/public/images/fjord-background.jpg`
2. ⚪ Test responsivitet på ulike skjermstørrelser
3. ⚪ Legg til flere seksjoner etter behov (testimonials, pricing, etc.)
4. ⚪ Implementer autentisering for "Logg inn"-knappen
5. ⚪ Legg til analytics/tracking

## Kjør utviklingsserver

```bash
pnpm dev
```

Besøk `http://localhost:3000` for å se landingssiden.

