import{execFileSync}from'node:child_process';import{readFile,writeFile,stat}from'node:fs/promises';import{createHash}from'node:crypto';import{FE_RELEASE}from'../web/fe/learning.js';
// Rebuild and audit first. This portable static bundle is not a Sites publication.
const output=process.argv[2]||`/tmp/IKB-${FE_RELEASE}.tar.gz`;
execFileSync('tar',['--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','-czf',output,'dist','README.md','docs/fe/f8/release_manifest.json']);
const sha256=createHash('sha256').update(await readFile(output)).digest('hex'),bytes=(await stat(output)).size;
await writeFile('docs/fe/f8/package.json',JSON.stringify({release:FE_RELEASE,artifact:`IKB-${FE_RELEASE}.tar.gz`,sha256,bytes,contains:['dist/','README.md','docs/fe/f8/release_manifest.json'],reproduce:'npm run build && node scripts/audit-fe-release.mjs && node scripts/package-fe-release.mjs',published:false},null,2)+'\n');console.log(JSON.stringify({output,sha256,bytes,published:false}));
