import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Doc } from './types';
import { camelCase, upperFirst } from 'lodash';

const mdLayoutImport = `\`\`\`js script
import { html } from '~/md-layout';
\`\`\`
`;

const codeRegex = /^```html preview\n(.+?)```/gms;
const scriptRegex = /^<script>(.+?)<\/script>/gms;

const enhanceDoc = (doc: string = ''): string => {
  const withRenderedExamples = doc.replaceAll(codeRegex, (codeBlock, code) => {
    let scriptBlock = '';
    const htmlCode = code.replaceAll(
      scriptRegex,
      (_: string, script: string) => {
        scriptBlock = scriptBlock.concat(script);
        return '';
      }
    );

    return `
\`\`\`html:html
${htmlCode}\`\`\`
${
  scriptBlock
    ? `\`\`\`js script
window.addEventListener('load', () => {${scriptBlock}});
\`\`\``
    : ''
}
#### Code
${codeBlock.replace('html preview', 'htm')}`;
  });
  return `${mdLayoutImport}\n${withRenderedExamples}`;
};

// /src/[name].ts
const getComponentTsContent = (doc: Doc): string => {
  const slName = `Sl${upperFirst(camelCase(doc.dsd))}`;
  return `import ${slName} from '@shoelace-style/shoelace/dist${doc.shoelaceSrc}';\nexport { ${slName} };`;
};

// /src/index.ts
const getIndexTsContent = (name: string = ''): string =>
  `export * from './${name}';`;

// /index.js
export const getIndexJsContent = (): string => `export * from './src/index';`;

export const enhance = async (docsMap: Doc[]): Promise<Doc[]> => {
  return docsMap.map((doc: Doc) => ({
    dsdDoc: enhanceDoc(doc.shoelaceDoc),
    ts: getComponentTsContent(doc),
    indexTs: getIndexTsContent(doc.dsd),
    indexJs: getIndexJsContent(),
    ...doc,
  }));
};
