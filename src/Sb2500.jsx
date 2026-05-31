import bombImg from "./assets/bombImg.png";
import { useState, useEffect, useCallback, useRef } from "react";
import lollipopImg from "./assets/lolipop.png";
import heartImg from "./assets/heart.png";
import candyBlueImg from "./assets/candyBlue.png";
import grapeImg from "./assets/grape.png";
import appleImg from "./assets/apple.png";
import watermelonImg from "./assets/melon.png";
import plumImg from "./assets/plum.png";
import bananaImg from "./assets/banana.png";
import sweetBonanzaLogo from "./assets/sweetbonanza.png";

const SYMBOLS = [
  { id:"lollipop", img:lollipopImg, label:"Lollipop", scatter:true, scale:1.35, mult:{8:0,9:0,10:0,11:0,12:36.4,13:50,14:100,15:150,16:200,17:750} },
  { scale:1.15, id:"heart", img:heartImg, label:"Heart", color:"#e91e63", weight:3, mult:{8:5,9:8,10:12,11:16,12:25,13:50,14:100,15:200,16:400,17:1000} },
  { scale:1.15, id:"candy_blue", img:candyBlueImg, label:"Blue Candy", color:"#3498db", weight:5, mult:{8:3,9:5,10:8,11:11,12:15,13:30,14:60,15:120,16:250,17:600} },
  { scale:1.15, id:"grape", img:grapeImg, label:"Grape", color:"#9b59b6", weight:8, mult:{8:1.5,9:2.5,10:4,11:6,12:10,13:20,14:40,15:80,16:150,17:400} },
  { scale:1.15, id:"apple", img:appleImg, label:"Apple", color:"#e74c3c", weight:10, mult:{8:1,9:1.5,10:3,11:5,12:8,13:15,14:30,15:60,16:100,17:250} },
  { scale:1.15, id:"watermelon", img:watermelonImg, label:"Watermelon", color:"#27ae60", weight:12, mult:{8:0.8,9:1.2,10:2,11:3.5,12:6,13:12,14:25,15:50,16:80,17:200} },
  { scale:1, id:"plum", img:plumImg, label:"Plum", color:"#e67e22", weight:14, mult:{8:0.5,9:0.8,10:1.5,11:2.5,12:4,13:8,14:16,15:32,16:60,17:150} },
  { scale:1.15, id:"banana", img:bananaImg, label:"Banana", color:"#f1c40f", weight:16, mult:{8:0.25,9:0.4,10:0.8,11:1.2,12:2,13:5,14:10,15:20,16:40,17:100} },
];

const SCATTER = SYMBOLS[0];
const NORMAL_SYMS = SYMBOLS.slice(1);
const BOMB_VALUES = [2,3,5,10,25,50,100,500,1000];
const COLS = 6, ROWS = 5;
const BET_OPTS = [0.20,0.40,0.60,1.00,2.00,4.00,6.00,10.00,20.00,40.00,100.00];

const WIN_NOTICES = [
  {name:"Ash****",amount:"₱12,450"},{name:"Mar****",amount:"₱8,200"},
  {name:"Jun****",amount:"₱31,000"},{name:"Kri****",amount:"₱5,750"},
  {name:"Ric****",amount:"₱18,900"},{name:"Jen****",amount:"₱9,300"},
];

function fmt(n) {
  return "₱" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function weightedRandom(inFS=false, buyFS=false) {
  const scW = buyFS ? 0 : inFS ? 0.5 : 2;
  const total = NORMAL_SYMS.reduce((a,s)=>a+s.weight,0)+scW;
  let r = Math.random()*total;
  for (const s of NORMAL_SYMS) { r-=s.weight; if(r<=0) return {...s,uid:Math.random(),dropDelay:Math.random()*0.18}; }
  return {...SCATTER,uid:Math.random(),dropDelay:Math.random()*0.18};
}

function decidePayout(inFS=false) {
  const r=Math.random();
  if(inFS){ if(r<0.25) return"none"; if(r<0.58) return"small"; if(r<0.80) return"medium"; if(r<0.94) return"big"; return"massive"; }
  if(r<0.55) return"none"; if(r<0.82) return"small"; if(r<0.93) return"medium"; if(r<0.98) return"big"; return"massive";
}

function makeGrid(inFS=false, buyFSMode=false) {
  const tier=decidePayout(inFS);
  const empty=()=>Array.from({length:ROWS},()=>Array.from({length:COLS},()=>({sym:weightedRandom(inFS,buyFSMode),state:"idle",bomb:null,dropFrom:-(Math.random()*3+1)})));
  if(tier==="none") return empty();
  const grid=empty();
  const pool=tier==="massive"?NORMAL_SYMS.slice(0,2):tier==="big"?NORMAL_SYMS.slice(0,4):tier==="medium"?NORMAL_SYMS.slice(2,6):NORMAL_SYMS.slice(4);
  const target=pool[Math.floor(Math.random()*pool.length)];
  const count=tier==="massive"?14+Math.floor(Math.random()*4):tier==="big"?12+Math.floor(Math.random()*3):tier==="medium"?10+Math.floor(Math.random()*3):8+Math.floor(Math.random()*2);
  const allCells=[];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) allCells.push([r,c]);
  for(let i=allCells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[allCells[i],allCells[j]]=[allCells[j],allCells[i]];}
  allCells.slice(0,Math.min(count,ROWS*COLS)).forEach(([r,c])=>{
    grid[r][c]={sym:{...target,uid:Math.random(),dropDelay:Math.random()*0.18},state:"idle",bomb:null,dropFrom:-(Math.random()*4+1)};
  });
  return grid;
}

function findClusters(grid) {
  const counts={}, cellMap={};
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const sym=grid[r][c].sym;
    if(sym.scatter) continue;
    if(!counts[sym.id]){counts[sym.id]=0;cellMap[sym.id]={sym,cells:[]};}
    counts[sym.id]++; cellMap[sym.id].cells.push([r,c]);
  }
  const out=[];
  for(const id in counts){ if(counts[id]>=8) out.push({sym:cellMap[id].sym,cells:cellMap[id].cells,size:counts[id]}); }
  return out;
}

function countScatters(grid){let n=0;grid.forEach(row=>row.forEach(c=>{if(c.sym.scatter)n++;}));return n;}
function getMultiplier(sym,size){const cl=Math.min(size,17);for(let i=cl;i>=8;i--){if(sym.mult[i]!==undefined)return sym.mult[i];}return 0;}

// Odds: 15% no bomb, 55% 1 bomb, 30% 2 bombs — spread across different rows
function spawnBombs(grid){
  const rng=Math.random();
  const count=rng<0.15?0:rng<0.70?1:2;
  if(count===0) return grid;
  const g=grid.map(row=>row.map(c=>({...c})));
  const allCells=[];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) if(!g[r][c].sym.scatter) allCells.push([r,c]);
  for(let i=allCells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[allCells[i],allCells[j]]=[allCells[j],allCells[i]];}
  const placed=new Set(); const usedRows=new Set(); let placed2=0;
  for(const [r,c] of allCells){
    if(placed2>=count) break;
    const k=`${r},${c}`;
    if(placed.has(k)) continue;
    if(count===2&&usedRows.has(r)) continue;
    placed.add(k); usedRows.add(r);
    g[r][c]={...g[r][c],bomb:BOMB_VALUES[Math.floor(Math.random()*BOMB_VALUES.length)]};
    placed2++;
  }
  return g;
}

function useCountUp(target, duration=1200) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);
  useEffect(()=>{
    if(rafRef.current) cancelAnimationFrame(rafRef.current);
    const from=fromRef.current; startRef.current=null;
    const animate=(ts)=>{
      if(!startRef.current) startRef.current=ts;
      const elapsed=ts-startRef.current;
      const prog=Math.min(elapsed/duration,1);
      const eased=1-Math.pow(1-prog,3);
      const val=from+(target-from)*eased;
      setDisplay(val);
      if(prog<1) rafRef.current=requestAnimationFrame(animate);
      else{ fromRef.current=target; setDisplay(target); }
    };
    rafRef.current=requestAnimationFrame(animate);
    return()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  },[target,duration]);
  return display;
}

function Particles({active,color,count=18}){
  if(!active) return null;
  return(
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:30,overflow:"hidden"}}>
      {Array.from({length:count}).map((_,i)=>{
        const angle=(i/count)*360, dist=40+Math.random()*60, size=4+Math.random()*6, delay=Math.random()*0.2;
        return(<div key={i} style={{position:"absolute",left:"50%",top:"50%",width:size,height:size,borderRadius:"50%",background:color,boxShadow:`0 0 ${size*2}px ${color}`,animation:`sbParticle 0.6s ${delay}s ease-out forwards`,"--angle":`${angle}deg`,"--dist":`${dist}px`}}/>);
      })}
    </div>
  );
}

function BombBadge({value,exploding}){
  return(
    <div style={{position:"absolute",top:-4,right:-4,zIndex:10,width:28,height:28,animation:exploding?"sbBombExplode 0.5s ease-out forwards":"sbBombFloat 2s ease-in-out infinite alternate"}}>
      <img src={bombImg} alt="bomb" style={{width:"100%",height:"100%",objectFit:"contain",filter:"drop-shadow(0 0 8px rgba(255,200,0,0.9))"}}/>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:value>=100?7:value>=10?8:9,color:"#fff",textShadow:"0 0 4px rgba(0,0,0,1)",fontFamily:"'Arial Black',sans-serif",letterSpacing:-0.5,lineHeight:1,paddingBottom:1}}>×{value}</div>
      <div style={{position:"absolute",inset:-3,borderRadius:"50%",border:"2px solid rgba(255,200,0,0.7)",animation:"sbBombRing 1.5s ease-in-out infinite",pointerEvents:"none"}}/>
    </div>
  );
}

function SymCell({cell,isWin,isBomb,animKey,comboLevel}){
  const s=cell.sym;
  const [landed,setLanded]=useState(false);
  const [popping,setPopping]=useState(false);
  const [showParticles,setShowParticles]=useState(false);
  useEffect(()=>{setLanded(false);setPopping(false);setShowParticles(false);const t=setTimeout(()=>setLanded(true),30+(cell.sym.dropDelay||0)*900);return()=>clearTimeout(t);},[animKey]);
  useEffect(()=>{if(isBomb){setPopping(true);setShowParticles(true);const t=setTimeout(()=>setShowParticles(false),800);return()=>clearTimeout(t);}},[isBomb]);
  const isScatter=s.scatter;
  const imgScale=isScatter?1.85:1;
  return(
    <div style={{position:"relative",aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",overflow:"visible"}}>
      {isWin&&<div style={{position:"absolute",inset:1,borderRadius:8,background:`radial-gradient(circle,${s.color}40,transparent 70%)`,animation:"sbWinPulse 0.4s ease-in-out infinite alternate",zIndex:1}}/>}
      <div style={{
        position: "relative",
        width: `${Math.min(imgScale * 60, 95)}%`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: landed
          ? (popping ? "scale(0) rotate(15deg)" : isWin ? "scale(1.08)" : "scale(1)")
          : `translateY(${(cell.dropFrom || -2) * 58}px) scale(0.7)`,
        opacity: landed ? (popping ? 0 : 1) : 0,
        transition: landed && !popping
          ? `transform 0.32s cubic-bezier(.22,1.5,.36,1) ${(cell.sym.dropDelay || 0) * 0.8}s, opacity 0.15s ${(cell.sym.dropDelay || 0) * 0.8}s`
          : popping
            ? "transform 0.18s ease-in, opacity 0.18s ease-in"
            : "none",
        zIndex: 2,
        filter: isWin
          ? `drop-shadow(0 0 8px ${s.color}) drop-shadow(0 0 16px ${s.color}88) brightness(1.2)`
          : isScatter
            ? `drop-shadow(0 0 10px #ff69b488) brightness(1.1)`
            : `drop-shadow(0 2px 5px rgba(0,0,0,0.4)) brightness(1.05)`,
        willChange: "transform,opacity",
      }}>
        <img src={s.img} alt={s.label} style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none", display: "block", mixBlendMode: "multiply" }} />
        {isWin&&<div style={{position:"absolute",top:0,left:"-110%",width:"55%",height:"100%",background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)",animation:"sbSheen 1s ease-in-out infinite",pointerEvents:"none"}}/>}
        {isWin&&comboLevel>=2&&<div style={{position:"absolute",inset:-6,borderRadius:"50%",border:`2px solid ${s.color}`,animation:"sbComboRing 0.5s ease-out infinite",opacity:0.7,pointerEvents:"none"}}/>}
      </div>
      {cell.bomb&&<BombBadge value={cell.bomb} exploding={isBomb}/>}
      {isScatter&&!popping&&<div style={{position:"absolute",inset:-4,borderRadius:"50%",background:"radial-gradient(circle,rgba(255,105,180,0.25),transparent 70%)",animation:"sbScatterHalo 2s ease-in-out infinite alternate",pointerEvents:"none",zIndex:0}}/>}
      {showParticles&&<Particles active color={s.color} count={16}/>}
    </div>
  );
}

function WinTicker(){
  const[items]=useState(()=>{const s=[...WIN_NOTICES].sort(()=>Math.random()-.5);return[...s,...s,...s];});
  return(
    <div style={{width:"100%",overflow:"hidden",background:"linear-gradient(90deg,rgba(180,0,60,.95),rgba(220,100,0,.95),rgba(180,0,60,.95))",padding:"3px 0"}}>
      <div style={{display:"flex",gap:48,animation:"sbTickerScroll 32s linear infinite",whiteSpace:"nowrap",width:"max-content"}}>
        {items.map((w,i)=>(
          <span key={i} style={{fontSize:10,fontWeight:700,color:"#fff",display:"inline-flex",alignItems:"center",gap:5}}>
            🎉 <strong style={{color:"#ffe066"}}>{w.name}</strong> won <strong style={{color:"#fff200"}}>{w.amount}</strong>
          </span>
        ))}
      </div>
    </div>
  );
}

function WinOverlay({level,amount,onClose}){
  const displayed=useCountUp(amount,level==="epic"?2200:level==="mega"?1800:1200);
  const configs={
    big:{label:"BIG WIN!",colors:"#ff6b35,#ffd700,#ff6b35",glow:"rgba(255,200,0,.9)",bg:"rgba(80,20,0,.75)"},
    mega:{label:"MEGA WIN!",colors:"#e91e63,#ffd700,#ff69b4",glow:"rgba(255,100,200,.9)",bg:"rgba(60,0,40,.78)"},
    epic:{label:"EPIC WIN!",colors:"#a855f7,#ffd700,#3b82f6",glow:"rgba(200,100,255,.9)",bg:"rgba(20,0,60,.82)"},
    sensational:{label:"SENSATIONAL!",colors:"#ff6b35,#ffd700,#ff69b4,#a855f7,#ff6b35",glow:"rgba(255,215,0,1)",bg:"rgba(40,0,80,.88)"},
  };
  const cfg=configs[level]||configs.big;
  return(
    <div style={{position:"fixed",inset:0,zIndex:9500,display:"flex",alignItems:"center",justifyContent:"center",background:cfg.bg,backdropFilter:"blur(10px)"}} onClick={onClose}>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        {Array.from({length:20}).map((_,i)=>(
          <div key={i} style={{position:"absolute",width:2,height:"44%",background:"linear-gradient(to top,transparent,rgba(255,215,0,.45),transparent)",transform:`rotate(${i*18}deg)`,transformOrigin:"bottom center",top:0,left:"50%",marginLeft:-1,animation:`sbRayPulse 1.4s ease-in-out infinite`,animationDelay:`${i*0.07}s`}}/>
        ))}
      </div>
      <div style={{textAlign:"center",zIndex:1,padding:"0 24px",maxWidth:400,width:"90%",animation:"sbPopIn .4s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{fontWeight:900,fontSize:"clamp(36px,10vw,68px)",background:`linear-gradient(135deg,${cfg.colors})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:2,textTransform:"uppercase",lineHeight:1,marginBottom:14,animation:"sbWinBounce .6s cubic-bezier(.34,1.56,.64,1)",fontFamily:"'Arial Black',sans-serif"}}>{cfg.label}</div>
        <div style={{position:"relative",display:"inline-block",background:"linear-gradient(135deg,#d4008a,#ff1aaa,#d4008a)",padding:"14px 44px",borderRadius:60,border:"4px solid rgba(255,255,255,.6)",boxShadow:`0 0 40px ${cfg.glow}`,marginBottom:20,animation:"sbScaleIn .5s .15s both cubic-bezier(.34,1.56,.64,1)"}}>
          <span style={{fontWeight:900,fontSize:"clamp(26px,7vw,50px)",color:"#fff",fontFamily:"'Arial Black',sans-serif"}}>{fmt(displayed)}</span>
        </div>
        <div style={{color:"rgba(255,255,255,.5)",fontSize:11}}>tap anywhere to continue</div>
      </div>
    </div>
  );
}

function useScreenShake(){
  const[shaking,setShaking]=useState(false);
  const shake=useCallback((intensity=1)=>{setShaking(intensity);setTimeout(()=>setShaking(false),intensity>2?700:400);},[]);
  return[shaking,shake];
}

function FreeSpinsIntro({count,onStart}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 40% 60%,#2d0060 0%,#0a0020 100%)"}}>
      <div style={{textAlign:"center",animation:"sbPopIn .5s cubic-bezier(.34,1.56,.64,1)",zIndex:1,padding:"0 20px"}}>
        <div style={{fontSize:56,marginBottom:6,filter:"drop-shadow(0 0 30px #ff69b4)",animation:"sbBounce 1s ease-in-out infinite alternate"}}>🍭</div>
        <div style={{fontWeight:900,fontSize:"clamp(12px,3.5vw,18px)",color:"rgba(255,200,255,.7)",letterSpacing:4,textTransform:"uppercase",marginBottom:4}}>YOU UNLOCKED</div>
        <div style={{fontWeight:900,fontSize:"clamp(32px,9vw,60px)",background:"linear-gradient(135deg,#ffd700,#ff69b4,#ffd700)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:3,textTransform:"uppercase",marginBottom:4}}>FREE SPINS</div>
        <div style={{fontWeight:900,fontSize:"clamp(56px,16vw,110px)",background:"linear-gradient(135deg,#ffd700,#ff9500)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:.9,marginBottom:10}}>{count}×</div>
        <div style={{color:"rgba(255,255,255,.65)",fontSize:12,marginBottom:24}}>Multiplier Bombs Active!</div>
        <button onClick={onStart} style={{padding:"14px 48px",borderRadius:50,border:"3px solid rgba(255,255,255,.4)",cursor:"pointer",fontWeight:900,fontSize:18,color:"#fff",background:"linear-gradient(135deg,#ff6b35,#e91e63,#ff6b35)",boxShadow:"0 8px 32px rgba(255,107,53,.7)",letterSpacing:2,fontFamily:"'Arial Black',sans-serif"}}>START ▶</button>
      </div>
    </div>
  );
}

function FreeSpinsSummary({totalSpins,totalWon,onClose}){
  const displayed=useCountUp(totalWon,2000);
  return(
    <div style={{position:"fixed",inset:0,zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at center,#001a33 0%,#000 100%)"}}>
      <div style={{textAlign:"center",animation:"sbPopIn .5s cubic-bezier(.34,1.56,.64,1)",zIndex:1,padding:"0 20px",maxWidth:360,width:"100%"}}>
        <div style={{fontSize:50,marginBottom:8,filter:"drop-shadow(0 0 20px gold)"}}>🎊</div>
        <div style={{fontWeight:900,fontSize:"clamp(20px,5.5vw,32px)",color:"#ffd700",letterSpacing:2,textTransform:"uppercase",marginBottom:4,fontFamily:"'Arial Black',sans-serif"}}>CONGRATULATIONS!</div>
        <div style={{color:"rgba(255,255,255,.6)",fontSize:12,marginBottom:20}}>Free Spins Completed</div>
        <div style={{background:"rgba(255,255,255,.06)",borderRadius:20,padding:"20px 24px",border:"2px solid rgba(255,215,0,.25)",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14,alignItems:"center"}}>
            <span style={{color:"rgba(255,255,255,.5)",fontSize:12,fontWeight:700}}>Total Spins</span>
            <span style={{color:"#fff",fontWeight:900,fontSize:22}}>{totalSpins}</span>
          </div>
          <div style={{height:1,background:"rgba(255,215,0,.15)",marginBottom:14}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"rgba(255,255,255,.5)",fontSize:12,fontWeight:700}}>Total Won</span>
            <span style={{fontWeight:900,fontSize:"clamp(24px,6.5vw,40px)",background:"linear-gradient(135deg,#ffd700,#ff9500)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontFamily:"'Arial Black',sans-serif"}}>{fmt(displayed)}</span>
          </div>
        </div>
        <button onClick={onClose} style={{padding:"13px 0",borderRadius:50,border:"none",cursor:"pointer",fontWeight:900,fontSize:15,color:"#fff",background:"linear-gradient(135deg,#27ae60,#1e8449)",width:"100%",fontFamily:"'Arial Black',sans-serif"}}>Continue Playing ▶</button>
      </div>
    </div>
  );
}

function ConfirmModal({emoji,title,message,subtext,confirmLabel,confirmColor,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"linear-gradient(145deg,#fff8f0,#fff)",borderRadius:22,padding:"24px 22px 20px",maxWidth:300,width:"88%",textAlign:"center",animation:"sbPopIn .28s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{fontSize:36,marginBottom:8}}>{emoji}</div>
        <div style={{fontWeight:900,fontSize:17,color:"#c0392b",marginBottom:6}}>{title}</div>
        <div style={{fontSize:12,color:"#555",marginBottom:4,lineHeight:1.55}}>{message}</div>
        {subtext&&<div style={{fontSize:11,color:"#e67e22",fontWeight:700,marginBottom:16}}>{subtext}</div>}
        {!subtext&&<div style={{marginBottom:16}}/>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{flex:1,padding:"10px 0",borderRadius:12,background:"rgba(200,100,130,.1)",border:"1.5px solid rgba(200,100,130,.3)",color:"#c0392b",fontWeight:700,fontSize:12,cursor:"pointer"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"10px 0",borderRadius:12,background:confirmColor||"linear-gradient(135deg,#e74c3c,#c0392b)",border:"none",color:"#fff",fontWeight:900,fontSize:12,cursor:"pointer"}}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function RetriggerToast({bonus,show}){
  if(!show) return null;
  return(
    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:50,textAlign:"center",animation:"sbPopIn .4s cubic-bezier(.34,1.56,.64,1)",pointerEvents:"none"}}>
      <div style={{background:"linear-gradient(135deg,#8e44ad,#e91e63)",padding:"12px 24px",borderRadius:18,boxShadow:"0 8px 32px rgba(142,68,173,.7)",border:"2px solid rgba(255,255,255,.4)"}}>
        <div style={{color:"#ffd700",fontWeight:900,fontSize:14,letterSpacing:1}}>🍭 RETRIGGER!</div>
        <div style={{color:"#fff",fontWeight:700,fontSize:11,marginTop:2}}>+{bonus} Free Spins!</div>
      </div>
    </div>
  );
}

function MultiplierStack({mults}){
  if(!mults||mults.length===0) return null;
  const total=mults.reduce((a,b)=>a+b,0);
  return(
    <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"center",margin:"2px 0"}}>
      {mults.map((m,i)=>(<div key={i} style={{background:"linear-gradient(135deg,#f39c12,#e74c3c)",borderRadius:6,padding:"2px 5px",fontSize:9,fontWeight:900,color:"#fff",border:"1.5px solid rgba(255,255,255,.5)",boxShadow:"0 0 8px rgba(255,150,0,.7)",animation:"sbBombFloat 1.5s ease-in-out infinite alternate",animationDelay:`${i*0.2}s`}}>×{m}</div>))}
      {mults.length>1&&<><span style={{color:"rgba(255,255,255,.6)",fontSize:9}}>=</span><div style={{background:"linear-gradient(135deg,#ffd700,#ff6b35)",borderRadius:6,padding:"2px 7px",fontSize:10,fontWeight:900,color:"#000",border:"2px solid rgba(255,255,255,.7)",boxShadow:"0 0 14px rgba(255,215,0,.9)"}}>×{total}</div></>}
    </div>
  );
}

// ── PAYTABLE PANEL ──
function PaytablePanel({bet,onClose}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:7000,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(14px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:460,background:"linear-gradient(180deg,#1a0035 0%,#0d001a 100%)",borderRadius:"22px 22px 0 0",border:"2px solid rgba(255,100,200,.3)",padding:"16px 14px 28px",animation:"sbSlideUp .3s ease-out"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontWeight:900,fontSize:16,color:"#ffd700",fontFamily:"'Arial Black',sans-serif",letterSpacing:1}}>PAYTABLE</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,width:28,height:28,color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {NORMAL_SYMS.map(sym=>{
            const mult12=sym.mult[12]||0, mult15=sym.mult[15]||0, mult17=sym.mult[17]||0;
            return(
              <div key={sym.id} style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,.06)",borderRadius:12,padding:"7px 10px",border:"1px solid rgba(255,255,255,.1)"}}>
                <div style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <img src={sym.img} alt={sym.label} style={{width:40,height:40,objectFit:"contain",filter:`drop-shadow(0 0 6px ${sym.color}88)`}}/>
                </div>
                <div style={{marginLeft:8,flex:1}}>
                  <div style={{fontSize:11,fontWeight:900,color:"#fff",marginBottom:3}}>{sym.label}</div>
                  <div style={{display:"flex",gap:6}}>
                    <span style={{fontSize:9,color:"rgba(255,255,255,.5)"}}>×12: <span style={{color:"#ffe066",fontWeight:700}}>{fmt(mult12*bet)}</span></span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,.5)"}}>×15: <span style={{color:"#ffa500",fontWeight:700}}>{fmt(mult15*bet)}</span></span>
                    <span style={{fontSize:9,color:"rgba(255,255,255,.5)"}}>×17: <span style={{color:"#ff6b35",fontWeight:700}}>{fmt(mult17*bet)}</span></span>
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:9,color:"rgba(255,200,180,.6)",marginBottom:2}}>8 symbols</div>
                  <div style={{fontSize:14,fontWeight:900,color:"#00ff88"}}>{fmt(sym.mult[8]*bet)}</div>
                </div>
              </div>
            );
          })}
          {/* Scatter */}
          <div style={{display:"flex",alignItems:"center",background:"rgba(255,105,180,.1)",borderRadius:12,padding:"7px 10px",border:"1px solid rgba(255,105,180,.3)"}}>
            <div style={{width:44,height:44,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <img src={lollipopImg} alt="Lollipop" style={{width:42,height:42,objectFit:"contain",filter:"drop-shadow(0 0 8px rgba(255,105,180,.9))"}}/>
            </div>
            <div style={{marginLeft:8,flex:1}}>
              <div style={{fontSize:11,fontWeight:900,color:"#ff69b4",marginBottom:2}}>Lollipop — SCATTER</div>
              <div style={{fontSize:9,color:"rgba(255,200,200,.6)"}}>4+ anywhere triggers Free Spins</div>
            </div>
            <div style={{textAlign:"right",flexShrink:0}}>
              <div style={{fontSize:9,color:"rgba(255,200,180,.6)",marginBottom:2}}>4 / 5 / 6+</div>
              <div style={{fontSize:11,fontWeight:900,color:"#ffd700"}}>10 / 18 / 25</div>
              <div style={{fontSize:8,color:"rgba(255,200,200,.5)"}}>free spins</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── BET PICKER ──
function BetPicker({currentBet,onSelect,onClose}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:7000,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(14px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:460,background:"linear-gradient(180deg,#1a0035 0%,#0d001a 100%)",borderRadius:"22px 22px 0 0",border:"2px solid rgba(100,150,255,.3)",padding:"16px 14px 28px",animation:"sbSlideUp .3s ease-out"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:900,fontSize:16,color:"#ffd700",fontFamily:"'Arial Black',sans-serif",letterSpacing:1}}>SELECT BET</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,width:28,height:28,color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
          {BET_OPTS.map(v=>(
            <button key={v} onClick={()=>{onSelect(v);onClose();}} style={{padding:"10px 4px",borderRadius:12,background:currentBet===v?"linear-gradient(135deg,#e74c3c,#c0392b)":"rgba(255,255,255,.08)",border:currentBet===v?"2px solid rgba(255,150,100,.6)":"1.5px solid rgba(255,255,255,.15)",color:currentBet===v?"#fff":"rgba(255,220,200,.85)",fontWeight:900,fontSize:11,cursor:"pointer",transition:"all .15s"}}>
              ₱{v.toFixed(2)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── RULES MODAL ──
function RulesModal({onClose}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:7000,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(14px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={onClose}>
      <div style={{width:"100%",maxWidth:460,background:"linear-gradient(180deg,#1a0035 0%,#0d001a 100%)",borderRadius:"22px 22px 0 0",border:"2px solid rgba(100,200,255,.3)",padding:"16px 16px 32px",animation:"sbSlideUp .3s ease-out",maxHeight:"75vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
          <div style={{fontWeight:900,fontSize:16,color:"#ffd700",fontFamily:"'Arial Black',sans-serif",letterSpacing:1}}>GAME RULES</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,width:28,height:28,color:"#fff",fontWeight:900,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {[
          ["🎯 How to Win","Cluster 8 or more identical symbols anywhere on the 6×5 grid to win."],
          ["🔄 Tumble Feature","Winning symbols are removed and new ones fall in. Wins are evaluated again until no clusters remain."],
          ["🍭 Scatter / Free Spins","Land 4+ Lollipops for Free Spins: 4=10, 5=18, 6+=25. Retrigger available during Free Spins."],
          ["💣 Bomb Multipliers","Bombs appear randomly. Their multiplier applies to wins where the bomb cell is part of the cluster. In Free Spins, all bombs stack for a total multiplier applied at the end."],
          ["🎰 Buy Free Spins","Pay 100× your bet for 10 Free Spins. Pay 500× for 25 Super Spins with bigger multipliers."],
          ["⚡ Turbo Mode","Speeds up all animations. Toggle in the controls."],
          ["🎯 Double Chance","Doubles the chance of a high-scatter grid. Costs no extra."],
          ["⚠️ Responsible Gaming","Set limits and gamble responsibly. This is for entertainment only."],
        ].map(([title,text])=>(
          <div key={title} style={{marginBottom:12,background:"rgba(255,255,255,.05)",borderRadius:10,padding:"10px 12px",border:"1px solid rgba(255,255,255,.08)"}}>
            <div style={{fontSize:12,fontWeight:900,color:"#ffe066",marginBottom:4}}>{title}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.7)",lineHeight:1.6}}>{text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════
export default function SweetBonanza2500() {
  const [grid, setGrid] = useState(()=>makeGrid());
  const [gridKey, setGridKey] = useState(0);
  const [balance, setBalance] = useState(20000);
  const [bet, setBet] = useState(2.00);
  const [spinning, setSpinning] = useState(false);
  const [winCells, setWinCells] = useState(new Set());
  const [bombCells, setBombCells] = useState(new Set());
  const [roundWin, setRoundWin] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [dcOn, setDcOn] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [comboLevel, setComboLevel] = useState(0);
  const [fsMults, setFsMults] = useState([]);
  const [shakeLevel, shake] = useScreenShake();

  const [fsPhase, setFsPhase] = useState("none");
  const [freeSpins, setFreeSpins] = useState(0);
  const [fsInitialCount, setFsInitialCount] = useState(0);
  const [fsSpunCount, setFsSpunCount] = useState(0);
  const [fsTotalWon, setFsTotalWon] = useState(0);
  const [showRetrigger, setShowRetrigger] = useState(false);
  const [retriggerBonus, setRetriggerBonus] = useState(0);
  const [winOverlay, setWinOverlay] = useState(null);

  // UI panels
  const [showBetPicker, setShowBetPicker] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [spinRotation, setSpinRotation] = useState(0);
  const [spinResult, setSpinResult] = useState(null); // {counts:{symId:count}, totalWin}

  const winResolveRef = useRef(null);
  const spinningRef = useRef(false);
  const freeSpinsRef = useRef(0);
  const fsPhaseRef = useRef("none");
  const fsTotalWonRef = useRef(0);
  const fsSpunRef = useRef(0);
  const buyFSModeRef = useRef(false);
  const fsMultsRef = useRef([]);

  useEffect(()=>{freeSpinsRef.current=freeSpins;},[freeSpins]);
  useEffect(()=>{fsPhaseRef.current=fsPhase;},[fsPhase]);

  const delay=(ms)=>new Promise(r=>setTimeout(r,turbo?ms*0.22:ms));

  const showWinOverlay=(level,amount)=>new Promise(resolve=>{
    winResolveRef.current=resolve; setWinOverlay({level,amount});
  });
  const handleOverlayClose=()=>{
    setWinOverlay(null);
    if(winResolveRef.current){winResolveRef.current();winResolveRef.current=null;}
  };

  const animateSpin=async(inFS)=>{
    const frames=turbo?2:6;
    for(let f=0;f<frames;f++){
      setGrid(makeGrid(inFS,buyFSModeRef.current));
      setGridKey(k=>k+1);
      await delay(60);
    }
  };

  const processTumble=async(g,tumbleNum,accumulated,inFS)=>{
    const clusters=findClusters(g);
    const scatters=countScatters(g);

    if(scatters>=4&&!inFS){
      const fs=scatters>=6?25:scatters>=5?18:10;
      freeSpinsRef.current=fs; setFreeSpins(fs);
      setFsInitialCount(fs); setFsSpunCount(0); fsSpunRef.current=0;
      setFsTotalWon(0); fsTotalWonRef.current=0;
      buyFSModeRef.current=false;
      fsMultsRef.current=[]; setFsMults([]);
      setFsPhase("intro"); fsPhaseRef.current="intro";
    }

    if(scatters>=3&&inFS){
      const bonus=5;
      freeSpinsRef.current+=bonus; setFreeSpins(f=>f+bonus);
      setRetriggerBonus(bonus); setShowRetrigger(true);
      await delay(1200); setShowRetrigger(false);
    }

    if(clusters.length===0){
      if(inFS&&accumulated>0&&fsMultsRef.current.length>0){
        const totalMult=fsMultsRef.current.reduce((a,b)=>a+b,0);
        const multipliedWin=Math.round(accumulated*totalMult*100)/100;
        setFsTotalWon(tw=>{const nw=Math.round((tw+multipliedWin)*100)/100;fsTotalWonRef.current=nw;return nw;});
        setBalance(b=>Math.round((b+multipliedWin)*100)/100);
        accumulated=multipliedWin;
        setRoundWin(accumulated);
      }
      if(accumulated>0){
        const lvl=accumulated>=bet*100?"sensational":accumulated>=bet*50?"epic":accumulated>=bet*20?"mega":accumulated>=bet*5?"big":"";
        if(lvl){
          if(lvl==="sensational"||lvl==="epic") shake(3);
          else if(lvl==="mega") shake(2);
          else shake(1);
          await showWinOverlay(lvl,accumulated);
        }
      }
      return;
    }

    setComboLevel(tumbleNum);
    const winning=new Set();
    clusters.forEach(cl=>cl.cells.forEach(([r,c])=>winning.add(`${r},${c}`)));
    setWinCells(winning);

    let bombMult=1;
    if(inFS){
      g.forEach((row,r)=>row.forEach((cell,c)=>{
        if(cell.bomb&&winning.has(`${r},${c}`)){fsMultsRef.current=[...fsMultsRef.current,cell.bomb];setFsMults([...fsMultsRef.current]);bombMult+=cell.bomb;}
      }));
    } else {
      g.forEach((row,r)=>row.forEach((cell,c)=>{if(cell.bomb&&winning.has(`${r},${c}`))bombMult+=cell.bomb;}));
    }

    let win=0;
    clusters.forEach(cl=>{win+=getMultiplier(cl.sym,cl.size)*bet;});
    win=Math.round(win*(!inFS?bombMult:1)*100)/100;

    await delay(420);
    setBombCells(new Set(winning));
    if(win>=bet*20) shake(2); else if(win>=bet*5) shake(1);
    await delay(280);

    if(!inFS) setBalance(b=>Math.round((b+win)*100)/100);

    const newAccum=Math.round((accumulated+win)*100)/100;
    setRoundWin(newAccum);

    await delay(260);
    const ng=g.map((row,ri)=>row.map((cell,ci)=>{
      if(winning.has(`${ri},${ci}`)) return{sym:{...weightedRandom(inFS,buyFSModeRef.current),dropDelay:Math.random()*0.22,uid:Math.random()},state:"drop",bomb:null,dropFrom:-(Math.random()*3.5+1.5)};
      return{...cell,state:"idle"};
    }));
    let nextGrid=ng;
    if(inFS&&Math.random()<0.60) nextGrid=spawnBombs(ng);
    setGrid(nextGrid); setGridKey(k=>k+1);
    setWinCells(new Set()); setBombCells(new Set());
    await delay(380);
    await processTumble(nextGrid,tumbleNum+1,newAccum,inFS);
  };

  const runOneFreeSpIn=useCallback(async()=>{
    if(spinningRef.current) return;
    if(freeSpinsRef.current<=0){setFsPhase("summary");fsPhaseRef.current="summary";return;}
    spinningRef.current=true; setSpinning(true);
    setWinCells(new Set()); setBombCells(new Set());
    setRoundWin(0); setComboLevel(0);
    fsMultsRef.current=[]; setFsMults([]);
    setFreeSpins(f=>{freeSpinsRef.current=f-1;return f-1;});
    fsSpunRef.current+=1; setFsSpunCount(fsSpunRef.current);
    await animateSpin(true);
    let finalGrid=makeGrid(true,buyFSModeRef.current);
    finalGrid=spawnBombs(finalGrid);
    setGrid(finalGrid); setGridKey(k=>k+1);
    await delay(200);
    await processTumble(finalGrid,1,0,true);
    spinningRef.current=false; setSpinning(false);
    await delay(turbo?200:550);
    if(freeSpinsRef.current>0) runOneFreeSpIn();
    else{setFsPhase("summary");fsPhaseRef.current="summary";}
  },[turbo,dcOn]);

  const startFreeSpinsRound=useCallback(()=>{
    setFsPhase("running"); fsPhaseRef.current="running";
    setTimeout(()=>runOneFreeSpIn(),400);
  },[runOneFreeSpIn]);

  const doSpin=useCallback(async()=>{
    if(spinningRef.current||fsPhaseRef.current!=="none") return;
    if(balance<bet) return;
    spinningRef.current=true; setSpinning(true);
    setWinOverlay(null);
    setWinCells(new Set()); setBombCells(new Set());
    setRoundWin(0); setComboLevel(0); setSpinResult(null); // reset win each manual spin
    setBalance(b=>Math.round((b-bet)*100)/100);
    setSpinRotation(r=>r+720);
    await animateSpin(false);
    let finalGrid=makeGrid(false,false);
    if(dcOn&&Math.random()<0.5){const alt=makeGrid(false,false);if(countScatters(alt)>countScatters(finalGrid))finalGrid=alt;}
    setGrid(finalGrid); setGridKey(k=>k+1);
    await delay(200);
    await processTumble(finalGrid,1,0,false);
    // Build spin result for fruit display
    const counts={};
    finalGrid.forEach(row=>row.forEach(cell=>{
      const id=cell.sym.id;
      counts[id]=(counts[id]||{count:0,sym:cell.sym});
      counts[id].count++;
    }));
    setSpinResult(counts);
    spinningRef.current=false; setSpinning(false);
  },[balance,bet,turbo,dcOn]);

  useEffect(()=>{
    const h=(e)=>{if(e.code==="Space"&&!spinningRef.current&&fsPhaseRef.current==="none"){e.preventDefault();doSpin();}};
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[doSpin]);

  const handleBuyFreeSpins=()=>{
    const cost=bet*100;
    if(balance<cost) return;
    setConfirm({
      emoji:"🎰",title:"Buy Free Spins?",message:`Cost: ${fmt(cost)}`,
      subtext:"10 Free Spins + Multiplier Bombs!",
      confirmLabel:`Buy ${fmt(cost)}`,confirmColor:"linear-gradient(135deg,#e74c3c,#c0392b)",
      onConfirm:()=>{
        setConfirm(null);
        setBalance(b=>Math.round((b-cost)*100)/100);
        buyFSModeRef.current=true;
        freeSpinsRef.current=10; setFreeSpins(10);
        setFsInitialCount(10); setFsSpunCount(0); fsSpunRef.current=0;
        setFsTotalWon(0); fsTotalWonRef.current=0;
        fsMultsRef.current=[]; setFsMults([]);
        setFsPhase("intro"); fsPhaseRef.current="intro";
      },
    });
  };

  const handleBuySuperSpins=()=>{
    const cost=bet*500;
    if(balance<cost) return;
    setConfirm({
      emoji:"⚡",title:"Buy SUPER Free Spins?",message:`Cost: ${fmt(cost)}`,
      subtext:"25 SUPER Spins + Big Bombs!",
      confirmLabel:`Buy ${fmt(cost)}`,confirmColor:"linear-gradient(135deg,#f39c12,#e67e22)",
      onConfirm:()=>{
        setConfirm(null);
        setBalance(b=>Math.round((b-cost)*100)/100);
        buyFSModeRef.current=true;
        freeSpinsRef.current=25; setFreeSpins(25);
        setFsInitialCount(25); setFsSpunCount(0); fsSpunRef.current=0;
        setFsTotalWon(0); fsTotalWonRef.current=0;
        fsMultsRef.current=[]; setFsMults([]);
        setFsPhase("intro"); fsPhaseRef.current="intro";
      },
    });
  };

  const inFreeSpins=fsPhase==="running";
  const inBuySpin=inFreeSpins&&buyFSModeRef.current;

  return(
    <div style={{
      width:"100vw",height:"100vh",overflowY:"auto",WebkitOverflowScrolling:"touch",overscrollBehavior:"contain",
      position:"fixed",top:0,left:0,
      backgroundImage:`url('https://images.api.kansino.nl/cms/PRG_Sweet_Bonanza1000_bg_7c4f5e878a.jpg')`,
      backgroundSize:"cover",backgroundPosition:"center",
      display:"flex",flexDirection:"column",alignItems:"center",
      fontFamily:"'Segoe UI',sans-serif",
      animation:shakeLevel?`sbScreenShake${Math.min(shakeLevel,3)} 0.5s ease-out`:"none",
    }}>

      {/* BG overlay */}
      <div style={{position:"absolute",inset:0,background:inFreeSpins?"rgba(50,0,80,0.35)":"rgba(10,50,120,0.05)",pointerEvents:"none",zIndex:1,transition:"background 1.2s"}}/>

      {/* MODALS */}
      {fsPhase==="intro"&&<FreeSpinsIntro count={fsInitialCount} onStart={startFreeSpinsRound}/>}
      {fsPhase==="summary"&&<FreeSpinsSummary totalSpins={fsSpunRef.current} totalWon={fsTotalWonRef.current} onClose={()=>{setFsPhase("none");fsPhaseRef.current="none";buyFSModeRef.current=false;setFsMults([]);fsMultsRef.current=[];}}/>}
      {confirm&&<ConfirmModal {...confirm} onCancel={()=>setConfirm(null)}/>}
      {winOverlay&&<WinOverlay level={winOverlay.level} amount={winOverlay.amount} onClose={handleOverlayClose}/>}
      {showBetPicker&&<BetPicker currentBet={bet} onSelect={setBet} onClose={()=>setShowBetPicker(false)}/>}
      {showPaytable&&<PaytablePanel bet={bet} onClose={()=>setShowPaytable(false)}/>}
      {showRules&&<RulesModal onClose={()=>setShowRules(false)}/>}

      {/* ── TICKER ── */}
      <div style={{width:"100%",zIndex:20,flexShrink:0}}><WinTicker/></div>

      {/* ── LOGO ── */}
      {!inFreeSpins&&(
        <div style={{zIndex:10,flexShrink:0,padding:"4px 0 0",display:"flex",justifyContent:"center",alignItems:"center"}}>
          <img
            src={sweetBonanzaLogo}
            alt="Sweet Bonanza"
            onError={e=>{ e.target.style.display='none'; e.target.nextSibling.style.display='block'; }}
            style={{height:58,objectFit:"contain",filter:"drop-shadow(0 2px 12px rgba(255,100,200,.7))",maxWidth:"70vw"}}
          />
          {/* Fallback text logo */}
          <div style={{display:"none",fontWeight:900,fontSize:"clamp(18px,5vw,28px)",background:"linear-gradient(135deg,#ff6bcd,#ffd700,#ff6bcd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:3,filter:"drop-shadow(0 2px 10px rgba(255,107,205,.8))",fontFamily:"'Arial Black',sans-serif"}}>
            Sweet Bonanza
          </div>
        </div>
      )}

      {/* ── FREE SPINS HUD ── */}
      {inFreeSpins&&(
        <div style={{width:"100%",padding:"4px 8px 0",zIndex:10,flexShrink:0}}>
          <div style={{background:"linear-gradient(135deg,rgba(60,0,100,.92),rgba(140,0,80,.92))",backdropFilter:"blur(12px)",borderRadius:14,border:"2px solid rgba(255,150,255,.3)",padding:"5px 12px",boxShadow:"0 4px 24px rgba(120,0,200,.5)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:fsMults.length>0?3:0}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:7,color:"rgba(255,200,255,.65)",fontWeight:700,letterSpacing:1}}>SPINS LEFT</div>
                <div style={{fontSize:20,fontWeight:900,color:"#ffd700",lineHeight:1,textShadow:"0 0 14px rgba(255,215,0,.9)"}}>{freeSpins}</div>
              </div>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{fontSize:9,color:"#ffd700",fontWeight:900,letterSpacing:2,textTransform:"uppercase",animation:"sbPulse .7s ease-in-out infinite alternate"}}>⭐ FREE SPINS ⭐</div>
                <div style={{fontSize:7,color:"rgba(255,200,255,.55)",marginTop:1}}>Spin {fsSpunCount} • Bombs Active</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:7,color:"rgba(255,200,255,.65)",fontWeight:700,letterSpacing:1}}>BONUS WIN</div>
                <div style={{fontSize:14,fontWeight:900,color:"#00ff88",lineHeight:1,textShadow:"0 0 10px rgba(0,255,136,.7)"}}>{fmt(fsTotalWon)}</div>
              </div>
            </div>
            {fsMults.length>0&&<MultiplierStack mults={fsMults}/>}
          </div>
        </div>
      )}

      {/* ── SLOT MACHINE ── */}
      <div style={{flex:1,width:"100%",padding:"3px 6px 2px",position:"relative",zIndex:10,minHeight:0,display:"flex",flexDirection:"column"}}>
        <div style={{
          flex:1,minHeight:0,
          background:inFreeSpins?"rgba(40,0,80,0.55)":"rgba(120,190,255,0.35)",
          backdropFilter:"blur(14px)",
          borderRadius:16,
          border:inFreeSpins?"2.5px solid rgba(200,80,255,.4)":"2.5px solid rgba(255,255,255,.65)",
          boxShadow:inFreeSpins?"0 6px 32px rgba(140,0,255,.35)":"0 6px 32px rgba(80,160,255,.22), inset 0 1px 0 rgba(255,255,255,.55)",
          padding:"3px 4px 2px",
          position:"relative",
          display:"flex",flexDirection:"column",
          overflowY:"auto",WebkitOverflowScrolling:"touch",
          transition:"all .9s",
        }}>
          <div style={{textAlign:"center",fontSize:7,color:inFreeSpins?"rgba(255,180,255,.55)":"rgba(80,40,100,.5)",fontWeight:700,marginBottom:1,letterSpacing:.4,flexShrink:0}}>
            {inFreeSpins?"🍭 FREE SPINS — BOMBS STACK & MULTIPLY":"8+ SAME SYMBOLS ANYWHERE = WIN • TUMBLE"}
          </div>

          <div style={{flex:1,minHeight:0,display:"grid",gridTemplateColumns:`repeat(${COLS},1fr)`,gridTemplateRows:`repeat(${ROWS},1fr)`,gap:0}}>
            {grid.map((row,ri)=>row.map((cell,ci)=>(
              <SymCell key={`${ri}-${ci}-${gridKey}-${cell.sym.uid}`} cell={cell} isWin={winCells.has(`${ri},${ci}`)} isBomb={bombCells.has(`${ri},${ci}`)} animKey={`${gridKey}-${ri}-${ci}`} comboLevel={comboLevel}/>
            )))}
          </div>

          {comboLevel>=2&&(
            <div style={{position:"absolute",top:4,left:"50%",transform:"translateX(-50%)",zIndex:40,pointerEvents:"none",animation:"sbPopIn .3s ease-out"}}>
              <div style={{background:"linear-gradient(135deg,#ff6b35,#e91e63)",borderRadius:10,padding:"2px 9px",fontSize:9,fontWeight:900,color:"#fff",boxShadow:`0 0 ${10+comboLevel*4}px rgba(255,107,53,${0.5+comboLevel*0.1})`,border:"1.5px solid rgba(255,255,255,.5)",letterSpacing:1}}>COMBO ×{comboLevel}! 🔥</div>
            </div>
          )}
          <RetriggerToast bonus={retriggerBonus} show={showRetrigger}/>
        </div>
      </div>

      {/* ── WIN DISPLAY ── */}
      <div style={{width:"100%",padding:"2px 10px",zIndex:10,flexShrink:0,textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,0,0,0.45)",backdropFilter:"blur(10px)",borderRadius:20,padding:"4px 18px",border:"1.5px solid rgba(255,215,0,0.3)"}}>
          <span style={{fontSize:10,color:"rgba(255,255,255,.6)",fontWeight:700,letterSpacing:1}}>WIN</span>
          <span style={{fontSize:16,fontWeight:900,color:roundWin>0?"#ffd700":"rgba(255,255,255,.35)",fontFamily:"'Arial Black',sans-serif",textShadow:roundWin>0?"0 0 14px rgba(255,215,0,.8)":"none",transition:"color .3s"}}>
            {fmt(roundWin)}
          </span>
        </div>
      </div>

      {/* ── BOTTOM AREA ── */}
      {!inFreeSpins&&fsPhase==="none"&&(
        <div style={{width:"100%",padding:"0 6px 6px",zIndex:10,flexShrink:0}}>
          <div style={{background:"rgba(8,2,22,0.92)",backdropFilter:"blur(18px)",borderRadius:18,border:"1.5px solid rgba(255,255,255,.1)",boxShadow:"0 -3px 24px rgba(0,0,0,.5)",padding:"7px 8px 6px",display:"flex",flexDirection:"column",gap:5}}>

            {/* ── ROW 1: BUY NORMAL | SPIN | BUY SUPER ── */}
            <div style={{display:"flex",gap:5,alignItems:"stretch"}}>

              {/* BUY NORMAL */}
              <button onClick={handleBuyFreeSpins} style={{flex:"0 0 72px",background:"linear-gradient(160deg,#5b0020,#a0001a)",border:"1.5px solid rgba(255,100,80,.5)",borderRadius:12,padding:"6px 4px",color:"#fff",fontWeight:900,cursor:"pointer",textAlign:"center",boxShadow:"0 3px 14px rgba(160,0,26,.5)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                <div style={{fontSize:7,opacity:.7,letterSpacing:.4,lineHeight:1.2}}>BUY</div>
                <div style={{fontSize:8,fontWeight:900,lineHeight:1.2}}>FREE SPINS</div>
                <div style={{fontSize:10,fontWeight:900,color:"#ffe066",marginTop:2}}>{fmt(bet*100)}</div>
              </button>

              {/* SPIN — no background, big rotate icon */}
              <button onClick={doSpin} disabled={spinning} style={{
                flex:1, minHeight:58,
                background:"none", border:"none",
                borderRadius:50, cursor:spinning?"not-allowed":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                transition:"all .2s",
              }}>
                <svg
                  width="56" height="56" viewBox="0 0 24 24" fill="none"
                  stroke={spinning?"rgba(140,80,80,.45)":"#fff"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                  style={{transition:"transform .6s ease",transform:`rotate(${spinRotation}deg)`,filter:spinning?"none":"drop-shadow(0 0 14px rgba(255,120,120,1)) drop-shadow(0 0 28px rgba(255,50,50,.7))"}}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  <polyline points="21 3 21 9 15 9"/>
                </svg>
              </button>

              {/* BUY SUPER */}
              <button onClick={handleBuySuperSpins} style={{flex:"0 0 72px",background:"linear-gradient(160deg,#5a2800,#b05000)",border:"1.5px solid rgba(255,180,60,.4)",borderRadius:12,padding:"6px 4px",color:"#fff",fontWeight:900,cursor:"pointer",textAlign:"center",boxShadow:"0 3px 14px rgba(180,80,0,.5)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                <div style={{fontSize:7,opacity:.7,letterSpacing:.4,lineHeight:1.2}}>BUY SUPER</div>
                <div style={{fontSize:8,fontWeight:900,lineHeight:1.2}}>FREE SPINS</div>
                <div style={{fontSize:10,fontWeight:900,color:"#ffe066",marginTop:2}}>{fmt(bet*500)}</div>
              </button>
            </div>

            {/* ── FRUIT RESULT PANEL — violet bg, lollipop glow border ── */}
            <div style={{
              background:"linear-gradient(160deg,#2a004a,#4a0070,#2a004a)",
              borderRadius:14,
              border:"2px solid transparent",
              backgroundClip:"padding-box",
              boxShadow:"0 0 0 2px rgba(255,105,180,.7), 0 0 16px rgba(255,105,180,.35), 0 0 6px rgba(255,50,50,.4)",
              padding:"6px 8px",
              position:"relative",
            }}>
              {/* Animated lollipop glow border */}
              <div style={{position:"absolute",inset:-1,borderRadius:15,background:"linear-gradient(135deg,#ff69b4,#ff1a1a,#ff69b4,#ff1a1a)",padding:1,zIndex:-1,animation:"sbLolliBorder 2s linear infinite"}}/>
              <div style={{fontSize:8,color:"rgba(255,200,255,.6)",fontWeight:700,letterSpacing:1,textAlign:"center",marginBottom:4}}>RESULT</div>
              {/* 3×3 grid of fruits — top 9 symbols by count from last spin */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:4}}>
                {(()=>{
                  // Build ordered list: scatter first if present, then by count desc
                  const allSyms = [...NORMAL_SYMS.map(s=>({...s,isScatter:false})), {...SCATTER,isScatter:true,color:"#ff69b4"}];
                  const slots = allSyms.slice(0,9); // always show 9 slots
                  return slots.map((sym,i)=>{
                    const entry = spinResult ? spinResult[sym.id] : null;
                    const count = entry ? entry.count : 0;
                    const winAmt = count>=8 ? getMultiplier(sym, Math.min(count,17))*bet : 0;
                    const hasWin = winAmt > 0;
                    return (
                      <div key={sym.id} style={{
                        background: hasWin ? `linear-gradient(135deg,${sym.color}30,${sym.color}18)` : "rgba(255,255,255,.04)",
                        borderRadius:8,
                        border: hasWin ? `1px solid ${sym.color}99` : "1px solid rgba(255,255,255,.1)",
                        padding:"4px 3px",
                        display:"flex",alignItems:"center",gap:4,
                        boxShadow: hasWin ? `0 0 10px ${sym.color}55` : "none",
                        transition:"all .3s",
                      }}>
                        <div style={{width:28,height:28,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                          <img src={sym.img} alt={sym.label} style={{width:26,height:26,objectFit:"contain",filter:hasWin?`drop-shadow(0 0 6px ${sym.color})`:"none"}}/>
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:10,fontWeight:900,color:count>0?"#fff":"rgba(255,255,255,.25)",lineHeight:1}}>
                            {count>0?count:"—"}
                          </div>
                          {hasWin?(
                            <div style={{fontSize:8,fontWeight:900,color:"#ffd700",lineHeight:1,marginTop:1,textShadow:"0 0 8px rgba(255,215,0,.8)"}}>{fmt(winAmt)}</div>
                          ):(
                            <div style={{fontSize:7,color:`${sym.color}88`,lineHeight:1,marginTop:1}}>{sym.label.substring(0,5)}</div>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* ── CONTROLS ROW: bet | turbo+dc ── */}
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              {/* Bet icon */}
              <button onClick={()=>!spinning&&setShowBetPicker(true)} disabled={spinning} style={{flexShrink:0,width:44,height:36,borderRadius:10,background:"rgba(255,255,255,.07)",border:"1.5px solid rgba(255,215,0,.35)",cursor:spinning?"not-allowed":"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8"/><path d="M12 6v2"/><path d="M12 16v2"/><path d="M8 10h1.5a2.5 2.5 0 0 1 0 5H8"/><path d="M14 10h2"/>
                </svg>
                <span style={{fontSize:7,color:"#ffd700",fontWeight:700}}>{fmt(bet)}</span>
              </button>
              {/* Turbo */}
              <button onClick={()=>setTurbo(t=>!t)} style={{flex:1,height:36,borderRadius:10,background:turbo?"linear-gradient(135deg,#e67e22,#d35400)":"rgba(255,255,255,.07)",border:turbo?"1.5px solid #e67e22":"1.5px solid rgba(255,255,255,.12)",color:turbo?"#fff":"rgba(255,200,150,.7)",fontWeight:700,fontSize:9,cursor:"pointer"}}>⚡ TURBO</button>
              {/* DC */}
              <button onClick={()=>setDcOn(d=>!d)} style={{flex:1,height:36,borderRadius:10,background:dcOn?"linear-gradient(135deg,#2980b9,#1a5276)":"rgba(255,255,255,.07)",border:dcOn?"1.5px solid #2980b9":"1.5px solid rgba(255,255,255,.12)",color:dcOn?"#fff":"rgba(200,220,255,.7)",fontWeight:700,fontSize:9,cursor:"pointer"}}>2× CHC</button>
            </div>

            {/* FOOTER — I | Credits | Current Bet */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid rgba(255,255,255,.07)",paddingTop:4}}>
              <button onClick={()=>setShowRules(true)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:3,padding:"2px 4px"}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                <span style={{fontSize:8,color:"rgba(255,255,255,.35)",fontWeight:600,letterSpacing:.3}}>RULES</span>
              </button>
              <div><span style={{fontSize:8,color:"rgba(255,255,255,.35)",fontWeight:600,letterSpacing:.3}}>CREDITS  </span><span style={{fontSize:9,color:"rgba(255,200,100,.8)",fontWeight:900}}>{fmt(balance)}</span></div>
              <div><span style={{fontSize:8,color:"rgba(255,255,255,.35)",fontWeight:600,letterSpacing:.3}}>BET  </span><span style={{fontSize:9,color:"rgba(255,200,100,.8)",fontWeight:900}}>{fmt(bet)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ── FREE SPINS — minimal controls: only spin icon ── */}
      {inFreeSpins&&(
        <div style={{width:"100%",padding:"0 8px 8px",zIndex:10,flexShrink:0}}>
          <div style={{background:"rgba(8,2,22,0.88)",backdropFilter:"blur(18px)",borderRadius:18,border:"1.5px solid rgba(200,80,255,.2)",padding:"8px 10px",display:"flex",flexDirection:"column",gap:4}}>
            {/* Win row */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 4px"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:7,color:"rgba(255,200,255,.5)",fontWeight:700,letterSpacing:1}}>ROUND WIN</div>
                <div style={{fontSize:14,fontWeight:900,color:"#ffd700",fontFamily:"'Arial Black',sans-serif",textShadow:"0 0 12px rgba(255,215,0,.7)"}}>{fmt(roundWin)}</div>
              </div>
              {/* Spin icon centered */}
              <button onClick={()=>{}} disabled={spinning} style={{
                width:52,height:52,borderRadius:"50%",
                background:spinning?"rgba(60,0,100,.4)":"linear-gradient(135deg,#8e44ad,#e91e63)",
                border:"2px solid rgba(255,150,255,.4)",
                cursor:spinning?"not-allowed":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:spinning?"none":"0 4px 20px rgba(142,68,173,.6)",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={spinning?"rgba(200,150,255,.4)":"#fff"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{animation:spinning?"sbSpinIcon .6s linear infinite":"none"}}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  <polyline points="21 3 21 9 15 9"/>
                </svg>
              </button>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:7,color:"rgba(255,200,255,.5)",fontWeight:700,letterSpacing:1}}>BONUS TOTAL</div>
                <div style={{fontSize:14,fontWeight:900,color:"#00ff88",textShadow:"0 0 10px rgba(0,255,136,.6)"}}>{fmt(fsTotalWon)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes sbSpinIcon{to{transform:rotate(360deg);}}
        @keyframes sbPulse{from{opacity:.5;}to{opacity:1;}}
        @keyframes sbWinPulse{from{opacity:.45;transform:scale(.96);}to{opacity:1;transform:scale(1.04);}}
        @keyframes sbPopIn{from{transform:scale(.25);opacity:0;}to{transform:scale(1);opacity:1;}}
        @keyframes sbScaleIn{from{transform:scale(.5) translateY(20px);opacity:0;}to{transform:scale(1) translateY(0);opacity:1;}}
        @keyframes sbWinBounce{0%{transform:scale(.3) translateY(-30px);opacity:0;}60%{transform:scale(1.12) translateY(4px);}100%{transform:scale(1);opacity:1;}}
        @keyframes sbTickerScroll{0%{transform:translateX(0);}100%{transform:translateX(-33.33%);}}
        @keyframes sbFloat{from{transform:translateY(0) rotate(-6deg);}to{transform:translateY(-20px) rotate(6deg);}}
        @keyframes sbBounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes sbRayPulse{from{opacity:.12;}to{opacity:.55;}}
        @keyframes sbSheen{0%{left:-110%;}60%,100%{left:170%;}}
        @keyframes sbComboRing{0%{transform:scale(1);opacity:.7;}100%{transform:scale(1.5);opacity:0;}}
        @keyframes sbBombFloat{from{transform:translateY(0) scale(1);}to{transform:translateY(-3px) scale(1.08);}}
        @keyframes sbBombRing{0%{transform:scale(1);opacity:.8;}50%{transform:scale(1.4);opacity:.4;}100%{transform:scale(1.8);opacity:0;}}
        @keyframes sbBombExplode{0%{transform:scale(1);opacity:1;}50%{transform:scale(2.5);opacity:.8;}100%{transform:scale(4);opacity:0;}}
        @keyframes sbScatterHalo{from{opacity:.3;transform:scale(.95);}to{opacity:.7;transform:scale(1.1);}}
        @keyframes sbSpinBtnGlow{from{box-shadow:0 4px 20px rgba(192,57,43,.5);}to{box-shadow:0 4px 28px rgba(255,80,80,.9),0 0 44px rgba(192,57,43,.4);}}
        @keyframes sbSlideUp{from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;}}
        @keyframes sbScreenShake1{0%,100%{transform:translate(0,0);}20%{transform:translate(-3px,2px);}40%{transform:translate(3px,-2px);}60%{transform:translate(-2px,3px);}80%{transform:translate(2px,-1px);}}
        @keyframes sbScreenShake2{0%,100%{transform:translate(0,0);}15%{transform:translate(-6px,3px);}30%{transform:translate(6px,-4px);}45%{transform:translate(-4px,5px);}60%{transform:translate(5px,-3px);}75%{transform:translate(-3px,4px);}90%{transform:translate(3px,-2px);}}
        @keyframes sbScreenShake3{0%,100%{transform:translate(0,0);}10%{transform:translate(-10px,5px);}20%{transform:translate(10px,-6px);}30%{transform:translate(-7px,8px);}40%{transform:translate(8px,-5px);}50%{transform:translate(-6px,7px);}60%{transform:translate(7px,-4px);}70%{transform:translate(-5px,6px);}80%{transform:translate(5px,-3px);}90%{transform:translate(-3px,4px);}}
        @keyframes sbParticle{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:translate(calc(cos(var(--angle))*var(--dist)),calc(sin(var(--angle))*var(--dist))) scale(0);opacity:0;}}
        @keyframes sbLolliBorder{0%{background-position:0%;}100%{background-position:200%;}}
        @keyframes sbLolliGlow{0%,100%{box-shadow:0 0 0 2px rgba(255,105,180,.8),0 0 16px rgba(255,105,180,.4);}50%{box-shadow:0 0 0 2px rgba(255,50,50,.9),0 0 20px rgba(255,50,50,.5);}}
      `}</style>
    </div>
  );
}