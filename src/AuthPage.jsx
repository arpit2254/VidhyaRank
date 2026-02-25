import { useState } from "react";
import { supabase, SUPABASE_CONFIGURED } from "./supabaseClient";

const HERO_IMG =
  "https://images.unsplash.com/photo-1562774053-701939374585?w=1920&q=90&fit=crop&crop=center";

// ─── Translate cryptic Supabase errors into plain English ────────────────────
function friendlyError(msg = "") {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return "Wrong email or password. Double-check and try again.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for a link from Supabase.";
  if (m.includes("user already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try signing in instead.";
  if (m.includes("password should be at least"))
    return "Password must be at least 6 characters.";
  if (m.includes("unable to validate email address"))
    return "Please enter a valid email address.";
  if (m.includes("email rate limit") || m.includes("too many requests"))
    return "Too many attempts. Wait a minute and try again.";
  if (m.includes("network") || m.includes("fetch") || m.includes("failed"))
    return "Network error — check your internet connection and try again.";
  if (m.includes("provider") || m.includes("oauth"))
    return "Google sign-in failed. Make sure Google is enabled in your Supabase dashboard.";
  if (m.includes("redirect") || m.includes("pkce") || m.includes("code verifier"))
    return "Redirect error — make sure your Site URL is set correctly in Supabase → Auth → URL Configuration.";
  return msg || "Something went wrong. Please try again.";
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19.1 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8H6.3C9.7 36.9 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.2 5.2C37.1 38.9 44 33.5 44 24c0-1.3-.1-2.6-.4-3.9z"/>
    </svg>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ animation: "spin 0.75s linear infinite" }}>
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  );
}

// ─── Setup Warning Banner ─────────────────────────────────────────────────────
function SetupBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div style={{
      background: "#fff7ed",
      border: "1.5px solid #fed7aa",
      borderRadius: 12,
      padding: "14px 16px",
      marginBottom: 20,
      fontSize: 13,
      color: "#92400e",
      position: "relative",
    }}>
      <button onClick={() => setDismissed(true)} style={{
        position: "absolute", top: 10, right: 12,
        background: "none", border: "none", cursor: "pointer",
        color: "#d97706", fontSize: 18, lineHeight: 1,
      }}>×</button>
      <div style={{ fontWeight: 800, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
        ⚠️ Supabase not configured yet
      </div>
      <div style={{ lineHeight: 1.7 }}>
        Open <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>src/supabaseClient.js</code> and replace <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>YOUR_PROJECT_ID</code> and <code style={{ background: "#fef3c7", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>YOUR_ANON_PUBLIC_KEY</code> with your real values from{" "}
        <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer"
          style={{ color: "#b45309", fontWeight: 700 }}>supabase.com/dashboard</a>
        {" "}→ Settings → API.
      </div>
    </div>
  );
}

// ─── AuthPage ─────────────────────────────────────────────────────────────────
export default function AuthPage({ dark }) {
  const [mode,       setMode]       = useState("login");
  const [email,      setEmail]      = useState("");
  const [password,   setPassword]   = useState("");
  const [showPass,   setShowPass]   = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState("");
  const [emailSent,  setEmailSent]  = useState(false); // track "check your inbox" state

  const clearMessages = () => { setError(""); setSuccess(""); };

  const showError = (msg) => {
    setError(friendlyError(msg));
    setLoading(false);
    setGoogleLoad(false);
  };

  // ── Google OAuth ────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    if (!SUPABASE_CONFIGURED) {
      setError("Supabase is not configured yet. See the banner above.");
      return;
    }
    clearMessages();
    setGoogleLoad(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });
      if (error) showError(error.message);
      // On success: Supabase auto-redirects — no further action needed
    } catch (e) {
      showError(e.message);
    }
  };

  // ── Resend confirmation email ───────────────────────────────────────────────
  const resendConfirmation = async () => {
    clearMessages();
    setLoading(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) showError(error.message);
    else setSuccess("Confirmation email resent! Check your inbox.");
    setLoading(false);
  };

  // ── Email + Password submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!SUPABASE_CONFIGURED) {
      setError("Supabase is not configured yet. See the banner above.");
      return;
    }
    clearMessages();

    if (!email.trim()) { setError("Please enter your email."); return; }
    if (mode !== "forgot" && !password.trim()) { setError("Please enter your password."); return; }

    setLoading(true);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Special handling: email not confirmed → offer resend button
          if (error.message.toLowerCase().includes("email not confirmed")) {
            setEmailSent(true);
            showError(error.message);
          } else {
            showError(error.message);
          }
          return;
        }
        // Success: onAuthStateChange in App.jsx handles redirect automatically
      }

      if (mode === "signup") {
        if (password.length < 6) { showError("Password must be at least 6 characters."); return; }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) { showError(error.message); return; }
        setEmailSent(true);
        setSuccess("Account created! Check your inbox and click the confirmation link, then come back to sign in.");
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) { showError(error.message); return; }
        setSuccess("Password reset link sent! Check your inbox.");
      }
    } catch (e) {
      showError(e?.message || "Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared styles ───────────────────────────────────────────────────────────
  const inp = {
    width: "100%", padding: "12px 14px", fontSize: 14,
    border: `1.5px solid ${dark ? "#2d2a36" : "#e0d9d0"}`,
    borderRadius: 10,
    background: dark ? "#1c1a22" : "#faf7f3",
    color: dark ? "#e0d8d0" : "#1a0a00",
    outline: "none", fontFamily: "inherit",
    transition: "border-color 0.16s, box-shadow 0.16s",
  };

  const modeTitle = { login: "Welcome back", signup: "Create your account", forgot: "Reset your password" }[mode];
  const modeSub   = {
    login:  "Sign in to access your personalised college finder.",
    signup: "Join Vidhya Rank — it's free.",
    forgot: "We'll email you a link to reset your password.",
  }[mode];

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* ── Left hero panel ── */}
      <div style={{ flex: "0 0 46%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }} className="auth-hero-panel">
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url('${HERO_IMG}')`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,2,0,0.72) 0%, rgba(16,7,1,0.82) 55%, rgba(3,1,0,0.92) 100%)" }} />
        <div style={{ position: "relative", zIndex: 1, padding: "36px 40px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
              Vidhya <span style={{ color: "#f97316" }}>Rank</span>
            </span>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", marginTop: 2 }}>vidya-rank.vercel.app</div>
          </div>
          <div>
            <h2 style={{ fontSize: "clamp(26px,3vw,38px)", fontWeight: 900, color: "#fff", lineHeight: 1.15, fontFamily: "'Playfair Display', serif", marginBottom: 14 }}>
              Find Your Best<br /><span style={{ color: "#f97316", fontStyle: "italic" }}>College Fit</span>
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 320 }}>
              Personalised MHT-CET college rankings based on your percentile &amp; category — across 343 colleges and 14,459 records.
            </p>
            <div style={{ display: "flex", gap: 28, marginTop: 28 }}>
              {[{ n: "343", l: "Colleges" }, { n: "14k+", l: "Records" }, { n: "Free", l: "Always" }].map(s => (
                <div key={s.l}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", lineHeight: 1, fontFamily: "monospace" }}>{s.n}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.36)", letterSpacing: "0.14em", marginTop: 5 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "16px 18px", backdropFilter: "blur(8px)" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontStyle: "italic", lineHeight: 1.6, marginBottom: 8 }}>
              "Found my dream branch in 30 seconds. Way better than searching DTE manually."
            </p>
            <p style={{ fontSize: 11, color: "#f97316", fontWeight: 700 }}>— MHT-CET 2024 student</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: dark ? "#0f0f14" : "#f2ede7", padding: "32px 24px", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="auth-mobile-logo" style={{ marginBottom: 18, display: "none" }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: dark ? "#e0d8d0" : "#1a0a00", fontFamily: "'Playfair Display', serif" }}>
              Vidhya <span style={{ color: "#f97316" }}>Rank</span>
            </span>
          </div>

          {/* Setup warning */}
          {!SUPABASE_CONFIGURED && <SetupBanner />}

          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: dark ? "#e0d8d0" : "#1a0a00", fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>{modeTitle}</h1>
            <p style={{ fontSize: 13, color: dark ? "#666" : "#999", lineHeight: 1.6 }}>{modeSub}</p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#dc2626" }}>
              ⚠️ {error}
              {/* Resend confirmation email button */}
              {emailSent && email && error.toLowerCase().includes("confirm") && (
                <button onClick={resendConfirmation} disabled={loading}
                  style={{ display: "block", marginTop: 8, fontSize: 12, fontWeight: 700, color: "#dc2626", background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                  Resend confirmation email
                </button>
              )}
            </div>
          )}

          {/* Success banner */}
          {success && (
            <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#16a34a", lineHeight: 1.6 }}>
              ✅ {success}
            </div>
          )}

          {/* Google button */}
          {mode !== "forgot" && (
            <>
              <button onClick={handleGoogle} disabled={googleLoad || loading}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 10,
                  border: `1.5px solid ${dark ? "#2d2a36" : "#e0d9d0"}`,
                  background: dark ? "#1c1a22" : "#fff",
                  color: dark ? "#e0d8d0" : "#333",
                  fontSize: 14, fontWeight: 600, cursor: googleLoad ? "wait" : "pointer",
                  transition: "all 0.15s", fontFamily: "inherit",
                  opacity: !SUPABASE_CONFIGURED ? 0.5 : 1,
                }}
                onMouseEnter={e => { if (SUPABASE_CONFIGURED) { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.background = dark ? "#252230" : "#fff8f2"; }}}
                onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "#2d2a36" : "#e0d9d0"; e.currentTarget.style.background = dark ? "#1c1a22" : "#fff"; }}>
                {googleLoad ? <Spinner /> : <GoogleIcon />}
                {googleLoad ? "Redirecting to Google…" : "Continue with Google"}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
                <div style={{ flex: 1, height: 1, background: dark ? "#2d2a36" : "#ede6dc" }} />
                <span style={{ fontSize: 12, color: dark ? "#444" : "#ccc", fontWeight: 600 }}>or</span>
                <div style={{ flex: 1, height: 1, background: dark ? "#2d2a36" : "#ede6dc" }} />
              </div>
            </>
          )}

          {/* Email / Password form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: dark ? "#998f88" : "#666", letterSpacing: "0.06em", display: "block", marginBottom: 6 }}>EMAIL</label>
              <input type="email" placeholder="you@example.com" value={email}
                onChange={e => { setEmail(e.target.value); clearMessages(); }}
                required style={inp}
                onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.1)"; }}
                onBlur={e  => { e.target.style.borderColor = dark ? "#2d2a36" : "#e0d9d0"; e.target.style.boxShadow = "none"; }} />
            </div>

            {mode !== "forgot" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: dark ? "#998f88" : "#666", letterSpacing: "0.06em" }}>PASSWORD</label>
                  {mode === "login" && (
                    <button type="button" onClick={() => { setMode("forgot"); clearMessages(); }}
                      style={{ fontSize: 12, color: "#f97316", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"}
                    placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearMessages(); }}
                    required style={{ ...inp, paddingRight: 44 }}
                    onFocus={e => { e.target.style.borderColor = "#f97316"; e.target.style.boxShadow = "0 0 0 3px rgba(249,115,22,0.1)"; }}
                    onBlur={e  => { e.target.style.borderColor = dark ? "#2d2a36" : "#e0d9d0"; e.target.style.boxShadow = "none"; }} />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: dark ? "#555" : "#bbb", display: "flex", alignItems: "center" }}>
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                {mode === "signup" && password.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", gap: 4, alignItems: "center" }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 100, background: password.length >= i*2 ? (password.length >= 8 ? "#16a34a" : "#f97316") : (dark ? "#2d2a36" : "#e0d9d0"), transition: "background 0.2s" }} />
                    ))}
                    <span style={{ fontSize: 10, color: dark ? "#555" : "#ccc", marginLeft: 4, whiteSpace: "nowrap" }}>
                      {password.length < 4 ? "Weak" : password.length < 8 ? "Fair" : "Strong"}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading || googleLoad}
              style={{
                width: "100%", padding: "13px", borderRadius: 10, border: "none",
                background: loading ? (dark ? "#252230" : "#f0e9e0") : "linear-gradient(90deg, #f97316, #fb923c)",
                color: loading ? (dark ? "#444" : "#bbb") : "#fff",
                fontSize: 15, fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                boxShadow: loading ? "none" : "0 4px 18px rgba(249,115,22,0.32)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "inherit", transition: "all 0.18s",
                opacity: !SUPABASE_CONFIGURED ? 0.6 : 1,
              }}>
              {loading && <Spinner />}
              {loading ? "Please wait…" : { login: "Sign in →", signup: "Create account →", forgot: "Send reset link →" }[mode]}
            </button>
          </form>

          {/* Mode switchers */}
          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: dark ? "#555" : "#aaa" }}>
            {mode === "login" && <>
              Don't have an account?{" "}
              <button onClick={() => { setMode("signup"); clearMessages(); setPassword(""); setEmailSent(false); }}
                style={{ color: "#f97316", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                Sign up free
              </button>
            </>}
            {mode === "signup" && <>
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); clearMessages(); setPassword(""); setEmailSent(false); }}
                style={{ color: "#f97316", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                Sign in
              </button>
            </>}
            {mode === "forgot" && (
              <button onClick={() => { setMode("login"); clearMessages(); }}
                style={{ color: "#f97316", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                ← Back to sign in
              </button>
            )}
          </div>

          <p style={{ fontSize: 11, color: dark ? "#333" : "#ccc", textAlign: "center", marginTop: 24, lineHeight: 1.6 }}>
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .auth-hero-panel { display: none !important; }
          .auth-mobile-logo { display: block !important; }
        }
      `}</style>
    </div>
  );
}
