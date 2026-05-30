import { useState, useEffect, useCallback, useRef } from "react";

import plumImg from "./assets/plum.png";
import grapeImg from "./assets/grape.png";
import melonImg from "./assets/melon.png";
import multiplierImg from "./assets/multiplier.png";

const MULT_VALUES = [5, 20, 50, 100, 1000];
const MULT_WEIGHTS = [40, 25, 15, 8, 2]; // lower weight = rarer

const SYMBOLS = [
  { id:"lollipop",   img:"https://i.pinimg.com/736x/27/f8/3d/27f83d803052c68ed11c2db0f3a0b5cd.jpg", label:"Lollipop",   color:"#ff69b4", mult:[0,0,0,0,0,0,0,0,36.4,50,100,150,200,750], scatter:true },
  { id:"grape",      img: grapeImg,  label:"Grape",      color:"#9b59b6", mult:[0,0,0,0,0,0,0,0,1.5,2,5,10,25,100] },
  { id:"apple",      img:"https://i.pinimg.com/736x/f3/e3/83/f3e38314103ac7d2ded97e8bc771a43b.jpg", label:"Apple", color:"#e74c3c", mult:[0,0,0,0,0,0,0,0,1,1.5,4,8,20,75] },
  { id:"watermelon", img: melonImg,  label:"Watermelon", color:"#27ae60", mult:[0,0,0,0,0,0,0,0,0.8,1.2,3,6,15,60] },
  { id:"plum",       img: plumImg,   label:"Plum",       color:"#e67e22", mult:[0,0,0,0,0,0,0,0,0.5,0.8,2,4,10,40] },
  { id:"banana",     img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYGjIvT4IvOwxFcbnVmk6Gdl-TtUWO6louDfjurWxguA&s", label:"Banana", color:"#f1c40f", mult:[0,0,0,0,0,0,0,0,0.4,0.6,1.5,3,8,25] },
  { id:"candy_blue", img:"https://i.pinimg.com/736x/e6/f0/25/e6f025e324cd91bb88ff3512ffc276d3.jpg", label:"Blue Candy", color:"#3498db", mult:[0,0,0,0,0,0,0,0,0.3,0.5,1,2,5,15] },
  { id:"heart",      img:"https://i.pinimg.com/736x/f0/e4/de/f0e4de27fe8e17576c838e2817134dcb.jpg", label:"Heart", color:"#e91e63", mult:[0,0,0,0,0,0,0,0,0.2,0.4,0.8,1.5,3,10] },
];

const COLS = 6, ROWS = 5;
const WEIGHTS = [3, 8, 10, 12, 14, 16, 18, 19];
const BET_OPTS = [0.20, 0.40, 0.60, 1.00, 2.00, 4.00, 6.00, 10.00, 20.00, 40.00, 100.00];

const WIN_NOTICES = [
  { name:"Ash****", amount:"₱12,450" }, { name:"Mar****", amount:"₱8,200" },
  { name:"Jun****", amount:"₱31,000" }, { name:"Kri****", amount:"₱5,750" },
  { name:"Ric****", amount:"₱18,900" }, { name:"Jen****", amount:"₱9,300" },
  { name:"Dan****", amount:"₱42,600" }, { name:"Lyn****", amount:"₱7,100" },
  { name:"Bel****", amount:"₱23,500" }, { name:"Rod****", amount:"₱15,800" },
  { name:"Cel****", amount:"₱6,400"  }, { name:"Vin****", amount:"₱88,000" },
];

/* ── MULTIPLIER SYMBOL HELPERS ── */
function randomMultValue() {
  const total = MULT_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < MULT_VALUES.length; i++) {
    r -= MULT_WEIGHTS[i];
    if (r <= 0) return MULT_VALUES[i];
  }
  return MULT_VALUES[0];
}

function makeMultiplierSymbol() {
  const val = randomMultValue();
  return {
    id: `multiplier_${val}`,
    img: multiplierImg,
    label: `×${val}`,
    color: val >= 1000 ? "#ffd700" : val >= 100 ? "#e74c3c" : val >= 50 ? "#f39c12" : val >= 20 ? "#9b59b6" : "#27ae60",
    multValue: val,
    isMultiplier: true,
    mult: [],
    scatter: false,
  };
}

function weightedRandom(forceMultiplierChance = 0.08) {
  // 8% chance to spawn a multiplier symbol
  if (Math.random() < forceMultiplierChance) {
    return { ...makeMultiplierSymbol(), uid: Math.random() };
  }
  const validSymbols = SYMBOLS.filter(Boolean);
  const total = WEIGHTS.slice(0, validSymbols.length).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < validSymbols.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return { ...validSymbols[i], uid: Math.random() };
  }
  return { ...validSymbols[validSymbols.length - 1], uid: Math.random() };
}

function makeGrid(forceWinChance = 0.8) {
  const createRandomGrid = () =>
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ sym: weightedRandom(), state: "idle" }))
    );

  if (Math.random() < forceWinChance) {
    let grid = createRandomGrid();
    const normalSymbols = SYMBOLS.filter(s => !s.scatter);
    const target = normalSymbols[Math.floor(Math.random() * normalSymbols.length)];
    const positions = [[1,1],[1,2],[1,3],[2,1],[2,2],[2,3]];
    positions.forEach(([r,c]) => {
      grid[r][c] = { sym: { ...target, uid: Math.random() }, state: "idle" };
    });
    // Randomly add 1-2 multiplier symbols to winning boards for excitement
    if (Math.random() < 0.45) {
      const multPositions = [[0,0],[0,5],[4,0],[4,5],[0,3]];
      const chosen = multPositions[Math.floor(Math.random() * multPositions.length)];
      grid[chosen[0]][chosen[1]] = { sym: { ...makeMultiplierSymbol(), uid: Math.random() }, state: "idle" };
    }
    return grid;
  }
  return createRandomGrid();
}

function findClusters(grid) {
  const visited = Array.from({ length: ROWS }, () => new Array(COLS).fill(false));
  const clusters = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!visited[r][c]) {
        const sym = grid[r][c].sym;
        if (sym.scatter || sym.isMultiplier) { visited[r][c] = true; continue; }
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
        if (cells.length >= 6) clusters.push({ sym, cells, size: cells.length });
      }
    }
  }
  return clusters;
}

/* Collect all multiplier symbol positions on the grid */
function findMultiplierCells(grid) {
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c].sym.isMultiplier) cells.push({ r, c, val: grid[r][c].sym.multValue });
    }
  }
  return cells;
}

/* Combined multiplier = product of all multiplier symbols on the board */
function getBoardMultiplier(grid) {
  const mCells = findMultiplierCells(grid);
  if (mCells.length === 0) return 1;
  return mCells.reduce((acc, m) => acc * m.val, 1);
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

/* ── CONFIRM MODAL ── */
function ConfirmModal({ emoji, title, message, subtext, confirmLabel, confirmColor, onConfirm, onCancel }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:9999,
      background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)",
      display:"flex", alignItems:"center", justifyContent:"center",
    }}>
      <div style={{
        background:"linear-gradient(145deg,#fff8f0,#fff)",
        borderRadius:24, padding:"28px 26px 22px",
        maxWidth:310, width:"88%",
        boxShadow:"0 24px 70px rgba(0,0,0,0.45)",
        border:"2.5px solid rgba(255,255,255,0.95)",
        textAlign:"center",
        animation:"popIn .28s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <div style={{ fontSize:40, marginBottom:10 }}>{emoji}</div>
        <div style={{ fontWeight:900, fontSize:19, color:"#c0392b", marginBottom:6 }}>{title}</div>
        <div style={{ fontSize:13, color:"#555", marginBottom:4, lineHeight:1.55 }}>{message}</div>
        {subtext && <div style={{ fontSize:12, color:"#e67e22", fontWeight:700, marginBottom:18 }}>{subtext}</div>}
        {!subtext && <div style={{ marginBottom:18 }} />}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{
            flex:1, padding:"11px 0", borderRadius:13,
            background:"rgba(200,100,130,.1)", border:"1.5px solid rgba(200,100,130,.3)",
            color:"#c0392b", fontWeight:700, fontSize:13, cursor:"pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex:1, padding:"11px 0", borderRadius:13,
            background: confirmColor || "linear-gradient(135deg,#e74c3c,#c0392b)",
            border:"none", color:"#fff", fontWeight:900, fontSize:13, cursor:"pointer",
            boxShadow:"0 4px 16px rgba(0,0,0,.25)",
          }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ── WIN TICKER ── */
function WinTicker() {
  const [items] = useState(() => {
    const s = [...WIN_NOTICES].sort(() => Math.random() - 0.5);
    return [...s, ...s, ...s];
  });
  return (
    <div style={{
      width:"100%", overflow:"hidden",
      background:"linear-gradient(90deg,rgba(255,80,160,.92),rgba(255,150,40,.92),rgba(255,80,160,.92))",
      borderBottom:"1.5px solid rgba(255,255,255,.4)",
      padding:"5px 0",
    }}>
      <div style={{
        display:"flex", gap:56,
        animation:"tickerScroll 40s linear infinite",
        whiteSpace:"nowrap", width:"max-content",
      }}>
        {items.map((w, i) => (
          <span key={i} style={{ fontSize:12, fontWeight:700, color:"#fff",
            display:"inline-flex", alignItems:"center", gap:6,
            textShadow:"0 1px 4px rgba(0,0,0,.35)" }}>
            🎉 Congrats <strong style={{ color:"#ffe066" }}>{w.name}</strong> for winning <strong style={{ color:"#ffe066" }}>{w.amount}</strong>!
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── SYMBOL CELL ── */
function SymCell({ cell, isWin, isBomb, isMultWin }) {
  const s = cell.sym;

  return (
    <div style={{
      position:"relative",
      borderRadius:7,
      background: isWin || isMultWin
        ? `radial-gradient(circle at 50% 50%, ${s.color}44, ${s.color}11)`
        : "rgba(255,255,255,0.25)",
      border: isMultWin
        ? `2.5px solid #ffd700`
        : isWin
          ? `2px solid ${s.color}`
          : "1.5px solid rgba(255,255,255,0.45)",
      display:"flex", alignItems:"center", justifyContent:"center",
      aspectRatio:"1",
      boxShadow: isMultWin
        ? `0 0 18px #ffd70099, 0 0 6px #ffd70055`
        : isWin
          ? `0 0 14px ${s.color}88`
          : "0 1px 3px rgba(0,0,0,.07)",
      transform: isBomb ? "scale(0)" : (isWin || isMultWin) ? "scale(1.07)" : "scale(1)",
      transition:"all 0.2s cubic-bezier(.34,1.56,.64,1)",
      opacity: isBomb ? 0 : 1,
      overflow:"hidden",
      animationName: cell.state === "drop" ? "dropIn" : "none",
      animationDuration:"0.35s",
      animationTimingFunction:"cubic-bezier(.34,1.3,.64,1)",
    }}>

      {/* SYMBOL IMAGE */}
      <img
        src={s.img}
        alt={s.label}
        style={{
          width: s.isMultiplier ? "100%" : "86%",
          height: s.isMultiplier ? "100%" : "86%",
          objectFit:"contain",
          mixBlendMode: s.isMultiplier ? "normal" : "multiply",
          filter: (isWin || isMultWin)
            ? "drop-shadow(0 0 5px white) brightness(1.1) contrast(1.05)"
            : "contrast(1.05) saturate(1.1)",
          pointerEvents:"none",
          display:"block",
        }}
      />

      {/* MULTIPLIER VALUE TEXT overlay */}
      {s.isMultiplier && (
        <div style={{
          position:"absolute",
          inset:0,
          display:"flex",
          alignItems:"center",
          justifyContent:"center",
          pointerEvents:"none",
        }}>
          <span style={{
            fontWeight:900,
            fontSize: s.multValue >= 1000 ? "clamp(8px,2.2vw,13px)" : "clamp(9px,2.5vw,15px)",
            color: s.multValue >= 1000 ? "#fff700" : s.multValue >= 100 ? "#fff" : "#fff",
            textShadow: `0 0 8px ${s.color}, 0 2px 4px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,1)`,
            letterSpacing: s.multValue >= 1000 ? 0 : 0.5,
            lineHeight:1,
          }}>
            ×{s.multValue}
          </span>
        </div>
      )}

      {/* WIN GLOW */}
      {(isWin || isMultWin) && (
        <div style={{
          position:"absolute", inset:0, borderRadius:7,
          background:`radial-gradient(circle,${isMultWin ? "#ffd70028" : s.color+"28"},transparent)`,
          animation:"pulse 0.45s ease-in-out infinite alternate",
        }} />
      )}

      {/* EXPLOSION */}
      {isBomb && (
        <div style={{
          position:"absolute", inset:-10,
          background:`radial-gradient(circle,${s.color}cc,transparent 70%)`,
          borderRadius:"50%",
          animation:"explode 0.35s ease-out forwards",
        }} />
      )}
    </div>
  );
}

/* ── MULTIPLIER POPUP ── */
function MultiplierPopup({ multiplierCells, baseWin, finalWin, onDone }) {
  const totalMult = multiplierCells.reduce((acc, m) => acc * m.val, 1);
  return (
    <div style={{
      position:"absolute", inset:0, display:"flex", alignItems:"center",
      justifyContent:"center", background:"rgba(0,0,0,.65)", borderRadius:16,
      zIndex:25, backdropFilter:"blur(6px)",
    }}>
      <div style={{
        textAlign:"center", animation:"popIn .35s cubic-bezier(.34,1.56,.64,1)",
        padding:"0 16px",
      }}>
        {/* Title */}
        <div style={{
          fontWeight:900, fontSize:"clamp(14px,4.5vw,28px)",
          background:"linear-gradient(135deg,#ffd700,#ff6b35,#ffd700)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          filter:"drop-shadow(0 0 16px rgba(255,215,0,.9))",
          letterSpacing:2, textTransform:"uppercase", marginBottom:8,
        }}>⚡ MULTIPLIER!</div>

        {/* Multiplier chips */}
        <div style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginBottom:12 }}>
          {multiplierCells.map((m, i) => (
            <div key={i} style={{
              background:`linear-gradient(135deg,${
                m.val >= 1000 ? "#ffd700,#ff6b00" :
                m.val >= 100  ? "#e74c3c,#c0392b" :
                m.val >= 50   ? "#f39c12,#e67e22" :
                m.val >= 20   ? "#9b59b6,#6c3483" :
                                "#27ae60,#1e8449"
              })`,
              borderRadius:12, padding:"6px 12px",
              color:"#fff", fontWeight:900, fontSize:"clamp(14px,4vw,22px)",
              boxShadow:"0 4px 16px rgba(0,0,0,.4)",
              border:"2px solid rgba(255,255,255,.5)",
              animation:`popIn .3s ${i * 0.12}s both cubic-bezier(.34,1.56,.64,1)`,
            }}>×{m.val}</div>
          ))}
        </div>

        {/* Calculation */}
        <div style={{
          background:"rgba(0,0,0,.35)", borderRadius:14, padding:"8px 16px",
          border:"1px solid rgba(255,255,255,.15)", marginBottom:12,
        }}>
          <div style={{ color:"rgba(255,255,255,.7)", fontSize:11, marginBottom:3 }}>BASE WIN</div>
          <div style={{ color:"#fff", fontWeight:800, fontSize:"clamp(13px,3.5vw,20px)", marginBottom:4 }}>
            ₱{baseWin.toFixed(2)} × {totalMult}
          </div>
          <div style={{ color:"#ffd700", fontWeight:900, fontSize:"clamp(16px,5vw,30px)",
            filter:"drop-shadow(0 0 8px rgba(255,215,0,.7))" }}>
            = ₱{finalWin.toFixed(2)}
          </div>
        </div>

        <button onClick={onDone} style={{
          padding:"10px 28px", borderRadius:18, border:"none", cursor:"pointer",
          fontWeight:900, fontSize:14, color:"#fff",
          background:"linear-gradient(135deg,#ffd700,#ff6b00)",
          boxShadow:"0 6px 20px rgba(255,200,0,.45)", letterSpacing:1,
        }}>AWESOME! ▶</button>
      </div>
    </div>
  );
}

/* ── AUTO SPIN COUNTER BADGE ── */
function AutoBadge({ count }) {
  return (
    <div style={{
      position:"absolute", top:-8, right:-8,
      background:"linear-gradient(135deg,#f39c12,#e74c3c)",
      color:"#fff", fontWeight:900, fontSize:11,
      width:22, height:22, borderRadius:"50%",
      display:"flex", alignItems:"center", justifyContent:"center",
      border:"2px solid #fff", boxShadow:"0 2px 8px rgba(0,0,0,.3)", zIndex:5,
    }}>{count}</div>
  );
}

export default function SweetBonanza2500() {
  const [grid, setGrid] = useState(makeGrid());
  const [balance, setBalance] = useState(20000);
  const [bet, setBet] = useState(2.00);
  const [spinning, setSpinning] = useState(false);
  const [winCells, setWinCells] = useState(new Set());
  const [bombCells, setBombCells] = useState(new Set());
  const [multWinCells, setMultWinCells] = useState(new Set()); // highlight multiplier cells during win
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
  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [dcOn, setDcOn] = useState(false);
  const [confirm, setConfirm] = useState(null);

  // Multiplier popup state
  const [multPopup, setMultPopup] = useState(null); // { multiplierCells, baseWin, finalWin }
  const multResolveRef = useRef(null);

  const autoRef = useRef(false);
  const autoCountRef = useRef(0);
  const spinningRef = useRef(false);

  const delay = (ms) => new Promise(r => setTimeout(r, turbo ? ms * 0.3 : ms));

  const animateSpin = async () => {
    const frames = turbo ? 3 : 9;
    for (let f = 0; f < frames; f++) {
      setGrid(makeGrid());
      await delay(62);
    }
  };

  const showMultiplierPopup = (multiplierCells, baseWin, finalWin) => {
    return new Promise(resolve => {
      multResolveRef.current = resolve;
      setMultPopup({ multiplierCells, baseWin, finalWin });
    });
  };

  const handleMultPopupDone = () => {
    setMultPopup(null);
    if (multResolveRef.current) {
      multResolveRef.current();
      multResolveRef.current = null;
    }
  };

  const doSpin = useCallback(async (isAuto = false) => {
    if (spinningRef.current) return;
    if (!inFreeSpins && balance < bet) {
      setMessage("💸 Insufficient balance!");
      setAutoSpin(false); autoCountRef.current = 0; setAutoSpinsLeft(0);
      return;
    }
    spinningRef.current = true;
    setSpinning(true);
    setShowWin(false);
    setWinCells(new Set());
    setBombCells(new Set());
    setMultWinCells(new Set());
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
  }, [balance, bet, inFreeSpins, multiplier, turbo]);

  useEffect(() => { autoRef.current = autoSpin; }, [autoSpin]);
  useEffect(() => {
    if (!autoSpin || spinningRef.current) return;
    if (autoCountRef.current <= 0) { setAutoSpin(false); setAutoSpinsLeft(0); return; }
    const t = setTimeout(() => {
      if (autoRef.current && autoCountRef.current > 0) {
        autoCountRef.current -= 1;
        setAutoSpinsLeft(autoCountRef.current);
        doSpin(true);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [autoSpin, spinning]);

  const processTumble = async (g, mult, accumulated) => {
    const clusters = findClusters(g);
    const scatters = countScatters(g);

    if (scatters >= 3 && !inFreeSpins) {
      const fs = scatters >= 6 ? 25 : scatters >= 5 ? 18 : scatters >= 4 ? 15 : 12;
      const scatterWin = Math.round((bet * 0.4) * 100) / 100;
      setBalance(b => Math.round((b + scatterWin) * 100) / 100);
      setFreeSpins(fs); setInFreeSpins(true); setMultiplier(2);
      setMessage(`🍭 SCATTER! YOU GOT ${fs} FREE SPINS!`);
      setShowWin(true); setWinLevel("scatter");
      await delay(2200);
      setShowWin(false);
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

    // ── CALCULATE BASE WIN ──
    let baseWin = 0;
    clusters.forEach(cl => { baseWin += clusterMultiplier(cl.sym, cl.size) * bet * mult; });
    baseWin = Math.round(baseWin * 100) / 100;

    // ── CHECK FOR BOARD MULTIPLIER SYMBOLS ──
    const mCells = findMultiplierCells(g);
    const boardMult = mCells.length > 0 ? mCells.reduce((acc, m) => acc * m.val, 1) : 1;
    const finalWin = Math.round(baseWin * boardMult * 100) / 100;

    // Highlight multiplier cells
    if (mCells.length > 0) {
      const mSet = new Set(mCells.map(m => `${m.r},${m.c}`));
      setMultWinCells(mSet);
    }

    await delay(480);
    setBombCells(new Set(winning));
    await delay(320);

    // ── SHOW MULTIPLIER POPUP if there are multipliers ──
    if (mCells.length > 0 && !turbo) {
      await showMultiplierPopup(mCells, baseWin, finalWin);
    }

    setBalance(b => Math.round((b + finalWin) * 100) / 100);
    const newAccum = Math.round((accumulated + finalWin) * 100) / 100;
    setRoundWin(newAccum);
    setTotalWin(tw => Math.round((tw + finalWin) * 100) / 100);
    setMessage(
      mCells.length > 0
        ? `⚡ ×${boardMult} MULTIPLIER! +₱${finalWin.toFixed(2)}`
        : finalWin >= bet * 20
          ? `🎊 MEGA WIN! +₱${finalWin.toFixed(2)}`
          : finalWin >= bet * 5
            ? `🔥 BIG WIN! +₱${finalWin.toFixed(2)}`
            : `+₱${finalWin.toFixed(2)}`
    );

    await delay(280);

    const newGrid = g.map((row, ri) => row.map((cell, ci) => {
      // Remove winning cluster cells AND multiplier cells (they're consumed)
      if (winning.has(`${ri},${ci}`) || (mCells.length > 0 && mCells.some(m => m.r === ri && m.c === ci))) {
        return { sym: weightedRandom(), state: "drop" };
      }
      return { ...cell, state: "idle" };
    }));
    setGrid(newGrid);
    setWinCells(new Set());
    setBombCells(new Set());
    setMultWinCells(new Set());
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

  const handleBuyFreeSpins = () => {
    const cost = bet * 100;
    if (balance < cost) { setMessage("💸 Insufficient balance!"); return; }
    setConfirm({
      emoji:"🎰", title:"Buy Free Spins?", message:`Cost: ₱${cost.toFixed(2)}`,
      subtext:"Activates 12 Free Spins + 10 Auto Spins!",
      confirmLabel:`Buy ₱${cost.toFixed(2)}`, confirmColor:"linear-gradient(135deg,#e74c3c,#c0392b)",
      onConfirm: () => {
        setConfirm(null);
        setBalance(b => Math.round((b - cost) * 100) / 100);
        setFreeSpins(12); setInFreeSpins(true); setMultiplier(2);
        setMessage("🎰 12 FREE SPINS ACTIVATED!");
        autoCountRef.current = 10; setAutoSpinsLeft(10); setAutoSpin(true);
      },
    });
  };

  const handleBuySuperSpins = () => {
    const cost = bet * 500;
    if (balance < cost) { setMessage("💸 Insufficient balance!"); return; }
    setConfirm({
      emoji:"⚡", title:"Buy SUPER Free Spins?", message:`Cost: ₱${cost.toFixed(2)}`,
      subtext:"Activates 25 SUPER Spins × 5 Multiplier + 10 Auto Spins!",
      confirmLabel:`Buy ₱${cost.toFixed(2)}`, confirmColor:"linear-gradient(135deg,#f39c12,#e67e22)",
      onConfirm: () => {
        setConfirm(null);
        setBalance(b => Math.round((b - cost) * 100) / 100);
        setFreeSpins(25); setInFreeSpins(true); setMultiplier(5);
        setMessage("⚡ 25 SUPER SPINS ACTIVATED! ×5 MULTIPLIER!");
        autoCountRef.current = 10; setAutoSpinsLeft(10); setAutoSpin(true);
      },
    });
  };

  const handleAutoSpin = () => {
    if (autoSpin) { setAutoSpin(false); autoCountRef.current = 0; setAutoSpinsLeft(0); return; }
    setConfirm({
      emoji:"🔁", title:"Enable Auto Spin?",
      message:"Spins automatically 10 times. You can stop at any time.",
      subtext:null, confirmLabel:"Start (10×)",
      confirmColor:"linear-gradient(135deg,#27ae60,#1e8449)",
      onConfirm: () => {
        setConfirm(null);
        autoCountRef.current = 10; setAutoSpinsLeft(10); setAutoSpin(true);
      },
    });
  };

  return (
    <div style={{
      width:"100vw", height:"100vh",
      overflow:"hidden", position:"fixed", top:0, left:0,
      backgroundImage:`url('https://images.api.kansino.nl/cms/PRG_Sweet_Bonanza1000_bg_7c4f5e878a.jpg')`,
      backgroundSize:"cover", backgroundPosition:"center", backgroundRepeat:"no-repeat",
      display:"flex", flexDirection:"column", alignItems:"center",
      fontFamily:"'Segoe UI',sans-serif",
    }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(60,160,255,0.1)", pointerEvents:"none", zIndex:1 }} />

      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}

      {/* Multiplier Popup */}
      {multPopup && (
        <div style={{ position:"fixed", inset:0, zIndex:9998, display:"flex", alignItems:"center", justifyContent:"center",
          background:"rgba(0,0,0,.55)", backdropFilter:"blur(6px)" }}>
          <div style={{
            background:"linear-gradient(145deg,#1a0a30,#2d0f50)",
            borderRadius:24, padding:"24px 20px 20px",
            maxWidth:320, width:"88%",
            boxShadow:"0 24px 70px rgba(255,215,0,.3), 0 0 0 2px rgba(255,215,0,.4)",
            textAlign:"center",
            animation:"popIn .35s cubic-bezier(.34,1.56,.64,1)",
          }}>
            <div style={{
              fontWeight:900, fontSize:"clamp(18px,5vw,28px)",
              background:"linear-gradient(135deg,#ffd700,#ff6b35,#ffd700)",
              WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
              filter:"drop-shadow(0 0 12px rgba(255,215,0,.9))",
              letterSpacing:2, marginBottom:12,
            }}>⚡ MULTIPLIER!</div>

            <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:16 }}>
              {multPopup.multiplierCells.map((m, i) => (
                <div key={i} style={{
                  background:`linear-gradient(135deg,${
                    m.val >= 1000 ? "#ffd700,#ff6b00" :
                    m.val >= 100  ? "#e74c3c,#c0392b" :
                    m.val >= 50   ? "#f39c12,#e67e22" :
                    m.val >= 20   ? "#9b59b6,#6c3483" :
                                    "#27ae60,#1e8449"
                  })`,
                  borderRadius:14, padding:"8px 16px",
                  color:"#fff", fontWeight:900, fontSize:"clamp(18px,5vw,26px)",
                  boxShadow:"0 4px 18px rgba(0,0,0,.5)",
                  border:"2.5px solid rgba(255,255,255,.5)",
                  animation:`popIn .3s ${i * 0.13}s both cubic-bezier(.34,1.56,.64,1)`,
                }}>×{m.val}</div>
              ))}
            </div>

            <div style={{
              background:"rgba(0,0,0,.35)", borderRadius:14, padding:"10px 16px",
              border:"1px solid rgba(255,255,255,.12)", marginBottom:16,
            }}>
              <div style={{ color:"rgba(255,255,255,.6)", fontSize:11, marginBottom:4 }}>CALCULATION</div>
              <div style={{ color:"#fff", fontWeight:800, fontSize:"clamp(13px,3.5vw,18px)", marginBottom:6 }}>
                ₱{multPopup.baseWin.toFixed(2)}
                {" × "}
                {multPopup.multiplierCells.reduce((a, m) => a * m.val, 1)}
              </div>
              <div style={{ color:"#ffd700", fontWeight:900, fontSize:"clamp(20px,6vw,34px)",
                filter:"drop-shadow(0 0 10px rgba(255,215,0,.8))", lineHeight:1 }}>
                = ₱{multPopup.finalWin.toFixed(2)}
              </div>
            </div>

            <button onClick={handleMultPopupDone} style={{
              padding:"12px 32px", borderRadius:20, border:"none", cursor:"pointer",
              fontWeight:900, fontSize:15, color:"#1a0a30",
              background:"linear-gradient(135deg,#ffd700,#ffb300)",
              boxShadow:"0 6px 24px rgba(255,200,0,.5)", letterSpacing:1,
            }}>COLLECT! ₱{multPopup.finalWin.toFixed(2)}</button>
          </div>
        </div>
      )}

      {/* TICKER */}
      <div style={{ width:"100%", zIndex:20, flexShrink:0 }}>
        <WinTicker />
      </div>

      {/* HEADER BAR */}
      <div style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"6px 10px 0", zIndex:10, flexShrink:0,
      }}>
        <div style={{ display:"flex", gap:5 }}>
          {[["CREDIT", `₱${balance.toFixed(2)}`, "#c0392b"], ["WIN", `₱${totalWin.toFixed(2)}`, "#27ae60"]].map(([lbl,val,col]) => (
            <div key={lbl} style={{
              background:"rgba(255,255,255,.85)", backdropFilter:"blur(8px)",
              borderRadius:9, padding:"3px 9px", border:"1.5px solid rgba(255,255,255,.95)",
            }}>
              <div style={{ fontSize:7, color:"rgba(80,20,50,.55)", fontWeight:700, letterSpacing:1 }}>{lbl}</div>
              <div style={{ fontSize:13, fontWeight:900, color:col }}>{val}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:"center", flex:1 }}>
          <div style={{
            fontWeight:900, fontSize:"clamp(15px,4vw,26px)",
            background:"linear-gradient(135deg,#ff6bcd,#ff9f43,#ff6bcd)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            letterSpacing:2, filter:"drop-shadow(0 2px 8px rgba(255,107,205,.7))",
          }}>Sweet Bonanza</div>
          <div style={{ fontSize:7, color:"rgba(80,10,50,.65)", letterSpacing:3, fontWeight:700 }}>2500 • PRAGMATIC PLAY</div>
        </div>

        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {inFreeSpins && (
            <div style={{
              background:"linear-gradient(135deg,#8e44ad,#6c3483)", borderRadius:9,
              padding:"3px 9px", textAlign:"center", border:"1.5px solid rgba(255,255,255,.4)",
            }}>
              <div style={{ fontSize:7, color:"rgba(255,255,255,.7)", fontWeight:700 }}>×MULT</div>
              <div style={{ fontSize:13, fontWeight:900, color:"#ffd700" }}>×{multiplier}</div>
            </div>
          )}
          {inFreeSpins && (
            <div style={{
              background:"linear-gradient(135deg,#e74c3c,#c0392b)", borderRadius:9,
              padding:"3px 9px", textAlign:"center", border:"1.5px solid rgba(255,255,255,.4)",
            }}>
              <div style={{ fontSize:7, color:"rgba(255,255,255,.7)", fontWeight:700 }}>FREE</div>
              <div style={{ fontSize:13, fontWeight:900, color:"#fff" }}>{freeSpins}</div>
            </div>
          )}
          <div style={{
            background:"rgba(255,255,255,.85)", backdropFilter:"blur(8px)",
            borderRadius:9, padding:"3px 9px", border:"1.5px solid rgba(255,255,255,.95)", textAlign:"right",
          }}>
            <div style={{ fontSize:7, color:"rgba(80,20,50,.55)", fontWeight:700, letterSpacing:1 }}>BET</div>
            <div style={{ fontSize:13, fontWeight:900, color:"#c0392b" }}>₱{bet.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {inFreeSpins && (
        <div style={{
          background:"linear-gradient(135deg,#f39c12,#e74c3c)", color:"#fff",
          fontWeight:900, fontSize:11, padding:"3px 14px", borderRadius:20,
          boxShadow:"0 3px 14px rgba(231,76,60,.5)", marginTop:4,
          letterSpacing:1, zIndex:10, animation:"pulse .6s ease-in-out infinite alternate",
          flexShrink:0,
        }}>
          ⭐ FREE SPINS: {freeSpins} left • Multiplier ×{multiplier}
          {autoSpin && autoSpinsLeft > 0 && ` • Auto: ${autoSpinsLeft} left`}
        </div>
      )}

      {/* GRID */}
      <div style={{
        flex:1, width:"100%", padding:"5px 8px 4px",
        position:"relative", zIndex:10, minHeight:0,
        display:"flex", flexDirection:"column",
      }}>
        <div style={{
          flex:1, minHeight:0,
          background:"rgba(173,225,255,0.50)", backdropFilter:"blur(10px)",
          borderRadius:16, border:"2.5px solid rgba(255,255,255,.8)",
          boxShadow:"0 6px 32px rgba(100,180,255,.28), inset 0 1px 0 rgba(255,255,255,.7)",
          padding:"6px 6px 4px", position:"relative",
          display:"flex", flexDirection:"column",
        }}>
          {[["top:3px","left:5px"],["top:3px","right:5px"],["bottom:3px","left:5px"],["bottom:3px","right:5px"]].map(([v,h],i)=>(
            <span key={i} style={{ position:"absolute", fontSize:12, zIndex:2,
              ...Object.fromEntries([[v.split(":")[0], v.split(":")[1]], [h.split(":")[0], h.split(":")[1]]]) }}>🍬</span>
          ))}

          {roundWin > 0 && (
            <div style={{
              position:"absolute", left:"50%", bottom:70,
              transform:"translateX(-50%)", zIndex:30,
              background:"rgba(0,0,0,.45)", padding:"4px 12px",
              borderRadius:14, border:"1px solid rgba(255,255,255,.15)",
              backdropFilter:"blur(4px)",
            }}>
              <div style={{ color:"#ffe066", fontSize:12, fontWeight:900, textAlign:"center", letterSpacing:0.5 }}>
                WIN ₱{roundWin.toFixed(2)}
              </div>
            </div>
          )}

          <div style={{
            flex:1, minHeight:0,
            display:"grid", gridTemplateColumns:`repeat(${COLS},1fr)`,
            gridTemplateRows:`repeat(${ROWS},1fr)`,
            gap:4,
          }}>
            {grid.map((row, ri) => row.map((cell, ci) => (
              <SymCell
                key={`${ri}-${ci}-${cell.sym.uid}`}
                cell={cell}
                isWin={winCells.has(`${ri},${ci}`)}
                isBomb={bombCells.has(`${ri},${ci}`)}
                isMultWin={multWinCells.has(`${ri},${ci}`)}
              />
            )))}
          </div>

          {roundWin > 0 && (
            <div style={{ marginTop:4, display:"flex", justifyContent:"center" }}>
              <div style={{
                background:"rgba(0,0,0,.28)", color:"#ffe066",
                fontWeight:800, fontSize:10, padding:"4px 10px",
                borderRadius:12, border:"1px solid rgba(255,255,255,.12)",
                minWidth:90, textAlign:"center",
              }}>
                WIN ₱{roundWin.toFixed(2)}
              </div>
            </div>
          )}

          {/* Big Win overlay */}
          {showWin && (
            <div style={{
              position:"absolute", inset:0, display:"flex", alignItems:"center",
              justifyContent:"center", background:"rgba(0,0,0,.45)", borderRadius:16,
              zIndex:20, backdropFilter:"blur(4px)",
            }}>
              <div style={{ textAlign:"center", animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)" }}>
                <div style={{
                  fontWeight:900, fontSize:"clamp(22px,7vw,50px)",
                  background:"linear-gradient(135deg,#ffd700,#ff6b35,#ffd700)",
                  WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                  filter:"drop-shadow(0 0 20px rgba(255,215,0,.8))",
                  letterSpacing:3, textTransform:"uppercase",
                }}>
                  {winLevel === "scatter" ? "🍭 SCATTER BONUS! 🍭" : winLevel === "epic" ? "⚡ EPIC WIN! ⚡" : winLevel === "mega" ? "🌟 MEGA WIN! 🌟" : "🎊 BIG WIN! 🎊"}
                </div>
                <div style={{ fontSize:"clamp(16px,4vw,32px)", fontWeight:900, color:"#fff", marginTop:6 }}>
                  {winLevel === "scatter" ? `🎰 ${freeSpins} FREE SPINS` : `₱${roundWin.toFixed(2)}`}
                </div>
                <button onClick={() => setShowWin(false)} style={{
                  marginTop:16, padding:"12px 28px", borderRadius:18, border:"none",
                  cursor:"pointer", fontWeight:900, fontSize:16, color:"#fff",
                  background:"linear-gradient(135deg,#ff6b35,#ff0080)",
                  boxShadow:"0 6px 20px rgba(255,0,120,.45)", letterSpacing:1,
                }}>SPIN NOW ▶</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div style={{ width:"100%", padding:"0 8px 10px", zIndex:10, flexShrink:0 }}>
        <div style={{
          background:"rgba(20,10,40,0.82)", backdropFilter:"blur(14px)",
          borderRadius:18, border:"2px solid rgba(255,255,255,.18)",
          boxShadow:"0 -2px 20px rgba(0,0,0,.35)",
          padding:"8px 10px 8px", display:"flex", flexDirection:"column", gap:7,
        }}>
          <div style={{ display:"flex", gap:6 }}>
            <button onClick={handleBuyFreeSpins} style={{
              flex:1, background:"linear-gradient(135deg,#e74c3c,#c0392b)",
              border:"2px solid rgba(255,120,100,.5)", borderRadius:13, padding:"8px 4px",
              color:"#fff", fontWeight:900, fontSize:10, cursor:"pointer", letterSpacing:.5,
              boxShadow:"0 4px 16px rgba(231,76,60,.5)", lineHeight:1.3, textAlign:"center",
            }}>
              <div style={{ fontSize:8, opacity:.85, fontWeight:700 }}>BUY</div>
              <div style={{ fontSize:11, fontWeight:900 }}>FREE SPINS</div>
              <div style={{ fontSize:13, fontWeight:900, color:"#ffe066" }}>₱{(bet * 100).toFixed(2)}</div>
            </button>

            <button onClick={() => doSpin(false)} disabled={spinning} style={{
              flex:2.2,
              background: spinning ? "rgba(100,60,80,.5)" : inFreeSpins ? "linear-gradient(135deg,#f39c12,#e74c3c)" : "linear-gradient(135deg,#e74c3c,#9b0000,#e74c3c)",
              border: spinning ? "none" : "2.5px solid rgba(255,180,160,.5)",
              borderRadius:60, padding:"0",
              color: spinning ? "rgba(200,150,150,.5)" : "#fff",
              fontWeight:900, fontSize:17, cursor: spinning ? "not-allowed" : "pointer",
              letterSpacing:2, boxShadow: spinning ? "none" : "0 6px 24px rgba(231,76,60,.6)",
              transition:"all .2s", minHeight:52, position:"relative",
            }}>
              {autoSpin && autoSpinsLeft > 0 && <AutoBadge count={autoSpinsLeft} />}
              {spinning
                ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, fontSize:14 }}>
                    <span style={{ display:"inline-block", animation:"spin .5s linear infinite" }}>🔄</span>
                    SPINNING...
                  </span>
                : inFreeSpins ? "⭐ FREE SPIN!" : "SPIN ▶"
              }
            </button>

            <button onClick={handleBuySuperSpins} style={{
              flex:1, background:"linear-gradient(135deg,#f39c12,#d35400)",
              border:"2px solid rgba(255,200,80,.45)", borderRadius:13, padding:"8px 4px",
              color:"#fff", fontWeight:900, fontSize:10, cursor:"pointer", letterSpacing:.5,
              boxShadow:"0 4px 16px rgba(243,156,18,.5)", lineHeight:1.3, textAlign:"center",
            }}>
              <div style={{ fontSize:8, opacity:.85, fontWeight:700 }}>BUY SUPER</div>
              <div style={{ fontSize:11, fontWeight:900 }}>FREE SPINS</div>
              <div style={{ fontSize:13, fontWeight:900, color:"#ffe066" }}>₱{(bet * 500).toFixed(2)}</div>
            </button>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
            <span style={{ fontSize:9, color:"rgba(255,200,180,.8)", fontWeight:700, letterSpacing:1, flexShrink:0 }}>BET:</span>
            <div style={{ display:"flex", gap:3, flexWrap:"wrap", flex:1 }}>
              {BET_OPTS.map(v => (
                <button key={v} onClick={() => !spinning && setBet(v)} style={{
                  background: bet === v ? "linear-gradient(135deg,#e74c3c,#c0392b)" : "rgba(255,255,255,.1)",
                  border: bet === v ? "1.5px solid #e74c3c" : "1.5px solid rgba(255,255,255,.18)",
                  borderRadius:7, padding:"3px 7px",
                  color: bet === v ? "#fff" : "rgba(255,220,200,.85)",
                  fontWeight:700, fontSize:9, cursor:"pointer",
                  boxShadow: bet === v ? "0 2px 8px rgba(192,57,43,.5)" : "none",
                  transition:"all .15s",
                }}>₱{v.toFixed(2)}</button>
              ))}
            </div>
          </div>

          <div style={{ display:"flex", gap:5, alignItems:"center" }}>
            <button onClick={() => setTurbo(t => !t)} style={{
              flex:1,
              background: turbo ? "linear-gradient(135deg,#f39c12,#e67e22)" : "rgba(255,255,255,.1)",
              border: turbo ? "1.5px solid #f39c12" : "1.5px solid rgba(255,255,255,.18)",
              borderRadius:10, padding:"7px 4px",
              color: turbo ? "#fff" : "rgba(255,220,200,.85)",
              fontWeight:700, fontSize:10, cursor:"pointer",
            }}>⚡ {turbo ? "TURBO ON" : "TURBO"}</button>

            <button onClick={handleAutoSpin} style={{
              flex:1, position:"relative",
              background: autoSpin ? "linear-gradient(135deg,#27ae60,#1e8449)" : "rgba(255,255,255,.1)",
              border: autoSpin ? "1.5px solid #27ae60" : "1.5px solid rgba(255,255,255,.18)",
              borderRadius:10, padding:"7px 4px",
              color: autoSpin ? "#fff" : "rgba(255,220,200,.85)",
              fontWeight:700, fontSize:10, cursor:"pointer",
            }}>
              {autoSpin && autoSpinsLeft > 0 && <AutoBadge count={autoSpinsLeft} />}
              🔁 {autoSpin ? `STOP (${autoSpinsLeft})` : "AUTO ×10"}
            </button>

            <button onClick={() => setDcOn(d => !d)} style={{
              flex:1,
              background: dcOn ? "linear-gradient(135deg,#3498db,#1a5276)" : "rgba(255,255,255,.1)",
              border: dcOn ? "1.5px solid #3498db" : "1.5px solid rgba(255,255,255,.18)",
              borderRadius:10, padding:"7px 4px",
              color: dcOn ? "#fff" : "rgba(255,220,200,.85)",
              fontWeight:700, fontSize:10, cursor:"pointer",
            }}>🎯 {dcOn ? "2×CHANCE" : "DBL CHANCE"}</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin         { to { transform:rotate(360deg); } }
        @keyframes pulse        { from { opacity:.6; } to { opacity:1; } }
        @keyframes explode      { from { transform:scale(.5); opacity:1; } to { transform:scale(2.5); opacity:0; } }
        @keyframes dropIn       { from { transform:translateY(-28px) scale(.7); opacity:0; } to { transform:translateY(0) scale(1); opacity:1; } }
        @keyframes popIn        { from { transform:scale(.4); opacity:0; } to { transform:scale(1); opacity:1; } }
        @keyframes tickerScroll { 0% { transform:translateX(0); } 100% { transform:translateX(-33.33%); } }
      `}</style>
    </div>
  );
}