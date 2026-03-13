import { useState, useEffect, useRef } from "react";
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
  const [quickReplies, setQuickReplies] = useState([]);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const SYSTEM = `You are Aria, a warm AI property assistant for a real estate agency. Powered by Scizor AI. Max 2 sentences per reply. One question at a time. Never invent listings or prices.`;
  const getTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  useEffect(() => { setTimeout(() => { setMessages([{ role: "bot", text: "Welcome! I'm Aria, your AI property guide. 🏡 Are you looking to buy, sell, or just exploring the market?", time: getTime() }]); setQuickReplies(["I want to buy", "I want to sell", "Just browsing", "Schedule a showing"]); }, 500); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping, showLeadForm]);
  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setInput(""); setQuickReplies([]);
    setMessages(p => [...p, { role: "user", text: msg, time: getTime() }]);
    const triggers = ["schedule","showing","agent","connect","call me","talk to","speak","contact"];
    if (triggers.some(t => msg.toLowerCase().includes(t)) && !leadCaptured) {
      setTimeout(() => { setMessages(p => [...p, { role: "bot", text: "I'd love to connect you with one of our agents! Let me grab your contact info.", time: getTime() }]); setTimeout(() => setShowLeadForm(true), 700); }, 500);
      return;
    }
    setIsTyping(true);
    const newHistory = [...history, { role: "user", content: msg }];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 120, system: SYSTEM, messages: newHistory }) });
      const data = await res.json();
      const reply = data.content[0].text;
      setHistory([...newHistory, { role: "assistant", content: reply }]);
      setMessages(p => [...p, { role: "bot", text: reply, time: getTime() }]);
      if (newHistory.length < 4) setQuickReplies(["What's my budget?", "Tell me about the area", "How does buying work?"]);
      else if (!leadCaptured) setQuickReplies(["Connect me with an agent", "Schedule a showing"]);
    } catch { setMessages(p => [...p, { role: "bot", text: "One moment — let me pull that up for you!", time: getTime() }]); }
    setIsTyping(false);
  };
  const submitLead = () => {
    if (!leadForm.name || !leadForm.email) return;
    setShowLeadForm(false); setLeadCaptured(true);
    setMessages(p => [...p, { role: "user", text: `${leadForm.name} | ${leadForm.email} | ${leadForm.phone}`, time: getTime() }]);
    setTimeout(() => { setMessages(p => [...p, { role: "bot", text: `Perfect, ${leadForm.name}! An agent will be in touch soon. Anything else I can help with?`, time: getTime() }]); setQuickReplies(["What's the market like?", "I'm all set, thanks!"]); }, 400);
  };
  const G = "rgba(201,168,76,";
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0A0A0B,#111114,#0A0A0B)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <style>{`@keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}@keyframes bob{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-4px)}}.mi{animation:msgIn .25s ease both}.qb:hover{background:rgba(201,168,76,.1)!important;border-color:#C9A84C!important}input::placeholder{color:rgba(240,237,230,.35)}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(201,168,76,.2);border-radius:2px}`}</style>
      <div style={{width:"100%",maxWidth:410,display:"flex",flexDirection:"column",gap:12}}>
        <div style={{textAlign:"center",fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"#C9A84C",opacity:.6}}>✦ Live Demo — Scizor AI Real Estate Widget</div>
        <div style={{background:"#111114",border:`1px solid ${G}.15)`,borderRadius:22,overflow:"hidden",display:"flex",flexDirection:"column",height:580,boxShadow:"0 40px 100px rgba(0,0,0,.8)"}}>
          <div style={{background:"linear-gradient(135deg,#1A1A1F,#242429)",borderBottom:`1px solid ${G}.1)`,padding:"15px 18px",display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
            <div style={{width:42,height:42,background:"linear-gradient(135deg,#C9A84C,#E8D08A)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🏡</div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontWeight:600,color:"#F0EDE6"}}>Aria — Property Assistant</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}><div style={{width:6,height:6,background:"#4ADE80",borderRadius:"50%",animation:"pulse 2s infinite"}}/><span style={{fontSize:11,color:"rgba(240,237,230,.45)"}}>Available now · Instant response</span></div>
            </div>
            <div style={{fontSize:9,letterSpacing:".16em",textTransform:"uppercase",color:"#C9A84C",opacity:.6}}>SCIZOR AI</div>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px 14px",display:"flex",flexDirection:"column",gap:10}}>
            {messages.map((m,i)=>(
              <div key={i} className="mi" style={{display:"flex",flexDirection:"column",maxWidth:"83%",alignSelf:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{padding:"10px 14px",borderRadius:m.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",fontSize:13,lineHeight:1.55,background:m.role==="user"?"linear-gradient(135deg,#C9A84C,#B8913A)":"#1A1A1F",border:m.role==="user"?"none":`1px solid ${G}.12)`,color:m.role==="user"?"#0A0A0B":"#F0EDE6"}}>{m.text}</div>
                <div style={{fontSize:10,color:"rgba(240,237,230,.3)",marginTop:4,textAlign:m.role==="user"?"right":"left"}}>{m.role==="bot"?"Aria":"You"} · {m.time}</div>
              </div>
            ))}
            {isTyping&&<div className="mi" style={{display:"flex",alignItems:"center",gap:5,padding:"10px 14px",background:"#1A1A1F",border:`1px solid ${G}.12)`,borderRadius:"14px 14px 14px 4px",width:"fit-content"}}>{[0,.2,.4].map((d,i)=><div key={i} style={{width:6,height:6,background:"#C9A84C",borderRadius:"50%",opacity:.6,animation:`bob 1.2s ${d}s infinite`}}/>)}</div>}
            {showLeadForm&&<div className="mi" style={{background:"#1A1A1F",border:`1px solid ${G}.22)`,borderRadius:"14px 14px 14px 4px",padding:14,display:"flex",flexDirection:"column",gap:8,maxWidth:"88%"}}><div style={{fontSize:13,fontWeight:600,color:"#C9A84C"}}>✦ Connect with an agent</div>{["name","email","phone"].map(f=><input key={f} placeholder={f==="name"?"Full name":f==="email"?"Email address":"Phone number"} value={leadForm[f]} onChange={e=>setLeadForm(p=>({...p,[f]:e.target.value}))} style={{background:"#242429",border:`1px solid ${G}.15)`,borderRadius:8,padding:"8px 11px",color:"#F0EDE6",fontSize:12.5,width:"100%",outline:"none"}}/>)}<button onClick={submitLead} style={{background:"linear-gradient(135deg,#C9A84C,#B8913A)",border:"none",borderRadius:8,padding:"9px",color:"#0A0A0B",fontSize:12.5,fontWeight:500,cursor:"pointer"}}>Send My Info →</button></div>}
            <div ref={bottomRef}/>
          </div>
          {quickReplies.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,padding:"0 14px 10px",flexShrink:0}}>{quickReplies.map((q,i)=><button key={i} className="qb" onClick={()=>{setQuickReplies([]);handleSend(q);}} style={{background:"transparent",border:`1px solid ${G}.2)`,color:"#C9A84C",padding:"6px 12px",borderRadius:20,fontSize:11.5,cursor:"pointer",transition:"all .2s",whiteSpace:"nowrap"}}>{q}</button>)}</div>}
          <div style={{borderTop:`1px solid ${G}.1)`,background:"#1A1A1F",padding:"10px 12px",display:"flex",gap:8,alignItems:"center",flexShrink:0}}>
            <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")handleSend();}} placeholder="Ask about properties, pricing, neighborhoods..." style={{flex:1,background:"#242429",border:`1px solid ${G}.14)`,borderRadius:11,padding:"10px 13px",color:"#F0EDE6",fontSize:13,outline:"none"}}/>
            <button onClick={()=>handleSend()} disabled={isTyping} style={{width:40,height:40,background:"linear-gradient(135deg,#C9A84C,#B8913A)",border:"none",borderRadius:11,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:isTyping?.5:1}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#0A0A0B"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
        <div style={{textAlign:"center",fontSize:10,color:"rgba(240,237,230,.25)"}}>Powered by <span style={{color:"#C9A84C",opacity:.65}}>Scizor AI</span> · Built for real estate professionals</div>
      </div>
    </div>
  );
}
