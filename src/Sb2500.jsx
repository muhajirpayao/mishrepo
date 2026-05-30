import { useState, useEffect, useCallback, useRef } from "react";

import plumImg from "./assets/plum.png";
import grapeImg from "./assets/grape.png";
import melonImg from "./assets/melon.png";
import multiplierImg from "./assets/multiplier.png";

const MULT_VALUES = [5, 20, 50, 100, 1000];
const MULT_WEIGHTS = [40, 25, 15, 8, 2];

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

function fmt(n) {
  return "₱" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

function weightedRandom(multChance = 0.05) {
  if (Math.random() < multChance) {
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

function weightedRandomSuperSpin() {
  // During super spins, higher multiplier chance + heavier weighting toward high values
  const r = Math.random();
  if (r < 0.30) {
    // Force a high multiplier
    const highVals = [50, 100, 1000];
    const val = highVals[Math.floor(Math.random() * highVals.length)];
    return {
      ...makeMultiplierSymbol(),
      multValue: val,
      id: `multiplier_${val}`,
      color: val >= 1000 ? "#ffd700" : val >= 100 ? "#e74c3c" : "#f39c12",
      uid: Math.random()
    };
  }
  return weightedRandom(0.18);
}

// Win chance: ~40% normal, ~75% free/super spins
function makeGrid(winChance = 0.40, superSpin = false) {
  const symFn = superSpin ? weightedRandomSuperSpin : weightedRandom;
  const createRandom = () =>
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({ sym: symFn(), state: "idle" }))
    );

  if (Math.random() < winChance) {
    let grid = createRandom();
    const normalSymbols = SYMBOLS.filter(s => !s.scatter);
    const target = normalSymbols[Math.floor(Math.random() * normalSymbols.length)];
    const positions = [[1,1],[1,2],[1,3],[2,1],[2,2],[2,3]];
    positions.forEach(([r,c]) => {
      grid[r][c] = { sym: { ...target, uid: Math.random() }, state: "idle" };
    });
    if (superSpin && Math.random() < 0.70) {
      const multPos = [[0,0],[0,5],[4,0],[4,5],[0,3],[4,2]];
      const count = Math.random() < 0.4 ? 2 : 1;
      const used = new Set();
      for (let i = 0; i < count; i++) {
        let p;
        do { p = multPos[Math.floor(Math.random() * multPos.length)]; } while (used.has(p.toString()));
        used.add(p.toString());
        const val = [50, 100, 1000][Math.floor(Math.random() * 3)];
        grid[p[0]][p[1]] = { sym: { ...makeMultiplierSymbol(), multValue: val, id:`multiplier_${val}`, uid: Math.random() }, state:"idle" };
      }
    } else if (!superSpin && Math.random() < 0.20) {
      const multPos = [[0,0],[0,5],[4,0],[4,5]];
      const chosen = multPos[Math.floor(Math.random() * multPos.length)];
      grid[chosen[0]][chosen[1]] = { sym: { ...makeMultiplierSymbol(), uid: Math.random() }, state: "idle" };
    }
    return grid;
  }
  return createRandom();
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

function findMultiplierCells(grid) {
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c].sym.isMultiplier) cells.push({ r, c, val: grid[r][c].sym.multValue });
  return cells;
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

function ConfirmModal({ emoji, title, message, subtext, confirmLabel, confirmColor, onConfirm, onCancel }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"linear-gradient(145deg,#fff8f0,#fff)", borderRadius:24, padding:"28px 26px 22px", maxWidth:310, width:"88%", boxShadow:"0 24px 70px rgba(0,0,0,0.45)", border:"2.5px solid rgba(255,255,255,0.95)", textAlign:"center", animation:"popIn .28s cubic-bezier(.34,1.56,.64,1)" }}>
        <div style={{ fontSize:40, marginBottom:10 }}>{emoji}</div>
        <div style={{ fontWeight:900, fontSize:19, color:"#c0392b", marginBottom:6 }}>{title}</div>
        <div style={{ fontSize:13, color:"#555", marginBottom:4, lineHeight:1.55 }}>{message}</div>
        {subtext && <div style={{ fontSize:12, color:"#e67e22", fontWeight:700, marginBottom:18 }}>{subtext}</div>}
        {!subtext && <div style={{ marginBottom:18 }} />}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"11px 0", borderRadius:13, background:"rgba(200,100,130,.1)", border:"1.5px solid rgba(200,100,130,.3)", color:"#c0392b", fontWeight:700, fontSize:13, cursor:"pointer" }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:"11px 0", borderRadius:13, background: confirmColor || "linear-gradient(135deg,#e74c3c,#c0392b)", border:"none", color:"#fff", fontWeight:900, fontSize:13, cursor:"pointer", boxShadow:"0 4px 16px rgba(0,0,0,.25)" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function WinTicker() {
  const [items] = useState(() => { const s = [...WIN_NOTICES].sort(() => Math.random() - 0.5); return [...s, ...s, ...s]; });
  return (
    <div style={{ width:"100%", overflow:"hidden", background:"linear-gradient(90deg,rgba(255,80,160,.92),rgba(255,150,40,.92),rgba(255,80,160,.92))", borderBottom:"1.5px solid rgba(255,255,255,.4)", padding:"5px 0" }}>
      <div style={{ display:"flex", gap:56, animation:"tickerScroll 40s linear infinite", whiteSpace:"nowrap", width:"max-content" }}>
        {items.map((w, i) => (
          <span key={i} style={{ fontSize:12, fontWeight:700, color:"#fff", display:"inline-flex", alignItems:"center", gap:6, textShadow:"0 1px 4px rgba(0,0,0,.35)" }}>
            🎉 Congrats <strong style={{ color:"#ffe066" }}>{w.name}</strong> for winning <strong style={{ color:"#ffe066" }}>{w.amount}</strong>!
          </span>
        ))}
      </div>
    </div>
  );
}

function SymCell({ cell, isWin, isBomb, isMultWin }) {
  const s = cell.sym;
  return (
    <div style={{
      position:"relative", borderRadius:7,
      background: isWin || isMultWin ? `radial-gradient(circle at 50% 50%, ${s.color}44, ${s.color}11)` : "rgba(255,255,255,0.25)",
      border: isMultWin ? `2.5px solid #ffd700` : isWin ? `2px solid ${s.color}` : "1.5px solid rgba(255,255,255,0.45)",
      display:"flex", alignItems:"center", justifyContent:"center", aspectRatio:"1",
      boxShadow: isMultWin ? `0 0 18px #ffd70099` : isWin ? `0 0 14px ${s.color}88` : "0 1px 3px rgba(0,0,0,.07)",
      transform: isBomb ? "scale(0)" : (isWin || isMultWin) ? "scale(1.07)" : "scale(1)",
      transition:"all 0.2s cubic-bezier(.34,1.56,.64,1)", opacity: isBomb ? 0 : 1, overflow:"hidden",
      animationName: cell.state === "drop" ? "dropIn" : "none", animationDuration:"0.35s", animationTimingFunction:"cubic-bezier(.34,1.3,.64,1)",
    }}>
      <img src={s.img} alt={s.label} style={{ width: s.isMultiplier ? "100%" : "86%", height: s.isMultiplier ? "100%" : "86%", objectFit:"contain", mixBlendMode: s.isMultiplier ? "normal" : "multiply", filter: (isWin || isMultWin) ? "drop-shadow(0 0 5px white) brightness(1.1)" : "contrast(1.05) saturate(1.1)", pointerEvents:"none", display:"block" }} />
      {s.isMultiplier && (
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none" }}>
          <span style={{ fontWeight:900, fontSize: s.multValue >= 1000 ? "clamp(7px,2vw,12px)" : "clamp(8px,2.3vw,14px)", color:"#fff", textShadow:`0 0 8px ${s.color}, 0 2px 4px rgba(0,0,0,0.95)`, lineHeight:1 }}>×{s.multValue}</span>
        </div>
      )}
      {(isWin || isMultWin) && <div style={{ position:"absolute", inset:0, borderRadius:7, background:`radial-gradient(circle,${isMultWin ? "#ffd70028" : s.color+"28"},transparent)`, animation:"pulse 0.45s ease-in-out infinite alternate" }} />}
      {isBomb && <div style={{ position:"absolute", inset:-10, background:`radial-gradient(circle,${s.color}cc,transparent 70%)`, borderRadius:"50%", animation:"explode 0.35s ease-out forwards" }} />}
    </div>
  );
}

function AutoBadge({ count }) {
  return <div style={{ position:"absolute", top:-8, right:-8, background:"linear-gradient(135deg,#f39c12,#e74c3c)", color:"#fff", fontWeight:900, fontSize:11, width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", border:"2px solid #fff", boxShadow:"0 2px 8px rgba(0,0,0,.3)", zIndex:5 }}>{count}</div>;
}

export default function SweetBonanza2500() {
  const [grid, setGrid] = useState(() => makeGrid(0.40, false));
  const [balance, setBalance] = useState(20000);
  const [bet, setBet] = useState(2.00);
  const [spinning, setSpinning] = useState(false);
  const [winCells, setWinCells] = useState(new Set());
  const [bombCells, setBombCells] = useState(new Set());
  const [multWinCells, setMultWinCells] = useState(new Set());
  const [totalWin, setTotalWin] = useState(0);
  const [roundWin, setRoundWin] = useState(0);
  const [freeSpins, setFreeSpins] = useState(0);
  const [inFreeSpins, setInFreeSpins] = useState(false);
  const [isSuperSpin, setIsSuperSpin] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [winOverlay, setWinOverlay] = useState(null); // { type: "big"|"mega"|"epic"|"scatter"|"multiplier", win, boardMult, baseWin, freeCount }
  const [turbo, setTurbo] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [autoSpinsLeft, setAutoSpinsLeft] = useState(0);
  const [dcOn, setDcOn] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [message, setMessage] = useState("");

  const autoRef = useRef(false);
  const autoCountRef = useRef(0);
  const spinningRef = useRef(false);
  const winOverlayResolveRef = useRef(null);
  const isSuperSpinRef = useRef(false);

  const delay = (ms) => new Promise(r => setTimeout(r, turbo ? ms * 0.3 : ms));

  const animateSpin = async (superSpin) => {
    const frames = turbo ? 3 : 9;
    for (let f = 0; f < frames; f++) {
      setGrid(makeGrid(superSpin ? 0.75 : 0.40, superSpin));
      await delay(62);
    }
  };

  const showOverlay = (data) => {
    return new Promise(resolve => {
      winOverlayResolveRef.current = resolve;
      setWinOverlay(data);
    });
  };

  const handleOverlayClose = () => {
    setWinOverlay(null);
    if (winOverlayResolveRef.current) { winOverlayResolveRef.current(); winOverlayResolveRef.current = null; }
  };

  const doSpin = useCallback(async (isAuto = false) => {
    if (spinningRef.current) return;
    const superSpin = isSuperSpinRef.current;
    if (!inFreeSpins && balance < bet) {
      setMessage("💸 Insufficient balance!");
      setAutoSpin(false); autoCountRef.current = 0; setAutoSpinsLeft(0);
      return;
    }
    spinningRef.current = true;
    setSpinning(true);
    setWinOverlay(null);
    setWinCells(new Set()); setBombCells(new Set()); setMultWinCells(new Set());
    setRoundWin(0); setMessage("");

    if (inFreeSpins) { setFreeSpins(f => f - 1); }
    else { setBalance(b => Math.round((b - bet) * 100) / 100); }

    await animateSpin(superSpin);
    const finalGrid = makeGrid(superSpin ? 0.75 : 0.40, superSpin);
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
        autoCountRef.current -= 1; setAutoSpinsLeft(autoCountRef.current); doSpin(true);
      }
    }, 700);
    return () => clearTimeout(t);
  }, [autoSpin, spinning]);

  const processTumble = async (g, mult, accumulated) => {
    const clusters = findClusters(g);
    const scatters = countScatters(g);

    // Scatter trigger (3+ lollipops)
    if (scatters >= 3 && !inFreeSpins) {
      const fs = 10;
      setFreeSpins(fs); setInFreeSpins(true); setMultiplier(2);
      isSuperSpinRef.current = false; setIsSuperSpin(false);
      await showOverlay({ type:"scatter", freeCount: fs });
    }

    if (clusters.length === 0) {
      if (accumulated > 0) {
        const level = accumulated >= bet * 50 ? "epic" : accumulated >= bet * 20 ? "mega" : accumulated >= bet * 5 ? "big" : "";
        if (level) await showOverlay({ type: level, win: accumulated });
      }
      if (inFreeSpins) {
        setFreeSpins(prev => {
          if (prev <= 0) {
            setTimeout(() => { setInFreeSpins(false); setMultiplier(1); isSuperSpinRef.current = false; setIsSuperSpin(false); setMessage("Free Spins Ended!"); }, 400);
          }
          return prev;
        });
      }
      return;
    }

    const winning = new Set();
    clusters.forEach(cl => cl.cells.forEach(([r, c]) => winning.add(`${r},${c}`)));
    setWinCells(winning);

    let baseWin = 0;
    clusters.forEach(cl => { baseWin += clusterMultiplier(cl.sym, cl.size) * bet * mult; });
    baseWin = Math.round(baseWin * 100) / 100;

    // Multiplier ONLY fires if there was a cluster win
    const mCells = findMultiplierCells(g);
    const boardMult = mCells.length > 0 ? mCells.reduce((acc, m) => acc * m.val, 1) : 1;
    const finalWin = Math.round(baseWin * boardMult * 100) / 100;

    if (mCells.length > 0) {
      const mSet = new Set(mCells.map(m => `${m.r},${m.c}`));
      setMultWinCells(mSet);
    }

    await delay(480);
    setBombCells(new Set(winning));
    await delay(320);

    setBalance(b => Math.round((b + finalWin) * 100) / 100);
    const newAccum = Math.round((accumulated + finalWin) * 100) / 100;
    setRoundWin(newAccum);
    setTotalWin(tw => Math.round((tw + finalWin) * 100) / 100);

    // Show multiplier overlay (merged with win)
    if (mCells.length > 0 && !turbo) {
      await showOverlay({ type:"multiplier", win: finalWin, baseWin, boardMult });
    }

    await delay(280);

    const newGrid = g.map((row, ri) => row.map((cell, ci) => {
      if (winning.has(`${ri},${ci}`) || mCells.some(m => m.r === ri && m.c === ci))
        return { sym: (isSuperSpinRef.current ? weightedRandomSuperSpin : weightedRandom)(), state: "drop" };
      return { ...cell, state: "idle" };
    }));
    setGrid(newGrid);
    setWinCells(new Set()); setBombCells(new Set()); setMultWinCells(new Set());
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
      emoji:"🎰", title:"Buy Free Spins?", message:`Cost: ${fmt(cost)}`,
      subtext:"Activates 10 Free Spins!",
      confirmLabel:`Buy ${fmt(cost)}`, confirmColor:"linear-gradient(135deg,#e74c3c,#c0392b)",
      onConfirm: () => {
        setConfirm(null);
        setBalance(b => Math.round((b - cost) * 100) / 100);
        setFreeSpins(10); setInFreeSpins(true); setMultiplier(2);
        isSuperSpinRef.current = false; setIsSuperSpin(false);
        autoCountRef.current = 10; setAutoSpinsLeft(10); setAutoSpin(true);
      },
    });
  };

  const handleBuySuperSpins = () => {
    const cost = bet * 500;
    if (balance < cost) { setMessage("💸 Insufficient balance!"); return; }
    setConfirm({
      emoji:"⚡", title:"Buy SUPER Free Spins?", message:`Cost: ${fmt(cost)}`,
      subtext:"25 SUPER Spins! Big multipliers appear often!",
      confirmLabel:`Buy ${fmt(cost)}`, confirmColor:"linear-gradient(135deg,#f39c12,#e67e22)",
      onConfirm: () => {
        setConfirm(null);
        setBalance(b => Math.round((b - cost) * 100) / 100);
        setFreeSpins(25); setInFreeSpins(true); setMultiplier(5);
        isSuperSpinRef.current = true; setIsSuperSpin(true);
        autoCountRef.current = 10; setAutoSpinsLeft(10); setAutoSpin(true);
      },
    });
  };

  const handleAutoSpin = () => {
    if (autoSpin) { setAutoSpin(false); autoCountRef.current = 0; setAutoSpinsLeft(0); return; }
    setConfirm({
      emoji:"🔁", title:"Enable Auto Spin?", message:"Spins automatically 10 times.", subtext:null,
      confirmLabel:"Start (10×)", confirmColor:"linear-gradient(135deg,#27ae60,#1e8449)",
      onConfirm: () => { setConfirm(null); autoCountRef.current = 10; setAutoSpinsLeft(10); setAutoSpin(true); },
    });
  };

  // Win overlay renderer
  const renderOverlay = () => {
    if (!winOverlay) return null;
    const { type, win, baseWin, boardMult, freeCount } = winOverlay;

    const titles = { big:"🎊 BIG WIN!", mega:"🌟 MEGA WIN!", epic:"⚡ EPIC WIN!", scatter:"🍭 SCATTER BONUS!", multiplier:"⚡ MULTIPLIER WIN!" };
    const gradients = { big:"#ffd700,#ff6b35", mega:"#ffd700,#e74c3c", epic:"#ffd700,#9b59b6", scatter:"#ff69b4,#ff9f43", multiplier:"#ffd700,#ff6b00" };
    const title = titles[type] || "WIN!";
    const grad = gradients[type] || "#ffd700,#ff6b35";

    return (
      <div style={{ position:"fixed", inset:0, zIndex:9990, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,.6)", backdropFilter:"blur(6px)" }}>
        <div style={{ textAlign:"center", animation:"popIn .35s cubic-bezier(.34,1.56,.64,1)", padding:"0 20px", maxWidth:340, width:"90%" }}>
          <div style={{ fontWeight:900, fontSize:"clamp(20px,6vw,38px)", background:`linear-gradient(135deg,${grad})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", filter:`drop-shadow(0 0 18px rgba(255,215,0,.8))`, letterSpacing:2, textTransform:"uppercase", marginBottom:10 }}>
            {title}
          </div>

          {type === "scatter" ? (
            <div style={{ color:"#fff", fontWeight:900, fontSize:"clamp(18px,5vw,30px)", marginBottom:16 }}>
              🎰 {freeCount} FREE SPINS!
            </div>
          ) : type === "multiplier" ? (
            <div style={{ background:"rgba(0,0,0,.4)", borderRadius:16, padding:"12px 16px", marginBottom:16, border:"1px solid rgba(255,215,0,.3)" }}>
              <div style={{ color:"rgba(255,255,255,.7)", fontSize:11, marginBottom:4 }}>BASE WIN × MULTIPLIER</div>
              <div style={{ color:"#fff", fontWeight:800, fontSize:"clamp(14px,4vw,20px)", marginBottom:6 }}>
                {fmt(baseWin)} × {boardMult}
              </div>
              <div style={{ color:"#ffd700", fontWeight:900, fontSize:"clamp(22px,6.5vw,40px)", filter:"drop-shadow(0 0 10px rgba(255,215,0,.8))", lineHeight:1 }}>
                {fmt(win)}
              </div>
              <div style={{ color:"rgba(255,255,255,.55)", fontSize:10, marginTop:4 }}>BET: {fmt(bet)}</div>
            </div>
          ) : (
            <div style={{ color:"#ffd700", fontWeight:900, fontSize:"clamp(24px,7vw,46px)", filter:"drop-shadow(0 0 12px rgba(255,215,0,.8))", marginBottom:16, lineHeight:1 }}>
              {fmt(win)}
            </div>
          )}

          <button onClick={handleOverlayClose} style={{ padding:"11px 32px", borderRadius:18, border:"none", cursor:"pointer", fontWeight:900, fontSize:15, color:"#fff", background:`linear-gradient(135deg,${grad})`, boxShadow:"0 6px 20px rgba(0,0,0,.4)", letterSpacing:1 }}>
            {type === "scatter" ? "SPIN NOW ▶" : "SPIN ▶"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width:"100vw", height:"100vh", overflow:"hidden", position:"fixed", top:0, left:0, backgroundImage:`url('https://images.api.kansino.nl/cms/PRG_Sweet_Bonanza1000_bg_7c4f5e878a.jpg')`, backgroundSize:"cover", backgroundPosition:"center", display:"flex", flexDirection:"column", alignItems:"center", fontFamily:"'Segoe UI',sans-serif" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(60,160,255,0.1)", pointerEvents:"none", zIndex:1 }} />

      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
      {renderOverlay()}

      <div style={{ width:"100%", zIndex:20, flexShrink:0 }}><WinTicker /></div>

      {/* HEADER */}
      <div style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 10px 0", zIndex:10, flexShrink:0 }}>
        <div style={{ display:"flex", gap:5 }}>
          {[["CREDIT", fmt(balance), "#c0392b"], ["WIN", fmt(totalWin), "#27ae60"]].map(([lbl,val,col]) => (
            <div key={lbl} style={{ background:"rgba(255,255,255,.85)", backdropFilter:"blur(8px)", borderRadius:9, padding:"3px 9px", border:"1.5px solid rgba(255,255,255,.95)" }}>
              <div style={{ fontSize:7, color:"rgba(80,20,50,.55)", fontWeight:700, letterSpacing:1 }}>{lbl}</div>
              <div style={{ fontSize:13, fontWeight:900, color:col }}>{val}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign:"center", flex:1 }}>
          <div style={{ fontWeight:900, fontSize:"clamp(15px,4vw,26px)", background:"linear-gradient(135deg,#ff6bcd,#ff9f43,#ff6bcd)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:2, filter:"drop-shadow(0 2px 8px rgba(255,107,205,.7))" }}>Sweet Bonanza</div>
          <div style={{ fontSize:7, color:"rgba(80,10,50,.65)", letterSpacing:3, fontWeight:700 }}>2500 • PRAGMATIC PLAY</div>
        </div>
        <div style={{ display:"flex", gap:5, alignItems:"center" }}>
          {inFreeSpins && <div style={{ background:"linear-gradient(135deg,#8e44ad,#6c3483)", borderRadius:9, padding:"3px 9px", textAlign:"center", border:"1.5px solid rgba(255,255,255,.4)" }}>
            <div style={{ fontSize:7, color:"rgba(255,255,255,.7)", fontWeight:700 }}>×MULT</div>
            <div style={{ fontSize:13, fontWeight:900, color:"#ffd700" }}>×{multiplier}</div>
          </div>}
          {inFreeSpins && <div style={{ background:"linear-gradient(135deg,#e74c3c,#c0392b)", borderRadius:9, padding:"3px 9px", textAlign:"center", border:"1.5px solid rgba(255,255,255,.4)" }}>
            <div style={{ fontSize:7, color:"rgba(255,255,255,.7)", fontWeight:700 }}>{isSuperSpin ? "SUPER" : "FREE"}</div>
            <div style={{ fontSize:13, fontWeight:900, color:"#fff" }}>{freeSpins}</div>
          </div>}
          <div style={{ background:"rgba(255,255,255,.85)", backdropFilter:"blur(8px)", borderRadius:9, padding:"3px 9px", border:"1.5px solid rgba(255,255,255,.95)", textAlign:"right" }}>
            <div style={{ fontSize:7, color:"rgba(80,20,50,.55)", fontWeight:700, letterSpacing:1 }}>BET</div>
            <div style={{ fontSize:13, fontWeight:900, color:"#c0392b" }}>{fmt(bet)}</div>
          </div>
        </div>
      </div>

      {inFreeSpins && (
        <div style={{ background: isSuperSpin ? "linear-gradient(135deg,#f39c12,#8e44ad)" : "linear-gradient(135deg,#f39c12,#e74c3c)", color:"#fff", fontWeight:900, fontSize:11, padding:"3px 14px", borderRadius:20, boxShadow:"0 3px 14px rgba(231,76,60,.5)", marginTop:4, letterSpacing:1, zIndex:10, animation:"pulse .6s ease-in-out infinite alternate", flexShrink:0 }}>
          {isSuperSpin ? "⚡ SUPER SPINS" : "⭐ FREE SPINS"}: {freeSpins} left • ×{multiplier}
          {autoSpin && autoSpinsLeft > 0 && ` • Auto: ${autoSpinsLeft}`}
        </div>
      )}
      {message && <div style={{ fontSize:11, color:"#ffe066", fontWeight:800, marginTop:2, textShadow:"0 1px 4px rgba(0,0,0,.6)", zIndex:10, flexShrink:0 }}>{message}</div>}

      {/* GRID */}
      <div style={{ flex:1, width:"100%", padding:"5px 8px 4px", position:"relative", zIndex:10, minHeight:0, display:"flex", flexDirection:"column" }}>
        <div style={{ flex:1, minHeight:0, background:"rgba(173,225,255,0.50)", backdropFilter:"blur(10px)", borderRadius:16, border:"2.5px solid rgba(255,255,255,.8)", boxShadow:"0 6px 32px rgba(100,180,255,.28), inset 0 1px 0 rgba(255,255,255,.7)", padding:"6px 6px 4px", position:"relative", display:"flex", flexDirection:"column" }}>
          {[["top:3px","left:5px"],["top:3px","right:5px"],["bottom:3px","left:5px"],["bottom:3px","right:5px"]].map(([v,h],i)=>(
            <span key={i} style={{ position:"absolute", fontSize:12, zIndex:2, ...Object.fromEntries([[v.split(":")[0],v.split(":")[1]],[h.split(":")[0],h.split(":")[1]]]) }}>🍬</span>
          ))}

          <div style={{ flex:1, minHeight:0, display:"grid", gridTemplateColumns:`repeat(${COLS},1fr)`, gridTemplateRows:`repeat(${ROWS},1fr)`, gap:4 }}>
            {grid.map((row, ri) => row.map((cell, ci) => (
              <SymCell key={`${ri}-${ci}-${cell.sym.uid}`} cell={cell} isWin={winCells.has(`${ri},${ci}`)} isBomb={bombCells.has(`${ri},${ci}`)} isMultWin={multWinCells.has(`${ri},${ci}`)} />
            )))}
          </div>

          {roundWin > 0 && (
            <div style={{ marginTop:4, display:"flex", justifyContent:"center" }}>
              <div style={{ background:"rgba(0,0,0,.28)", color:"#ffe066", fontWeight:800, fontSize:10, padding:"4px 10px", borderRadius:12, border:"1px solid rgba(255,255,255,.12)", minWidth:90, textAlign:"center" }}>
                WIN {fmt(roundWin)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CONTROLS */}
      <div style={{ width:"100%", padding:"0 8px 10px", zIndex:10, flexShrink:0 }}>
        <div style={{ background:"rgba(20,10,40,0.82)", backdropFilter:"blur(14px)", borderRadius:18, border:"2px solid rgba(255,255,255,.18)", boxShadow:"0 -2px 20px rgba(0,0,0,.35)", padding:"8px 10px 8px", display:"flex", flexDirection:"column", gap:6 }}>

          {/* BUY + SPIN ROW */}
          <div style={{ display:"flex", gap:5, alignItems:"stretch" }}>
            {/* BUY FREE SPINS */}
            <button onClick={handleBuyFreeSpins} style={{ flex:"0 0 72px", background:"linear-gradient(135deg,#e74c3c,#c0392b)", border:"1.5px solid rgba(255,120,100,.5)", borderRadius:12, padding:"6px 3px", color:"#fff", fontWeight:900, cursor:"pointer", lineHeight:1.3, textAlign:"center", boxShadow:"0 3px 12px rgba(231,76,60,.5)" }}>
              <div style={{ fontSize:7, opacity:.8 }}>BUY</div>
              <div style={{ fontSize:9, fontWeight:900 }}>FREE SPINS</div>
              <div style={{ fontSize:10, fontWeight:900, color:"#ffe066", marginTop:1 }}>{fmt(bet * 100)}</div>
            </button>

            {/* SPIN BUTTON */}
            <button onClick={() => doSpin(false)} disabled={spinning} style={{ flex:1, background: spinning ? "rgba(100,60,80,.5)" : inFreeSpins ? "linear-gradient(135deg,#f39c12,#e74c3c)" : "linear-gradient(135deg,#e74c3c,#9b0000,#e74c3c)", border: spinning ? "none" : "2.5px solid rgba(255,180,160,.5)", borderRadius:50, color: spinning ? "rgba(200,150,150,.5)" : "#fff", fontWeight:900, fontSize:16, cursor: spinning ? "not-allowed" : "pointer", letterSpacing:2, boxShadow: spinning ? "none" : "0 5px 20px rgba(231,76,60,.6)", transition:"all .2s", minHeight:46, position:"relative" }}>
              {autoSpin && autoSpinsLeft > 0 && <AutoBadge count={autoSpinsLeft} />}
              {spinning ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:5, fontSize:13 }}><span style={{ display:"inline-block", animation:"spin .5s linear infinite" }}>🔄</span>SPINNING...</span> : inFreeSpins ? "⭐ FREE SPIN!" : "SPIN ▶"}
            </button>

            {/* BUY SUPER SPINS */}
            <button onClick={handleBuySuperSpins} style={{ flex:"0 0 72px", background:"linear-gradient(135deg,#f39c12,#d35400)", border:"1.5px solid rgba(255,200,80,.45)", borderRadius:12, padding:"6px 3px", color:"#fff", fontWeight:900, cursor:"pointer", lineHeight:1.3, textAlign:"center", boxShadow:"0 3px 12px rgba(243,156,18,.5)" }}>
              <div style={{ fontSize:7, opacity:.8 }}>BUY SUPER</div>
              <div style={{ fontSize:9, fontWeight:900 }}>FREE SPINS</div>
              <div style={{ fontSize:10, fontWeight:900, color:"#ffe066", marginTop:1 }}>{fmt(bet * 500)}</div>
            </button>
          </div>

          {/* BET ROW */}
          <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
            <span style={{ fontSize:9, color:"rgba(255,200,180,.8)", fontWeight:700, letterSpacing:1, flexShrink:0 }}>BET:</span>
            <div style={{ display:"flex", gap:3, flexWrap:"wrap", flex:1 }}>
              {BET_OPTS.map(v => (
                <button key={v} onClick={() => !spinning && setBet(v)} style={{ background: bet === v ? "linear-gradient(135deg,#e74c3c,#c0392b)" : "rgba(255,255,255,.1)", border: bet === v ? "1.5px solid #e74c3c" : "1.5px solid rgba(255,255,255,.18)", borderRadius:7, padding:"3px 6px", color: bet === v ? "#fff" : "rgba(255,220,200,.85)", fontWeight:700, fontSize:9, cursor:"pointer", boxShadow: bet === v ? "0 2px 8px rgba(192,57,43,.5)" : "none", transition:"all .15s" }}>₱{v.toFixed(2)}</button>
              ))}
            </div>
          </div>

          {/* UTILITY ROW */}
          <div style={{ display:"flex", gap:5 }}>
            <button onClick={() => setTurbo(t => !t)} style={{ flex:1, background: turbo ? "linear-gradient(135deg,#f39c12,#e67e22)" : "rgba(255,255,255,.1)", border: turbo ? "1.5px solid #f39c12" : "1.5px solid rgba(255,255,255,.18)", borderRadius:10, padding:"6px 4px", color: turbo ? "#fff" : "rgba(255,220,200,.85)", fontWeight:700, fontSize:10, cursor:"pointer" }}>⚡ {turbo ? "TURBO ON" : "TURBO"}</button>
            <button onClick={handleAutoSpin} style={{ flex:1, position:"relative", background: autoSpin ? "linear-gradient(135deg,#27ae60,#1e8449)" : "rgba(255,255,255,.1)", border: autoSpin ? "1.5px solid #27ae60" : "1.5px solid rgba(255,255,255,.18)", borderRadius:10, padding:"6px 4px", color: autoSpin ? "#fff" : "rgba(255,220,200,.85)", fontWeight:700, fontSize:10, cursor:"pointer" }}>
              {autoSpin && autoSpinsLeft > 0 && <AutoBadge count={autoSpinsLeft} />}
              🔁 {autoSpin ? `STOP (${autoSpinsLeft})` : "AUTO ×10"}
            </button>
            <button onClick={() => setDcOn(d => !d)} style={{ flex:1, background: dcOn ? "linear-gradient(135deg,#3498db,#1a5276)" : "rgba(255,255,255,.1)", border: dcOn ? "1.5px solid #3498db" : "1.5px solid rgba(255,255,255,.18)", borderRadius:10, padding:"6px 4px", color: dcOn ? "#fff" : "rgba(255,220,200,.85)", fontWeight:700, fontSize:10, cursor:"pointer" }}>🎯 {dcOn ? "2×CHANCE" : "DBL CHANCE"}</button>
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