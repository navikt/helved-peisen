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

## Kjøring lokalt

### Med data fra `gcp-dev`

1. Start Valkey:
```
docker compose up valkey -d
```

2. Lag deg en `.env.local`-fil med følgende innhold:
```
NEXT_PUBLIC_HOSTNAME=http://localhost:3000
API_BASE_URL=https://peisschtappern.intern.dev.nav.no
VEDSKIVA_BASE_URL=https://vedskiva.intern.dev.nav.no
VALKEY_URI_SESSIONS=redis://localhost:6379
```

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

## Testing

Enhetstester kan kjøres med `pnpm run test`. Appen bruker [vitest](https://vitest.dev/) som testrammeverk og [msw](https://mswjs.io/) for mocking av API.

## Henvendelser
Spørsmål knyttet til koden eller prosjektet kan stilles ved å opprette et issue her på Github.

