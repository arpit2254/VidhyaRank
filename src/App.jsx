import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Papa from "papaparse";

// ─── Motivational Quotes ────────────────────────────────────────────────────
const QUOTES = [
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Dream big. Work hard. Stay focused. And surround yourself with good people.", author: "Anonymous" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Every expert was once a beginner. Every pro was once an amateur.", author: "Robin Sharma" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Anonymous" },
  { text: "Great things never come from comfort zones. Step into your future boldly.", author: "Anonymous" },
  { text: "Your percentile is just a number. Your perseverance defines your future.", author: "Vidhya Rank" },
  { text: "Every rank matters. Every college is a new beginning.", author: "Vidhya Rank" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Don't limit your challenges. Challenge your limits.", author: "Anonymous" },
];

const RANDOM_QUOTE = QUOTES[Math.floor(Math.random() * QUOTES.length)];

// ─── Branch groups ──────────────────────────────────────────────────────────
const BRANCH_GROUPS = {
  "💻 Computer Science & IT": [
    "Computer Science and Engineering","Computer Engineering","Computer Science",
    "Computer Technology","Computer Science and Business Systems","Computer Science and Design",
    "Computer Science and Engineering (Artificial Intelligence and Data Science)",
    "Computer Science and Engineering (Artificial Intelligence)",
    "Computer Science and Engineering (Cyber Security)",
    "Computer Science and Engineering (Internet of Things and Cyber Security Including Block Chain",
    "Computer Science and Engineering (IoT)",
    "Computer Science and Engineering(Artificial Intelligence and Machine Learning)",
    "Computer Science and Engineering(Cyber Security)","Computer Science and Engineering(Data Science)",
    "Computer Science and Information Technology","Computer Science and Technology",
    "Computer Engineering (Software Engineering)","Information Technology",
    "Artificial Intelligence","Artificial Intelligence (AI) and Data Science",
    "Artificial Intelligence and Data Science","Artificial Intelligence and Machine Learning",
    "Data Science","Data Engineering","Cyber Security","Industrial IoT",
    "Internet of Things (IoT)","5G","Robotics and Artificial Intelligence",
  ],
  "⚙️ Mechanical & Automobile": [
    "Mechanical Engineering","Mechanical Engineering Automobile","Mechanical Engineering[Sandwich]",
    "Mechanical & Automation Engineering","Mechanical and Automation Engineering",
    "Mechanical and Mechatronics Engineering (Additive Manufacturing)","Automobile Engineering",
    "Manufacturing Science and Engineering","Production Engineering","Production Engineering[Sandwich]",
    "Mechatronics Engineering","Automation and Robotics","Robotics and Automation","Mining Engineering",
  ],
  "📡 Electronics & Communication": [
    "Electronics and Telecommunication Engg","Electronics Engineering",
    "Electronics Engineering ( VLSI Design and Technology)","Electronics and Communication Engineering",
    "Electronics and Communication (Advanced Communication Technology)",
    "Electronics and Communication(Advanced Communication Technology)",
    "Electronics and Computer Engineering","Electronics and Computer Science",
    "Electronics and Biomedical Engineering","VLSI","Instrumentation Engineering",
    "Instrumentation and Control Engineering",
  ],
  "🏗️ Civil & Structural": [
    "Civil Engineering","Civil Engineering (Structural Engineering)","Civil Engineering and Planning",
    "Civil and Environmental Engineering","Civil and infrastructure Engineering","Structural Engineering",
  ],
  "⚡ Electrical": [
    "Electrical Engineering","Electrical Engg [Electrical and Power]","Electrical Engg[Electronics and Power]",
    "Electrical and Computer Engineering","Electrical and Electronics Engineering","Electrical, Electronics and Power",
  ],
  "🧪 Chemical & Material": [
    "Chemical Engineering","Petro Chemical Engineering","Petro Chemical Technology",
    "Pharmaceutical and Fine Chemical Technology","Pharmaceuticals Chemistry and Technology",
    "Plastic Technology","Plastic and Polymer Engineering","Plastic and Polymer Technology",
    "Polymer Engineering and Technology","Metallurgy and Material Technology","Dyestuff Technology",
    "Surface Coating Technology","Oil Technology","Oil and Paints Technology",
    "Oil Fats and Waxes Technology","Oil,Oleochemicals and Surfactants Technology","Paints Technology",
  ],
  "🍎 Food & Biotech": [
    "Food Technology","Food Engineering","Food Engineering and Technology","Food Technology And Management",
    "Bio Technology","Bio Medical Engineering","Agricultural Engineering",
  ],
  "🧵 Textile & Fashion": [
    "Textile Technology","Textile Engineering / Technology","Textile Chemistry","Technical Textiles",
    "Man Made Textile Technology","Fibres and Textile Processing Technology","Textile Plant Engineering",
    "Fashion Technology","Printing Technology","Printing and Packing Technology","Paper and Pulp Technology",
  ],
  "✈️ Aeronautical & Other": [
    "Aeronautical Engineering","Architectural Assistantship","Fire Engineering","Safety and Fire Engineering",
  ],
};

const ALL_GROUPED_BRANCHES = new Set(Object.values(BRANCH_GROUPS).flat());

const CATEGORIES = [
  { code:"GOPENS", label:"General Open",       sub:"STATE" },
  { code:"GOBCS",  label:"OBC",                sub:"STATE" },
  { code:"GSCS",   label:"SC",                 sub:"STATE" },
  { code:"GSTS",   label:"ST",                 sub:"STATE" },
  { code:"GSEBCS", label:"SEBC",               sub:"STATE" },
  { code:"GNT1S",  label:"NT1",                sub:"STATE" },
  { code:"GNT2S",  label:"NT2",                sub:"STATE" },
  { code:"GNT3S",  label:"NT3",                sub:"STATE" },
  { code:"LOPENS", label:"Ladies Open",        sub:"STATE" },
  { code:"GOPENH", label:"General Open",       sub:"HOME UNIVERSITY" },
  { code:"GOBCH",  label:"OBC",                sub:"HOME UNIVERSITY" },
  { code:"LOPENH", label:"Ladies Open",        sub:"HOME UNIVERSITY" },
  { code:"TFWS",   label:"Tuition Fee Waiver", sub:"SPECIAL" },
  { code:"EWS",    label:"EWS",                sub:"SPECIAL" },
  { code:"DEFOPENS",label:"Defence",           sub:"SPECIAL" },
  { code:"PWDOPENS",label:"PWD",               sub:"SPECIAL" },
];

const HU_CATS  = ["GOPENH","GOBCH","LOPENH"];
const HU_TYPES = [
  "Home University Seats Allotted to Home University Candidates",
  "Home University Seats Allotted to Other Than Home University Candidates",
];
const CAP_CLR  = { 1:"#f97316", 2:"#8b5cf6", 3:"#14b8a6" };
const HERO_IMG = "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=90&fit=crop&crop=center";

// ─── College Info Lookup ─────────────────────────────────────────────────────
// NAAC grades for well-known Maharashtra engineering colleges (by partial name match)
const NAAC_DATA = [
  { match:"College of Engineering, Pune|COEP",          grade:"A++", color:"#15803d", bg:"#dcfce7" },
  { match:"Veermata Jijabai|VJTI",                      grade:"A++", color:"#15803d", bg:"#dcfce7" },
  { match:"Institute of Chemical Technology|ICT",       grade:"A++", color:"#15803d", bg:"#dcfce7" },
  { match:"Walchand College",                           grade:"A+",  color:"#16a34a", bg:"#dcfce7" },
  { match:"Sardar Patel College",                       grade:"A+",  color:"#16a34a", bg:"#dcfce7" },
  { match:"Pune Institute of Computer Technology|PICT", grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Symbiosis Institute of Technology",          grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Vishwakarma Institute of Technology|VIT Pune",grade:"A",  color:"#d97706", bg:"#fef9c3" },
  { match:"Maharashtra Institute of Technology|MIT ",   grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Dr. D.Y. Patil|DY Patil",                   grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Pimpri Chinchwad College|PCCOE",             grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Sinhgad College of Engineering",             grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"Sinhgad Institute",                          grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"K.K. Wagh|KK Wagh",                         grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"Savitribai Phule|SPPU",                      grade:"A+",  color:"#16a34a", bg:"#dcfce7" },
  { match:"Government College of Engineering, Amravati",grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Government College of Engineering, Aurangabad",grade:"A", color:"#d97706", bg:"#fef9c3" },
  { match:"Government College of Engineering, Karad",   grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Government College of Engineering, Nagpur",  grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Shri Guru Gobind Singhji|SGGSIE",            grade:"A+",  color:"#16a34a", bg:"#dcfce7" },
  { match:"Army Institute of Technology",               grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Fr. C. Rodrigues|Rodrigues",                 grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Don Bosco",                                  grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"Shah and Anchor",                            grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"Thadomal Shahani",                           grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"Nagpur Institute of Technology",             grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"Yeshwantrao Chavan|YCCE",                    grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Ramrao Adik",                                grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Lokmanya Tilak|LTCE",                        grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"Bhartiya Vidyapeeth|BVP",                    grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Cummins College",                            grade:"A",   color:"#d97706", bg:"#fef9c3" },
  { match:"Indira College",                             grade:"B++", color:"#9333ea", bg:"#f3e8ff" },
  { match:"Trinity Academy",                            grade:"B+",  color:"#dc2626", bg:"#fee2e2" },
  { match:"Zeal College",                               grade:"B+",  color:"#dc2626", bg:"#fee2e2" },
];

function getNAAC(collegeName = "") {
  const name = collegeName.toLowerCase();
  for (const { match, grade, color, bg } of NAAC_DATA) {
    if (match.split("|").some(m => name.includes(m.toLowerCase()))) {
      return { grade, color, bg };
    }
  }
  return null;
}

// College type: Autonomous / Deemed / Govt / Private
function getCollegeType(collegeName = "") {
  const n = collegeName.toLowerCase();
  if (/deemed|institute of technology.*deemed|university/i.test(collegeName)) return { label:"Deemed", color:"#7c3aed", bg:"#faf5ff" };
  if (/autonomous/i.test(collegeName))                                          return { label:"Autonomous", color:"#0891b2", bg:"#e0f2fe" };
  if (/government|govt|gec|coep|vjti|national institute/i.test(collegeName))   return { label:"Govt", color:"#15803d", bg:"#dcfce7" };
  return                                                                               { label:"Private", color:"#888", bg:"#f5f5f5" };
}

// Estimated avg placement package for known colleges (LPA)
const PLACEMENT_DATA = [
  { match:"COEP|College of Engineering, Pune",           lpa:"12–35" },
  { match:"VJTI|Veermata Jijabai",                       lpa:"10–30" },
  { match:"ICT|Institute of Chemical Technology",        lpa:"8–28"  },
  { match:"PICT|Pune Institute of Computer Technology",  lpa:"8–22"  },
  { match:"Symbiosis Institute of Technology",           lpa:"7–20"  },
  { match:"VIT Pune|Vishwakarma Institute of Technology",lpa:"7–18"  },
  { match:"MIT |Maharashtra Institute of Technology",    lpa:"6–18"  },
  { match:"Army Institute of Technology",                lpa:"7–20"  },
  { match:"Walchand College",                            lpa:"7–18"  },
  { match:"SGGSIE|Shri Guru Gobind Singhji",             lpa:"6–16"  },
  { match:"Ramrao Adik",                                 lpa:"6–16"  },
  { match:"Cummins College",                             lpa:"6–15"  },
  { match:"Sinhgad College of Engineering",              lpa:"4–12"  },
  { match:"PCCOE|Pimpri Chinchwad",                      lpa:"5–15"  },
  { match:"K.K. Wagh|KK Wagh",                           lpa:"4–12"  },
  { match:"Sardar Patel College",                        lpa:"5–14"  },
  { match:"YCCE|Yeshwantrao Chavan",                     lpa:"5–13"  },
  { match:"Bhartiya Vidyapeeth|BVP",                     lpa:"4–12"  },
  { match:"Fr. C. Rodrigues|Rodrigues",                  lpa:"5–14"  },
  { match:"Thadomal Shahani",                            lpa:"5–14"  },
  { match:"Shah and Anchor",                             lpa:"4–12"  },
  { match:"Don Bosco",                                   lpa:"4–11"  },
  { match:"Lokmanya Tilak|LTCE",                         lpa:"4–11"  },
  { match:"Government College of Engineering",           lpa:"5–14"  },
];

function getPlacement(collegeName = "") {
  for (const { match, lpa } of PLACEMENT_DATA) {
    if (match.split("|").some(m => collegeName.toLowerCase().includes(m.toLowerCase()))) {
      return lpa;
    }
  }
  return null;
}
const MH_CITIES = [
  "Ahmednagar","Akola","Amravati","Aurangabad","Beed","Buldhana","Chandrapur",
  "Dhule","Jalgaon","Kolhapur","Latur","Mumbai","Nagpur","Nanded","Nashik",
  "Navi Mumbai","Osmanabad","Palghar","Pune","Raigad","Ratnagiri","Sangli",
  "Satara","Solapur","Thane","Wardha","Yavatmal",
];

// ─── Global CSS ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { overflow-x: hidden; font-family: 'DM Sans', system-ui, sans-serif; background: #f2ede7; transition: background 0.3s, color 0.3s; }

  /* ── Dark mode ── */
  body.dark { background: #0f0f14 !important; color: #e0d8d0; }
  body.dark .dm-card   { background: #1c1a22 !important; border-color: #2d2a36 !important; }
  body.dark .dm-surface { background: #141218 !important; }
  body.dark .dm-border  { border-color: #2d2a36 !important; }
  body.dark .dm-muted   { color: #998f88 !important; }
  body.dark .dm-chip    { background: #252230 !important; border-color: #2d2a36 !important; color: #998f88 !important; }
  body.dark .dm-chip.on { background: #f97316 !important; color: #fff !important; border-color: #f97316 !important; }
  body.dark .dm-input   { background: #1c1a22 !important; border-color: #2d2a36 !important; color: #e0d8d0 !important; }
  body.dark .dm-input::placeholder { color: #4a4550 !important; }
  body.dark .dm-link    { background: #252230 !important; border-color: #2d2a36 !important; color: #998f88 !important; }
  body.dark .dm-link:hover { border-color: #f97316 !important; color: #f97316 !important; }
  body.dark .cat-btn    { background: #252230 !important; border-color: #2d2a36 !important; color: #998f88 !important; }
  body.dark .cat-btn.sel { background: #f97316 !important; color: #fff !important; border-color: #f97316 !important; }
  body.dark .chip       { background: #252230 !important; border-color: #2d2a36 !important; color: #998f88 !important; }
  body.dark .chip.on    { background: #f97316 !important; color: #fff !important; border-color: #f97316 !important; }
  body.dark .dp-portal  { background: #1c1a22 !important; border-color: #2d2a36 !important; }
  body.dark .dp-search  { background: #1c1a22 !important; border-color: #2d2a36 !important; }
  body.dark .opt-row    { color: #998f88 !important; }
  body.dark .opt-row:hover { background: #25222f !important; }
  body.dark .opt-group-hdr { color: #998f88 !important; border-color: #2d2a36 !important; }
  body.dark .opt-group-hdr:hover { background: #25222f !important; }
  body.dark h1, body.dark h2, body.dark h3 { color: #e0d8d0 !important; }

  /* ── Skeleton shimmer ── */
  @keyframes skelShim { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
  .skel { background: linear-gradient(90deg, #ede8e1 25%, #e0dbd3 50%, #ede8e1 75%); background-size:400px 100%; animation: skelShim 1.3s ease infinite; border-radius: 6px; }
  body.dark .skel { background: linear-gradient(90deg, #252230 25%, #2d2a36 50%, #252230 75%); background-size:400px 100%; }

  input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #f9731633; border-radius: 10px; }

  @keyframes fadeUp  { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes bounceY { 0%,100% { transform:translateX(-50%) translateY(0); } 50% { transform:translateX(-50%) translateY(7px); } }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes shimmer { 0% { background-position:-600px 0; } 100% { background-position:600px 0; } }
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes quoteIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  input, select, button { font-family: inherit; }

  .cat-btn {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 13px; border-radius: 8px; border: 1.5px solid #e0d9d0;
    background: #fff; color: #555; font-size: 13px; font-weight: 500;
    cursor: pointer; transition: all 0.14s; white-space: nowrap;
  }
  .cat-btn:hover { border-color: #f97316; color: #f97316; background: #fff8f2; }
  .cat-btn.sel   { background: #f97316; border-color: #f97316; color: #fff; box-shadow: 0 3px 14px rgba(249,115,22,0.28); }

  .chip { padding: 6px 13px; border-radius: 7px; border: 1.5px solid #e0d9d0; background: #fff; color: #888; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.14s; }
  .chip:hover { border-color: #f97316; color: #f97316; }
  .chip.on    { background: #f97316; border-color: #f97316; color: #fff; }

  .inp-focus:focus { outline: none; border-color: #f97316 !important; box-shadow: 0 0 0 3px rgba(249,115,22,0.1) !important; }

  .big-btn { transition: all 0.2s; }
  .big-btn:not(:disabled):hover { background: #e8720a !important; box-shadow: 0 6px 28px rgba(249,115,22,0.4) !important; transform: translateY(-1px); }

  .card-lift { transition: box-shadow 0.2s, transform 0.2s; }
  .card-lift:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.13) !important; transform: translateY(-3px); }

  .opt-row { display: flex; align-items: center; gap: 9px; padding: 9px 14px; cursor: pointer; font-size: 13px; color: #444; transition: background 0.1s; }
  .opt-row:hover { background: #fff8f2; }
  .opt-row.checked { color: #c2410c; }
  .opt-group-hdr { display: flex; align-items: center; gap: 8px; padding: 9px 14px 5px; cursor: pointer; font-size: 12px; font-weight: 700; color: #555; transition: background 0.1s; border-top: 1px solid #f5f0eb; }
  .opt-group-hdr:hover { background: #fff8f2; }
  .opt-group-hdr.all-checked { color: #c2410c; }

  .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px 3px 10px; border-radius: 6px; background: #fff3ea; border: 1px solid #fed7aa; color: #c2410c; font-size: 12px; font-weight: 600; }
  .tag button { background: none; border: none; cursor: pointer; color: #f97316; padding: 0; line-height: 1; font-size: 15px; display: flex; align-items: center; }

  .dp-portal { position: fixed; z-index: 99999; background: #fff; border-radius: 12px; border: 1px solid #ede6dc; box-shadow: 0 8px 40px rgba(0,0,0,0.18); overflow: hidden; animation: fadeUp 0.15s ease; }
  .dp-scroll { overflow-y: auto; }
  .dp-search { position: sticky; top: 0; background: #fff; padding: 10px 12px; border-bottom: 1px solid #f0e9e0; z-index: 1; }

  /* CAP round pill table */
  .cap-pill { display: inline-flex; flex-direction: column; align-items: center; padding: 6px 12px; border-radius: 10px; min-width: 72px; border: 1.5px solid; }
  .cap-pill-val { font-size: 15px; font-weight: 800; font-family: monospace; line-height: 1; }
  .cap-pill-lbl { font-size: 9px; font-weight: 700; margin-top: 3px; opacity: 0.7; letter-spacing: 0.05em; }

  @media (max-width: 640px) {
    .hero-h { font-size: clamp(40px,12vw,64px) !important; }
    .hero-stats { gap: 28px !important; }
    .grid-2col { grid-template-columns: 1fr !important; }
    .form-pad { padding: 20px 16px !important; }
    .res-hdr { flex-direction: column !important; align-items: flex-start !important; }
    .sum-grid { grid-template-columns: repeat(2,1fr) !important; }
    .card-body { flex-direction: column !important; }
    .card-right { text-align: left !important; border-top: 1px solid #f5f0eb; padding-top: 10px; margin-top: 8px; }
    .nav-p { padding: 12px 16px !important; }
    .dl-lbl { display: none; }
    .cap-rounds-row { flex-wrap: wrap !important; }
  }
`;

// ─── Hooks ──────────────────────────────────────────────────────────────────
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const fn = () => setY(window.scrollY);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return y;
}

function useInView(ref) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return v;
}

// ── Dark mode ──
function useDark() {
  const [dark, setDark] = useState(() => {
    try { return localStorage.getItem("vr_dark") === "1"; } catch { return false; }
  });
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    try { localStorage.setItem("vr_dark", dark ? "1" : "0"); } catch {}
  }, [dark]);
  return [dark, setDark];
}

// ── Skeleton Card (shown while loading) ──
function SkeletonCard() {
  return (
    <div style={{ background:"#fff", border:"1px solid #ede6dc", borderRadius:18, overflow:"hidden", marginBottom:2 }} className="dm-card">
      <div style={{ padding:"12px 20px", background:"#fafaf8", borderBottom:"1px solid #f5f0eb", display:"flex", gap:12, alignItems:"center" }}>
        <div className="skel" style={{ width:36, height:36, borderRadius:10, flexShrink:0 }} />
        <div style={{ flex:1 }}>
          <div className="skel" style={{ height:12, width:"45%", marginBottom:7 }} />
          <div className="skel" style={{ height:10, width:"28%" }} />
        </div>
      </div>
      <div style={{ padding:"16px 20px" }}>
        <div className="skel" style={{ height:17, width:"72%", marginBottom:9 }} />
        <div className="skel" style={{ height:11, width:"38%", marginBottom:14 }} />
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          {[1,2,3].map(i => <div key={i} className="skel" style={{ height:58, width:76, borderRadius:10 }} />)}
        </div>
        <div style={{ display:"flex", gap:7 }}>
          {[1,2,3].map(i => <div key={i} className="skel" style={{ height:28, width:90, borderRadius:7 }} />)}
        </div>
      </div>
    </div>
  );
}

function Counter({ end, suffix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const vis = useInView(ref);
  useEffect(() => {
    if (!vis) return;
    let s = null;
    const step = ts => {
      if (!s) s = ts;
      const p = Math.min((ts - s) / 1400, 1);
      setVal(Math.floor(end * (1 - Math.pow(1 - p, 4))));
      if (p < 1) requestAnimationFrame(step); else setVal(end);
    };
    requestAnimationFrame(step);
  }, [vis]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Dropdown Portal ─────────────────────────────────────────────────────────
function DropdownPortal({ triggerRef, open, children, width }) {
  const [pos, setPos] = useState({ top: 0, left: 0, w: 0 });
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropH = 360;
    const openUp = spaceBelow < dropH && rect.top > dropH;
    setPos({ top: openUp ? rect.top - dropH - 4 : rect.bottom + 4, left: rect.left, w: rect.width });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const fn = () => {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropH = 360;
      const openUp = spaceBelow < dropH && rect.top > dropH;
      setPos({ top: openUp ? rect.top - dropH - 4 : rect.bottom + 4, left: rect.left, w: rect.width });
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, [open]);
  if (!open) return null;
  return (
    <div className="dp-portal" style={{ top: pos.top, left: pos.left, width: Math.max(pos.w, width || 0), maxHeight: 360 }}>
      {children}
    </div>
  );
}

// ─── Multi-select ────────────────────────────────────────────────────────────
function MultiSelect({ values, onChange, flatOptions, groupedOptions, placeholder, icon }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef  = useRef(null);
  const trigRef  = useRef(null);

  useEffect(() => {
    const fn = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  const toggle = v => onChange(values.includes(v) ? values.filter(x => x !== v) : [...values, v]);
  const toggleGroup = (groupBranches) => {
    const allIn = groupBranches.every(b => values.includes(b));
    if (allIn) onChange(values.filter(v => !groupBranches.includes(v)));
    else { const toAdd = groupBranches.filter(b => !values.includes(b)); onChange([...values, ...toAdd]); }
  };
  const clearAll = e => { e.stopPropagation(); onChange([]); };
  const q = search.toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!groupedOptions) return null;
    const out = {};
    Object.entries(groupedOptions).forEach(([grp, opts]) => {
      const m = opts.filter(o => !q || o.toLowerCase().includes(q) || grp.toLowerCase().includes(q));
      if (m.length) out[grp] = m;
    });
    return out;
  }, [groupedOptions, q]);

  const filteredFlat = useMemo(() => {
    if (!flatOptions) return null;
    return !q ? flatOptions : flatOptions.filter(o => o.toLowerCase().includes(q));
  }, [flatOptions, q]);

  const hasVal = values.length > 0;

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div ref={trigRef} onClick={() => { setOpen(o => !o); setSearch(""); }}
        className="inp-focus"
        style={{ minHeight: 42, padding: hasVal ? "6px 10px" : "10px 14px", border: `1.5px solid ${open ? "#f97316" : "#e0d9d0"}`, borderRadius: 10, background: "#faf7f3", cursor: "pointer", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 5, boxShadow: open ? "0 0 0 3px rgba(249,115,22,0.1)" : "none", transition: "all 0.16s" }}>
        {icon && !hasVal && <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>}
        {hasVal
          ? values.map(v => (<span key={v} className="tag">{v}<button onMouseDown={e => { e.stopPropagation(); toggle(v); }}>×</button></span>))
          : <span style={{ fontSize: 13, color: "#bbb", flex: 1 }}>{placeholder}</span>
        }
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          {hasVal && <span onMouseDown={clearAll} style={{ fontSize: 12, color: "#ccc", cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>✕</span>}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.18s" }}>
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </div>
      </div>
      <DropdownPortal triggerRef={trigRef} open={open} width={300}>
        <div className="dp-search">
          <div style={{ position: "relative" }}>
            <input autoFocus placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} onMouseDown={e => e.stopPropagation()} style={{ width: "100%", padding: "7px 10px 7px 30px", border: "1.5px solid #f0e9e0", borderRadius: 8, fontSize: 13, color: "#1a0a00", background: "#faf7f3", outline: "none" }} />
            <svg style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
          {hasVal && (
            <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {values.slice(0, 3).map(v => (<span key={v} className="tag" style={{ fontSize: 11 }}>{v}<button onMouseDown={e => { e.stopPropagation(); toggle(v); }}>×</button></span>))}
              {values.length > 3 && <span style={{ fontSize: 11, color: "#f97316", fontWeight: 600 }}>+{values.length - 3} more</span>}
            </div>
          )}
        </div>
        <div className="dp-scroll" style={{ maxHeight: hasVal ? 210 : 270 }}>
          {filteredGroups && Object.entries(filteredGroups).map(([grp, opts]) => {
            const allChecked = opts.every(b => values.includes(b));
            const someChecked = opts.some(b => values.includes(b));
            return (
              <div key={grp}>
                <div className={`opt-group-hdr ${allChecked ? "all-checked" : ""}`} onMouseDown={e => { e.stopPropagation(); toggleGroup(opts); }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, transition: "all 0.12s", border: `2px solid ${allChecked ? "#f97316" : someChecked ? "#f97316" : "#e0d9d0"}`, background: allChecked ? "#f97316" : someChecked ? "#fff3ea" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {allChecked && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    {someChecked && !allChecked && <div style={{ width: 8, height: 2, background: "#f97316", borderRadius: 1 }} />}
                  </div>
                  <span style={{ fontWeight: 700 }}>{grp}</span>
                  <span style={{ fontSize: 10, color: "#bbb", marginLeft: "auto" }}>{opts.length}</span>
                </div>
                {opts.map(opt => (
                  <div key={opt} className={`opt-row ${values.includes(opt) ? "checked" : ""}`} style={{ paddingLeft: 32 }} onMouseDown={e => { e.stopPropagation(); toggle(opt); }}>
                    <div style={{ width: 15, height: 15, borderRadius: 4, flexShrink: 0, transition: "all 0.12s", border: `2px solid ${values.includes(opt) ? "#f97316" : "#e0d9d0"}`, background: values.includes(opt) ? "#f97316" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {values.includes(opt) && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
                    </div>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{opt}</span>
                  </div>
                ))}
              </div>
            );
          })}
          {filteredFlat && filteredFlat.map(opt => (
            <div key={opt} className={`opt-row ${values.includes(opt) ? "checked" : ""}`} onMouseDown={e => { e.stopPropagation(); toggle(opt); }}>
              <div style={{ width: 15, height: 15, borderRadius: 4, flexShrink: 0, border: `2px solid ${values.includes(opt) ? "#f97316" : "#e0d9d0"}`, background: values.includes(opt) ? "#f97316" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {values.includes(opt) && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
              </div>
              {opt}
            </div>
          ))}
          {filteredGroups && Object.keys(filteredGroups).length === 0 && !filteredFlat && (
            <div style={{ padding: "20px", textAlign: "center", fontSize: 13, color: "#bbb" }}>No results</div>
          )}
          {filteredFlat && filteredFlat.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", fontSize: 13, color: "#bbb" }}>No results</div>
          )}
        </div>
      </DropdownPortal>
    </div>
  );
}

// ─── PDF Download ────────────────────────────────────────────────────────────
function downloadPDF(results, cat, catLabel, pct) {
  const now = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const rows = results.map((item, i) => {
    const cutoff    = item._rankCutoff;
    const rounds    = item._rounds || {};          // ← was missing
    const diff      = pct - cutoff;               // ← was missing (positive = user above cutoff)
    const aboveDiff = cutoff - pct;               // positive = cutoff above user
    const pri    = (i < 6 && aboveDiff > 4) ? "🎯 Try First!"
                 : aboveDiff > 4             ? "↑↑ Well Above"
                 : aboveDiff > 0             ? "↗ Just Above"
                 : diff < 2                  ? "~ Close Match"
                 : diff < 4                  ? "✓ Safe"
                 :                             "✅ Highly Safe";
    const priColor = aboveDiff > 4  ? "#7c3aed"
                   : aboveDiff > 0  ? "#9333ea"
                   : diff < 2       ? "#d97706"
                   : diff < 4       ? "#16a34a"
                   :                  "#15803d";
    const cap1   = rounds[1] ? rounds[1].toFixed(2) : "—";
    const cap2   = rounds[2] ? rounds[2].toFixed(2) : "—";
    const cap3   = rounds[3] ? rounds[3].toFixed(2) : "—";
    const gapStr = (diff >= 0 ? "+" : "") + diff.toFixed(2) + "%";
    return { i, item, cutoff, diff, aboveDiff, pri, priColor, cap1, cap2, cap3, gapStr };
  });

  const tableRows = rows.map(({ i, item, cutoff, diff, aboveDiff, pri, priColor, cap1, cap2, cap3, gapStr }) => `
    <tr class="${(i < 6 && aboveDiff > 4) ? "tf" : ""}">
      <td class="c" style="font-weight:900;color:#888;">${i + 1}</td>
      <td>
        <div class="cn">${item["College Name"] || ""}</div>
        <div class="cm">📍 ${item.City || "—"} &nbsp;|&nbsp; Code: ${item["College Code"] || "—"}</div>
        <div class="cb">${item["Branch Name"] || ""}</div>
      </td>
      <td class="c mono" style="color:#f97316;">${cap1}</td>
      <td class="c mono" style="color:#8b5cf6;">${cap2}</td>
      <td class="c mono" style="color:#14b8a6;">${cap3}</td>
      <td class="c mono" style="color:${diff >= 0 ? "#16a34a" : "#dc2626"};">${gapStr}</td>
      <td class="c"><span class="badge" style="color:${priColor};background:${priColor}18;">${pri}</span></td>
    </tr>
  `).join("");

  const tryFirstCount = Math.min(6, rows.filter(r => r.aboveDiff > 4).length);
  const appURL = "https://vidya-rank.vercel.app/";

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>CAP Preference List — Vidhya Rank</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #fff; color: #1a0a00; font-size: 13px; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
  .watermark {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-30deg);
    font-size: 80px; font-weight: 900; color: rgba(249,115,22,0.055);
    pointer-events: none; z-index: 0; white-space: nowrap;
  }
  .wrap { position: relative; z-index: 1; padding: 28px 32px; max-width: 1050px; margin: 0 auto; }
  .hdr { display:flex; justify-content:space-between; align-items:flex-start; border-bottom: 2px solid #f5f0eb; padding-bottom: 16px; margin-bottom: 16px; }
  .logo-name { font-size: 24px; font-weight: 900; color: #1a0a00; }
  .logo-name span { color: #f97316; }
  .logo-url { font-size: 10px; color: #aaa; margin-top: 2px; }
  .logo-tagline { font-size: 10px; color: #888; margin-top: 2px; }
  .hdr-right { text-align: right; }
  .hdr-title { font-size: 12px; font-weight: 700; color: #555; }
  .hdr-date { font-size: 10px; color: #bbb; margin-top: 2px; }
  .info-row { display: flex; gap: 10px; margin-bottom: 16px; }
  .info-box { flex: 1; background: #faf7f3; border: 1px solid #ede6dc; border-radius: 8px; padding: 9px 12px; }
  .info-lbl { font-size: 9px; color: #bbb; font-weight: 700; letter-spacing: 0.1em; margin-bottom: 3px; text-transform: uppercase; }
  .info-val { font-size: 16px; font-weight: 800; color: #1a0a00; }
  .howto { background: #faf5ff; border: 1.5px solid #ddd6fe; border-radius: 8px; padding: 12px 14px; margin-bottom: 14px; }
  .howto-title { font-size: 11px; font-weight: 800; color: #7c3aed; margin-bottom: 8px; }
  .howto-step { display: flex; gap: 7px; align-items: flex-start; margin-bottom: 6px; }
  .howto-num { width: 18px; height: 18px; border-radius: 4px; font-size: 9px; font-weight: 900; color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .howto-text { font-size: 10.5px; color: #444; line-height: 1.5; }
  .legend { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; align-items: center; }
  .leg { display: flex; align-items: center; gap: 4px; font-size: 10px; color: #555; }
  .leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead tr { background: linear-gradient(90deg,#7c3aed,#f97316); }
  thead th { color: #fff; font-weight: 700; padding: 9px 8px; text-align: left; font-size: 10px; letter-spacing: 0.04em; }
  thead th.c { text-align: center; }
  tbody tr:nth-child(even) { background: #fafaf8; }
  tbody tr.tf { border-left: 3px solid #7c3aed; background: #faf5ff !important; }
  td { padding: 8px 8px; border-bottom: 1px solid #f0ebe3; vertical-align: top; }
  td.c { text-align: center; }
  .cn { font-weight: 700; font-size: 11px; color: #1a0a00; line-height: 1.3; }
  .cm { font-size: 9px; color: #999; margin-top: 2px; }
  .cb { font-size: 9px; color: #555; background: #f5f0eb; display: inline-block; padding: 1px 5px; border-radius: 3px; margin-top: 2px; }
  .badge { font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 10px; white-space: nowrap; }
  .mono { font-family: monospace; font-weight: 700; font-size: 11px; }
  .footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #f0e9e0; display: flex; justify-content: space-between; align-items: center; }
  .fl { font-size: 9px; color: #bbb; line-height: 1.6; }
  .fr { font-size: 10px; color: #f97316; font-weight: 700; }
</style>
</head>
<body>
<div class="watermark">Vidhya Rank</div>
<div class="wrap">
  <div class="hdr">
    <div>
      <div class="logo-name">Vidhya <span>Rank</span></div>
      <div class="logo-url">https://vidya-rank.vercel.app/</div>
      <div class="logo-tagline">Find Your Best College Fit According to Your Rank</div>
    </div>
    <div class="hdr-right">
      <div class="hdr-title">MHT-CET CAP Preference List</div>
      <div class="hdr-date">Generated: ${now}</div>
    </div>
  </div>
  <div class="info-row">
    <div class="info-box"><div class="info-lbl">Your Percentile</div><div class="info-val" style="color:#f97316;">${pct}%ile</div></div>
    <div class="info-box"><div class="info-lbl">Category</div><div class="info-val" style="font-size:12px;">${catLabel} (${cat})</div></div>
    <div class="info-box"><div class="info-lbl">Total Colleges</div><div class="info-val">${results.length}</div></div>
    <div class="info-box"><div class="info-lbl">Try First (above +4%)</div><div class="info-val" style="color:#7c3aed;">${tryFirstCount}</div></div>
  </div>
  <div class="howto">
    <div class="howto-title">📋 How to Fill Your CAP Preference List</div>
    <div class="howto-step"><div class="howto-num" style="background:#7c3aed;">1</div><div class="howto-text"><b>Fill first 6 colleges first</b> — cutoff is 4%+ above you (e.g. 84+ if you have 80%). Try these in later CAP rounds when seats open.</div></div>
    <div class="howto-step"><div class="howto-num" style="background:#9333ea;">2</div><div class="howto-text"><b>Then add colleges just above &amp; at your rank</b> — cutoffs like 82, 81, 80. These are your most likely seats.</div></div>
    <div class="howto-step"><div class="howto-num" style="background:#d97706;">3</div><div class="howto-text"><b>Then fill colleges below your rank</b> — 79, 78, 77... Great backup options, high admission chance.</div></div>
    <div class="howto-step" style="margin-bottom:0;"><div class="howto-num" style="background:#15803d;">4</div><div class="howto-text"><b>Fill all remaining colleges last</b> — up to 500 preferences. More = safer. Never leave blanks!</div></div>
  </div>
  <div class="legend">
    <div class="leg"><div class="leg-dot" style="background:#7c3aed;"></div>🎯 Try First (4%+ above)</div>
    <div class="leg"><div class="leg-dot" style="background:#9333ea;"></div>↗ Just Above</div>
    <div class="leg"><div class="leg-dot" style="background:#d97706;"></div>~ Close Match</div>
    <div class="leg"><div class="leg-dot" style="background:#16a34a;"></div>✓ Safe</div>
    <div class="leg"><div class="leg-dot" style="background:#15803d;"></div>✅ Highly Safe</div>
    &nbsp;|&nbsp;
    <div class="leg"><div class="leg-dot" style="background:#f97316;"></div>CAP R1</div>
    <div class="leg"><div class="leg-dot" style="background:#8b5cf6;"></div>CAP R2</div>
    <div class="leg"><div class="leg-dot" style="background:#14b8a6;"></div>CAP R3</div>
  </div>
  <table>
    <thead>
      <tr>
        <th class="c" style="width:32px;">#</th>
        <th>College &amp; Branch</th>
        <th class="c">CAP 1</th>
        <th class="c">CAP 2</th>
        <th class="c">CAP 3</th>
        <th class="c">Gap</th>
        <th class="c">Status</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">
    <div class="fl">⚠️ Reference only. Verify on official DTE Maharashtra portal: <b>caps.dtemaharashtra.gov.in</b><br/>Data: MHT-CET CAP 2023–2024 (PDF-verified) | Vidhya Rank — https://vidya-rank.vercel.app/</div>
    <div class="fr">vidya-rank.vercel.app</div>
  </div>
</div>
</body>
</html>`;

  // Use hidden iframe to print — avoids popup blockers entirely
  const old = document.getElementById("__cap_print_frame");
  if (old) document.body.removeChild(old);
  const iframe = document.createElement("iframe");
  iframe.id = "__cap_print_frame";
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;border:none;";
  document.body.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  // Wait for fonts/styles to load then trigger print dialog
  setTimeout(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }, 800);
}

// ─── College Card ─────────────────────────────────────────────────────────────
function CollegeCard({ item, pct, cat, idx, dark }) {
  const cutoff    = item._rankCutoff;
  const diff      = pct - cutoff;
  const isFirst   = idx < 6 && (cutoff - pct) > 4;
  const rounds    = item._rounds || {};
  const aboveDiff = cutoff - pct;

  // Info badges
  const naac      = getNAAC(item["College Name"]);
  const colType   = getCollegeType(item["College Name"]);
  const placement = getPlacement(item["College Name"]);

  // Swipe-to-open-map on mobile
  const touchRef  = useRef(null);
  const swipeX    = useRef(0);
  const onTouchStart = e => { swipeX.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    const dx = swipeX.current - e.changedTouches[0].clientX;
    if (dx > 60) { // swipe left → open Maps
      const q = encodeURIComponent((item["College Name"] || "") + " " + (item.City || "") + " Maharashtra");
      window.open(`https://maps.google.com/?q=${q}`, "_blank");
    }
  };

  const st = isFirst              ? { c:"#7c3aed", bg:"#faf5ff", b:"#ddd6fe", l:"Try First! 🎯",  sym:"↑↑" }
           : aboveDiff > 4        ? { c:"#7c3aed", bg:"#faf5ff", b:"#ddd6fe", l:"Well Above You", sym:"↑↑" }
           : aboveDiff > 0        ? { c:"#9333ea", bg:"#fdf4ff", b:"#e9d5ff", l:"Just Above You", sym:"↗"  }
           : diff >= 0 && diff < 2? { c:"#d97706", bg:"#fffbeb", b:"#fde68a", l:"Close Match",    sym:"~"  }
           : diff >= 2 && diff < 4? { c:"#16a34a", bg:"#dcfce7", b:"#86efac", l:"Safe",           sym:"✓"  }
           :                        { c:"#15803d", bg:"#f0fdf4", b:"#86efac", l:"Highly Safe",    sym:"✓✓" };

  const gName = item["College Name"] || "";
  const gQ    = encodeURIComponent(gName + " Maharashtra");
  const mapsQ = encodeURIComponent(gName + " " + (item.City || "") + " Maharashtra");

  return (
    <div ref={touchRef}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
      className="card-lift dm-card"
      style={{
        background: "#fff",
        border: `1.5px solid ${isFirst ? "#ddd6fe" : "#ede6dc"}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: isFirst ? "0 6px 28px rgba(124,58,237,0.12)" : "0 2px 14px rgba(0,0,0,0.05)",
        opacity: 0,
        animation: `slideUp 0.38s ease ${Math.min(idx, 18) * 0.042}s forwards`,
      }}>

      {/* ── Status bar ── */}
      <div style={{
        background: isFirst ? "linear-gradient(90deg,#f5f3ff,#faf5ff)" : st.bg,
        padding: "10px 16px",
        borderBottom: `1px solid ${isFirst ? "#e9d5ff" : st.b + "60"}`,
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: isFirst ? "linear-gradient(135deg,#7c3aed,#a855f7)" : st.bg,
            border: `2px solid ${isFirst ? "transparent" : st.b}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: isFirst ? "#fff" : st.c, fontFamily: "monospace",
            boxShadow: isFirst ? "0 3px 12px rgba(124,58,237,0.35)" : "none",
          }}>#{idx + 1}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: st.c }}>{st.sym} {st.l}</span>
              {isFirst && <span style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", background: "#fff", padding: "2px 7px", borderRadius: 20, border: "1px solid #ddd6fe" }}>TRY FIRST</span>}
            </div>
            <span style={{ fontSize: 11, color: st.c, fontFamily: "monospace", fontWeight: 700 }}>
              Gap: <b style={{ color: diff >= 0 ? "#16a34a" : "#dc2626", fontSize: 13 }}>{diff >= 0 ? "+" : ""}{diff.toFixed(2)}%</b>
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {/* NAAC badge */}
          {naac && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: naac.bg, color: naac.color, border: `1px solid ${naac.color}33` }}>
              NAAC {naac.grade}
            </span>
          )}
          {/* College type */}
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: colType.bg, color: colType.color }}>
            {colType.label}
          </span>
          <span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>📅 {item.Year}</span>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "14px 16px 12px" }}>
        {/* College name */}
        <h3 style={{ fontSize: 15, fontWeight: 800, color: "#1a0a00", lineHeight: 1.35, marginBottom: 7, fontFamily: "'Playfair Display', serif" }}>
          {item["College Name"]}
        </h3>

        {/* Meta + placement */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10, alignItems: "center" }}>
          {item.City && item.City !== "Other" && (
            <span style={{ fontSize: 12, color: "#888", display: "flex", alignItems: "center", gap: 3 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {item.City}
            </span>
          )}
          <span style={{ fontSize: 11, color: "#bbb" }}>#{item["College Code"]}</span>
          <span style={{ fontSize: 11, color: "#bbb" }}>{(item["Seat Type"] || "").includes("Home") ? "🏠 Home" : "🌐 State"}</span>
          {/* Placement */}
          {placement && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0891b2", background: "#e0f7fa", padding: "2px 8px", borderRadius: 5, display: "flex", alignItems: "center", gap: 3 }}>
              💼 {placement} LPA avg
            </span>
          )}
        </div>

        {/* Branch chip */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#f5f0eb", borderRadius: 7, padding: "5px 11px", marginBottom: 13 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          <span style={{ fontSize: 12, color: "#444", fontWeight: 600 }}>{item["Branch Name"]}</span>
        </div>

        {/* Mobile swipe hint */}
        <div style={{ fontSize: 10, color: "#ccc", marginBottom: 8, display: "none" }} className="swipe-hint">← swipe left to open Maps</div>

        {/* CAP Round Cutoffs */}
        <div style={{ marginBottom: 13 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#bbb", letterSpacing: "0.1em", marginBottom: 8 }}>ALL CAP ROUND CUTOFFS ({cat})</div>
          <div className="cap-rounds-row" style={{ display: "flex", gap: 8 }}>
            {[1, 2, 3].map(cap => {
              const cv = rounds[cap];
              const hasData = cv && !isNaN(cv) && cv > 0;
              const capGap = hasData ? (pct - cv) : null;
              const cc = CAP_CLR[cap] || "#888";
              return (
                <div key={cap} className="cap-pill" style={{ borderColor: hasData ? cc + "55" : "#f0ebe3", background: hasData ? cc + "0D" : "#fafafa" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: cc, marginBottom: 4 }}>CAP {cap}</div>
                  {hasData ? (
                    <>
                      <div className="cap-pill-val" style={{ color: "#1a0a00" }}>{cv.toFixed(2)}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: capGap >= 0 ? "#16a34a" : "#dc2626", marginTop: 3, fontFamily: "monospace" }}>
                        {capGap >= 0 ? "+" : ""}{capGap.toFixed(2)}%
                      </div>
                    </>
                  ) : <div className="cap-pill-val" style={{ color: "#ddd", fontSize: 13 }}>—</div>}
                </div>
              );
            })}
            <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: 2 }}>
              <div style={{ fontSize: 10, color: "#ccc", fontWeight: 700 }}>BEST CUTOFF</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#1a0a00", fontFamily: "monospace", lineHeight: 1 }}>{cutoff.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: "#bbb" }}>percentile</div>
            </div>
          </div>
        </div>

        {/* Links — now includes Google Maps */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", borderTop: "1px solid #f5f0eb", paddingTop: 11 }}>
          {[
            { href: `https://www.google.com/search?q=${gQ}`,                                                          label: "🔗 Info"      },
            { href: `https://www.google.com/search?q=${encodeURIComponent(gName + " placement packages")}`,            label: "📊 Placements" },
            { href: `https://maps.google.com/?q=${mapsQ}`,                                                             label: "📍 Maps"      },
            { href: "https://caps.dtemaharashtra.gov.in",                                                              label: "🏛 CAP"       },
          ].map(({ href, label }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer"
              className="dm-link"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 7, border: "1.5px solid #e0d9d0", background: "#fff", color: "#666", fontSize: 11, fontWeight: 600, textDecoration: "none", transition: "all 0.13s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ""; e.currentTarget.style.color = ""; }}>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Results Page ─────────────────────────────────────────────────────────────
function ResultsPage({ results, pct, cat, year, capRnd, selBranches, selCities, onBack, dark, toggleDark }) {
  const [filterText, setFilterText] = useState("");
  const catObj = CATEGORIES.find(c => c.code === cat);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const shown = useMemo(() => {
    if (!filterText.trim()) return results;
    const q = filterText.toLowerCase();
    return results.filter(r =>
      (r["College Name"] || "").toLowerCase().includes(q) ||
      (r["Branch Name"]  || "").toLowerCase().includes(q) ||
      (r.City            || "").toLowerCase().includes(q)
    );
  }, [results, filterText]);

  // Groups — ordered: highly safe (+4), safe (+2), close (0), reach (<0)
  const groups = useMemo(() => [
    {
      key: "above4", label: "🎯 Well Above You — Try These First! (Cutoff 4%+ above you, e.g. 84+ if you have 80%)",
      color: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe",
      desc: "These colleges have cutoffs 4%+ above your percentile. Ambitious choices — fill these FIRST in your CAP list.",
      items: shown.filter(r => (r._rankCutoff - pct) > 4),
    },
    {
      key: "justabove", label: "↗ Just Above You (Cutoff 0–4% above you, e.g. 80–84 if you have 80%)",
      color: "#9333ea", bg: "#fdf4ff", border: "#e9d5ff",
      desc: "Cutoff is just above your percentile — aspirational but reachable. Fill these next.",
      items: shown.filter(r => { const d = r._rankCutoff - pct; return d > 0 && d <= 4; }),
    },
    {
      key: "close", label: "~ Close Match (Cutoff within 2% below you, e.g. 78–80 if you have 80%)",
      color: "#d97706", bg: "#fffbeb", border: "#fde68a",
      desc: "Cutoff is just at or slightly below your percentile — strong admission chances.",
      items: shown.filter(r => { const d = pct - r._rankCutoff; return d >= 0 && d < 2; }),
    },
    {
      key: "safe", label: "✓ Safe (Cutoff 2–4% below you)",
      color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0",
      desc: "Comfortably above cutoff. Good backup options.",
      items: shown.filter(r => { const d = pct - r._rankCutoff; return d >= 2 && d < 4; }),
    },
    {
      key: "verysafe", label: "✅ Highly Safe (Cutoff 4%+ below you)",
      color: "#15803d", bg: "#f0fdf4", border: "#86efac",
      desc: "Near-guaranteed admission. Put these last as solid backups.",
      items: shown.filter(r => (pct - r._rankCutoff) >= 4),
    },
  ].filter(g => g.items.length > 0), [shown, pct]);

  const groupsWithIdx = useMemo(() => {
    let idx = 0;
    return groups.map(g => {
      const itemsWithIdx = g.items.map(item => ({ item, idx: idx++ }));
      return { ...g, itemsWithIdx };
    });
  }, [groups]);

  const counts = {
    above4:   groupsWithIdx.find(g => g.key === "above4")?.items.length    || 0,
    justabove:groupsWithIdx.find(g => g.key === "justabove")?.items.length || 0,
    close:    groupsWithIdx.find(g => g.key === "close")?.items.length     || 0,
    safe:     groupsWithIdx.find(g => g.key === "safe")?.items.length      || 0,
    verysafe: groupsWithIdx.find(g => g.key === "verysafe")?.items.length  || 0,
  };

  return (
    <div style={{ background: dark ? "#0f0f14" : "#f2ede7", minHeight: "100vh" }}>

      {/* Sticky nav */}
      <nav className="nav-p dm-surface dm-border" style={{ position:"sticky",top:0,zIndex:200,background:dark?"rgba(15,15,20,0.97)":"rgba(242,237,231,0.95)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${dark?"#2d2a36":"#ede6dc"}`,padding:"12px 32px",display:"flex",alignItems:"center",gap:12,flexWrap:"wrap" }}>
        <button onClick={onBack}
          className="dm-link"
          style={{ display:"flex",alignItems:"center",gap:5,background:"#fff",border:"1.5px solid #e0d9d0",borderRadius:8,padding:"7px 14px",fontSize:13,fontWeight:600,color:"#555",cursor:"pointer",flexShrink:0 }}>
          ← Back
        </button>
        <span style={{ fontSize:18,fontWeight:900,color:dark?"#e0d8d0":"#1a0a00",fontFamily:"'Playfair Display',serif",flexShrink:0 }}>
          Vidhya <span style={{color:"#f97316"}}>Rank</span>
        </span>
        <div style={{ position:"relative",flex:1,minWidth:140 }}>
          <input placeholder="Filter colleges…" value={filterText} onChange={e=>setFilterText(e.target.value)}
            className="inp-focus dm-input"
            style={{ width:"100%",padding:"8px 12px 8px 32px",border:"1.5px solid #e0d9d0",borderRadius:8,fontSize:13,background:"#fff" }} />
          <svg style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </div>
        {/* 🌙 Dark toggle */}
        <button onClick={toggleDark}
          style={{ padding:"7px 13px",borderRadius:8,border:`1.5px solid ${dark?"#2d2a36":"#e0d9d0"}`,background:dark?"#252230":"#fff",color:dark?"#f5c542":"#888",fontSize:15,cursor:"pointer",flexShrink:0,fontWeight:600 }}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}>
          {dark ? "☀️" : "🌙"}
        </button>
        <button onClick={() => downloadPDF(results, cat, catObj?.label || cat, pct)}
          style={{ display:"flex",alignItems:"center",gap:6,background:"#f97316",color:"#fff",border:"none",padding:"8px 18px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:"0 3px 12px rgba(249,115,22,0.3)",flexShrink:0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
          <span className="dl-lbl">Download PDF</span>
        </button>
      </nav>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 16px 80px" }}>

        {/* ── Motivational Quote ── */}
        <div style={{
          background: "linear-gradient(135deg,#1a0a00,#3d1500)",
          borderRadius: 16, padding: "20px 28px", marginBottom: 22,
          animation: "quoteIn 0.7s ease both",
          display: "flex", alignItems: "flex-start", gap: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
        }}>
          <span style={{ fontSize: 32, flexShrink: 0, lineHeight: 1 }}>💬</span>
          <div>
            <p style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.92)", lineHeight: 1.6, fontStyle: "italic", fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
              "{RANDOM_QUOTE.text}"
            </p>
            <p style={{ fontSize: 12, color: "rgba(249,115,22,0.85)", fontWeight: 700 }}>
              — {RANDOM_QUOTE.author}
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="res-hdr" style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,gap:14 }}>
          <div>
            <h1 style={{ fontSize:"clamp(24px,5vw,32px)",fontWeight:900,color:dark?"#e0d8d0":"#1a0a00",letterSpacing:"-0.03em",fontFamily:"'Playfair Display',serif",lineHeight:1.1 }}>
              {shown.length} <span style={{color:"#f97316",fontStyle:"italic"}}>{shown.length===0?"No Matches":"Colleges Found"}</span>
            </h1>
            <p style={{ fontSize:12,color:dark?"#666":"#aaa",marginTop:6,lineHeight:1.8 }}>
              <b style={{color:dark?"#998f88":"#666"}}>{pct}%ile</b> · {catObj?.label} ({cat})
              {year!=="Both"&&` · ${year}`}
              {capRnd!=="All"&&` · CAP ${capRnd}`}
              {selBranches.length>0&&` · ${selBranches.length} branch${selBranches.length>1?"es":""}`}
              {selCities.length>0&&` · 📍 ${selCities.join(", ")}`}
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="sum-grid" style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20 }}>
          {[
            { label:"Above +4%",   count:counts.above4,    color:"#7c3aed", bg:dark?"#1e1a2a":"#faf5ff", icon:"🎯" },
            { label:"Just Above",  count:counts.justabove, color:"#9333ea", bg:dark?"#1e1a28":"#fdf4ff", icon:"↗"  },
            { label:"Close Match", count:counts.close,     color:"#d97706", bg:dark?"#1f1a10":"#fffbeb", icon:"~"  },
            { label:"Safe",        count:counts.safe,      color:"#16a34a", bg:dark?"#101a10":"#f0fdf4", icon:"✓"  },
            { label:"Highly Safe", count:counts.verysafe,  color:"#15803d", bg:dark?"#101a10":"#f0fdf4", icon:"✅" },
          ].map(s => (
            <div key={s.label} style={{ background:s.bg,border:`1.5px solid ${s.color}22`,borderRadius:14,padding:"14px",textAlign:"center",boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize:20,marginBottom:4 }}>{s.icon}</div>
              <div style={{ fontSize:26,fontWeight:900,color:s.color,fontFamily:"monospace",lineHeight:1 }}>{s.count}</div>
              <div style={{ fontSize:10,color:dark?"#555":"#aaa",marginTop:4,fontWeight:600,letterSpacing:"0.04em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* How-to instructions */}
        <div className="dm-card" style={{ background:"#fff", border:"1.5px solid #e0d9d0", borderRadius:14, padding:"18px 20px", marginBottom:22, boxShadow:"0 2px 10px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize:13, fontWeight:800, color:dark?"#e0d8d0":"#1a0a00", marginBottom:12, display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontSize:16 }}>📋</span> How to Fill Your CAP Preference List
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
            {[
              { n:"1", color:"#7c3aed", bg:dark?"#1e1a2a":"#faf5ff", b:dark?"#2d2a3e":"#ddd6fe", text:`🎯 First 6 slots — colleges 4%+ above your rank (e.g. 84+ if you have 80%). Fill these first, try your luck in later rounds.` },
              { n:"2", color:"#9333ea", bg:dark?"#1e1a28":"#fdf4ff", b:dark?"#2d2a3c":"#e9d5ff", text:`↗ Next — colleges just above your rank (82, 81). Sometimes open up in CAP Round 2 or 3.` },
              { n:"3", color:"#d97706", bg:dark?"#1f1a10":"#fffbeb", b:dark?"#302518":"#fde68a", text:`~ Then — colleges at your rank (80) and just below (79, 78, 77). Most likely seats.` },
              { n:"4", color:"#15803d", bg:dark?"#101a10":"#f0fdf4", b:dark?"#182818":"#86efac", text:`✅ Finally — fill all remaining up to 500 preferences. More = safer!` },
            ].map(s => (
              <div key={s.n} style={{ display:"flex", gap:10, alignItems:"center", padding:"9px 12px", background:s.bg, border:`1px solid ${s.b}`, borderRadius:9 }}>
                <div style={{ width:22, height:22, borderRadius:6, background:s.color, color:"#fff", fontSize:11, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{s.n}</div>
                <div style={{ fontSize:12.5, color:dark?"#998f88":"#444", lineHeight:1.5, fontWeight:500 }}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty state */}
        {shown.length === 0 && (
          <div className="dm-card" style={{background:"#fff",border:"1px solid #ede6dc",borderRadius:16,padding:"52px 32px",textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:14}}>😔</div>
            <div style={{fontSize:18,fontWeight:700,color:dark?"#e0d8d0":"#1a0a00",marginBottom:8}}>No colleges found</div>
            <div style={{fontSize:13,color:dark?"#666":"#aaa",lineHeight:1.8,maxWidth:380,margin:"0 auto"}}>
              Try removing city or branch filters, selecting "Both" years, or choosing "All" CAP rounds.
            </div>
            <button onClick={onBack} style={{marginTop:20,padding:"10px 26px",borderRadius:9,border:"none",background:"#f97316",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>← Modify Search</button>
          </div>
        )}

        {/* Priority groups */}
        {groupsWithIdx.map((group, gi) => (
          <div key={group.key} style={{ marginBottom: 28 }}>
            <div style={{
              display:"flex", alignItems:"center", gap:10, marginBottom:12,
              padding: gi === 0 ? "12px 16px" : "8px 14px",
              background: gi === 0 ? (dark?"#1e1a2a":group.bg) : (dark?"#1a1820":"#fff"),
              borderRadius:10,
              border:`1px solid ${gi === 0 ? group.border : (dark?"#2d2a36":"#ede6dc")}`,
            }}>
              <div style={{ width:3, height:gi===0?28:20, borderRadius:100, background:group.color, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize: gi===0?14:12, fontWeight:800, color:group.color }}>{group.label}</div>
                <div style={{ fontSize:11, color:dark?"#555":"#aaa", marginTop:1 }}>{group.desc}</div>
              </div>
              <div style={{ background: gi===0?(dark?"#252230":group.bg):(dark?"#252230":"#f5f0eb"), border:`1px solid ${gi===0?group.border:(dark?"#2d2a36":"#e0d9d0")}`, borderRadius:20, padding:"2px 12px", fontSize:12, fontWeight:800, color:group.color, flexShrink:0 }}>
                {group.items.length}
              </div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {group.itemsWithIdx.map(({ item, idx }) => (
                <CollegeCard
                  key={`${item["College Code"]}-${item["Branch Name"]}-${item.Year}`}
                  item={item} pct={pct} cat={cat} idx={idx} dark={dark}
                />
              ))}
            </div>
          </div>
        ))}

        {results.length >= 200 && (
          <p style={{ textAlign:"center",fontSize:12,color:dark?"#333":"#bbb",marginTop:-16 }}>
            Use branch or city filters to narrow results further.
          </p>
        )}

      </div>
    </div>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────────────
function HomePage({ allData, dataReady, allBranches, onSearch, dark, toggleDark, isOffline }) {
  const scrollY = useScrollY();
  const formRef = useRef(null);

  const [pct,         setPct]         = useState("");
  const [cat,         setCat]         = useState("");
  const [selBranches, setSelBranches] = useState([]);
  const [selCities,   setSelCities]   = useState([]);
  const [year,        setYear]        = useState("2024");
  const [capRnd,      setCapRnd]      = useState("All");
  const [loading,     setLoading]     = useState(false);

  const vh       = typeof window !== "undefined" ? window.innerHeight : 800;
  const prog     = Math.min(scrollY / vh, 1);
  const imgScale = 1 + prog * 0.15;
  const imgBlur  = prog * 7;
  const txtOpa   = Math.max(0, 1 - prog * 1.5);
  const txtY     = prog * -50;
  const overlay  = 0.3 + prog * 0.44;

  const pctNum    = parseFloat(pct) || 0;
  const catObj    = CATEGORIES.find(c => c.code === cat);
  const canSearch = pct !== "" && pctNum > 0 && pctNum <= 100 && cat !== "" && dataReady;

  const catGroups = useMemo(() => {
    const g = {};
    CATEGORIES.forEach(c => { if (!g[c.sub]) g[c.sub] = []; g[c.sub].push(c); });
    return g;
  }, []);

  const groupedBranchOpts = useMemo(() => {
    const set = new Set(allBranches);
    const out = {};
    Object.entries(BRANCH_GROUPS).forEach(([grp, brs]) => {
      const avail = brs.filter(b => set.has(b));
      if (avail.length) out[grp] = avail;
    });
    const ungrouped = allBranches.filter(b => !ALL_GROUPED_BRANCHES.has(b));
    if (ungrouped.length) out["🔧 Other"] = ungrouped;
    return out;
  }, [allBranches]);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth" });

  const handleSearch = () => {
    if (!canSearch) return;
    setLoading(true);

    requestAnimationFrame(() => {
      let rows = allData;

      // 1. Year filter
      if (year !== "Both") {
        const y = parseInt(year);
        rows = rows.filter(r => r.Year === y);
      }

      // 2. Seat type filter
      if (HU_CATS.includes(cat)) {
        rows = rows.filter(r => HU_TYPES.includes(r["Seat Type"]));
      } else {
        rows = rows.filter(r => r["Seat Type"] === "State Level");
      }

      // 3. Branch filter
      if (selBranches.length > 0) {
        const bSet = new Set(selBranches);
        rows = rows.filter(r => bSet.has(r["Branch Name"]));
      }

      // 4. City filter
      if (selCities.length > 0) {
        const cLower = selCities.map(c => c.toLowerCase());
        rows = rows.filter(r => cLower.some(c => (r.City || "").toLowerCase().includes(c)));
      }

      // 5. CAP round filter (after branch/city for grouping)
      const capFilter = capRnd !== "All" ? parseInt(capRnd) : null;
      if (capFilter) {
        rows = rows.filter(r => r.CAP_Round === capFilter);
      }

      // 6. Group by year+college+branch → collect all CAP round cutoffs
      const groupMap = {};
      for (const r of rows) {
        const key = `${r.Year}__${r["College Code"]}__${r["Branch Name"]}`;
        if (!groupMap[key]) groupMap[key] = { base: r, rounds: {} };
        const capN = parseInt(r.CAP_Round);
        const cv   = parseFloat(r[cat]);
        if (!isNaN(cv) && cv > 0) groupMap[key].rounds[capN] = cv;
      }

      // 7. Build items & filter by eligibility
      const items = [];
      for (const { base, rounds } of Object.values(groupMap)) {
        const validCutoffs = Object.values(rounds).filter(v => !isNaN(v) && v > 0);
        if (validCutoffs.length === 0) continue;
        // Best (min) cutoff = easiest round to get into
        const minCutoff = Math.min(...validCutoffs);
        // Eligibility: user must meet at least one round's cutoff (or include reaches)
        items.push({ ...base, _rounds: rounds, _rankCutoff: minCutoff });
      }

      // 8. Sort: descending cutoff — highest cutoff first (reach colleges on top),
      //    then match, then lower and lower (safest at bottom)
      items.sort((a, b) => b._rankCutoff - a._rankCutoff);

      setLoading(false);
      onSearch({ results: items, pct: pctNum, cat, year, capRnd, selBranches, selCities });
    });
  };

  return (
    <div style={{ background: "#f2ede7", minHeight: "100vh" }}>
      {/* HERO */}
      <section style={{ position:"relative",height:"100vh",overflow:"hidden" }}>
        <div style={{ position:"absolute",inset:"-10%",backgroundImage:`url('${HERO_IMG}')`,backgroundSize:"cover",backgroundPosition:"center 35%",transform:`scale(${imgScale})`,filter:`blur(${imgBlur}px)`,willChange:"transform,filter" }} />
        <div style={{ position:"absolute",inset:0,background:`linear-gradient(to bottom,rgba(5,2,0,${overlay*0.85}) 0%,rgba(16,7,1,${overlay}) 55%,rgba(3,1,0,${overlay+0.18}) 100%)` }} />
        <div style={{ position:"absolute",inset:0,pointerEvents:"none",background:"linear-gradient(to top,rgba(150,55,0,0.22) 0%,transparent 55%)" }} />

        <nav className="nav-p" style={{ position:"absolute",top:0,left:0,right:0,zIndex:100,padding:"22px 44px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.1 }}>
            <span style={{ fontSize:22,fontWeight:900,color:"#fff",letterSpacing:"-0.02em",fontFamily:"'Playfair Display',serif" }}>
              Vidhya <span style={{color:"#f97316"}}>Rank</span>
            </span>
            <span style={{ fontSize:10,color:"rgba(255,255,255,0.5)",fontWeight:500,letterSpacing:"0.08em" }}>vidya-rank.vercel.app</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {/* Dark mode toggle */}
            <button onClick={toggleDark}
              style={{ padding:"7px 13px",borderRadius:24,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",backdropFilter:"blur(8px)",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:600,display:"flex",alignItems:"center",gap:5 }}
              title={dark ? "Light mode" : "Dark mode"}>
              {dark ? "☀️" : "🌙"}
            </button>
            {/* Offline / data status pill */}
            <div style={{ display:"flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.1)",backdropFilter:"blur(12px)",borderRadius:30,padding:"7px 16px",border:"1px solid rgba(255,255,255,0.14)" }}>
              <span style={{ width:7,height:7,borderRadius:"50%",background:isOffline?"#f97316":dataReady?"#4ade80":"#fbbf24",display:"inline-block",animation:"pulse 2s ease infinite" }} />
              <span style={{ fontSize:12,color:"rgba(255,255,255,0.88)",fontWeight:500 }}>
                {isOffline ? "📡 Offline — cached data" : dataReady ? "2024 Data Live" : "Loading…"}
              </span>
            </div>
          </div>
        </nav>

        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"0 24px",opacity:txtOpa,transform:`translateY(${txtY}px)`,pointerEvents:txtOpa<0.05?"none":"auto" }}>
          <div style={{ marginBottom:18, animation:"fadeUp 0.9s ease 0.1s both" }}>
            <span style={{ fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.5)",letterSpacing:"0.25em",textTransform:"uppercase" }}>Vidhya Rank</span>
          </div>
          <h1 className="hero-h" style={{ fontWeight:900,lineHeight:1.08,letterSpacing:"-0.025em",marginBottom:18,fontFamily:"'Playfair Display',serif",animation:"fadeUp 0.9s ease 0.25s both",fontSize:"clamp(42px,8vw,82px)" }}>
            <span style={{color:"#fff",display:"block"}}>Find Your Best</span>
            <span style={{color:"#f97316",fontStyle:"italic",display:"block"}}>College Fit</span>
          </h1>
          <p style={{ fontSize:15,color:"rgba(255,255,255,0.65)",maxWidth:440,lineHeight:1.8,marginBottom:14,fontWeight:400,animation:"fadeUp 0.9s ease 0.35s both" }}>
            Get a ranked, ready-to-fill CAP preference list based on your MHT-CET percentile — in seconds.
          </p>
          <p style={{ fontSize:12,color:"rgba(249,115,22,0.75)",marginBottom:50,fontWeight:600,animation:"fadeUp 0.9s ease 0.4s both",letterSpacing:"0.04em" }}>
            ✦ Maharashtra Engineering Admissions 2023 &amp; 2024 ✦
          </p>
          <div className="hero-stats" style={{ display:"flex",gap:60,animation:"fadeUp 0.9s ease 0.55s both" }}>
            {[{n:343,s:"+",l:"COLLEGES"},{n:14459,s:"",l:"RECORDS"},{n:6,s:"",l:"CAP ROUNDS"}].map(({n,s,l})=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:30,fontWeight:900,color:"#fff",letterSpacing:"-0.03em",lineHeight:1}}><Counter end={n} suffix={s}/></div>
                <div style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,0.36)",letterSpacing:"0.16em",marginTop:7}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div onClick={scrollToForm} style={{position:"absolute",bottom:32,left:"50%",opacity:Math.max(0,1-prog*6),cursor:"pointer",animation:"bounceY 1.6s ease infinite"}}>
          <div style={{width:38,height:38,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.28)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.58)" strokeWidth="2.5"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section ref={formRef} style={{ padding:"60px 16px 96px",maxWidth:860,margin:"0 auto" }}>
        <div style={{textAlign:"center",marginBottom:38}}>
          <p style={{fontSize:11,fontWeight:700,color:"#f97316",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:10}}>MHT-CET 2023 &amp; 2024</p>
          <h2 style={{fontSize:"clamp(24px,5vw,36px)",fontWeight:900,color:"#1a0a00",letterSpacing:"-0.03em",lineHeight:1.15,fontFamily:"'Playfair Display',serif"}}>
            Find Your Best <span style={{color:"#f97316",fontStyle:"italic"}}>College Fit</span>
          </h2>
          <p style={{fontSize:13,color:"#888",marginTop:10,lineHeight:1.7,maxWidth:400,margin:"10px auto 0"}}>
            Enter your MHT-CET percentile and category to get your personalised college list — sorted best to safest.
          </p>
        </div>

        <div style={{background:"#fff",borderRadius:20,boxShadow:"0 4px 48px rgba(0,0,0,0.08)",border:"1px solid #ede6dc",overflow:"visible",marginBottom:22}}>
          <div style={{background:"linear-gradient(135deg,#f97316 0%,#fb923c 60%,#fbbf24 100%)",padding:"18px 30px",display:"flex",alignItems:"center",justifyContent:"space-between",borderRadius:"20px 20px 0 0"}}>
            <div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",fontWeight:700,letterSpacing:"0.1em",marginBottom:2}}>STEP 1 OF 2</div>
              <div style={{fontSize:16,fontWeight:700,color:"#fff"}}>Enter Your Details</div>
            </div>
            <div style={{display:"flex",gap:5}}>
              {[1,2,3].map(i=><div key={i} style={{width:28,height:4,borderRadius:100,background:i===1?"#fff":"rgba(255,255,255,0.28)"}}/>)}
            </div>
          </div>

          <div className="form-pad" style={{padding:"28px 32px"}}>
            {/* Percentile */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                <label style={{fontSize:13,fontWeight:600,color:"#333"}}>MHT-CET Percentile</label>
                {pctNum>0&&(
                  <span style={{fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20,
                    background:pctNum>=90?"#fff7ed":pctNum>=70?"#fefce8":"#fef2f2",
                    color:pctNum>=90?"#c2410c":pctNum>=70?"#a16207":"#b91c1c",
                    border:`1px solid ${pctNum>=90?"#fed7aa":pctNum>=70?"#fde68a":"#fecaca"}`}}>
                    {pctNum>=97?"🔥 Excellent":pctNum>=90?"⭐ Very Good":pctNum>=80?"👍 Good":pctNum>=70?"Average":"Below Avg"}
                  </span>
                )}
              </div>
              <div style={{position:"relative",background:"#faf7f3",border:"2px solid #ede6dc",borderRadius:12}}>
                <input type="number" min="0" max="100" step="0.0001" placeholder="0.0000"
                  value={pct} onChange={e=>setPct(e.target.value)}
                  className="inp-focus"
                  style={{width:"100%",background:"transparent",border:"none",padding:"16px 66px 16px 18px",fontSize:36,fontWeight:700,color:"#1a0a00",fontFamily:"monospace",letterSpacing:"-0.02em"}}/>
                <span style={{position:"absolute",right:18,bottom:16,fontSize:13,color:"#ccc",fontWeight:600}}>%ile</span>
              </div>
              {pctNum>0&&(
                <div style={{marginTop:8,height:4,background:"#f0e9e0",borderRadius:100,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:100,width:`${Math.min(pctNum,100)}%`,background:"linear-gradient(90deg,#f97316,#fbbf24)",transition:"width 0.7s cubic-bezier(.34,1.4,.64,1)"}}/>
                </div>
              )}
            </div>

            <div style={{height:1,background:"#f0e9e0",margin:"0 0 24px"}}/>

            {/* Category */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <label style={{fontSize:13,fontWeight:600,color:"#333"}}>Reservation Category</label>
                {cat&&<span style={{fontSize:12,color:"#f97316",fontWeight:600}}>✓ {catObj?.label} — {cat}</span>}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {Object.entries(catGroups).map(([grp,cats])=>(
                  <div key={grp}>
                    <div style={{fontSize:9,fontWeight:800,letterSpacing:"0.14em",color:"#ccc",marginBottom:8}}>{grp}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                      {cats.map(c=>(
                        <button key={c.code} className={`cat-btn ${cat===c.code?"sel":""}`} onClick={()=>setCat(c.code)}>
                          {c.label}<span style={{fontSize:9,opacity:0.55,fontFamily:"monospace"}}>{c.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{height:1,background:"#f0e9e0",margin:"0 0 22px"}}/>

            {/* Filters */}
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
                <span style={{fontSize:13,fontWeight:600,color:"#333"}}>Filters</span>
                <span style={{fontSize:11,color:"#bbb",background:"#f5f0eb",padding:"2px 7px",borderRadius:4}}>optional</span>
              </div>
              <div style={{display:"flex",gap:20,marginBottom:16,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#ccc",letterSpacing:"0.1em",marginBottom:7}}>YEAR</div>
                  <div style={{display:"flex",gap:5}}>
                    {["2023","2024","Both"].map(y=><button key={y} className={`chip ${year===y?"on":""}`} onClick={()=>setYear(y)}>{y}</button>)}
                  </div>
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#ccc",letterSpacing:"0.1em",marginBottom:7}}>CAP ROUND</div>
                  <div style={{display:"flex",gap:5}}>
                    {["1","2","3","All"].map(c=><button key={c} className={`chip ${capRnd===c?"on":""}`} onClick={()=>setCapRnd(c)}>{c}</button>)}
                  </div>
                </div>
              </div>
              <div className="grid-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#ccc",letterSpacing:"0.1em",marginBottom:7}}>BRANCH</div>
                  <MultiSelect values={selBranches} onChange={setSelBranches} groupedOptions={groupedBranchOpts} placeholder="All Branches" icon="🎓" />
                  {selBranches.length>0&&<div style={{fontSize:11,color:"#f97316",marginTop:5,fontWeight:500}}>{selBranches.length} branch{selBranches.length>1?"es":""} selected</div>}
                </div>
                <div>
                  <div style={{fontSize:10,fontWeight:700,color:"#ccc",letterSpacing:"0.1em",marginBottom:7}}>CITY</div>
                  <MultiSelect values={selCities} onChange={setSelCities} flatOptions={MH_CITIES} placeholder="Any City" icon="📍" />
                  {selCities.length>0&&<div style={{fontSize:11,color:"#f97316",marginTop:5,fontWeight:500}}>{selCities.join(", ")}</div>}
                </div>
              </div>
            </div>

            <button className="big-btn" disabled={!canSearch||loading} onClick={handleSearch} style={{
              width:"100%",padding:"15px",borderRadius:12,border:"none",
              background:canSearch?"#f97316":"#f0e9e0",
              color:canSearch?"#fff":"#bbb",
              fontSize:15,fontWeight:700,
              cursor:canSearch?"pointer":"not-allowed",
              boxShadow:canSearch?"0 4px 20px rgba(249,115,22,0.3)":"none",
              display:"flex",alignItems:"center",justifyContent:"center",gap:10,
              position:"relative",overflow:"hidden",
            }}>
              {canSearch&&!loading&&(
                <div style={{position:"absolute",inset:0,background:"linear-gradient(105deg,transparent 38%,rgba(255,255,255,0.12) 50%,transparent 62%)",backgroundSize:"600px 100%",animation:"shimmer 2.2s ease infinite",pointerEvents:"none"}}/>
              )}
              {!dataReady
                ? "Loading data…"
                : loading
                ? <><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{animation:"spin 0.75s linear infinite"}}><path d="M21 12a9 9 0 11-6.219-8.56"/></svg>Searching…</>
                : canSearch
                ? "Find My Colleges →"
                : "Enter your percentile & category to search"
              }
            </button>

            {/* Skeleton preview while searching */}
            {loading && (
              <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ fontSize:11, color:"#bbb", textAlign:"center", marginBottom:4, fontWeight:500 }}>
                  ✨ Building your personalised list…
                </div>
                {[1,2,3].map(i => <SkeletonCard key={i} />)}
              </div>
            )}
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {[{icon:"🏛️",n:"343",l:"Colleges"},{icon:"📋",n:"14,459",l:"Records, all rounds"},{icon:"✅",n:"100%",l:"PDF-verified"}].map((s,i)=>(
            <div key={i} style={{background:"#fff",border:"1px solid #ede6dc",borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 2px 12px rgba(0,0,0,0.04)"}}>
              <span style={{fontSize:22}}>{s.icon}</span>
              <div>
                <div style={{fontSize:19,fontWeight:900,color:"#1a0a00",fontFamily:"monospace",letterSpacing:"-0.03em"}}>{s.n}</div>
                <div style={{fontSize:11,color:"#bbb",marginTop:1}}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
const CSV_CACHE_KEY = "vr_csv_cache_v1";

export default function App() {
  const [page,        setPage]        = useState("home");
  const [allData,     setAllData]     = useState([]);
  const [dataReady,   setDataReady]   = useState(false);
  const [allBranches, setAllBranches] = useState([]);
  const [searchState, setSearchState] = useState(null);
  const [isOffline,   setIsOffline]   = useState(false);
  const [dark,        setDark]        = useDark();

  const processData = useCallback((data) => {
    setAllData(data);
    const bSet = new Set(data.map(r => r["Branch Name"]).filter(Boolean));
    setAllBranches(Array.from(bSet).sort());
    setDataReady(true);
  }, []);

  useEffect(() => {
    // 1. Try to load from cache first (instant — works offline)
    try {
      const cached = localStorage.getItem(CSV_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.length > 1000) {
          processData(parsed);
          setIsOffline(!navigator.onLine); // mark offline if no internet
        }
      }
    } catch {}

    // 2. Always try fresh fetch (updates cache, gives latest data)
    Papa.parse("/data.csv", {
      download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
      complete: ({ data }) => {
        processData(data);
        setIsOffline(false);
        // Save to localStorage for offline use (< 5MB compressed JSON)
        try { localStorage.setItem(CSV_CACHE_KEY, JSON.stringify(data)); } catch {}
      },
      error: () => {
        // Network failed — if we already loaded from cache, we're offline but functional
        setIsOffline(true);
      },
    });

    // Listen for online/offline events
    const onOnline  = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener("online",  onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online",  onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [processData]);

  const handleSearch = useCallback((state) => {
    setSearchState(state);
    setPage("results");
  }, []);

  const handleBack = useCallback(() => {
    setPage("home");
    setTimeout(() => window.scrollTo({ top: 0 }), 50);
  }, []);

  const toggleDark = useCallback(() => setDark(d => !d), [setDark]);

  return (
    <>
      <style>{CSS}</style>
      {page === "home" && (
        <HomePage
          allData={allData} dataReady={dataReady} allBranches={allBranches}
          onSearch={handleSearch} dark={dark} toggleDark={toggleDark} isOffline={isOffline}
        />
      )}
      {page === "results" && searchState && (
        <ResultsPage
          {...searchState} onBack={handleBack}
          dark={dark} toggleDark={toggleDark}
        />
      )}
    </>
  );
}
