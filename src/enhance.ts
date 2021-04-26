import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Doc } from './types';
import { camelCase, startCase } from 'lodash';

const mdLayoutImport = `\`\`\`js script
import { html } from '~/md-layout';
\`\`\`
`;

const codeRegex = /^```html preview\n.+?```/gms;
const scriptRegex = /^<script>(.+?)<\/script>/gms;
const constRegex = /const (.+?) =/gm;

const enhanceDoc = (doc: string = ''): string => {
  const withRenderedExamples = doc.replaceAll(codeRegex, (codeBlock) => {
    let scriptBlock = '';
    const htmlBlock = codeBlock.replaceAll(scriptRegex, (_, script) => {
      scriptBlock = `${script}`;
      return '';
    });

    return `
${htmlBlock.replace('html preview', 'html:html')}
${
  scriptBlock
    ? `\n\`\`\`js script
window.addEventListener('load', () => {${scriptBlock}});
\`\`\`
`
    : ''
}
### Code
${codeBlock}`;
  });
  return `${mdLayoutImport}\n${withRenderedExamples}`;
};

// /src/[name].ts
export const getComponentTsContent = (doc: Doc): string => {
  const slName = `Sl${startCase(camelCase(doc.dsd))}`;
  return `import ${slName} from '@shoelace-style/shoelace/dist${doc.shoelaceSrc}';\nexport { ${slName} };`;
};

// /src/index.ts
const getIndexTsContent = (name: string = ''): string =>
  `export * from './${name}';`;

// /index.js
export const getIndexJsContent = (): string => `export * from './src/index';`;

export const enhance = async (docsMap: Doc[]): Promise<Doc[]> => {
  return Promise.all(
    docsMap.map(async (doc: Doc) => ({
      dsdDoc: await enhanceDoc(doc.shoelaceDoc),
      ts: getComponentTsContent(doc),
      indexTs: getIndexTsContent(doc.dsd),
      indexJs: getIndexJsContent(),
      ...doc,
    }))
  );
};
