import { useState, useRef, useEffect } from "react";

// ─── System prompt — tuned for MHT-CET / CAP counseling ─────────────────────
const SYSTEM_PROMPT = `You are Vidya, a friendly MHT-CET & CAP admission counselor for Maharashtra engineering admissions. You know everything about CAP rounds, DTE Maharashtra, cutoffs, categories, colleges, branches, TFWS, fees, placements, and the full admission process.

RESPONSE RULES — follow these strictly:
1. Keep every reply under 80 words. No exceptions.
2. Lead with the direct answer in the very first sentence — no preamble, no "Great question!".
3. Use 2–4 bullet points max when listing things. Never write long paragraphs.
4. Be warm and encouraging but never fluffy — every sentence must carry information.
5. End with one short actionable tip or next step when relevant.
6. Use 1–2 emojis max per reply, only where they add clarity.
7. If a question needs more detail, give the core answer in 80 words and offer "Want more detail on any part?"

You know: GOPENS/OBC/SC/ST/SEBC/NT1/NT2/NT3/LOPENS/GOPENH/GOBCH/TFWS/EWS/Defence/PWD categories, Home University vs State seats, CAP Round 1/2/3 strategy, how to fill 500 preferences, NAAC grades, placement ranges, government vs private vs deemed colleges, document requirements, DTE portal, and cutoff interpretation. For specific cutoff data, tell them to use the Vidhya Rank search on this page.

Tone: like a smart older sibling who's been through this — calm, clear, honest, encouraging.`;

// ─── Suggested quick questions ───────────────────────────────────────────────
const SUGGESTIONS = [
  "How do I fill my CAP preference list?",
  "What is TFWS and who is eligible?",
  "Difference between Home University and State seats?",
  "I have 85 percentile OBC — what are my chances at COEP?",
  "What happens if I don't get a seat in Round 1?",
  "Which branches have the best placements?",
];

// ─── ChatBot Component ────────────────────────────────────────────────────────
export default function ChatBot({ dark }) {
  const [open,     setOpen]     = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm **Vidya**, your MHT-CET admission counselor 👋\n\nAsk me anything about CAP rounds, preference lists, categories, colleges, or cutoffs. I'm here to help!",
    },
  ]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [dots,     setDots]     = useState(".");
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const abortRef   = useRef(null);

  // Animate typing dots
  useEffect(() => {
    if (!loading) return;
    const id = setInterval(() => setDots(d => d.length >= 3 ? "." : d + "."), 400);
    return () => clearInterval(id);
  }, [loading]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // ── Send message ───────────────────────────────────────────────────────────
  const send = async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg  = { role: "user",      content: userText };
    const history  = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    // Build messages array for API (exclude system from messages array)
    const apiMessages = history.map(m => ({ role: m.role, content: m.content }));

    try {
      abortRef.current = new AbortController();
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: abortRef.current.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await res.json();
      const reply = data?.content?.map(b => b.text || "").join("") || "Sorry, I couldn't get a response. Please try again.";

      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Connection error. Please check your internet and try again." }]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setLoading(false);
    setMessages([{
      role: "assistant",
      content: "Hi! I'm **Vidya**, your MHT-CET admission counselor 👋\n\nAsk me anything about CAP rounds, preference lists, categories, colleges, or cutoffs. I'm here to help!",
    }]);
  };

  // ── Simple markdown renderer ───────────────────────────────────────────────
  const renderMd = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      // Bullet
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        return <div key={i} style={{ display: "flex", gap: 7, marginTop: 3 }}>
          <span style={{ color: "#f97316", fontWeight: 900, flexShrink: 0, marginTop: 1 }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: line.replace(/^[\-•]\s*/, "") }} />
        </div>;
      }
      if (line.trim() === "") return <div key={i} style={{ height: 6 }} />;
      return <div key={i} style={{ marginTop: i === 0 ? 0 : 2 }} dangerouslySetInnerHTML={{ __html: line }} />;
    });
  };

  // ─── Theme tokens ──────────────────────────────────────────────────────────
  const bg      = dark ? "#0f0f14" : "#f2ede7";
  const surface = dark ? "#1c1a22" : "#ffffff";
  const border  = dark ? "#2d2a36" : "#ede6dc";
  const muted   = dark ? "#998f88" : "#aaa";
  const text    = dark ? "#e0d8d0" : "#1a0a00";
  const subtext = dark ? "#555"    : "#999";

  return (
    <>
      {/* ── Floating bubble ── */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>

        {/* ── Chat window ── */}
        {open && (
          <div style={{
            position: "absolute", bottom: 64, right: 0,
            width: 370, height: 560,
            background: surface,
            border: `1.5px solid ${border}`,
            borderRadius: 20,
            boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
            display: "flex", flexDirection: "column",
            overflow: "hidden",
            animation: "chatUp 0.22s cubic-bezier(.34,1.4,.64,1)",
            fontFamily: "'DM Sans', system-ui, sans-serif",
          }}>

            {/* Header */}
            <div style={{
              background: "linear-gradient(90deg, #1a0a00, #3d1500)",
              padding: "14px 16px",
              display: "flex", alignItems: "center", gap: 10,
              flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #f97316, #fbbf24)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, flexShrink: 0,
                boxShadow: "0 0 0 2px rgba(249,115,22,0.3)",
              }}>🎓</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'Playfair Display', serif" }}>
                  Vidya <span style={{ color: "#f97316" }}>AI</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                  MHT-CET Counselor · Always online
                </div>
              </div>
              <button onClick={clearChat} title="Clear chat"
                style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 7, padding: "5px 8px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 11, fontWeight: 600, fontFamily: "inherit" }}>
                Clear
              </button>
              <button onClick={() => setOpen(false)}
                style={{ background: "rgba(255,255,255,0.08)", border: "none", borderRadius: 7, width: 28, height: 28, color: "rgba(255,255,255,0.6)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ×
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 14px 8px", display: "flex", flexDirection: "column", gap: 10, scrollbarWidth: "thin" }}>

              {messages.map((m, i) => (
                <div key={i} style={{
                  display: "flex",
                  flexDirection: m.role === "user" ? "row-reverse" : "row",
                  alignItems: "flex-end", gap: 7,
                }}>
                  {/* Avatar */}
                  {m.role === "assistant" && (
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginBottom: 2 }}>🎓</div>
                  )}

                  {/* Bubble */}
                  <div style={{
                    maxWidth: "82%",
                    padding: "10px 13px",
                    borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.role === "user"
                      ? "linear-gradient(135deg, #f97316, #fb923c)"
                      : dark ? "#252230" : "#f5f0eb",
                    color: m.role === "user" ? "#fff" : text,
                    fontSize: 13, lineHeight: 1.55,
                    boxShadow: m.role === "user" ? "0 3px 14px rgba(249,115,22,0.28)" : "none",
                  }}>
                    {renderMd(m.content)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 7 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#f97316,#fbbf24)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🎓</div>
                  <div style={{ background: dark ? "#252230" : "#f5f0eb", borderRadius: "16px 16px 16px 4px", padding: "10px 16px", display: "flex", alignItems: "center", gap: 5 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", opacity: 0.7, animation: `typingDot 1.1s ease ${i * 0.18}s infinite` }} />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions — shown only when just 1 message */}
            {messages.length === 1 && !loading && (
              <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 5, flexShrink: 0 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    style={{
                      padding: "5px 10px", borderRadius: 20, border: `1px solid ${border}`,
                      background: dark ? "#1c1a22" : "#fff",
                      color: dark ? "#998f88" : "#666",
                      fontSize: 11, fontWeight: 500, cursor: "pointer",
                      fontFamily: "inherit", transition: "all 0.13s", textAlign: "left",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#f97316"; e.currentTarget.style.color = "#f97316"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = dark ? "#998f88" : "#666"; }}>
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div style={{
              padding: "10px 12px",
              borderTop: `1px solid ${border}`,
              display: "flex", gap: 8, alignItems: "flex-end",
              flexShrink: 0,
              background: dark ? "#141218" : "#faf7f3",
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about CAP, cutoffs, colleges…"
                rows={1}
                style={{
                  flex: 1, resize: "none", border: `1.5px solid ${border}`,
                  borderRadius: 12, padding: "9px 12px",
                  fontSize: 13, lineHeight: 1.45,
                  background: surface, color: text,
                  fontFamily: "inherit", outline: "none",
                  maxHeight: 90, overflowY: "auto",
                  transition: "border-color 0.15s",
                  scrollbarWidth: "none",
                }}
                onFocus={e => e.target.style.borderColor = "#f97316"}
                onBlur={e => e.target.style.borderColor = border}
                onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 90) + "px"; }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38, borderRadius: 12, border: "none", flexShrink: 0,
                  background: input.trim() && !loading ? "linear-gradient(135deg,#f97316,#fb923c)" : (dark ? "#252230" : "#f0ebe3"),
                  color: input.trim() && !loading ? "#fff" : muted,
                  cursor: input.trim() && !loading ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s",
                  boxShadow: input.trim() && !loading ? "0 3px 12px rgba(249,115,22,0.3)" : "none",
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Floating toggle button ── */}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: 54, height: 54, borderRadius: "50%", border: "none",
            background: open ? "#1a0a00" : "linear-gradient(135deg, #f97316, #fbbf24)",
            color: "#fff",
            cursor: "pointer",
            boxShadow: open ? "0 4px 20px rgba(0,0,0,0.3)" : "0 4px 20px rgba(249,115,22,0.45)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
            transition: "all 0.22s cubic-bezier(.34,1.4,.64,1)",
            transform: open ? "rotate(0deg) scale(1)" : "scale(1)",
            position: "relative",
          }}>
          {open ? "×" : "🎓"}
          {/* Unread dot — shown when closed and has conversation */}
          {!open && messages.length > 1 && (
            <div style={{
              position: "absolute", top: 2, right: 2,
              width: 12, height: 12, borderRadius: "50%",
              background: "#4ade80",
              border: "2px solid #fff",
            }} />
          )}
        </button>
      </div>

      <style>{`
        @keyframes chatUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </>
  );
}
