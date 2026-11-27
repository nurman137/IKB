// Developer fixtures only, not the 20 course cases.
export function beamFixture(segments=8,{angle=0,load=-1000,udl=false}={}){
 const L=1000,c=Math.cos(angle),s=Math.sin(angle),nodes=Array.from({length:segments+1},(_,i)=>[L*i/segments*c,L*i/segments*s]),elements=Array.from({length:segments},(_,i)=>({nodes:[i,i+1],E:200000,A:10000,I:100*100**3/12}));
 return {kernel:'BEAM2',nodes,elements,constraints:[0,1,2].map(dof=>({node:0,dof,value:0})),loads:udl?[]:[{node:segments,dof:0,value:-s*load},{node:segments,dof:1,value:c*load}],distributedLoads:udl?elements.map((_,element)=>({element,qx:0,qy:load/L})):[]};
}
export function patchFixture(nx=4,ny=4,{E=200000,nu=.3,thickness=10}={}){
 const nodes=[],elements=[],constraints=[],L=100,H=100;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const boundary=i===0||i===nx||j===0||j===ny;nodes.push([i*L/nx+(boundary?0:Math.sin(i*7+j*11)*L/nx*.12),j*H/ny+(boundary?0:Math.cos(i*13+j*5)*H/ny*.12)]);}
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+1,d=a+nx+1,c=d+1;for(const list of [[a,b,c],[a,c,d]])elements.push({nodes:list,E,nu,t:thickness});}
 for(let n=0;n<nodes.length;n++){const [x,y]=nodes[n];if(x===0||y===0||x===L||y===H){constraints.push({node:n,dof:0,value:.001*x+.0002*y},{node:n,dof:1,value:-.0003*y});}}
 return {kernel:'PS2',nodes,elements,constraints,loads:[]};
}
