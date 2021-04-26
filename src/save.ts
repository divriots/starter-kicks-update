import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { promises as fs } from 'fs';
import { Doc } from './types';
import path from 'path';

const basePath = '../starter-shoelace/';

const indexJs = { fileName: 'index.js', dir: '' };
const indexTs = { fileName: 'index.ts', dir: '/src' };
const component = { fileName: '${name}.ts', dir: '/src' };
const documentation = { fileName: 'doc.md', dir: '/doc' };

const saveDoc = async (doc: Doc): Promise<boolean> => {
  try {
    const tsPath = path.join(basePath, doc.dsd, component.dir);
    await fs.mkdir(tsPath, { recursive: true });
    await fs.writeFile(
      path.join(tsPath, component.fileName.replace('${name}', doc.dsd)),
      doc.ts || ''
    );

    const indexTsPath = path.join(basePath, doc.dsd, indexTs.dir);
    await fs.mkdir(indexTsPath, { recursive: true });
    await fs.writeFile(
      path.join(indexTsPath, indexTs.fileName),
      doc.indexTs || ''
    );

    const indexJsPath = path.join(basePath, doc.dsd, indexJs.dir);
    await fs.mkdir(indexJsPath, { recursive: true });
    await fs.writeFile(
      path.join(indexJsPath, indexJs.fileName),
      doc.indexJs || ''
    );

    const docPath = path.join(basePath, doc.dsd, documentation.dir);
    await fs.mkdir(docPath, { recursive: true });
    await fs.writeFile(
      path.join(docPath, documentation.fileName),
      doc.dsdDoc || ''
    );

    return true;
  } catch (error) {
    console.log('error saving doc', doc.dsd, error);
    return false;
  }
};

export const save = async (docsMap: Doc[]): Promise<boolean[]> =>
  Promise.all(docsMap.map(saveDoc));
