export type Doc = {
  dsd: string;
  dsdDoc?: string;

  shoelace: string;
  shoelaceDoc?: string;

  ts?: string; // src/[name].ts
  indexTs?: string; // src/index.ts
  indexJs?: string; // /index.js
};
