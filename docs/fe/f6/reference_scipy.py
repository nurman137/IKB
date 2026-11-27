"""Independent PIN-PLATE reference v1. Cartesian polynomial T6, SciPy sparse direct.
Own mesher: 192 base angular rays + rectangle corners, 14 geometric rings,
alternating quad diagonals (production uses fixed diagonals, max 128/8).
No production imports. Units d=F=t=1, E=200000 MPa, nu=.3.
"""
import json,math,hashlib
from pathlib import Path
import numpy as np
import scipy
from scipy.sparse import coo_matrix
from scipy.sparse.linalg import spsolve
nbase,nr=192,14
angles=sorted([2*math.pi*i/nbase for i in range(nbase)]+[math.atan2(3,5),2*math.pi-math.atan2(3,5)])
n=len(angles); nodes=[]; tris=[]; mids={}
for j in range(nr+1):
 for a in angles:
  c,s=math.cos(a),math.sin(a); R=min((5 if c>=0 else -3)/c,3/abs(s) if abs(s)>1e-14 else math.inf)
  r=.5*(R/.5)**(j/nr);nodes.append([3+r*c,r*s])
def mid(a,b):
 key=tuple(sorted([a,b]))
 if key not in mids:mids[key]=len(nodes);nodes.append(((np.array(nodes[a])+nodes[b])/2).tolist())
 return mids[key]
def add(a,b,c):tris.append([a,b,c,mid(a,b),mid(b,c),mid(c,a)])
for j in range(nr):
 for k in range(n):
  a=j*n+k;b=(j+1)*n+k;c=(j+1)*n+(k+1)%n;d=j*n+(k+1)%n
  if (j+k)%2:add(a,b,d);add(b,c,d)
  else:add(a,b,c);add(a,c,d)
nodes=np.array(nodes); E=200000.;nu=.3;D=E/(1-nu*nu)*np.array([[1,nu,0],[nu,1,0],[0,0,(1-nu)/2]])
# Interpolation is obtained by an independently inverted Cartesian Vandermonde.
def poly(x,y):return np.array([1,x,y,x*x,x*y,y*y])
def B_at(inv,x,y):
 dx=np.array([0,1,0,2*x,y,0])@inv;dy=np.array([0,0,1,0,x,2*y])@inv
 B=np.zeros((3,12));B[0,::2]=dx;B[1,1::2]=dy;B[2,::2]=dy;B[2,1::2]=dx
 return B
I=[];J=[];V=[];cache=[]
for e in tris:
 pts=nodes[e];inv=np.linalg.inv(np.array([poly(*p) for p in pts]));area=np.linalg.det(np.array([pts[1]-pts[0],pts[2]-pts[0]]))/2;ke=np.zeros((12,12))
 for w in [[2/3,1/6,1/6],[1/6,2/3,1/6],[1/6,1/6,2/3]]:
  x,y=np.array(w)@pts[:3];B=B_at(inv,x,y);ke+=area/3*(B.T@D@B)
 dofs=np.array([[2*i,2*i+1] for i in e]).ravel();I.extend(np.repeat(dofs,12));J.extend(np.tile(dofs,12));V.extend(ke.ravel());cache.append((e,inv,dofs))
K=coo_matrix((V,(I,J)),shape=(2*len(nodes),)*2).tocsr();f=np.zeros(2*len(nodes))
for k in range(n):
 a,b=k,(k+1)%n;m=mids[tuple(sorted([a,b]))];A,B=nodes[[a,b]];le=np.linalg.norm(B-A)
 for s,w in zip(*np.polynomial.legendre.leggauss(5)):
  x,y=(A+B)/2+s*(B-A)/2;angle=math.atan2(y,x-3);c=math.cos(angle);tr=4/math.pi*np.array([c*c,c*math.sin(angle)]) if c>1e-12 else np.zeros(2)
  for node,N in zip([a,b,m],[s*(s-1)/2,s*(s+1)/2,1-s*s]):f[2*node:2*node+2]+=tr*N*le*w/2
f/=f[::2].sum();fixed=np.array([2*i+k for i,(x,y) in enumerate(nodes) if abs(x)<1e-9 for k in [0,1]]);free=np.setdiff1d(np.arange(len(f)),fixed);u=np.zeros(len(f));u[free]=spsolve(K[free][:,free],f[free]);res=K@u-f
path=[]
for x,y in [[1,0],[1.5,0],[2,1],[3,1],[4,0]]:
 ss=[];us=[]
 for e,inv,dofs in cache:
  A,B,C=nodes[e[:3]];coords=np.linalg.solve(np.array([B-A,C-A]).T,np.array([x,y])-A)
  if min(coords)>=-1e-8 and sum(coords)<=1+1e-8:ss.append((D@B_at(inv,x,y)@u[dofs]).tolist());us.append((poly(x,y)@inv@u[dofs].reshape(6,2)).tolist())
 path.append({'x':x,'y':y,'stress':np.mean(ss,axis=0).tolist(),'displacement':np.mean(us,axis=0).tolist()})
out={'version':1,'method':'independent Cartesian Vandermonde T6, alternating mesh, SciPy sparse spsolve','numpy':np.__version__,'scipy':scipy.__version__,'nodes':len(nodes),'elements':len(tris),'normalization':{'d':1,'t':1,'F':1,'E':E,'nu':nu},'energy':float(u@(K@u)/2),'reactionX':float(res[::2].sum()),'residual':float(np.linalg.norm(res[free])),'path':path}
Path(__file__).with_suffix('.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({k:out[k] for k in ['nodes','elements','energy','reactionX','residual']}))
