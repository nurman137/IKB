// Sparse Float64 linear algebra. No inverse, artificial springs or external dependency.
export class FEError extends Error {constructor(status,message){super(message);this.status=status;}}
export const fail=(status,message)=>{throw new FEError(status,message);};
export const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
export const norm=a=>a.reduce((s,x)=>Math.max(s,Math.abs(x)),0);
export function sparse(rows){const n=rows.length,ptr=new Int32Array(n+1),cols=[],values=[];for(let i=0;i<n;i++){for(const [j,v] of [...rows[i]].sort((a,b)=>a[0]-b[0]))if(v!==0){cols.push(j);values.push(v);}ptr[i+1]=cols.length;}return {n,ptr,cols:Int32Array.from(cols),values:Float64Array.from(values)};}
export function multiply(A,x){const y=new Float64Array(A.n);for(let i=0;i<A.n;i++)for(let p=A.ptr[i];p<A.ptr[i+1];p++)y[i]+=A.values[p]*x[A.cols[p]];return y;}
export const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
export function denseCholesky(A,b){
 if(A.n>256)fail('invalid_input','Solver referensi dense dibatasi 256 DOF.');
 const n=A.n,L=Array.from({length:n},()=>new Float64Array(n));let diagMax=0;
 for(let i=0;i<n;i++)for(let p=A.ptr[i];p<A.ptr[i+1];p++){L[i][A.cols[p]]=A.values[p];if(A.cols[p]===i)diagMax=Math.max(diagMax,A.values[p]);}
 for(let i=0;i<n;i++)for(let j=0;j<=i;j++){let v=L[i][j];for(let k=0;k<j;k++)v-=L[i][k]*L[j][k];if(i===j){if(!Number.isFinite(v)||v<=diagMax*1e-13)fail('underconstrained','Pivot tidak positif atau sistem terlalu ill-conditioned.');L[i][j]=Math.sqrt(v);}else L[i][j]=v/L[j][j];}
 const y=Float64Array.from(b),x=new Float64Array(n);for(let i=0;i<n;i++){for(let j=0;j<i;j++)y[i]-=L[i][j]*y[j];y[i]/=L[i][i];}for(let i=n-1;i>=0;i--){let v=y[i];for(let j=i+1;j<n;j++)v-=L[j][i]*x[j];x[i]=v/L[i][i];}return x;
}
export async function pcg(A,b,{cancel=()=>false,progress=()=>{},maxIterations=Math.min(30000,Math.max(200,A.n*4)),tolerance=1e-10}={}){
 if(cancel())fail('cancelled','Analisis dibatalkan.');
 if(!Number.isFinite(tolerance)||tolerance<=0||!Number.isInteger(maxIterations)||maxIterations<1)fail('invalid_input','Opsi solver tidak sah.');
 const n=A.n,x=new Float64Array(n),r=Float64Array.from(b),D=new Float64Array(n),z=new Float64Array(n),p=new Float64Array(n);
 for(let i=0;i<n;i++){for(let k=A.ptr[i];k<A.ptr[i+1];k++)if(A.cols[k]===i)D[i]=A.values[k];if(!(D[i]>0))fail('underconstrained','DOF bebas tidak mempunyai kekakuan positif.');z[i]=r[i]/D[i];p[i]=z[i];}
 const scale=Math.max(norm(b),1),target=tolerance*scale;if(norm(r)<=target)return {x,iterations:0};let rz=dot(r,z);
 for(let it=1;it<=maxIterations;it++){
  const Ap=multiply(A,p),den=dot(p,Ap);if(!Number.isFinite(den)||den<=0)fail('solver_failed','Kelengkungan matriks tidak positif; periksa model dan tumpuan.');
  const alpha=rz/den;for(let i=0;i<n;i++){x[i]+=alpha*p[i];r[i]-=alpha*Ap[i];}
  if(norm(r)<=target){const exact=multiply(A,x);for(let i=0;i<n;i++)r[i]=b[i]-exact[i];if(norm(r)<=target)return {x,iterations:it};}
  for(let i=0;i<n;i++)z[i]=r[i]/D[i];const next=dot(r,z),beta=next/rz;for(let i=0;i<n;i++)p[i]=z[i]+beta*p[i];rz=next;
  if(it%32===0){progress({phase:'solve',iterations:it,residual:norm(r)/scale});await tick();if(cancel())fail('cancelled','Analisis dibatalkan.');}
 }
 fail('solver_failed','Iterasi tidak konvergen. Hasil tidak digunakan.');
}
// SPD direct fallback for narrow-band frame systems. Storage O(n*bandwidth).
export function bandedCholesky(A,b,maxBand=32){
 let band=0,maxDiag=0;for(let i=0;i<A.n;i++)for(let k=A.ptr[i];k<A.ptr[i+1];k++){band=Math.max(band,Math.abs(i-A.cols[k]));if(A.cols[k]===i)maxDiag=Math.max(maxDiag,A.values[k]);}
 if(band>maxBand)return null;const width=band+1,n=A.n,L=new Float64Array(n*width);
 const at=(i,j)=>i>=j&&i-j<=band?L[i*width+i-j]:0;
 for(let i=0;i<n;i++)for(let k=A.ptr[i];k<A.ptr[i+1];k++){const j=A.cols[k];if(j<=i)L[i*width+i-j]=A.values[k];}
 for(let i=0;i<n;i++)for(let j=Math.max(0,i-band);j<=i;j++){let v=at(i,j);for(let k=Math.max(0,i-band,j-band);k<j;k++)v-=at(i,k)*at(j,k);if(i===j){if(!Number.isFinite(v)||v<=maxDiag*1e-13)fail('underconstrained','Pivot banded tidak positif atau sistem ill-conditioned.');L[i*width]=Math.sqrt(v);}else L[i*width+i-j]=v/at(j,j);}
 const x=Float64Array.from(b);for(let i=0;i<n;i++){for(let j=Math.max(0,i-band);j<i;j++)x[i]-=at(i,j)*x[j];x[i]/=at(i,i);}
 for(let i=n-1;i>=0;i--){for(let j=i+1;j<=Math.min(n-1,i+band);j++)x[i]-=at(j,i)*x[j];x[i]/=at(i,i);}return x;
}
