import { useState, useEffect, useCallback, useRef } from "react";
import lollipopImg from "./assets/lolipop.png";
import heartImg from "./assets/heart.png";
import candyBlueImg from "./assets/candyBlue.png";
import grapeImg from "./assets/grape.png";
import appleImg from "./assets/apple.png";
import watermelonImg from "./assets/melon.png";
import plumImg from "./assets/plum.png";
import bananaImg from "./assets/banana.png";
import bombImg from "./assets/bombImg.png";

// ── SYMBOLS ──
const SYMBOLS = [
  {
    id: "lollipop",
    img: lollipopImg,
    label: "Lollipop",
    // color: "#ff69b4",
    scatter: true,
    scale: 1.35,
    mult: {8:0,9:0,10:0,11:0,12:36.4,13:50,14:100,15:150,16:200,17:750}
  },
  {
    scale: 1.15,
    id: "heart",
    img: heartImg,
    label: "Heart",
    color: "#e91e63",
    weight: 3,
    mult: {8:5,9:8,10:12,11:16,12:25,13:50,14:100,15:200,16:400,17:1000}
  },
  {
    scale: 1.15,
    id: "candy_blue",
    img: candyBlueImg,
    label: "Blue Candy",
    color: "#3498db",
    weight: 5,
    mult: {8:3,9:5,10:8,11:11,12:15,13:30,14:60,15:120,16:250,17:600}
  },
  {
    scale: 1.15,
    id: "grape",
    img: grapeImg,
    label: "Grape",
    color: "#9b59b6",
    weight: 8,
    mult: {8:1.5,9:2.5,10:4,11:6,12:10,13:20,14:40,15:80,16:150,17:400}
  },
  {
    scale: 1.15,
    id: "apple",
    img: appleImg,
    label: "Apple",
    color: "#e74c3c",
    weight: 10,
    mult: {8:1,9:1.5,10:3,11:5,12:8,13:15,14:30,15:60,16:100,17:250}
  },
  {
    scale: 1.15,
    id: "watermelon",
    img: watermelonImg,
    label: "Watermelon",
    color: "#27ae60",
    weight: 12,
    mult: {8:0.8,9:1.2,10:2,11:3.5,12:6,13:12,14:25,15:50,16:80,17:200}
  },
  {
    scale: 1,
    id: "plum",
    img: plumImg,
    label: "Plum",
    color: "#e67e22",
    weight: 14,
    mult: {8:0.5,9:0.8,10:1.5,11:2.5,12:4,13:8,14:16,15:32,16:60,17:150}
  },
  {
    scale: 1.15,
    id: "banana",
    img: bananaImg,
    label: "Banana",
    color: "#f1c40f",
    weight: 16,
    mult: {8:0.25,9:0.4,10:0.8,11:1.2,12:2,13:5,14:10,15:20,16:40,17:100}
  }
];

const SCATTER = SYMBOLS[0];
const NORMAL_SYMS = SYMBOLS.slice(1);
const BOMB_VALUES = [2, 3, 5, 10, 25, 50, 100, 500, 1000];
const COLS = 6, ROWS = 5;
const BET_OPTS = [0.20,0.40,0.60,1.00,2.00,4.00,6.00,10.00,20.00,40.00,100.00];

const WIN_NOTICES = [
  {name:"Ash****",amount:"₱12,450"},{name:"Mar****",amount:"₱8,200"},
  {name:"Jun****",amount:"₱31,000"},{name:"Kri****",amount:"₱5,750"},
  {name:"Ric****",amount:"₱18,900"},{name:"Jen****",amount:"₱9,300"},
  {name:"Dan****",amount:"₱42,600"},{name:"Lyn****",amount:"₱7,100"},
  {name:"Bel****",amount:"₱23,500"},{name:"Rod****",amount:"₱15,800"},
  {name:"Cel****",amount:"₱6,400"},{name:"Vin****",amount:"₱88,000"},
];

function fmt(n) {
  return "₱" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function weightedRandom(inFS=false, buyFSMode=false) {
  const scW = buyFSMode ? 0 : (inFS ? 0.5 : 2);
  const total = NORMAL_SYMS.reduce((a,s)=>a+s.weight,0)+scW;
  let r = Math.random()*total;
  for (const s of NORMAL_SYMS) { r-=s.weight; if(r<=0) return {...s,uid:Math.random(),dropDelay:Math.random()*0.18}; }
  return {...SCATTER,uid:Math.random(),dropDelay:Math.random()*0.18};
}

function decidePayout(inFS=false) {
  const r=Math.random();
  if(inFS){
    if(r<0.25) return"none";
    if(r<0.58) return"small";
    if(r<0.80) return"medium";
    if(r<0.94) return"big";
    return"massive";
  }
  if(r<0.55) return"none";
  if(r<0.82) return"small";
  if(r<0.93) return"medium";
  if(r<0.98) return"big";
  return"massive";
}

function makeGrid(inFS=false, buyFSMode=false) {
  const tier=decidePayout(inFS);
  const empty=()=>Array.from({length:ROWS},()=>Array.from({length:COLS},()=>({
    sym:weightedRandom(inFS, buyFSMode), state:"idle", bomb:null, dropFrom: -(Math.random()*3+1)
  })));

  if(tier==="none") return empty();

  const grid=empty();
  const pool=tier==="massive"?NORMAL_SYMS.slice(0,2):
             tier==="big"?NORMAL_SYMS.slice(0,4):
             tier==="medium"?NORMAL_SYMS.slice(2,6):NORMAL_SYMS.slice(4);
  const target=pool[Math.floor(Math.random()*pool.length)];
  const count=tier==="massive"?14+Math.floor(Math.random()*4):
              tier==="big"?12+Math.floor(Math.random()*3):
              tier==="medium"?10+Math.floor(Math.random()*3):8+Math.floor(Math.random()*2);

  const allCells=[];
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++) allCells.push([r,c]);
  for(let i=allCells.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[allCells[i],allCells[j]]=[allCells[j],allCells[i]];}
  allCells.slice(0,Math.min(count,ROWS*COLS)).forEach(([r,c])=>{
    grid[r][c]={sym:{...target,uid:Math.random(),dropDelay:Math.random()*0.18},state:"idle",bomb:null,dropFrom:-(Math.random()*4+1)};
  });
  return grid;
}

function findClusters(grid) {
  const counts={};
  const cellMap={};
  for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
    const sym=grid[r][c].sym;
    if(sym.scatter) continue;
    if(!counts[sym.id]){counts[sym.id]=0;cellMap[sym.id]={sym,cells:[]};}
    counts[sym.id]++;
    cellMap[sym.id].cells.push([r,c]);
  }
  const out=[];
  for(const id in counts){
    if(counts[id]>=8) out.push({sym:cellMap[id].sym, cells:cellMap[id].cells, size:counts[id]});
  }
  return out;
}

function countScatters(grid){let n=0;grid.forEach(row=>row.forEach(c=>{if(c.sym.scatter)n++;}));return n;}
function getMultiplier(sym,size){const cl=Math.min(size,17);for(let i=cl;i>=8;i--){if(sym.mult[i]!==undefined)return sym.mult[i];}return 0;}

function spawnBombs(grid){
  const g=grid.map(row=>row.map(c=>({...c})));
  const count=Math.floor(Math.random()*3)+1;
  const placed=new Set();
  for(let i=0;i<count;i++){
    let r,c,k;
    do{r=Math.floor(Math.random()*ROWS);c=Math.floor(Math.random()*COLS);k=`${r},${c}`;}while(placed.has(k)||g[r][c].sym.scatter);
    placed.add(k);
    g[r][c]={...g[r][c],bomb:BOMB_VALUES[Math.floor(Math.random()*BOMB_VALUES.length)]};
  }
  return g;
}

// ── COUNT-UP HOOK ──
function useCountUp(target, duration=1200) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if(rafRef.current) cancelAnimationFrame(rafRef.current);
    const from = fromRef.current;
    startRef.current = null;
    const animate = (ts) => {
      if(!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const prog = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      const val = from + (target - from) * eased;
      setDisplay(val);
      if(prog < 1) rafRef.current = requestAnimationFrame(animate);
      else { fromRef.current = target; setDisplay(target); }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if(rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return display;
}

// ── PARTICLES ──
function Particles({ active, color, count = 18 }) {
  if (!active) return null;
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:30,overflow:"hidden"}}>
      {Array.from({length:count}).map((_,i) => {
        const angle = (i / count) * 360;
        const dist = 40 + Math.random() * 60;
        const size = 4 + Math.random() * 6;
        const delay = Math.random() * 0.2;
        return (
          <div key={i} style={{
            position:"absolute",
            left:"50%", top:"50%",
            width:size, height:size,
            borderRadius:"50%",
            background:color,
            boxShadow:`0 0 ${size*2}px ${color}`,
            animation:`particle 0.6s ${delay}s ease-out forwards`,
            "--angle": `${angle}deg`,
            "--dist": `${dist}px`,
          }}/>
        );
      })}
    </div>
  );
}

// ── BOMB COMPONENT — floats with glow, shows value ──
function BombBadge({ value, exploding }) {
  return (
    <div style={{
      position:"absolute", top:-4, right:-4, zIndex:10,
      width:28, height:28,
      animation: exploding ? "bombExplode 0.5s ease-out forwards" : "bombFloat 2s ease-in-out infinite alternate",
    }}>
      <img src={bombImg} alt="bomb" style={{width:"100%",height:"100%",objectFit:"contain",filter:"drop-shadow(0 0 8px rgba(255,200,0,0.9)) drop-shadow(0 0 4px rgba(255,100,0,0.8))"}}/>
      <div style={{
        position:"absolute", inset:0,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontWeight:900, fontSize:value >= 100 ? 7 : value >= 10 ? 8 : 9,
        color:"#fff",
        textShadow:"0 0 4px rgba(0,0,0,1), 0 1px 2px rgba(0,0,0,1)",
        fontFamily:"'Arial Black',sans-serif",
        letterSpacing:-0.5,
        lineHeight:1,
        paddingBottom:1,
      }}>×{value}</div>
      {/* Glow pulse ring */}
      <div style={{
        position:"absolute", inset:-3,
        borderRadius:"50%",
        border:"2px solid rgba(255,200,0,0.7)",
        animation:"bombRing 1.5s ease-in-out infinite",
        pointerEvents:"none",
      }}/>
    </div>
  );
}

// ── SYMBOL CELL ──
function SymCell({ cell, isWin, isBomb, animKey, comboLevel }) {
  const s = cell.sym;
  
  const [landed, setLanded] = useState(false);
  const [popping, setPopping] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(()=>{
    setLanded(false);
    setPopping(false);
    setShowParticles(false);
    const t = setTimeout(()=>setLanded(true), 30 + (cell.sym.dropDelay||0)*900);
    return ()=>clearTimeout(t);
  },[animKey]);

  useEffect(()=>{
    if(isBomb){
      setPopping(true);
      setShowParticles(true);
      const t = setTimeout(()=>setShowParticles(false), 800);
      return ()=>clearTimeout(t);
    }
  },[isBomb]);

  const isScatter = s.scatter;
  const imgScale = isScatter ? 1.85 : 1;

  // Combo glow intensity
  const comboGlow = comboLevel > 2 ? `0 0 ${8 + comboLevel*4}px ${s.color}cc` : "";

  return (
    <div style={{
      position:"relative",
      aspectRatio:"1",
      display:"flex", alignItems:"center", justifyContent:"center",
      // No border, no background — seamless grid
      overflow:"visible",
    }}>
      {/* Win highlight bg */}
      {isWin && (
        <div style={{
          position:"absolute", inset:1,
          borderRadius:8,
          background:`radial-gradient(circle,${s.color}40,transparent 70%)`,
          animation:"winPulse 0.4s ease-in-out infinite alternate",
          zIndex:1,
        }}/>
      )}

      {/* Symbol image */}
      <div style={{
        position:"relative",
        width: `${Math.min(imgScale * 60, 95)}%`,
        width: `${Math.min(imgScale * 60, 95)}%`,
        display:"flex", alignItems:"center", justifyContent:"center",
        transform: landed
          ? (popping ? "scale(0) rotate(15deg)" : isWin ? "scale(1.08)" : "scale(1)")
          : `translateY(${(cell.dropFrom||(-2))*58}px) scale(0.7)`,
        opacity: landed ? (popping ? 0 : 1) : 0,
        transition: landed && !popping
          ? `transform 0.32s cubic-bezier(.22,1.5,.36,1) ${(cell.sym.dropDelay||0)*0.8}s, opacity 0.15s ${(cell.sym.dropDelay||0)*0.8}s`
          : popping
          ? "transform 0.18s ease-in, opacity 0.18s ease-in"
          : "none",
        zIndex:2,
        filter: isWin
          ? `drop-shadow(0 0 8px ${s.color}) drop-shadow(0 0 16px ${s.color}88) brightness(1.2)`
          : isScatter
          ? `drop-shadow(0 0 10px #ff69b488) brightness(1.1)`
          : `drop-shadow(0 2px 5px rgba(0,0,0,0.4)) brightness(1.05)`,
        willChange:"transform,opacity",
      }}>
        <img src={s.img} alt={s.label} style={{
          width:"100%", height:"100%",
          objectFit:"contain",
          pointerEvents:"none",
          display:"block",
          mixBlendMode:"multiply",
        }}/>

        {/* Sheen on win */}
        {isWin && (
          <div style={{
            position:"absolute", top:0, left:"-110%",
            width:"55%", height:"100%",
            background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)",
            animation:"sheen 1s ease-in-out infinite",
            pointerEvents:"none",
          }}/>
        )}

        {/* Combo ring */}
        {isWin && comboLevel >= 2 && (
          <div style={{
            position:"absolute", inset:-6,
            borderRadius:"50%",
            border:`2px solid ${s.color}`,
            animation:"comboRing 0.5s ease-out infinite",
            opacity:0.7,
            pointerEvents:"none",
          }}/>
        )}
      </div>

      {/* Bomb badge — floats above */}
      {cell.bomb && (
        <BombBadge value={cell.bomb} exploding={isBomb}/>
      )}

      {/* Scatter glow halo */}
      {isScatter && !popping && (
        <div style={{
          position:"absolute", inset:-4,
          borderRadius:"50%",
          background:"radial-gradient(circle,rgba(255,105,180,0.25),transparent 70%)",
          animation:"scatterHalo 2s ease-in-out infinite alternate",
          pointerEvents:"none",
          zIndex:0,
        }}/>
      )}

      {/* Pop particles */}
      {showParticles && <Particles active color={s.color} count={16}/>}
    </div>
  );
}

// ── TICKER ──
function WinTicker(){
  const[items]=useState(()=>{const s=[...WIN_NOTICES].sort(()=>Math.random()-.5);return[...s,...s,...s];});
  return(
    <div style={{width:"100%",overflow:"hidden",background:"linear-gradient(90deg,rgba(200,0,80,.95),rgba(255,120,0,.95),rgba(200,0,80,.95))",padding:"4px 0",borderBottom:"2px solid rgba(255,255,255,.25)"}}>
      <div style={{display:"flex",gap:56,animation:"tickerScroll 38s linear infinite",whiteSpace:"nowrap",width:"max-content"}}>
        {items.map((w,i)=>(
          <span key={i} style={{fontSize:11,fontWeight:700,color:"#fff",display:"inline-flex",alignItems:"center",gap:6,textShadow:"0 1px 4px rgba(0,0,0,.5)"}}>
            🎉 <strong style={{color:"#ffe066"}}>{w.name}</strong> won <strong style={{color:"#fff200"}}>{w.amount}</strong>!
          </span>
        ))}
      </div>
    </div>
  );
}

// ── WIN OVERLAY ──
function WinOverlay({ level, amount, onClose }) {
  const displayed = useCountUp(amount, level === "epic" ? 2200 : level === "mega" ? 1800 : 1200);
  const configs = {
    big:        { label:"BIG WIN!",       colors:"#ff6b35,#ffd700,#ff6b35", glow:"rgba(255,200,0,.9)",  bg:"rgba(80,20,0,.75)" },
    mega:       { label:"MEGA WIN!",      colors:"#e91e63,#ffd700,#ff69b4", glow:"rgba(255,100,200,.9)",bg:"rgba(60,0,40,.78)" },
    epic:       { label:"EPIC WIN!",      colors:"#a855f7,#ffd700,#3b82f6", glow:"rgba(200,100,255,.9)",bg:"rgba(20,0,60,.82)" },
    sensational:{ label:"SENSATIONAL!",   colors:"#ff6b35,#ffd700,#ff69b4,#a855f7,#ff6b35", glow:"rgba(255,215,0,1)", bg:"rgba(40,0,80,.88)" },
    scatter:    { label:"FREE SPINS!",    colors:"#ff69b4,#ffd700,#ff69b4", glow:"rgba(255,150,200,.8)",bg:"rgba(60,0,50,.75)" },
  };
  const cfg = configs[level] || configs.big;
  return (
    <div style={{position:"fixed",inset:0,zIndex:9500,display:"flex",alignItems:"center",justifyContent:"center",background:cfg.bg,backdropFilter:"blur(10px)"}}
      onClick={onClose}>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none"}}>
        {Array.from({length:20}).map((_,i)=>(
          <div key={i} style={{position:"absolute",width:2,height:"44%",background:"linear-gradient(to top,transparent,rgba(255,215,0,.45),transparent)",transform:`rotate(${i*18}deg)`,transformOrigin:"bottom center",top:0,left:"50%",marginLeft:-1,animation:`rayPulse 1.4s ease-in-out infinite`,animationDelay:`${i*0.07}s`}}/>
        ))}
      </div>
      <div style={{textAlign:"center",zIndex:1,padding:"0 24px",maxWidth:420,width:"90%",animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{fontWeight:900,fontSize:"clamp(38px,11vw,74px)",background:`linear-gradient(135deg,${cfg.colors})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:2,textTransform:"uppercase",lineHeight:1,filter:`drop-shadow(0 0 30px ${cfg.glow}) drop-shadow(0 4px 0 rgba(0,0,0,.5))`,WebkitTextStroke:"2px rgba(0,0,0,.3)",marginBottom:14,animation:"winBounce .6s cubic-bezier(.34,1.56,.64,1)",fontFamily:"'Arial Black',sans-serif"}}>
          {cfg.label}
        </div>
        {level !== "scatter" && (
          <div style={{position:"relative",display:"inline-block",background:"linear-gradient(135deg,#d4008a,#ff1aaa,#d4008a)",padding:"14px 44px",borderRadius:60,border:"4px solid rgba(255,255,255,.6)",boxShadow:`0 0 40px ${cfg.glow}, 0 8px 24px rgba(0,0,0,.5), inset 0 2px 0 rgba(255,255,255,.4)`,marginBottom:20,animation:"scaleIn .5s .15s both cubic-bezier(.34,1.56,.64,1)"}}>
            <div style={{position:"absolute",left:-18,top:"20%",width:28,height:24,background:"#d4008a",borderRadius:"50% 50% 40% 60%",transform:"rotate(-20deg)"}}/>
            <div style={{position:"absolute",right:-18,top:"20%",width:28,height:24,background:"#d4008a",borderRadius:"50% 50% 60% 40%",transform:"rotate(20deg)"}}/>
            <span style={{fontWeight:900,fontSize:"clamp(28px,8vw,54px)",color:"#fff",textShadow:"0 2px 8px rgba(0,0,0,.5)",letterSpacing:1,fontFamily:"'Arial Black',sans-serif"}}>
              {fmt(displayed)}
            </span>
          </div>
        )}
        {level === "scatter" && (
          <div style={{color:"#ffe066",fontWeight:900,fontSize:"clamp(20px,6vw,38px)",marginBottom:20,textShadow:`0 0 20px ${cfg.glow}`}}>
            {fmt(amount)} FREE SPINS!
          </div>
        )}
        <div style={{color:"rgba(255,255,255,.5)",fontSize:12,marginBottom:16}}>tap anywhere to continue</div>
      </div>
    </div>
  );
}

// ── SCREEN SHAKE ──
function useScreenShake() {
  const [shaking, setShaking] = useState(false);
  const shake = useCallback((intensity = 1) => {
    setShaking(intensity);
    setTimeout(() => setShaking(false), intensity > 2 ? 700 : 400);
  }, []);
  return [shaking, shake];
}

// ── FREE SPINS INTRO ──
function FreeSpinsIntro({count,onStart}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at 40% 60%,#2d0060 0%,#0a0020 100%)"}}>
      {Array.from({length:28}).map((_,i)=>(
        <div key={i} style={{position:"absolute",fontSize:14+Math.random()*10,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,animation:`float ${2+Math.random()*3}s ease-in-out infinite alternate`,animationDelay:`${Math.random()*2}s`,opacity:.5+Math.random()*.4}}>
          {["🍭","🍬","⭐","💎","🌟","🍒","🍇"][Math.floor(Math.random()*7)]}
        </div>
      ))}
      <div style={{textAlign:"center",animation:"popIn .5s cubic-bezier(.34,1.56,.64,1)",zIndex:1,padding:"0 20px"}}>
        <div style={{fontSize:64,marginBottom:6,filter:"drop-shadow(0 0 30px #ff69b4)",animation:"bounce 1s ease-in-out infinite alternate"}}>🍭</div>
        <div style={{fontWeight:900,fontSize:"clamp(14px,4vw,20px)",color:"rgba(255,200,255,.7)",letterSpacing:4,textTransform:"uppercase",marginBottom:4}}>YOU UNLOCKED</div>
        <div style={{fontWeight:900,fontSize:"clamp(36px,10vw,64px)",background:"linear-gradient(135deg,#ffd700,#ff69b4,#ffd700)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:3,textTransform:"uppercase",marginBottom:4,filter:"drop-shadow(0 0 20px rgba(255,215,0,.7))"}}>FREE SPINS</div>
        <div style={{fontWeight:900,fontSize:"clamp(64px,18vw,120px)",background:"linear-gradient(135deg,#ffd700,#ff9500)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:.9,marginBottom:10,filter:"drop-shadow(0 0 30px rgba(255,200,0,.9))"}}>
          {count}×
        </div>
        <div style={{color:"rgba(255,255,255,.65)",fontSize:13,marginBottom:28,letterSpacing:1}}>Multiplier Bombs Active!</div>
        <button onClick={onStart} style={{padding:"16px 52px",borderRadius:50,border:"3px solid rgba(255,255,255,.4)",cursor:"pointer",fontWeight:900,fontSize:20,color:"#fff",background:"linear-gradient(135deg,#ff6b35,#e91e63,#ff6b35)",boxShadow:"0 8px 32px rgba(255,107,53,.7)",letterSpacing:2,animation:"glow 1.2s ease-in-out infinite alternate",fontFamily:"'Arial Black',sans-serif"}}>
          START! ▶
        </button>
      </div>
    </div>
  );
}

// ── FREE SPINS SUMMARY ──
function FreeSpinsSummary({totalSpins,totalWon,onClose}){
  const displayed = useCountUp(totalWon, 2000);
  return(
    <div style={{position:"fixed",inset:0,zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center",background:"radial-gradient(ellipse at center,#001a33 0%,#000 100%)"}}>
      {Array.from({length:22}).map((_,i)=>(
        <div key={i} style={{position:"absolute",fontSize:18,top:`${Math.random()*100}%`,left:`${Math.random()*100}%`,animation:`float ${2+Math.random()*3}s ease-in-out infinite alternate`,animationDelay:`${Math.random()*2}s`,opacity:.5}}>
          {["🍭","🍬","⭐","💎","🌟"][Math.floor(Math.random()*5)]}
        </div>
      ))}
      <div style={{textAlign:"center",animation:"popIn .5s cubic-bezier(.34,1.56,.64,1)",zIndex:1,padding:"0 20px",maxWidth:380,width:"100%"}}>
        <div style={{fontSize:56,marginBottom:8,filter:"drop-shadow(0 0 20px gold)"}}>🎊</div>
        <div style={{fontWeight:900,fontSize:"clamp(22px,6vw,36px)",color:"#ffd700",letterSpacing:2,textTransform:"uppercase",marginBottom:4,textShadow:"0 0 24px rgba(255,215,0,.9)",fontFamily:"'Arial Black',sans-serif"}}>CONGRATULATIONS!</div>
        <div style={{color:"rgba(255,255,255,.6)",fontSize:13,marginBottom:24,letterSpacing:.5}}>Free Spins Completed</div>
        <div style={{background:"rgba(255,255,255,.06)",borderRadius:22,padding:"24px 28px",border:"2px solid rgba(255,215,0,.25)",marginBottom:24,backdropFilter:"blur(10px)"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,alignItems:"center"}}>
            <span style={{color:"rgba(255,255,255,.5)",fontSize:13,fontWeight:700}}>Total Spins</span>
            <span style={{color:"#fff",fontWeight:900,fontSize:24}}>{totalSpins}</span>
          </div>
          <div style={{height:1,background:"rgba(255,215,0,.15)",marginBottom:16}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"rgba(255,255,255,.5)",fontSize:13,fontWeight:700}}>Total Won</span>
            <span style={{fontWeight:900,fontSize:"clamp(26px,7vw,44px)",background:"linear-gradient(135deg,#ffd700,#ff9500)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",filter:"drop-shadow(0 0 14px rgba(255,215,0,.7))",fontFamily:"'Arial Black',sans-serif"}}>
              {fmt(displayed)}
            </span>
          </div>
        </div>
        <button onClick={onClose} style={{padding:"15px 0",borderRadius:50,border:"none",cursor:"pointer",fontWeight:900,fontSize:17,color:"#fff",background:"linear-gradient(135deg,#27ae60,#1e8449)",boxShadow:"0 6px 24px rgba(39,174,96,.55)",letterSpacing:1,width:"100%",fontFamily:"'Arial Black',sans-serif"}}>
          Continue Playing ▶
        </button>
      </div>
    </div>
  );
}

function ConfirmModal({emoji,title,message,subtext,confirmLabel,confirmColor,onConfirm,onCancel}){
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"linear-gradient(145deg,#fff8f0,#fff)",borderRadius:24,padding:"28px 26px 22px",maxWidth:310,width:"88%",boxShadow:"0 24px 70px rgba(0,0,0,0.5)",border:"2.5px solid rgba(255,255,255,0.95)",textAlign:"center",animation:"popIn .28s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{fontSize:40,marginBottom:10}}>{emoji}</div>
        <div style={{fontWeight:900,fontSize:19,color:"#c0392b",marginBottom:6}}>{title}</div>
        <div style={{fontSize:13,color:"#555",marginBottom:4,lineHeight:1.55}}>{message}</div>
        {subtext&&<div style={{fontSize:12,color:"#e67e22",fontWeight:700,marginBottom:18}}>{subtext}</div>}
        {!subtext&&<div style={{marginBottom:18}}/>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onCancel} style={{flex:1,padding:"11px 0",borderRadius:13,background:"rgba(200,100,130,.1)",border:"1.5px solid rgba(200,100,130,.3)",color:"#c0392b",fontWeight:700,fontSize:13,cursor:"pointer"}}>Cancel</button>
          <button onClick={onConfirm} style={{flex:1,padding:"11px 0",borderRadius:13,background:confirmColor||"linear-gradient(135deg,#e74c3c,#c0392b)",border:"none",color:"#fff",fontWeight:900,fontSize:13,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,.25)"}}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function RetriggerToast({bonus,show}){
  if(!show) return null;
  return(
    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",zIndex:50,textAlign:"center",animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)",pointerEvents:"none"}}>
      <div style={{background:"linear-gradient(135deg,#8e44ad,#e91e63)",padding:"14px 28px",borderRadius:20,boxShadow:"0 8px 32px rgba(142,68,173,.7)",border:"2px solid rgba(255,255,255,.4)"}}>
        <div style={{color:"#ffd700",fontWeight:900,fontSize:16,letterSpacing:1}}>🍭 RETRIGGER!</div>
        <div style={{color:"#fff",fontWeight:700,fontSize:13,marginTop:2}}>+{bonus} Free Spins!</div>
      </div>
    </div>
  );
}

// ── MULTIPLIER STACK DISPLAY (FS) ──
function MultiplierStack({ mults }) {
  if (!mults || mults.length === 0) return null;
  const total = mults.reduce((a,b)=>a+b,0);
  return (
    <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",justifyContent:"center",margin:"2px 0"}}>
      {mults.map((m,i)=>(
        <div key={i} style={{
          background:"linear-gradient(135deg,#f39c12,#e74c3c)",
          borderRadius:8,padding:"2px 6px",fontSize:10,fontWeight:900,color:"#fff",
          border:"1.5px solid rgba(255,255,255,.5)",
          boxShadow:"0 0 10px rgba(255,150,0,.7)",
          animation:"bombFloat 1.5s ease-in-out infinite alternate",
          animationDelay:`${i*0.2}s`,
        }}>×{m}</div>
      ))}
      {mults.length > 1 && (
        <>
          <span style={{color:"rgba(255,255,255,.6)",fontSize:10}}>=</span>
          <div style={{background:"linear-gradient(135deg,#ffd700,#ff6b35)",borderRadius:8,padding:"2px 8px",fontSize:11,fontWeight:900,color:"#000",border:"2px solid rgba(255,255,255,.7)",boxShadow:"0 0 16px rgba(255,215,0,.9)"}}>
            ×{total}
          </div>
        </>
      )}
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
  const [message, setMessage] = useState("");
  const [totalWin, setTotalWin] = useState(0);
  const [roundWin, setRoundWin] = useState(0);
  const [turbo, setTurbo] = useState(false);
  const [dcOn, setDcOn] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [comboLevel, setComboLevel] = useState(0);
  const [fsMults, setFsMults] = useState([]); // collected multipliers in FS
  const [shakeLevel, shake] = useScreenShake();

  const [fsPhase, setFsPhase] = useState("none");
  const [freeSpins, setFreeSpins] = useState(0);
  const [fsInitialCount, setFsInitialCount] = useState(0);
  const [fsSpunCount, setFsSpunCount] = useState(0);
  const [fsTotalWon, setFsTotalWon] = useState(0);
  const [showRetrigger, setShowRetrigger] = useState(false);
  const [retriggerBonus, setRetriggerBonus] = useState(0);

  const [winOverlay, setWinOverlay] = useState(null);
  const winResolveRef = useRef(null);

  const spinningRef = useRef(false);
  const freeSpinsRef = useRef(0);
  const fsPhaseRef = useRef("none");
  const fsTotalWonRef = useRef(0);
  const fsSpunRef = useRef(0);
  const buyFSModeRef = useRef(false);
  const fsMultsRef = useRef([]); // accumulated multipliers for current FS sequence

  useEffect(()=>{freeSpinsRef.current=freeSpins;},[freeSpins]);
  useEffect(()=>{fsPhaseRef.current=fsPhase;},[fsPhase]);

  const delay=(ms)=>new Promise(r=>setTimeout(r,turbo?ms*0.22:ms));

  const showWinOverlay=(level,amount)=>new Promise(resolve=>{
    winResolveRef.current=resolve;
    setWinOverlay({level,amount});
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

  const runOneFreeSpIn = useCallback(async()=>{
    if(spinningRef.current) return;
    if(freeSpinsRef.current<=0){setFsPhase("summary");fsPhaseRef.current="summary";return;}
    spinningRef.current=true;
    setSpinning(true);
    setWinCells(new Set());setBombCells(new Set());
    setRoundWin(0);setMessage("");
    setComboLevel(0);
    fsMultsRef.current=[];
    setFsMults([]);

    setFreeSpins(f=>{freeSpinsRef.current=f-1;return f-1;});
    fsSpunRef.current+=1;
    setFsSpunCount(fsSpunRef.current);

    await animateSpin(true);
    let finalGrid=makeGrid(true,buyFSModeRef.current);
    finalGrid=spawnBombs(finalGrid);
    setGrid(finalGrid);
    setGridKey(k=>k+1);
    await delay(200);
    await processTumble(finalGrid,1,0,true);

    spinningRef.current=false;
    setSpinning(false);
    await delay(turbo?200:550);
    if(freeSpinsRef.current>0) runOneFreeSpIn();
    else{setFsPhase("summary");fsPhaseRef.current="summary";}
  },[turbo,dcOn]);

  const startFreeSpinsRound=useCallback(()=>{
    setFsPhase("running");fsPhaseRef.current="running";
    setTimeout(()=>runOneFreeSpIn(),400);
  },[runOneFreeSpIn]);

  const doSpin = useCallback(async()=>{
    if(spinningRef.current||fsPhaseRef.current!=="none") return;
    if(balance<bet){setMessage("💸 Insufficient balance!");return;}
    spinningRef.current=true;
    setSpinning(true);
    setWinOverlay(null);
    setWinCells(new Set());setBombCells(new Set());
    setRoundWin(0);setMessage("");
    setComboLevel(0);
    setBalance(b=>Math.round((b-bet)*100)/100);

    await animateSpin(false);
    let finalGrid=makeGrid(false,false);
    if(dcOn&&Math.random()<0.5){const alt=makeGrid(false,false);if(countScatters(alt)>countScatters(finalGrid))finalGrid=alt;}
    setGrid(finalGrid);
    setGridKey(k=>k+1);
    await delay(200);
    await processTumble(finalGrid,1,0,false);
    spinningRef.current=false;
    setSpinning(false);
  },[balance,bet,turbo,dcOn]);

  const processTumble=async(g,tumbleNum,accumulated,inFS)=>{
    const clusters=findClusters(g);
    const scatters=countScatters(g);

    if(scatters>=4&&!inFS){
      const fs=scatters>=6?25:scatters>=5?18:10;
      freeSpinsRef.current=fs;setFreeSpins(fs);
      setFsInitialCount(fs);setFsSpunCount(0);fsSpunRef.current=0;
      setFsTotalWon(0);fsTotalWonRef.current=0;
      buyFSModeRef.current=false;
      fsMultsRef.current=[];setFsMults([]);
      setFsPhase("intro");fsPhaseRef.current="intro";
    }

    if(scatters>=3&&inFS){
      const bonus=5;
      freeSpinsRef.current+=bonus;
      setFreeSpins(f=>f+bonus);
      setRetriggerBonus(bonus);setShowRetrigger(true);
      await delay(1200);setShowRetrigger(false);
    }

    if(clusters.length===0){
      // Apply accumulated FS multiplier to final win
      if(inFS && accumulated>0 && fsMultsRef.current.length>0){
        const totalMult = fsMultsRef.current.reduce((a,b)=>a+b,0);
        const multipliedWin = Math.round(accumulated * totalMult * 100) / 100;
        setFsTotalWon(tw=>{const nw=Math.round((tw+multipliedWin)*100)/100;fsTotalWonRef.current=nw;return nw;});
        setBalance(b=>Math.round((b+multipliedWin)*100)/100);
        accumulated = multipliedWin;
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

    // New combo level
    setComboLevel(tumbleNum);

    const winning=new Set();
    clusters.forEach(cl=>cl.cells.forEach(([r,c])=>winning.add(`${r},${c}`)));
    setWinCells(winning);

    // Collect bombs in FS — add to running total
    let bombMult=1;
    if(inFS){
      g.forEach((row,r)=>row.forEach((cell,c)=>{
        if(cell.bomb&&winning.has(`${r},${c}`)){
          fsMultsRef.current=[...fsMultsRef.current,cell.bomb];
          setFsMults([...fsMultsRef.current]);
          bombMult+=cell.bomb; // for display in base game
        }
      }));
    } else {
      // Base game: bombs multiply this tumble's win only
      g.forEach((row,r)=>row.forEach((cell,c)=>{
        if(cell.bomb&&winning.has(`${r},${c}`)) bombMult+=cell.bomb;
      }));
    }

    let win=0;
    clusters.forEach(cl=>{win+=getMultiplier(cl.sym,cl.size)*bet;});
    win=Math.round(win*(!inFS?bombMult:1)*100)/100;

    await delay(420);
    setBombCells(new Set(winning));
    // Shake on wins
    if(win>=bet*20) shake(2);
    else if(win>=bet*5) shake(1);
    await delay(280);
    
    if(!inFS){
      setBalance(b=>Math.round((b+win)*100)/100);
    }
    // In FS, we accumulate and apply multiplier at end of tumble chain

    const newAccum=Math.round((accumulated+win)*100)/100;
    setRoundWin(newAccum);
    if(!inFS) setTotalWin(tw=>Math.round((tw+win)*100)/100);

    const msg=win>=bet*50?`⚡ EPIC! +${fmt(win)}`:win>=bet*20?`🌟 MEGA! +${fmt(win)}`:win>=bet*5?`🎊 BIG! +${fmt(win)}`:`+${fmt(win)}`;
    setMessage(!inFS&&bombMult>1?msg+` ×${bombMult} BOMB!`:msg);

    await delay(260);
    const newGrid=g.map((ri,r)=>ri.map ? ri.map((cell,c)=>{
      if(winning.has(`${r},${c}`)) return{sym:{...weightedRandom(inFS,buyFSModeRef.current),dropDelay:Math.random()*0.22,uid:Math.random()},state:"drop",bomb:null,dropFrom:-(Math.random()*3+1.5)};
      return{...cell,state:"idle"};
    }) : ri);
    // Fix: proper 2D map
    const ng=g.map((row,ri)=>row.map((cell,ci)=>{
      if(winning.has(`${ri},${ci}`)) return{sym:{...weightedRandom(inFS,buyFSModeRef.current),dropDelay:Math.random()*0.22,uid:Math.random()},state:"drop",bomb:null,dropFrom:-(Math.random()*3.5+1.5)};
      return{...cell,state:"idle"};
    }));
    let nextGrid=ng;
    if(inFS&&Math.random()<0.60) nextGrid=spawnBombs(ng);
    setGrid(nextGrid);
    setGridKey(k=>k+1);
    setWinCells(new Set());setBombCells(new Set());
    await delay(380);
    await processTumble(nextGrid,tumbleNum+1,newAccum,inFS);
  };

  useEffect(()=>{
    const h=(e)=>{if(e.code==="Space"&&!spinningRef.current&&fsPhaseRef.current==="none"){e.preventDefault();doSpin();}};
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[doSpin]);

  const handleBuyFreeSpins=()=>{
    const cost=bet*100;
    if(balance<cost){setMessage("💸 Insufficient balance!");return;}
    setConfirm({
      emoji:"🎰",title:"Buy Free Spins?",message:`Cost: ${fmt(cost)}`,
      subtext:"10 Free Spins + Multiplier Bombs! (No scatters during spins)",
      confirmLabel:`Buy ${fmt(cost)}`,confirmColor:"linear-gradient(135deg,#e74c3c,#c0392b)",
      onConfirm:()=>{
        setConfirm(null);
        setBalance(b=>Math.round((b-cost)*100)/100);
        buyFSModeRef.current=true;
        freeSpinsRef.current=10;setFreeSpins(10);
        setFsInitialCount(10);setFsSpunCount(0);fsSpunRef.current=0;
        setFsTotalWon(0);fsTotalWonRef.current=0;
        fsMultsRef.current=[];setFsMults([]);
        setFsPhase("intro");fsPhaseRef.current="intro";
      },
    });
  };

  const handleBuySuperSpins=()=>{
    const cost=bet*500;
    if(balance<cost){setMessage("💸 Insufficient balance!");return;}
    setConfirm({
      emoji:"⚡",title:"Buy SUPER Free Spins?",message:`Cost: ${fmt(cost)}`,
      subtext:"25 SUPER Spins + Big Bombs! (No scatters, max multipliers)",
      confirmLabel:`Buy ${fmt(cost)}`,confirmColor:"linear-gradient(135deg,#f39c12,#e67e22)",
      onConfirm:()=>{
        setConfirm(null);
        setBalance(b=>Math.round((b-cost)*100)/100);
        buyFSModeRef.current=true;
        freeSpinsRef.current=25;setFreeSpins(25);
        setFsInitialCount(25);setFsSpunCount(0);fsSpunRef.current=0;
        setFsTotalWon(0);fsTotalWonRef.current=0;
        fsMultsRef.current=[];setFsMults([]);
        setFsPhase("intro");fsPhaseRef.current="intro";
      },
    });
  };

  const inFreeSpins=fsPhase==="running";

  // Shake transform
  const shakeTransform = shakeLevel
    ? `translate(${(Math.random()-0.5)*shakeLevel*4}px,${(Math.random()-0.5)*shakeLevel*3}px)`
    : "none";

  return(
    <div style={{
      width:"100vw", height:"100vh", overflow:"hidden",
      position:"fixed", top:0, left:0,
      backgroundImage:`url('https://images.api.kansino.nl/cms/PRG_Sweet_Bonanza1000_bg_7c4f5e878a.jpg')`,
      backgroundSize:"cover", backgroundPosition:"center",
      display:"flex", flexDirection:"column", alignItems:"center",
      fontFamily:"'Segoe UI',sans-serif",
      transform: shakeLevel ? `translate(${(Math.random()-0.5)*shakeLevel*5}px,${(Math.random()-0.5)*shakeLevel*4}px)` : "none",
      animation: shakeLevel ? `screenShake${Math.min(shakeLevel,3)} 0.5s ease-out` : "none",
    }}>

      {/* BG tint */}
      <div style={{position:"absolute",inset:0,background:inFreeSpins?"rgba(60,0,100,0.38)":"rgba(20,80,160,0.06)",pointerEvents:"none",zIndex:1,transition:"background 1.2s"}}/>

      {fsPhase==="intro"&&<FreeSpinsIntro count={fsInitialCount} onStart={startFreeSpinsRound}/>}
      {fsPhase==="summary"&&<FreeSpinsSummary totalSpins={fsSpunRef.current} totalWon={fsTotalWonRef.current} onClose={()=>{setFsPhase("none");fsPhaseRef.current="none";buyFSModeRef.current=false;setFsMults([]);fsMultsRef.current=[];}}/>}
      {confirm&&<ConfirmModal {...confirm} onCancel={()=>setConfirm(null)}/>}
      {winOverlay&&<WinOverlay level={winOverlay.level} amount={winOverlay.amount} onClose={handleOverlayClose}/>}

      {/* TICKER */}
      <div style={{width:"100%",zIndex:20,flexShrink:0}}><WinTicker/></div>

      {/* HEADER */}
      <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 10px 0",zIndex:10,flexShrink:0}}>
        <div style={{display:"flex",gap:5}}>
          {[["CREDIT",fmt(balance),"#c0392b"],["WIN",fmt(totalWin),"#27ae60"]].map(([lbl,val,col])=>(
            <div key={lbl} style={{background:"rgba(255,255,255,.88)",backdropFilter:"blur(10px)",borderRadius:10,padding:"3px 9px",border:"1.5px solid rgba(255,255,255,.95)",boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>
              <div style={{fontSize:7,color:"rgba(80,20,50,.5)",fontWeight:700,letterSpacing:1}}>{lbl}</div>
              <div style={{fontSize:13,fontWeight:900,color:col}}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{textAlign:"center",flex:1}}>
          <div style={{fontWeight:900,fontSize:"clamp(16px,4.5vw,26px)",background:"linear-gradient(135deg,#ff6bcd,#ffd700,#ff6bcd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:3,filter:"drop-shadow(0 2px 10px rgba(255,107,205,.8))",fontFamily:"'Arial Black',sans-serif"}}>Sweet Bonanza</div>
          <div style={{fontSize:7,color:"rgba(255,255,255,.6)",letterSpacing:3,fontWeight:700,textShadow:"0 1px 3px rgba(0,0,0,.5)"}}>2500 • PRAGMATIC PLAY</div>
        </div>

        <div style={{display:"flex",gap:5,alignItems:"center"}}>
          <div style={{background:"rgba(255,255,255,.88)",backdropFilter:"blur(10px)",borderRadius:10,padding:"3px 9px",border:"1.5px solid rgba(255,255,255,.95)",textAlign:"right",boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}>
            <div style={{fontSize:7,color:"rgba(80,20,50,.5)",fontWeight:700,letterSpacing:1}}>BET</div>
            <div style={{fontSize:13,fontWeight:900,color:"#c0392b"}}>{fmt(bet)}</div>
          </div>
        </div>
      </div>

      {/* FREE SPINS HUD */}
      {inFreeSpins&&(
        <div style={{width:"100%",padding:"3px 10px 0",zIndex:10,flexShrink:0}}>
          <div style={{background:"linear-gradient(135deg,rgba(70,0,110,.92),rgba(160,0,90,.92))",backdropFilter:"blur(12px)",borderRadius:14,border:"2px solid rgba(255,150,255,.3)",padding:"5px 14px",boxShadow:"0 4px 24px rgba(120,0,200,.5)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:fsMults.length>0?3:0}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:7,color:"rgba(255,200,255,.65)",fontWeight:700,letterSpacing:1}}>SPINS LEFT</div>
                <div style={{fontSize:22,fontWeight:900,color:"#ffd700",lineHeight:1,textShadow:"0 0 14px rgba(255,215,0,.9)"}}>{freeSpins}</div>
              </div>
              <div style={{textAlign:"center",flex:1}}>
                <div style={{fontSize:10,color:"#ffd700",fontWeight:900,letterSpacing:2,textTransform:"uppercase",animation:"pulse .7s ease-in-out infinite alternate"}}>⭐ FREE SPINS ⭐</div>
                <div style={{fontSize:7,color:"rgba(255,200,255,.55)",marginTop:1}}>Spin {fsSpunCount} • Bombs Active</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:7,color:"rgba(255,200,255,.65)",fontWeight:700,letterSpacing:1}}>BONUS WIN</div>
                <div style={{fontSize:15,fontWeight:900,color:"#00ff88",lineHeight:1,textShadow:"0 0 10px rgba(0,255,136,.7)"}}>{fmt(fsTotalWon)}</div>
              </div>
            </div>
            {fsMults.length>0&&<MultiplierStack mults={fsMults}/>}
          </div>
        </div>
      )}

      {/* GRID */}
      <div style={{flex:1,width:"100%",padding:"3px 6px 2px",position:"relative",zIndex:10,minHeight:0,display:"flex",flexDirection:"column"}}>
        <div style={{
          flex:1, minHeight:0,
          background:inFreeSpins?"rgba(50,0,90,0.52)":"rgba(140,210,255,0.38)",
          backdropFilter:"blur(14px)",
          borderRadius:16,
          border:inFreeSpins?"2.5px solid rgba(200,80,255,.4)":"2.5px solid rgba(255,255,255,.65)",
          boxShadow:inFreeSpins?"0 6px 32px rgba(140,0,255,.35)":"0 6px 32px rgba(80,160,255,.22), inset 0 1px 0 rgba(255,255,255,.55)",
          padding:"3px 4px 2px",
          position:"relative",
          display:"flex", flexDirection:"column",
          overflow:"hidden",
          transition:"all .9s",
        }}>

          {/* Mode hint */}
          <div style={{textAlign:"center",fontSize:7,color:inFreeSpins?"rgba(255,180,255,.55)":"rgba(80,40,100,.5)",fontWeight:700,marginBottom:1,letterSpacing:.4,flexShrink:0}}>
            {inFreeSpins?"🍭 FREE SPINS — BOMBS STACK & MULTIPLY":"8+ SAME SYMBOLS ANYWHERE = WIN • TUMBLE"}
          </div>

          {/* Message */}
          {message&&<div style={{textAlign:"center",fontSize:10,fontWeight:900,color:"#ffe066",textShadow:"0 1px 8px rgba(0,0,0,.7)",marginBottom:1,letterSpacing:.5,minHeight:14,flexShrink:0,animation:"msgPop 0.2s cubic-bezier(.34,1.56,.64,1)"}}>{message}</div>}

          {/* GRID — 6 cols × 5 rows, zero gap, full fill */}
          <div style={{
            flex:1, minHeight:0,
            display:"grid",
            gridTemplateColumns:`repeat(${COLS},1fr)`,
            gridTemplateRows:`repeat(${ROWS},1fr)`,
            gap:0, // NO gap — maximize space
          }}>
            {grid.map((row,ri)=>row.map((cell,ci)=>(
              <SymCell
                key={`${ri}-${ci}-${gridKey}-${cell.sym.uid}`}
                cell={cell}
                isWin={winCells.has(`${ri},${ci}`)}
                isBomb={bombCells.has(`${ri},${ci}`)}
                animKey={`${gridKey}-${ri}-${ci}`}
                comboLevel={comboLevel}
              />
            )))}
          </div>

          {roundWin>0&&(
            <div style={{flexShrink:0,padding:"2px 0",display:"flex",justifyContent:"center"}}>
              <div style={{background:"rgba(0,0,0,.35)",color:"#ffe066",fontWeight:900,fontSize:10,padding:"2px 14px",borderRadius:10,border:"1px solid rgba(255,215,0,.3)",animation:"msgPop 0.2s ease-out"}}>{fmt(roundWin)}</div>
            </div>
          )}

          <RetriggerToast bonus={retriggerBonus} show={showRetrigger}/>

          {/* Combo chain indicator */}
          {comboLevel>=2&&(
            <div style={{position:"absolute",top:4,left:"50%",transform:"translateX(-50%)",zIndex:40,pointerEvents:"none",animation:"popIn .3s ease-out"}}>
              <div style={{
                background:"linear-gradient(135deg,#ff6b35,#e91e63)",
                borderRadius:12,padding:"2px 10px",
                fontSize:9,fontWeight:900,color:"#fff",
                boxShadow:`0 0 ${10+comboLevel*4}px rgba(255,107,53,${0.5+comboLevel*0.1})`,
                border:"1.5px solid rgba(255,255,255,.5)",
                letterSpacing:1,
              }}>
                COMBO ×{comboLevel}! 🔥
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      {!inFreeSpins&&fsPhase==="none"&&(
        <div style={{width:"100%",padding:"0 8px 8px",zIndex:10,flexShrink:0}}>
          <div style={{background:"rgba(12,4,30,0.9)",backdropFilter:"blur(18px)",borderRadius:18,border:"2px solid rgba(255,255,255,.13)",boxShadow:"0 -3px 24px rgba(0,0,0,.45)",padding:"7px 9px",display:"flex",flexDirection:"column",gap:5}}>

            <div style={{display:"flex",gap:5,alignItems:"stretch"}}>
              <button onClick={handleBuyFreeSpins} style={{flex:"0 0 65px",background:"linear-gradient(135deg,#e74c3c,#c0392b)",border:"1.5px solid rgba(255,130,110,.5)",borderRadius:12,padding:"5px 3px",color:"#fff",fontWeight:900,cursor:"pointer",lineHeight:1.3,textAlign:"center",boxShadow:"0 3px 14px rgba(231,76,60,.55)"}}>
                <div style={{fontSize:7,opacity:.8}}>BUY</div>
                <div style={{fontSize:8,fontWeight:900}}>FREE SPINS</div>
                <div style={{fontSize:9,fontWeight:900,color:"#ffe066",marginTop:1}}>{fmt(bet*100)}</div>
              </button>

              <button onClick={doSpin} disabled={spinning} style={{
                flex:1,
                background:spinning?"rgba(80,40,60,.5)":"linear-gradient(135deg,#e74c3c,#8b0000,#e74c3c)",
                border:spinning?"none":"2.5px solid rgba(255,180,160,.4)",
                borderRadius:50, color:spinning?"rgba(180,120,120,.5)":"#fff",
                fontWeight:900, fontSize:15, cursor:spinning?"not-allowed":"pointer",
                letterSpacing:2,
                boxShadow:spinning?"none":"0 6px 26px rgba(220,50,50,.65)",
                transition:"all .2s", minHeight:44,
                fontFamily:"'Arial Black',sans-serif",
                animation: !spinning ? "spinBtnGlow 2s ease-in-out infinite alternate" : "none",
              }}>
                {spinning
                  ?<span style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,fontSize:12}}><span style={{display:"inline-block",animation:"spin .5s linear infinite"}}>🔄</span>SPINNING...</span>
                  :"SPIN ▶"}
              </button>

              <button onClick={handleBuySuperSpins} style={{flex:"0 0 65px",background:"linear-gradient(135deg,#f39c12,#c0392b)",border:"1.5px solid rgba(255,200,80,.4)",borderRadius:12,padding:"5px 3px",color:"#fff",fontWeight:900,cursor:"pointer",lineHeight:1.3,textAlign:"center",boxShadow:"0 3px 14px rgba(243,156,18,.55)"}}>
                <div style={{fontSize:7,opacity:.8}}>BUY SUPER</div>
                <div style={{fontSize:8,fontWeight:900}}>FREE SPINS</div>
                <div style={{fontSize:9,fontWeight:900,color:"#ffe066",marginTop:1}}>{fmt(bet*500)}</div>
              </button>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
              <span style={{fontSize:9,color:"rgba(255,200,180,.75)",fontWeight:700,letterSpacing:1,flexShrink:0}}>BET:</span>
              <div style={{display:"flex",gap:3,flexWrap:"wrap",flex:1}}>
                {BET_OPTS.map(v=>(
                  <button key={v} onClick={()=>!spinning&&setBet(v)} style={{background:bet===v?"linear-gradient(135deg,#e74c3c,#c0392b)":"rgba(255,255,255,.09)",border:bet===v?"1.5px solid #e74c3c":"1.5px solid rgba(255,255,255,.15)",borderRadius:7,padding:"3px 5px",color:bet===v?"#fff":"rgba(255,220,200,.8)",fontWeight:700,fontSize:9,cursor:"pointer",transition:"all .15s"}}>₱{v.toFixed(2)}</button>
                ))}
              </div>
            </div>

            <div style={{display:"flex",gap:5}}>
              <button onClick={()=>setTurbo(t=>!t)} style={{flex:1,background:turbo?"linear-gradient(135deg,#f39c12,#e67e22)":"rgba(255,255,255,.09)",border:turbo?"1.5px solid #f39c12":"1.5px solid rgba(255,255,255,.14)",borderRadius:10,padding:"5px 4px",color:turbo?"#fff":"rgba(255,220,200,.8)",fontWeight:700,fontSize:10,cursor:"pointer"}}>⚡ {turbo?"TURBO ON":"TURBO"}</button>
              <button onClick={()=>setDcOn(d=>!d)} style={{flex:1,background:dcOn?"linear-gradient(135deg,#3498db,#1a5276)":"rgba(255,255,255,.09)",border:dcOn?"1.5px solid #3498db":"1.5px solid rgba(255,255,255,.14)",borderRadius:10,padding:"5px 4px",color:dcOn?"#fff":"rgba(255,220,200,.8)",fontWeight:700,fontSize:10,cursor:"pointer"}}>🎯 {dcOn?"2×CHANCE":"DBL CHANCE"}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes pulse{from{opacity:.5;}to{opacity:1;}}
        @keyframes winPulse{from{opacity:.45;transform:scale(.96);}to{opacity:1;transform:scale(1.04);}}
        @keyframes popIn{from{transform:scale(.25);opacity:0;}to{transform:scale(1);opacity:1;}}
        @keyframes msgPop{from{transform:scale(.85) translateY(6px);opacity:0;}to{transform:scale(1) translateY(0);opacity:1;}}
        @keyframes scaleIn{from{transform:scale(.5) translateY(20px);opacity:0;}to{transform:scale(1) translateY(0);opacity:1;}}
        @keyframes winBounce{0%{transform:scale(.3) translateY(-30px);opacity:0;}60%{transform:scale(1.12) translateY(4px);}100%{transform:scale(1);opacity:1;}}
        @keyframes tickerScroll{0%{transform:translateX(0);}100%{transform:translateX(-33.33%);}}
        @keyframes glow{from{box-shadow:0 8px 32px rgba(255,107,53,.45);}to{box-shadow:0 8px 52px rgba(255,107,53,1),0 0 70px rgba(233,30,99,.7);}}
        @keyframes float{from{transform:translateY(0) rotate(-6deg);}to{transform:translateY(-22px) rotate(6deg);}}
        @keyframes bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes rayPulse{from{opacity:.12;}to{opacity:.55;}}
        @keyframes sheen{0%{left:-110%;}60%,100%{left:170%;}}
        @keyframes comboRing{0%{transform:scale(1);opacity:.7;}100%{transform:scale(1.5);opacity:0;}}
        @keyframes bombFloat{from{transform:translateY(0) scale(1);}to{transform:translateY(-3px) scale(1.08);}}
        @keyframes bombRing{0%{transform:scale(1);opacity:.8;}50%{transform:scale(1.4);opacity:.4;}100%{transform:scale(1.8);opacity:0;}}
        @keyframes bombExplode{0%{transform:scale(1);opacity:1;}50%{transform:scale(2.5);opacity:.8;}100%{transform:scale(4);opacity:0;}}
        @keyframes scatterHalo{from{opacity:.3;transform:scale(.95);}to{opacity:.7;transform:scale(1.1);}}
        @keyframes spinBtnGlow{from{box-shadow:0 6px 26px rgba(220,50,50,.55);}to{box-shadow:0 6px 36px rgba(255,80,80,.9),0 0 50px rgba(220,50,50,.4);}}
        @keyframes screenShake1{0%,100%{transform:translate(0,0);}20%{transform:translate(-3px,2px);}40%{transform:translate(3px,-2px);}60%{transform:translate(-2px,3px);}80%{transform:translate(2px,-1px);}}
        @keyframes screenShake2{0%,100%{transform:translate(0,0);}15%{transform:translate(-6px,3px);}30%{transform:translate(6px,-4px);}45%{transform:translate(-4px,5px);}60%{transform:translate(5px,-3px);}75%{transform:translate(-3px,4px);}90%{transform:translate(3px,-2px);}}
        @keyframes screenShake3{0%,100%{transform:translate(0,0);}10%{transform:translate(-10px,5px);}20%{transform:translate(10px,-6px);}30%{transform:translate(-7px,8px);}40%{transform:translate(8px,-5px);}50%{transform:translate(-6px,7px);}60%{transform:translate(7px,-4px);}70%{transform:translate(-5px,6px);}80%{transform:translate(5px,-3px);}90%{transform:translate(-3px,4px);}}
        @keyframes particle{
          0%{transform:translate(0,0) scale(1);opacity:1;}
          100%{transform:translate(calc(cos(var(--angle))*var(--dist)),calc(sin(var(--angle))*var(--dist))) scale(0);opacity:0;}
        }
      `}</style>
    </div>
  );
}