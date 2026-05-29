import { useState, useEffect, useCallback, useRef } from "react";

/* ══════════════════════════════════════════════════════════════
   SWEET BONANZA 2500 — Full Playable Slot
   6×5 grid, cluster pays (8+), tumble mechanic, free spins
══════════════════════════════════════════════════════════════ */

const SYMBOLS = [
  { id:"lollipop",   emoji:"🍭", label:"Lollipop",   color:"#ff69b4", mult:[0,0,0,0,0,0,0,0,36.4,50,100,150,200,750],   scatter:true  },
  { id:"grape",      emoji:"🍇", label:"Grape",      color:"#9b59b6", mult:[0,0,0,0,0,0,0,0,1.5,2,5,10,25,100]  },
  { id:"apple",      emoji:"🍎", label:"Apple",      color:"#e74c3c", mult:[0,0,0,0,0,0,0,0,1,1.5,4,8,20,75]   },
  { id:"watermelon", emoji:"🍉", label:"Watermelon", color:"#27ae60", mult:[0,0,0,0,0,0,0,0,0.8,1.2,3,6,15,60]  },
  { id:"plum",       emoji:"🍑", label:"Plum",       color:"#e67e22", mult:[0,0,0,0,0,0,0,0,0.5,0.8,2,4,10,40]  },
  { id:"banana",     emoji:"🍌", label:"Banana",     color:"#f1c40f", mult:[0,0,0,0,0,0,0,0,0.4,0.6,1.5,3,8,25]  },
  { id:"candy_blue", emoji:"🍬", label:"Blue Candy", color:"#3498db", mult:[0,0,0,0,0,0,0,0,0.3,0.5,1,2,5,15]  },
  { id:"heart",      emoji:"💝", label:"Heart",      color:"#e91e63", mult:[0,0,0,0,0,0,0,0,0.2,0.4,0.8,1.5,3,10]  },
];

const COLS = 6, ROWS = 5;
const WEIGHTS = [3, 8, 10, 12, 14, 16, 18, 19]; // lollipop rare as scatter

function weightedRandom() {
  const total = WEIGHTS.reduce((a,b)=>a+b,0);
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

// BFS cluster finder — minimum 8 same symbol (non-scatter)
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
            const nr = cr+dr, nc = cc+dc;
            if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!visited[nr][nc]&&grid[nr][nc].sym.id===sym.id) {
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
  const idx = Math.min(size, 13); // cap at index 13
  return sym.mult[idx] ?? sym.mult[sym.mult.length - 1];
}

// ── SYMBOL CELL ──────────────────────────────────────────────
function SymbolCell({ cell, row, col, isWin, isBomb }) {
  return (
    <div style={{
      position: "relative",
      borderRadius: 10,
      background: isWin
        ? `radial-gradient(circle at 50% 50%, ${cell.sym.color}55, ${cell.sym.color}18)`
        : "rgba(255,255,255,0.06)",
      border: isWin
        ? `2px solid ${cell.sym.color}`
        : "1.5px solid rgba(255,255,255,0.09)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "clamp(18px,3.5vw,30px)",
      aspectRatio: "1",
      boxShadow: isWin ? `0 0 18px ${cell.sym.color}88` : "none",
      transform: isBomb ? "scale(0)" : isWin ? "scale(1.07)" : "scale(1)",
      transition: isBomb
        ? "transform 0.3s cubic-bezier(.4,2,.6,1), opacity 0.3s"
        : "all 0.22s cubic-bezier(.34,1.56,.64,1)",
      opacity: isBomb ? 0 : 1,
      overflow: "hidden",
      animationName: cell.state === "drop" ? "dropIn" : "none",
      animationDuration: "0.35s",
      animationTimingFunction: "cubic-bezier(.34,1.3,.64,1)",
    }}>
      <span style={{ userSelect:"none", filter: isWin ? "drop-shadow(0 0 6px white)" : "none" }}>
        {cell.sym.emoji}
      </span>
      {/* Win glow pulse */}
      {isWin && (
        <div style={{
          position:"absolute", inset:0, borderRadius:10,
          background:`radial-gradient(circle,${cell.sym.color}30,transparent)`,
          animation:"pulse 0.45s ease-in-out infinite alternate",
        }}/>
      )}
      {/* Bomb explosion */}
      {isBomb && (
        <div style={{
          position:"absolute", inset:-10,
          background:`radial-gradient(circle,${cell.sym.color}cc,transparent 70%)`,
          borderRadius:"50%",
          animation:"explode 0.35s ease-out forwards",
        }}/>
      )}
    </div>
  );
}

// ── BET BUTTONS ───────────────────────────────────────────────
const BET_OPTS = [0.20, 0.40, 0.60, 1.00, 2.00, 4.00, 6.00, 10.00, 20.00, 40.00, 100.00];

export default function SweetBonanza2500() {
  const [grid, setGrid] = useState(makeGrid());
  const [balance, setBalance] = useState(10000);
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
  const [winLevel, setWinLevel] = useState(""); // "big","mega","epic"
  const [turbo, setTurbo] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const autoRef = useRef(false);
  const spinningRef = useRef(false);

  const delay = (ms) => new Promise(r => setTimeout(r, turbo ? ms * 0.35 : ms));

  // Animate grid spinning (random shuffle frames)
  const animateSpin = async () => {
    const frames = turbo ? 4 : 10;
    for (let f = 0; f < frames; f++) {
      setGrid(makeGrid());
      await delay(65);
    }
  };

  const doSpin = useCallback(async () => {
    if (spinningRef.current) return;
    if (!inFreeSpins && balance < bet) {
      setMessage("💸 Insufficient balance!");
      return;
    }
    spinningRef.current = true;
    setSpinning(true);
    setShowWin(false);
    setWinCells(new Set());
    setBombCells(new Set());
    setRoundWin(0);
    setMessage("");

    if (inFreeSpins) {
      setFreeSpins(f => f - 1);
    } else {
      setBalance(b => b - bet);
    }

    await animateSpin();

    const finalGrid = makeGrid();
    setGrid(finalGrid);
    await delay(200);

    await processTumble(finalGrid, inFreeSpins ? multiplier : 1, 0);

    spinningRef.current = false;
    setSpinning(false);
  }, [spinning, balance, bet, inFreeSpins, multiplier, turbo]);

  useEffect(() => { autoRef.current = autoSpin; }, [autoSpin]);

  // Auto spin loop
  useEffect(() => {
    if (!autoSpin || spinningRef.current) return;
    const t = setTimeout(() => { if (autoRef.current) doSpin(); }, 600);
    return () => clearTimeout(t);
  }, [autoSpin, spinning]);

  const processTumble = async (g, mult, accumulated) => {
    const clusters = findClusters(g);
    const scatters = countScatters(g);

    // Check free spins trigger
    if (scatters >= 4 && !inFreeSpins) {
      const fs = scatters >= 6 ? 25 : scatters >= 5 ? 18 : 12;
      setFreeSpins(fs);
      setInFreeSpins(true);
      setMultiplier(2);
      setMessage(`🎰 ${fs} FREE SPINS TRIGGERED!`);
      await delay(1200);
    }

    if (clusters.length === 0) {
      if (accumulated === 0) setMessage("Try again! 🍭");
      else {
        const level = accumulated >= bet * 50 ? "epic" : accumulated >= bet * 20 ? "mega" : accumulated >= bet * 5 ? "big" : "";
        if (level) { setWinLevel(level); setShowWin(true); await delay(1800); setShowWin(false); }
      }
      if (inFreeSpins && freeSpins <= 0) {
        await delay(600);
        setInFreeSpins(false);
        setMultiplier(1);
        setMessage("Free Spins Ended!");
      }
      return;
    }

    // Mark winning cells
    const winning = new Set();
    clusters.forEach(cl => cl.cells.forEach(([r,c]) => winning.add(`${r},${c}`)));
    setWinCells(winning);

    // Calculate win
    let win = 0;
    clusters.forEach(cl => {
      const m = clusterMultiplier(cl.sym, cl.size);
      win += m * bet * mult;
    });
    win = Math.round(win * 100) / 100;

    await delay(500);

    // Explode winning cells
    setBombCells(new Set(winning));
    await delay(350);

    setBalance(b => Math.round((b + win) * 100) / 100);
    const newAccum = Math.round((accumulated + win) * 100) / 100;
    setRoundWin(newAccum);
    setTotalWin(tw => Math.round((tw + win) * 100) / 100);
    setMessage(win >= bet * 20 ? `🎊 MEGA WIN! +₱${win.toFixed(2)}` : win >= bet * 5 ? `🔥 BIG WIN! +₱${win.toFixed(2)}` : `+₱${win.toFixed(2)}`);

    // Tumble: remove winners, drop new symbols
    await delay(300);
    const newGrid = g.map((row, ri) => row.map((cell, ci) => {
      if (winning.has(`${ri},${ci}`)) {
        return { sym: weightedRandom(), state: "drop" };
      }
      return { ...cell, state: "idle" };
    }));
    setGrid(newGrid);
    setWinCells(new Set());
    setBombCells(new Set());

    await delay(400);

    // Increase multiplier each tumble in free spins
    const nextMult = inFreeSpins ? mult + 1 : mult;
    await processTumble(newGrid, nextMult, newAccum);
  };

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.code === "Space" && !spinningRef.current) { e.preventDefault(); doSpin(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [doSpin]);

  const bgClouds = [
    { top:"5%",  left:"2%",  size:120, op:0.5 },
    { top:"10%", left:"70%", size:180, op:0.4 },
    { top:"2%",  left:"40%", size:100, op:0.35 },
    { top:"75%", left:"5%",  size:150, op:0.3 },
    { top:"80%", left:"65%", size:130, op:0.35 },
  ];

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(180deg,#87ceeb 0%,#b0e0ff 30%,#ffd6e7 60%,#ffe4b5 100%)",
      display:"flex", flexDirection:"column", alignItems:"center",
      fontFamily:"'Segoe UI',sans-serif", position:"relative",
      overflow:"hidden",
    }}>
      {/* Candy clouds BG */}
      {bgClouds.map((cl,i)=>(
        <div key={i} style={{
          position:"absolute", top:cl.top, left:cl.left,
          width:cl.size, height:cl.size*0.55,
          background:"rgba(255,255,255,0.7)",
          borderRadius:"50%",
          filter:"blur(18px)",
          opacity:cl.op,
          pointerEvents:"none",
        }}/>
      ))}

      {/* Candy hills bottom */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:80,
        background:"linear-gradient(180deg,#ff9eca,#ffb3d9)",
        borderRadius:"80% 80% 0 0 / 40px 40px 0 0",
        pointerEvents:"none",
      }}/>

      {/* ── HEADER ── */}
      <div style={{
        width:"100%", maxWidth:900,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 20px 0", position:"relative", zIndex:10,
      }}>
        {/* Title */}
        <div style={{ textAlign:"center", flex:1 }}>
          <div style={{
            fontWeight:900, fontSize:"clamp(22px,5vw,38px)",
            background:"linear-gradient(135deg,#ff6bcd,#ff9f43,#ff6bcd)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            textShadow:"none",
            letterSpacing:2, lineHeight:1,
            filter:"drop-shadow(0 2px 6px rgba(255,107,205,0.6))",
          }}>Sweet Bonanza</div>
          <div style={{ fontSize:11, color:"rgba(100,20,60,0.6)", letterSpacing:3, fontWeight:700 }}>2500 • PRAGMATIC PLAY</div>
        </div>
        {/* Balance */}
        <div style={{
          background:"rgba(255,255,255,0.55)",
          backdropFilter:"blur(10px)",
          borderRadius:12, padding:"8px 16px",
          border:"1.5px solid rgba(255,255,255,0.8)",
          textAlign:"right",
        }}>
          <div style={{ fontSize:9, color:"rgba(80,20,50,0.5)", letterSpacing:1, fontWeight:700 }}>BALANCE</div>
          <div style={{ fontSize:18, fontWeight:900, color:"#c0392b" }}>₱{balance.toFixed(2)}</div>
        </div>
      </div>

      {/* ── FREE SPINS BANNER ── */}
      {inFreeSpins && (
        <div style={{
          background:"linear-gradient(135deg,#f39c12,#e74c3c)",
          color:"#fff", fontWeight:900, fontSize:13,
          padding:"6px 20px", borderRadius:30,
          boxShadow:"0 4px 20px rgba(231,76,60,0.5)",
          marginTop:6, letterSpacing:1, zIndex:10,
          animation:"pulse 0.6s ease-in-out infinite alternate",
        }}>
          ⭐ FREE SPINS: {freeSpins} remaining • Multiplier ×{multiplier}
        </div>
      )}

      {/* ── MAIN GRID AREA ── */}
      <div style={{
        position:"relative", zIndex:10, marginTop:10,
        width:"100%", maxWidth:700, padding:"0 10px",
      }}>
        {/* Grid frame */}
        <div style={{
          background:"linear-gradient(180deg,rgba(255,255,255,0.35),rgba(255,200,230,0.25))",
          backdropFilter:"blur(8px)",
          borderRadius:20,
          border:"2.5px solid rgba(255,255,255,0.7)",
          boxShadow:"0 8px 40px rgba(255,105,180,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
          padding:"12px",
          position:"relative",
        }}>
          {/* Corner candies decoration */}
          {["top:6px;left:8px","top:6px;right:8px","bottom:6px;left:8px","bottom:6px;right:8px"].map((s,i)=>(
            <span key={i} style={{ position:"absolute", fontSize:16, ...Object.fromEntries(s.split(";").map(p=>p.split(":"))) }}>🍬</span>
          ))}

          {/* Message banner */}
          <div style={{
            textAlign:"center", marginBottom:8,
            minHeight:28, display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            {message && (
              <div style={{
                background: message.includes("WIN") ? "linear-gradient(135deg,#f39c12,#e74c3c)" : "rgba(255,255,255,0.5)",
                color: message.includes("WIN") ? "#fff" : "#c0392b",
                fontWeight:900, fontSize:13, letterSpacing:0.5,
                padding:"5px 18px", borderRadius:20,
                boxShadow: message.includes("WIN") ? "0 0 20px rgba(231,76,60,0.5)" : "none",
                animation: message.includes("WIN") ? "popIn 0.3s cubic-bezier(.34,1.56,.64,1)" : "none",
              }}>{message}</div>
            )}
          </div>

          {/* Grid */}
          <div style={{
            display:"grid",
            gridTemplateColumns:`repeat(${COLS}, 1fr)`,
            gap:6,
          }}>
            {grid.map((row, ri) => row.map((cell, ci) => {
              const key = `${ri},${ci}`;
              return (
                <SymbolCell
                  key={`${ri}-${ci}-${cell.sym.uid}`}
                  cell={cell}
                  row={ri} col={ci}
                  isWin={winCells.has(key)}
                  isBomb={bombCells.has(key)}
                />
              );
            }))}
          </div>

          {/* Round win display */}
          {roundWin > 0 && (
            <div style={{
              textAlign:"center", marginTop:8,
              fontSize:13, fontWeight:900,
              color:"#c0392b",
            }}>Round Win: ₱{roundWin.toFixed(2)}</div>
          )}
        </div>

        {/* ── BIG WIN OVERLAY ── */}
        {showWin && (
          <div style={{
            position:"absolute", inset:0,
            display:"flex", alignItems:"center", justifyContent:"center",
            background:"rgba(0,0,0,0.45)", borderRadius:20, zIndex:20,
            backdropFilter:"blur(4px)",
          }}>
            <div style={{
              textAlign:"center",
              animation:"popIn 0.4s cubic-bezier(.34,1.56,.64,1)",
            }}>
              <div style={{
                fontWeight:900, fontSize:"clamp(28px,8vw,56px)",
                background:"linear-gradient(135deg,#ffd700,#ff6b35,#ffd700)",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                filter:"drop-shadow(0 0 20px rgba(255,215,0,0.8))",
                letterSpacing:3, textTransform:"uppercase",
              }}>
                {winLevel === "epic" ? "⚡ EPIC WIN! ⚡" : winLevel === "mega" ? "🌟 MEGA WIN! 🌟" : "🎊 BIG WIN! 🎊"}
              </div>
              <div style={{ fontSize:"clamp(20px,5vw,36px)", fontWeight:900, color:"#fff", marginTop:6 }}>
                ₱{roundWin.toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── CONTROLS ── */}
      <div style={{
        width:"100%", maxWidth:700, padding:"10px 10px 20px",
        position:"relative", zIndex:10,
      }}>
        {/* Panel */}
        <div style={{
          background:"linear-gradient(180deg,rgba(255,255,255,0.5),rgba(255,200,230,0.4))",
          backdropFilter:"blur(12px)",
          borderRadius:18, border:"2px solid rgba(255,255,255,0.7)",
          boxShadow:"0 4px 20px rgba(255,105,180,0.2)",
          padding:"14px 16px",
          display:"flex", flexDirection:"column", gap:12,
        }}>
          {/* BET row */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{
              background:"rgba(255,100,150,0.15)",
              border:"1.5px solid rgba(255,100,150,0.3)",
              borderRadius:10, padding:"6px 12px",
              minWidth:90,
            }}>
              <div style={{ fontSize:8, color:"rgba(150,30,60,0.6)", fontWeight:700, letterSpacing:1 }}>BET</div>
              <div style={{ fontSize:16, fontWeight:900, color:"#c0392b" }}>₱{bet.toFixed(2)}</div>
            </div>
            <div style={{ display:"flex", gap:4, flex:1, flexWrap:"wrap" }}>
              {BET_OPTS.map(v => (
                <button key={v} onClick={() => !spinning && setBet(v)} style={{
                  background: bet===v
                    ? "linear-gradient(135deg,#e74c3c,#c0392b)"
                    : "rgba(255,255,255,0.5)",
                  border: bet===v ? "1.5px solid #c0392b" : "1.5px solid rgba(200,100,130,0.3)",
                  borderRadius:8, padding:"4px 8px",
                  color: bet===v ? "#fff" : "#c0392b",
                  fontWeight:700, fontSize:10, cursor:"pointer",
                  boxShadow: bet===v ? "0 2px 10px rgba(192,57,43,0.4)" : "none",
                  transition:"all 0.15s",
                }}>₱{v.toFixed(2)}</button>
              ))}
            </div>
          </div>

          {/* Spin + toggles row */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {/* Turbo toggle */}
            <button onClick={() => setTurbo(t => !t)} style={{
              background: turbo ? "linear-gradient(135deg,#f39c12,#e67e22)" : "rgba(255,255,255,0.5)",
              border: turbo ? "1.5px solid #e67e22" : "1.5px solid rgba(200,100,130,0.3)",
              borderRadius:10, padding:"8px 12px",
              color: turbo ? "#fff" : "#c0392b",
              fontWeight:700, fontSize:11, cursor:"pointer",
              whiteSpace:"nowrap",
            }}>⚡ {turbo ? "TURBO ON" : "TURBO"}</button>

            {/* SPIN button */}
            <button
              onClick={doSpin}
              disabled={spinning}
              style={{
                flex:1,
                background: spinning
                  ? "rgba(200,100,130,0.3)"
                  : inFreeSpins
                    ? "linear-gradient(135deg,#f39c12,#e74c3c)"
                    : "linear-gradient(135deg,#e74c3c,#c0392b,#e74c3c)",
                backgroundSize: "200% 100%",
                border:"none", borderRadius:30,
                padding:"14px 0",
                color: spinning ? "rgba(150,50,70,0.5)" : "#fff",
                fontWeight:900, fontSize:17,
                cursor: spinning ? "not-allowed" : "pointer",
                letterSpacing:2,
                boxShadow: spinning ? "none" : "0 6px 24px rgba(231,76,60,0.5)",
                transition:"all 0.2s",
                position:"relative", overflow:"hidden",
              }}
            >
              {spinning ? (
                <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <span style={{ display:"inline-block", animation:"spin 0.5s linear infinite" }}>🔄</span>
                  SPINNING...
                </span>
              ) : inFreeSpins ? `⭐ FREE SPIN!` : "SPIN ▶"}
            </button>

            {/* Auto toggle */}
            <button onClick={() => setAutoSpin(a => !a)} style={{
              background: autoSpin ? "linear-gradient(135deg,#27ae60,#1e8449)" : "rgba(255,255,255,0.5)",
              border: autoSpin ? "1.5px solid #27ae60" : "1.5px solid rgba(200,100,130,0.3)",
              borderRadius:10, padding:"8px 12px",
              color: autoSpin ? "#fff" : "#c0392b",
              fontWeight:700, fontSize:11, cursor:"pointer",
              whiteSpace:"nowrap",
            }}>🔁 {autoSpin ? "AUTO ON" : "AUTO"}</button>
          </div>

          {/* Buy Feature + info row */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button style={{
              background:"linear-gradient(135deg,#27ae60,#1e8449)",
              border:"none", borderRadius:10, padding:"8px 14px",
              color:"#fff", fontWeight:700, fontSize:11, cursor:"pointer",
              boxShadow:"0 3px 12px rgba(39,174,96,0.4)",
              whiteSpace:"nowrap",
            }}>
              🎰 BUY FEATURE<br/>
              <span style={{ fontSize:13, fontWeight:900 }}>₱{(bet * 100).toFixed(2)}</span>
            </button>
            <div style={{ flex:1, display:"flex", gap:4, overflowX:"auto", scrollbarWidth:"none" }}>
              {SYMBOLS.map(s => (
                <div key={s.id} style={{
                  display:"flex", flexDirection:"column", alignItems:"center",
                  gap:1, flexShrink:0,
                  background:"rgba(255,255,255,0.4)",
                  borderRadius:8, padding:"4px 8px",
                  border:"1.5px solid rgba(200,100,130,0.2)",
                }}>
                  <span style={{ fontSize:16 }}>{s.emoji}</span>
                  <span style={{ fontSize:7, color:"rgba(150,30,60,0.6)", fontWeight:700 }}>
                    {s.scatter ? "SCATTER" : `8+:${s.mult[8]}×`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign:"center", fontSize:9, color:"rgba(150,30,60,0.45)", letterSpacing:0.5 }}>
            SPACE to spin • 8+ cluster = WIN • 4+ 🍭 = Free Spins • Tumble mechanic active
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { from { opacity:0.6; } to { opacity:1; } }
        @keyframes explode { from { transform:scale(0.5); opacity:1; } to { transform:scale(2.5); opacity:0; } }
        @keyframes dropIn  { from { transform:translateY(-30px) scale(0.7); opacity:0; } to { transform:translateY(0) scale(1); opacity:1; } }
        @keyframes popIn   { from { transform:scale(0.4); opacity:0; } to { transform:scale(1); opacity:1; } }
      `}</style>
    </div>
  );
}