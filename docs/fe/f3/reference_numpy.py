"""Independent AX2 oracle: Cartesian polynomial T6 interpolation, 8×8 quadrature,
full 3D constitutive matrix and NumPy Dirichlet solve; no production imports.
"""
import json
from pathlib import Path
import numpy as np
results=[]
for ri in [0,.3]:
 nodes=[[ri,0],[1,0],[1,2],[ri,2]];mids={};elements=[]
 for a,b,c in [(0,1,2),(0,2,3)]:
  ids=[a,b,c]
  for i,j in [(a,b),(b,c),(c,a)]:
   key=tuple(sorted((i,j)))
   if key not in mids:mids[key]=len(nodes);nodes.append(((np.array(nodes[i])+nodes[j])/2).tolist())
   ids.append(mids[key])
  elements.append(dict(type='T6',nodes=ids,E=71000,nu=.28,thermalStrain=.0002))
 constraints=[dict(node=i,dof=1,value=.0001) for i,p in enumerate(nodes) if p[1]==0]+[dict(node=i,dof=0,value=0) for i,p in enumerate(nodes) if p[0]==0]
 model=dict(kernel='AX2',nodes=nodes,elements=elements,constraints=constraints,loads=[dict(node=2,dof=1,value=20),dict(node=2,dof=0,value=2),dict(node=mids[(2,3)],dof=1,value=30)])
 nd=2*len(nodes);K=np.zeros((nd,nd));fth=np.zeros(nd);f=np.zeros(nd);cache=[];gauss,weights=np.polynomial.legendre.leggauss(8)
 for e in elements:
  pts=np.array([nodes[i] for i in e['nodes']]);r,z=pts.T;C=np.linalg.inv(np.column_stack([r*0+1,r,z,r*r,r*z,z*z]));area=np.linalg.det(np.column_stack([np.ones(3),pts[:3]]))/2;mu=e['E']/(2*(1+e['nu']));lam=e['E']*e['nu']/((1+e['nu'])*(1-2*e['nu']));D=np.zeros((4,4));D[:3,:3]=lam;D[range(3),range(3)]+=2*mu;D[3,3]=mu
  def getB(rr,zz):
   N=np.array([1,rr,zz,rr*rr,rr*zz,zz*zz])@C;dr=np.array([0,1,0,2*rr,zz,0])@C;dz=np.array([0,0,1,0,rr,2*zz])@C;B=np.zeros((4,12));B[0,::2]=dr;B[1,1::2]=dz;B[2,::2]=N/rr;B[3,::2]=dz;B[3,1::2]=dr;return B
  ke=np.zeros((12,12));ft=np.zeros(12);quads=[];beta=e['thermalStrain'];eth=np.array([beta,beta,beta,0])
  for ga,wa in zip(gauss,weights):
   for gb,wb in zip(gauss,weights):
    xi=(ga+1)/2;eta=(1-xi)*(gb+1)/2;rr,zz=np.array([1-xi-eta,xi,eta])@pts[:3];w=wa*wb*(1-xi)/4*2*area*2*np.pi*rr;B=getB(rr,zz);ke+=w*B.T@D@B;ft+=w*B.T@D@eth;quads.append((w,B))
  ids=[2*i+d for i in e['nodes'] for d in [0,1]];K[np.ix_(ids,ids)]+=ke;fth[ids]+=ft;centroid=pts[:3].mean(axis=0);cache.append((ids,quads,D,eth,getB(*centroid)))
 for load in model['loads']:f[2*load['node']+load['dof']]+=load['value']
 u=np.zeros(nd);fixed=[]
 for c in constraints:i=2*c['node']+c['dof'];u[i]=c['value'];fixed.append(i)
 free=[i for i in range(nd) if i not in fixed];u[free]=np.linalg.solve(K[np.ix_(free,free)],(f+fth-K@u)[free]);reaction=K@u-f-fth;elastic=0;fields=[]
 for ids,qs,D,eth,Bcenter in cache:
  ue=u[ids];fields.append((D@(Bcenter@ue-eth)).tolist())
  for w,B in qs:eps=B@ue-eth;elastic+=w*eps@D@eps/2
 results.append(dict(model=model,displacements=u.tolist(),reactions=reaction.tolist(),stress=fields,elasticEnergy_Nmm=float(elastic)))
Path(__file__).with_name('reference_numpy.json').write_text(json.dumps(results,indent=2)+'\n')
