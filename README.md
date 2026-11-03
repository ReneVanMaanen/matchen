# Matchen

Koppelspel met foto's: spelers combineren steeds twee foto's die bij elkaar horen.
Elke set bepaalt zelf de vraag, de namen van beide kanten en hoe de foto's getoond worden.
Eerste inzet: boeken en auteurs voor bestelbijdeauteur.nl.

## Lokaal draaien
    npm install
    npm run dev

Zonder backend toont de app een fictieve voorbeeldset.

## Een set
    {
      "id": "…", "naam": "…", "versie": "…",
      "vraag": "Welk boek hoort bij welke auteur?",
      "kanten": {
        "a": { "label": "Boek",   "vorm": "kaart" },
        "b": { "label": "Auteur", "vorm": "portret" }
      },
      "pairs": [{ "id": "…", "a": { "alt": "…", "src": "…" }, "b": { "alt": "…", "src": "…" } }]
    }

- `vorm`: `kaart` toont de hele foto (bijv. een boekkaft), `portret` een ovale uitsnede.
- `label` wordt voor schermlezers vóór de alt-tekst gezet (bijv. "Boek: De stille haven").

## Huisstijl
Kleuren en fonts staan in `src/theme.css`.

## Status
- [x] Spelscherm: geschud raster, controle per paar, timer, felicitatie, resetknop, auto-reset na 5 min
- [x] Offline: PWA + laatst geladen set (met foto's) in IndexedDB
- [ ] API op Vercel: `/api/actieve-set`, sets opslaan, pincode-check
- [ ] Beheer: pincode, sets met naam, vraag en kanten, foto's uploaden en verkleinen, actieve set kiezen

## Deploy
Push naar GitHub en koppel de repo in Vercel (framework: Vite).
