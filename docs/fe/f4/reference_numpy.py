"""Independent scalar warping oracle: Cartesian quadratic interpolation and a
mean-zero Lagrange multiplier KKT solve, not production pin/elimination."""
import json
from pathlib import Path
import numpy as np
nodes=[[-2,-1],[2,-1],[2,1],[-2,1],[-.3,.15]];mid={};elements=[]
for a,b,c in [(0,1,4),(1,2,4),(2,3,4),(3,0,4)]:
 ids=[a,b,c]
 for i,j in [(a,b),(b,c),(c,a)]:
  edge=tuple(sorted((i,j)))
  if edge not in mid:mid[edge]=len(nodes);nodes.append(((np.array(nodes[i])+nodes[j])/2).tolist())
  ids.append(mid[edge])
 elements.append(dict(type='T6',nodes=ids))
n=len(nodes);K=np.zeros((n,n));f=np.zeros(n);mass=np.zeros(n);cache=[]
for e in elements:
 pts=np.array([nodes[i] for i in e['nodes']]);x,y=pts.T;C=np.linalg.inv(np.column_stack([x*0+1,x,y,x*x,x*y,y*y]));area=np.linalg.det(np.column_stack([np.ones(3),pts[:3]]))/2;qs=[]
 for bary in [[2/3,1/6,1/6],[1/6,2/3,1/6],[1/6,1/6,2/3]]:
  xx,yy=np.array(bary)@pts[:3];N=np.array([1,xx,yy,xx*xx,xx*yy,yy*yy])@C;dx=np.array([0,1,0,2*xx,yy,0])@C;dy=np.array([0,0,1,0,xx,2*yy])@C;w=area/3;idx=e['nodes'];K[np.ix_(idx,idx)]+=w*(np.outer(dx,dx)+np.outer(dy,dy));f[idx]+=w*(yy*dx-xx*dy);mass[idx]+=w*N;qs.append((w,xx,yy,dx,dy))
 cache.append(qs)
block=np.block([[K,mass[:,None]],[mass[None,:],np.zeros((1,1))]]);psi=np.linalg.solve(block,np.r_[f,0])[:n];J=0;Jtorque=0
for e,qs in zip(elements,cache):
 ue=psi[e['nodes']]
 for w,x,y,dx,dy in qs:
  qx=dx@ue-y;qy=dy@ue+x;J+=w*(qx*qx+qy*qy);Jtorque+=w*(x*qy-y*qx)
model=dict(kernel='TOR2',nodes=nodes,elements=elements,G_MPa=70000,L_mm=50,T_Nmm=100)
Path(__file__).with_name('reference_numpy.json').write_text(json.dumps(dict(model=model,warping=psi.tolist(),Jt_mm4=float(J),Jtorque_mm4=float(Jtorque)),indent=2)+'\n')
