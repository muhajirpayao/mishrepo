import { useState, useEffect, useRef } from "react";

/* ─── TOKENS ───────────────────────────────────────────────── */
const G = {
  sideBg:      "#0f2418",
  mainBg:      "#0d2217",
  cardBg:      "#122b1e",
  border:      "rgba(255,255,255,0.07)",
  green:       "#27ae60",
  greenDark:   "#1e8449",
  gold:        "#f0c040",
  pink:        "#e8507a",
  pinkDark:    "#c0305a",
  red:         "#e74c3c",
};

/* ─── BEAD ROAD ─────────────────────────────────────────────── */
const RAW_BEADS = "rrbbrbrbrrbrbrrbrrbrrbrrbrbbbrrrbrr";
function BeadRoad() {
  const cols = 17;
  const grid = [];
  let col = 0, row = 0;
  for (const v of RAW_BEADS) {
    if (!grid[col]) grid[col] = [];
    grid[col][row] = v;
    row++;
    if (row >= 6) { row = 0; col++; }
  }
  const color = c => c === "r" ? "#e55" : c === "g" ? "#2ecc71" : "#38f";
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {Array.from({ length: cols }, (_, ci) => (
        <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from({ length: 6 }, (_, ri) => {
            const v = grid[ci]?.[ri];
            return (
              <div key={ri} style={{
                width: 12, height: 12, borderRadius: "50%",
                background: v ? color(v) : "transparent",
                border: v ? "none" : "1px solid rgba(255,255,255,0.08)",
              }} />
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ─── DEALER SVG ────────────────────────────────────────────── */
function DealerIllustration({ color = "#c0392b" }) {
  return (
    <svg viewBox="0 0 320 280" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <ellipse cx="160" cy="248" rx="185" ry="42" fill="#1a5c38" opacity="0.7" />
      <ellipse cx="160" cy="242" rx="168" ry="33" fill="#1e7045" opacity="0.5" />
      <text x="88" y="245" fontSize="11" fill="rgba(255,255,255,0.25)" fontWeight="600">PLAYER</text>
      <text x="183" y="245" fontSize="11" fill="rgba(255,255,255,0.25)" fontWeight="600">BANKER</text>
      <rect x="128" y="120" width="64" height="95" rx="4" fill={color} />
      <path d="M128 162 Q160 174 192 162 L197 215 H123Z" fill={color} opacity="0.6" />
      <ellipse cx="115" cy="150" rx="13" ry="34" fill={color} transform="rotate(-10 115 150)" />
      <ellipse cx="205" cy="150" rx="13" ry="34" fill={color} transform="rotate(10 205 150)" />
      <ellipse cx="108" cy="182" rx="10" ry="8" fill="#f5c5a0" />
      <ellipse cx="212" cy="182" rx="10" ry="8" fill="#f5c5a0" />
      <rect x="148" y="100" width="24" height="24" rx="8" fill="#f5c5a0" />
      <ellipse cx="160" cy="88" rx="28" ry="30" fill="#f5c5a0" />
      <ellipse cx="160" cy="65" rx="28" ry="15" fill="#2c1810" />
      <path d="M132 80 Q126 102 130 125" stroke="#2c1810" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M188 80 Q194 102 190 125" stroke="#2c1810" strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="152" cy="89" rx="3.5" ry="4" fill="#6b3a2a" />
      <ellipse cx="168" cy="89" rx="3.5" ry="4" fill="#6b3a2a" />
      <path d="M153 100 Q160 107 167 100" stroke="#c06060" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <rect x="138" y="175" width="15" height="20" rx="2" fill="#fff" stroke="#ddd" strokeWidth="0.5" />
      <rect x="157" y="175" width="15" height="20" rx="2" fill="#fff" stroke="#ddd" strokeWidth="0.5" />
      <text x="141" y="188" fontSize="8" fill="#e74c3c" fontWeight="700">A</text>
      <text x="160" y="188" fontSize="8" fill="#2c3e50" fontWeight="700">K</text>
    </svg>
  );
}

/* ─── SLIDES DATA ───────────────────────────────────────────── */
const SLIDES = [
  {
    bg: "linear-gradient(135deg,#0a2e20 0%,#134a2f 60%,#0d3525 100%)",
    title: "BACCARAT", titleColor: "#f5e642",
    room: "EDHS01-Commission", bet: "50-100k", players: 56,
    tableCode: "E009", dealerColor: "#c0392b",
    p: ["#3498db", 31], b: ["#e74c3c", 21], t: ["#27ae60", 8], hand: "#61",
  },
  {
    bg: "linear-gradient(135deg,#2a0a10 0%,#4a1328 60%,#350d20 100%)",
    title: "ROULETTE", titleColor: "#f0c040",
    room: "VIP-GOLD9", bet: "500-1M", players: 42,
    tableCode: "R009", dealerColor: "#8e44ad",
    p: ["#3498db", 18], b: ["#e74c3c", 21], t: ["#27ae60", 3], hand: "#22",
  },
  {
    bg: "linear-gradient(135deg,#0a1a3a 0%,#132e5a 60%,#0d2245 100%)",
    title: "DRAGON TIGER", titleColor: "#ff7043",
    room: "DT01-CLASSIC", bet: "200-500k", players: 88,
    tableCode: "DT01", dealerColor: "#e67e22",
    p: ["#3498db", 30], b: ["#e74c3c", 14], t: ["#27ae60", 1], hand: "#44",
  },
];

/* ─── HERO SLIDE ────────────────────────────────────────────── */
function HeroSlide({ slide }) {
  return (
    <div style={{
      position: "relative", borderRadius: 12, overflow: "hidden",
      background: slide.bg, display: "flex", minHeight: 240,
    }}>
      <div style={{ flex: "0 0 45%", position: "relative", overflow: "hidden" }}>
        <DealerIllustration color={slide.dealerColor} />
        <div style={{
          position: "absolute", bottom: 10, left: 14,
          color: "rgba(255,255,255,0.2)", fontSize: 20, fontWeight: 900,
          letterSpacing: 2, fontFamily: "serif",
        }}>{slide.tableCode}</div>
      </div>
      <div style={{
        flex: 1, padding: "16px 16px 14px 10px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
      }}>
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(0,0,0,0.4)", borderRadius: 20,
            padding: "2px 12px", fontSize: 9, color: "rgba(255,255,255,0.85)",
            letterSpacing: 2, marginBottom: 4,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#e74c3c", display: "inline-block", boxShadow: "0 0 6px #e74c3c" }} />
            LIVE
          </div>
          <div style={{
            fontSize: 22, fontWeight: 900, fontFamily: "'Georgia',serif",
            color: slide.titleColor, textShadow: `0 2px 20px ${slide.titleColor}80`,
            letterSpacing: 1, lineHeight: 1.1,
          }}>{slide.title}</div>
        </div>
        <div style={{
          background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20, padding: "3px 10px", fontSize: 10, color: "#ddd",
          textAlign: "center", marginBottom: 5,
        }}>{slide.room}</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 6 }}>
          <span style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "2px 9px", fontSize: 10, color: "#ccc" }}>₱{slide.bet}</span>
          <span style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20, padding: "2px 9px", fontSize: 10, color: "#aaa" }}>👤 {slide.players}</span>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", marginBottom: 6 }}>
          <span style={{ color: "#fff", fontSize: 11, opacity: 0.6 }}>{slide.hand}</span>
          {[["P", slide.p[0], slide.p[1]], ["B", slide.b[0], slide.b[1]], ["T", slide.t[0], slide.t[1]]].map(([lbl, col, val]) => (
            <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11 }}>
              <span style={{
                background: col, color: "#fff", width: 16, height: 16, borderRadius: 3,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 800,
              }}>{lbl}</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>{val}</span>
            </span>
          ))}
        </div>
        <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 6, padding: "5px 6px", marginBottom: 8, overflowX: "auto" }}>
          <BeadRoad />
        </div>
        <button style={{
          background: "linear-gradient(90deg,#e8507a,#c0305a)",
          border: "none", borderRadius: 30, padding: "10px 0", width: "100%",
          color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer",
          letterSpacing: 1, boxShadow: "0 4px 18px rgba(232,80,122,0.4)",
        }}>Play</button>
      </div>
    </div>
  );
}

/* ─── TABS ──────────────────────────────────────────────────── */
const TABS = [
  { label: "Favourite", icon: "♥" },
  { label: "Recent", icon: "🕐" },
  { label: "For U", icon: "⭐", active: true },
  { label: "Jackpot", icon: "🔥" },
  { label: "New", icon: "Ⓝ" },
  { label: "Baccarat", icon: "9" },
  { label: "BlackJack", icon: "🂡" },
  { label: "Live Slots", icon: "▦" },
];

/* ─── GAME CARDS ─────────────────────────────────────────────── */
function ColorGameCard() {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", flex: 1, minWidth: 0 }}>
      <div style={{
        background: "linear-gradient(180deg,#b71c1c 0%,#880e4f 50%,#4a148c 100%)",
        padding: "14px 10px 0", minHeight: 160,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, marginBottom: 3 }}>
          {[["C","#f44336"],["O","#ff9800"],["L","#ffeb3b"],["O","#4caf50"],["R","#2196f3"]].map(([c, col], i) => (
            <span key={i} style={{
              background: col, color: "#fff", width: 22, height: 22, borderRadius: 3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.4)",
            }}>{c}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2, marginBottom: 7 }}>
          {[["G","#9c27b0"],["A","#e91e63"],["M","#ff5722"],["E","#795548"]].map(([c, col], i) => (
            <span key={i} style={{
              background: col, color: "#fff", width: 22, height: 22, borderRadius: 3,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 900, fontSize: 12, boxShadow: "0 2px 5px rgba(0,0,0,0.4)",
            }}>{c}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
          {["#f44336","#ff9800","#ffeb3b","#4caf50","#2196f3","#9c27b0"].map((c, i) => (
            <div key={i} style={{ width: 11, height: 11, borderRadius: "50%", background: c, boxShadow: `0 0 6px ${c}` }} />
          ))}
        </div>
        <div style={{ fontSize: 30 }}>🎭</div>
      </div>
      <div style={{ background: "rgba(0,0,0,0.75)", padding: "4px 8px" }}>
        <span style={{ color: "#f39c12", fontSize: 10, fontWeight: 700 }}>Jackpot ₱ 24,985,965.65</span>
      </div>
    </div>
  );
}

function BlackjackCard() {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", flex: 1, minWidth: 0 }}>
      <div style={{
        background: "linear-gradient(180deg,#1a0008 0%,#3d0010 50%,#1a000a 100%)",
        minHeight: 185, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "10px 8px", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 7, left: 7,
          background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,200,80,0.4)",
          borderRadius: 4, padding: "2px 5px",
          display: "flex", alignItems: "center", gap: 3,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f0c040", display: "inline-block" }} />
          <span style={{ fontSize: 8, color: "#f0c040", fontWeight: 700, letterSpacing: 1 }}>VOICE CHAT</span>
        </div>
        <div style={{ display: "flex", marginBottom: 6, position: "relative", height: 60 }}>
          {[["A","♠","#111"],["J","♠","#111"],["A","♦","#c00"]].map(([v, s, c], i) => (
            <div key={i} style={{
              width: 36, height: 50, background: "#fff", borderRadius: 3,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between",
              padding: "2px 3px",
              transform: `rotate(${(i-1)*12}deg) translateX(${(i-1)*4}px)`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
              position: "absolute", left: i * 22,
            }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: c, alignSelf: "flex-start", lineHeight: 1 }}>{v}</span>
              <span style={{ fontSize: 14, color: c }}>{s}</span>
              <span style={{ fontSize: 9, fontWeight: 900, color: c, alignSelf: "flex-end", transform: "rotate(180deg)", lineHeight: 1 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{
          fontSize: 46, fontWeight: 900, color: "#e74c3c",
          textShadow: "0 0 30px rgba(231,76,60,0.8)",
          lineHeight: 1, fontFamily: "serif", marginBottom: 2,
        }}>21</div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#27ae60", display: "inline-block", boxShadow: "0 0 6px #27ae60" }} />
          <span style={{ fontSize: 8, color: "#27ae60", fontWeight: 700, letterSpacing: 2 }}>LIVE</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", letterSpacing: 2 }}>BLACKJACK</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: 2, marginTop: 1 }}>BET BEHIND</div>
      </div>
    </div>
  );
}

function BathalaCard() {
  return (
    <div style={{ borderRadius: 10, overflow: "hidden", cursor: "pointer", flex: 1, minWidth: 0 }}>
      <div style={{
        background: "linear-gradient(180deg,#1a0a00 0%,#4a2800 40%,#8b4513 70%,#4a2800 100%)",
        minHeight: 185, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "8px", position: "relative",
      }}>
        <div style={{
          position: "absolute", top: 5, right: 5,
          background: "linear-gradient(135deg,#f39c12,#e67e22)",
          borderRadius: 4, padding: "2px 6px",
          fontSize: 9, fontWeight: 900, color: "#fff",
        }}>50000×</div>
        <div style={{
          position: "absolute", top: 5, left: 7,
          fontSize: 8, color: "rgba(255,200,100,0.5)", fontWeight: 700, letterSpacing: 2,
        }}>SIIC</div>
        <div style={{ fontSize: 48, marginBottom: 2 }}>🧙</div>
        <div style={{
          fontSize: 20, fontWeight: 900, fontFamily: "serif",
          background: "linear-gradient(90deg,#f39c12,#f0c040,#e67e22)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: 2, marginBottom: 5,
        }}>BATHALA</div>
        <div style={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
          {[["5×","#27ae60"],["12×","#3498db"],["50×","#e74c3c"],["500×","#9b59b6"]].map(([v, c]) => (
            <span key={v} style={{
              background: c, color: "#fff", fontSize: 8, fontWeight: 800,
              padding: "2px 4px", borderRadius: 3,
            }}>{v}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── MINI CARD ─────────────────────────────────────────────── */
function MiniCard({ game }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 10, overflow: "hidden", cursor: "pointer",
        background: game.bg, position: "relative",
        transform: hov ? "translateY(-3px)" : "none",
        transition: "transform 0.2s",
        boxShadow: hov ? "0 10px 25px rgba(0,0,0,0.5)" : "0 3px 10px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{
        padding: "16px 8px 10px", minHeight: 120,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", position: "relative",
      }}>
        <span style={{
          position: "absolute", top: 5, left: 5,
          background: game.label === "LIVE" ? "#e74c3c" : game.label === "NEW" ? "#27ae60" : "#e67e22",
          color: "#fff", fontSize: 8, fontWeight: 800, padding: "2px 5px", borderRadius: 3,
        }}>{game.label}</span>
        <span style={{ fontSize: 36, marginBottom: 4 }}>{game.e}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "center" }}>{game.name}</span>
      </div>
      {hov && (
        <div style={{
          position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)",
          display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10,
        }}>
          <span style={{
            background: "#f0c040", color: "#111",
            fontWeight: 800, fontSize: 11, padding: "7px 16px", borderRadius: 20,
          }}>PLAY NOW</span>
        </div>
      )}
    </div>
  );
}

/* ─── NAV ITEMS ─────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: "🏠", label: "Home" },
  { icon: "🎮", label: "Games", arrow: true },
  { icon: "🃏", label: "Baccarat 1%" },
  { icon: "💵", label: "1.5% Cash Rebate" },
  { icon: "📊", label: "98%" },
  { icon: "📹", label: "Live Games" },
  { icon: "🎰", label: "Slot Machines" },
  { icon: "🎲", label: "Slot Games" },
  { icon: "♠️", label: "Poker" },
  { icon: "🐟", label: "Fishing" },
  { icon: "⚽", label: "Sports" },
  { icon: "👥", label: "Community" },
];

/* ─── BOTTOM NAV (mobile) ───────────────────────────────────── */
const BOTTOM_NAV = [
  { icon: "🏠", label: "Home" },
  { icon: "🎮", label: "Games" },
  { icon: "🎁", label: "Promo" },
  { icon: "💬", label: "Support" },
  { icon: "👤", label: "Profile" },
];

/* ─── LOGO ──────────────────────────────────────────────────── */
function Logo() {
  const letters = [["C","#e74c3c"],["A","#e67e22"],["S","#f1c40f"],["I","#2ecc71"],["N","#3498db"],["O","#9b59b6"]];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{
        background: "#fff", borderRadius: 5, padding: "3px 5px",
        display: "flex", gap: 1, alignItems: "center",
      }}>
        {letters.map(([c, col], i) => (
          <span key={i} style={{ color: col, fontWeight: 900, fontSize: 13, lineHeight: 1 }}>{c}</span>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ color: "#f0c040", fontWeight: 900, fontSize: 14, letterSpacing: 0.5 }}>PLUS</span>
      </div>
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────────── */
export default function CasinoPlus() {
  const [slide, setSlide] = useState(0);
  const [activeTab, setActiveTab] = useState("For U");
  const [activeNav, setActiveNav] = useState("Home");
  const [activeBottom, setActiveBottom] = useState("Home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  const MINI_GAMES = [
    { e: "🐉", name: "Fortune Dragon", label: "NEW", bg: "linear-gradient(135deg,#7b0000,#c0392b)" },
    { e: "🐸", name: "Golden Toad",    label: "HOT", bg: "linear-gradient(135deg,#004d00,#27ae60)" },
    { e: "🔮", name: "Mega Ball",      label: "LIVE", bg: "linear-gradient(135deg,#00008b,#2980b9)" },
    { e: "🎣", name: "Fishing God",    label: "NEW", bg: "linear-gradient(135deg,#003333,#1abc9c)" },
    { e: "🎡", name: "Lucky Wheel",    label: "HOT", bg: "linear-gradient(135deg,#7d4a00,#f39c12)" },
    { e: "🥊", name: "Fight Night",    label: "LIVE", bg: "linear-gradient(135deg,#3d003d,#8e44ad)" },
  ];

  return (
    <div style={{
      display: "flex",
      minHeight: "100vh",
      background: G.mainBg,
      fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif",
      color: "#fff",
      fontSize: 14,
      position: "relative",
    }}>

      {/* ── MOBILE OVERLAY ──────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
            zIndex: 40, display: "none",
          }}
          className="mobile-overlay"
        />
      )}

      {/* ── SIDEBAR (desktop always / mobile drawer) ─ */}
      <aside style={{
        width: 220, minWidth: 220,
        background: G.sideBg,
        borderRight: `1px solid ${G.border}`,
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
        flexShrink: 0,
        zIndex: 50,
      }} className="sidebar">
        {/* Logo */}
        <div style={{
          padding: "16px 16px 12px",
          borderBottom: `1px solid ${G.border}`,
        }}>
          <Logo />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, paddingTop: 4 }}>
          {NAV_ITEMS.map(({ icon, label, arrow }) => {
            const isActive = activeNav === label;
            return (
              <div
                key={label}
                onClick={() => { setActiveNav(label); setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 16px", cursor: "pointer",
                  background: isActive ? "rgba(27,110,60,0.45)" : "transparent",
                  borderRadius: isActive ? "0 6px 6px 0" : 0,
                  borderLeft: isActive ? "3px solid #27ae60" : "3px solid transparent",
                  color: isActive ? "#7deba8" : "rgba(255,255,255,0.7)",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 16, opacity: 0.85, flexShrink: 0 }}>{icon}</span>
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1 }}>{label}</span>
                {arrow && <span style={{ fontSize: 11, opacity: 0.4 }}>▼</span>}
              </div>
            );
          })}
        </nav>

        <div style={{
          padding: "8px 14px",
          borderTop: `1px solid ${G.border}`,
          fontSize: 9, color: "rgba(255,255,255,0.25)",
          textAlign: "center", lineHeight: 1.6,
        }}>
          CasinoPlus © 2025
        </div>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 14px",
          background: "rgba(0,0,0,0.2)",
          borderBottom: `1px solid ${G.border}`,
          position: "sticky", top: 0, zIndex: 10,
          backdropFilter: "blur(8px)",
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.7)", fontSize: 22, padding: 0,
              display: "none", flexShrink: 0,
            }}
            className="hamburger"
          >☰</button>

          {/* Mobile Logo */}
          <div className="mobile-logo" style={{ display: "none", flexShrink: 0 }}>
            <Logo />
          </div>

          {/* Search */}
          <div style={{
            flex: 1, display: "flex", alignItems: "center",
            background: "rgba(255,255,255,0.06)",
            borderRadius: 30, padding: "8px 14px", gap: 8,
            border: `1px solid ${G.border}`,
            minWidth: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              placeholder="Search Games"
              style={{
                background: "none", border: "none", outline: "none",
                color: "#fff", fontSize: 13, flex: 1, minWidth: 0,
                caretColor: "#27ae60",
              }}
            />
          </div>

          <button style={{
            background: "linear-gradient(135deg,#27ae60,#1e8449)",
            border: "none", borderRadius: 30, padding: "8px 16px",
            color: "#fff", fontWeight: 700, fontSize: 12,
            cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
            boxShadow: "0 3px 12px rgba(39,174,96,0.35)",
          }}>Login/Register</button>

          <button style={{
            background: "none", border: "none", cursor: "pointer",
            padding: 4, color: "rgba(255,255,255,0.6)", fontSize: 19, flexShrink: 0,
          }}>🔔</button>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "14px 14px 80px" }}>

          {/* Hero */}
          <div style={{ marginBottom: 14 }}>
            <HeroSlide slide={SLIDES[slide]} />
            <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 9 }}>
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  style={{
                    width: i === slide ? 20 : 6, height: 6,
                    borderRadius: 4, border: "none", padding: 0,
                    background: i === slide ? "#27ae60" : "rgba(255,255,255,0.2)",
                    cursor: "pointer", transition: "all 0.3s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: "flex", gap: 4, overflowX: "auto",
            paddingBottom: 4, marginBottom: 18,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}>
            {TABS.map(({ label, icon }) => {
              const isA = activeTab === label;
              return (
                <button
                  key={label}
                  onClick={() => setActiveTab(label)}
                  style={{
                    background: isA ? "linear-gradient(135deg,#27ae60,#1e8449)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${isA ? "transparent" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 30, padding: "7px 14px",
                    color: isA ? "#fff" : "rgba(255,255,255,0.6)",
                    fontWeight: isA ? 700 : 400,
                    fontSize: 12, cursor: "pointer", whiteSpace: "nowrap",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 4,
                    boxShadow: isA ? "0 3px 14px rgba(39,174,96,0.3)" : "none",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: 11 }}>{icon}</span>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Popular Games */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: 12,
          }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff" }}>Popular Games</h2>
            <button style={{
              background: "rgba(255,255,255,0.07)",
              border: `1px solid rgba(255,255,255,0.12)`,
              borderRadius: 8, padding: "5px 14px",
              color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer",
            }}>See All</button>
          </div>

          {/* 3 featured cards */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24, overflowX: "auto" }}>
            <div style={{ flex: "0 0 calc(33.33% - 7px)", minWidth: 100 }}><ColorGameCard /></div>
            <div style={{ flex: "0 0 calc(33.33% - 7px)", minWidth: 100 }}><BlackjackCard /></div>
            <div style={{ flex: "0 0 calc(33.33% - 7px)", minWidth: 100 }}><BathalaCard /></div>
          </div>

          {/* Mini cards grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
            gap: 8,
          }}>
            {MINI_GAMES.map(g => <MiniCard key={g.name} game={g} />)}
          </div>
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ────────────────────────── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: G.sideBg,
        borderTop: `1px solid ${G.border}`,
        display: "none",
        justifyContent: "space-around",
        padding: "8px 0 12px",
        zIndex: 30,
      }} className="bottom-nav">
        {BOTTOM_NAV.map(({ icon, label }) => {
          const isA = activeBottom === label;
          return (
            <button
              key={label}
              onClick={() => setActiveBottom(label)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                color: isA ? "#27ae60" : "rgba(255,255,255,0.5)",
                fontSize: 10, fontWeight: isA ? 700 : 400,
                padding: "0 10px",
              }}
            >
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── FLOATING BUTTONS (desktop only) ─────────── */}
      <div style={{
        position: "fixed", right: 14, bottom: 80,
        display: "flex", flexDirection: "column", gap: 8, zIndex: 999,
      }} className="float-btns">
        <button style={{
          width: 54, height: 54, borderRadius: "50%",
          background: "linear-gradient(135deg,#e74c3c,#c0392b)",
          border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", color: "#fff",
          boxShadow: "0 4px 16px rgba(231,76,60,0.5)",
          fontSize: 9, fontWeight: 700, gap: 1,
        }}>
          <span style={{ fontSize: 17 }}>🎁</span>
          <span>Lucky</span>
          <span>Plus</span>
        </button>
        <button style={{
          width: 54, height: 54, borderRadius: "50%",
          background: "linear-gradient(135deg,#27ae60,#1e8449)",
          border: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", color: "#fff",
          boxShadow: "0 4px 16px rgba(39,174,96,0.5)",
          fontSize: 9, fontWeight: 700, gap: 1,
        }}>
          <span style={{ fontSize: 17 }}>💬</span>
          <span>Support</span>
        </button>
      </div>

      {/* ── RESPONSIVE CSS ────────────────────────────── */}
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .mobile-overlay { display: none !important; }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: -220px !important;
            top: 0 !important;
            height: 100vh !important;
            transition: left 0.28s cubic-bezier(0.4,0,0.2,1) !important;
            z-index: 50 !important;
          }
          .sidebar.open {
            left: 0 !important;
          }
          .hamburger { display: flex !important; }
          .mobile-logo { display: flex !important; }
          .bottom-nav { display: flex !important; }
          .float-btns { display: none !important; }
          .mobile-overlay { display: block !important; }
        }

        @media (min-width: 769px) {
          .hamburger { display: none !important; }
          .mobile-logo { display: none !important; }
          .bottom-nav { display: none !important; }
        }
      `}</style>

      {/* Mobile sidebar toggle script */}
      <SidebarScript open={sidebarOpen} />
    </div>
  );
}

function SidebarScript({ open }) {
  useEffect(() => {
    const sidebar = document.querySelector(".sidebar");
    const overlay = document.querySelector(".mobile-overlay");
    if (sidebar) {
      if (open) {
        sidebar.style.left = "0px";
        if (overlay) overlay.style.display = "block";
      } else {
        sidebar.style.left = "";
        if (overlay) overlay.style.display = "";
      }
    }
  }, [open]);
  return null;
}