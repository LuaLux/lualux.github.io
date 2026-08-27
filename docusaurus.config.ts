import type * as Preset from '@docusaurus/preset-classic';
import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';

const GITHUB_ORG = 'nebra-lang';
const GITHUB_REPO = 'nebra';
const SITE_REPO = 'nebra-lang.github.io';
const VSCODE_MARKETPLACE =
  'https://marketplace.visualstudio.com/items?itemName=DasDarki.nebra';

const config: Config = {
  title: 'Nebra',
  tagline: 'A typed superset of Lua that transpiles to clean, portable Lua',
  favicon: 'img/favicon.ico',

  url: 'https://nebra-lang.github.io',
  baseUrl: '/',

  organizationName: GITHUB_ORG,
  projectName: SITE_REPO,
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  future: {
    v4: true,
    faster: true,
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: 'docs',
          editUrl: `https://github.com/${GITHUB_ORG}/${SITE_REPO}/edit/main/`,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        docsRouteBasePath: '/docs',
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        searchBarShortcut: true,
        searchBarShortcutHint: true,
        searchResultLimits: 12,
        searchResultContextMaxLength: 60,
      },
    ],
  ],

  themeConfig: {
    image: 'img/social-card.jpg',
    metadata: [
      {
        name: 'keywords',
        content:
          'lua, nebra, typed lua, lua transpiler, luajit, static types, lua language server',
      },
    ],

    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },

    navbar: {
      title: 'Nebra',
      logo: {
        alt: 'Nebra logo',
        src: 'img/logo.png',
      },
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/docs/getting-started/installation',
          position: 'left',
          label: 'Install',
        },
        {
          to: '/docs/examples/overview',
          position: 'left',
          label: 'Examples',
        },
        {
          href: VSCODE_MARKETPLACE,
          position: 'right',
          label: 'VS Code',
        },
        {
          href: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}`,
          position: 'right',
          className: 'navbar-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learn',
          items: [
            {label: 'Installation', to: '/docs/getting-started/installation'},
            {label: 'Quick start', to: '/docs/getting-started/quick-start'},
            {label: 'Type system', to: '/docs/language/types'},
            {label: 'Examples', to: '/docs/examples/overview'},
          ],
        },
        {
          title: 'Reference',
          items: [
            {label: 'CLI reference', to: '/docs/toolchain/cli'},
            {label: 'nebra.toml', to: '/docs/advanced/configuration'},
            {label: 'Package manager', to: '/docs/toolchain/package-manager'},
            {label: 'Declaration files', to: '/docs/language/declarations'},
          ],
        },
        {
          title: 'Project',
          items: [
            {
              label: 'GitHub',
              href: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}`,
            },
            {
              label: 'Releases',
              href: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/releases`,
            },
            {
              label: 'Issues',
              href: `https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/issues`,
            },
            {label: 'VS Code extension', href: VSCODE_MARKETPLACE},
          ],
        },
      ],
      copyright: `Nebra is MIT licensed. Copyright &copy; ${new Date().getFullYear()} the Nebra contributors.`,
    },

    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: false,
      },
    },

    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      defaultLanguage: 'lua',
      additionalLanguages: [
        'lua',
        'toml',
        'bash',
        'powershell',
        'json',
        'ini',
        'diff',
      ],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
