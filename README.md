# dsh-chat-history

A "History" tab in the DeepSeek Harness session header: turns the **user messages** of the current session into a clickable directory. Click any entry to jump back to the Chat view and scroll to that message.

- **Auto-generated**: only real user questions (`user` messages) are listed — Tool / Thinking / Command / injected-context noise is filtered out, so even long agent sessions stay navigable.
- **Auto-paging**: while the tab is active it keeps loading older history (50 messages per page) until the whole session log is in the client window — the directory is complete without manually scrolling the chat area.
- **Click-to-jump**: switches back to the Chat tab, smooth-scrolls to the target message, and flashes it for 1.5s.
- **Zero conflicts**: registered as a `conversation.view` session tab (side by side with the official "Trajectory" tab) — it does **not** occupy the `details` slot, so the official tool-call detail panel keeps working untouched.

## Install

```bash
# install into a profile (e.g. web)
dsh plugin --profile web add dsh-chat-history
```

After restarting `dsh web`, open any session: the header tab bar shows **Chat / Trajectory / History**. Click **History** to use the directory.

## Usage

1. Open a session and click the **History** tab in the header.
2. The directory lists every user message in order (number + single-line truncated title; hover shows the full text).
3. The header shows loading state: "Loading earlier history…" while older pages are being fetched, or the total entry count once complete.
4. Click any entry — it switches back to the **Chat** tab, scrolls to the message, and flashes it.

## Development

- Pure client plugin: a hand-written `window.__ModuleLoader__.load({ id, factory })` bundle — no build step required.
- **No restart needed after editing `lib/client.js`**: the profile's built-in `client-hmr` stat-polls bundles every 500ms and hot-reloads on change (roughly 1s).
- A restart **is** required when: adding a new plugin package, changing the `dsh.client` declaration in `package.json`, or toggling enable/disable in `cordis.patch.yml`.

## How it works

- Data source: session snapshot `s.chat.order` + `s.chat.nodes.get(key)`, filtered to `kind === "user"`.
- DOM targeting: ui-conversation already stamps every message node with `data-chat-anchor-key` — lookup by key directly.
- Paging: `session.loadOlder()` pulls 50 messages per page, driven by `hasMore` / `loadingOlder`; stops after 3 no-progress pages to avoid looping on a stuck host.
- Jump: since only the active view renders, first simulate a click on the Chat tab, then poll for the target DOM and `scrollIntoView` + flash.

## License

MIT
