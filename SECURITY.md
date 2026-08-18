# Security Policy

## Reporting a Vulnerability

This is a community UI plugin for DeepSeek Harness. It runs as a client-side
bundle in the web UI and holds no credentials of its own.

If you find a security issue, please open a private report instead of a public
issue:

1. Use GitHub's **Security advisory** flow at
   <https://github.com/Stylelinzzz/dsh-chat-history/security/advisories/new>,
   or
2. Email the maintainer through the GitHub profile linked on the repository.

Please include:

- a description of the issue and its impact,
- steps to reproduce,
- the affected version.

You should receive a response within a few days. Please do not disclose the
issue publicly until it has been addressed and released.

## Scope

- The plugin bundle (`lib/client.js`) and its type declarations.
- The `cordis.patch.yml` / `dsh.bundle` manifest — anything that alters what
  the DSH loader mounts.

Out of scope: the DeepSeek Harness core, other plugins, and the npm registry
itself. Report those to their respective maintainers.
