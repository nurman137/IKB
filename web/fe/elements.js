import {fail} from './algebra.js';
const positive=(x,label)=>{if(!Number.isFinite(x)||x<=0)fail('invalid_input',`${label} harus positif dan finite.`);};
const zeros=n=>Array.from({length:n},()=>new Float64Array(n));
export function beamElement(a,b,e){
 positive(e.E,'E');positive(e.A,'A');positive(e.I,'I');
 const dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy);positive(L,'Panjang elemen');const c=dx/L,s=dy/L,K=zeros(6),T=zeros(6),EA=e.E*e.A/L,v=e.E*e.I/L**3;
 K[0][0]=K[3][3]=EA;K[0][3]=K[3][0]=-EA;
 const ix=[1,2,4,5],B=[[12,6*L,-12,6*L],[6*L,4*L*L,-6*L,2*L*L],[-12,-6*L,12,-6*L],[6*L,2*L*L,-6*L,4*L*L]];
 ix.forEach((i,ii)=>ix.forEach((j,jj)=>K[i][j]=v*B[ii][jj]));
 for(const n of [0,3]){T[n][n]=c;T[n][n+1]=s;T[n+1][n]=-s;T[n+1][n+1]=c;T[n+2][n+2]=1;}
 const global=zeros(6);for(let i=0;i<6;i++)for(let j=0;j<6;j++)for(let p=0;p<6;p++)for(let q=0;q<6;q++)global[i][j]+=T[p][i]*K[p][q]*T[q][j];
 return {K:global,localK:K,T,L};
}
export function triangleElement(points,e){
 positive(e.E,'E');positive(e.t,'Ketebalan');if(!Number.isFinite(e.nu)||e.nu<0||e.nu>.45)fail('invalid_input','Gunakan 0 ≤ ν ≤ 0,45 pada prototipe PS2.');
 const [[x1,y1],[x2,y2],[x3,y3]]=points,twice=(x2-x1)*(y3-y1)-(x3-x1)*(y2-y1),maxSide=Math.max(...points.map((a,i)=>Math.hypot(a[0]-points[(i+1)%3][0],a[1]-points[(i+1)%3][1])));
 if(!Number.isFinite(twice)||twice<=1e-10*maxSide**2)fail('invalid_mesh','Segitiga terbalik atau hampir degenerat. Urutan node harus CCW.');
 const area=twice/2,B=Array.from({length:3},()=>new Float64Array(6)),bb=[y2-y3,y3-y1,y1-y2],cc=[x3-x2,x1-x3,x2-x1];
 for(let i=0;i<3;i++){B[0][2*i]=bb[i]/twice;B[1][2*i+1]=cc[i]/twice;B[2][2*i]=cc[i]/twice;B[2][2*i+1]=bb[i]/twice;}
 const d=e.E/(1-e.nu**2),D=[[d,d*e.nu,0],[d*e.nu,d,0],[0,0,d*(1-e.nu)/2]],K=zeros(6);
 for(let i=0;i<6;i++)for(let j=0;j<6;j++)for(let p=0;p<3;p++)for(let q=0;q<3;q++)K[i][j]+=e.t*area*B[p][i]*D[p][q]*B[q][j];
 return {K,B,D,area};
}
export function beamDistributed(el,qx=0,qy=0){if(!Number.isFinite(qx)||!Number.isFinite(qy))fail('invalid_input','Beban merata harus finite.');const L=el.L,local=Float64Array.from([qx*L/2,qy*L/2,qy*L*L/12,qx*L/2,qy*L/2,-qy*L*L/12]),global=new Float64Array(6);for(let i=0;i<6;i++)for(let j=0;j<6;j++)global[i]+=el.T[j][i]*local[j];return {local,global};}
