"""Independent T6 oracle using Cartesian polynomial interpolation and KKT constraints.
Run: python docs/fe/f2a/reference_numpy.py. Requires NumPy for oracle regeneration only.
"""
import json
from pathlib import Path
import numpy as np
nodes=[[0,0],[2,0],[2,1],[0,1]]; mids={};elements=[]
for a,b,c in [(0,1,2),(0,2,3)]:
 ids=[a,b,c]
 for i,j in [(a,b),(b,c),(c,a)]:
  key=tuple(sorted((i,j)))
  if key not in mids:
   mids[key]=len(nodes);nodes.append(((np.array(nodes[i])+nodes[j])/2).tolist())
  ids.append(mids[key])
 elements.append(dict(type='T6',nodes=ids,E=210000,nu=.29,t=3))
left=[(0,1/6),(3,1/6),(mids[(0,3)],2/3)];right=[(1,1/6),(2,1/6),(mids[(1,2)],2/3)]
cs=[dict(value=v,terms=[dict(node=i,dof=d,coefficient=w) for i,w in group]) for group,d,v in [(left,0,.001),(left,1,-.002),(right,1,0)]]
model=dict(kernel='PS2',nodes=nodes,elements=elements,constraints=[],linearConstraints=cs,loads=[dict(node=2,dof=1,value=-30),dict(node=mids[(2,3)],dof=0,value=20)])
n=2*len(nodes);K=np.zeros((n,n));f=np.zeros(n)
for e in elements:
 pts=np.array([nodes[i] for i in e['nodes']]);x,y=pts.T
 C=np.linalg.inv(np.column_stack([x*0+1,x,y,x*x,x*y,y*y]));area=np.linalg.det(np.column_stack([np.ones(3),pts[:3]]))/2
 nu=e['nu'];D=e['E']/(1-nu*nu)*np.array([[1,nu,0],[nu,1,0],[0,0,(1-nu)/2]]);ke=np.zeros((12,12))
 for bary in [[2/3,1/6,1/6],[1/6,2/3,1/6],[1/6,1/6,2/3]]:
  xx,yy=np.array(bary)@pts[:3];dx=np.array([0,1,0,2*xx,yy,0])@C;dy=np.array([0,0,1,0,xx,2*yy])@C;B=np.zeros((3,12));B[0,::2]=dx;B[1,1::2]=dy;B[2,::2]=dy;B[2,1::2]=dx;ke+=area/3*e['t']*B.T@D@B
 idx=[2*i+d for i in e['nodes'] for d in [0,1]];K[np.ix_(idx,idx)]+=ke
for l in model['loads']:f[2*l['node']+l['dof']]+=l['value']
A=np.zeros((3,n));g=np.array([c['value'] for c in cs])
for j,c in enumerate(cs):
 for t in c['terms']:A[j,2*t['node']+t['dof']]=t['coefficient']
block=np.block([[K,A.T],[A,np.zeros((3,3))]]);sol=np.linalg.solve(block,np.r_[f,g]);u=sol[:n]
out=dict(model=model,displacements=u.tolist(),reactions=(K@u-f).tolist(),energy=float(u@K@u/2))
Path(__file__).with_name('reference_numpy.json').write_text(json.dumps(out,indent=2)+'\n')
