---
sidebar_position: 3
title: "Editor Setup"
description: "Install the VS Code extension, or wire the built-in Lux language server into any LSP-capable editor."
---

# Editor Setup

The Lux language server is not a separate download. It lives inside the same `lux` binary you
already installed and starts with `lux lps`, speaking LSP over stdio.

## VS Code

Install the **Lux** extension from the Visual Studio Marketplace:

<a
  className="button button--primary button--lg"
  href="https://marketplace.visualstudio.com/items?itemName=DasDarki.lux-lang">
  Open in Marketplace
</a>

<br />
<br />

Or from the command line:

```bash
code --install-extension DasDarki.lux-lang
```

The extension activates on any `.lux` or `.d.lux` file, finds `lux` on your `PATH` and launches
`lux lps` for you. If the binary is somewhere unusual, point at it explicitly:

```json title=".vscode/settings.json"
{
  "lux.serverPath": "/opt/lux/bin/lux"
}
```

### Extension settings

| Setting | Default | What it does |
|---------|---------|--------------|
| `lux.serverPath` | `""` | Path to the `lux` executable. Empty means "find `lux` on `PATH`". |
| `lux.trace.server` | `"off"` | LSP traffic logging. Set to `"messages"` or `"verbose"` when reporting a bug. |

### Commands

| Command | What it does |
|---------|--------------|
| `Lux: Compile this file` | Compiles the active file through the language server, without leaving the editor. |

Server logs appear in the **Lux Language Server** output channel, which is the first place to look
if something behaves oddly.

## What the language server gives you

The server runs the same compiler pipeline the CLI does, so its answers match what `lux build`
would say.

| Feature | Notes |
|---------|-------|
| Diagnostics | Errors and warnings as you type, with the same codes and help text the CLI prints |
| Hover | Inferred type of any expression, resolved signatures, and your `---` doc comments |
| Completion | Scope-aware symbols, class and interface members, and primitive type names inside annotations |
| Signature help | Parameter hints while you type a call, including overloads |
| Go to definition | Across files and across packages, including into `.d.lux` declarations |
| Find references | Whole-workspace symbol usage |
| Rename | Symbol-aware rename across the workspace |
| Document symbols | Outline view and breadcrumb navigation |
| Semantic tokens | Type-aware highlighting that plain regex grammars cannot do |
| Code actions | Quick fixes, such as stubbing out unimplemented interface members |

## Other editors

Any LSP client works. Point it at `lux lps` over stdio and register the `.lux` and `.d.lux`
extensions.

### Neovim

```lua title="init.lua"
vim.filetype.add({ extension = { lux = "lux" } })

vim.lsp.config.lux = {
  cmd = { "lux", "lps" },
  filetypes = { "lux" },
  root_markers = { "lux.toml", ".git" },
}

vim.lsp.enable("lux")
```

### Helix

```toml title="languages.toml"
[[language]]
name = "lux"
scope = "source.lux"
file-types = ["lux"]
roots = ["lux.toml"]
language-servers = ["lux-lps"]

[language-server.lux-lps]
command = "lux"
args = ["lps"]
```

### Sublime Text (LSP package)

```json title="LSP.sublime-settings"
{
  "clients": {
    "lux": {
      "enabled": true,
      "command": ["lux", "lps"],
      "selector": "source.lux"
    }
  }
}
```

## Troubleshooting

**Nothing happens when I open a `.lux` file.** Check that `lux version` works in the same shell your
editor inherits. GUI editors launched from a desktop environment sometimes do not see a `PATH` that
was set in your shell profile. Setting `lux.serverPath` to an absolute path sidesteps this.

**Types resolve inside a file but not across files.** The server resolves imports relative to
`lux.toml`, so open the project root as your workspace folder rather than a single file or a
subdirectory.

**Diagnostics look stale.** The server reanalyses on change. If it gets stuck, reload the window and
report it with `lux.trace.server` set to `"verbose"`.
