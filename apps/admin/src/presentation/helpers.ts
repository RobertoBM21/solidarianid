import * as hbs from 'hbs';

interface RenderContext {
  _jsFiles?: string[];
  _cssFiles?: string[];
  [key: string]: unknown;
}

interface HelperOptions {
  data: {
    root: RenderContext;
  };
  fn: (context: unknown) => string;
  inverse: (context: unknown) => string;
}

const CDN_MAP: Record<string, string> = {
  axios: 'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
  chartjs: 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  html2pdf:
    'https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js',
};

export function registerHbsHelpers(hbsInstance: typeof hbs) {
  const registerAsset = (
    root: RenderContext,
    key: keyof RenderContext,
    value: string,
  ) => {
    root[key] ??= [];
    const collection = root[key] as string[];
    if (!collection.includes(value)) {
      collection.push(value);
    }
  };

  hbsInstance.registerHelper(
    'addJs',
    function (path: string, options: HelperOptions) {
      registerAsset(options.data.root, '_jsFiles', path);
      return null;
    },
  );

  hbsInstance.registerHelper(
    'addCss',
    function (path: string, options: HelperOptions) {
      registerAsset(options.data.root, '_cssFiles', path);
      return null;
    },
  );

  hbsInstance.registerHelper(
    'addLib',
    function (libName: string, options: HelperOptions) {
      registerAsset(options.data.root, '_jsFiles', CDN_MAP[libName]);
      return null;
    },
  );

  hbsInstance.registerHelper('renderJs', function (options: HelperOptions) {
    const files = options.data.root._jsFiles ?? [];
    return files.map((f) => `<script src="${f}"></script>`).join('\n');
  });

  hbsInstance.registerHelper('renderCss', function (options: HelperOptions) {
    const files = options.data.root._cssFiles ?? [];
    return files.map((f) => `<link rel="stylesheet" href="${f}">`).join('\n');
  });
}
