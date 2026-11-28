"""Independent SI-agnostic dense oracle: numerical quadrature for frame,
coefficient interpolation for T3, NumPy direct solve. Does not import web code."""
import json,math
from pathlib import Path
import numpy as np
p=Path(__file__).resolve().parent
angle=math.radians(37);c=math.cos(angle);s=math.sin(angle)
models=[{'id':'frame-variable-rotated','kernel':'BEAM2','nodes':[[x*c,x*s] for x in [0,500,800]],'elements':[{'nodes':[0,1],'E':200000,'A':1000,'I':1e6},{'nodes':[1,2],'E':70000,'A':800,'I':2e6}],'constraints':[{'node':0,'dof':k,'value':0} for k in range(3)],'loads':[{'node':2,'dof':0,'value':2000*c+1000*s},{'node':2,'dof':1,'value':2000*s-1000*c},{'node':2,'dof':2,'value':300000}]},
 {'id':'solid-loaded-irregular','kernel':'PS2','nodes':[[0,0],[2,0],[2,1],[0,1],[.7,.4]],'elements':[{'nodes':n,'E':210000,'nu':.29,'t':3} for n in [[0,1,4],[1,2,4],[2,3,4],[3,0,4]]],'constraints':[{'node':i,'dof':k,'value':0} for i in [0,3] for k in [0,1]],'loads':[{'node':1,'dof':0,'value':50},{'node':2,'dof':1,'value':-30}]}]
out=[]
for model in models:
 d=3 if model['kernel']=='BEAM2' else 2;n=len(model['nodes'])*d;K=np.zeros((n,n));f=np.zeros(n)
 for e in model['elements']:
  pts=np.array([model['nodes'][i] for i in e['nodes']]);indices=[i*d+k for i in e['nodes'] for k in range(d)]
  if d==3:
   dx=pts[1]-pts[0];L=np.linalg.norm(dx);cc,ss=dx/L;T=np.zeros((6,6))
   for j in [0,3]:T[j:j+2,j:j+2]=[[cc,ss],[-ss,cc]];T[j+2,j+2]=1
   kl=np.zeros((6,6));gauss,weights=np.polynomial.legendre.leggauss(3)
   for g,w in zip(gauss,weights):
    xi=(g+1)/2;ba=np.array([-1/L,0,0,1/L,0,0]);bb=np.array([0,(-6+12*xi)/L**2,(-4+6*xi)/L,0,(6-12*xi)/L**2,(-2+6*xi)/L]);kl+=(e['E']*e['A']*np.outer(ba,ba)+e['E']*e['I']*np.outer(bb,bb))*w*L/2
   ke=T.T@kl@T
  else:
   coefficients=np.linalg.solve(np.column_stack([np.ones(3),pts]),np.eye(3));area=np.linalg.det(np.column_stack([np.ones(3),pts]))/2;B=np.zeros((3,6))
   for j in range(3):
    dx,dy=coefficients[1,j],coefficients[2,j];B[:,2*j]=[dx,0,dy];B[:,2*j+1]=[0,dy,dx]
   nu=e['nu'];D=e['E']/(1-nu*nu)*np.array([[1,nu,0],[nu,1,0],[0,0,(1-nu)/2]]);ke=e['t']*area*B.T@D@B
  K[np.ix_(indices,indices)]+=ke
 for l in model['loads']:f[l['node']*d+l['dof']]+=l['value']
 u=np.zeros(n);fixed=[]
 for bc in model['constraints']:index=bc['node']*d+bc['dof'];u[index]=bc['value'];fixed.append(index)
 free=[i for i in range(n) if i not in fixed];u[free]=np.linalg.solve(K[np.ix_(free,free)],f[free]-K[np.ix_(free,fixed)]@u[fixed]);reaction=K@u-f;reaction[free]=0
 out.append({'model':model,'displacements':u.tolist(),'reactions':reaction.tolist(),'energy_Nmm':float(.5*u@K@u)})
(p/'reference_numpy.json').write_text(json.dumps({'status':'independent_numpy_dense_oracle','numpy_version':np.__version__,'cases':out},indent=2)+'\n')
print('Wrote two independent NumPy reference cases.')
