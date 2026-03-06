import React, { useState, useEffect, useRef } from "react";

const C = {
  navy:"#0D2240", navyMid:"#1A3A5C", navyLight:"#E8EEF5",
  peach:"#E8785A", peachLight:"#FDF0EC",
  red:"#C0392B", black:"#111111", gray700:"#444444",
  gray500:"#666666", gray300:"#AAAAAA", gray100:"#F5F5F5",
  white:"#FFFFFF", border:"#CCCCCC",
};
const HN    = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";

const API_BASE = import.meta.env.VITE_API_BASE || "";

const DEFAULT_BOARDS = [
  { name:"EdTechJobs.io", url:"https://edtechjobs.io/jobs" },
  { name:"EdSurge Jobs", url:"https://edsurge.com/jobs" },
  { name:"Idealist", url:"https://www.idealist.org" },
  { name:"Built In EdTech", url:"https://builtin.com/jobs/product/edtech" },
  { name:"Edtech.com", url:"https://www.edtech.com" },
  { name:"LinkedIn", url:"https://linkedin.com/jobs" },
  { name:"Work for Good", url:"https://workforgood.co.uk" },
  { name:"Chronicle of Philanthropy", url:"https://jobs.philanthropy.com" },
  { name:"HigherEdJobs", url:"https://www.higheredjobs.com" },
  { name:"NonprofitJobs.org", url:"https://www.nonprofitjobs.org" },
  { name:"Handshake", url:"https://joinhandshake.com" },
  { name:"EdJoin", url:"https://edjoin.org" },
];

const btn = {
  fontFamily:HN, fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase",
  fontWeight:700, cursor:"pointer", border:"1.5px solid", padding:"8px 16px",
  minHeight:40, display:"inline-flex", alignItems:"center", justifyContent:"center",
  transition:"all 0.15s", lineHeight:1, background:"transparent",
};

function SourceBadge({ source }) {
  const colors = {
    Adzuna: { bg: "#E8EEF5", fg: "#0D2240" },
    Idealist: { bg: "#FDF0EC", fg: "#E8785A" },
    EdSurge: { bg: "#FDF0EC", fg: "#C0392B" },
    Chronicle: { bg: "#F5F5F5", fg: "#444444" },
    EdTechJobs: { bg: "#E8EEF5", fg: "#1A3A5C" },
  };
  const c = colors[source] || { bg: "#F5F5F5", fg: "#666666" };
  return (
    <span style={{ fontFamily:HN, fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase",
      background:c.bg, color:c.fg, border:`1px solid ${c.fg}20`, borderRadius:2,
      padding:"2px 7px", marginLeft:6 }}>
      {source}
    </span>
  );
}

function JobCard({ job, onAsk }) {
  const [expanded, setExpanded] = useState(false);
  const isNP = job.type === "nonprofit";
  const logoBg = isNP ? C.navy : C.peach;
  const badgeFg = isNP ? C.navy : C.peach;
  const badgeBg = isNP ? C.navyLight : C.peachLight;
  const logo = job.logo || (job.org?.slice(0,2).toUpperCase()) || "JB";

  return (
    <article aria-label={`${job.title} at ${job.org}`} style={{padding:"6px 0", animation:"fadeUp 0.4s ease both"}}>
      <div style={{border:`1.5px solid ${C.border}`, borderRadius:16, padding:"24px 24px 20px", background:C.white, transition:"border-color 0.2s, box-shadow 0.2s"}}
        onMouseEnter={e=>{e.currentTarget.style.borderColor=C.navy;e.currentTarget.style.boxShadow="0 4px 24px rgba(13,34,64,0.08)"}}
        onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.boxShadow="none"}}
      >
        <div style={{display:"flex", gap:20, alignItems:"flex-start"}}>
          <div style={{width:52,height:52,background:logoBg,color:C.white,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:HN,fontWeight:700,fontSize:13,flexShrink:0,borderRadius:12}}>{logo}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,flexWrap:"wrap"}}>
              <div>
                <h2 style={{fontFamily:HN,fontWeight:700,fontSize:16,letterSpacing:"-0.01em",textTransform:"uppercase",lineHeight:1.2,color:C.black,margin:0}}>
                  {job.title}
                  <SourceBadge source={job.source} />
                </h2>
                <p style={{fontFamily:HN,fontSize:12,color:C.gray500,marginTop:5,letterSpacing:"0.07em",textTransform:"uppercase"}}>{job.org} — {job.location}</p>
              </div>
              {job.type && <span style={{fontFamily:HN,fontSize:10,fontWeight:700,letterSpacing:"0.12em",textTransform:"uppercase",border:`1.5px solid ${badgeFg}`,padding:"4px 10px",color:badgeFg,background:badgeBg,whiteSpace:"nowrap",borderRadius:2}}>{isNP?"Nonprofit":"EdTech"}</span>}
            </div>
            <p style={{fontFamily:HN,fontSize:14,fontWeight:700,color:C.red,marginTop:10}}>{job.salary}</p>
            {expanded && <blockquote style={{fontFamily:SERIF,fontSize:14,color:C.gray700,marginTop:12,lineHeight:1.75,fontStyle:"italic",borderLeft:`3px solid ${C.peach}`,paddingLeft:14,marginLeft:0}}>"{job.description}"</blockquote>}
            {job.tags && <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:14}}>
              {job.tags.map(t=><span key={t} style={{fontFamily:HN,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",border:`1px solid ${C.navyLight}`,padding:"3px 9px",color:C.navy,background:C.navyLight,borderRadius:2}}>{t}</span>)}
            </div>}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:18,flexWrap:"wrap",gap:10}}>
              <time style={{fontFamily:HN,fontSize:10,color:C.gray300,letterSpacing:"0.1em",textTransform:"uppercase"}}>{typeof job.posted === 'string' ? job.posted.slice(0,10) : 'Recent'}</time>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <button onClick={()=>setExpanded(!expanded)} style={{...btn,borderColor:C.border,color:C.gray500}}>{expanded?"LESS ↑":"DETAILS ↓"}</button>
                <button onClick={()=>onAsk(job)} style={{...btn,borderColor:C.navy,color:C.navy}}
                  onMouseEnter={e=>{e.currentTarget.style.background=C.navy;e.currentTarget.style.color=C.white}}
                  onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.navy}}
                >✦ ASK AI</button>
                <a href={job.url} target="_blank" rel="noreferrer" style={{...btn,borderColor:C.peach,background:C.peach,color:C.white,textDecoration:"none"}}
                  onMouseEnter={e=>e.currentTarget.style.background="#d4654a"}
                  onMouseLeave={e=>e.currentTarget.style.background=C.peach}
                >APPLY →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function AIPanel({ job, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(()=>{
    setMessages([{role:"assistant",text:`Ready to help with "${job.title}" at ${job.org}. Ask me about fit, resume tips, or interview prep.`}]);
    setTimeout(()=>closeRef.current?.focus(),50);
  },[job]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[messages,loading]);
  useEffect(()=>{
    const h=e=>{if(e.key==="Escape")onClose()};
    window.addEventListener("keydown",h);
    return()=>window.removeEventListener("keydown",h);
  },[onClose]);

  async function send() {
    if(!input.trim()||loading) return;
    const userMsg=input.trim(); setInput("");
    const newMessages=[...messages,{role:"user",text:userMsg}];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res=await fetch(`${API_BASE}/api/coach`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ job, messages:[...newMessages.filter((_,i)=>i>0)] })
      });
      const data=await res.json();
      setMessages(m=>[...m,{role:"assistant",text:data.reply||"Sorry, try again."}]);
    } catch { setMessages(m=>[...m,{role:"assistant",text:"Something went wrong. Please try again."}]); }
    setLoading(false);
  }

  return (
    <div role="dialog" aria-modal="true"
      style={{position:"fixed",inset:0,right:0,top:0,bottom:0,width:"100%",maxWidth:440,marginLeft:"auto",background:C.white,borderLeft:`2px solid ${C.navy}`,display:"flex",flexDirection:"column",zIndex:200,animation:"slideIn 0.3s ease",boxShadow:"-8px 0 40px rgba(13,34,64,0.12)"}}
    >
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"16px 20px",display:"flex",alignItems:"center",gap:12,background:C.navy}}>
        <div style={{width:32,height:32,background:C.peach,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:HN,fontWeight:700,fontSize:12,color:C.white}}>✦</div>
        <div style={{flex:1}}>
          <p style={{fontFamily:HN,fontWeight:700,fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:C.white,margin:0}}>AI CAREER COACH</p>
          <p style={{fontFamily:HN,fontSize:11,color:"rgba(255,255,255,0.6)",marginTop:2,textTransform:"uppercase",letterSpacing:"0.06em"}}>{job.org}</p>
        </div>
        <button ref={closeRef} onClick={onClose} style={{...btn,borderColor:"rgba(255,255,255,0.4)",color:C.white,fontSize:10,padding:"6px 14px"}}>ESC / CLOSE</button>
      </div>
      <div style={{borderBottom:`1px solid ${C.border}`,padding:"12px 20px",background:C.navyLight}}>
        <p style={{fontFamily:HN,fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",color:C.navy,margin:0}}>{job.title}</p>
        <p style={{fontFamily:HN,fontSize:10,color:C.navyMid,marginTop:3,textTransform:"uppercase",letterSpacing:"0.08em"}}>{job.location} · <span style={{color:C.red,fontWeight:700}}>{job.salary}</span></p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
        {messages.map((m,i)=>(
          <div key={i} style={{marginBottom:18,display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",gap:8}}>
            {m.role==="assistant"&&<div style={{width:24,height:24,background:C.peach,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.white,fontWeight:700,flexShrink:0,marginTop:2}}>AI</div>}
            <div style={{maxWidth:"82%",fontFamily:m.role==="user"?HN:SERIF,fontSize:13,lineHeight:1.65,background:m.role==="user"?C.navy:C.gray100,color:m.role==="user"?C.white:C.black,padding:"11px 15px",borderLeft:m.role==="assistant"?`3px solid ${C.peach}`:"none",whiteSpace:"pre-wrap"}}>{m.text}</div>
          </div>
        ))}
        {loading&&<div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:24,height:24,background:C.peach,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.white,fontWeight:700}}>AI</div>
          <div style={{display:"flex",gap:5,padding:"11px 15px",background:C.gray100,borderLeft:`3px solid ${C.peach}`}}>
            {[0,1,2].map(i=><div key={i} style={{width:7,height:7,background:C.peach,borderRadius:"50%",animation:`dot 1s ease-in-out ${i*0.2}s infinite`}}/>)}
          </div>
        </div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"0 20px 12px",display:"flex",gap:6,flexWrap:"wrap"}}>
        {["Tailor my resume","Interview tips","Good fit for me?"].map(q=>(
          <button key={q} onClick={()=>{setInput(q);inputRef.current?.focus()}} style={{...btn,fontSize:9,padding:"5px 12px",borderColor:C.border,color:C.gray500,minHeight:32}}>{q}</button>
        ))}
      </div>
      <div style={{borderTop:`2px solid ${C.navy}`,padding:"16px 20px",display:"flex",gap:8}}>
        <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()}
          placeholder="Ask anything about this role..."
          style={{flex:1,border:`1.5px solid ${C.border}`,padding:"11px 14px",fontFamily:SERIF,fontSize:13,outline:"none",background:C.white,color:C.black}}
          onFocus={e=>e.currentTarget.style.borderColor=C.navy}
          onBlur={e=>e.currentTarget.style.borderColor=C.border}
        />
        <button onClick={send} disabled={loading||!input.trim()} style={{...btn,borderColor:C.peach,background:C.peach,color:C.white,padding:"11px 18px",opacity:loading||!input.trim()?0.45:1}}>SEND</button>
      </div>
    </div>
  );
}

export default function App() {
  const [query, setQuery]           = useState("");
  const [filter, setFilter]         = useState("all");
  const [locFilter, setLocFilter]   = useState("all");
  const [searching, setSearching]   = useState(false);
  const [jobs, setJobs]             = useState([]);
  const [activeJob, setActiveJob]   = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchLabel, setSearchLabel] = useState("");
  const [error, setError]           = useState("");
  const [page, setPage]             = useState(1);
  const [customBoards, setCustomBoards] = useState([]);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardUrl, setNewBoardUrl]   = useState("");
  const [showManage, setShowManage]     = useState(false);
  const [stats, setStats]           = useState("");
  const resultsRef = useRef(null);

  const allBoards = [...DEFAULT_BOARDS, ...customBoards];

  const filtered = jobs.filter(j => {
    const mType = filter==="all" || j.type===filter;
    const mLoc  = locFilter==="all" || (locFilter==="remote" ? j.location?.toLowerCase().includes("remote") : !j.location?.toLowerCase().includes("remote"));
    return mType && mLoc;
  });

  async function runSearch(sq, pg=1) {
    if(!sq.trim()) return;
    setSearching(true); setHasSearched(true); setSearchLabel(sq); setError(""); setPage(pg);
    try {
      const res = await fetch(`${API_BASE}/api/jobs?query=${encodeURIComponent(sq)}&page=${pg}`);
      const data = await res.json();
      if(data.error) throw new Error(data.error);
      setJobs(pg===1 ? data.jobs : [...jobs, ...data.jobs]);
      setStats(`${data.total} matched roles`);
      setTimeout(()=>resultsRef.current?.focus(),200);
    } catch(e) {
      setError("Could not fetch live jobs. Check your API keys in Vercel.");
    }
    setSearching(false);
  }

  function addBoard(){
    const name=newBoardName.trim(); let url=newBoardUrl.trim();
    if(!name||!url) return;
    if(!url.startsWith("http")) url="https://"+url;
    setCustomBoards(b=>[...b,{name,url}]); setNewBoardName(""); setNewBoardUrl("");
  }

  function FB({label,active,onClick}){
    return <button onClick={onClick} style={{...btn,fontSize:10,padding:"7px 16px",borderColor:active?C.navy:C.border,background:active?C.navy:"transparent",color:active?C.white:C.gray700}}>{label}</button>;
  }

  return (
    <div style={{minHeight:"100vh",background:C.white,color:C.black}}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        @keyframes slideIn { from { transform:translateX(100%) } to { transform:translateX(0) } }
        @keyframes dot     { 0%,100%{ transform:scale(0.5); opacity:0.3 } 50%{ transform:scale(1); opacity:1 } }
        @keyframes spin    { to { transform:rotate(360deg) } }
        input::placeholder { color: #AAAAAA; }
      `}</style>

      <header style={{borderBottom:`1px solid ${C.border}`,padding:"14px 40px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontFamily:HN,fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700,color:C.navy}}>EdTech PM Search</div>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          {stats && <span style={{fontFamily:HN,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:C.peach}}>{stats}</span>}
          <div style={{fontFamily:HN,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gray300}}>Live Jobs · AI by Claude <span style={{color:C.peach}}>✦</span></div>
        </div>
      </header>

      <main style={{maxWidth:840,margin:"0 auto",padding:"0 40px 100px"}}>

        <section style={{padding:"36px 0 32px",borderBottom:`1px solid ${C.border}`}}>
          <p style={{fontFamily:HN,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gray300,marginBottom:18}}>— Mission-Driven Product Management</p>
          <h1 style={{fontFamily:HN,fontSize:"clamp(32px, 7.5vw, 88px)",fontWeight:700,letterSpacing:"-0.04em",lineHeight:0.93,textTransform:"uppercase",color:C.black}}>
            FIND YOUR NEXT<br/>
            <span>
              <span style={{WebkitTextStroke:`2px ${C.navy}`,color:"transparent"}}>ROLE </span>
              <span style={{color:C.peach}}>IN EDTECH</span>
            </span>
          </h1>
          <p style={{fontFamily:SERIF,fontSize:15,color:C.gray500,marginTop:24,lineHeight:1.75,fontStyle:"italic",maxWidth:500}}>
            "Real product management roles at EdTech companies and nonprofits — live from Adzuna, EdSurge, Idealist and more."
          </p>
        </section>

        <section style={{padding:"32px 0",borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:"flex",alignItems:"center",background:C.white,border:`1.5px solid ${C.black}`,borderRadius:50,padding:"6px 6px 6px 20px",gap:10}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
              <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
            </svg>
            <input type="search" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runSearch(query)}
              placeholder="Search real EdTech PM jobs..."
              style={{flex:1,border:"none",padding:"10px 0",fontFamily:SERIF,fontSize:14,color:C.black,background:"transparent",outline:"none"}}
            />
            <button onClick={()=>runSearch(query)} disabled={searching||!query.trim()}
              style={{...btn,borderColor:C.navy,background:C.navy,color:C.white,padding:"12px 24px",borderRadius:50,opacity:searching||!query.trim()?0.5:1,whiteSpace:"nowrap",fontSize:10}}
            >
              {searching
                ? <div style={{width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTopColor:C.white,borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
                : <span><span style={{color:C.peach}}>✦</span> SEARCH LIVE</span>}
            </button>
          </div>

          {error && <div style={{marginTop:12,padding:"12px 16px",background:"#FDECEA",border:"1.5px solid #C0392B",borderRadius:8,fontFamily:HN,fontSize:11,color:C.red,letterSpacing:"0.05em"}}>{error}</div>}

          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:14}}>
            <span style={{fontFamily:HN,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:C.gray300,paddingTop:8}}>Try:</span>
            {["Product Manager EdTech","Nonprofit PM remote","K-12 curriculum product","Learning platform PM"].map(q=>(
              <button key={q} onClick={()=>{setQuery(q);runSearch(q)}}
                style={{...btn,fontSize:10,padding:"6px 14px",borderColor:C.border,color:C.gray500,minHeight:36}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.peach;e.currentTarget.style.color=C.peach}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.gray500}}
              >{q}</button>
            ))}
          </div>
        </section>

        <section style={{padding:"20px 0",borderBottom:`1px solid ${C.border}`,display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontFamily:HN,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gray300,marginRight:4}}>TYPE</span>
          {[["all","All"],["edtech","EdTech"],["nonprofit","Nonprofit"]].map(([v,l])=>(
            <FB key={v} label={l} active={filter===v} onClick={()=>setFilter(v)}/>
          ))}
          <div style={{width:1,height:28,background:C.border,margin:"0 10px"}}/>
          <span style={{fontFamily:HN,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gray300,marginRight:4}}>LOCATION</span>
          {[["all","Any"],["remote","Remote"],["onsite","Onsite"]].map(([v,l])=>(
            <FB key={v} label={l} active={locFilter===v} onClick={()=>setLocFilter(v)}/>
          ))}
          <p style={{marginLeft:"auto",fontFamily:HN,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:C.red,fontWeight:700}}>{filtered.length} ROLE{filtered.length!==1?"S":""}</p>
        </section>

        {!hasSearched && (
          <div style={{padding:"60px 0",textAlign:"center"}}>
            <p style={{fontFamily:HN,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gray300,marginBottom:8}}>Real jobs from Adzuna · EdSurge · Idealist · EdTechJobs</p>
            <p style={{fontFamily:SERIF,fontSize:14,color:C.gray500,fontStyle:"italic"}}>Search above to pull live listings</p>
          </div>
        )}

        <section tabIndex={-1} ref={resultsRef} style={{outline:"none"}}>
          {searching && jobs.length===0 ? (
            <div style={{padding:"80px 0",textAlign:"center"}}>
              <div style={{width:28,height:28,border:`2px solid ${C.navyLight}`,borderTopColor:C.navy,borderRadius:"50%",animation:"spin 0.7s linear infinite",margin:"0 auto 16px"}}/>
              <p style={{fontFamily:HN,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gray300}}>Fetching live EdTech roles…</p>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div style={{display:"flex",flexDirection:"column",gap:12,paddingTop:16}}>
                {filtered.map((job,i)=><div key={job.id||i} style={{animationDelay:`${i*0.04}s`}}><JobCard job={job} onAsk={setActiveJob}/></div>)}
              </div>
              <div style={{textAlign:"center",marginTop:32}}>
                <button onClick={()=>runSearch(searchLabel, page+1)} disabled={searching}
                  style={{...btn,borderColor:C.navy,color:C.navy,padding:"12px 32px",borderRadius:50,opacity:searching?0.5:1}}
                >
                  {searching ? "Loading…" : "LOAD MORE JOBS"}
                </button>
              </div>
            </>
          ) : hasSearched && !searching ? (
            <div style={{padding:"80px 0",textAlign:"center"}}>
              <p style={{fontFamily:HN,fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gray300}}>No matching roles found — try a different search</p>
            </div>
          ) : null}
        </section>

        <section style={{marginTop:64}}>
          <div style={{borderTop:`2px solid ${C.navy}`,paddingTop:24,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <h2 style={{fontFamily:HN,fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",fontWeight:700,color:C.navy}}>Job Boards</h2>
            <button onClick={()=>setShowManage(m=>!m)} style={{...btn,fontSize:9,padding:"6px 14px",borderColor:showManage?C.navy:C.border,background:showManage?C.navy:"transparent",color:showManage?C.white:C.gray500,borderRadius:50}}>⚙ ADD BOARD</button>
          </div>

          {showManage && (
            <div style={{border:`1.5px solid ${C.border}`,borderRadius:16,padding:24,marginBottom:24,background:C.gray100}}>
              <p style={{fontFamily:HN,fontSize:10,fontWeight:700,letterSpacing:"0.15em",textTransform:"uppercase",color:C.navy,marginBottom:10}}>↗ Add a Job Board</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <input value={newBoardName} onChange={e=>setNewBoardName(e.target.value)} placeholder="Board name"
                  style={{flex:"1 1 140px",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 14px",fontFamily:SERIF,fontSize:13,outline:"none",background:C.white}}
                  onFocus={e=>e.currentTarget.style.borderColor=C.navy} onBlur={e=>e.currentTarget.style.borderColor=C.border}
                />
                <input value={newBoardUrl} onChange={e=>setNewBoardUrl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addBoard()} placeholder="URL"
                  style={{flex:"2 1 180px",border:`1.5px solid ${C.border}`,borderRadius:8,padding:"9px 14px",fontFamily:SERIF,fontSize:13,outline:"none",background:C.white}}
                  onFocus={e=>e.currentTarget.style.borderColor=C.navy} onBlur={e=>e.currentTarget.style.borderColor=C.border}
                />
                <button onClick={addBoard} style={{...btn,borderColor:C.peach,background:C.peach,color:C.white,padding:"9px 18px",fontSize:10,borderRadius:8}}>ADD</button>
              </div>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:8}}>
            {allBoards.map(b=>(
              <a key={b.name} href={b.url} target="_blank" rel="noreferrer"
                style={{fontFamily:HN,fontSize:11,letterSpacing:"0.08em",textTransform:"uppercase",border:`1.5px solid ${C.border}`,borderRadius:12,padding:"16px 18px",color:C.black,textDecoration:"none",display:"flex",justifyContent:"space-between",alignItems:"center",transition:"all 0.15s",minHeight:52,background:C.white}}
                onMouseEnter={e=>{e.currentTarget.style.background=C.navy;e.currentTarget.style.color=C.white;e.currentTarget.style.borderColor=C.navy}}
                onMouseLeave={e=>{e.currentTarget.style.background=C.white;e.currentTarget.style.color=C.black;e.currentTarget.style.borderColor=C.border}}
              >
                <span>{b.name}</span><span style={{color:C.peach}}>↗</span>
              </a>
            ))}
          </div>
        </section>

        <footer style={{borderTop:`1px solid ${C.border}`,marginTop:64,paddingTop:20,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <span style={{fontFamily:HN,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gray300}}>EdTech PM Search</span>
          <span style={{fontFamily:HN,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gray300}}>Live data · AI by <span style={{color:C.peach}}>Claude</span></span>
        </footer>
      </main>

      {activeJob && (
        <>
          <div onClick={()=>setActiveJob(null)} style={{position:"fixed",inset:0,background:"rgba(13,34,64,0.3)",zIndex:199,cursor:"pointer"}}/>
          <AIPanel job={activeJob} onClose={()=>setActiveJob(null)}/>
        </>
      )}
    </div>
  );
}
