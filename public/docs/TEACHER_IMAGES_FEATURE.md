# Lærerbilde-funksjon

## Oversikt

Språkhjelperen viser nå dynamiske lærerbilder som gir visuell tilbakemelding basert på om setningen er riktig eller feil.

## Funksjonalitet

### Tilfeldig lærervalg
- Ved første lasting av siden velges en tilfeldig lærer (1 eller 2)
- Den samme læreren følger brukeren gjennom hele økten
- Ny lærer velges kun når nettleseren oppdateres

### Bildetype basert på status
- **Riktig setning**: Viser `riktig_1.png` eller `riktig_2.png` (avhengig av valgt lærer)
- **Feil setning**: Viser `feil_1.png` eller `feil_2.png` (avhengig av valgt lærer)
- **Fallback**: `JP_positiv.png` hvis status ikke er definert

## Implementeringsdetaljer

### State Management
```typescript
const [teacherVersion, setTeacherVersion] = useState<1 | 2>(() => {
  // Randomly select teacher 1 or 2 on first load
  return Math.random() < 0.5 ? 1 : 2
})
```

### Bildevalg-funksjon
```typescript
const getTeacherImage = (status: 'riktig' | 'riktig_2' | 'feil' | undefined) => {
  if (status === 'riktig' || status === 'riktig_2') {
    return `/images/riktig_${teacherVersion}.png`
  } else if (status === 'feil') {
    return `/images/feil_${teacherVersion}.png`
  }
  return `/images/JP_positiv.png` // Default fallback
}
```

### UI-plassering
Lærerbildet vises i høyre hjørne av tilbakemeldingsseksjonen, ved siden av språkvalg-knappene.

## Bilder

Følgende bilder brukes:
- `public/images/riktig_1.png` - Lærer 1, positiv tilbakemelding
- `public/images/riktig_2.png` - Lærer 2, positiv tilbakemelding
- `public/images/feil_1.png` - Lærer 1, konstruktiv tilbakemelding
- `public/images/feil_2.png` - Lærer 2, konstruktiv tilbakemelding
- `public/images/JP_positiv.png` - Fallback-bilde
- `public/images/JP_tenke.png` - Reservebilde (ikke i bruk)

## Design

Bildet er:
- 128x128 piksler
- Plassert i høyre hjørne
- Bruker Next.js Image-komponent for optimalisering
- Prioritert lasting (`priority` prop)
- Responsivt design

## Brukeropplevelse

1. Brukeren starter en ny økt
2. En tilfeldig lærer (1 eller 2) velges
3. For hver setning vises riktig lærerbilde basert på om setningen er riktig eller feil
4. Samme lærer vises konsekvent gjennom hele økten
5. Ved neste besøk (oppdatering av nettleser) velges en ny tilfeldig lærer

