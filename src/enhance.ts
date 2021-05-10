import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { Doc } from './types';
import { camelCase, upperFirst } from 'lodash';

const mdLayoutImport = `\`\`\`js script
import { html, registerIconLibrary } from '~/md-layout';
\`\`\`
`;

const codePreviewRegex = /^```html preview\n(.+?)```/gms;
const codeSampleRegex = /^```html\n/gms;
const componentMetaRegex = /\[component-.+?\]/gim;
const scriptRegex = /^<script.*?>(.+?)<\/script>/gms;
const shoelaceImportRegex = /import { registerIconLibrary }.*?;/gms;

const iconsScriptDoc = /^<script>(\n\s*?fetch\('\/dist\/assets\/icons\/icons\.json'\).*?)<\/script>/gms;
const iconInnerHtml = /^\s*?item.innerHTML = `\n.*?`;/gms;
const iconSearchStyleRegex = /^<style>\n\s*?\.icon-search.*?<\/style>/gms;
const linksRegex = /\[(.+?)\]\(.+?\)/g;

const enhanceIconScriptDoc = (doc: string): string =>
  doc
    .replaceAll(iconsScriptDoc, (_, script) =>
      script ? `\`\`\`js script${script}\`\`\`` : ''
    )
    .replace(
      `fetch('/dist/assets/icons/icons.json')`,
      `fetch('https://unpkg.com/@shoelace-style/shoelace/dist/assets/icons/icons.json')`
    )
    .replace(
      iconInnerHtml,
      `item.innerHTML = \`
          <sl-icon src="https://unpkg.com/@shoelace-style/shoelace/dist/assets/icons/\${i.name}.svg" style="font-size: 1.5rem;"></sl-icon>
        \`;
  `
    )
    .replace(
      iconSearchStyleRegex,
      (style) => `\`\`\`html:html\n${style}\n\`\`\``
    )
    .replace(
      `\n\`\`\`html:html
<sl-icon src="/assets/images/shoe.svg" style="font-size: 8rem;"></sl-icon>
\`\`\`\n`,
      ''
    );

const enhanceDoc = (doc: string = ''): string => {
  const withRenderedExamples = doc
    .replaceAll(componentMetaRegex, '')
    .replaceAll(codeSampleRegex, '```htm\n')
    .replaceAll(codePreviewRegex, (codeBlock, code) => {
      let scriptBlock = '';
      const htmlCode = code.replaceAll(
        scriptRegex,
        (_: string, script: string) => {
          const withImportFromModules = script.replaceAll(
            shoelaceImportRegex,
            ''
          );
          scriptBlock = scriptBlock.concat(withImportFromModules);
          return '';
        }
      );
      return `
${
  htmlCode.trim()
    ? `\`\`\`html:html
${htmlCode}\`\`\``
    : ''
}
${
  scriptBlock.trim()
    ? `\`\`\`js script
window.addEventListener('load', () => {${scriptBlock}});
\`\`\``
    : ''
}
#### Code\n
${codeBlock.replace('html preview', 'htm').replace('html', 'htm')}`;
    });

  const withEnhancedIconsScript = enhanceIconScriptDoc(
    withRenderedExamples
  ).replaceAll(linksRegex, (_: string, txt: string) => txt);

  return `${mdLayoutImport}\n${withEnhancedIconsScript}`;
};

// /src/[name].ts
const getComponentTsContent = (doc: Doc): string => {
  const slName = `Sl${upperFirst(camelCase(doc.dsd))}`;
  return `export { ${slName} } from '@shoelace-style/shoelace/dist/shoelace.js';`;
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
