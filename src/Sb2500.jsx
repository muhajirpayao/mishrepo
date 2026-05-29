import { useState, useEffect, useCallback, useRef } from "react";

const SYMBOLS = [
  { id:"lollipop",   img:"https://i.pinimg.com/736x/eb/19/17/eb1917189c52172119467aa320d20b07.jpg", label:"Lollipop",   color:"#ff69b4", mult:[0,0,0,0,0,0,0,0,36.4,50,100,150,200,750], scatter:true },
  { id:"grape",      img:"https://i.pinimg.com/736x/63/52/50/635250986165fb88dc9aae0c39ced57d.jpg", label:"Grape",      color:"#9b59b6", mult:[0,0,0,0,0,0,0,0,1.5,2,5,10,25,100] },
  { id:"apple",      img:"https://i.pinimg.com/736x/f3/e3/83/f3e38314103ac7d2ded97e8bc771a43b.jpg", label:"Apple",      color:"#e74c3c", mult:[0,0,0,0,0,0,0,0,1,1.5,4,8,20,75] },
  { id:"watermelon", img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc_MSrpNk0n48iq-EqKUOlCIbfVcuNSXmmBA&s", label:"Watermelon", color:"#27ae60", mult:[0,0,0,0,0,0,0,0,0.8,1.2,3,6,15,60] },
  { id:"plum",       img:"https://i.pinimg.com/736x/27/f8/3d/27f83d803052c68ed11c2db0f3a0b5cd.jpg", label:"Plum",       color:"#e67e22", mult:[0,0,0,0,0,0,0,0,0.5,0.8,2,4,10,40] },
  { id:"banana",     img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYGjIvT4IvOwxFcbnVmk6Gdl-TtUWO6louDfjurWxguA&s", label:"Banana", color:"#f1c40f", mult:[0,0,0,0,0,0,0,0,0.4,0.6,1.5,3,8,25] },
  { id:"candy_blue", img:"https://i.pinimg.com/736x/e6/f0/25/e6f025e324cd91bb88ff3512ffc276d3.jpg", label:"Blue Candy", color:"#3498db", mult:[0,0,0,0,0,0,0,0,0.3,0.5,1,2,5,15] },
  { id:"heart",      img:"https://i.pinimg.com/736x/f0/e4/de/f0e4de27fe8e17576c838e2817134dcb.jpg", label:"Heart",      color:"#e91e63", mult:[0,0,0,0,0,0,0,0,0.2,0.4,0.8,1.5,3,10] },
];

const COLS = 6, ROWS = 5;
const WEIGHTS = [3, 8, 10, 12, 14, 16, 18, 19];
const BET_OPTS = [0.20, 0.40, 0.60, 1.00, 2.00, 4.00, 6.00, 10.00, 20.00, 40.00, 100.00];

const WIN_NOTICES = [
  { name:"Ash****", amount:"₱12,450" },
  { name:"Mar****", amount:"₱8,200"  },
  { name:"Jun****", amount:"₱31,000" },
  { name:"Kri****", amount:"₱5,750"  },
  { name:"Ric****", amount:"₱18,900" },
  { name:"Jen****", amount:"₱9,300"  },
  { name:"Dan****", amount:"₱42,600" },
  { name:"Lyn****", amount:"₱7,100"  },
  { name:"Bel****", amount:"₱23,500" },
  { name:"Rod****", amount:"₱15,800" },
  { name:"Cel****", amount:"₱6,400"  },
  { name:"Vin****", amount:"₱88,000" },
];

function weightedRandom() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < WEIGHTS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return { ...SYMBOLS[i], uid: Math.random() };
  }
  return { ...SYMBOLS[7], uid: Math.random() };
}

function makeGrid() {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ sym: weightedRandom(), state: "idle" }))
  );
}

function findClusters(grid) {
  const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  const clusters = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!visited[r][c]) {
        const sym = grid[r][c].sym;
        if (sym.scatter) { visited[r][c] = true; continue; }
        const queue = [[r, c]], cells = [];
        visited[r][c] = true;
        while (queue.length) {
          const [cr, cc] = queue.shift();
          cells.push([cr, cc]);
          for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
            const nr = cr + dr, nc = cc + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !visited[nr][nc] && grid[nr][nc].sym.id === sym.id) {
              visited[nr][nc] = true;
              queue.push([nr, nc]);
            }
          }
        }
        if (cells.length >= 8) clusters.push({ sym, cells, size: cells.length });
      }
    }
  }
  return clusters;
}

function countScatters(grid) {
  let n = 0;
  grid.forEach(row => row.forEach(cell => { if (cell.sym.scatter) n++; }));
  return n;
}

function clusterMultiplier(sym, size) {
  const idx = Math.min(size, 13);
  return sym.mult[idx] ?? sym.mult[sym.mult.length - 1];
}

/* ── WIN TICKER ── */
function WinTicker() {
  const [items] = useState(() => {
    const shuffled = [...WIN_NOTICES].sort(() => Math.random() - 0.5);
    return [...shuffled, ...shuffled, ...shuffled];
  });
  return (
    <div style={{
      width: "100%", overflow: "hidden", zIndex: 20,
      background: "linear-gradient(90deg,rgba(255,80,160,.9),rgba(255,150,40,.9),rgba(255,80,160,.9))",
      borderBottom: "1.5px solid rgba(255,255,255,.4)",
      padding: "5px 0",
      flexShrink: 0,
    }}>
      <div style={{
        display: "flex", gap: 56,
        animation: "tickerScroll 40s linear infinite",
        whiteSpace: "nowrap",
        width: "max-content",
      }}>
        {items.map((w, i) => (
          <span key={i} style={{
            fontSize: 12, fontWeight: 700, color: "#fff",
            display: "inline-flex", alignItems: "center", gap: 6,
            textShadow: "0 1px 4px rgba(0,0,0,.35)",
          }}>
            🎉 Congrats <strong style={{ color: "#ffe066" }}>{w.name}</strong> for winning <strong style={{ color: "#ffe066" }}>{w.amount}</strong>!
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── SYMBOL CELL ── */
function SymCell({ cell, isWin, isBomb }) {
  const s = cell.sym;
  return (
    <div style={{
      position: "relative",
      borderRadius: 8,
      background: isWin
        ? `radial-gradient(circle at 50% 50%, ${s.color}44, ${s.color}11)`
        : "rgba(255,255,255,0.22)",
      border: isWin ? `2px solid ${s.color}` : "1.5px solid rgba(255,255,255,0.4)",
      display: "flex", alignItems: "center", justifyContent: "center",
      aspectRatio: "1",
      boxShadow: isWin ? `0 0 16px ${s.color}88` : "0 2px 4px rgba(0,0,0,.07)",
      transform: isBomb ? "scale(0)" : isWin ? "scale(1.07)" : "scale(1)",
      transition: "all 0.2s cubic-bezier(.34,1.56,.64,1)",
      opacity: isBomb ? 0 : 1,
      overflow: "hidden",
      animationName: cell.state === "drop" ? "dropIn" : "none",
      animationDuration: "0.35s",
      animationTimingFunction: "cubic-bezier(.34,1.3,.64,1)",
    }}>
      <img
        src={s.img}
        alt={s.label}
        style={{
          width: "84%", height: "84%",
          objectFit: "contain",
          mixBlendMode: "multiply",
          background: "transparent",
filter: "drop-shadow(0 0 5px rgba(255,255,255,0.3))",
          filter: isWin ? "drop-shadow(0 0 5px white) brightness(1.1)" : "none",
          pointerEvents: "none",
        }}
      />
      {isWin && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 8,
          background: `radial-gradient(circle,${s.color}28,transparent)`,
          animation: "pulse 0.45s ease-in-out infinite alternate",
        }} />
      )}
      {isBomb && (
        <div style={{
          position: "absolute", inset: -10,
          background: `radial-gradient(circle,${s.color}cc,transparent 70%)`,
          borderRadius: "50%",
          animation: "explode 0.35s ease-out forwards",
        }} />
      )}
    </div>
  );
}

export default function SweetBonanza2500() {
  const [grid, setGrid] = useState(makeGrid());
  const [balance, setBalance] = useState(20000);
  const [bet, setBet] = useState(2.00);
  const [spinning, setSpinning] = useState(false);
  const [winCells, setWinCells] = useState(new Set());
  const [bombCells, setBombCells] = useState(new Set());
  const [message, setMessage] = useState("");
  const [totalWin, setTotalWin] = useState(0);
  const [roundWin, setRoundWin] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [inFreeSpins, setInFreeSpins] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [showWin, setShowWin] = useState(false);
  const [winLevel, setWinLevel] = useState("");
  const [turbo, setTurbo] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [dcOn, setDcOn] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoRef = useRef(false);
  const spinningRef = useRef(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 700);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const delay = (ms) => new Promise(r => setTimeout(r, turbo ? ms * 0.3 : ms));

  const animateSpin = async () => {
    const frames = turbo ? 3 : 9;
    for (let f = 0; f < frames; f++) {
      setGrid(makeGrid());
      await delay(62);
    }
  };

  const doSpin = useCallback(async () => {
    if (spinningRef.current) return;
    if (!inFreeSpins && balance < bet) { setMessage("💸 Insufficient balance!"); return; }
    spinningRef.current = true;
    setSpinning(true);
    setShowWin(false);
    setWinCells(new Set());
    setBombCells(new Set());
    setRoundWin(0);
    setMessage("");
    if (inFreeSpins) { setFreeSpins(f => f - 1); }
    else { setBalance(b => Math.round((b - bet) * 100) / 100); }
    await animateSpin();
    const finalGrid = makeGrid();
    setGrid(finalGrid);
    await delay(180);
    await processTumble(finalGrid, inFreeSpins ? multiplier : 1, 0);
    spinningRef.current = false;
    setSpinning(false);
  }, [spinning, balance, bet, inFreeSpins, multiplier, turbo]);

  useEffect(() => { autoRef.current = autoSpin; }, [autoSpin]);
  useEffect(() => {
    if (!autoSpin || spinningRef.current) return;
    const t = setTimeout(() => { if (autoRef.current) doSpin(); }, 700);
    return () => clearTimeout(t);
  }, [autoSpin, spinning]);

  const processTumble = async (g, mult, accumulated) => {
    const clusters = findClusters(g);
    const scatters = countScatters(g);
    if (scatters >= 4 && !inFreeSpins) {
      const fs = scatters >= 6 ? 25 : scatters >= 5 ? 18 : 12;
      setFreeSpins(fs); setInFreeSpins(true); setMultiplier(2);
      setMessage(`🎰 ${fs} FREE SPINS TRIGGERED!`);
      await delay(1400);
    }
    if (clusters.length === 0) {
      if (accumulated === 0) setMessage("Try again! 🍭");
      else {
        const level = accumulated >= bet * 50 ? "epic" : accumulated >= bet * 20 ? "mega" : accumulated >= bet * 5 ? "big" : "";
        if (level) { setWinLevel(level); setShowWin(true); await delay(2200); setShowWin(false); }
      }
      if (inFreeSpins && freeSpins <= 0) {
        await delay(600);
        setInFreeSpins(false); setMultiplier(1); setMessage("Free Spins Ended!");
      }
      return;
    }
    const winning = new Set();
    clusters.forEach(cl => cl.cells.forEach(([r, c]) => winning.add(`${r},${c}`)));
    setWinCells(winning);
    let win = 0;
    clusters.forEach(cl => { win += clusterMultiplier(cl.sym, cl.size) * bet * mult; });
    win = Math.round(win * 100) / 100;
    await delay(480);
    setBombCells(new Set(winning));
    await delay(320);
    setBalance(b => Math.round((b + win) * 100) / 100);
    const newAccum = Math.round((accumulated + win) * 100) / 100;
    setRoundWin(newAccum);
    setTotalWin(tw => Math.round((tw + win) * 100) / 100);
    setMessage(win >= bet * 20 ? `🎊 MEGA WIN! +₱${win.toFixed(2)}` : win >= bet * 5 ? `🔥 BIG WIN! +₱${win.toFixed(2)}` : `+₱${win.toFixed(2)}`);
    await delay(280);
    const newGrid = g.map((row, ri) => row.map((cell, ci) => {
      if (winning.has(`${ri},${ci}`)) return { sym: weightedRandom(), state: "drop" };
      return { ...cell, state: "idle" };
    }));
    setGrid(newGrid);
    setWinCells(new Set());
    setBombCells(new Set());
    await delay(380);
    const nextMult = inFreeSpins ? mult + 1 : mult;
    if (inFreeSpins) setMultiplier(nextMult);
    await processTumble(newGrid, nextMult, newAccum);
  };

  useEffect(() => {
    const h = (e) => { if (e.code === "Space" && !spinningRef.current) { e.preventDefault(); doSpin(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [doSpin]);

  const buyFeature = () => {
    if (balance < bet * 100) { setMessage("💸 Insufficient balance!"); return; }
    setBalance(b => Math.round((b - bet * 100) * 100) / 100);
    setFreeSpins(12); setInFreeSpins(true); setMultiplier(2);
    setMessage("🎰 12 FREE SPINS ACTIVATED!");
  };

  const msgIsHighlight = message.includes("WIN") || message.includes("FREE") || message.includes("SPINS");

  return (
<div style={{
  width: "100vw",
  height: "100vh",
  overflow: "hidden",

  backgroundImage: `url('https://images.api.kansino.nl/cms/PRG_Sweet_Bonanza1000_bg_7c4f5e878a.jpg')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",

  display: "flex",
  flexDirection: "column",
  alignItems: "center",

  fontFamily: "'Segoe UI',sans-serif",
  position: "relative",
}}>
      {/* overlay */}
      <div style={{ position:"absolute", inset:0, background:"rgba(80,180,255,0.12)", pointerEvents:"none", zIndex:1 }} />

      {/* ── TICKER ── */}
      <div style={{ width:"100%", position:"relative", zIndex:20 }}>
        <WinTicker />
      </div>

      {/* ── HEADER ── */}
      <div style={{
        width:"100%", maxWidth:980,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding: isMobile ? "8px 10px 0" : "10px 16px 0",
        position:"relative", zIndex:10, flexWrap:"wrap", gap:6,
      }}>
        <div style={{ display:"flex", gap:6 }}>
          {[["CREDIT", `₱${balance.toFixed(2)}`, "#c0392b"], ["TOTAL WIN", `₱${totalWin.toFixed(2)}`, "#27ae60"]].map(([lbl, val, col]) => (
            <div key={lbl} style={{ background:"rgba(255,255,255,.82)", backdropFilter:"blur(8px)", borderRadius:10,
              padding: isMobile ? "4px 10px" : "6px 14px", border:"1.5px solid rgba(255,255,255,.95)" }}>
              <div style={{ fontSize:7, color:"rgba(80,20,50,.6)", fontWeight:700, letterSpacing:1 }}>{lbl}</div>
              <div style={{ fontSize: isMobile ? 13 : 16, fontWeight:900, color:col }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", flex:1, minWidth: isMobile ? "100%" : "auto", order: isMobile ? -1 : 0 }}>
          <div style={{ fontWeight:900, fontSize:"clamp(18px,5vw,36px)",
            background:"linear-gradient(135deg,#ff6bcd,#ff9f43,#ff6bcd)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            letterSpacing:2, filter:"drop-shadow(0 2px 8px rgba(255,107,205,.7))" }}>Sweet Bonanza</div>
          <div style={{ fontSize:8, color:"rgba(80,10,50,.7)", letterSpacing:3, fontWeight:700 }}>2500 • PRAGMATIC PLAY</div>
        </div>

        <div style={{ background:"rgba(255,255,255,.82)", backdropFilter:"blur(8px)", borderRadius:10,
          padding: isMobile ? "4px 10px" : "6px 14px", border:"1.5px solid rgba(255,255,255,.95)", textAlign:"right" }}>
          <div style={{ fontSize:7, color:"rgba(80,20,50,.6)", fontWeight:700, letterSpacing:1 }}>BET</div>
          <div style={{ fontSize: isMobile ? 13 : 16, fontWeight:900, color:"#c0392b" }}>₱{bet.toFixed(2)}</div>
        </div>
      </div>

      {/* FREE SPINS BANNER */}
      {inFreeSpins && (
        <div style={{ background:"linear-gradient(135deg,#f39c12,#e74c3c)", color:"#fff", fontWeight:900,
          fontSize:13, padding:"6px 20px", borderRadius:30, boxShadow:"0 4px 20px rgba(231,76,60,.5)",
          marginTop:6, letterSpacing:1, zIndex:10, animation:"pulse .6s ease-in-out infinite alternate", position:"relative" }}>
          ⭐ FREE SPINS: {freeSpins} remaining • Multiplier ×{multiplier}
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={{
        width:"100%", maxWidth:980,
        display:"flex", flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 8 : 10,
        padding: isMobile ? "8px 8px" : "10px 12px",
        position:"relative", zIndex:10, alignItems:"flex-start",
      }}>

        {/* LEFT PANEL — hidden on mobile, shown as top row instead */}
        {!isMobile && (
          <div style={{ display:"flex", flexDirection:"column", gap:8, minWidth:148, maxWidth:160, flexShrink:0 }}>
            {/* Buy Feature */}
            <div style={{ background:"linear-gradient(135deg,#f39c12,#e67e22)", borderRadius:14,
              padding:"12px 10px", textAlign:"center", border:"2px solid rgba(255,255,255,.5)",
              boxShadow:"0 4px 16px rgba(230,126,34,.5)" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.85)", fontWeight:700, letterSpacing:1 }}>BUY FEATURE</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#fff" }}>₱{(bet * 100).toFixed(2)}</div>
              <button onClick={buyFeature} style={{ marginTop:6, background:"rgba(255,255,255,.3)",
                border:"1.5px solid rgba(255,255,255,.7)", borderRadius:20, padding:"4px 0",
                color:"#fff", fontWeight:700, fontSize:10, cursor:"pointer", width:"100%" }}>BUY NOW</button>
            </div>
            {/* Bet + DC */}
            <div style={{ background:"linear-gradient(135deg,#27ae60,#1e8449)", borderRadius:14,
              padding:"12px 10px", textAlign:"center", border:"2px solid rgba(255,255,255,.5)",
              boxShadow:"0 4px 16px rgba(39,174,96,.5)" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.85)", fontWeight:700, letterSpacing:1 }}>BET</div>
              <div style={{ fontSize:22, fontWeight:900, color:"#fff" }}>₱{bet.toFixed(2)}</div>
              <div style={{ marginTop:4, fontSize:9, color:"rgba(255,255,255,.75)", fontWeight:700 }}>DOUBLE CHANCE</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.75)", fontWeight:700 }}>TO WIN FEATURE</div>
              <button onClick={() => setDcOn(d => !d)} style={{ marginTop:6,
                background: dcOn ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.2)",
                border:"1.5px solid rgba(255,255,255,.6)", borderRadius:12,
                padding:"3px 12px", fontSize:10, color:"#fff", fontWeight:700, cursor:"pointer" }}>
                {dcOn ? "✅ ON" : "⬛ OFF"}
              </button>
            </div>
            {/* Paytable */}
            <div style={{ background:"rgba(255,255,255,.78)", backdropFilter:"blur(8px)", borderRadius:14,
              padding:"8px", border:"1.5px solid rgba(255,255,255,.95)" }}>
              <div style={{ fontSize:8, color:"rgba(100,20,50,.6)", fontWeight:700, letterSpacing:1,
                textAlign:"center", marginBottom:6 }}>PAYTABLE</div>
              {SYMBOLS.map(s => (
                <div key={s.id} style={{ display:"flex", alignItems:"center", gap:4, padding:"2px 0" }}>
                  <div style={{ width:24, height:24, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <img src={s.img} alt={s.label} style={{ width:22, height:22, objectFit:"contain", mixBlendMode:"multiply" }} />
                  </div>
                  <span style={{ fontSize:8, color:"rgba(120,20,50,.7)", fontWeight:700 }}>
                    {s.scatter ? "SCATTER" : `8+: ${s.mult[8]}×`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile: compact top bar with buy feature + bet */}
        {isMobile && (
          <div style={{ display:"flex", gap:6, width:"100%" }}>
            <div style={{ flex:1, background:"linear-gradient(135deg,#f39c12,#e67e22)", borderRadius:12,
              padding:"8px 10px", textAlign:"center", border:"2px solid rgba(255,255,255,.5)" }}>
              <div style={{ fontSize:8, color:"rgba(255,255,255,.85)", fontWeight:700 }}>BUY FEATURE</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>₱{(bet * 100).toFixed(2)}</div>
              <button onClick={buyFeature} style={{ marginTop:4, background:"rgba(255,255,255,.3)",
                border:"1.5px solid rgba(255,255,255,.7)", borderRadius:16, padding:"3px 0",
                color:"#fff", fontWeight:700, fontSize:9, cursor:"pointer", width:"100%" }}>BUY NOW</button>
            </div>
            <div style={{ flex:1, background:"linear-gradient(135deg,#27ae60,#1e8449)", borderRadius:12,
              padding:"8px 10px", textAlign:"center", border:"2px solid rgba(255,255,255,.5)" }}>
              <div style={{ fontSize:8, color:"rgba(255,255,255,.85)", fontWeight:700 }}>BET</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#fff" }}>₱{bet.toFixed(2)}</div>
              <div style={{ fontSize:8, color:"rgba(255,255,255,.75)", fontWeight:700 }}>DOUBLE CHANCE</div>
              <button onClick={() => setDcOn(d => !d)} style={{ marginTop:3,
                background: dcOn ? "rgba(255,255,255,.5)" : "rgba(255,255,255,.2)",
                border:"1.5px solid rgba(255,255,255,.6)", borderRadius:10,
                padding:"2px 10px", fontSize:9, color:"#fff", fontWeight:700, cursor:"pointer" }}>
                {dcOn ? "✅ ON" : "⬛ OFF"}
              </button>
            </div>
          </div>
        )}

        {/* ── GRID ── */}
        <div style={{ flex:1, position:"relative", minWidth:0 }}>
          <div style={{
            background:"rgba(173,225,255,0.52)",
            backdropFilter:"blur(10px)",
            borderRadius:18,
            border:"2.5px solid rgba(255,255,255,.8)",
            boxShadow:"0 8px 40px rgba(100,180,255,.3), inset 0 1px 0 rgba(255,255,255,.7)",
            padding: isMobile ? "8px" : "12px",
            position:"relative",
          }}>
            {/* corner candies */}
            {["top:5px;left:7px","top:5px;right:7px","bottom:5px;left:7px","bottom:5px;right:7px"].map((s,i)=>(
              <span key={i} style={{ position:"absolute", fontSize: isMobile ? 12 : 15,
                ...Object.fromEntries(s.split(";").map(p=>p.split(":"))) }}>🍬</span>
            ))}
            {/* Message */}
            <div style={{ textAlign:"center", marginBottom:6, minHeight:26,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              {message && (
                <div style={{
                  background: msgIsHighlight ? "linear-gradient(135deg,#f39c12,#e74c3c)" : "rgba(255,255,255,.78)",
                  color: msgIsHighlight ? "#fff" : "#c0392b",
                  fontWeight:900, fontSize: isMobile ? 11 : 13, letterSpacing:.5,
                  padding:"4px 16px", borderRadius:18,
                  boxShadow: msgIsHighlight ? "0 0 20px rgba(231,76,60,.5)" : "none",
                  animation: msgIsHighlight ? "popIn .3s cubic-bezier(.34,1.56,.64,1)" : "none",
                }}>{message}</div>
              )}
            </div>
            {/* Grid */}
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${COLS},1fr)`, gap: isMobile ? 4 : 6 }}>
              {grid.map((row, ri) => row.map((cell, ci) => (
                <SymCell
                  key={`${ri}-${ci}-${cell.sym.uid}`}
                  cell={cell}
                  isWin={winCells.has(`${ri},${ci}`)}
                  isBomb={bombCells.has(`${ri},${ci}`)}
                />
              )))}
            </div>
            {roundWin > 0 && (
              <div style={{ textAlign:"center", marginTop:6, fontSize: isMobile ? 11 : 13, fontWeight:900, color:"#c0392b" }}>
                Round Win: ₱{roundWin.toFixed(2)}
              </div>
            )}
          </div>

          {/* Big Win Overlay */}
          {showWin && (
            <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
              justifyContent:"center", background:"rgba(0,0,0,.45)", borderRadius:18,
              zIndex:20, backdropFilter:"blur(4px)" }}>
              <div style={{ textAlign:"center", animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
                <div style={{ fontWeight:900, fontSize:"clamp(22px,7vw,52px)",
                  background:"linear-gradient(135deg,#ffd700,#ff6b35,#ffd700)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  filter:"drop-shadow(0 0 20px rgba(255,215,0,.8))",
                  letterSpacing:3, textTransform:"uppercase" }}>
                  {winLevel === "epic" ? "⚡ EPIC WIN! ⚡" : winLevel === "mega" ? "🌟 MEGA WIN! 🌟" : "🎊 BIG WIN! 🎊"}
                </div>
                <div style={{ fontSize:"clamp(16px,4vw,34px)", fontWeight:900, color:"#fff", marginTop:6 }}>
                  ₱{roundWin.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL (free spins info) — desktop only */}
        {!isMobile && inFreeSpins && (
          <div style={{ display:"flex", flexDirection:"column", gap:8, minWidth:110, maxWidth:128, flexShrink:0 }}>
            <div style={{ background:"linear-gradient(135deg,#8e44ad,#6c3483)", borderRadius:14,
              padding:10, textAlign:"center", border:"2px solid rgba(255,255,255,.4)" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.7)", fontWeight:700, letterSpacing:1 }}>MULTIPLIER</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#ffd700" }}>×{multiplier}</div>
            </div>
            <div style={{ background:"linear-gradient(135deg,#e74c3c,#c0392b)", borderRadius:14,
              padding:10, textAlign:"center", border:"2px solid rgba(255,255,255,.4)" }}>
              <div style={{ fontSize:9, color:"rgba(255,255,255,.7)", fontWeight:700, letterSpacing:1 }}>FREE SPINS</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#fff" }}>{freeSpins}</div>
            </div>
          </div>
        )}
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div style={{ width:"100%", maxWidth:980, padding: isMobile ? "0 8px 16px" : "0 12px 20px",
        position:"relative", zIndex:10 }}>
        <div style={{ background:"rgba(255,255,255,.78)", backdropFilter:"blur(12px)",
          borderRadius:16, border:"2px solid rgba(255,255,255,.9)",
          boxShadow:"0 4px 20px rgba(100,180,255,.2)",
          padding: isMobile ? "10px 10px" : "12px 16px",
          display:"flex", flexDirection:"column", gap:8 }}>

          {/* Bet selector */}
          <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
            <span style={{ fontSize:9, color:"rgba(150,30,60,.7)", fontWeight:700, letterSpacing:1 }}>BET:</span>
            <div style={{ display:"flex", gap:3, flexWrap:"wrap" }}>
              {BET_OPTS.map(v => (
                <button key={v} onClick={() => !spinning && setBet(v)} style={{
                  background: bet === v ? "linear-gradient(135deg,#e74c3c,#c0392b)" : "rgba(255,255,255,.65)",
                  border: bet === v ? "1.5px solid #c0392b" : "1.5px solid rgba(200,100,130,.3)",
                  borderRadius:7, padding: isMobile ? "4px 7px" : "5px 9px",
                  color: bet === v ? "#fff" : "#c0392b",
                  fontWeight:700, fontSize: isMobile ? 9 : 10, cursor:"pointer",
                  boxShadow: bet === v ? "0 2px 8px rgba(192,57,43,.4)" : "none",
                  transition:"all .15s",
                }}>₱{v.toFixed(2)}</button>
              ))}
            </div>
          </div>

          {/* Spin row */}
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button onClick={() => setTurbo(t => !t)} style={{
              background: turbo ? "linear-gradient(135deg,#f39c12,#e67e22)" : "rgba(255,255,255,.65)",
              border: turbo ? "1.5px solid #e67e22" : "1.5px solid rgba(200,100,130,.3)",
              borderRadius:10, padding: isMobile ? "8px 10px" : "10px 14px",
              color: turbo ? "#fff" : "#c0392b",
              fontWeight:700, fontSize: isMobile ? 10 : 11, cursor:"pointer", whiteSpace:"nowrap",
            }}>⚡ {turbo ? "ON" : "TURBO"}</button>

            <button onClick={doSpin} disabled={spinning} style={{
              flex:1,
              background: spinning ? "rgba(200,100,130,.3)"
                : inFreeSpins ? "linear-gradient(135deg,#f39c12,#e74c3c)"
                : "linear-gradient(135deg,#e74c3c,#c0392b,#e74c3c)",
              border:"none", borderRadius:28, padding: isMobile ? "13px 0" : "15px 0",
              color: spinning ? "rgba(150,50,70,.5)" : "#fff",
              fontWeight:900, fontSize: isMobile ? 15 : 17, cursor: spinning ? "not-allowed" : "pointer",
              letterSpacing:2, boxShadow: spinning ? "none" : "0 6px 22px rgba(231,76,60,.5)",
              transition:"all .2s",
            }}>
              {spinning
                ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                    <span style={{ display:"inline-block", animation:"spin .5s linear infinite" }}>🔄</span>
                    SPINNING...
                  </span>
                : inFreeSpins ? "⭐ FREE SPIN!" : "SPIN ▶"}
            </button>

            <button onClick={() => setAutoSpin(a => !a)} style={{
              background: autoSpin ? "linear-gradient(135deg,#27ae60,#1e8449)" : "rgba(255,255,255,.65)",
              border: autoSpin ? "1.5px solid #27ae60" : "1.5px solid rgba(200,100,130,.3)",
              borderRadius:10, padding: isMobile ? "8px 10px" : "10px 14px",
              color: autoSpin ? "#fff" : "#c0392b",
              fontWeight:700, fontSize: isMobile ? 10 : 11, cursor:"pointer", whiteSpace:"nowrap",
            }}>🔁 {autoSpin ? "ON" : "AUTO"}</button>

            <button onClick={doSpin} style={{
              background:"linear-gradient(135deg,#888,#555)", border:"none",
              borderRadius:"50%", width: isMobile ? 38 : 44, height: isMobile ? 38 : 44,
              color:"#fff", fontSize: isMobile ? 15 : 18, cursor:"pointer",
              boxShadow:"0 3px 10px rgba(0,0,0,.3)", flexShrink:0,
            }}>↻</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin         { to { transform:rotate(360deg); } }
        @keyframes pulse        { from { opacity:.6; } to { opacity:1; } }
        @keyframes explode      { from { transform:scale(.5); opacity:1; } to { transform:scale(2.5); opacity:0; } }
        @keyframes dropIn       { from { transform:translateY(-28px) scale(.7); opacity:0; } to { transform:translateY(0) scale(1); opacity:1; } }
        @keyframes popIn        { from { transform:scale(.4); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes bgWave       { 0% { background-position:0% 50%; } 100% { background-position:100% 50%; } }
        @keyframes tickerScroll { 0% { transform:translateX(0); } 100% { transform:translateX(-33.33%); } }
      `}</style>
    </div>
  );
}