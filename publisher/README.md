# WSB publisher

Canonical input is `issues/<id>/state.json + locale + read`. Generated public files go to `dist/`.

## Build

```sh
npm run build
```

Cloudflare Pages settings:

- Framework preset: None
- Build command: `npm run build`
- Build output directory: `dist`
- Production branch: `main`

A push to `main` should trigger the Pages build after the GitHub repository is connected in Cloudflare.

The publisher creates READ, SYSTEM and POSTER projections for EN/UA. Do not hand-edit `dist/`.
