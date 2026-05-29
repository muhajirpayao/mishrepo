import { useState, useEffect, useRef, useCallback } from "react";

const G = {
  sideBg:    "#0a1f14",
  mainBg:    "#0c1e14",
  cardBg:    "#0f2419",
  border:    "rgba(255,255,255,0.07)",
  green:     "#00c853",
  greenDk:   "#009624",
  gold:      "#ffd740",
  pink:      "#e8507a",
  teal:      "#00bfa5",
};

function Logo({ small }) {
  const letters = [["B","#e74c3c"],["A","#e67e22"],["P","#f1c40f"],["A","#2ecc71"],["H","#3498db"]];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:small?3:6 }}>
      <div style={{ background:"#fff", borderRadius:5, padding: small?"2px 4px":"3px 6px", display:"flex", gap:1 }}>
        {letters.map(([c,col],i)=>(
          <span key={i} style={{ color:col, fontWeight:900, fontSize:small?10:14, lineHeight:1 }}>{c}</span>
        ))}
      </div>
      <span style={{ color:G.gold, fontWeight:900, fontSize:small?11:15, letterSpacing:1 }}>CASINO</span>
    </div>
  );
}

const NAV_ITEMS = [
  { icon:"🏠", label:"Home" },
  { icon:"🎮", label:"Games" },
  { icon:"👥", label:"Community" },
  { icon:"🎁", label:"Promotions" },
  { icon:"📰", label:"News" },
  { icon:"👤", label:"Account" },
  { icon:"🌐", label:"English" },
];

function Sidebar({ active, setActive, open }) {
  return (
    <aside style={{
      width:70, background:G.sideBg,
      borderRight:`1px solid ${G.border}`,
      display:"flex", flexDirection:"column", alignItems:"center",
      position:"fixed", top:0, left: open ? 0 : -70,
      height:"100vh", zIndex:50,
      transition:"left 0.28s cubic-bezier(.4,0,.2,1)",
      overflowY:"auto",
    }}>
      <div style={{ padding:"14px 0 10px", borderBottom:`1px solid ${G.border}`, width:"100%", display:"flex", justifyContent:"center", marginBottom:6 }}>
        <div style={{ background:"#1a7a3c", borderRadius:8, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Logo small />
        </div>
      </div>
      {NAV_ITEMS.map(({ icon, label })=>{
        const isA = active===label;
        return (
          <div key={label} onClick={()=>setActive(label)} style={{
            width:"100%", display:"flex", flexDirection:"column", alignItems:"center",
            padding:"10px 0", cursor:"pointer", gap:3,
            background: isA ? "rgba(0,200,83,0.15)" : "transparent",
            borderLeft: isA ? "3px solid #00c853" : "3px solid transparent",
            color: isA ? "#00c853" : "rgba(255,255,255,0.5)",
            transition:"all 0.15s",
          }}>
            <span style={{ fontSize:18 }}>{icon}</span>
            <span style={{ fontSize:8, fontWeight: isA?700:400, letterSpacing:0.5 }}>{label}</span>
          </div>
        );
      })}
      <div style={{ marginTop:"auto", marginBottom:12 }}>
        <div style={{
          width:30, height:30, borderRadius:"50%",
          background:"rgba(255,255,255,0.06)", border:`1px solid ${G.border}`,
          display:"flex", alignItems:"center", justifyContent:"center",
          color:"rgba(255,255,255,0.4)", fontSize:14, cursor:"pointer",
        }}>›</div>
      </div>
    </aside>
  );
}

const GAMES = [
  { id:"sweetbonanza", name:"Sweet Bonanza 2500", provider:"PRAGMATIC PLAY", badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#1a0a3a,#6b21a8,#db2777)", emoji:"🍭", hot:true, playable:true },
  { id:"superace",     name:"SuperAce",           provider:"JILI",            badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#1a0800,#7c2d12,#f59e0b)", emoji:"🃏", hot:true },
  { id:"superace2",    name:"SuperAce2 Stack",     provider:"JILI",            badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#052e16,#166534,#f59e0b)", emoji:"🎴" },
  { id:"superace3",    name:"SuperAce Deluxe",     provider:"JILI",            badge:"",       bonus:"1.5", jackpot:"₱ 9,930,500.00", bg:"linear-gradient(145deg,#1c1917,#92400e,#f59e0b)", emoji:"👑" },
  { id:"superagedlx",  name:"SuperAge Deluxe",     provider:"JILI",            badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#1e1b4b,#4338ca,#818cf8)", emoji:"⚡" },
  { id:"fortunegems",  name:"Fortune Gems",        provider:"JDB",             badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#1a2e05,#3f6212,#a3e635)", emoji:"💎", hot:true },
  { id:"fortunegems2", name:"Fortune Gems 2",      provider:"JDB",             badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#1a2e05,#166534,#4ade80)", emoji:"🔮" },
  { id:"sugarbang",    name:"Sugar Bang Bang",      provider:"JILI",            badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#4a044e,#86198f,#f0abfc)", emoji:"🍬" },
  { id:"jackpotfish",  name:"Jackpot Fishing",      provider:"JDB",             badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#0c1a56,#1d4ed8,#38bdf8)", emoji:"🐠", hot:true },
  { id:"mines",        name:"Mines",                provider:"JILI",            badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#0f172a,#1e3a5f,#0ea5e9)", emoji:"💣" },
  { id:"pokerwin",     name:"PokerWin",             provider:"FC",              badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#450a0a,#991b1b,#f87171)", emoji:"🃠" },
  { id:"luckyfort",    name:"Lucky Fortunes",       provider:"SPIN MASTER",     badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#431407,#9a3412,#fdba74)", emoji:"🌈" },
  { id:"fortunecoin",  name:"Fortune Coins",        provider:"PG SOFT",         badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#1a0a00,#78350f,#fbbf24)", emoji:"🪙" },
  { id:"goldemp",      name:"Golden Empire",        provider:"PG SOFT",         badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#1c1917,#292524,#d97706)", emoji:"🏺" },
  { id:"wanted",       name:"Wanted",               provider:"PG SOFT",         badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#1c1006,#3d2008,#b45309)", emoji:"🤠" },
  { id:"cloudprinc",   name:"Cloud Princess",       provider:"JILI",            badge:"",       bonus:"",   bg:"linear-gradient(145deg,#0f172a,#0c4a6e,#7dd3fc)", emoji:"☁️" },
  { id:"atlas",        name:"Atlas",                provider:"FC",              badge:"",       bonus:"1.5", bg:"linear-gradient(145deg,#1e1b4b,#312e81,#c7d2fe)", emoji:"🗿" },
  { id:"pirates",      name:"Pirates",              provider:"JILI",            badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#030712,#1e3a5f,#0369a1)", emoji:"☠️" },
  { id:"zombiepar",    name:"Zombie Party",         provider:"JILI",            badge:"DOUBLE", bonus:"1.5", bg:"linear-gradient(145deg,#14532d,#166534,#86efac)", emoji:"🧟" },
  { id:"mermaid",      name:"Mermaid Riches",       provider:"PG SOFT",         badge:"",       bonus:"1.5", bg:"linear-gradient(145deg,#0c4a6e,#0369a1,#7dd3fc)", emoji:"🧜" },
];

const PROVIDERS = ["ALL","JILI","SPIN MASTER","FC","PG SOFT","PRAGMATIC PLAY","JDB"];
const CATEGORIES = ["ALL","Baccarat 1%","1.5% Cash Rebate","98%","Live Games","Slot Games","Fishing","Sports"];

function GameCard({ game, onPlay }) {
  const [hov, setHov] = useState(false);

  const gameImages = {
    sweetbonanza: "https://cp-images.casinoplus.live/images/cpms/pp/mobile/vs20swbon2500_v10.webp",
    superace:     "https://cp-images.casinoplus.live/images/cpms/jili/mobile/49_v10.webp",
    superace2:    "https://cp-images.casinoplus.live/images/cpms/jili/mobile/542.webp",
    superace3:    "https://cp-images.casinoplus.live/images/cpms/jili/mobile/403_v10.webp",
    fortunegems:  "https://storage.googleapis.com/tada-cdn-asia/All-In-One/production/img/jiliPlusPlayer/games/7hnsYn70DF8p9aAUBr9tPoqMjSDbBxzvNhXdrgle.png",
    sugarbang:    "https://www.casinoplus.com.ph/cp-games/asset/image/original/gameSectionArticle/mainImage/20241108081308Sl7aWO.webp",
    mines:        "https://cp-images.casinoplus.live/images/cpms/jili/mobile/229.webp",
    jackpotfish:  "https://cp-images.casinoplus.live/images/cpms/jili/mobile/32.webp",
    pokerwin:     "https://cp-images.casinoplus.live/images/cpms/fc/mobile/22060_v10.webp",
    luckyfort:    "https://cp-images.casinoplus.live/images/cpms/fc/mobile/n22040.webp",
    fortunegems2: "https://cp-images.casinoplus.live/images/cpms/jili/mobile/223_v10.webp",
    superagedlx:  "https://cp-images.casinoplus.live/images/cpms/jili/mobile/471.webp",
    fortunecoin:  "https://cp-images.casinoplus.live/images/cpms/jili/mobile/523_v10.webp",
    cloudprinc:   "https://cp-images.casinoplus.live/images/cpms/ALL_GAME/3202/201455.webp",
    goldemp:      "https://cp-images.casinoplus.live/images/cpms/jili/mobile/103_v10.webp",
    wanted:       "https://cp-images.casinoplus.live/images/cpms/26-05/3202_201078_260519195920.webp",
    atlas:        "https://cp-images.casinoplus.live/images/cpms/ALL_GAME/3202/201456.webp",
    pirates:      "https://cp-images.casinoplus.live/images/cpms/ALL_GAME/3202/201118.webp",
    zombiepar:    "https://cp-images.casinoplus.live/images/cpms/jili/mobile/252.webp",
    mermaid:      "https://cp-images.casinoplus.live/images/cpms/fc/mobile/n22032.webp",
  };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onPlay(game)}
      style={{
        position: "relative",
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        background: "#111",
        aspectRatio: "0.72",
        boxShadow: hov ? "0 10px 30px rgba(0,0,0,0.7)" : "0 4px 14px rgba(0,0,0,0.4)",
        transform: hov ? "translateY(-4px) scale(1.02)" : "scale(1)",
        transition: "0.22s ease",
      }}
    >
      <img
        src={gameImages[game.id]}
        alt={game.name}
        draggable={false}
        style={{
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center",
          display: "block", userSelect: "none",
          transform: hov ? "scale(1.04)" : "scale(1)",
          transition: "0.3s ease",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.15), transparent)",
      }} />
      {game.badge && (
        <div style={{
          position:"absolute", top:8, left:8,
          background:"#e60023", color:"#fff",
          fontSize:10, fontWeight:900, padding:"4px 8px",
          borderRadius:8, zIndex:3, letterSpacing:0.4,
        }}>{game.badge}</div>
      )}
      {game.hot && (
        <div style={{
          position:"absolute", top:38, left:8,
          background:"#ff7a00", color:"#fff",
          fontSize:9, fontWeight:900, padding:"3px 7px",
          borderRadius:7, zIndex:3,
        }}>HOT</div>
      )}
      {game.bonus && (
        <div style={{
          position:"absolute", top:8, right:8,
          width:38, height:38, borderRadius:"50%",
          background:"linear-gradient(135deg,#ff9f00,#ff6a00)",
          color:"#fff", fontWeight:900, fontSize:13,
          display:"flex", alignItems:"center", justifyContent:"center",
          zIndex:3, boxShadow:"0 0 14px rgba(255,140,0,0.7)",
        }}>{game.bonus}</div>
      )}
      {/* Hover shimmer */}
      <div style={{
        position:"absolute", inset:0, zIndex:4,
        background:"linear-gradient(135deg,transparent 40%,rgba(255,255,255,0.06) 50%,transparent 60%)",
        transform: hov ? "translateX(100%)" : "translateX(-100%)",
        transition: hov ? "transform 0.5s ease" : "none",
        pointerEvents:"none",
      }} />
      <div style={{
        position:"absolute", left:0, right:0,
        bottom: hov ? 16 : -80,
        display:"flex", justifyContent:"center",
        transition:"0.25s ease", zIndex:5,
      }}>
        <button style={{
          background:"linear-gradient(135deg,#00d84a,#00a63a)",
          border:"none", color:"#fff",
          fontWeight:900, fontSize:13,
          borderRadius:999, padding:"10px 26px",
          cursor:"pointer",
          boxShadow:"0 6px 18px rgba(0,216,74,0.5)",
        }}>PLAY</button>
      </div>
    </div>
  );
}

/* ── PROFILE PAGE ─────────────────────────────────────────────── */
function ProfilePage({ onLoginClick }) {
  const menuItems = [
    { icon:"🛡️", label:"Responsible Gaming" },
    { icon:"👥", label:"Community" },
    { icon:"💎", label:"VIP Club" },
    { icon:"❓", label:"FAQ And Announcement" },
  ];
  return (
    <div style={{ padding:"16px 14px 80px" }}>
      {/* Profile header card */}
      <div style={{
        background:"linear-gradient(135deg,#0f2419,#1a3a2a)",
        borderRadius:16, padding:20, marginBottom:14,
        border:`1px solid ${G.border}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{
            width:60, height:60, borderRadius:"50%",
            background:"rgba(255,255,255,0.08)",
            border:"2px solid rgba(255,255,255,0.15)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:28,
          }}>👤</div>
          <div>
            <div style={{ fontSize:18, fontWeight:900 }}>Hi, Welcome!</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:2 }}>
              login for extra fun & features!
            </div>
            <button
              onClick={onLoginClick}
              style={{
                marginTop:8,
                background:"linear-gradient(135deg,#e53935,#ff6f60)",
                border:"none", borderRadius:20,
                padding:"6px 16px", color:"#fff",
                fontWeight:700, fontSize:12, cursor:"pointer",
                boxShadow:"0 3px 12px rgba(229,57,53,0.4)",
              }}
            >Register / Login</button>
          </div>
        </div>

        {/* Credit Balance */}
        <div style={{
          marginTop:16,
          display:"flex", alignItems:"center", gap:8,
          fontSize:12, color:"rgba(255,255,255,0.5)",
        }}>
          <span>Credit Balance</span>
          <span style={{ fontSize:14 }}>🔄</span>
          <span style={{ marginLeft:"auto", color:"rgba(255,255,255,0.25)", letterSpacing:2, fontSize:13 }}>
            ₱ ••••••••••
          </span>
        </div>

        {/* Top Up / Withdraw */}
        <div style={{ display:"flex", gap:10, marginTop:10 }}>
          <button style={{
            flex:1, background:`linear-gradient(135deg,${G.green},${G.greenDk})`,
            border:"none", borderRadius:8, padding:"10px 0",
            color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
            boxShadow:`0 3px 12px rgba(0,200,83,0.35)`,
          }}>🎰 Top Up</button>
          <button style={{
            flex:1, background:"linear-gradient(135deg,#0288d1,#0260a8)",
            border:"none", borderRadius:8, padding:"10px 0",
            color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
            boxShadow:"0 3px 12px rgba(2,136,209,0.35)",
          }}>💸 Withdraw</button>
        </div>
      </div>

      {/* Menu list */}
      <div style={{
        background:G.cardBg, borderRadius:12,
        border:`1px solid ${G.border}`, overflow:"hidden",
      }}>
        {menuItems.map(({ icon, label }, i) => (
          <div key={label} style={{
            display:"flex", alignItems:"center", gap:12,
            padding:"14px 16px",
            borderBottom: i < menuItems.length-1 ? `1px solid ${G.border}` : "none",
            cursor:"pointer",
            transition:"background 0.15s",
          }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.04)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}
          >
            <span style={{ fontSize:20, width:28, textAlign:"center" }}>{icon}</span>
            <span style={{ flex:1, fontSize:13 }}>{label}</span>
            <span style={{ color:"rgba(255,255,255,0.3)", fontSize:14 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── LOGIN / REGISTER MODAL ───────────────────────────────────── */
function LoginModal({ onClose }) {
  const [isRegister, setIsRegister] = useState(false);
  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:900,
        background:"rgba(0,0,0,0.75)",
        display:"flex", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(6px)",
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:`linear-gradient(160deg,${G.sideBg},${G.cardBg})`,
          borderRadius:20, border:`1px solid rgba(0,200,83,0.25)`,
          boxShadow:`0 0 60px rgba(0,200,83,0.12)`,
          width:"min(380px,94vw)", padding:"28px 24px",
          position:"relative",
        }}
      >
        <button onClick={onClose} style={{
          position:"absolute", top:14, right:14,
          background:"rgba(255,255,255,0.08)", border:"none",
          borderRadius:8, padding:"5px 10px",
          color:"#fff", cursor:"pointer", fontSize:13,
        }}>✕</button>

        {/* Logo */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <div style={{
            background:"#1a7a3c", borderRadius:12,
            padding:"10px 18px",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <Logo />
          </div>
        </div>

        <div style={{ textAlign:"center", fontSize:20, fontWeight:900, marginBottom:4 }}>
          {isRegister ? "Create Account 🎉" : "Welcome Back! 🎰"}
        </div>
        <div style={{ textAlign:"center", fontSize:12, color:"rgba(255,255,255,0.45)", marginBottom:22 }}>
          {isRegister ? "Join BapahCasino today" : "Login to your account"}
        </div>

        {/* Fields */}
        {[
          { label:"USERNAME", type:"text", placeholder:"Enter your username" },
          ...(isRegister ? [{ label:"EMAIL", type:"email", placeholder:"Enter your email" }] : []),
          { label:"PASSWORD", type:"password", placeholder:"••••••••" },
        ].map(({ label, type, placeholder }) => (
          <div key={label} style={{ marginBottom:14 }}>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", marginBottom:5 }}>{label}</div>
            <input
              type={type}
              placeholder={placeholder}
              style={{
                width:"100%", background:"rgba(255,255,255,0.06)",
                border:`1px solid rgba(255,255,255,0.1)`,
                borderRadius:10, padding:"11px 14px",
                color:"#fff", fontSize:13, outline:"none",
              }}
            />
          </div>
        ))}

        <button style={{
          width:"100%",
          background:"linear-gradient(135deg,#e53935,#ff6f60)",
          border:"none", borderRadius:10, padding:"13px",
          color:"#fff", fontWeight:900, fontSize:14,
          cursor:"pointer", marginTop:6,
          boxShadow:"0 4px 16px rgba(229,57,53,0.4)",
        }}>
          {isRegister ? "REGISTER" : "LOGIN"}
        </button>

        <div style={{ textAlign:"center", marginTop:14, fontSize:12, color:"rgba(255,255,255,0.45)" }}>
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <span
            onClick={()=>setIsRegister(r=>!r)}
            style={{ color:G.green, cursor:"pointer", fontWeight:700 }}
          >
            {isRegister ? "Login here" : "Register here"}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── TERMS & CONDITIONS MODAL ─────────────────────────────────── */
function TermsModal({ onAccept, onDecline }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1100,
      background:"rgba(0,0,0,0.85)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
    }}>
      <div style={{
        background:`linear-gradient(180deg,#0d1e2e,#091524)`,
        borderRadius:"20px 20px 0 0",
        border:`1px solid ${G.border}`, borderBottom:"none",
        width:"100%", maxWidth:500, maxHeight:"90vh",
        display:"flex", flexDirection:"column",
        animation:"slideUp 0.35s ease",
      }}>
        {/* Header */}
        <div style={{
          padding:"20px 20px 14px",
          textAlign:"center",
          borderBottom:`1px solid ${G.border}`,
        }}>
          <div style={{ display:"flex", justifyContent:"center", gap:12, marginBottom:10 }}>
            {/* PAGCOR badge */}
            <div style={{
              background:"#fff", borderRadius:50, padding:"5px 12px",
              display:"flex", alignItems:"center", gap:6,
              fontSize:11, color:"#003d99", fontWeight:900, letterSpacing:0.5,
            }}>🎰 PAGCOR</div>
            {/* 21+ badge */}
            <div style={{
              background:"#e53935", borderRadius:50, padding:"5px 10px",
              fontSize:10, color:"#fff", fontWeight:900,
              display:"flex", alignItems:"center", gap:4,
              textAlign:"left", lineHeight:1.3,
            }}>
              <span style={{ fontSize:14, fontWeight:900 }}>21</span>
              <span>GAMBLING CAN BE ADDICTIVE<br/>KNOW WHEN TO STOP</span>
            </div>
          </div>
          <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>
            Regulated by PAGCOR • Play Responsibly
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:"auto", padding:"16px 20px" }}>
          <div style={{ fontSize:14, fontWeight:800, marginBottom:12, lineHeight:1.5 }}>
            The following personalities are{" "}
            <span style={{ color:G.gold }}>NOT ALLOWED</span>{" "}
            to register and/or play in this online gaming website:
          </div>
          <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:10, marginBottom:14 }}>
            {[
              "Government Official or employee connected directly with the operation of the Government or any of its agencies.",
              "Member of the Armed Forces of the Philippines, including the Army, Navy, Air Force, or the Philippine National Police.",
              "Persons under 21 years of age.",
              "Persons included in the PAGCOR's National Database of Restricted Persons (NDRP).",
              "Gaming Employment License (GEL) holder.",
            ].map((item, i) => (
              <li key={i} style={{ display:"flex", gap:8, fontSize:12, color:"rgba(255,255,255,0.8)", lineHeight:1.5 }}>
                <span style={{ color:G.green, fontSize:14, flexShrink:0, marginTop:1 }}>•</span>
                {item}
              </li>
            ))}
          </ul>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.6, marginBottom:8 }}>
            Funds or credits in the account of player who is found ineligible to play shall mean forfeiture of said funds/credits in favor of the Government.
          </div>
          <div style={{ fontSize:11, color:"rgba(255,255,255,0.55)", lineHeight:1.6 }}>
            BapahCasino{" "}
            <span style={{ color:G.green, cursor:"pointer", textDecoration:"underline" }}>Terms & Conditions</span>
            {" "}and{" "}
            <span style={{ color:G.green, cursor:"pointer", textDecoration:"underline" }}>Privacy Policy</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding:"14px 20px 20px",
          borderTop:`1px solid ${G.border}`,
          display:"flex", flexDirection:"column", gap:8,
        }}>
          <button
            onClick={onAccept}
            style={{
              background:"linear-gradient(135deg,#e53935,#ff6f60)",
              border:"none", borderRadius:12, padding:"14px",
              color:"#fff", fontWeight:900, fontSize:15,
              cursor:"pointer",
              boxShadow:"0 4px 20px rgba(229,57,53,0.4)",
            }}
          >Accept</button>
          <button
            onClick={onDecline}
            style={{
              background:"none", border:"none",
              color:"rgba(255,255,255,0.45)", fontSize:13,
              cursor:"pointer", textDecoration:"underline", textAlign:"center",
            }}
          >I Do Not Accept</button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform:translateY(100%); } to { transform:translateY(0); } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   SWEET BONANZA SLOT GAME
══════════════════════════════════════════════════════════════ */
const SB_SYMBOLS = [
  { id:"lollipop", emoji:"🍭", color:"#ff69b4", value:10, scatter:true },
  { id:"grape",    emoji:"🍇", color:"#9b59b6", value:8  },
  { id:"apple",    emoji:"🍎", color:"#e74c3c", value:7  },
  { id:"watermelon",emoji:"🍉",color:"#27ae60", value:6  },
  { id:"plum",     emoji:"🍑", color:"#e67e22", value:5  },
  { id:"banana",   emoji:"🍌", color:"#f1c40f", value:4  },
  { id:"candy",    emoji:"🍬", color:"#ff1493", value:3  },
  { id:"heart",    emoji:"💎", color:"#00bcd4", value:2  },
];

const GRID_COLS = 6, GRID_ROWS = 5;

function randomSymbol() {
  const weights = [4, 8, 10, 12, 14, 16, 18, 18];
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random()*total;
  for(let i=0;i<weights.length;i++){
    r -= weights[i];
    if(r<=0) return SB_SYMBOLS[i];
  }
  return SB_SYMBOLS[7];
}

function makeGrid() {
  return Array.from({length:GRID_ROWS}, ()=>
    Array.from({length:GRID_COLS}, ()=>({
      sym: randomSymbol(), win:false, mult:null, falling:false, id:Math.random(),
    }))
  );
}

function findClusters(grid) {
  const visited = Array.from({length:GRID_ROWS}, ()=>new Array(GRID_COLS).fill(false));
  const clusters = [];
  function bfs(startR, startC, symId) {
    const queue = [[startR,startC]]; const cells = [];
    visited[startR][startC] = true;
    while(queue.length) {
      const [r,c] = queue.shift(); cells.push([r,c]);
      for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nr=r+dr, nc=c+dc;
        if(nr>=0&&nr<GRID_ROWS&&nc>=0&&nc<GRID_COLS&&!visited[nr][nc]&&grid[nr][nc].sym.id===symId){
          visited[nr][nc]=true; queue.push([nr,nc]);
        }
      }
    }
    return cells;
  }
  for(let r=0;r<GRID_ROWS;r++)
    for(let c=0;c<GRID_COLS;c++)
      if(!visited[r][c]) {
        const sym = grid[r][c].sym;
        if(!sym.scatter) {
          const cells = bfs(r,c,sym.id);
          if(cells.length>=8) clusters.push({ cells, sym, size:cells.length });
        }
      }
  return clusters;
}

function countScatters(grid) {
  let n=0;
  for(let r=0;r<GRID_ROWS;r++)
    for(let c=0;c<GRID_COLS;c++)
      if(grid[r][c].sym.scatter) n++;
  return n;
}

function calcWin(clusters, bet, multiplier=1) {
  let total=0;
  for(const cl of clusters){
    const s=cl.size;
    let base;
    if(s>=20) base=cl.sym.value*100;
    else if(s>=15) base=cl.sym.value*50;
    else if(s>=12) base=cl.sym.value*25;
    else if(s>=10) base=cl.sym.value*15;
    else if(s>=9) base=cl.sym.value*10;
    else base=cl.sym.value*5;
    total += base * bet;
  }
  return total * multiplier;
}

function SweetBonanzaGame({ onClose }) {
  const [grid, setGrid] = useState(makeGrid());
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(20);
  const [spinning, setSpinning] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [message, setMessage] = useState("Good luck! 🍭");
  const [freeSpins, setFreeSpins] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [winCells, setWinCells] = useState([]);
  const [lastWin, setLastWin] = useState(0);
  const BET_OPTS = [5,10,20,50,100,200];

  const doSpin = useCallback(async () => {
    if (spinning) return;
    if (freeSpins === 0 && balance < bet) { setMessage("Insufficient balance! 😅"); return; }
    setSpinning(true); setWinAmount(0); setWinCells([]); setLastWin(0);
    if (freeSpins > 0) { setFreeSpins(f=>f-1); setMessage(`Free Spins: ${freeSpins-1} remaining! 🌟`); }
    else { setBalance(b=>b-bet); }
    let frames=0;
    const animInterval = setInterval(()=>{
      frames++;
      setGrid(makeGrid());
      if(frames>=8) {
        clearInterval(animInterval);
        const finalGrid = makeGrid();
        setGrid(finalGrid);
        processGrid(finalGrid, freeSpins>0 ? multiplier : 1, 0);
      }
    }, 80);
  }, [spinning, balance, bet, freeSpins, multiplier]);

  const processGrid = async (g, mult, accumulated) => {
    const clusters = findClusters(g);
    const scatters = countScatters(g);
    const winning = new Set();
    clusters.forEach(cl => cl.cells.forEach(([r,c])=> winning.add(`${r},${c}`)));
    if (scatters >= 4) {
      const fs = scatters>=6 ? 25 : scatters>=5 ? 18 : 12;
      setFreeSpins(f=>f+fs); setMessage(`🎰 ${fs} FREE SPINS TRIGGERED! 🎰`); setMultiplier(2);
    }
    if (clusters.length > 0) {
      setWinCells([...winning]);
      const win = calcWin(clusters, bet, mult);
      setWinAmount(win); setLastWin(w=>w+win); setBalance(b=>b+win);
      setMessage(win > bet*10 ? `🎊 BIG WIN! +₱${win.toLocaleString()}` : win > bet*5 ? `🔥 NICE WIN! +₱${win.toLocaleString()}` : `+₱${win.toLocaleString()}`);
      await new Promise(r=>setTimeout(r,900));
      const newGrid = g.map((row,ri)=>row.map((cell,ci)=>{
        if(winning.has(`${ri},${ci}`)) return { sym:randomSymbol(), win:false, mult:null, falling:true, id:Math.random() };
        return { ...cell, win:false };
      }));
      setGrid(newGrid); setWinCells([]);
      await new Promise(r=>setTimeout(r,400));
      processGrid(newGrid, mult + (clusters.length>1?1:0), accumulated+win);
    } else {
      setSpinning(false);
      if(accumulated===0) setMessage("Try again! 🍭");
      setWinCells([]);
    }
  };

  useEffect(()=>{
    const h = (e)=>{ if(e.code==="Space"&&!spinning){ e.preventDefault(); doSpin(); } if(e.code==="Escape") onClose(); };
    window.addEventListener("keydown",h);
    return ()=>window.removeEventListener("keydown",h);
  },[doSpin, spinning, onClose]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.92)", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(8px)" }}>
      <div style={{ background:"linear-gradient(160deg,#2d0a4e,#4c1d95,#1a0533)", borderRadius:16, border:"2px solid rgba(168,85,247,0.4)", boxShadow:"0 0 80px rgba(139,92,246,0.4), 0 0 20px rgba(0,0,0,0.8)", width:"min(520px,97vw)", maxHeight:"97vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        <div style={{ background:"linear-gradient(90deg,#6b21a8,#db2777)", padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:22 }}>🍭</span>
            <div>
              <div style={{ fontWeight:900, fontSize:14, color:"#fff", letterSpacing:1 }}>SWEET BONANZA 2500</div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.7)", letterSpacing:1 }}>PRAGMATIC PLAY • Cluster Pays</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {freeSpins>0 && <div style={{ background:"linear-gradient(135deg,#ffd700,#ff6b35)", color:"#fff", fontWeight:900, fontSize:10, padding:"3px 8px", borderRadius:10, boxShadow:"0 0 14px rgba(255,215,0,0.6)" }}>⭐ {freeSpins} FREE</div>}
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"5px 10px", color:"#fff", cursor:"pointer", fontSize:13 }}>✕</button>
          </div>
        </div>
        <div style={{ background:"rgba(0,0,0,0.4)", padding:"8px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", gap:16 }}>
            <div>
              <div style={{ fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:1 }}>BALANCE</div>
              <div style={{ fontSize:14, fontWeight:900, color:G.gold }}>₱{balance.toLocaleString()}</div>
            </div>
            {lastWin>0 && <div><div style={{ fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:1 }}>LAST WIN</div><div style={{ fontSize:14, fontWeight:900, color:"#00c853" }}>₱{lastWin.toLocaleString()}</div></div>}
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:1 }}>TOTAL BET</div>
            <div style={{ fontSize:14, fontWeight:900, color:"#fff" }}>₱{bet}</div>
          </div>
        </div>
        <div style={{ textAlign:"center", padding:"6px", background: winAmount>0 ? "linear-gradient(90deg,rgba(255,215,0,0.15),rgba(255,215,0,0.3),rgba(255,215,0,0.15))" : "rgba(0,0,0,0.2)", fontSize:12, fontWeight:800, color: winAmount>0 ? G.gold : "rgba(255,255,255,0.7)", letterSpacing:0.5, transition:"all 0.3s", minHeight:28, display:"flex", alignItems:"center", justifyContent:"center" }}>{message}</div>
        <div style={{ flex:1, padding:"10px 12px", display:"flex", flexDirection:"column", gap:4, background:"linear-gradient(180deg,rgba(0,0,0,0.3),rgba(0,0,0,0.1))", overflowY:"auto" }}>
          {grid.map((row,ri)=>(
            <div key={ri} style={{ display:"flex", gap:4 }}>
              {row.map((cell,ci)=>{
                const isWin = winCells.has(`${ri},${ci}`);
                return (
                  <div key={cell.id} style={{ flex:1, aspectRatio:"1", background: isWin ? `radial-gradient(circle,${cell.sym.color}60,${cell.sym.color}20)` : "rgba(255,255,255,0.05)", borderRadius:8, border: isWin ? `2px solid ${cell.sym.color}` : "1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(14px,4vw,22px)", cursor:"default", transform: isWin ? "scale(1.08)" : cell.falling ? "translateY(-8px)" : "none", transition:"all 0.25s cubic-bezier(.34,1.56,.64,1)", boxShadow: isWin ? `0 0 12px ${cell.sym.color}80` : "none", position:"relative" }}>
                    {cell.sym.emoji}
                    {isWin && <div style={{ position:"absolute", inset:0, borderRadius:8, background:`radial-gradient(circle,${cell.sym.color}30,transparent)`, animation:"pulse 0.4s ease-in-out infinite alternate" }}/>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding:"6px 12px", display:"flex", gap:4, overflowX:"auto", background:"rgba(0,0,0,0.3)", scrollbarWidth:"none" }}>
          {SB_SYMBOLS.map(s=>(
            <div key={s.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1, flexShrink:0, background:"rgba(255,255,255,0.04)", borderRadius:6, padding:"4px 8px", border:"1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontSize:14 }}>{s.emoji}</span>
              <span style={{ fontSize:7, color:"rgba(255,255,255,0.5)" }}>{s.scatter?"Scatter":`×${s.value}`}</span>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 12px 12px", background:"rgba(0,0,0,0.5)", display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.5)", whiteSpace:"nowrap", minWidth:28 }}>BET:</span>
            <div style={{ display:"flex", gap:4, flex:1, flexWrap:"wrap" }}>
              {BET_OPTS.map(v=>(
                <button key={v} onClick={()=>!spinning&&setBet(v)} style={{ background: bet===v ? "linear-gradient(135deg,#db2777,#9333ea)" : "rgba(255,255,255,0.07)", border: bet===v ? "1px solid #db2777" : "1px solid rgba(255,255,255,0.1)", borderRadius:6, padding:"4px 8px", color: bet===v ? "#fff" : "rgba(255,255,255,0.6)", fontSize:10, fontWeight: bet===v ? 800 : 400, cursor:"pointer", flexShrink:0 }}>₱{v}</button>
              ))}
            </div>
          </div>
          <button onClick={doSpin} disabled={spinning} style={{ background: spinning ? "rgba(255,255,255,0.1)" : freeSpins>0 ? "linear-gradient(135deg,#ffd700,#ff6b35)" : "linear-gradient(135deg,#db2777,#9333ea)", border:"none", borderRadius:30, padding:"13px 0", width:"100%", color:spinning?"rgba(255,255,255,0.4)":"#fff", fontWeight:900, fontSize:16, cursor:spinning?"not-allowed":"pointer", letterSpacing:2, transition:"all 0.2s" }}>
            {spinning ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}><span style={{ display:"inline-block", animation:"spin 0.6s linear infinite" }}>🔄</span>SPINNING...</span> : freeSpins>0 ? `⭐ FREE SPIN (${freeSpins} LEFT)` : "SPIN  ▶"}
          </button>
          <div style={{ textAlign:"center", fontSize:9, color:"rgba(255,255,255,0.25)" }}>SPACE to spin • ESC to close • 8+ cluster = WIN • 4+ 🍭 = Free Spins</div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { from { opacity:0.3; } to { opacity:0.8; } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN APP
══════════════════════════════════════════════════════════════ */
export default function CasinoPlus() {
  const [activeNav, setActiveNav] = useState("Games");
  const [category, setCategory] = useState("Slot Games");
  const [provider, setProvider] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [playingGame, setPlayingGame] = useState(null);
  const [search, setSearch] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(()=>{
    const h = ()=>{ const m=window.innerWidth<768; setIsMobile(m); if(!m) setSidebarOpen(true); };
    window.addEventListener("resize",h); h();
    return ()=>window.removeEventListener("resize",h);
  },[]);
  useEffect(()=>{ if(isMobile) setSidebarOpen(false); },[isMobile]);

  const filtered = GAMES.filter(g=>{
    const matchSearch = !search || g.name.toLowerCase().includes(search.toLowerCase());
    const matchProv = provider==="ALL" || g.provider===provider;
    return matchSearch && matchProv;
  });

  return (
    <div style={{
      display:"flex", minHeight:"100vh",
      background:G.mainBg,
      fontFamily:"'Segoe UI','Helvetica Neue',Arial,sans-serif",
      color:"#fff", fontSize:14, position:"relative",
    }}>
      <Sidebar active={activeNav} setActive={setActiveNav} open={isMobile ? sidebarOpen : true} />

      {isMobile && sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:40 }}/>
      )}

      <div style={{ flex:1, display:"flex", flexDirection:"column", marginLeft: isMobile ? 0 : 70, minWidth:0, overflow:"hidden" }}>
        {/* Top bar */}
        <header style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:"rgba(0,0,0,0.3)", borderBottom:`1px solid ${G.border}`, position:"sticky", top:0, zIndex:20, backdropFilter:"blur(12px)" }}>
          {isMobile && (
            <button onClick={()=>setSidebarOpen(o=>!o)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.8)", fontSize:22, padding:0 }}>☰</button>
          )}
          {isMobile && <Logo small />}
          {!isMobile && (
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.4)", flex:1 }}>
              Home &nbsp;›&nbsp;<span style={{ color:"rgba(255,255,255,0.5)" }}>Games</span>&nbsp;›&nbsp;<span style={{ color:"rgba(255,255,255,0.85)" }}>Slot Games</span>
            </div>
          )}
          <div style={{ display:"flex", alignItems:"center", background:"rgba(255,255,255,0.06)", borderRadius:30, padding:"7px 14px", gap:8, border:`1px solid ${G.border}`, flex: isMobile ? 1 : "0 0 260px" }}>
            <span style={{ fontSize:12, opacity:0.4 }}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Games" style={{ background:"none", border:"none", outline:"none", color:"#fff", fontSize:12, flex:1, minWidth:0 }}/>
          </div>
          <button
            onClick={()=>setShowLogin(true)}
            style={{ background:"linear-gradient(135deg,#e53935,#ff6f60)", border:"none", borderRadius:30, padding:"8px 16px", color:"#fff", fontWeight:700, fontSize:12, cursor:"pointer", whiteSpace:"nowrap", boxShadow:"0 3px 12px rgba(229,57,53,0.35)" }}
          >Login / Register</button>
          <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"rgba(255,255,255,0.6)", padding:4 }}>🔔</button>
        </header>

        {/* Page content */}
        <main style={{ flex:1, overflowY:"auto", padding:"12px 14px 80px" }}>

          {/* ── ACCOUNT PAGE ── */}
          {activeNav === "Account" ? (
            <ProfilePage onLoginClick={()=>setShowLogin(true)} />
          ) : (
            <>
              {/* Category tabs */}
              <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:4, marginBottom:10, scrollbarWidth:"none" }}>
                {CATEGORIES.map(cat=>{
                  const isA = category===cat;
                  return (
                    <button key={cat} onClick={()=>setCategory(cat)} style={{ background: isA ? "linear-gradient(135deg,#00c853,#009624)" : "rgba(255,255,255,0.05)", border:`1px solid ${isA?"transparent":"rgba(255,255,255,0.08)"}`, borderRadius:30, padding:"7px 14px", color: isA?"#fff":"rgba(255,255,255,0.55)", fontWeight: isA?700:400, fontSize:11, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, boxShadow: isA?"0 3px 14px rgba(0,200,83,0.3)":"none", transition:"all 0.2s" }}>{cat}</button>
                  );
                })}
              </div>

              {/* Provider tabs */}
              <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:4, marginBottom:18, scrollbarWidth:"none", alignItems:"center" }}>
                {PROVIDERS.map(p=>{
                  const isA = provider===p;
                  return (
                    <button key={p} onClick={()=>setProvider(p)} style={{ background: isA ? "rgba(0,200,83,0.15)" : "rgba(255,255,255,0.04)", border:`1px solid ${isA?"#00c853":"rgba(255,255,255,0.08)"}`, borderRadius:6, padding:"5px 12px", color: isA?"#00c853":"rgba(255,255,255,0.5)", fontWeight: isA?700:400, fontSize:11, cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, transition:"all 0.15s" }}>{p}</button>
                  );
                })}
              </div>

              {/* Game grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(120px,1fr))", gap:10 }}>
                {filtered.map(g=>(
                  <GameCard key={g.id} game={g} onPlay={setPlayingGame} />
                ))}
              </div>

              {filtered.length===0 && (
                <div style={{ textAlign:"center", padding:"60px 20px", color:"rgba(255,255,255,0.3)" }}>
                  <div style={{ fontSize:40, marginBottom:10 }}>🔍</div>
                  <div>No games found for "{search}"</div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating buttons */}
      <div style={{ position:"fixed", right:14, bottom: isMobile?72:20, display:"flex", flexDirection:"column", gap:8, zIndex:30 }}>
        <button style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#e74c3c,#c0392b)", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 4px 16px rgba(231,76,60,0.5)", fontSize:8, fontWeight:700, gap:1 }}>
          <span style={{ fontSize:16 }}>🎁</span><span>Lucky</span><span>Plus</span>
        </button>
        <button style={{ width:52, height:52, borderRadius:"50%", background:"linear-gradient(135deg,#00c853,#009624)", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#fff", boxShadow:"0 4px 16px rgba(0,200,83,0.5)", fontSize:8, fontWeight:700, gap:1 }}>
          <span style={{ fontSize:16 }}>💬</span><span>Support</span>
        </button>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:G.sideBg, borderTop:`1px solid ${G.border}`, display:"flex", justifyContent:"space-around", padding:"8px 0 10px", zIndex:30 }}>
          {[{icon:"🏠",label:"Home"},{icon:"🎮",label:"Games"},{icon:"🎁",label:"Promo"},{icon:"💬",label:"Support"},{icon:"👤",label:"Account"}].map(({icon,label})=>(
            <button key={label} onClick={()=>setActiveNav(label)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:2, color: activeNav===label?"#00c853":"rgba(255,255,255,0.45)", fontSize:9, fontWeight: activeNav===label?700:400, padding:"0 8px" }}>
              <span style={{ fontSize:18 }}>{icon}</span><span>{label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Sweet Bonanza Modal */}
      {playingGame && <SweetBonanzaGame onClose={()=>setPlayingGame(null)} game={playingGame} />}

      {/* Login / Register Modal */}
      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} />}

      {/* Terms & Conditions — shown on first load */}
      {!termsAccepted && (
        <TermsModal
          onAccept={()=>setTermsAccepted(true)}
          onDecline={()=>setTermsAccepted(true)}
        />
      )}

      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.12); border-radius:2px; }
      `}</style>
    </div>
  );
}