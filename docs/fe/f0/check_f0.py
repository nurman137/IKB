"""Read-only integrity checks of F0 deliverables, not a solver test."""
from pathlib import Path
import json,hashlib,math
from collections import Counter
P=Path(__file__).resolve().parent;ROOT=P.parents[2]
m=json.loads((P/'case_matrix.json').read_text());f=json.loads((P/'analytic_fixtures.json').read_text());src=ROOT/'docs/m0/reference_cases.json';old=json.loads(src.read_text())['cases']
assert hashlib.sha256(src.read_bytes()).hexdigest()==m['m0_sha256']
assert len(m['cases'])==20 and {c['id'] for c in m['cases']}=={c['id'] for c in old}
assert len({c['route'] for c in m['cases']})==20
assert Counter(c['family'] for c in m['cases'])==dict(beam=7,axisymmetric=6,torsion=3,combined=2,pin_plate=2)
assert {c['id'] for c in f['cases']}=={c['id'] for c in old}
for c in m['cases']:
 b=next(x for x in old if x['id']==c['id']);assert c['baseline_input']==b['input']
 assert c['status']=='planned' and set(c['additional_input'])==set(c['additional_input_origin'])
 assert not set(c['baseline_input'])&set(c['additional_input'])
 assert all(c[k] for k in ['boundary_conditions','loading','limits','kernel','stage','comparison_roles'])
 assert c['route'].endswith('/'+c['context']+'/')
 if c['id'].startswith('04'):assert set(c['comparison_roles'].values())=={'analytic_only_not_FE_pin'}
def flat(d):
 for k,v in d.items():
  if isinstance(v,dict):
   for kk,vv in flat(v):yield k+'.'+kk,vv
  else:yield k,v
n=0
for c in f['cases']:
 assert c['status']=='analytic_reference_only_not_fe'
 got=dict(flat(c['expected']));want=dict(flat(next(x for x in old if x['id']==c['id'])['expected']));assert got.keys()==want.keys()
 for k,v in want.items():assert math.isfinite(got[k]) and abs(got[k]-v)<=1e-9+abs(v)*1e-6;n+=1
assert n==133
for name in ['README.md','01_spesifikasi_model.md','02_matriks_20_kasus.md','03_validasi_dan_toleransi.md','04_alur_belajar_dan_data.md','05_milestone_dan_risiko.md','06_rujukan.md']:
 assert (P/name).stat().st_size>100
print('PASS F0: 20 cases; 133 analytic references; 5 families; baseline/provenance/routes/status valid. No FE validation claimed.')
