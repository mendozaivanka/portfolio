# ask-ivanka: the chat worker

Powers the "Ask about me" widget with a real LLM. **Optional**: without it, the widget answers offline by searching the
CV and projects in the visitor's browser.

## How it works

- The site publishes `/assistant-knowledge.json` on every build (built in `src/lib/assistant.ts` from `src/data/cv.ts`
  and `src/data/projects.ts`). Its `prompt` is the system prompt.
- The widget POSTs the conversation here; the worker adds the prompt and calls a Workers AI model.
- Update the CV, redeploy the site, and the assistant knows within the hour (the worker caches the prompt).

## Deploy (free, about five minutes)

1. Create a free Cloudflare account: https://dash.cloudflare.com/sign-up
2. In this folder: `npm install`, then `npx wrangler login`, then `npm run deploy`.
3. Copy the URL it prints (e.g. `https://ask-ivanka.<you>.workers.dev`).
4. On Render (service → Environment) add `PUBLIC_CHAT_API_URL` = that URL, then redeploy the site.
   The widget's header switches from "Offline mode" to "AI assistant".

To test locally, add `http://localhost:4321` to `ALLOWED_ORIGINS` in `wrangler.toml`, run `npm run dev` here, and put
the local URL in the site's `.env` as `PUBLIC_CHAT_API_URL`.

## Free-tier catches

- **Workers AI free allowance is 10,000 "neurons" a day.** A short answer from an 8B model costs very roughly
  tens of neurons, so expect a few hundred questions a day. When it runs out, calls fail until the daily reset (00:00 UTC)
  and the widget switches to offline answers for that visitor. No card is needed and nothing is billed on the free plan.
- **Workers free plan: 100,000 requests a day** and 10 ms CPU per request (waiting on the model doesn't count).
- **Rate limiting is best effort** (per worker instance, 20 questions per visitor per 10 minutes). It's there to stop
  one tab from using the whole day's allowance, not to stop a determined attacker. The origin check only stops other
  websites' browsers; a script can still fake the header, so the daily allowance is the real ceiling.
- **Models change.** If the model in `wrangler.toml` is retired, pick another text-generation model from the
  Workers AI catalogue and redeploy.
- Visitors' questions pass through Cloudflare. The widget only sends the conversation, nothing else about the visitor.
