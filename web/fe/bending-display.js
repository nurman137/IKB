import {meshSVG} from './viewer.js';
// Contour is piecewise-constant centroid evaluation, never nodal smoothing.
export function bendingSVG(prepared,result,mode='deform'){
 const model=prepared.model,p=prepared.data,L=p.L_mm,h=model.kernel==='PS2'?p.h_mm:0,unit=Math.min(500/L,170/Math.max(h,1e-12)),xx=x=>320-L*unit/2+x*unit,yy=y=>235-(y+h/2)*unit;
 const solved=result?.status==='solved_unverified';let svg=meshSVG(model,mode==='deform'?result:null),marks='';
 if(solved&&mode==='stress'&&model.kernel==='PS2'){
  const values=result.fields.map(f=>f.stress[0]),lo=Math.min(...values),hi=Math.max(...values),range=Math.max(Math.abs(lo),Math.abs(hi),1e-12),color=v=>{const t=v/range;return t<0?`rgb(${Math.round(245+170*t)},${Math.round(245+110*t)},245)`:`rgb(245,${Math.round(245-130*t)},${Math.round(245-175*t)})`;};
  marks+=model.elements.map((e,i)=>`<polygon points="${[0,3,1,4,2,5].map(j=>{const n=model.nodes[e.nodes[j]];return `${xx(n[0])},${yy(n[1])}`;}).join(' ')}" fill="${color(values[i])}" stroke="#869084" stroke-width="0.3"/>`).join('');
  marks+=`<text x="30" y="35" font-size="14" fill="#263b30">σxx pusat elemen: ${lo.toPrecision(4)} … ${hi.toPrecision(4)} MPa</text>`;
  svg=svg.replace('deformasi belum dihitung','kontur tanpa deformasi');
 }
 const bottom=-h/2,strip=prepared.meta.strip_mm||0;
 for(const x of [strip/2,L-strip/2]){const a=xx(x),b=yy(bottom);marks+=`<path d="M${a},${b+2} l-8,12 h16 z" fill="#40594b"/><title>Tumpuan rata-rata strip</title>`;}
 const arrows=p.load==='point'?[L/2]:[L*.1,L*.3,L*.5,L*.7,L*.9];for(const x of arrows){const a=xx(x),b=yy(h/2);marks+=`<path d="M${a},${b-38} v28 m-5,-6 l5,6 l5,-6" fill="none" stroke="#b04f2a" stroke-width="2"/>`;}
 const roiX=xx(L/4);for(const y of h?[h/2,-h/2]:[0])marks+=`<circle cx="${roiX}" cy="${yy(y)}" r="4" fill="#734680"><title>ROI x=L/4, y=${y} mm</title></circle>`;
 marks+=`<text x="30" y="60" font-size="13" fill="#734680">Ungu: ROI x=L/4 · panah: arah beban · segitiga: tumpuan</text>`;
 return svg.replace('</svg>',marks+'</svg>');
}
