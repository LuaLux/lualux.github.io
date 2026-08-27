/**
 * Loads the extra Prism languages declared in `themeConfig.prism.additionalLanguages`
 * and registers the Nebra grammar on top of them.
 *
 * Prism has no Nebra language, and Nebra is a Lua superset, so the grammar starts from
 * `prism-lua` and layers the Nebra-only tokens on top: type annotations, the module
 * keywords, class/interface members, decorator-style annotations and interpolated
 * strings. Docusaurus calls this once, before the first code block renders.
 */
import siteConfig from '@generated/docusaurus.config';

export default function prismIncludeLanguages(PrismObject) {
  const {
    themeConfig: {prism},
  } = siteConfig;
  const {additionalLanguages} = prism;

  const PrismBefore = globalThis.Prism;
  globalThis.Prism = PrismObject;

  additionalLanguages.forEach((lang) => {
    if (lang === 'php') {
      require('prismjs/components/prism-markup-templating.js');
    }
    require(`prismjs/components/prism-${lang}`);
  });

  registerNebra(PrismObject);

  delete globalThis.Prism;
  if (typeof PrismBefore !== 'undefined') {
    globalThis.Prism = PrismObject;
  }
}

function registerNebra(Prism) {
  if (!Prism.languages.lua) {
    return;
  }

  const nebra = Prism.languages.extend('lua', {});

  nebra['interpolated-string'] = {
    pattern: /`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^{}]*\})*\})*`/,
    greedy: true,
    inside: {
      interpolation: {
        pattern: /\$\{(?:[^{}]|\{[^{}]*\})*\}/,
        inside: {
          punctuation: /^\$\{|\}$/,
          expression: {
            pattern: /[\s\S]+/,
            inside: null, // filled in below, once `nebra` exists
          },
        },
      },
      string: /[\s\S]+/,
    },
  };
  nebra['interpolated-string'].inside.interpolation.inside.expression.inside = nebra;

  nebra.annotation = {
    pattern: /@[A-Za-z_]\w*/,
    alias: 'symbol',
  };

  nebra['doc-comment'] = {
    pattern: /---.*/,
    alias: 'comment',
    greedy: true,
  };

  nebra['type-annotation'] = {
    pattern: /(:\s*)(?!=)[A-Za-z_][\w.]*(?:\s*<[^<>]*>)?(?:\s*\[\s*\])*\??/,
    lookbehind: true,
    alias: 'class-name',
  };

  nebra['return-type'] = {
    pattern: /(->\s*)\(?[A-Za-z_][\w.,\s|?[\]<>]*\)?/,
    lookbehind: true,
    alias: 'class-name',
  };

  nebra.keyword =
    /\b(?:and|abstract|async|await|break|case|class|constructor|continue|declare|defer|do|else|elseif|end|enum|export|extend|extends|for|from|function|goto|guard|if|implements|import|in|instanceof|interface|local|match|meta|module|mut|new|not|operator|or|override|protected|repeat|return|static|super|then|typeof|until|when|while)\b/;

  nebra.builtin =
    /\b(?:_G|_VERSION|_ENV|assert|collectgarbage|coroutine|debug|dofile|error|getmetatable|io|ipairs|load|loadfile|loadstring|math|next|os|package|pairs|pcall|print|rawequal|rawget|rawlen|rawset|reflect|require|select|setmetatable|string|table|tonumber|tostring|type|unpack|xpcall)\b/;

  nebra['class-name'] = {
    pattern: /(\b(?:class|interface|enum|extend|extends|implements|new|instanceof)\s+)[A-Za-z_]\w*/,
    lookbehind: true,
  };

  nebra.boolean = /\b(?:true|false|nil)\b/;

  nebra['primitive-type'] = {
    pattern: /\b(?:any|boolean|never|nil|number|string|thread|userdata|void)\b/,
    alias: 'class-name',
  };

  nebra.operator =
    /\.{3}|\?\.|\?\?|::|->|=>|[!=<>]=|\+\+|--|\/\/|&&|\|\||[-+*/%^#&|~<>=!?:]/;

  Prism.languages.nebra = nebra;
  Prism.languages.neb = nebra;
  Prism.languages['d.neb'] = nebra;
}
