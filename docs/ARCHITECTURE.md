# Architecture

How `dsh-chat-history` fits into the DeepSeek Harness client plugin system.

## Plugin shape

This is a **pure client plugin**: `package.json` declares `dsh.client.platform:
"web"` (browser half) plus `dsh.bundle.patch` (host manifest that makes it
installable via `dsh plugin add`). The host half (`lib/index.js`) is an empty
`apply()` — there is no server-side behavior.

The browser half is a hand-written bundle in the loader's lazy-CJS format:

```js
window.__ModuleLoader__.load({
  id: "dsh-chat-history",
  factory: (require) => { /* ... */ },
});
```

No build step: DSH's `client-modules` serves `lib/client.js` as-is at
`/plugins/dsh-chat-history/client.js`, and the profile's `client-hmr` hot-
reloads it when the file changes.

## Slot registration

The directory is a **conversation view tab**, following the official
`ui-trajectory` plugin pattern:

- `ctx.slots.inject("conversation.view", () => ctx.slots.register({ ... }, TocPanel))`
  waits for `ui-conversation` to declare the slot, then registers tab `id: "toc"`.
- `dsh.client.inject` lists `@deepseek-ai/dsh-client-ui-conversation` so the
  slot declarer loads first.
- The tab is additive (the `conversation.view` slot is `list` kind) — it does
  not shadow the official `details` slot (tool-call detail panel).

Why not `details`? That slot is `single` with an existing occupant at the same
priority; a second registration at the default priority throws at startup.

## Data flow

```
session snapshot (useSession)
  → s.chat.order        // ordered chat node keys
  → s.chat.nodes.get(key) // node: { kind, id, data }
  → filter kind === "user"
  → messageTitle(node.data)   // text blocks → 48-char title
  → directory list
```

History is paged by the session (`PAGE_MESSAGES = 50`). While the tab is
mounted, `loadOlderPage` (injected from `ctx.sessions.binding(id)?.session`)
keeps pulling older pages until `hasMore` is false, with a 3-stall guard.

## Jump-to-message

`conversation.view` renders only the active view, so the Chat view is not in
the DOM while the History tab is active. Jumping therefore:

1. simulates a click on the Chat tab (`[role="tab"]` with label 对话 / Chat),
2. polls for the target row (`[data-chat-anchor-key]` — stamped by
   `ui-conversation` itself),
3. `scrollIntoView({ behavior: "smooth", block: "start" })`,
4. flashes via a `data-history-flash` attribute removed after 1.5s.

## Files

| Path | Purpose |
|---|---|
| `lib/client.js` | The browser bundle (plugin body + `TocPanel`). |
| `lib/index.js` | Empty host entry required by the loader. |
| `lib/types/*.d.ts` | Type declarations for consumers. |
| `cordis.patch.yml` | `dsh.bundle` patch: inserts the plugin entry. |
| `scripts/validate.mjs` | Structural contract checks (CI + local). |
