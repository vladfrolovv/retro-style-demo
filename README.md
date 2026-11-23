# Foam & Slip — submission site

A small static site for the Foam & Slip test task. It has three tabs:

- **About**: the game idea and how it was built.
- **Watch**: a full gameplay recording.
- **Play**: the Unity WebGL build. It downloads only after the reader presses **Start game**.

The site is plain HTML, CSS and JavaScript, in English and Ukrainian. There is no framework and no build step.

## Layout

| Path | What it is |
| --- | --- |
| `site/index.html` | The page. All text is real HTML. |
| `site/config.js` | Paths to the video, the poster and the Unity build files. Change this file to connect a new build. |
| `site/js/app.js` | Tabs, lazy video, and the Unity start/stop logic. |
| `site/js/i18n.js` | All page text in English and Ukrainian, and the UA / EN switch. `?lang=uk` or `?lang=en` in a link picks the language. |
| `site/css/site.css` | Styles. Colours come from the approved ivory concept. |
| `site/assets/img/` | Character art (WebP copies of the v2 art pack) and the gameplay poster. |
| `site/media/gameplay.mp4` | The gameplay video. |
| `site/game/` | The Unity WebGL export: `Build/` and `StreamingAssets/`. |
| `scripts/sync-assets.sh` | Copies art, video and the WebGL build from the game repository into `site/`. |
| `scripts/check-site.py` | Checks that every referenced file exists with the exact letter case, and that no file is too large. |
| `scripts/serve.mjs` | Local server that mounts the site under `/retro-style-demo/`, like GitHub Pages. |
| `.github/workflows/pages.yml` | Deploys `site/` to GitHub Pages. |

## Update the art, video or game

The game repository (`retro-style-task`) must sit next to this one. Then run:

```bash
scripts/sync-assets.sh
```

It converts the art and the idea concept to WebP, copies the video with `faststart` (so it can play before it fully downloads), and copies the WebGL build. Other sources can be passed with `VIDEO=...` or `BUILD=...`.

The WebGL build comes from `FoamDemoBuilder.BuildWebGLPlayer` in the game repository. It uses **Gzip compression with the decompression fallback**. GitHub Pages cannot send the `Content-Encoding` header for `.unityweb` files, so the Unity loader unpacks them in the browser. This is slower to start than native compression, but it works on any static host.

If the build file names change, update `site/config.js`.

## Preview locally

```bash
node scripts/serve.mjs
```

Open <http://127.0.0.1:8790/retro-style-demo/>. The server sends no `Content-Encoding` header and supports range requests, so it behaves like GitHub Pages. Opening `index.html` as a file does not run the Unity build.

## Publish on GitHub Pages

1. The repository must be public (or on a paid plan).
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow runs on changes under `site/`. You can also run it by hand from the **Actions** tab (**Deploy site to GitHub Pages → Run workflow**).
4. The site appears at `https://<user>.github.io/retro-style-demo/`.

All paths in the site are relative, so it works under the `/retro-style-demo/` sub-path and at a domain root.

## Limits

- One file in Git must be under 100 MiB. The largest file now is the WebAssembly build, about 15 MB.
- A published Pages site must be under 1 GB. This site is about 45 MB.
- `scripts/check-site.py` checks both and runs in the workflow before upload.
