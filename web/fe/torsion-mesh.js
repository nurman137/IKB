export const TOR_LEVELS={coarse:{segments:128,layers:2},medium:{segments:192,layers:4},fine:{segments:256,layers:8}};
export function polarT6Mesh({ro,ri=0,segments=128,layers=2,stretchY=1}){
 if(![ro,ri,stretchY].every(Number.isFinite)||ro<=0||ri<0||ri>=ro||stretchY<=0||!Number.isInteger(segments)||segments<8||segments%4||!Number.isInteger(layers)||layers<1)return {status:'invalid_mesh',message:'Geometri/ring pembagian penampang tidak sah.'};
 const count=ri===0?1+segments*(4*layers-1):segments*(4*layers+2);if(count>10000||2*segments*layers>8000)return {status:'invalid_mesh',message:'Mesh TOR2 melewati 10.000 DOF / 8.000 elemen. Pilih mesh lebih kasar.'};
 const nodes=[],elements=[],midpoints=new Map(),solid=ri===0;
 if(solid)nodes.push([0,0]);const ring=(j,k)=>(solid?1:0)+(j-(solid?1:0))*segments+(k+segments)%segments;
 for(let j=solid?1:0;j<=layers;j++){const r=ri+(ro-ri)*j/layers;for(let k=0;k<segments;k++){const angle=2*Math.PI*k/segments;nodes.push([r*Math.cos(angle),stretchY*r*Math.sin(angle)]);}}
 function mid(a,b){const key=[a,b].sort((x,y)=>x-y).join(',');if(!midpoints.has(key)){midpoints.set(key,nodes.length);nodes.push(nodes[a].map((x,i)=>(x+nodes[b][i])/2));}return midpoints.get(key);}
 function add(a,b,c){elements.push({type:'T6',nodes:[a,b,c,mid(a,b),mid(b,c),mid(c,a)]});}
 if(solid)for(let k=0;k<segments;k++)add(0,ring(1,k),ring(1,k+1));
 for(let j=solid?1:0;j<layers;j++)for(let k=0;k<segments;k++){const a=ring(j,k),b=ring(j+1,k),c=ring(j+1,k+1),d=ring(j,k+1);add(a,b,c);add(a,c,d);}
 return {status:'ready',nodes,elements,meta:{ro,ri,segments,layers,stretchY}};
}
