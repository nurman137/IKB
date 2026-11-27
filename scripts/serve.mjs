import http from 'node:http';
import path from 'node:path';
import { stat,readFile } from 'node:fs/promises';
import {fileURLToPath} from 'node:url';

const root=path.resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
const args=process.argv.slice(2);
function option(name,fallback){const i=args.indexOf(name);return i<0?fallback:args[i+1];}
const host=option('--host','127.0.0.1'),port=Number(option('--port','5173'));
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    let file=path.resolve(root,`.${pathname}`);
    if(file!==root&&!file.startsWith(root+path.sep)){res.writeHead(403);res.end('Forbidden');return;}
    let info=await stat(file);
    if(info.isDirectory()){
      if(!pathname.endsWith('/')){res.writeHead(301,{Location:pathname+'/'});res.end();return;}
      file=path.join(file,'index.html');
    }
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end('<!doctype html><html lang="id"><title>Halaman tidak ditemukan</title><h1>Halaman tidak ditemukan</h1><a href="/">Kembali ke ruang belajar</a></html>');}
}).listen(port,host,()=>console.log(`IKB preview: http://${host}:${port}`));
