# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versioning adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.2] - 2026-08-19

### Fixed

- **DSH 0.1.5 compatibility.** Chat nodes moved out of the session snapshot into the new `useChat` standard hook (provided by `dsh-client-ui-chat` through `uiSession.provide`), so the previous `useSession((s) => s.chat.order)` source read nothing after the upgrade. The panel now reads `useChat((s) => s.order)` / `useChat((s) => s.nodes)` on 0.1.5+, and keeps the `s.chat.*` path for older profiles (the variant is chosen by whether the `useChat` prop is present, so each one calls its hooks unconditionally).
- Cross-view switching now uses the official `openView("chat")` owner prop on 0.1.5+, falling back to clicking the Chat tab button on profiles that predate it.
- `dsh.client.inject` no longer lists `@deepseek-ai/dsh-client-runtime` (removed in 0.1.5, which split it into `dsh-client-ui-chat` / `-session` / `-renderer`); the dependency list now mirrors the official `ui-trajectory` plugin plus `dsh-client-ui-chat`.

### Changed

- Auto-paging no longer infers progress from the (now relocated) chat snapshot length; it pages until `hasMore` clears, bounded by a 200-page budget.

## [0.1.1] - 2026-08-18

### Added

- `dsh.bundle` manifest (`cordis.patch.yml`) so the package is installable via `dsh plugin add` — previously only the `dsh.client` declaration was present.
- `repository`, `homepage`, and `keywords` fields in `package.json` for npm discoverability.
- Type declarations (`lib/types/index.d.ts`, `lib/types/client.d.ts`) with `types` entry points.

### Changed

- Bilingual README: English primary (`README.md`) with a Chinese mirror (`README.zh.md`).

## [0.1.0] - 2026-08-17

### Added

- Initial release: "History" conversation view tab listing user messages with click-to-jump.
- Auto-paging of older history while the tab is active (50 messages per page, until `hasMore` is false).
- Target flash highlight after jumping, with a 3-stall guard against host loops.
- i18n dictionaries (zh / en).
