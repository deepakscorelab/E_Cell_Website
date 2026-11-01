"use client";
import { useEffect, useRef } from "react";

// ─── TIMELINE (ms) ─────────────────────────────────────────────────────────
const T = {
  PROTON_TRAVEL : 1800,  // proton glides in
  COLLISION     : 1800,  // collision moment
  EXPLOSION     : 2200,  // flash/shockwave ends
  GATHER        : 2600,  // particles scatter outward
  ATOMS         : 3200,  // particles gather to corners → atoms form (short)
  ELECTRIC      : 3400,  // electric arcs fire from corners to centre
  LOGO          : 4200,  // logo fades in
  DONE          : 5200,  // preserve the existing one-second logo hold
};

export default function ProtonLoader({ onComplete }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const stateRef  = useRef({});
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCompleteRef.current?.();
      return;
    }
    let disposed = false;
    let hiddenAt = document.hidden ? performance.now() : null;

    // ── math helpers ─────────────────────────────────────────────────────────
    const lerp      = (a, b, t) => a + (b - a) * t;
    const clamp     = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const easeInOut = t => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const easeOut3  = t => 1 - Math.pow(1 - t, 3);
    const easeOut5  = t => 1 - Math.pow(1 - t, 5);

    // ── fractal noise for electric arcs ──────────────────────────────────────
    const noise = (x, s) => (((Math.sin(x*127.1+s*311.7)*43758.5453)%1)+1)%1;
    const smoothNoise = (x, s) => {
      const i=Math.floor(x), f=x-i, u=f*f*(3-2*f);
      return noise(i,s)*(1-u)+noise(i+1,s)*u;
    };
    const fractalNoise = (x, s, octs=5) => {
      let v=0,a=0.5,fr=1;
      for(let i=0;i<octs;i++){v+=smoothNoise(x*fr,s+i)*a;a*=0.5;fr*=2;}
      return v*2-1;
    };
    const electricPath = (x1,y1,x2,y2,seed,time,segs=22) => {
      const pts=[{x:x1,y:y1}];
      for(let i=1;i<segs;i++){
        const p=i/segs;
        const bx=x1+(x2-x1)*p, by=y1+(y2-y1)*p;
        const nx=fractalNoise(p*4+time*0.22,seed*10);
        const ny=fractalNoise(p*4+time*0.22,seed*10+7);
        const perp={x:-(y2-y1),y:x2-x1};
        const len=Math.sqrt(perp.x*perp.x+perp.y*perp.y)||1;
        const dist=55*(1-Math.abs(p*2-1));
        pts.push({x:bx+nx*dist+ny*18*(perp.x/len),y:by+ny*dist+nx*18*(perp.y/len)});
      }
      pts.push({x:x2,y:y2});
      return pts;
    };

    const ELECTRONS = [
      { a:42, b:18, tilt:0,           speed:0.032, phase:0         },
      { a:42, b:18, tilt:Math.PI/3,   speed:0.025, phase:Math.PI/2 },
      { a:42, b:18, tilt:-Math.PI/3,  speed:0.028, phase:Math.PI   },
    ];

    // ── init ─────────────────────────────────────────────────────────────────
    function initState() {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const W=canvas.width, H=canvas.height;
      const CX=W/2, CY=H/2;
      const PAD=Math.min(W,H)*0.13;

      const corners=[
        {x:PAD,   y:PAD  },
        {x:W-PAD, y:PAD  },
        {x:W-PAD, y:H-PAD},
        {x:PAD,   y:H-PAD},
      ];

      const TOTAL=160;
      const expParticles=Array.from({length:TOTAL},(_,i)=>{
        const angle=(i/TOTAL)*Math.PI*2+Math.random()*0.4;
        const speed=4.5+Math.random()*6;
        return {
          x:CX, y:CY,
          vx:Math.cos(angle)*speed, vy:Math.sin(angle)*speed,
          r:2+Math.random()*2.5,
          hue:160+Math.random()*80,
          alpha:1,
          cornerIdx:i%4,
          scatterX:CX, scatterY:CY, scatterSet:false,
        };
      });

      stateRef.current={
        W,H,CX,CY,PAD,corners,
        electronAngles:ELECTRONS.map(e=>e.phase),
        cornerElAngles:corners.map(()=>ELECTRONS.map(e=>e.phase)),
        protonX:-50, protonY:CY,
        expParticles,
        logoFired:false,
        logoAppearTime:null,
        logoImage:null,
        elecTime:0,
        stars:Array.from({length:130},()=>({
          x:Math.random()*W, y:Math.random()*H,
          r:Math.random()*0.9+0.1, a:Math.random(),
        })),
        startTime:performance.now(),
        lastNow:performance.now(),
        doneCalled:false,
      };

      // preload logo
      const img = new Image();
      // The reverse proxy serves production assets below /e-cell.
      img.src = `${window.location.pathname.startsWith("/e-cell/") ? "/e-cell" : ""}/E-Summit%20Logo.png`;
      stateRef.current.logoImage = img;
      const background = ctx.createRadialGradient(CX,CY,10,CX,CY,Math.max(W,H)*0.75);
      background.addColorStop(0,"rgba(0,20,45,0.97)");
      background.addColorStop(1,"rgba(0,5,15,0.99)");
      stateRef.current.background = background;
    }

    // ── draw helpers ─────────────────────────────────────────────────────────
    function drawProton(x,y,r,alpha) {
      const g=ctx.createRadialGradient(x,y,0,x,y,r*2.8);
      g.addColorStop(0,`rgba(120,210,255,${alpha*0.45})`);
      g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r*2.8,0,Math.PI*2); ctx.fill();
      const c=ctx.createRadialGradient(x-r*0.3,y-r*0.3,0,x,y,r);
      c.addColorStop(0,`rgba(230,245,255,${alpha})`);
      c.addColorStop(0.4,`rgba(80,190,255,${alpha})`);
      c.addColorStop(1,`rgba(0,90,210,${alpha*0.8})`);
      ctx.fillStyle=c; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle=`rgba(255,255,255,${alpha*0.9})`; ctx.lineWidth=1.6;
      ctx.beginPath(); ctx.moveTo(x-r*0.45,y); ctx.lineTo(x+r*0.45,y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y-r*0.45); ctx.lineTo(x,y+r*0.45); ctx.stroke();
    }

    function drawCentralAtom(x,y,electronAngles) {
      const ng=ctx.createRadialGradient(x,y,0,x,y,26);
      ng.addColorStop(0,"rgba(255,230,90,0.95)");
      ng.addColorStop(0.45,"rgba(255,140,25,0.65)");
      ng.addColorStop(1,"rgba(200,60,0,0)");
      ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(x,y,26,0,Math.PI*2); ctx.fill();
      const nb=ctx.createRadialGradient(x-4,y-4,0,x,y,14);
      nb.addColorStop(0,"rgba(255,248,180,1)");
      nb.addColorStop(0.5,"rgba(255,155,35,1)");
      nb.addColorStop(1,"rgba(180,55,10,1)");
      ctx.fillStyle=nb; ctx.beginPath(); ctx.arc(x,y,14,0,Math.PI*2); ctx.fill();
      ELECTRONS.forEach((e,i)=>{
        ctx.save(); ctx.translate(x,y); ctx.rotate(e.tilt);
        ctx.beginPath(); ctx.ellipse(0,0,e.a,e.b,0,0,Math.PI*2);
        ctx.strokeStyle="rgba(100,190,255,0.22)"; ctx.lineWidth=1; ctx.stroke();
        const ang=electronAngles[i];
        const ex2=Math.cos(ang)*e.a, ey2=Math.sin(ang)*e.b;
        const eg=ctx.createRadialGradient(ex2,ey2,0,ex2,ey2,5.5);
        eg.addColorStop(0,"rgba(190,225,255,1)"); eg.addColorStop(1,"rgba(0,110,255,0)");
        ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(ex2,ey2,5.5,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });
    }

    function drawCornerAtom(x,y,alpha,electronAngles,scale=0.85) {
      ctx.save(); ctx.globalAlpha=alpha;
      const ng=ctx.createRadialGradient(x,y,0,x,y,26*scale);
      ng.addColorStop(0,"rgba(0,220,255,0.95)");
      ng.addColorStop(0.35,"rgba(0,140,255,0.7)");
      ng.addColorStop(1,"rgba(0,30,80,0)");
      ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(x,y,26*scale,0,Math.PI*2); ctx.fill();
      const nb=ctx.createRadialGradient(x-4*scale,y-4*scale,0,x,y,14*scale);
      nb.addColorStop(0,"rgba(200,248,255,1)");
      nb.addColorStop(0.4,"rgba(0,200,255,1)");
      nb.addColorStop(1,"rgba(0,80,160,1)");
      ctx.fillStyle=nb; ctx.beginPath(); ctx.arc(x,y,14*scale,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="rgba(0,220,255,0.7)"; ctx.lineWidth=scale;
      ctx.beginPath(); ctx.arc(x,y,14*scale,0,Math.PI*2); ctx.stroke();
      ELECTRONS.forEach((e,i)=>{
        ctx.save(); ctx.translate(x,y); ctx.rotate(e.tilt);
        ctx.beginPath(); ctx.ellipse(0,0,e.a*scale,e.b*scale,0,0,Math.PI*2);
        ctx.strokeStyle="rgba(0,180,220,0.3)"; ctx.lineWidth=1; ctx.stroke();
        const ang=electronAngles[i];
        const ex2=Math.cos(ang)*e.a*scale, ey2=Math.sin(ang)*e.b*scale;
        const eg=ctx.createRadialGradient(ex2,ey2,0,ex2,ey2,6*scale);
        eg.addColorStop(0,"rgba(190,235,255,1)"); eg.addColorStop(1,"rgba(0,150,255,0)");
        ctx.fillStyle=eg; ctx.beginPath(); ctx.arc(ex2,ey2,6*scale,0,Math.PI*2); ctx.fill();
        ctx.restore();
      });
      ctx.restore();
    }

    function drawElectricArc(x1,y1,x2,y2,seed,time,alpha) {
      for(let b=0;b<2;b++){
        const pts=electricPath(x1,y1,x2,y2,seed+b*1.9+time*0.025,time+b*0.8,22);
        ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
        pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=`rgba(0,230,255,${alpha*(b===0?1:0.5)})`;
        ctx.lineWidth=b===0?1.5:0.7; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
        pts.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=`rgba(180,240,255,${alpha*0.9*(b===0?1:0.5)})`;
        ctx.lineWidth=b===0?0.7:0.3; ctx.stroke();
      }
      for(let s2=0;s2<2;s2++){
        const sp=electricPath(x1,y1,x2+(Math.random()-0.5)*15,y2+(Math.random()-0.5)*15,seed+s2*7.3,time+s2*0.4,10);
        ctx.beginPath(); ctx.moveTo(sp[0].x,sp[0].y);
        sp.slice(1).forEach(p=>ctx.lineTo(p.x,p.y));
        ctx.strokeStyle=`rgba(120,220,255,${alpha*0.22})`; ctx.lineWidth=0.4; ctx.stroke();
      }
    }

    // ── main frame ────────────────────────────────────────────────────────────
    function frame(now) {
      rafRef.current = null;
      if (disposed || document.hidden) return;
      const s=stateRef.current;
      const dt=Math.min((now-s.lastNow)/1000, 0.05); s.lastNow=now;
      const step = dt * 60;
      const el=now-s.startTime;
      const {W,H,CX,CY,corners}=s;

      ctx.clearRect(0,0,W,H);

      // background
      ctx.fillStyle=s.background; ctx.fillRect(0,0,W,H);

      // stars
      s.stars.forEach(st=>{
        st.a+=0.003*(Math.random()<0.5?1:-1);
        st.a=clamp(st.a,0,1);
        ctx.beginPath(); ctx.arc(st.x,st.y,st.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(220,235,255,${st.a})`; ctx.fill();
      });

      // ── PHASE 1: proton travels ──────────────────────────────────────────
      if (el<T.COLLISION) {
        const t=clamp(el/T.PROTON_TRAVEL,0,1);
        s.protonX=lerp(-50,CX,easeInOut(t)); s.protonY=CY;
        ELECTRONS.forEach((e,i)=>{s.electronAngles[i]+=e.speed*step;});
        drawCentralAtom(CX,CY,s.electronAngles);
        const tr=ctx.createLinearGradient(-50,CY,s.protonX,CY);
        tr.addColorStop(0,"rgba(0,110,255,0)"); tr.addColorStop(1,"rgba(100,210,255,.55)");
        ctx.strokeStyle=tr; ctx.lineWidth=2.2;
        ctx.beginPath(); ctx.moveTo(-50,CY); ctx.lineTo(s.protonX,CY); ctx.stroke();
        drawProton(s.protonX,s.protonY,10,1);
      }

      // ── PHASE 2: collision flash ─────────────────────────────────────────
      if (el>=T.PROTON_TRAVEL && el<T.EXPLOSION) {
        const t=(el-T.PROTON_TRAVEL)/(T.EXPLOSION-T.PROTON_TRAVEL);
        const shockR=easeOut3(t)*W*0.52;
        const shockA=(1-t)*0.7;
        const flashA=t<0.15?t/0.15:Math.max(0,1-(t-0.15)/0.35);
        ctx.fillStyle=`rgba(255,255,255,${flashA*0.5})`; ctx.fillRect(0,0,W,H);
        [[1,"rgba(120,210,255"],[0.55,"rgba(255,185,70"],[0.25,"rgba(255,255,255"]].forEach(([f,col],i)=>{
          ctx.beginPath(); ctx.arc(CX,CY,shockR*f,0,Math.PI*2);
          ctx.strokeStyle=`${col},${shockA*(0.7-i*0.15)})`; ctx.lineWidth=(3-i)*(1-t); ctx.stroke();
        });
      }

      // ── PHASE 3: particles scatter then gather to corners ────────────────
      if (el>=T.COLLISION && el<T.ATOMS) {
        const scatterT=clamp((el-T.COLLISION)/(T.GATHER-T.COLLISION),0,1);
        const gatherT=clamp((el-T.GATHER)/(T.ATOMS-T.GATHER),0,1);

        s.expParticles.forEach(p=>{
          if (scatterT<1) {
            p.x+=p.vx*1.4*step; p.y+=p.vy*1.4*step; p.vy+=0.09*step;
            p.alpha=clamp(1-scatterT*0.3,0,1);
          } else {
            if(!p.scatterSet){p.scatterX=p.x;p.scatterY=p.y;p.scatterSet=true;}
            const tx=corners[p.cornerIdx].x+(Math.random()-0.5)*16;
            const ty=corners[p.cornerIdx].y+(Math.random()-0.5)*16;
            const gt=easeOut5(gatherT);
            p.x=lerp(p.scatterX,tx,gt);
            p.y=lerp(p.scatterY,ty,gt);
            p.alpha=clamp(0.3+gatherT*0.7,0,1);
          }
          if(p.alpha<=0) return;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
          ctx.fillStyle=`hsla(${p.hue},90%,65%,${p.alpha})`;
          ctx.shadowBlur=6; ctx.shadowColor=`hsla(${p.hue},100%,70%,.7)`;
          ctx.fill(); ctx.shadowBlur=0;
        });
      }

      // ── PHASE 5: electric arcs fire ─────────────────────────────────────
      if (el>=T.ELECTRIC) {
        s.elecTime+=dt;
        const arcT=clamp((el-T.ELECTRIC)/(T.LOGO-T.ELECTRIC),0,1);
        const flicker=0.55+Math.sin(s.elecTime*4.5)*0.25+Math.random()*0.08;
        const arcAlpha = el<T.LOGO ? flicker*arcT : (0.25+Math.sin(s.elecTime*3)*0.1)*0.4;

        // centre energy glow
        const cg=ctx.createRadialGradient(CX,CY,0,CX,CY,130);
        cg.addColorStop(0,`rgba(0,200,255,${arcAlpha*0.15})`);
        cg.addColorStop(0.5,`rgba(0,100,200,${arcAlpha*0.07})`);
        cg.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=cg; ctx.fillRect(0,0,W,H);

        corners.forEach((c,i)=>{
          drawElectricArc(c.x,c.y,CX,CY,i*3.7+1.2,s.elecTime,arcAlpha);
        });
      }

      // Draw/update each corner atom once, above the electric arcs.
      if (el>=T.GATHER) {
        const alpha=easeOut3(clamp((el-T.GATHER)/(T.ATOMS-T.GATHER),0,1));
        s.cornerElAngles.forEach((angs,ci)=>{
          ELECTRONS.forEach((e,i)=>{angs[i]+=e.speed*1.2*step;});
          drawCornerAtom(corners[ci].x,corners[ci].y,alpha,angs);
        });
      }

      // ── PHASE 6: logo fades in ───────────────────────────────────────────
      if (el>=T.LOGO) {
        if(!s.logoFired){ s.logoFired=true; s.logoAppearTime=now; }
        const logoT=clamp((el-T.LOGO)/300,0,1); // fade in over 300ms
        const alpha=easeOut3(logoT);

        // centre glow behind logo
        const cg2=ctx.createRadialGradient(CX,CY,0,CX,CY,200);
        cg2.addColorStop(0,`rgba(0,180,255,${alpha*0.25})`);
        cg2.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=cg2; ctx.fillRect(0,0,W,H);

        // draw logo image centred
        if(s.logoImage && s.logoImage.complete && s.logoImage.naturalWidth > 0){
          const maxW=Math.min(W*0.55, 420);
          const scale2=maxW/s.logoImage.naturalWidth;
          const lw=s.logoImage.naturalWidth*scale2;
          const lh=s.logoImage.naturalHeight*scale2;
          ctx.save();
          ctx.globalAlpha=alpha;
          ctx.drawImage(s.logoImage, CX-lw/2, CY-lh/2, lw, lh);
          ctx.restore();
        }
      }

      // Leave the final frame visible during the CSS exit; stop drawing.
      if(!s.doneCalled && el>=T.DONE){
        s.doneCalled=true;
        onCompleteRef.current?.();
        return;
      }

      rafRef.current=requestAnimationFrame(frame);
    }

    initState();
    const onVisibility = () => {
      if (document.hidden) {
        hiddenAt = performance.now();
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else {
        const now = performance.now();
        if (hiddenAt !== null) stateRef.current.startTime += now - hiddenAt;
        hiddenAt = null;
        stateRef.current.lastNow = now;
        if (!stateRef.current.doneCalled && !rafRef.current) rafRef.current=requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    if (!document.hidden) rafRef.current=requestAnimationFrame(frame);
    return ()=>{
      disposed = true;
      if(rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  },[]);

  return (
    <canvas
      ref={canvasRef}
      style={{display:"block",width:"100%",height:"100%"}}
    />
  );
}