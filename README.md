# Kebab Empire (Static Phaser)

A pure static Phaser 3 game using CDN + ES modules. No webpack, vite, or npm build step is required.

## Run locally

Because ES modules require HTTP, do not open with `file://`.

```bash
python3 -m http.server 5173
```

Then open:

- http://localhost:5173

## Deploy to GitHub Pages

1. Push to GitHub.
2. Open **Settings → Pages**.
3. Set **Source** to **Deploy from branch**.
4. Select **main** branch and **/(root)**.
5. Save.

`.nojekyll` is included so GitHub Pages serves static files without Jekyll processing.

## Deploy to Cloudflare Pages

- Framework preset: **None**
- Build command: **None**
- Build output directory: **/** (root)

## Gameplay notes

- Scene flow: `BootScene -> MenuScene -> CharacterScene -> GameScene + UIScene`.
- Order validation uses **exact sequence** matching.
- Score gain uses menu item difficulty, remaining patience (speed bonus), and combo.
- Patience timer uses: `basePatienceSeconds * character.patienceMultiplier * customerType.patienceMultiplier`.
