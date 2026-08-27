# nebra-lang.github.io

The documentation site for [Nebra](https://github.com/nebra-lang/nebra), a typed superset of Lua.

Built with [Docusaurus](https://docusaurus.io/) and published to GitHub Pages at
<https://nebra-lang.github.io>.

## Local development

```bash
npm install
npm start
```

`npm start` serves the site at <http://localhost:3000> with hot reload. Most content changes appear
without a restart. Changes to `docusaurus.config.ts` need one.

## Building

```bash
npm run build      # produces build/
npm run serve      # serves build/ locally, exactly as it will be published
```

The build fails on broken internal links, which is deliberate. If you rename or move a page, the
build tells you every link that pointed at it.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds the site and publishes it
through GitHub Pages. There is nothing to run by hand.

For the workflow to work, the repository needs **Settings, Pages, Source** set to
**GitHub Actions**.

## Layout

```
docs/                       # all documentation content
├── intro.md                # landing page of the docs, served at /
├── getting-started/        # install, quick start, editor setup, targets
├── language/               # the language reference
├── toolchain/              # CLI, package manager, testing, REPL, bundler
├── advanced/               # config reference, annotations, sides, reflection
└── examples/               # complete, runnable programs
src/
├── css/custom.css          # the theme, palette sampled from the Nebra logo
├── pages/index.tsx         # the marketing landing page
└── theme/
    └── prism-include-languages.js   # the Nebra syntax-highlighting grammar
static/img/                 # logo, favicon, social card
```

## Writing docs

**Ordering** comes from `sidebar_position` in each page's frontmatter and `position` in each
folder's `_category_.json`. The sidebar is generated from the directory structure, so there is no
central list to keep in sync.

**Frontmatter** on every page:

```yaml
---
sidebar_position: 3
title: "Page Title"
description: "One sentence. Used for search results and social previews."
---
```

Keep the `# Heading` in the body as well. Docusaurus uses the frontmatter `title` for metadata and
the sidebar, and renders the body heading as the page title.

**Links between pages** are relative markdown paths, for example `../language/types.md`. The build
verifies them.

**Code blocks** use `nebra` for Nebra source and `lua` for compiled output or plain Lua. The Nebra grammar
lives in `src/theme/prism-include-languages.js`.

**House style**: no em dashes anywhere. Use a hyphen with spaces around it instead.

**Verify your examples.** Every code sample in these docs was compiled and run against the actual
compiler before being written down. If you add one, do the same.
