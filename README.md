![img](peisen.png)

## Kjøring lokalt

Lag deg en `.env.local`-fil med følgende innhold:
```
NEXT_PUBLIC_API_FAKING=enabled
NEXT_PUBLIC_HOSTNAME=http://localhost:3000
TASK_API_BASE_URL=http://localhost:8080
PEISSCHTAPPERN_API_BASE_URL=http://localhost:8080
```

Deretter kjører du appen med `npm run dev`. Da kjører appen på [http://localhost:3000](http://localhost:3000)  og henter data fra `utsjekk` som du må ha kjørende lokalt. 

Om du ikke ønsker å kjøre `utsjekk` lokalt kan du kjøre en fake-server med `npm run fake`. Da må du samtidig ha milljøvariabelen `NEXT_PUBLIC_API_FAKING` satt til `enabled`, f.eks. ved å legge den til i `.env.local`-fila.

## Testing

Enhetstester kan kjøres med `npm run test`. Appen bruker [vitest](https://vitest.dev/) som testrammeverk og [msw](https://mswjs.io/) for mocking av API.

## Henvendelser
Spørsmål knyttet til koden eller prosjektet kan stilles ved å opprette et issue her på Github.

## Auth to NPM
lag en ~/.npmrc med følgende content:

>//npm.pkg.github.com/:_authToken=<GITHUB PAT med scope read:packages>
>@navikt:registry=https://npm.pkg.github.com/

