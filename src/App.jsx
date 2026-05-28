import { useState, useEffect, useRef } from "react";

/* ─── GLOBAL STYLES ──────────────────────────────────────────── */
const G = {
  sideBg:   "#112820",
  mainBg:   "#0d2318",
  cardBg:   "#133025",
  tabBg:    "#0e2a1e",
  border:   "rgba(255,255,255,0.07)",
  activeGreen: "#1f6b40",
  gold:     "#f0c040",
  pink:     "#e8507a",
};

/* ─── SIDEBAR NAV DATA ──────────────────────────────────────── */
const NAV = [
  { icon: <HouseIcon />,   label: "Home",           active: true },
  { icon: <GameIcon />,    label: "Games",           arrow: true },
  { icon: <B1Icon />,      label: "Baccarat 1%" },
  { icon: <CashIcon />,    label: "1.5% Cash Rebate" },
  { icon: <P98Icon />,     label: "98%" },
  { icon: <LiveIcon />,    label: "Live Games" },
  { icon: <SlotMIcon />,   label: "Slot Machines" },
  { icon: <SlotGIcon />,   label: "Slot Games" },
  { icon: <PokerIcon />,   label: "Poker" },
  { icon: <FishIcon />,    label: "Fishing" },
  { icon: <SportIcon />,   label: "Sports" },
  { icon: <CommIcon />,    label: "Community" },
];

/* ─── ICON COMPONENTS (SVG inline) ─────────────────────────── */
function HouseIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>; }
function GameIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8l-1 4h10l-1-4z"/><path d="M9 14h2m2 0h2m-3-3v2m0 2v2" strokeLinecap="round"/></svg>; }
function B1Icon()     { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><text x="12" y="16" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none" fontWeight="700">1.0</text></svg>; }
function CashIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>; }
function P98Icon()    { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><text x="12" y="16" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="700">98%</text></svg>; }
function LiveIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="15" height="11" rx="1"/><path d="M17 9.5l5-3v11l-5-3V9.5z"/></svg>; }
function SlotMIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>; }
function SlotGIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M8 4v16M16 4v16M2 12h20"/></svg>; }
function PokerIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="3" width="10" height="14" rx="1"/><rect x="10" y="7" width="10" height="14" rx="1"/></svg>; }
function FishIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8c0 5-6 9-6 9s-6-4-6-9a6 6 0 0112 0z"/><path d="M3 20l4-4"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>; }
function SportIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 3c3 3 3 6 0 9s-3 6 0 9M3 12h18"/></svg>; }
function CommIcon()   { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><circle cx="17" cy="10" r="3"/><path d="M2 21v-1a7 7 0 0114 0v1"/><path d="M17 13a5 5 0 015 5v1"/></svg>; }

/* ─── BEAD ROAD ─────────────────────────────────────────────── */
const BEADS = [
  ["r","r","b","b","r","b","r","b","r","r","b","r","b","r","r","b","r","r","b","r","r","b","r","r","b","r","b","b","b","r","r","r","b","r"],
  ["r","b","","","b","b","r","","b","r","","r","b","","r","b","","r","b","","","","",""],
  ["b","","","","","","","","","","","","","","","","","","","","","","",""],
];
function BeadRoad() {
  const cols = 17;
  const grid = [];
  let col=0, row=0;
  const flat = BEADS.flat().filter(x=>x!=="");
  for(let i=0;i<flat.length;i++){
    if(!grid[col]) grid[col]=[];
    grid[col][row]=flat[i];
    row++;
    if(row>=6){row=0;col++;}
  }
  const color = c => c==="r"?"#e55":"c"===c?"#2ecc71":"#38f";
  return (
    <div style={{display:"flex",gap:1}}>
      {Array.from({length:cols},(_,ci)=>(
        <div key={ci} style={{display:"flex",flexDirection:"column",gap:1}}>
          {Array.from({length:6},(_,ri)=>{
            const v = grid[ci]?.[ri];
            return (
              <div key={ri} style={{
                width:13,height:13,borderRadius:"50%",
                background: v ? color(v) : "transparent",
                border: v ? "none" : "1px solid rgba(255,255,255,0.08)",
              }}/>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── HERO BANNER SLIDE ─────────────────────────────────────── */
function HeroSlide({ slide }) {
  return (
    <div style={{
      position:"relative",
      borderRadius:12,
      overflow:"hidden",
      background: slide.bg,
      display:"flex",
      minHeight:260,
    }}>
      {/* Dealer side */}
      <div style={{
        flex:"0 0 48%",
        position:"relative",
        overflow:"hidden",
      }}>
        <DealerIllustration color={slide.dealerColor} />
        <div style={{
          position:"absolute",bottom:10,left:16,
          color:"rgba(255,255,255,0.35)",fontSize:22,fontWeight:900,
          letterSpacing:2,fontFamily:"serif",
        }}>{slide.tableCode}</div>
      </div>

      {/* Info side */}
      <div style={{
        flex:1,
        padding:"20px 20px 16px 12px",
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-between",
      }}>
        {/* Title */}
        <div style={{textAlign:"center",marginBottom:8}}>
          <div style={{
            display:"inline-block",
            background:"rgba(0,0,0,0.35)",
            borderRadius:20,
            padding:"2px 14px",
            fontSize:10,
            color:"rgba(255,255,255,0.8)",
            letterSpacing:2,
            marginBottom:4,
          }}>● LIVE</div>
          <div style={{
            fontSize:26,fontWeight:900,
            fontFamily:"'Georgia',serif",
            color:slide.titleColor,
            textShadow:`0 2px 20px ${slide.titleColor}80`,
            letterSpacing:1,
            lineHeight:1.1,
          }}>{slide.title}</div>
        </div>

        {/* Room pill */}
        <div style={{
          background:"rgba(0,0,0,0.4)",
          border:"1px solid rgba(255,255,255,0.15)",
          borderRadius:20,
          padding:"3px 12px",
          fontSize:11,color:"#ddd",
          textAlign:"center",marginBottom:6,
        }}>{slide.room}</div>

        {/* Bet / players */}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:8}}>
          <span style={{
            background:"rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:20,padding:"3px 10px",fontSize:11,color:"#ccc",
          }}>₱{slide.bet}</span>
          <span style={{
            background:"rgba(0,0,0,0.35)",border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:20,padding:"3px 10px",fontSize:11,color:"#aaa",
          }}>👤 {slide.players}</span>
        </div>

        {/* P / B / T */}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:8}}>
          {[["#53","rgba(255,255,255,0.3)","#fff"],
            ["P",slide.p[0],slide.p[1]],
            ["B",slide.b[0],slide.b[1]],
            ["T",slide.t[0],slide.t[1]]].map(([lbl,bg,col])=>(
            <span key={lbl} style={{display:"flex",alignItems:"center",gap:3,fontSize:12}}>
              <span style={{
                background:bg,color:col,
                width:18,height:18,borderRadius:3,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:9,fontWeight:800,
              }}>{lbl}</span>
              {lbl!=="P"&&lbl!=="B"&&lbl!=="T"?null:
                <span style={{color:"#fff",fontWeight:600}}>
                  {lbl==="P"?slide.p[2]:lbl==="B"?slide.b[2]:slide.t[2]}
                </span>
              }
            </span>
          ))}
        </div>

        {/* Bead road */}
        <div style={{
          background:"rgba(0,0,0,0.3)",
          borderRadius:6,padding:"6px 8px",
          marginBottom:10,
        }}>
          <BeadRoad />
        </div>

        {/* Play button */}
        <button style={{
          background:"linear-gradient(90deg,#e8507a,#c0305a)",
          border:"none",borderRadius:30,
          padding:"11px 0",width:"100%",
          color:"#fff",fontWeight:800,fontSize:15,
          cursor:"pointer",letterSpacing:1,
          boxShadow:"0 4px 20px rgba(232,80,122,0.4)",
        }}>Play</button>
      </div>
    </div>
  );
}

/* ─── DEALER ILLUSTRATION ──────────────────────────────────── */
function DealerIllustration({ color }) {
  return (
    <svg viewBox="0 0 320 260" width="100%" height="100%" style={{position:"absolute",inset:0}}>
      {/* Table */}
      <ellipse cx="160" cy="230" rx="180" ry="40" fill="#1a5c38" opacity="0.7"/>
      <ellipse cx="160" cy="225" rx="165" ry="32" fill="#1e7045" opacity="0.5"/>
      {/* Table label */}
      <text x="90" y="228" fontSize="11" fill="rgba(255,255,255,0.25)" fontWeight="600">PLAYER</text>
      <text x="185" y="228" fontSize="11" fill="rgba(255,255,255,0.25)" fontWeight="600">BANKER</text>
      {/* Body */}
      <rect x="130" y="120" width="60" height="90" rx="4" fill={color||"#c0392b"}/>
      {/* Dress details */}
      <path d="M130 160 Q160 170 190 160 L195 210 H125Z" fill={color||"#a93226"} opacity="0.6"/>
      {/* Arms */}
      <ellipse cx="118" cy="148" rx="12" ry="32" fill={color||"#c0392b"} transform="rotate(-10 118 148)"/>
      <ellipse cx="202" cy="148" rx="12" ry="32" fill={color||"#c0392b"} transform="rotate(10 202 148)"/>
      {/* Hands */}
      <ellipse cx="112" cy="178" rx="9" ry="7" fill="#f5c5a0"/>
      <ellipse cx="208" cy="178" rx="9" ry="7" fill="#f5c5a0"/>
      {/* Neck */}
      <rect x="150" y="102" width="20" height="22" rx="6" fill="#f5c5a0"/>
      {/* Head */}
      <ellipse cx="160" cy="90" rx="26" ry="28" fill="#f5c5a0"/>
      {/* Hair */}
      <ellipse cx="160" cy="68" rx="26" ry="14" fill="#2c1810"/>
      <path d="M134 80 Q128 100 132 120" stroke="#2c1810" strokeWidth="8" fill="none" strokeLinecap="round"/>
      <path d="M186 80 Q192 100 188 120" stroke="#2c1810" strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Face */}
      <ellipse cx="153" cy="90" rx="3" ry="3.5" fill="#6b3a2a"/>
      <ellipse cx="167" cy="90" rx="3" ry="3.5" fill="#6b3a2a"/>
      <path d="M154 100 Q160 105 166 100" stroke="#c06060" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Card in hands */}
      <rect x="140" y="172" width="14" height="19" rx="2" fill="#fff" stroke="#ddd" strokeWidth="0.5"/>
      <rect x="157" y="172" width="14" height="19" rx="2" fill="#fff" stroke="#ddd" strokeWidth="0.5"/>
      <text x="143" y="184" fontSize="7" fill="#e74c3c" fontWeight="700">A</text>
      <text x="160" y="184" fontSize="7" fill="#2c3e50" fontWeight="700">K</text>
    </svg>
  );
}

/* ─── SLIDES DATA ───────────────────────────────────────────── */
const SLIDES = [
  {
    bg:"linear-gradient(135deg,#0a2e20 0%,#134a2f 60%,#0d3525 100%)",
    title:"BACCARAT",titleColor:"#f5e642",
    room:"E009-RUBY8",bet:"50-200k",players:67,
    tableCode:"E009",dealerColor:"#c0392b",
    p:["#3498db","#fff",20],b:["#e74c3c","#fff",30],t:["#27ae60","#fff",2],
  },
  {
    bg:"linear-gradient(135deg,#2a0a10 0%,#4a1328 60%,#350d20 100%)",
    title:"ROULETTE",titleColor:"#f0c040",
    room:"VIP-GOLD9",bet:"500-1M",players:42,
    tableCode:"R009",dealerColor:"#8e44ad",
    p:["#3498db","#fff",18],b:["#e74c3c","#fff",21],t:["#27ae60","#fff",3],
  },
  {
    bg:"linear-gradient(135deg,#0a1a3a 0%,#132e5a 60%,#0d2245 100%)",
    title:"DRAGON TIGER",titleColor:"#ff7043",
    room:"DT01-CLASSIC",bet:"200-500k",players:88,
    tableCode:"DT01",dealerColor:"#e67e22",
    p:["#3498db","#fff",30],b:["#e74c3c","#fff",14],t:["#27ae60","#fff",1],
  },
];

/* ─── TABS ──────────────────────────────────────────────────── */
const TABS = [
  { label:"Favourite",  icon:"♥" },
  { label:"Recent",     icon:"🕐" },
  { label:"For U",      icon:"⭐", active:true },
  { label:"Jackpot",    icon:"🔥" },
  { label:"New",        icon:"Ⓝ" },
  { label:"Baccarat",   icon:"9" },
  { label:"BlackJack",  icon:"🂡" },
  { label:"Live Slots", icon:"▦" },
];

/* ─── GAME CARDS ─────────────────────────────────────────────── */
function ColorGameCard() {
  return (
    <div style={{position:"relative",borderRadius:10,overflow:"hidden",cursor:"pointer",flex:1,minWidth:0}}>
      <div style={{
        background:"linear-gradient(180deg,#b71c1c 0%,#880e4f 50%,#4a148c 100%)",
        padding:"18px 14px 0",
        minHeight:180,
        display:"flex",flexDirection:"column",alignItems:"center",
      }}>
        {/* Colorful "COLOR GAME" text */}
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:3,marginBottom:4}}>
          {[
            ["C","#f44336"],["O","#ff9800"],["L","#ffeb3b"],["O","#4caf50"],["R","#2196f3"],
          ].map(([c,col],i)=>(
            <span key={i} style={{
              background:col,color:"#fff",
              width:26,height:26,borderRadius:4,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:900,fontSize:14,
              boxShadow:"0 2px 6px rgba(0,0,0,0.4)",
            }}>{c}</span>
          ))}
        </div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:3,marginBottom:10}}>
          {[
            ["G","#9c27b0"],["A","#e91e63"],["M","#ff5722"],["E","#795548"],
          ].map(([c,col],i)=>(
            <span key={i} style={{
              background:col,color:"#fff",
              width:26,height:26,borderRadius:4,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontWeight:900,fontSize:14,
              boxShadow:"0 2px 6px rgba(0,0,0,0.4)",
            }}>{c}</span>
          ))}
        </div>
        {/* Decorative circles */}
        <div style={{display:"flex",gap:6,marginBottom:8}}>
          {["#f44336","#ff9800","#ffeb3b","#4caf50","#2196f3","#9c27b0"].map((c,i)=>(
            <div key={i} style={{width:14,height:14,borderRadius:"50%",background:c,boxShadow:`0 0 8px ${c}`}}/>
          ))}
        </div>
        {/* Character silhouette */}
        <div style={{fontSize:36}}>🎭</div>
      </div>
      <div style={{
        background:"rgba(0,0,0,0.7)",
        padding:"5px 10px",
        display:"flex",alignItems:"center",gap:4,
      }}>
        <span style={{color:"#f39c12",fontSize:11,fontWeight:700}}>Jackpot ₱ 24,985,965.65</span>
      </div>
    </div>
  );
}

function BlackjackCard() {
  return (
    <div style={{position:"relative",borderRadius:10,overflow:"hidden",cursor:"pointer",flex:1,minWidth:0}}>
      <div style={{
        background:"linear-gradient(180deg,#1a0008 0%,#3d0010 50%,#1a000a 100%)",
        minHeight:180,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        padding:"12px",
        position:"relative",
      }}>
        {/* Voice chat badge */}
        <div style={{
          position:"absolute",top:8,left:8,
          background:"rgba(0,0,0,0.6)",border:"1px solid rgba(255,255,255,0.2)",
          borderRadius:4,padding:"2px 6px",
          display:"flex",alignItems:"center",gap:4,
        }}>
          <span style={{
            width:8,height:8,borderRadius:"50%",background:"#f0c040",
            display:"inline-block",
          }}/>
          <span style={{fontSize:9,color:"#f0c040",fontWeight:700,letterSpacing:1}}>VOICE CHAT</span>
        </div>

        {/* Cards */}
        <div style={{display:"flex",gap:-8,marginBottom:8,position:"relative"}}>
          {[["A","♠","#111"],["J","♠","#111"],["A","♦","#c00"]].map(([v,s,c],i)=>(
            <div key={i} style={{
              width:40,height:56,background:"#fff",borderRadius:4,
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",
              padding:"3px",
              transform:`rotate(${(i-1)*12}deg) translateX(${(i-1)*4}px)`,
              boxShadow:"0 4px 12px rgba(0,0,0,0.6)",
              position:"relative",zIndex:i,
            }}>
              <span style={{fontSize:10,fontWeight:900,color:c,alignSelf:"flex-start",lineHeight:1}}>{v}</span>
              <span style={{fontSize:16,color:c}}>{s}</span>
              <span style={{fontSize:10,fontWeight:900,color:c,alignSelf:"flex-end",transform:"rotate(180deg)",lineHeight:1}}>{v}</span>
            </div>
          ))}
        </div>

        {/* 21 number */}
        <div style={{
          fontSize:52,fontWeight:900,color:"#e74c3c",
          textShadow:"0 0 30px rgba(231,76,60,0.8)",
          lineHeight:1,fontFamily:"serif",
          marginBottom:2,
        }}>21</div>

        {/* LIVE dot */}
        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:3}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:"#27ae60",display:"inline-block",boxShadow:"0 0 6px #27ae60"}}/>
          <span style={{fontSize:9,color:"#27ae60",fontWeight:700,letterSpacing:2}}>LIVE</span>
        </div>

        <div style={{fontSize:15,fontWeight:900,color:"#fff",letterSpacing:2}}>BLACKJACK</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.6)",letterSpacing:2,marginTop:2}}>BET BEHIND</div>
      </div>
    </div>
  );
}

function BathalaCard() {
  return (
    <div style={{position:"relative",borderRadius:10,overflow:"hidden",cursor:"pointer",flex:1,minWidth:0}}>
      <div style={{
        background:"linear-gradient(180deg,#1a0a00 0%,#4a2800 40%,#8b4513 70%,#4a2800 100%)",
        minHeight:180,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
        padding:"10px",
        position:"relative",
      }}>
        {/* 50000x badge */}
        <div style={{
          position:"absolute",top:6,right:6,
          background:"linear-gradient(135deg,#f39c12,#e67e22)",
          borderRadius:4,padding:"2px 7px",
          fontSize:10,fontWeight:900,color:"#fff",
        }}>50000×</div>

        {/* SIIC small text */}
        <div style={{
          position:"absolute",top:6,left:8,
          fontSize:9,color:"rgba(255,200,100,0.6)",fontWeight:700,letterSpacing:2,
        }}>SIIC</div>

        {/* Zeus-like figure */}
        <div style={{fontSize:56,marginBottom:4}}>🧙</div>
        <div style={{
          fontSize:24,fontWeight:900,
          fontFamily:"serif",
          background:"linear-gradient(90deg,#f39c12,#f0c040,#e67e22)",
          WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
          letterSpacing:2,
          textShadow:"none",
          marginBottom:6,
        }}>BATHALA</div>

        {/* Multiplier tags */}
        <div style={{display:"flex",gap:4}}>
          {[["5×","#27ae60"],["12×","#3498db"],["50×","#e74c3c"],["500×","#9b59b6"]].map(([v,c])=>(
            <span key={v} style={{
              background:c,color:"#fff",
              fontSize:9,fontWeight:800,
              padding:"2px 5px",borderRadius:3,
            }}>{v}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function ScatterGo() {
  const [slide, setSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("For U");
  const [activeNav, setActiveNav] = useState("Home");

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s+1)%SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{
      display:"flex", minHeight:"100vh",
      background:G.mainBg,
      fontFamily:"'Segoe UI','Helvetica Neue',sans-serif",
      color:"#fff",
      fontSize:14,
    }}>

      {/* ── SIDEBAR ─────────────────────────────────────── */}
      <aside style={{
        width:220,minWidth:220,
        background:G.sideBg,
        borderRight:`1px solid ${G.border}`,
        display:"flex",flexDirection:"column",
        position:"sticky",top:0,height:"100vh",overflowY:"auto",
      }}>
        {/* Logo */}
        <div style={{
          padding:"18px 16px 14px",
          borderBottom:`1px solid ${G.border}`,
        }}>
          <div style={{display:"flex",alignItems:"flex-end",gap:6}}>
            <div style={{
              background:"#fff",
              borderRadius:6,
              padding:"3px 5px",
              display:"grid",
              gridTemplateColumns:"repeat(7,1fr)",
              gap:1,
            }}>
              {[["S","#e74c3c"],["C","#e67e22"],["A","#f1c40f"],["T","#2ecc71"],["T","#3498db"],["E","#9b59b6"],["R","#e74c3c"]].map(([c,col],i)=>(
                <span key={i} style={{
                  color:col,fontWeight:900,fontSize:11,
                  display:"flex",alignItems:"center",justifyContent:"center",
                }}>{c}</span>
              ))}
            </div>
            <div style={{
              display:"flex",flexDirection:"column",lineHeight:1,
            }}>
              <span style={{
                color:"#f0c040",fontWeight:900,fontSize:16,letterSpacing:-0.5,
              }}>GO</span>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{flex:1,paddingTop:4}}>
          {NAV.map(({icon,label,arrow})=>{
            const isActive = activeNav===label;
            return (
              <div
                key={label}
                onClick={()=>setActiveNav(label)}
                style={{
                  display:"flex",alignItems:"center",gap:10,
                  padding:"10px 16px",
                  cursor:"pointer",
                  background:isActive?"rgba(27,110,60,0.5)":"transparent",
                  borderRadius:isActive?"0 6px 6px 0":0,
                  borderLeft:isActive?"3px solid #27ae60":"3px solid transparent",
                  color:isActive?"#7deba8":"rgba(255,255,255,0.7)",
                  transition:"all 0.15s",
                }}
              >
                <span style={{opacity:0.85,flexShrink:0}}>{icon}</span>
                <span style={{fontSize:13,fontWeight:isActive?600:400,flex:1}}>{label}</span>
                {arrow && <span style={{fontSize:11,opacity:0.4}}>▼</span>}
              </div>
            );
          })}
        </nav>

        {/* Footer credit */}
        <div style={{
          padding:"10px 14px",
          borderTop:`1px solid ${G.border}`,
          fontSize:9,
          color:"rgba(255,255,255,0.25)",
          textAlign:"center",
          lineHeight:1.6,
        }}>
          Scatter Go © 2025<br/>
          Developed by <span style={{color:"rgba(255,255,255,0.45)",fontWeight:600}}>Mishal Mohammad</span>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Top bar */}
        <header style={{
          display:"flex",alignItems:"center",gap:12,
          padding:"10px 20px",
          background:"rgba(0,0,0,0.2)",
          borderBottom:`1px solid ${G.border}`,
          position:"sticky",top:0,zIndex:10,
          backdropFilter:"blur(8px)",
        }}>
          <div style={{
            flex:1,display:"flex",alignItems:"center",
            background:"rgba(255,255,255,0.06)",
            borderRadius:30,padding:"9px 16px",gap:10,
            border:`1px solid ${G.border}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              placeholder="Search Games"
              style={{
                background:"none",border:"none",outline:"none",
                color:"#fff",fontSize:13,flex:1,
                caretColor:"#27ae60",
              }}
            />
          </div>
          <button style={{
            background:"linear-gradient(135deg,#27ae60,#1e8449)",
            border:"none",borderRadius:30,
            padding:"9px 20px",
            color:"#fff",fontWeight:700,fontSize:13,
            cursor:"pointer",whiteSpace:"nowrap",
            boxShadow:"0 3px 12px rgba(39,174,96,0.35)",
          }}>Login/Register</button>
          <button style={{
            background:"none",border:"none",cursor:"pointer",
            padding:6,color:"rgba(255,255,255,0.6)",fontSize:20,
          }}>🔔</button>
        </header>

        {/* Scrollable content */}
        <main style={{flex:1,overflowY:"auto",padding:"18px 20px 30px"}}>

          {/* Hero */}
          <div style={{marginBottom:16}}>
            <HeroSlide slide={SLIDES[slide]} />
            <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:10}}>
              {SLIDES.map((_,i)=>(
                <button
                  key={i}
                  onClick={()=>setSlide(i)}
                  style={{
                    width:i===slide?22:7,height:7,
                    borderRadius:4,border:"none",padding:0,
                    background:i===slide?"#27ae60":"rgba(255,255,255,0.2)",
                    cursor:"pointer",transition:"all 0.3s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display:"flex",gap:4,flexWrap:"wrap",
            marginBottom:22,
          }}>
            {TABS.map(({label,icon})=>{
              const isA = activeTab===label;
              return (
                <button
                  key={label}
                  onClick={()=>setActiveTab(label)}
                  style={{
                    background:isA?"linear-gradient(135deg,#27ae60,#1e8449)":"rgba(255,255,255,0.06)",
                    border:`1px solid ${isA?"transparent":"rgba(255,255,255,0.08)"}`,
                    borderRadius:30,
                    padding:"8px 16px",
                    color:isA?"#fff":"rgba(255,255,255,0.6)",
                    fontWeight:isA?700:400,
                    fontSize:13,cursor:"pointer",
                    whiteSpace:"nowrap",
                    transition:"all 0.2s",
                    display:"flex",alignItems:"center",gap:5,
                    boxShadow:isA?"0 3px 14px rgba(39,174,96,0.3)":"none",
                  }}
                >
                  <span style={{fontSize:11}}>{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Popular Games */}
          <div style={{
            display:"flex",justifyContent:"space-between",
            alignItems:"center",marginBottom:14,
          }}>
            <h2 style={{margin:0,fontSize:20,fontWeight:700,color:"#fff"}}>Popular Games</h2>
            <button style={{
              background:"rgba(255,255,255,0.07)",
              border:`1px solid rgba(255,255,255,0.12)`,
              borderRadius:8,padding:"6px 16px",
              color:"rgba(255,255,255,0.7)",fontSize:12,cursor:"pointer",
            }}>See All</button>
          </div>

          {/* 3 game cards row */}
          <div style={{display:"flex",gap:12,marginBottom:28}}>
            <ColorGameCard />
            <BlackjackCard />
            <BathalaCard />
          </div>

          {/* Second row placeholder games */}
          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",
            gap:10,
          }}>
            {[
              {e:"🐉",name:"Fortune Dragon",label:"NEW",   bg:"linear-gradient(135deg,#7b0000,#c0392b)"},
              {e:"🐸",name:"Golden Toad",   label:"HOT",   bg:"linear-gradient(135deg,#004d00,#27ae60)"},
              {e:"🔮",name:"Mega Ball",     label:"LIVE",  bg:"linear-gradient(135deg,#00008b,#2980b9)"},
              {e:"🎣",name:"Fishing God",   label:"NEW",   bg:"linear-gradient(135deg,#003333,#1abc9c)"},
              {e:"🎡",name:"Lucky Wheel",   label:"HOT",   bg:"linear-gradient(135deg,#7d4a00,#f39c12)"},
              {e:"🥊",name:"Fight Night",   label:"LIVE",  bg:"linear-gradient(135deg,#3d003d,#8e44ad)"},
            ].map(g=>(
              <MiniCard key={g.name} game={g} />
            ))}
          </div>
        </main>
      </div>

      {/* ── FLOATING BUTTONS ─────────────────────────────── */}
      <div style={{
        position:"fixed",right:14,bottom:80,
        display:"flex",flexDirection:"column",gap:8,zIndex:999,
      }}>
        <button style={{
          width:56,height:56,borderRadius:"50%",
          background:"linear-gradient(135deg,#e74c3c,#c0392b)",
          border:"none",cursor:"pointer",
          display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",color:"#fff",
          boxShadow:"0 4px 16px rgba(231,76,60,0.5)",
          fontSize:10,fontWeight:700,gap:1,
        }}>
          <span style={{fontSize:18}}>🎁</span>
          <span>Lucky</span>
          <span>Plus</span>
        </button>
        <button style={{
          width:56,height:56,borderRadius:"50%",
          background:"linear-gradient(135deg,#27ae60,#1e8449)",
          border:"none",cursor:"pointer",
          display:"flex",flexDirection:"column",alignItems:"center",
          justifyContent:"center",color:"#fff",
          boxShadow:"0 4px 16px rgba(39,174,96,0.5)",
          fontSize:10,fontWeight:700,gap:1,
        }}>
          <span style={{fontSize:18}}>💬</span>
          <span>Support</span>
        </button>
      </div>
    </div>
  );
}

function MiniCard({ game }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        borderRadius:10,overflow:"hidden",cursor:"pointer",
        background:game.bg,
        transform:hov?"translateY(-3px)":"none",
        transition:"transform 0.2s",
        boxShadow:hov?"0 10px 25px rgba(0,0,0,0.5)":"0 3px 10px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{
        padding:"20px 10px 10px",
        minHeight:130,
        display:"flex",flexDirection:"column",
        alignItems:"center",justifyContent:"center",
        position:"relative",
      }}>
        <span style={{position:"absolute",top:6,left:6,
          background:game.label==="LIVE"?"#e74c3c":game.label==="NEW"?"#27ae60":"#e67e22",
          color:"#fff",fontSize:8,fontWeight:800,padding:"2px 5px",borderRadius:3,
        }}>{game.label}</span>
        <span style={{fontSize:44,marginBottom:4}}>{game.e}</span>
        <span style={{fontSize:12,fontWeight:700,color:"#fff",textAlign:"center"}}>{game.name}</span>
      </div>
      {hov&&(
        <div style={{
          position:"absolute",inset:0,background:"rgba(0,0,0,0.55)",
          display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10,
        }}>
          <span style={{
            background:"#f0c040",color:"#111",
            fontWeight:800,fontSize:12,padding:"8px 18px",borderRadius:20,
          }}>PLAY NOW</span>
        </div>
      )}
    </div>
  );
}