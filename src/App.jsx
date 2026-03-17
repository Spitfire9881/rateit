import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════
   QUESTIONS CONFIG (unchanged from v3)
══════════════════════════════════════════════ */
const QUESTIONS = [
  { id:1,  category:"Service Quality",   weight:8,  icon:"🎧", text:"You had a question or needed help. What best describes what happened?", options:[{label:"Got a fast, helpful response that actually solved my problem",score:4},{label:"Eventually got help, but it took more effort than it should have",score:2},{label:"Reached someone but they couldn't really help — had to figure it out myself",score:2},{label:"Couldn't get through or was ignored entirely",score:1}]},
  { id:2,  category:"Service Quality",   weight:7,  icon:"🔧", text:"Something went wrong with your order, product, or experience. What happened next?", options:[{label:"They fixed it quickly with no hassle",score:4},{label:"It was resolved, but only after I pushed for it",score:2},{label:"They acknowledged it but the resolution felt incomplete",score:2},{label:"Nothing was done — I was left dealing with it myself",score:1}]},
  { id:3,  category:"Service Quality",   weight:6,  icon:"💬", text:"How would you describe the way staff or the company communicated with you?", options:[{label:"Clear, professional, and genuinely friendly",score:4},{label:"Polite but robotic — felt like a script",score:3},{label:"Hard to get a straight answer from them",score:2},{label:"Rude, dismissive, or unprofessional",score:1}]},
  { id:4,  category:"Product & Offering",weight:9,  icon:"📦", text:"When you used the product or service, how did the quality hold up?", options:[{label:"Noticeably better quality than I expected",score:4},{label:"Exactly what I expected — nothing more, nothing less",score:3},{label:"A few rough edges, but mostly acceptable",score:2},{label:"Felt cheap, broken, or below any reasonable standard",score:1}]},
  { id:5,  category:"Product & Offering",weight:8,  icon:"🎯", text:"Think about what you were promised vs. what you actually got. How did that compare?", options:[{label:"They delivered more than what was advertised",score:4},{label:"It matched what was described pretty closely",score:3},{label:"There were some gaps between the promise and the reality",score:2},{label:"What I got was significantly different from what was promised",score:1}]},
  { id:6,  category:"Product & Offering",weight:5,  icon:"🎨", text:"If you needed something customized or had a specific preference, how did they handle it?", options:[{label:"Went out of their way to accommodate my needs",score:4},{label:"Offered a few options — found something that worked",score:3},{label:"Limited flexibility, had to compromise more than I'd like",score:2},{label:"One-size-fits-all — no room to tailor anything",score:1}]},
  { id:7,  category:"Value & Pricing",   weight:7,  icon:"💰", text:"After the experience, how do you feel about what you paid?", options:[{label:"Genuinely good deal — got more than my money's worth",score:4},{label:"Fair exchange — paid what it was worth",score:3},{label:"Slightly overpriced for what was delivered",score:2},{label:"Felt ripped off — not worth what I paid",score:1}]},
  { id:8,  category:"Value & Pricing",   weight:8,  icon:"🧾", text:"When it came to the final bill or cost, which of these is most accurate?", options:[{label:"Final cost matched exactly what I was quoted upfront",score:4},{label:"Minor difference from the quote, but nothing alarming",score:3},{label:"There were add-ons or fees I didn't fully expect",score:2},{label:"Significant hidden charges appeared that I was never told about",score:1}]},
  { id:9,  category:"Value & Pricing",   weight:7,  icon:"⚖️", text:"Compared to similar businesses you've used, how does the value stack up?", options:[{label:"Among the better value options I've come across",score:4},{label:"Roughly on par with comparable alternatives",score:3},{label:"Slightly behind what competitors offer for the same price",score:2},{label:"Noticeably worse value than other options I've tried",score:1}]},
  { id:10, category:"Trust",             weight:9,  icon:"🤝", text:"Thinking about how the company presented itself — how honest did it feel?", options:[{label:"Everything was upfront and transparent — no surprises",score:4},{label:"Mostly transparent, with a few things I had to dig for",score:3},{label:"Some things felt deliberately vague or hard to find",score:2},{label:"Felt misled — information was withheld or distorted",score:1}]},
  { id:11, category:"Trust",             weight:9,  icon:"📋", text:"Did the company actually do what it said it would?", options:[{label:"Delivered on every commitment, on time",score:4},{label:"Mostly followed through, with a minor slip or delay",score:3},{label:"Some things were promised but didn't happen",score:2},{label:"Multiple commitments were broken or ignored",score:1}]},
  { id:12, category:"Trust",             weight:8,  icon:"⭐", text:"If a friend asked you about this business, what would you actually say?", options:[{label:"I'd recommend them without hesitation",score:4},{label:"I'd mention them with some caveats or conditions",score:3},{label:"I'd tell them to look at other options first",score:2},{label:"I'd actively warn them away",score:1}]},
  { id:13, category:"Experience",        weight:7,  icon:"🛤️", text:"How much friction did you encounter from start to finish?", options:[{label:"Seamless — everything flowed naturally without hiccups",score:4},{label:"A few small bumps, but nothing that derailed the experience",score:3},{label:"Multiple frustrating steps that slowed things down",score:2},{label:"Constant obstacles — it felt like fighting the process",score:1}]},
  { id:14, category:"Experience",        weight:6,  icon:"🔍", text:"When you needed to find information or figure something out, how easy was it?", options:[{label:"Everything I needed was easy to find and well explained",score:4},{label:"Found most things, though a few required extra searching",score:3},{label:"Information was scattered or unclear in key areas",score:2},{label:"Couldn't find basic information — very opaque and confusing",score:1}]},
  { id:15, category:"Experience",        weight:10, icon:"🏆", text:"A week from now, how will you likely think back on this experience?", options:[{label:"As one of the better business experiences I've had recently",score:4},{label:"As a fine, forgettable transaction — nothing special",score:3},{label:"As something I'll be cautious about repeating",score:2},{label:"As a negative experience I'll tell others to avoid",score:1}]},
];

function shuffleOptions(options) {
  const arr = [...options];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
const SHUFFLED_QUESTIONS = QUESTIONS.map(q => ({ ...q, displayOptions: shuffleOptions(q.options) }));

const CAT_COLORS = {
  "Service Quality":    "#b83228",
  "Product & Offering": "#c47a1a",
  "Value & Pricing":    "#2d7a5c",
  "Trust":              "#2c5f8a",
  "Experience":         "#6b3fa0",
};

function getVerdict(s) {
  if (s >= 9)   return { label:"Exceptional",        sub:"World-class across every dimension",    color:"#2d7a5c" };
  if (s >= 7.5) return { label:"Highly Recommended", sub:"Consistently above expectations",       color:"#2d7a5c" };
  if (s >= 6)   return { label:"Above Average",      sub:"Solid, with room to grow",              color:"#c47a1a" };
  if (s >= 4.5) return { label:"Mixed",              sub:"Inconsistent — proceed with research", color:"#c47a1a" };
  if (s >= 3)   return { label:"Below Average",      sub:"Notable concerns across the board",     color:"#b83228" };
  return               { label:"Not Recommended",    sub:"Significant issues detected",           color:"#7a1c14" };
}

function computeScore(answers) {
  let ws = 0, tw = 0;
  const cats = {};
  QUESTIONS.forEach(q => {
    const entry = answers[q.id];
    const v = entry?.score ?? entry; // support both {score,label} and raw number
    if (!v) return;
    const norm = ((v - 1) / 3) * 10;
    ws += norm * q.weight; tw += q.weight;
    if (!cats[q.category]) cats[q.category] = { sum:0, weight:0 };
    cats[q.category].sum += norm * q.weight;
    cats[q.category].weight += q.weight;
  });
  const final = tw > 0 ? ws / tw : 0;
  const catScores = {};
  Object.entries(cats).forEach(([k,v]) => { catScores[k] = v.sum / v.weight; });
  return { final, catScores };
}

/* ══════════════════════════════════════════════
   STORAGE HELPERS
══════════════════════════════════════════════ */
async function loadUserReviews(userId) {
  try {
    const result = await window.storage.get(`reviews:${userId}`);
    return result ? JSON.parse(result.value) : [];
  } catch { return []; }
}

async function saveUserReviews(userId, reviews) {
  try {
    await window.storage.set(`reviews:${userId}`, JSON.stringify(reviews));
  } catch(e) { console.error("Save failed", e); }
}

async function loadUserProfile(userId) {
  try {
    const result = await window.storage.get(`profile:${userId}`);
    return result ? JSON.parse(result.value) : null;
  } catch { return null; }
}

async function saveUserProfile(userId, profile) {
  try {
    await window.storage.set(`profile:${userId}`, JSON.stringify(profile));
  } catch(e) { console.error("Save failed", e); }
}

// Simple user index — maps email→userId
async function loadUserIndex() {
  try {
    const result = await window.storage.get("user-index");
    return result ? JSON.parse(result.value) : {};
  } catch { return {}; }
}
async function saveUserIndex(index) {
  try { await window.storage.set("user-index", JSON.stringify(index)); } catch {}
}

/* ══════════════════════════════════════════════
   ANIMATED SCORE
══════════════════════════════════════════════ */
function AnimatedScore({ target }) {
  const [d, setD] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1400, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setD((target * e).toFixed(1));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <span>{d}</span>;
}

/* ══════════════════════════════════════════════
   PROGRESS RING
══════════════════════════════════════════════ */
function ProgressRing({ pct, idx, total }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <svg width={86} height={86} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={43} cy={43} r={r} fill="none" stroke="#ece5d5" strokeWidth={6}/>
      <circle cx={43} cy={43} r={r} fill="none" stroke="#b83228" strokeWidth={6}
        strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1)" }}/>
      <text x={43} y={43} textAnchor="middle" dominantBaseline="middle"
        style={{ transform:"rotate(90deg)", transformOrigin:"43px 43px" }}
        fill="#1a1410" fontSize={12} fontFamily="'DM Mono',monospace" fontWeight={500}
      >{idx+1}/{total}</text>
    </svg>
  );
}

/* ══════════════════════════════════════════════
   OPTION BUTTON
   selected is compared by label (unique per question)
   to avoid false matches when two options share score
══════════════════════════════════════════════ */
function OptionButton({ option, selectedLabel, onSelect }) {
  const selected = selectedLabel === option.label;
  return (
    <button onClick={() => onSelect(selected ? null : option)}
      style={{ width:"100%", padding:"16px 20px", border: selected ? "2px solid #1a1410":"2px solid #d0c8bc", background: selected?"#1a1410":"#fff", color: selected?"#f5f0e8":"#3a3028", cursor:"pointer", fontFamily:"'Libre Baskerville',serif", fontSize:14, lineHeight:1.5, textAlign:"left", transition:"all 0.15s cubic-bezier(0.34,1.2,0.64,1)", boxShadow: selected?"4px 4px 0 #b83228":"2px 2px 0 #d0c8bc", transform: selected?"translate(-2px,-2px)":"none", display:"flex", alignItems:"center", gap:14 }}
      onMouseEnter={e=>{ if(!selected){e.currentTarget.style.borderColor="#8a7a6e";e.currentTarget.style.background="#faf7f0";e.currentTarget.style.transform="translate(-1px,-1px)";e.currentTarget.style.boxShadow="3px 3px 0 #b0a090";}}}
      onMouseLeave={e=>{ if(!selected){e.currentTarget.style.borderColor="#d0c8bc";e.currentTarget.style.background="#fff";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="2px 2px 0 #d0c8bc";}}}
    >
      <div style={{ width:20, height:20, flexShrink:0, border: selected?"2px solid #f5f0e8":"2px solid #b0a090", background: selected?"#b83228":"transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s" }}>
        {selected && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5L4 7.5L10 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span>{option.label}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════
   SECURITY QUESTIONS for password reset
══════════════════════════════════════════════ */
const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What street did you grow up on?",
  "What is your mother's maiden name?",
  "What was the name of your elementary school?",
  "What city were you born in?",
  "What was the make of your first car?",
  "What is the name of your childhood best friend?",
];

/* ══════════════════════════════════════════════
   SCREEN: AUTH (Login / Create / Forgot Password)
   mode: "login" | "create" | "forgot" | "reset"
══════════════════════════════════════════════ */
function AuthScreen({ onAuth }) {
  const [mode, setMode]           = useState("login");
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secQuestion, setSecQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [secAnswer, setSecAnswer] = useState("");
  const [resetEmail, setResetEmail]   = useState("");
  const [resetAnswer, setResetAnswer] = useState("");
  const [resetProfile, setResetProfile] = useState(null); // profile found in forgot step
  const [err, setErr]             = useState("");
  const [success, setSuccess]     = useState("");
  const [loading, setLoading]     = useState(false);
  const [showPw, setShowPw]       = useState(false);

  const inputStyle = {
    width:"100%", padding:"13px 16px", border:"2px solid #d0c8bc", outline:"none",
    fontFamily:"'Libre Baskerville',serif", fontSize:15, background:"#fff",
    color:"#1a1410", display:"block", transition:"border 0.15s",
  };
  const labelStyle = {
    fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2,
    textTransform:"uppercase", color:"#8a7a6e", display:"block", marginBottom:6,
  };

  const switchMode = (m) => { setMode(m); setErr(""); setSuccess(""); };

  // ── LOGIN
  const handleLogin = async () => {
    setErr("");
    if (!email.trim() || !password.trim()) { setErr("Email and password are required."); return; }
    setLoading(true);
    const index = await loadUserIndex();
    const storedId = index[email.toLowerCase().trim()];
    if (!storedId) { setErr("No account found with that email."); setLoading(false); return; }
    const profile = await loadUserProfile(storedId);
    if (!profile || profile.passwordHash !== btoa(password)) { setErr("Incorrect password."); setLoading(false); return; }
    onAuth({ userId: storedId, name: profile.name, email: profile.email });
    setLoading(false);
  };

  // ── CREATE ACCOUNT
  const handleCreate = async () => {
    setErr("");
    if (!name.trim()) { setErr("Please enter your name."); return; }
    if (!email.trim() || !password.trim()) { setErr("Email and password are required."); return; }
    if (password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    if (!secAnswer.trim()) { setErr("Please answer the security question."); return; }
    setLoading(true);
    const index = await loadUserIndex();
    if (index[email.toLowerCase().trim()]) { setErr("An account with this email already exists."); setLoading(false); return; }
    const userId = btoa(email.toLowerCase().trim()).replace(/=/g,"");
    const profile = {
      userId, name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: btoa(password),
      secQuestion,
      secAnswerHash: btoa(secAnswer.toLowerCase().trim()),
      createdAt: Date.now(),
    };
    await saveUserProfile(userId, profile);
    index[email.toLowerCase().trim()] = userId;
    await saveUserIndex(index);
    onAuth({ userId, name: name.trim(), email: email.toLowerCase().trim() });
    setLoading(false);
  };

  // ── FORGOT STEP 1: look up account + show their security question
  const handleForgotLookup = async () => {
    setErr(""); setSuccess("");
    if (!resetEmail.trim()) { setErr("Enter your email address."); return; }
    setLoading(true);
    const index = await loadUserIndex();
    const storedId = index[resetEmail.toLowerCase().trim()];
    if (!storedId) { setErr("No account found with that email."); setLoading(false); return; }
    const profile = await loadUserProfile(storedId);
    if (!profile?.secQuestion) { setErr("This account has no security question set. Contact support."); setLoading(false); return; }
    setResetProfile(profile);
    setMode("reset");
    setLoading(false);
  };

  // ── FORGOT STEP 2: verify answer + set new password
  const handleReset = async () => {
    setErr(""); setSuccess("");
    if (!resetAnswer.trim()) { setErr("Please answer the security question."); return; }
    if (!newPassword.trim() || newPassword.length < 6) { setErr("New password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setErr("Passwords don't match."); return; }
    setLoading(true);
    if (btoa(resetAnswer.toLowerCase().trim()) !== resetProfile.secAnswerHash) {
      setErr("Incorrect answer. Please try again."); setLoading(false); return;
    }
    // Update password in storage
    const updatedProfile = { ...resetProfile, passwordHash: btoa(newPassword) };
    await saveUserProfile(resetProfile.userId, updatedProfile);
    setSuccess("Password reset successfully! You can now sign in.");
    setMode("login");
    setEmail(resetProfile.email);
    setPassword("");
    setResetProfile(null); setResetEmail(""); setResetAnswer(""); setNewPassword(""); setConfirmPassword("");
    setLoading(false);
  };

  const modeTitle = { login: <>Sign in to <em style={{color:"#b83228"}}>RateIt</em></>, create: <>Join <em style={{color:"#b83228"}}>RateIt</em></>, forgot: <>Reset your <em style={{color:"#b83228"}}>password</em></>, reset: <>Set a new <em style={{color:"#b83228"}}>password</em></> };
  const modeSub   = { login: "Access your review history and locked scores.", create: "Create an account to save and track your reviews.", forgot: "Enter your email to recover your account.", reset: `Answer your security question to continue.` };

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"80vh", padding:"40px 24px" }}>
      <div style={{ background:"#b83228", color:"#fff", padding:"5px 18px", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, textTransform:"uppercase", marginBottom:28, animation:"fadeDown 0.4s both" }}>
        { mode==="login"?"Welcome Back" : mode==="create"?"Create Your Account" : mode==="forgot"?"Account Recovery" : "Reset Password" }
      </div>

      <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"clamp(26px,5vw,44px)", lineHeight:1.1, textAlign:"center", marginBottom:12, color:"#1a1410", animation:"fadeUp 0.5s 0.1s both" }}>
        {modeTitle[mode]}
      </h1>
      <p style={{ fontFamily:"'Libre Baskerville',serif", fontSize:14, color:"#6a5f55", marginBottom:32, textAlign:"center", animation:"fadeUp 0.5s 0.15s both" }}>
        {modeSub[mode]}
      </p>

      <div style={{ width:"100%", maxWidth:440, animation:"fadeUp 0.5s 0.2s both" }}>
        <div style={{ background:"#faf7f0", border:"2px solid #1a1410", boxShadow:"6px 6px 0 #1a1410", padding:"32px 32px 28px" }}>

          {/* Mode toggle — only on login/create */}
          {(mode==="login"||mode==="create") && (
            <div style={{ display:"flex", border:"2px solid #1a1410", marginBottom:28 }}>
              {["login","create"].map(m=>(
                <button key={m} onClick={()=>switchMode(m)}
                  style={{ flex:1, padding:"10px", background:mode===m?"#1a1410":"transparent", color:mode===m?"#f5f0e8":"#6a5f55", border:"none", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:2, textTransform:"uppercase", cursor:"pointer", transition:"all 0.15s" }}>
                  {m==="login"?"Sign In":"Create Account"}
                </button>
              ))}
            </div>
          )}

          {/* Back button for forgot/reset */}
          {(mode==="forgot"||mode==="reset") && (
            <button onClick={()=>switchMode("login")} style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#8a7a6e", background:"none", border:"none", cursor:"pointer", marginBottom:20, padding:0, letterSpacing:1, textTransform:"uppercase" }}>
              ← Back to Sign In
            </button>
          )}

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* ── LOGIN FIELDS ── */}
            {mode==="login" && <>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="jane@example.com" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}
                  onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={{...inputStyle, paddingRight:48}}
                    onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}
                    onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
                  <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a7a6e", padding:4 }}>{showPw?"hide":"show"}</button>
                </div>
              </div>
              {/* Forgot password link */}
              <div style={{ textAlign:"right", marginTop:-6 }}>
                <button onClick={()=>{ switchMode("forgot"); setResetEmail(email); }} style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#b83228", background:"none", border:"none", cursor:"pointer", letterSpacing:1, textTransform:"uppercase", textDecoration:"underline", padding:0 }}>
                  Forgot password?
                </button>
              </div>
            </>}

            {/* ── CREATE ACCOUNT FIELDS ── */}
            {mode==="create" && <>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input value={name} onChange={e=>setName(e.target.value)} placeholder="Jane Smith" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}/>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="jane@example.com" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}/>
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters" style={{...inputStyle, paddingRight:48}}
                    onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}/>
                  <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a7a6e", padding:4 }}>{showPw?"hide":"show"}</button>
                </div>
              </div>
              {/* Security question setup */}
              <div style={{ borderTop:"1px solid #ece5d5", paddingTop:14 }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#2c5f8a", marginBottom:10 }}>🔐 Account Recovery</div>
                <label style={labelStyle}>Security Question</label>
                <select value={secQuestion} onChange={e=>setSecQuestion(e.target.value)}
                  style={{ ...inputStyle, cursor:"pointer", appearance:"none", backgroundImage:"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238a7a6e' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E\")", backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center" }}>
                  {SECURITY_QUESTIONS.map(q=><option key={q} value={q}>{q}</option>)}
                </select>
                <div style={{ marginTop:12 }}>
                  <label style={labelStyle}>Your Answer</label>
                  <input value={secAnswer} onChange={e=>setSecAnswer(e.target.value)} placeholder="Your answer (not case-sensitive)" style={inputStyle}
                    onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}/>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a7a6e", marginTop:8, letterSpacing:0.5 }}>Used only if you forget your password</div>
              </div>
            </>}

            {/* ── FORGOT STEP 1: enter email ── */}
            {mode==="forgot" && <>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)} placeholder="jane@example.com" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}
                  onKeyDown={e=>e.key==="Enter"&&handleForgotLookup()}/>
              </div>
            </>}

            {/* ── RESET STEP 2: security question + new password ── */}
            {mode==="reset" && resetProfile && <>
              <div style={{ background:"#ece5d5", padding:"12px 16px", border:"1px solid rgba(26,20,16,0.12)" }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:1.5, textTransform:"uppercase", color:"#8a7a6e", marginBottom:6 }}>Security Question</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:15, color:"#1a1410" }}>{resetProfile.secQuestion}</div>
              </div>
              <div>
                <label style={labelStyle}>Your Answer</label>
                <input value={resetAnswer} onChange={e=>setResetAnswer(e.target.value)} placeholder="Not case-sensitive" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}/>
              </div>
              <div style={{ borderTop:"1px solid #ece5d5", paddingTop:14 }}>
                <label style={labelStyle}>New Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showPw?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="Min. 6 characters" style={{...inputStyle, paddingRight:48}}
                    onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}/>
                  <button onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a7a6e", padding:4 }}>{showPw?"hide":"show"}</button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input type={showPw?"text":"password"} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Repeat password" style={inputStyle}
                  onFocus={e=>e.target.style.borderColor="#1a1410"} onBlur={e=>e.target.style.borderColor="#d0c8bc"}
                  onKeyDown={e=>e.key==="Enter"&&handleReset()}/>
              </div>
              {/* Password match indicator */}
              {newPassword && confirmPassword && (
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color: newPassword===confirmPassword?"#2d7a5c":"#b83228", display:"flex", alignItems:"center", gap:6 }}>
                  {newPassword===confirmPassword ? "✓ Passwords match" : "✗ Passwords don't match"}
                </div>
              )}
            </>}

            {/* Error / success messages */}
            {err     && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#b83228", padding:"8px 12px", background:"rgba(184,50,40,0.07)", border:"1px solid rgba(184,50,40,0.2)" }}>{err}</div>}
            {success && <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#2d7a5c", padding:"8px 12px", background:"rgba(45,122,92,0.07)", border:"1px solid rgba(45,122,92,0.2)" }}>✓ {success}</div>}

            {/* CTA button */}
            <button
              onClick={ mode==="login"?handleLogin : mode==="create"?handleCreate : mode==="forgot"?handleForgotLookup : handleReset }
              disabled={loading}
              style={{ marginTop:4, padding:"14px", background:loading?"#8a7a6e":"#b83228", color:"#fff", border:"2px solid #1a1410", boxShadow:"4px 4px 0 #1a1410", fontFamily:"'Playfair Display',serif", fontSize:17, fontWeight:700, fontStyle:"italic", cursor:loading?"wait":"pointer", transition:"all 0.15s" }}
              onMouseEnter={e=>!loading&&(e.target.style.background="#8c251e")}
              onMouseLeave={e=>!loading&&(e.target.style.background="#b83228")}
            >
              {loading ? "Please wait…" : mode==="login" ? "Sign In →" : mode==="create" ? "Create Account →" : mode==="forgot" ? "Find My Account →" : "Reset Password →"}
            </button>
          </div>
        </div>

        <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#a09080", textAlign:"center", marginTop:16, letterSpacing:1 }}>
          Your reviews are saved securely to this device.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCREEN: LANDING + SEARCH
══════════════════════════════════════════════ */
function LandingScreen({ onSelect, user, reviews }) {
  const [query, setQuery]             = useState("");
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [searched, setSearched]       = useState(false);
  const [err, setErr]                 = useState("");
  const [localBiz, setLocalBiz]       = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [locationName, setLocationName] = useState("");
  const [localErr, setLocalErr]       = useState("");

  // On mount: get geolocation then fetch local small businesses
  useEffect(() => {
    if (!navigator.geolocation) return;
    setLocalLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse geocode to get city name
          const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const geoData = await geoRes.json();
          const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || "your area";
          setLocationName(city);

          // Ask Claude to find top-rated local small businesses nearby
const r1 = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [
      {
        role: "user",
        content: `Search for the best-rated local small businesses (not national chains) near ${city} (lat ${latitude.toFixed(3)}, lon ${longitude.toFixed(3)}). Focus on highly reviewed independent restaurants, shops, or service businesses.`
      }
    ]
  })
});
          const d1 = await r1.json();
const r2 = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [
      {
        role: "user",
        content: `Based on those results, return a JSON array of 4–6 highly-rated local businesses near ${city}. Include: name, address, city, category, rating, review_count, price_level, why_local. Return raw JSON only.`
      }
    ]
  })
});            method:"POST", headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, tools:[{type:"web_search_20250305",name:"web_search"}],
              messages:[
                {role:"user", content:`Search for best-rated local small businesses near ${city}.`},
                {role:"assistant", content: d1.content||[]},
                {role:"user", content:`Based on those results, return a JSON array of 4–6 highly-rated, genuinely local (non-chain) small businesses near ${city}. Each must have: name, address, city, category, rating (number), review_count (integer), price_level, why_local (1 short sentence on why it's a standout local pick). Raw JSON array only, no markdown.`}
              ]
            })
          });
          const d2 = await r2.json();
          const text = d2.content?.find(b=>b.type==="text")?.text||"[]";
          const places = JSON.parse(text.replace(/```json|```/g,"").trim());
          if (Array.isArray(places) && places.length > 0) setLocalBiz(places);
          else setLocalErr("Couldn't find local suggestions for your area.");
        } catch { setLocalErr("Unable to load local suggestions."); }
        setLocalLoading(false);
      },
      () => { setLocalLoading(false); setLocalErr("Location access denied — enable it to see local picks."); },
      { timeout: 8000 }
    );
  }, []);

  const searchBusiness = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true); setErr(""); setResults([]); setSearched(false);
    try {
const res1 = await fetch("/api/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    messages: [
      {
        role: "user",
        content: `Search for real businesses matching: "${query}". Include name, address, city, category, rating and review count.`
      }
    ]
  })
});        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, tools:[{type:"web_search_20250305",name:"web_search"}], messages:[{role:"user",content:`Search for businesses matching: "${query}". Find real listings with names, addresses, categories, and ratings.`}] })
      });
      const data1 = await res1.json();
const res2 = await fetch("https://api.anthropic.com/v1/messages", {        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, tools:[{type:"web_search_20250305",name:"web_search"}], messages:[
          {role:"user",content:`Search for businesses matching: "${query}".`},
          {role:"assistant",content:data1.content||[]},
          {role:"user",content:`Return a JSON array of up to 5 real businesses matching "${query}". Fields: name, address, city, category, rating (number), review_count (integer), price_level ("$"/"$$"/"$$$"/"$$$$"). Raw JSON only, no markdown.`}
        ]})
      });
      const data2 = await res2.json();
      const text = data2.content?.find(b=>b.type==="text")?.text||"[]";
      const places = JSON.parse(text.replace(/```json|```/g,"").trim());
      if (!Array.isArray(places)||places.length===0) setErr("No businesses found. Try something more specific.");
      else setResults(places);
    } catch { setErr("Search failed — please try again."); }
    setLoading(false); setSearched(true);
  }, [query]);

  const alreadyReviewed = (bizName) => reviews.some(r => r.business.name === bizName);

  const BizCard = ({ biz, i, showWhyLocal }) => {
    const reviewed = alreadyReviewed(biz.name);
    return (
      <button key={i} onClick={()=>!reviewed&&onSelect(biz)}
        style={{background:"#faf7f0",border:`2px solid ${reviewed?"#c0b0a0":"#1a1410"}`,boxShadow:reviewed?"2px 2px 0 #c0b0a0":"4px 4px 0 #1a1410",padding:"18px 20px",cursor:reviewed?"default":"pointer",textAlign:"left",transition:"all 0.15s",display:"block",width:"100%",animation:`fadeUp 0.3s ${i*0.06}s both`,opacity:reviewed?0.75:1}}
        onMouseEnter={e=>{if(!reviewed){e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="6px 6px 0 #b83228";}}}
        onMouseLeave={e=>{if(!reviewed){e.currentTarget.style.transform="translate(0,0)";e.currentTarget.style.boxShadow="4px 4px 0 #1a1410";}}}
      >
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:17,color:"#1a1410",marginBottom:4}}>{biz.name}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#8a7a6e",letterSpacing:1,marginBottom:6}}>{biz.address}{biz.city?`, ${biz.city}`:""}</div>
            {showWhyLocal && biz.why_local && (
              <div style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",fontSize:12,color:"#5a7a5c",marginBottom:8,lineHeight:1.4}}>"{biz.why_local}"</div>
            )}
            <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,background:"#ece5d5",padding:"2px 8px",color:"#5a4f46"}}>{biz.category}</span>
              {biz.price_level&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#2d7a5c",fontWeight:700}}>{biz.price_level}</span>}
              {reviewed&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#b83228",background:"rgba(184,50,40,0.08)",padding:"2px 8px",border:"1px solid rgba(184,50,40,0.2)"}}>✓ Already reviewed</span>}
            </div>
          </div>
          <div style={{textAlign:"center",flexShrink:0}}>
            <div style={{fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:22,color:"#b83228",lineHeight:1}}>{biz.rating}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:"#8a7a6e",letterSpacing:1}}>{biz.review_count?.toLocaleString()} reviews</div>
          </div>
        </div>
      </button>
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", minHeight:"80vh", padding:"40px 24px" }}>
      <div style={{ background:"#b83228", color:"#fff", padding:"5px 18px", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, textTransform:"uppercase", marginBottom:20, animation:"fadeDown 0.4s both" }}>Honest Business Reviews</div>

      <h1 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"clamp(30px,6vw,52px)", lineHeight:1.1, textAlign:"center", marginBottom:10, color:"#1a1410", animation:"fadeUp 0.5s 0.1s both" }}>
        Find a business.<br/><em style={{color:"#b83228"}}>Rate it honestly.</em>
      </h1>
      <p style={{ fontFamily:"'Libre Baskerville',serif", fontSize:15, lineHeight:1.8, color:"#6a5f55", maxWidth:400, textAlign:"center", marginBottom:36, animation:"fadeUp 0.5s 0.2s both" }}>
        Hello, <strong>{user.name}</strong>. You've written <strong>{reviews.length}</strong> review{reviews.length!==1?"s":""} so far.
      </p>

      {/* Search bar */}
      <div style={{ width:"100%", maxWidth:520, animation:"fadeUp 0.5s 0.3s both" }}>
        <div style={{ display:"flex", border:"2px solid #1a1410", boxShadow:"5px 5px 0 #1a1410", marginBottom:4 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&searchBusiness()}
            placeholder="e.g. Shake Shack NYC, Nike Chicago…"
            style={{ flex:1, padding:"15px 18px", border:"none", outline:"none", fontFamily:"'Libre Baskerville',serif", fontSize:16, background:"#fff", color:"#1a1410" }}/>
          <button onClick={searchBusiness} disabled={loading}
            style={{ padding:"15px 24px", background:loading?"#8a7a6e":"#b83228", color:"#fff", border:"none", fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, fontStyle:"italic", cursor:loading?"wait":"pointer", whiteSpace:"nowrap", minWidth:120 }}>
            {loading?"Searching…":"Search →"}
          </button>
        </div>
        {err&&<div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#b83228",padding:"8px 4px"}}>{err}</div>}
      </div>

      {loading&&<div style={{marginTop:28,display:"flex",gap:8,alignItems:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,background:"#b83228",borderRadius:"50%",animation:`pulse 1.2s ${i*0.2}s infinite`}}/>)}<span style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#8a7a6e",letterSpacing:2,textTransform:"uppercase",marginLeft:8}}>Finding listings…</span></div>}

      {/* Search results */}
      {results.length>0&&(
        <div style={{width:"100%",maxWidth:560,marginTop:24,animation:"fadeUp 0.3s both"}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"#8a7a6e",marginBottom:12}}>{results.length} result{results.length!==1?"s":""} found</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {results.map((biz,i)=><BizCard key={i} biz={biz} i={i} showWhyLocal={false}/>)}
          </div>
        </div>
      )}

      {/* ── LOCAL PICKS SECTION ── */}
      <div style={{ width:"100%", maxWidth:560, marginTop: results.length>0 ? 48 : 32 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16, paddingBottom:10, borderBottom:"2px solid #1a1410" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:"#1a1410" }}>
            <span style={{color:"#b83228"}}>📍</span> Top Local Picks{locationName ? ` in ${locationName}` : ""}
          </div>
          {localLoading && <div style={{display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:6,height:6,background:"#c47a1a",borderRadius:"50%",animation:`pulse 1.2s ${i*0.2}s infinite`}}/>)}</div>}
        </div>

        {localErr && !localLoading && (
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"#8a7a6e",padding:"12px",background:"#ece5d5",border:"1px solid rgba(26,20,16,0.1)"}}>{localErr}</div>
        )}

        {!localLoading && localBiz.length === 0 && !localErr && (
          <div style={{fontFamily:"'Libre Baskerville',serif",fontStyle:"italic",color:"#a09080",fontSize:14,padding:"8px 0"}}>
            Loading local recommendations…
          </div>
        )}

        {localBiz.length > 0 && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {localBiz.map((biz,i)=><BizCard key={i} biz={biz} i={i} showWhyLocal={true}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCREEN: MY REVIEWS
══════════════════════════════════════════════ */
function MyReviewsScreen({ reviews, onViewReview }) {
  if (reviews.length === 0) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", padding:"40px 24px", textAlign:"center" }}>
      <div style={{ fontSize:48, marginBottom:20 }}>📋</div>
      <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:28, color:"#1a1410", marginBottom:12 }}>No reviews yet</h2>
      <p style={{ fontFamily:"'Libre Baskerville',serif", fontSize:15, color:"#6a5f55", maxWidth:360 }}>Search for a business on the home tab to write your first review.</p>
    </div>
  );

  return (
    <div style={{ maxWidth:700, margin:"0 auto", padding:"32px 20px 60px" }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:22, marginBottom:24, paddingBottom:10, borderBottom:"2px solid #1a1410", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{color:"#b83228"}}>§</span> My Reviews
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#8a7a6e", fontWeight:400, marginLeft:4 }}>({reviews.length})</span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {[...reviews].reverse().map((review, i) => {
          const verdict = getVerdict(review.score);
          const date = new Date(review.submittedAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
          return (
            <button key={review.id} onClick={()=>onViewReview(review)}
              style={{ background:"#faf7f0", border:"2px solid #1a1410", boxShadow:"4px 4px 0 #1a1410", padding:"20px 24px", cursor:"pointer", textAlign:"left", transition:"all 0.15s", display:"block", width:"100%", animation:`fadeUp 0.3s ${i*0.06}s both` }}
              onMouseEnter={e=>{e.currentTarget.style.transform="translate(-2px,-2px)";e.currentTarget.style.boxShadow="6px 6px 0 #b83228";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="4px 4px 0 #1a1410";}}
            >
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:18, color:"#1a1410", marginBottom:4 }}>{review.business.name}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a7a6e", letterSpacing:1, marginBottom:10 }}>{review.business.address}{review.business.city?`, ${review.business.city}`:""}</div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:13, color:verdict.color }}>{verdict.label}</span>
                    <span style={{ color:"#d0c8bc" }}>·</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a7a6e" }}>{date}</span>
                    <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#b83228", background:"rgba(184,50,40,0.08)", padding:"2px 8px", border:"1px solid rgba(184,50,40,0.15)" }}>🔒 Locked</span>
                  </div>
                </div>
                <div style={{ textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:32, color:"#b83228", lineHeight:1 }}>{review.score.toFixed(1)}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a7a6e" }}>/ 10</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCREEN: QUESTION
══════════════════════════════════════════════ */
function QuestionScreen({ business, answers, onAnswer, onNext, onBack, onFinish, idx }) {
  const q = SHUFFLED_QUESTIONS[idx];
  const answered = Object.keys(answers).filter(k => answers[k]).length;
  const pct = answered / 15;
  const isLast = idx === QUESTIONS.length - 1;
  const selectedEntry = answers[q.id] || null; // {score, label} or null
  const selectedLabel = selectedEntry?.label ?? null;
  const canProceed = selectedEntry !== null;

  // onAnswer stores {score, label} — label is unique per question so no collision
  const handleSelect = (option) => {
    onAnswer(q.id, option); // null to deselect, or {score, label}
  };

  return (
    <div style={{ maxWidth:660, margin:"0 auto", padding:"24px 20px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#8a7a6e", marginBottom:4 }}>Reviewing</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:16, color:"#1a1410", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{business.name}</div>
        </div>
        <ProgressRing pct={pct} idx={idx} total={15}/>
      </div>

      <div style={{ display:"flex", gap:3, marginBottom:24 }}>
        {QUESTIONS.map((_,i)=><div key={i} style={{flex:1,height:4,background:i<idx?"#b83228":i===idx?"#c47a1a":"#ddd4c4",transition:"background 0.3s"}}/>)}
      </div>

      <div key={idx} style={{ background:"#faf7f0", border:"2px solid #1a1410", boxShadow:"6px 6px 0 #1a1410", padding:"28px 28px 24px", marginBottom:20, animation:"slideIn 0.25s both" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 14px", background:CAT_COLORS[q.category], color:"#fff", fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:1.5, textTransform:"uppercase", marginBottom:18 }}>
          <span>{q.icon}</span> {q.category}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#b83228", fontWeight:500 }}>Question {String(idx+1).padStart(2,"0")} of 15</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#8a7a6e", background:"#ece5d5", padding:"2px 10px", border:"1px solid rgba(26,20,16,0.1)" }}>Weight: {q.weight}/10</div>
        </div>
        <p style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:"clamp(16px,2.5vw,20px)", lineHeight:1.5, color:"#1a1410", marginBottom:24 }}>{q.text}</p>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {q.displayOptions.map((opt,i)=>(
            <OptionButton key={i} option={opt} selectedLabel={selectedLabel} onSelect={handleSelect}/>
          ))}
        </div>
        {selectedLabel&&(
          <div style={{ marginTop:16, padding:"10px 16px", background:"rgba(26,20,16,0.04)", borderLeft:"3px solid #c47a1a", fontFamily:"'Libre Baskerville',serif", fontStyle:"italic", fontSize:13, color:"#6a5f55", animation:"fadeUp 0.2s both" }}>
            Selected: <strong style={{color:"#1a1410",fontStyle:"normal"}}>"{selectedLabel}"</strong>
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:12, justifyContent:"space-between", alignItems:"center" }}>
        <button onClick={onBack} disabled={idx===0} style={{ padding:"12px 22px", background:"transparent", border:`2px solid ${idx===0?"#c0b0a0":"#1a1410"}`, fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, cursor:idx===0?"not-allowed":"pointer", color:idx===0?"#c0b0a0":"#1a1410", boxShadow:idx===0?"none":"3px 3px 0 #1a1410" }}>← Back</button>
        <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#a09080" }}>{answered} of 15</div>
        <button onClick={()=>canProceed&&(isLast?onFinish():onNext())} disabled={!canProceed}
          style={{ padding:"12px 28px", background:canProceed?"#b83228":"#ddd4c4", color:canProceed?"#fff":"#a09080", border:`2px solid ${canProceed?"#1a1410":"#c0b0a0"}`, boxShadow:canProceed?"4px 4px 0 #1a1410":"none", fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, fontStyle:"italic", cursor:canProceed?"pointer":"not-allowed" }}
          onMouseEnter={e=>canProceed&&(e.target.style.background="#8c251e")}
          onMouseLeave={e=>canProceed&&(e.target.style.background="#b83228")}
        >{isLast?"Review My Answers →":"Next →"}</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCREEN: CONFIRM SUBMIT
══════════════════════════════════════════════ */
function ConfirmScreen({ business, answers, onConfirm, onBack }) {
  const [checked, setChecked] = useState(false);

  return (
    <div style={{ maxWidth:620, margin:"0 auto", padding:"32px 20px 60px" }}>
      <div style={{ background:"#faf7f0", border:"2px solid #1a1410", boxShadow:"8px 8px 0 #1a1410", padding:"40px 36px", animation:"fadeUp 0.4s both" }}>

        {/* Lock icon */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:72, height:72, background:"#1a1410", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", fontSize:32 }}>🔒</div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:3, textTransform:"uppercase", color:"#b83228" }}>Before You Submit</div>
        </div>

        <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"clamp(22px,4vw,30px)", color:"#1a1410", textAlign:"center", marginBottom:10 }}>
          Are you ready to lock in<br/>your review of <em style={{color:"#b83228"}}>{business.name}</em>?
        </h2>

        <p style={{ fontFamily:"'Libre Baskerville',serif", fontSize:14, lineHeight:1.8, color:"#5a4f46", textAlign:"center", marginBottom:28 }}>
          Once submitted, your review is <strong>permanent and cannot be edited</strong>. This protects the integrity of the score and ensures all reviews reflect genuine experiences.
        </p>

        {/* Answer summary */}
        <div style={{ background:"#ece5d5", border:"1px solid rgba(26,20,16,0.15)", padding:"16px 20px", marginBottom:28 }}>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#8a7a6e", marginBottom:12 }}>Your 15 answers at a glance</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {SHUFFLED_QUESTIONS.map((q,i)=>{
              const entry = answers[q.id];
              const label = entry?.label ?? "—";
              return (
                <div key={q.id} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                  <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#b83228", minWidth:22, paddingTop:1 }}>Q{i+1}</span>
                  <span style={{ fontFamily:"'Libre Baskerville',serif", fontSize:12, color:"#3a3028", lineHeight:1.4 }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Consent checkbox */}
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:28, padding:"16px", border:`2px solid ${checked?"#1a1410":"#d0c8bc"}`, background: checked?"rgba(26,20,16,0.03)":"#fff", cursor:"pointer", transition:"all 0.15s" }}
          onClick={()=>setChecked(!checked)}>
          <div style={{ width:22, height:22, flexShrink:0, border:`2px solid ${checked?"#1a1410":"#b0a090"}`, background: checked?"#1a1410":"transparent", display:"flex", alignItems:"center", justifyContent:"center", marginTop:1, transition:"all 0.15s" }}>
            {checked&&<svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
          <p style={{ fontFamily:"'Libre Baskerville',serif", fontSize:13, lineHeight:1.6, color:"#3a3028", margin:0 }}>
            I confirm that this review reflects my genuine personal experience with <strong>{business.name}</strong>, and I understand that it cannot be changed after submission.
          </p>
        </div>

        <div style={{ display:"flex", gap:12 }}>
          <button onClick={onBack} style={{ flex:1, padding:"14px", background:"transparent", color:"#1a1410", border:"2px solid #1a1410", boxShadow:"3px 3px 0 #1a1410", fontFamily:"'Playfair Display',serif", fontSize:15, fontWeight:700, cursor:"pointer" }}>← Go Back</button>
          <button onClick={()=>checked&&onConfirm()} disabled={!checked}
            style={{ flex:2, padding:"14px", background:checked?"#b83228":"#ddd4c4", color:checked?"#fff":"#a09080", border:`2px solid ${checked?"#1a1410":"#c0b0a0"}`, boxShadow:checked?"4px 4px 0 #1a1410":"none", fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, fontStyle:"italic", cursor:checked?"pointer":"not-allowed", transition:"all 0.15s" }}
            onMouseEnter={e=>checked&&(e.target.style.background="#8c251e")}
            onMouseLeave={e=>checked&&(e.target.style.background="#b83228")}
          >🔒 Submit & Lock Review</button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SCREEN: RESULTS (read-only if locked)
══════════════════════════════════════════════ */
function ResultsScreen({ business, answers, score, catScores, submittedAt, onReset, locked }) {
  const verdict = getVerdict(score);
  const [bars, setBars] = useState(false);
  useEffect(()=>{ setTimeout(()=>setBars(true),500); },[]);
  const date = submittedAt ? new Date(submittedAt).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}) : null;

  return (
    <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 20px 60px" }}>

      {/* Hero */}
      <div style={{ background:"#faf7f0", border:"2px solid #1a1410", boxShadow:"8px 8px 0 #1a1410", padding:"44px 36px", textAlign:"center", marginBottom:32, animation:"fadeUp 0.4s both", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, width:60, height:60, background:"#b83228", clipPath:"polygon(0 0,100% 0,0 100%)" }}/>
        <div style={{ position:"absolute", bottom:0, right:0, width:60, height:60, background:"#ece5d5", clipPath:"polygon(100% 100%,0 100%,100% 0)" }}/>

        {locked&&<div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#1a1410", color:"#f5f0e8", padding:"4px 14px", fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, textTransform:"uppercase", marginBottom:20 }}>🔒 Locked Review</div>}

        <div style={{ width:150, height:150, borderRadius:"50%", border:"5px solid #b83228", boxShadow:"0 0 0 3px #b83228, 0 8px 32px rgba(184,50,40,0.2)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", animation:"stampIn 0.5s 0.2s cubic-bezier(0.175,0.885,0.32,1.275) both", background:"#fff" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:50, color:"#b83228", lineHeight:1 }}>
            <AnimatedScore target={score}/>
          </div>
          <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"#8a7a6e" }}>/ 10</div>
        </div>

        <h2 style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"clamp(20px,4vw,32px)", color:"#1a1410", marginBottom:6 }}>{business.name}</h2>
        {(business.address||business.city)&&<div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#8a7a6e", letterSpacing:1, marginBottom:10 }}>{business.address}{business.city?`, ${business.city}`:""}</div>}
        <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:19, color:verdict.color, marginBottom:4 }}>{verdict.label}</div>
        <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:13, color:"#6a5f55", marginBottom: date?16:0 }}>{verdict.sub}</div>
        {date&&<div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color:"#a09080", letterSpacing:1 }}>Submitted {date}</div>}
      </div>

      {/* Category scores */}
      <div style={{ marginBottom:32, animation:"fadeUp 0.4s 0.2s both" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:20, marginBottom:16, paddingBottom:10, borderBottom:"2px solid #1a1410", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{color:"#b83228"}}>§</span> Score by Category
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:12 }}>
          {Object.entries(catScores).map(([cat,s],i)=>{
            const color=CAT_COLORS[cat]||"#b83228";
            return (
              <div key={cat} style={{ background:"#faf7f0", border:"1.5px solid #1a1410", padding:"16px 18px", boxShadow:"3px 3px 0 #1a1410", animation:`fadeUp 0.4s ${0.1*i+0.3}s both` }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:2, textTransform:"uppercase", color, marginBottom:8 }}>{cat}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:28, color:"#1a1410", lineHeight:1, marginBottom:10 }}>
                  {s.toFixed(1)} <span style={{ fontSize:12, color:"#8a7a6e", fontFamily:"'DM Mono',monospace" }}>/ 10</span>
                </div>
                <div style={{ height:6, background:"#ece5d5", border:"1px solid rgba(26,20,16,0.12)" }}>
                  <div style={{ height:"100%", background:color, width:bars?`${s*10}%`:"0%", transition:`width ${0.8+i*0.1}s cubic-bezier(0.4,0,0.2,1)` }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Answers */}
      <div style={{ marginBottom:32, animation:"fadeUp 0.4s 0.4s both" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:700, fontSize:20, marginBottom:16, paddingBottom:10, borderBottom:"2px solid #1a1410", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{color:"#b83228"}}>§</span> Your Answers {locked&&<span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#b83228",fontWeight:400}}>— read only</span>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {SHUFFLED_QUESTIONS.map((q,i)=>{
            const entry = answers[q.id];
            const label = entry?.label ?? "—";
            return (
              <div key={q.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"12px 16px", background:"#faf7f0", border:"1px solid rgba(26,20,16,0.12)", animation:`fadeUp 0.3s ${i*0.025+0.5}s both` }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#b83228", minWidth:26, paddingTop:2 }}>Q{String(i+1).padStart(2,"0")}</div>
                <div style={{ width:3, minHeight:30, background:CAT_COLORS[q.category], borderRadius:2, flexShrink:0, marginTop:2 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Libre Baskerville',serif", fontSize:12, color:"#6a5f55", marginBottom:4 }}>{q.text}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"#1a1410", fontWeight:500 }}>→ {label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign:"center", animation:"fadeUp 0.4s 0.7s both" }}>
        <button onClick={onReset}
          style={{ padding:"14px 40px", background:"transparent", color:"#1a1410", fontFamily:"'Playfair Display',serif", fontSize:16, fontWeight:700, border:"2px solid #1a1410", boxShadow:"4px 4px 0 #1a1410", cursor:"pointer", transition:"all 0.15s" }}
          onMouseEnter={e=>{e.target.style.background="#1a1410";e.target.style.color="#f5f0e8";}}
          onMouseLeave={e=>{e.target.style.background="transparent";e.target.style.color="#1a1410";}}
        >{locked?"← Back to My Reviews":"← Review Another Business"}</button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   ROOT APP
══════════════════════════════════════════════ */
export default function App() {
  const [user,       setUser]       = useState(null);
  const [screen,     setScreen]     = useState("auth");   // auth|home|questions|confirm|results|myreviews|viewreview
  const [activeTab,  setActiveTab]  = useState("home");
  const [business,   setBusiness]   = useState(null);
  const [answers,    setAnswers]    = useState({});
  const [qIdx,       setQIdx]       = useState(0);
  const [reviews,    setReviews]    = useState([]);
  const [viewReview, setViewReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load reviews when user logs in
  useEffect(() => {
    if (user) loadUserReviews(user.userId).then(setReviews);
  }, [user]);

  const handleAuth = (u) => { setUser(u); setScreen("home"); setActiveTab("home"); };

  const handleSelect = (biz) => { setBusiness(biz); setAnswers({}); setQIdx(0); setScreen("questions"); };

  const handleAnswer = (id, v) => setAnswers(prev => ({ ...prev, [id]: v }));

  const handleQFinish = () => setScreen("confirm");

  const submittingRef = useRef(false);

  const handleConfirm = async () => {
    if (submittingRef.current) return; // prevent double-submit
    submittingRef.current = true;
    setSubmitting(true);

    // Deduplicate: refuse if this business already has a review
    const alreadyExists = reviews.some(r => r.business.name === business.name);
    if (alreadyExists) {
      submittingRef.current = false;
      setSubmitting(false);
      setScreen("home");
      setActiveTab("myreviews");
      return;
    }

    const { final, catScores } = computeScore(answers);
    const review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
      business,
      answers,
      score: final,
      catScores,
      submittedAt: Date.now(),
    };

    // Final dedup on the loaded reviews from storage (race condition protection)
    const freshReviews = await loadUserReviews(user.userId);
    const alreadyInStorage = freshReviews.some(r => r.business.name === business.name);
    if (alreadyInStorage) {
      submittingRef.current = false;
      setSubmitting(false);
      setReviews(freshReviews);
      setScreen("home");
      setActiveTab("myreviews");
      return;
    }

    const updated = [...freshReviews, review];
    await saveUserReviews(user.userId, updated);
    setReviews(updated);
    setViewReview(review);
    setScreen("results");
    setSubmitting(false);
    submittingRef.current = false;
  };

  const handleViewReview = (review) => { setViewReview(review); setScreen("viewreview"); };

  const handleLogout = () => { setUser(null); setScreen("auth"); setReviews([]); setBusiness(null); setAnswers({}); };

  const goHome = () => { setScreen("home"); setActiveTab("home"); setBusiness(null); setAnswers({}); };
  const goMyReviews = () => { setScreen("home"); setActiveTab("myreviews"); };

  return (
    <div style={{ minHeight:"100vh", background:"#f5f0e8", backgroundImage:"radial-gradient(ellipse at 15% 10%,rgba(196,122,26,0.07) 0%,transparent 55%),radial-gradient(ellipse at 85% 90%,rgba(184,50,40,0.06) 0%,transparent 55%)", fontFamily:"'Libre Baskerville',Georgia,serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,400;1,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp   {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeDown {from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn  {from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}
        @keyframes stampIn  {from{transform:scale(0.5) rotate(-8deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
        @keyframes pulse    {0%,100%{transform:scale(0.8);opacity:0.5}50%{transform:scale(1.2);opacity:1}}
        button:focus{outline:2px solid #c47a1a;outline-offset:2px;}
        input:focus{outline:none;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-thumb{background:#b83228;}
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background:"#b83228", position:"sticky", top:0, zIndex:100, boxShadow:"0 3px 16px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth:900, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"stretch", justifyContent:"space-between" }}>
          {/* Logo */}
          <button onClick={goHome} style={{ fontFamily:"'Playfair Display',serif", fontSize:22, fontWeight:900, fontStyle:"italic", color:"#fff", background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:8, padding:"12px 0" }}>
            <div style={{ width:30, height:30, background:"#c47a1a", clipPath:"polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)", display:"flex", alignItems:"center", justifyContent:"center", fontStyle:"normal", fontSize:11, fontWeight:900, color:"#1a1410" }}>R</div>
            RateIt
          </button>

          {/* Nav tabs — only show when logged in and on home/myreviews */}
          {user && (screen==="home"||screen==="results"||screen==="viewreview") && (
            <div style={{ display:"flex", alignItems:"stretch", gap:2 }}>
              {[
                { id:"home",      label:"Find & Rate" },
                { id:"myreviews", label:`My Reviews ${reviews.length>0?`(${reviews.length})`:""}`},
              ].map(tab=>(
                <button key={tab.id}
                  onClick={()=>{ setActiveTab(tab.id); setScreen("home"); }}
                  style={{ padding:"0 18px", background: activeTab===tab.id?"rgba(255,255,255,0.15)":"transparent", color:"#fff", border:"none", borderBottom: activeTab===tab.id?"3px solid #fff":"3px solid transparent", fontFamily:"'DM Mono',monospace", fontSize:11, letterSpacing:1.5, textTransform:"uppercase", cursor:"pointer", transition:"all 0.15s" }}>
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            {screen==="questions"&&<div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.7)", letterSpacing:2, textTransform:"uppercase" }}>Q {qIdx+1} / 15</div>}
            {user&&(
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"rgba(255,255,255,0.8)", letterSpacing:1 }}>{user.name.split(" ")[0]}</div>
                <button onClick={handleLogout} style={{ padding:"5px 12px", background:"rgba(255,255,255,0.15)", color:"#fff", border:"1px solid rgba(255,255,255,0.3)", fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:1, textTransform:"uppercase", cursor:"pointer" }}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── SCREENS ── */}
      {screen==="auth" && <AuthScreen onAuth={handleAuth}/>}

      {screen==="home" && activeTab==="home" && <LandingScreen onSelect={handleSelect} user={user} reviews={reviews}/>}

      {screen==="home" && activeTab==="myreviews" && <MyReviewsScreen reviews={reviews} onViewReview={handleViewReview}/>}

      {screen==="questions" && <QuestionScreen business={business} answers={answers} onAnswer={handleAnswer} onNext={()=>setQIdx(i=>i+1)} onBack={()=>setQIdx(i=>Math.max(0,i-1))} onFinish={handleQFinish} idx={qIdx}/>}

      {screen==="confirm" && <ConfirmScreen business={business} answers={answers} onConfirm={handleConfirm} onBack={()=>{ setQIdx(14); setScreen("questions"); }}/>}

      {screen==="results" && viewReview && (
        <ResultsScreen business={viewReview.business} answers={viewReview.answers} score={viewReview.score} catScores={viewReview.catScores} submittedAt={viewReview.submittedAt} onReset={goHome} locked={true}/>
      )}

      {screen==="viewreview" && viewReview && (
        <ResultsScreen business={viewReview.business} answers={viewReview.answers} score={viewReview.score} catScores={viewReview.catScores} submittedAt={viewReview.submittedAt} onReset={goMyReviews} locked={true}/>
      )}
    </div>
  );
}
