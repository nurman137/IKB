import {fail} from './algebra.js';
export const T6_QUADRATURE=[[1/6,1/6,1/6],[2/3,1/6,1/6],[1/6,2/3,1/6]];
export function t6Point(points,e,xi,eta){
 const l=1-xi-eta,N=[l*(2*l-1),xi*(2*xi-1),eta*(2*eta-1),4*l*xi,4*xi*eta,4*eta*l],dx=[1-4*l,4*xi-1,0,4*(l-xi),4*eta,-4*eta],dy=[1-4*l,0,4*eta-1,-4*xi,4*xi,4*(l-eta)];
 let a=0,b=0,c=0,d=0;for(let i=0;i<6;i++){a+=dx[i]*points[i][0];b+=dy[i]*points[i][0];c+=dx[i]*points[i][1];d+=dy[i]*points[i][1];}const det=a*d-b*c;
 if(!Number.isFinite(det)||det<=0)fail('invalid_mesh','Jacobian T6 tidak positif.');
 const B=Array.from({length:3},()=>new Float64Array(12));for(let i=0;i<6;i++){const x=(d*dx[i]-c*dy[i])/det,y=(-b*dx[i]+a*dy[i])/det;B[0][2*i]=x;B[1][2*i+1]=y;B[2][2*i]=y;B[2][2*i+1]=x;}
 const v=e.E/(1-e.nu**2),D=[[v,v*e.nu,0],[v*e.nu,v,0],[0,0,v*(1-e.nu)/2]];return {N,B,D,det,x:N.reduce((s,n,i)=>s+n*points[i][0],0),y:N.reduce((s,n,i)=>s+n*points[i][1],0)};
}
export function triangle6Element(points,e){
 if(!Number.isFinite(e.E)||e.E<=0||!Number.isFinite(e.t)||e.t<=0||!Number.isFinite(e.nu)||e.nu<0||e.nu>.45)fail('invalid_input','Material/ketebalan T6 tidak sah.');
 const a=points[0],b=points[1],c=points[2],twice=(b[0]-a[0])*(c[1]-a[1])-(c[0]-a[0])*(b[1]-a[1]),length=Math.max(...[a,b,c].map((p,i)=>Math.hypot(p[0]-[a,b,c][(i+1)%3][0],p[1]-[a,b,c][(i+1)%3][1])));
 if(twice<=1e-10*length**2)fail('invalid_mesh','T6 terbalik atau hampir degenerat.');
 for(let i=0;i<3;i++){const p=points[i],q=points[(i+1)%3],m=points[i+3];if(Math.hypot(m[0]-(p[0]+q[0])/2,m[1]-(p[1]+q[1])/2)>1e-8*length)fail('invalid_mesh','F2a mendukung T6 sisi lurus dengan node tengah tepat.');}
 const K=Array.from({length:12},()=>new Float64Array(12)),quadrature=T6_QUADRATURE.map(([xi,eta,w])=>({...t6Point(points,e,xi,eta),xi,eta,w}));
 for(const q of quadrature)for(let i=0;i<12;i++)for(let j=0;j<12;j++)for(let p=0;p<3;p++)for(let r=0;r<3;r++)K[i][j]+=e.t*q.w*q.det*q.B[p][i]*q.D[p][r]*q.B[r][j];
 return {K,...t6Point(points,e,1/3,1/3),area:twice/2,quadrature};
}
export function stressAt(B,D,u){const strain=B.map(row=>row.reduce((s,v,i)=>s+v*u[i],0)),stress=D.map(row=>row.reduce((s,v,i)=>s+v*strain[i],0)),[sx,sy,tau]=stress,mean=(sx+sy)/2,r=Math.hypot((sx-sy)/2,tau);return {strain,stress,principal:[mean+r,mean-r,0],vonMises:Math.sqrt(sx*sx-sx*sy+sy*sy+3*tau*tau)};}
