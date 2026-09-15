![img](peisen.png)

## Prereq
For å installere navikt-pakker må du lage en ~/.npmrc med følgende content:

```
//npm.pkg.github.com/:_authToken=<GITHUB PAT med scope read:packages>
@navikt:registry=https://npm.pkg.github.com/
```

## Bygg
Vi bruker pnpm som pakkehåndterer:

```
pnpm i
```

### Docker-image

Deploy-workflowen installerer avhengigheter og kjører `pnpm build` på Ubuntu.
Next.js lager `.next/standalone` med serveren og runtime-avhengighetene.
Docker-imaget kopierer denne mappen, `.next/static` og `public`, slik at
utviklingsverktøy som TypeScript ikke blir med.

Ved manuell bygging må `pnpm install --frozen-lockfile` og `pnpm build` kjøres
på Linux med samme CPU-arkitektur som runtime-imaget. Ikke bruk `node_modules`
eller `.next` bygget på macOS, siden appen har native avhengigheter.
Deretter kan imaget bygges og skannes:

```sh
docker build --pull -t helved-peisen:check .
trivy image helved-peisen:check
```

## Kjøring lokalt

### Med data fra `gcp-dev`

1. Lag deg en `.env.local`-fil med følgende innhold:
```
NEXT_PUBLIC_HOSTNAME=http://localhost:3000
API_BASE_URL=https://peisschtappern.intern.dev.nav.no
VEDSKIVA_BASE_URL=https://vedskiva.intern.dev.nav.no
VALKEY_URI_PEISEN_SESSIONS=redis://localhost:6379
```
2. Start docker 

3. Kjør `pnpm run dev`. 

Appen kjører nå på [http://localhost:3000](http://localhost:3000)

### Med mock-data

1. Lag deg en `.env.local`-fil med følgende innhold:
```
NEXT_PUBLIC_API_FAKING=enabled
NEXT_PUBLIC_HOSTNAME=http://localhost:3000
API_BASE_URL=http://localhost:8080
```

2. Kjør `pnpm run fake`. Dette starter en fake backend som svarer med mock-data.

3 Kjør `pnpm run dev`. 

Appen kjører nå på [http://localhost:3000](http://localhost:3000)

## Feature toggles

`isEndreUtbetalingButtonEnabled` i `lib/env.ts` styrer om "Endre utbetaling"-knappen i kafka-tabellen er slått på. For å slå funksjonen av/på må du endre konstanten i koden og deploye på nytt.

## Testing

Enhetstester kan kjøres med `pnpm run test`. Appen bruker [vitest](https://vitest.dev/) som testrammeverk og [msw](https://mswjs.io/) for mocking av API.

## Henvendelser
Spørsmål knyttet til koden eller prosjektet kan stilles ved å opprette et issue her på Github.
