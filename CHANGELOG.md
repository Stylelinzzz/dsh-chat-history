# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versioning adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
