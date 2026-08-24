---
sidebar_position: 1
title: "Installation"
description: "Install the Lux toolchain on Linux, macOS or Windows with the one-line installer, a manual download, or a build from source."
---

# Installation

Lux ships as a single self-contained executable. It bundles the compiler, the language server, the
package manager, the test runner and an embedded Lua 5.4 interpreter, so the machine you install it
on needs **no .NET runtime and no Lua installation**.

## One-line install

This is the recommended route. The script detects your operating system and CPU architecture, pulls
the matching release archive, extracts it to `~/.lux` and links the binary into `~/.local/bin` so it
resolves in any new shell. It never needs administrator rights, and everything lands inside your own
user directory.

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="os">
<TabItem value="bash" label="Linux / macOS (bash, zsh)" default>

```bash
curl -fsSL https://raw.githubusercontent.com/LuaLux/lux/master/scripts/install.sh | bash
```

</TabItem>
<TabItem value="fish" label="Linux / macOS (fish)">

```bash
curl -fsSL https://raw.githubusercontent.com/LuaLux/lux/master/scripts/install.fish | fish
```

</TabItem>
<TabItem value="powershell" label="Windows (PowerShell 5.1+)">

```powershell
irm https://raw.githubusercontent.com/LuaLux/lux/master/scripts/install.ps1 | iex
```

</TabItem>
</Tabs>

Open a **new** shell after the script finishes so the updated `PATH` takes effect, then confirm the
install:

```bash
lux version
```

### Installing a specific version

Set an environment variable before running the installer to pin a release tag instead of taking the
latest:

```bash
LUX_VERSION=v0.2.0 curl -fsSL https://raw.githubusercontent.com/LuaLux/lux/master/scripts/install.sh | bash
```

```powershell
$env:LUX_VERSION = "v0.2.0"
irm https://raw.githubusercontent.com/LuaLux/lux/master/scripts/install.ps1 | iex
```

### Changing the install location

Two more environment variables control where things go:

| Variable | Default | What it controls |
|----------|---------|------------------|
| `LUX_INSTALL_DIR` | `~/.lux` | Where the release archive is extracted |
| `LUX_BIN_DIR` | `~/.local/bin` | Where the `lux` symlink is created |

## Manual install

If you would rather manage `PATH` yourself, download the archive for your platform from the
[latest release](https://github.com/LuaLux/lux/releases/latest):

| Platform | Archive |
|----------|---------|
| Linux x64 | `lux-linux-x64.tar.gz` |
| Linux arm64 | `lux-linux-arm64.tar.gz` |
| macOS x64 | `lux-osx-x64.tar.gz` |
| macOS arm64 (Apple Silicon) | `lux-osx-arm64.tar.gz` |
| Windows x64 | `lux-win-x64.zip` |
| Windows arm64 | `lux-win-arm64.zip` |

Each archive contains one binary, `lux` (or `lux.exe`). Extract it anywhere on your `PATH`:

```bash
tar xzf lux-linux-x64.tar.gz
sudo mv lux /usr/local/bin/
lux version
```

## Building from source

You need the [.NET 10 SDK](https://dotnet.microsoft.com/download).

```bash
git clone https://github.com/LuaLux/lux.git
cd lux
dotnet build Lux.sln
./compiler/bin/Debug/net10.0/Lux version
```

For a release build that behaves like the published binary:

```bash
dotnet publish compiler/Lux.csproj -c Release -r linux-x64 --self-contained
```

Swap the runtime identifier for your platform: `linux-x64`, `linux-arm64`, `osx-x64`, `osx-arm64`,
`win-x64` or `win-arm64`.

## Staying up to date

The CLI can update itself:

```bash
lux check     # report whether a newer release exists
lux upgrade   # download and install the latest release
```

`lux upgrade --force` reinstalls even when you are already on the newest version, which is useful if
an install got corrupted.

## Uninstalling

Delete the install directory and the symlink:

```bash
rm -rf ~/.lux ~/.local/bin/lux
```

On Windows, remove the install folder and the `PATH` entry the installer added.

## Next steps

With the toolchain installed, [create your first project](./quick-start.md), or wire up
[editor support](./editor-setup.md) so you get diagnostics and completion while you write.
