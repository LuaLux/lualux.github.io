import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeBlock from '@theme/CodeBlock';
import Layout from '@theme/Layout';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';
import type {ReactNode} from 'react';

const VSCODE_MARKETPLACE =
  'https://marketplace.visualstudio.com/items?itemName=DasDarki.nebra';

const INSTALL_BASH =
  'curl -fsSL https://raw.githubusercontent.com/nebra-lang/nebra/master/scripts/install.sh | bash';
const INSTALL_FISH =
  'curl -fsSL https://raw.githubusercontent.com/nebra-lang/nebra/master/scripts/install.fish | fish';
const INSTALL_PWSH =
  'irm https://raw.githubusercontent.com/nebra-lang/nebra/master/scripts/install.ps1 | iex';

const SAMPLE = `--- A counter that never leaves its range.
class Counter
    count: number = 0

    constructor(start: number = 0)
        self.count = start
    end

    function bump(by: number = 1): number
        self.count = clamp(self.count + by, 0, 100)
        return self.count
    end
end

function clamp(v: number, lo: number, hi: number): number
    if v < lo then return lo end
    if v > hi then return hi end
    return v
end

local c = new Counter(5)
print(c:bump())      -- 6
print(c:bump(10))    -- 16`;

const OUTPUT = `local Counter = {}
Counter.__index = Counter
Counter.__name = "Counter"
function Counter.new(start)
	local self = setmetatable({}, Counter)
	self.count = 0
	self.count = start
	return self
end
function Counter:bump(by)
	if by == nil then by = 1 end
	self.count = clamp(self.count + by, 0, 100)
	return self.count
end
function clamp(v, lo, hi)
	if v < lo then
		return lo
	end
	if v > hi then
		return hi
	end
	return v
end
local c = Counter.new(5)
print(c:bump())
print(c:bump(10))`;

type Feature = {
  title: string;
  body: string;
  to: string;
};

const FEATURES: Feature[] = [
  {
    title: 'Types are optional',
    body: 'Every valid Lua program is already a valid Nebra program. Add annotations where they pay off and leave the rest untyped. Nothing about the type system reaches the generated Lua.',
    to: '/docs/language/types',
  },
  {
    title: 'Zero runtime overhead',
    body: 'Classes, generics, interfaces, pattern matching and async/await are all lowered at compile time. No runtime library is shipped and no metatable magic runs behind your back.',
    to: '/docs/language/classes',
  },
  {
    title: 'Targets 5.1 through 5.4 and LuaJIT',
    body: 'Pick your target in nebra.toml and the compiler emits idiomatic Lua for it, polyfilling newer operators such as floor division and bitwise ops on older runtimes.',
    to: '/docs/getting-started/lua-targets',
  },
  {
    title: 'A real module system',
    body: 'ES-style import and export lower to plain require calls. Cross-file types resolve, unused imports get stripped, and circular top-level imports are reported at compile time.',
    to: '/docs/language/modules',
  },
  {
    title: 'Nil safety when you want it',
    body: 'Optional chaining, nil coalescing, flow narrowing and a never type that marks diverging calls. Turn on strict-nil mode to make unchecked nil access a compile error.',
    to: '/docs/language/nilability',
  },
  {
    title: 'One binary, whole toolchain',
    body: 'Compiler, REPL, test runner, package manager, docs generator, native bundler and language server all ship in a single self-contained executable.',
    to: '/docs/toolchain/cli',
  },
];

function Hero(): ReactNode {
  return (
    <header className="nebra-hero">
      <div className="container nebra-hero__inner">
        <img
          className="nebra-hero__logo"
          src={useBaseUrl('/img/logo.png')}
          alt="Nebra logo"
          width={512}
          height={506}
        />
        <h1 className="nebra-hero__title">Nebra</h1>
        <p className="nebra-hero__tagline">
          A typed superset of Lua. Classes, generics, pattern matching,
          async/await, modules and a package manager, all compiled away into
          clean, portable Lua.
        </p>
        <div className="nebra-hero__buttons">
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started/installation">
            Install Nebra
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/quick-start">
            Quick start
          </Link>
          <Link
            className="button button--secondary button--lg"
            href="https://github.com/nebra-lang/nebra">
            GitHub
          </Link>
        </div>
        <div className="nebra-hero__badges">
          <span className="nebra-badge">Lua 5.1 to 5.4</span>
          <span className="nebra-badge">LuaJIT</span>
          <span className="nebra-badge">No runtime dependency</span>
          <span className="nebra-badge">MIT licensed</span>
        </div>
      </div>
    </header>
  );
}

function Features(): ReactNode {
  return (
    <section className="nebra-section">
      <div className="container">
        <h2 className="nebra-section__heading">Why Nebra</h2>
        <p className="nebra-section__sub">
          Lua is small, fast and embeddable, but large programs in it get hard
          to hold together. Nebra adds the structure without taking you off Lua.
        </p>
        <div className="nebra-grid">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              className="nebra-card nebra-card--link"
              to={feature.to}>
              <h3 className="nebra-card__title">{feature.title}</h3>
              <p className="nebra-card__body">{feature.body}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function InputOutput(): ReactNode {
  return (
    <section className="nebra-section nebra-section--alt">
      <div className="container">
        <h2 className="nebra-section__heading">What the compiler does</h2>
        <p className="nebra-section__sub">
          Types, classes and default parameters exist only while compiling. What
          lands on disk is Lua you would have been happy to write by hand. This
          is real compiler output, with <code>[reflection] mode = "none"</code>
          set so the optional metadata block is left out.
        </p>
        <div className="nebra-split">
          <div>
            <div className="nebra-split__label">src/counter.neb</div>
            <CodeBlock language="nebra">{SAMPLE}</CodeBlock>
          </div>
          <div>
            <div className="nebra-split__label">out/counter.lua</div>
            <CodeBlock language="lua">{OUTPUT}</CodeBlock>
          </div>
        </div>
      </div>
    </section>
  );
}

function Install(): ReactNode {
  return (
    <section className="nebra-section">
      <div className="container">
        <h2 className="nebra-section__heading">Install in one line</h2>
        <p className="nebra-section__sub">
          The installer detects your platform, downloads the matching release
          archive and puts <code>nebra</code> on your PATH. No admin rights and no
          .NET or Lua installation required on the target machine.
        </p>
        <div className="nebra-install">
          <Tabs groupId="os">
            <TabItem value="bash" label="Linux / macOS" default>
              <CodeBlock language="bash">{INSTALL_BASH}</CodeBlock>
            </TabItem>
            <TabItem value="fish" label="fish">
              <CodeBlock language="bash">{INSTALL_FISH}</CodeBlock>
            </TabItem>
            <TabItem value="powershell" label="Windows">
              <CodeBlock language="powershell">{INSTALL_PWSH}</CodeBlock>
            </TabItem>
          </Tabs>
          <p style={{marginTop: '1.2rem', textAlign: 'center', opacity: 0.85}}>
            Then open a new shell and run <code>nebra version</code>. See the{' '}
            <Link to="/docs/getting-started/installation">
              installation guide
            </Link>{' '}
            for manual downloads, pinning a version and building from source.
          </p>
        </div>
      </div>
    </section>
  );
}

function Editor(): ReactNode {
  return (
    <section className="nebra-section nebra-section--alt">
      <div className="container">
        <h2 className="nebra-section__heading">Editor support</h2>
        <p className="nebra-section__sub">
          The language server ships inside the same binary. The VS Code
          extension launches it for you and gives you diagnostics, hover types,
          completion, go to definition, rename, signature help and semantic
          highlighting.
        </p>
        <div className="nebra-hero__buttons">
          <Link
            className="button button--primary button--lg"
            href={VSCODE_MARKETPLACE}>
            Get the VS Code extension
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/editor-setup">
            Editor setup guide
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Typed Lua that compiles to clean Lua"
      description="Nebra is a typed superset of Lua with classes, generics, interfaces, pattern matching, async/await, modules and a package manager. It compiles to idiomatic Lua 5.1 through 5.4 and LuaJIT with zero runtime overhead.">
      <Hero />
      <main>
        <Features />
        <InputOutput />
        <Install />
        <Editor />
      </main>
    </Layout>
  );
}
