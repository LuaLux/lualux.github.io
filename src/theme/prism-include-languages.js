/**
 * Loads the extra Prism languages declared in `themeConfig.prism.additionalLanguages`
 * and registers the Lux grammar on top of them.
 *
 * Prism has no Lux language, and Lux is a Lua superset, so the grammar starts from
 * `prism-lua` and layers the Lux-only tokens on top: type annotations, the module
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

  registerLux(PrismObject);

  delete globalThis.Prism;
  if (typeof PrismBefore !== 'undefined') {
    globalThis.Prism = PrismObject;
  }
}

function registerLux(Prism) {
  if (!Prism.languages.lua) {
    return;
  }

  const lux = Prism.languages.extend('lua', {});

  lux['interpolated-string'] = {
    pattern: /`(?:[^`\\$]|\\[\s\S]|\$(?!\{)|\$\{(?:[^{}]|\{[^{}]*\})*\})*`/,
    greedy: true,
    inside: {
      interpolation: {
        pattern: /\$\{(?:[^{}]|\{[^{}]*\})*\}/,
        inside: {
          punctuation: /^\$\{|\}$/,
          expression: {
            pattern: /[\s\S]+/,
            inside: null, // filled in below, once `lux` exists
          },
        },
      },
      string: /[\s\S]+/,
    },
  };
  lux['interpolated-string'].inside.interpolation.inside.expression.inside = lux;

  lux.annotation = {
    pattern: /@[A-Za-z_]\w*/,
    alias: 'symbol',
  };

  lux['doc-comment'] = {
    pattern: /---.*/,
    alias: 'comment',
    greedy: true,
  };

  lux['type-annotation'] = {
    pattern: /(:\s*)(?!=)[A-Za-z_][\w.]*(?:\s*<[^<>]*>)?(?:\s*\[\s*\])*\??/,
    lookbehind: true,
    alias: 'class-name',
  };

  lux['return-type'] = {
    pattern: /(->\s*)\(?[A-Za-z_][\w.,\s|?[\]<>]*\)?/,
    lookbehind: true,
    alias: 'class-name',
  };

  lux.keyword =
    /\b(?:and|abstract|async|await|break|case|class|constructor|continue|declare|defer|do|else|elseif|end|enum|export|extend|extends|for|from|function|goto|guard|if|implements|import|in|instanceof|interface|local|match|meta|module|mut|new|not|operator|or|override|protected|repeat|return|static|super|then|typeof|until|when|while)\b/;

  lux.builtin =
    /\b(?:_G|_VERSION|_ENV|assert|collectgarbage|coroutine|debug|dofile|error|getmetatable|io|ipairs|load|loadfile|loadstring|math|next|os|package|pairs|pcall|print|rawequal|rawget|rawlen|rawset|reflect|require|select|setmetatable|string|table|tonumber|tostring|type|unpack|xpcall)\b/;

  lux['class-name'] = {
    pattern: /(\b(?:class|interface|enum|extend|extends|implements|new|instanceof)\s+)[A-Za-z_]\w*/,
    lookbehind: true,
  };

  lux.boolean = /\b(?:true|false|nil)\b/;

  lux['primitive-type'] = {
    pattern: /\b(?:any|boolean|never|nil|number|string|thread|userdata|void)\b/,
    alias: 'class-name',
  };

  lux.operator =
    /\.{3}|\?\.|\?\?|::|->|=>|[!=<>]=|\+\+|--|\/\/|&&|\|\||[-+*/%^#&|~<>=!?:]/;

  Prism.languages.lux = lux;
  Prism.languages['d.lux'] = lux;
}
