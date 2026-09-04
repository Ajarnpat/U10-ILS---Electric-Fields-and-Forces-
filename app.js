
const $=(s)=>document.querySelector(s), $$=(s)=>[...document.querySelectorAll(s)];
const mod=document.body.dataset.module;
const canvas=$('#simCanvas'), ctx=canvas?.getContext('2d');
let W=0,H=0,DPR=1,drag=false,lastX=0,lastY=0,rotX=.35,rotY=-.45,t=0,run=true;
const state={q1:1,q2:-1,r:2,mode:0,probeX:.9,probeY:.2,plateSep:2,area:2,kappa:1,v0:2,charge:1,mass:1,showVectors:true};

function fit(){if(!canvas)return; const r=canvas.getBoundingClientRect(); DPR=Math.min(2,devicePixelRatio||1); canvas.width=r.width*DPR;canvas.height=r.height*DPR;W=r.width;H=r.height;ctx.setTransform(DPR,0,0,DPR,0,0)}
addEventListener('resize',fit); fit();
function clear(){ctx.clearRect(0,0,W,H)}
function line(x1,y1,x2,y2,c='#8fdfff',lw=1){ctx.strokeStyle=c;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function arrow(x1,y1,x2,y2,c='#dff7ff',lw=2){line(x1,y1,x2,y2,c,lw);let a=Math.atan2(y2-y1,x2-x1),s=7;ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-s*Math.cos(a-.45),y2-s*Math.sin(a-.45));ctx.lineTo(x2-s*Math.cos(a+.45),y2-s*Math.sin(a+.45));ctx.fill()}
function circ(x,y,r,c,txt=''){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();if(txt){ctx.fillStyle='#fff';ctx.font='700 16px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,x,y)}}
function text(s,x,y,size=13,c='#d8edf8',align='left'){ctx.fillStyle=c;ctx.font=`${size}px system-ui`;ctx.textAlign=align;ctx.textBaseline='alphabetic';ctx.fillText(s,x,y)}
function grid(){ctx.strokeStyle='#163c55';ctx.lineWidth=1;for(let x=20;x<W;x+=40)line(x,0,x,H,'#12354d',1);for(let y=20;y<H;y+=40)line(0,y,W,y,'#12354d',1)}
function fieldAt(x,y,charges){let ex=0,ey=0;for(const q of charges){let dx=x-q.x,dy=y-q.y,r2=dx*dx+dy*dy+.01,r=Math.sqrt(r2);ex+=q.q*dx/(r2*r);ey+=q.q*dy/(r2*r)}return [ex,ey]}
function drawField(charges){for(let y=45;y<H;y+=48)for(let x=45;x<W;x+=48){let [ex,ey]=fieldAt(x,y,charges),m=Math.hypot(ex,ey),sc=Math.min(18,6+9*Math.log1p(m*2500));if(m>0)arrow(x,y,x+ex/m*sc,y+ey/m*sc,'rgba(135,220,255,.7)',1)}}
function charge(x,y,q){circ(x,y,18,q>0?'#ff6b65':'#459cf0',q>0?'+':'−')}
function axesGraph(x,y,w,h,fn,label){line(x,y+h,x+w,y+h,'#6d8da3');line(x,y,x,y+h,'#6d8da3');text(label,x+7,y+16,12,'#b9d5e5');ctx.strokeStyle='#65caff';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<w;i++){let xx=(i/w)*4+.2, val=fn(xx), yy=y+h/2-val*h*.16; i?ctx.lineTo(x+i,yy):ctx.moveTo(x+i,yy)}ctx.stroke()}
function updateReadouts(obj){Object.entries(obj).forEach(([k,v])=>{let e=document.querySelector(`[data-readout="${k}"]`);if(e)e.textContent=v})}
function bindRanges(){ $$('input[type=range]').forEach(el=>el.addEventListener('input',()=>{state[el.dataset.key]=+el.value;run=false}));}
bindRanges();

function sim1(){
 grid(); let cx=W*.5, cy=H*.42, r=Math.min(W*.32,state.r*85),x1=cx-r/2,x2=cx+r/2;
 charge(x1,cy,state.q1);charge(x2,cy,state.q2);
 let attr=state.q1*state.q2<0, dir=attr?1:-1, F=Math.abs(state.q1*state.q2)/(state.r*state.r);
 arrow(x1,cy-35,x1+dir*80*F,cy-35,'#ffd36b',3);arrow(x2,cy-35,x2-dir*80*F,cy-35,'#ffd36b',3);
 text(attr?'attraction':'repulsion',cx,cy+64,14,'#d9ecf7','center');
 axesGraph(40,H-150,W*.36,115,x=>1/(x*x),'F ∝ 1/r²');
 let ax=W*.56, ay=H-145; text('Newton 2 link',ax,ay,13,'#9ed8f8'); text('If this is the only force:',ax,ay+28,13); text('a = Fnet / m',ax,ay+54,19,'#fff');
 updateReadouts({force:F.toFixed(2)+' relative units'});
}
function sim2(){
 clear(); grid(); let y=H*.45, left=W*.29,right=W*.71; let phase=(t*.4)%4;
 circ(left,y,72,'#6a7c88');circ(right,y,72,'#7b6d67');text('Object A',left,y+110,14,'#fff','center');text('Object B',right,y+110,14,'#fff','center');
 let transfer=Math.floor(Math.min(8,phase*2)); for(let i=0;i<12;i++){let a=i/12*Math.PI*2;let x=left+55*Math.cos(a), yy=y+55*Math.sin(a);circ(x,yy,5,i<transfer?'#8fcaff':'#d7e1e8')}
 for(let i=0;i<12;i++){let a=i/12*Math.PI*2;let x=right+55*Math.cos(a), yy=y+55*Math.sin(a);circ(x,yy,5,i>=12-transfer?'#8fcaff':'#d7e1e8')}
 arrow(left+90,y,right-90,y,'#8fcaff',2);text('electron transfer',W*.5,y-22,13,'#aee4ff','center');text('Total charge of A + B remains constant',W*.5,H*.78,18,'#fff','center');
}
function sim3(){
 grid(); let charges=[{x:W*.35,y:H*.5,q:state.q1},{x:W*.65,y:H*.5,q:state.q2}];drawField(charges);charges.forEach(q=>charge(q.x,q.y,q.q));
 let px=W*(.5+state.probeX*.18),py=H*(.5+state.probeY*.25), [ex,ey]=fieldAt(px,py,charges),m=Math.hypot(ex,ey);circ(px,py,6,'#fff');if(m)arrow(px,py,px+ex/m*70,py+ey/m*70,'#ffd36b',3);text('probe',px+9,py-9,12,'#fff');updateReadouts({field:(m*10000).toFixed(2)+' relative units'});
}
function project3(p){let [x,y,z]=p,cy=Math.cos(rotY),sy=Math.sin(rotY),cx=Math.cos(rotX),sx=Math.sin(rotX);let x1=x*cy-z*sy,z1=x*sy+z*cy,y1=y*cx-z1*sx,z2=y*sx+z1*cx;let s=240/(5+z2);return [W*.5+x1*s,H*.5+y1*s,s,z2]}
function sim4(){
 clear(); let pts=[];for(let j=0;j<=18;j++){let th=j/18*Math.PI;for(let i=0;i<36;i++){let ph=i/36*Math.PI*2;pts.push([1.25*Math.sin(th)*Math.cos(ph),.95*Math.cos(th),1.25*Math.sin(th)*Math.sin(ph)])}}
 pts.sort((a,b)=>project3(a)[3]-project3(b)[3]);for(const p of pts){let [x,y,s]=project3(p);ctx.fillStyle='rgba(67,154,200,.18)';ctx.fillRect(x,y,2.1,2.1)}
 for(let th=.18;th<Math.PI;th+=.38)for(let ph=0;ph<Math.PI*2;ph+=Math.PI/4){let n=[Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph)];let p0=[n[0]*1.3,n[1]*1.0,n[2]*1.3];let p1=[n[0]*2.4,n[1]*1.85,n[2]*2.4];let a=project3(p0),b=project3(p1);arrow(a[0],a[1],b[0],b[1],'rgba(127,223,255,.72)',1.5)}
 text('Drag to rotate • field inside conductor = 0',W*.5,28,14,'#dff7ff','center');text('Field lines leave the conducting surface normally',W*.5,H-24,13,'#a7d6ee','center');
}
function sim5(){
 clear();grid();let r=state.r;let qprod=state.q1*state.q2;let U=qprod/r;let x1=W*.38-state.r*35,x2=W*.62+state.r*35,y=H*.42;charge(x1,y,state.q1);charge(x2,y,state.q2);line(x1,y+48,x2,y+48,'#a1b9c8');text(`r = ${r.toFixed(1)}`,(x1+x2)/2,y+70,13,'#fff','center');
 axesGraph(45,H-155,W*.42,120,x=>qprod/x,'U ∝ q₁q₂/r'); text(U>0?'Positive U: work was required to assemble':'Negative U: lower-energy bound arrangement',W*.58,H-95,14,U>0?'#ffd36b':'#83e1b0');
 updateReadouts({energy:U.toFixed(2)+' relative units'});
}
function sim6(){
 clear();grid();let qs=[{x:W*.36,y:H*.5,q:1},{x:W*.64,y:H*.5,q:-1}];drawField(qs);
 for(let k=-4;k<=4;k++){ctx.strokeStyle=k===0?'#9aa':'rgba(255,211,107,.55)';ctx.lineWidth=1;ctx.beginPath();let started=false;for(let y=15;y<H-15;y+=6){for(let x=15;x<W-15;x+=6){let V=0;for(const q of qs){let r=Math.hypot(x-q.x,y-q.y);V+=q.q/Math.max(10,r)}if(Math.abs(V-k*.0018)<.00012){if(!started){ctx.moveTo(x,y);started=true}else ctx.lineTo(x,y)}}}ctx.stroke()}
 qs.forEach(q=>charge(q.x,q.y,q.q));text('Gold: approximate equipotentials   Blue arrows: electric field',W*.5,28,13,'#fff','center');text('E points toward decreasing V and is perpendicular to equipotentials',W*.5,H-24,13,'#b9e4f8','center');
}
function sim7(){
 clear();grid();let sep=state.plateSep*45, cx=W*.48,top=H*.5-sep/2,bot=H*.5+sep/2, pw=Math.min(430,state.area*130);
 line(cx-pw/2,top,cx+pw/2,top,'#ff7d73',7);line(cx-pw/2,bot,cx+pw/2,bot,'#5aa7ff',7);
 for(let x=cx-pw*.42;x<=cx+pw*.42;x+=34)arrow(x,top+10,x,bot-10,'rgba(130,220,255,.72)',1.5);
 if(state.kappa>1){ctx.fillStyle='rgba(255,220,120,.13)';ctx.fillRect(cx-pw/2,top+8,pw,bot-top-16);text(`dielectric κ=${state.kappa.toFixed(1)}`,cx,bot+38,12,'#ffe6a5','center')}
 let C=state.kappa*state.area/state.plateSep; let U=.5*C;
 text(`C ∝ κA/d`,W*.78,H*.35,22,'#fff','center');text(`C = ${C.toFixed(2)} relative`,W*.78,H*.42,16,'#9edfff','center');text(`At fixed ΔV: U = ½C(ΔV)²`,W*.78,H*.52,14,'#dcecf6','center');updateReadouts({cap:C.toFixed(2)});
}
function sim8(){
 clear();grid();let top=H*.2,bot=H*.8;line(35,top,W-35,top,'#ff7d73',6);line(35,bot,W-35,bot,'#5aa7ff',6);for(let x=60;x<W-40;x+=65)arrow(x,top+10,x,bot-10,'rgba(130,220,255,.55)',1.2);
 let tt=(t%5), E=1/state.plateSep, a=state.charge*E/state.mass, x=70+state.v0*55*tt, y=H*.5+.5*a*35*tt*tt; if(y>bot-15||y<top+15){t=0;x=70;y=H*.5}circ(x,y,10,state.charge>0?'#ff7d73':'#5aa7ff',state.charge>0?'+':'−');arrow(x,y,x+55,y,'#fff',2);arrow(x,y,x,y+a*50,'#ffd36b',2);text('vₓ',x+58,y-4,12);text('aᵧ',x+8,y+a*50,12,'#ffd36b');text('Constant electric force → constant acceleration',W*.5,34,15,'#fff','center');
 updateReadouts({accel:a.toFixed(2)+' relative'});
}
function sim9(){
 clear();grid();let phase=(Math.sin(t*.8)+1)/2, K=phase,U=1-phase;let x=80+phase*(W-160),y=H*.48;circ(x,y,12,'#ff7d73','+');arrow(70,H*.6,W-70,H*.6,'#72cfff',2);text('toward lower electric potential',W*.5,H*.6+26,13,'#a8d8f0','center');
 let bx=W*.72,base=H*.86,h=180;ctx.fillStyle='#ffd36b';ctx.fillRect(bx,base-K*h,56,K*h);ctx.fillStyle='#70e1a0';ctx.fillRect(bx+76,base-U*h,56,U*h);text('K',bx+28,base+20,13,'#fff','center');text('Uₑ',bx+104,base+20,13,'#fff','center');text('K + Uₑ = constant',bx+65,base-h-18,14,'#fff','center');
}
const sims={1:sim1,2:sim2,3:sim3,4:sim4,5:sim5,6:sim6,7:sim7,8:sim8,9:sim9};
function loop(ts){t+=run?.016:0;clear();(sims[+mod]||sim1)();requestAnimationFrame(loop)}if(canvas)requestAnimationFrame(loop);
canvas?.addEventListener('pointerdown',e=>{if(+mod!==4)return;drag=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});
canvas?.addEventListener('pointermove',e=>{if(!drag||+mod!==4)return;rotY+=(e.clientX-lastX)*.01;rotX+=(e.clientY-lastY)*.01;lastX=e.clientX;lastY=e.clientY});
canvas?.addEventListener('pointerup',()=>drag=false);
$$('[data-action="play"]').forEach(b=>b.onclick=()=>run=!run);
$$('[data-action="reset"]').forEach(b=>b.onclick=()=>{t=0;run=true;rotX=.35;rotY=-.45});
$$('[data-solutions]').forEach(b=>b.onclick=(e)=>{if(!confirm('Open the worked solutions? Try the enquiry and questions first.'))e.preventDefault()});
