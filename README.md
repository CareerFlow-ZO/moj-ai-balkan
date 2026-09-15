# MOJ AI Balkan — MVP

Prva funkcionalna mobilna web-app/PWA verzija.

## Šta radi
- Početni ekran sa 6 glavnih funkcija
- Generator poruka, pjesama, CV teksta, prevoda/objašnjenja, društvenih objava i ljubavnih odgovora
- Free limit: 5 generisanja dnevno
- Lokalna historija i sačuvani favoriti
- PRO modal
- CTA prema https://www.ludaknakvadrat.com
- PWA manifest + service worker

## Pokretanje lokalno
Otvoriti folder preko lokalnog web servera.

Primjer:
python3 -m http.server 8080

Zatim otvoriti:
http://localhost:8080

## Sljedeći korak
Dodati backend endpoint `/api/generate` koji sigurno poziva pravi AI model.
API ključ se NE smije stavljati u `app.js`.
