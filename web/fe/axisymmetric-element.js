import {fail} from './algebra.js';
import {t6Point,triangle6Element} from './triangle6.js';
// Positive 6×6 Gauss–Duffy points strictly inside the triangle: never r=0.
export const AX_GAUSS=[[-.932469514203152,.17132449237917],[-.661209386466265,.360761573048139],[-.238619186083197,.467913934572691],[.238619186083197,.467913934572691],[.661209386466265,.360761573048139],[.932469514203152,.17132449237917]];
export function axisPoint(points,e,xi,eta){
 const q=t6Point(points,e,xi,eta),r=q.x;if(r<0)fail('invalid_mesh','Radius AX2 tidak boleh negatif.');
 const B=Array.from({length:4},()=>new Float64Array(12));
 for(let i=0;i<6;i++){B[0][2*i]=q.B[0][2*i];B[1][2*i+1]=q.B[1][2*i+1];B[2][2*i]=r===0?q.B[0][2*i]:q.N[i]/r;B[3][2*i]=q.B[2][2*i];B[3][2*i+1]=q.B[2][2*i+1];}
 const mu=e.E/(2*(1+e.nu)),lambda=e.E*e.nu/((1+e.nu)*(1-2*e.nu)),D=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>i<3&&j<3?lambda+(i===j?2*mu:0):i===3&&j===3?mu:0));
 return {...q,B,D,r,z:q.y};
}
export function axisStress(B,D,u,beta=0){
 const strain=B.map(row=>row.reduce((s,v,i)=>s+v*u[i],0)),elasticStrain=strain.map((v,i)=>v-(i<3?beta:0)),stress=D.map(row=>row.reduce((s,v,i)=>s+v*elasticStrain[i],0)),[rr,zz,tt,tau]=stress,mean=(rr+zz)/2,r=Math.hypot((rr-zz)/2,tau),principal=[mean+r,mean-r,tt];
 const [er,ez,et,g]=strain,em=(er+ez)/2,dr=Math.hypot((er-ez)/2,g/2);
 return {strain,elasticStrain,stress,principal,principalStrain:[em+dr,em-dr,et],vonMises:Math.sqrt(((rr-zz)**2+(zz-tt)**2+(tt-rr)**2)/2+3*tau*tau)};
}
export function axisElement(points,e){
 if(e.type!=='T6'||points.some(p=>p[0]<0))fail('invalid_mesh','AX2 memakai T6 sisi lurus pada r≥0.');
 // Reuse topology/material validation; no plane-stress stiffness is used for AX2.
 triangle6Element(points,{...e,t:1});
 const beta=e.thermalStrain??0;if(!Number.isFinite(beta))fail('invalid_input','Regangan awal termal tidak sah.');
 const K=Array.from({length:12},()=>new Float64Array(12)),thermalLoad=new Float64Array(12),quadrature=[];
 for(const [ga,wa] of AX_GAUSS)for(const [gb,wb] of AX_GAUSS){const xi=(ga+1)/2,v=(gb+1)/2,eta=(1-xi)*v,q=axisPoint(points,e,xi,eta),weight=wa*wb*(1-xi)/4*q.det*2*Math.PI*q.r;if(!(weight>0))fail('invalid_mesh','Bobot volume AX2 tidak positif.');quadrature.push({...q,xi,eta,weight});
  const DB=Array.from({length:4},(_,i)=>Array.from({length:12},(_,j)=>q.D[i].reduce((s,d,k)=>s+d*q.B[k][j],0))),sigmaTh=q.D.map(row=>beta*(row[0]+row[1]+row[2]));
  for(let i=0;i<12;i++){thermalLoad[i]+=weight*q.B.reduce((s,row,k)=>s+row[i]*sigmaTh[k],0);for(let j=0;j<12;j++)K[i][j]+=weight*q.B.reduce((s,row,k)=>s+row[i]*DB[k][j],0);}
 }
 return {K,thermalLoad,beta,quadrature,...axisPoint(points,e,1/3,1/3),volume:quadrature.reduce((s,q)=>s+q.weight,0)};
}
