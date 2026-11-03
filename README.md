# Matchen

Koppelspel met foto's: spelers combineren steeds twee foto's die bij elkaar horen.
Elke set bepaalt zelf de vraag, de namen van beide kanten en hoe de foto's getoond worden.
Eerste inzet: boeken en auteurs voor bestelbijdeauteur.nl.

## Onderdelen
- `src/` – de app (React/Vite, PWA). Spel op `/`, beheer op `/#beheer`.
- `api/` – serverfuncties op Vercel:
  - `GET  /api/actieve-set` – openbaar, de set die het spel toont
  - `POST /api/login` – pincode controleren, geeft een sessie van 12 uur
  - `GET/PUT /api/sets` – alle sets lezen/opslaan (ingelogd)
  - `POST /api/foto` – verkleinde foto uploaden (ingelogd)
- Opslag: Vercel Blob (`data/…json` met alle sets, `fotos/…` met de foto's).

## Instellingen in Vercel
| Variabele | Verplicht | Uitleg |
|---|---|---|
| `BLOB_READ_WRITE_TOKEN` | ja | Wordt automatisch gezet als je een Blob-store koppelt |
| `MATCHEN_PIN` | nee | Andere pincode dan de standaard (43214321) |
| `MATCHEN_SECRET` | nee | Eigen geheim voor het ondertekenen van sessies |

## Lokaal draaien
Alleen het spel (voorbeeldset, zonder beheer):

    npm install
    npm run dev

Spel én beheer (met de echte opslag):

    npm i -g vercel
    vercel link
    vercel env pull .env.local
    vercel dev

## Een set
    {
      "id": "…", "naam": "…",
      "vraag": "Welk boek hoort bij welke auteur?",
      "kanten": {
        "a": { "label": "Boek",   "vorm": "kaart" },
        "b": { "label": "Auteur", "vorm": "portret" }
      },
      "pairs": [{ "id": "…", "a": { "alt": "…", "src": "https://…" }, "b": { "alt": "…", "src": "https://…" } }]
    }

- `vorm`: `kaart` toont de hele foto (bijv. een boekkaft), `portret` een ovale uitsnede.
- `label` wordt voor schermlezers vóór de naam gezet (bijv. "Boek: De stille haven").
- 2 tot 15 paren per set; elke foto heeft een naam nodig.

## Huisstijl
Kleuren en fonts staan in `src/theme.css`.
