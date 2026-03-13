import { useState, useEffect, useRef } from "react";

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

const SYSTEM_PROMPT = `You are Aria, an elite AI real estate assistant powered by Scizor AI. You help real estate agents and brokerages by:

1. LEAD CAPTURE: Naturally collect visitor info (name, email, phone) during conversation. When someone asks about a property, buying, selling, or getting help — ask for their name first, then email, then phone. Be smooth and conversational, not robotic.

2. REAL ESTATE FAQs: Answer questions about:
   - Buying/selling process
   - Mortgage and financing basics
   - Market trends and home values
   - Property searches and listings
   - Agent services and consultations
   - Neighborhood info

3. APPOINTMENT BOOKING: When a lead is captured, offer to schedule a consultation call with the agent.

Your tone is warm, friendly, encouraging, and approachable. You represent a premium but welcoming AI service. Keep responses concise (2-4 sentences max unless explaining something complex). Always end with a question to keep the conversation moving.

When you have collected name + email + phone, say: "Perfect! I've got your info — an agent will be in touch within 24 hours. Is there anything else I can help you with in the meantime?"`;

const FAQ_SUGGESTIONS = [
  "🏡 How much is my home worth?",
  "🔑 What's the buying process?",
  "📈 I want to sell my home",
  "💰 How do I get pre-approved?",
  "📅 Schedule a consultation",
];

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi there! I'm Aria 👋 I'm your personal real estate guide — here to help you buy, sell, or just explore your options. What's on your mind today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadBadge, setShowLeadBadge] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText) return;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...newMessages,
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content || "Sorry, I had a little hiccup! Try again?";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      if (!leadCaptured && (reply.includes("got your info") || reply.includes("agent will be in touch"))) {
        setLeadCaptured(true);
        setShowLeadBadge(true);
        setTimeout(() => setShowLeadBadge(false), 4000);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Hmm, I'm having a connection issue. Give me a moment and try again!" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={s.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        input:focus { outline: none; border-color: #e07b3a !important; box-shadow: 0 0 0 3px rgba(224,123,58,0.12) !important; }
        button.suggestion:hover { background: #fff0e6 !important; border-color: #e07b3a !important; color: #c45e1a !important; transform: translateY(-1px); }
        button.send:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(224,123,58,0.45) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #f0c9a0; border-radius: 4px; }
      `}</style>

      {/* Warm background blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.blob3} />

      <div style={s.card}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerInner}>
            <div style={s.avatarWrap}>
              <div style={s.avatar}>
                <span style={s.avatarLetter}>A</span>
              </div>
              <div style={s.statusRing} />
              <div style={s.statusDot} />
            </div>
            <div>
              <div style={s.agentName}>Aria</div>
              <div style={s.agentTitle}>Real Estate AI · Scizor AI</div>
            </div>
          </div>
          <div style={s.livePill}>
            <span style={s.liveDot} />
            Online
          </div>
        </div>

        {/* Hero strip */}
        <div style={s.heroStrip}>
          <span style={s.heroIcon}>🏠</span>
          <span style={s.heroText}>Your home journey starts here — I'll guide you every step of the way.</span>
        </div>

        {/* Lead toast */}
        <div style={{
          ...s.toast,
          opacity: showLeadBadge ? 1 : 0,
          transform: showLeadBadge ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.97)",
        }}>
          🎉 Lead captured successfully!
        </div>

        {/* Messages */}
        <div style={s.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...s.row,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                animationDelay: `${i * 0.05}s`,
              }}
            >
              {msg.role === "assistant" && (
                <div style={s.msgAvatar}>A</div>
              )}
              <div style={msg.role === "user" ? s.userBubble : s.aiBubble}>
                {msg.content}
                {msg.role === "assistant" && i === 0 && (
                  <div style={s.waveLine}>
                    {[...Array(8)].map((_, k) => (
                      <div key={k} style={{ ...s.waveBar, animationDelay: `${k * 0.1}s`, height: `${4 + Math.sin(k) * 4}px` }} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ ...s.row, justifyContent: "flex-start" }}>
              <div style={s.msgAvatar}>A</div>
              <div style={s.aiBubble}>
                <div style={s.dots}>
                  {[0, 160, 320].map((d, i) => (
                    <span key={i} style={{ ...s.dot, animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div style={s.suggestions}>
            <div style={s.suggestLabel}>Quick questions</div>
            <div style={s.suggestRow}>
              {FAQ_SUGGESTIONS.map((s2, i) => (
                <button
                  key={i}
                  className="suggestion"
                  style={s.suggBtn}
                  onClick={() => sendMessage(s2.replace(/^[\u{1F000}-\u{1FFFF}🏡🔑📈💰📅]\s*/u, ""))}
                >
                  {s2}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div style={s.inputArea}>
          <input
            style={s.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask Aria anything about real estate..."
          />
          <button
            className="send"
            style={{ ...s.sendBtn, opacity: input.trim() ? 1 : 0.45 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          Powered by <strong style={s.brand}>Scizor AI</strong> · Responses may vary
        </div>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, #fdf6ee 0%, #fef3e8 40%, #fdf0e4 100%)",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "24px 16px",
  },
  blob1: {
    position: "fixed",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,183,107,0.25) 0%, transparent 70%)",
    top: "-100px",
    right: "-100px",
    pointerEvents: "none",
    animation: "float 8s ease-in-out infinite",
  },
  blob2: {
    position: "fixed",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,138,76,0.12) 0%, transparent 70%)",
    bottom: "-80px",
    left: "-80px",
    pointerEvents: "none",
    animation: "float 10s ease-in-out infinite reverse",
  },
  blob3: {
    position: "fixed",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,210,150,0.2) 0%, transparent 70%)",
    top: "40%",
    left: "10%",
    pointerEvents: "none",
    animation: "float 12s ease-in-out infinite",
  },
  card: {
    width: "100%",
    maxWidth: "448px",
    background: "rgba(255,255,255,0.88)",
    borderRadius: "24px",
    border: "1px solid rgba(255,180,100,0.25)",
    boxShadow: "0 8px 40px rgba(200,100,30,0.1), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    backdropFilter: "blur(20px)",
    position: "relative",
  },
  header: {
    padding: "18px 20px",
    borderBottom: "1px solid rgba(230,160,80,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "linear-gradient(to right, rgba(255,245,235,0.8), rgba(255,250,245,0.8))",
  },
  headerInner: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },
  avatarWrap: {
    position: "relative",
    width: "46px",
    height: "46px",
  },
  avatar: {
    width: "46px",
    height: "46px",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #f4a05a 0%, #e07030 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(224,112,48,0.35)",
  },
  avatarLetter: {
    color: "#fff",
    fontFamily: "'Playfair Display', serif",
    fontWeight: "600",
    fontSize: "20px",
    lineHeight: 1,
  },
  statusRing: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#fff",
    border: "2px solid #fff",
  },
  statusDot: {
    position: "absolute",
    bottom: "0px",
    right: "0px",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#4ade80",
    border: "2px solid #fff",
    animation: "pulse 2s ease-in-out infinite",
  },
  agentName: {
    fontFamily: "'Playfair Display', serif",
    fontWeight: "600",
    fontSize: "17px",
    color: "#2d1a08",
    letterSpacing: "-0.01em",
  },
  agentTitle: {
    fontSize: "11.5px",
    color: "#b07040",
    marginTop: "1px",
    letterSpacing: "0.02em",
  },
  livePill: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    background: "rgba(74,222,128,0.1)",
    color: "#16a34a",
    fontSize: "11px",
    fontWeight: "600",
    padding: "5px 11px",
    borderRadius: "20px",
    border: "1px solid rgba(74,222,128,0.25)",
    letterSpacing: "0.04em",
  },
  liveDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#4ade80",
    display: "inline-block",
    animation: "pulse 2s infinite",
  },
  heroStrip: {
    padding: "12px 20px",
    background: "linear-gradient(135deg, #fff7ee, #fff3e6)",
    borderBottom: "1px solid rgba(230,160,80,0.12)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "12.5px",
    color: "#a0632a",
    fontStyle: "italic",
    lineHeight: 1.5,
  },
  heroIcon: {
    fontSize: "18px",
    flexShrink: 0,
  },
  heroText: {
    flex: 1,
  },
  toast: {
    position: "absolute",
    top: "76px",
    right: "16px",
    background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
    color: "#15803d",
    border: "1px solid rgba(74,222,128,0.4)",
    borderRadius: "10px",
    padding: "8px 14px",
    fontSize: "12px",
    fontWeight: "600",
    zIndex: 10,
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: "0 4px 16px rgba(74,222,128,0.2)",
  },
  messages: {
    flex: 1,
    padding: "20px 16px 16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    minHeight: "320px",
    maxHeight: "380px",
  },
  row: {
    display: "flex",
    alignItems: "flex-end",
    gap: "9px",
    animation: "fadeUp 0.3s ease both",
  },
  msgAvatar: {
    width: "30px",
    height: "30px",
    borderRadius: "9px",
    background: "linear-gradient(135deg, #f4a05a, #e07030)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontFamily: "'Playfair Display', serif",
    fontWeight: "600",
    fontSize: "13px",
    flexShrink: 0,
    boxShadow: "0 2px 8px rgba(224,112,48,0.3)",
  },
  aiBubble: {
    background: "#fff",
    border: "1px solid rgba(230,160,80,0.2)",
    color: "#3d2010",
    padding: "13px 16px",
    borderRadius: "18px 18px 18px 5px",
    fontSize: "13.5px",
    lineHeight: "1.65",
    maxWidth: "78%",
    boxShadow: "0 2px 12px rgba(200,100,30,0.07)",
  },
  userBubble: {
    background: "linear-gradient(135deg, #f4a05a, #e07030)",
    color: "#fff",
    padding: "13px 16px",
    borderRadius: "18px 18px 5px 18px",
    fontSize: "13.5px",
    lineHeight: "1.65",
    maxWidth: "78%",
    boxShadow: "0 4px 16px rgba(224,112,48,0.3)",
  },
  waveLine: {
    display: "flex",
    alignItems: "flex-end",
    gap: "2px",
    marginTop: "8px",
    opacity: 0.3,
  },
  waveBar: {
    width: "3px",
    background: "#e07030",
    borderRadius: "2px",
  },
  dots: {
    display: "flex",
    gap: "5px",
    padding: "2px 2px",
    alignItems: "center",
  },
  dot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#f4a05a",
    display: "inline-block",
    animation: "bounce 1.2s infinite ease-in-out",
  },
  suggestions: {
    padding: "0 16px 14px",
  },
  suggestLabel: {
    fontSize: "10.5px",
    color: "#b07040",
    fontWeight: "600",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  suggestRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
  },
  suggBtn: {
    background: "#fff8f2",
    border: "1px solid rgba(224,123,58,0.25)",
    color: "#d4651a",
    borderRadius: "20px",
    padding: "7px 13px",
    fontSize: "12px",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "500",
    transition: "all 0.18s ease",
  },
  inputArea: {
    padding: "14px 16px",
    borderTop: "1px solid rgba(230,160,80,0.15)",
    display: "flex",
    gap: "10px",
    alignItems: "center",
    background: "rgba(255,250,245,0.7)",
  },
  input: {
    flex: 1,
    background: "#fff",
    border: "1.5px solid rgba(230,160,80,0.25)",
    borderRadius: "14px",
    padding: "12px 16px",
    color: "#3d2010",
    fontSize: "13.5px",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(200,100,30,0.05)",
  },
  sendBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "13px",
    background: "linear-gradient(135deg, #f4a05a, #e07030)",
    border: "none",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(224,112,48,0.35)",
  },
  footer: {
    textAlign: "center",
    padding: "10px 16px 12px",
    color: "#c49070",
    fontSize: "11px",
    letterSpacing: "0.02em",
  },
  brand: {
    color: "#e07030",
    fontWeight: "700",
  },
};
