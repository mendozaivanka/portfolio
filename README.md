# Tala Rosa Portfolio

Ivanka's portfolio, built on the **Tala** brand direction (eight-point star mark, *inabel* stripe, Newsreader + Figtree + DM Mono) and re-tinted in pastel pink. Components and token names follow [shadcn/ui](https://ui.shadcn.com/): Card, Button, Badge, Tabs, Separator, Command menu (⌘K) and Toast.

Plain HTML, CSS and JS, with no build step.

## Run it

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Palette

| Name | Role | Light |
|---|---|---|
| Kabibe | background | `#fbf6f7` |
| Lalim | text | `#2e1d24` |
| Rosas | primary | `#f4b3c6` (deep rose `#b04a6f` for links and the mark) |
| Mangga | accent | `#f6d49e` |
| Ube | support | `#ddcdf2` |
| Pandan | status | `#cfe9db` |

Dark mode uses a plum palette with the same token names. Everything lives at the top of `styles.css`.

## Make it yours

| What | Where |
|---|---|
| Bio, socials, contact copy | `index.html` |
| Projects + tab filters | `projects.html` (each card's `data-cat` matches a tab's `data-filter`) |
| Tools / stack | `tools.html` |
| Location, time zone, email, rotating prompts, sparkline data | `CONFIG` at the top of `script.js` |
| Command menu entries | `COMMANDS` in `script.js` |
| Photo | `assets/me.jpeg` |
