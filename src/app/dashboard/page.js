"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { BODY_PARTS, SPINE_REGIONS, SUBSECTIONS, getSystemPrompt, buildCopyText } from "@/lib/prompts";

const PRI = {
  critical:{ border:"#f85149", bg:"rgba(248,81,73,0.08)" },
  moderate:{ border:"#d29922", bg:"rgba(210,153,34,0.08)" },
  minor:   { border:"#58a6ff", bg:"rgba(88,166,255,0.08)" },
  normal:  { border:"#3fb950", bg:"rgba(63,185,80,0.08)"  },
};
const PROB = {
  high:    { bg:"rgba(248,81,73,0.15)",  color:"#f85149" },
  moderate:{ bg:"rgba(210,153,34,0.15)", color:"#d29922" },
  low:     { bg:"rgba(88,166,255,0.15)", color:"#58a6ff" },
  excluded:{ bg:"rgba(110,118,129,0.2)", color:"#8b949e" },
};
const Dot = ({ color }) => <span style={{ width:6,height:6,borderRadius:"50%",background:color,display:"inline-block" }}/>;

export default function Dashboard() {
  const router   = useRouter();
  const supabase = createClient();

  // Auth
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else setUser(data.user);
    });
  }, []);

  // Form state
  const [bodyPart,    setBodyPart]    = useState("shoulder");
  const [spineRegion, setSpineRegion] = useState("Lumbar Spine");
  const [side,        setSide]        = useState("Right");
  const [age,         setAge]         = useState("");
  const [sex,         setSex]         = useState("");
  const [comparison,  setComparison]  = useState("");
  const [indication,  setIndication]  = useState("");
  const [dictation,   setDictation]   = useState("");
  const [wantDiff,    setWantDiff]    = useState(false);
  const [wantRec,     setWantRec]     = useState(false);
  const [wantCite,    setWantCite]    = useState(false);

  // Report state
  const [report,   setReport]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [copied,   setCopied]   = useState(false);

  // Mic state
  const [recording,    setRecording]    = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setMicSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous      = true;
      rec.interimResults  = true;
      rec.lang            = "en-US";
      let finalTranscript = "";

      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) finalTranscript += t + " ";
          else interim = t;
        }
        setDictation(finalTranscript + interim);
      };
      rec.onerror = () => setRecording(false);
      rec.onend   = () => setRecording(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleMic = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (recording) { rec.stop(); setRecording(false); }
    else           { rec.start(); setRecording(true);  }
  };

  // AI auto-detect body part from dictation
  const detectBodyPart = async (text) => {
    if (!text.trim()) return;
    try {
      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          system: `You are a radiology assistant. From the dictation text, detect: bodyPart (one of: shoulder, spine, hip, knee, elbow, wrist, hand, pelvis, ankle), spineRegion (one of: Cervical Spine, Thoracic Spine, Lumbar Spine — only if spine), laterality (Right, Left, Bilateral, or null). Return ONLY raw JSON: {"bodyPart":"string","spineRegion":"string|null","laterality":"string|null"}`,
          messages:[{ role:"user", content: text.substring(0, 500) }],
        }),
      });
      const data = await res.json();
      const raw  = (data.content||[]).map(b=>b.text||"").join("");
      const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
      if (s === -1) return;
      const parsed = JSON.parse(raw.slice(s, e+1));
      if (parsed.bodyPart)    setBodyPart(parsed.bodyPart);
      if (parsed.spineRegion) setSpineRegion(parsed.spineRegion);
      if (parsed.laterality)  setSide(parsed.laterality);
    } catch {}
  };

  const currentPart = BODY_PARTS.find(b => b.id === bodyPart);
  const studyLabel  = bodyPart === "spine"
    ? spineRegion
    : `${currentPart?.lateral && side ? side+" " : ""}${currentPart?.label}`;

  const generate = async () => {
    if (!dictation.trim()) { setError("Please enter or dictate findings."); return; }
    setError(""); setReport(null); setLoading(true);

    const patientStr    = [age?`${age}y`:"", sex].filter(Boolean).join(" ") || "unknown";
    const comparisonStr = comparison.trim() || "None";
    const systemPrompt  = getSystemPrompt(bodyPart, spineRegion, wantDiff, wantRec, wantCite);

    const userMsg = `Patient: ${patientStr}
Study: ${studyLabel} MRI without contrast
Comparison: ${comparisonStr}
Clinical indication: ${indication || "Not provided"}

Radiologist dictated findings:
${dictation}`;

    try {
      const res = await fetch("/api/generate", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: systemPrompt,
          messages:[{ role:"user", content: userMsg }],
        }),
      });
      if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e?.error?.message||`HTTP ${res.status}`); }
      const data = await res.json();
      const raw  = (data.content||[]).map(b=>b.text||"").join("");
      const s = raw.indexOf("{"), e2 = raw.lastIndexOf("}");
      if (s===-1) throw new Error("No JSON in response.");
      const parsed = JSON.parse(raw.slice(s, e2+1));
      setReport({ ...parsed, _meta:{ studyLabel, patient:patientStr, comparison:comparisonStr, history:indication||"Not provided", ts:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) } });
    } catch(err) {
      setError(err.message||"Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    if (!report) return;
    const out = buildCopyText(report);
    const ta = document.createElement("textarea");
    ta.value = out;
    ta.style.cssText = "position:fixed;top:0;left:0;width:2px;height:2px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand("copy"); } catch { navigator.clipboard.writeText(out); }
    document.body.removeChild(ta);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const S = {
    app:   { display:"flex", flexDirection:"column", height:"100vh", fontFamily:"'SF Pro Text',-apple-system,BlinkMacSystemFont,system-ui,sans-serif", fontSize:13, background:"#0d1117", color:"#e6edf3" },
    topbar:{ height:50, background:"#161b22", borderBottom:"1px solid #30363d", display:"flex", alignItems:"center", padding:"0 20px", gap:12, flexShrink:0 },
    tbLogo:{ width:26,height:26, background:"#1f6feb", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 },
    tbTitle:{ fontWeight:700, fontSize:14, flex:1 },
    tbUser:{ fontSize:12, color:"#8b949e" },
    tbBtn: { background:"#1c2128", border:"1px solid #30363d", borderRadius:6, color:"#8b949e", fontSize:12, padding:"5px 12px", cursor:"pointer", fontFamily:"inherit" },
    body:  { display:"flex", flex:1, overflow:"hidden" },
    side:  { width:300, minWidth:300, background:"#161b22", borderRight:"1px solid #30363d", overflowY:"auto", padding:"16px 14px 24px", display:"flex", flexDirection:"column", gap:12 },
    sLbl:  { fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px", color:"#6e7681", marginBottom:5 },
    bpGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 },
    bpBtn: a=>({ background:a?"rgba(88,166,255,0.12)":"#1c2128", border:`1px solid ${a?"#58a6ff":"#30363d"}`, borderRadius:7, color:a?"#58a6ff":"#8b949e", fontSize:11, fontWeight:a?700:400, padding:"7px 8px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:5 }),
    srGrid:{ display:"flex", flexDirection:"column", gap:4 },
    srBtn: a=>({ background:a?"rgba(188,140,255,0.1)":"#1c2128", border:`1px solid ${a?"#bc8cff":"#30363d"}`, borderRadius:7, color:a?"#bc8cff":"#8b949e", fontSize:11, fontWeight:a?600:400, padding:"6px 9px", cursor:"pointer" }),
    fRow:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:7 },
    fg:    { display:"flex", flexDirection:"column", gap:4 },
    lbl:   { fontSize:11, color:"#8b949e", fontWeight:500 },
    inp:   { background:"#1c2128", border:"1px solid #30363d", borderRadius:7, color:"#e6edf3", fontSize:12, padding:"6px 9px", width:"100%", fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
    ta:    h=>({ background:"#1c2128", border:"1px solid #30363d", borderRadius:7, color:"#e6edf3", fontSize:12, padding:"8px 9px", width:"100%", fontFamily:"inherit", outline:"none", resize:"vertical", minHeight:h||80, boxSizing:"border-box" }),
    ckGrid:{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 },
    ckRow: { display:"flex", alignItems:"center", gap:5, fontSize:11, color:"#8b949e", cursor:"pointer" },
    genBtn:l=>({ background:l?"#21262d":"#1f6feb", border:"none", borderRadius:8, color:l?"#6e7681":"white", fontSize:13, fontWeight:600, padding:"10px", cursor:l?"not-allowed":"pointer", width:"100%", fontFamily:"inherit" }),
    main:  { flex:1, overflowY:"auto", background:"#0d1117", padding:22 },
    empty: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:10, color:"#6e7681", textAlign:"center" },
    err:   { padding:"10px 14px", background:"rgba(248,81,73,0.1)", border:"1px solid rgba(248,81,73,0.3)", borderRadius:8, color:"#f85149", fontSize:13, marginBottom:14 },
    rHdr:  { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18, paddingBottom:14, borderBottom:"1px solid #21262d" },
    cpBtn: ok=>({ background:ok?"rgba(63,185,80,0.1)":"#161b22", border:`1px solid ${ok?"rgba(63,185,80,0.4)":"#30363d"}`, borderRadius:7, color:ok?"#3fb950":"#8b949e", fontSize:12, padding:"6px 14px", cursor:"pointer", fontFamily:"inherit" }),
    card:  { background:"#161b22", border:"1px solid #30363d", borderRadius:10, marginBottom:10, overflow:"hidden" },
    cHdr:  (color,bg)=>({ padding:"8px 14px", borderBottom:"1px solid #21262d", background:bg, display:"flex", alignItems:"center", gap:7, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.7px", color }),
    cBody: { padding:"13px 16px", fontSize:13, lineHeight:1.85 },
    subT:  { fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px", color:"#6e7681", marginBottom:7, paddingBottom:5, borderBottom:"1px solid #21262d" },
    cite:  { padding:"7px 11px", borderRadius:7, background:"#1c2128", marginBottom:6, fontSize:12, color:"#8b949e", borderLeft:"2px solid #30363d", lineHeight:1.6 },
    micBtn:r=>({ display:"flex", alignItems:"center", gap:7, background:r?"rgba(248,81,73,0.15)":"#1c2128", border:`1px solid ${r?"#f85149":"#30363d"}`, borderRadius:7, color:r?"#f85149":"#8b949e", fontSize:12, padding:"7px 12px", cursor:"pointer", fontFamily:"inherit", width:"100%" }),
    detectBtn:{ background:"#1c2128", border:"1px solid #30363d", borderRadius:7, color:"#8b949e", fontSize:11, padding:"5px 10px", cursor:"pointer", fontFamily:"inherit", marginTop:4 },
  };

  return (
    <div style={S.app}>
      {/* Top bar */}
      <div style={S.topbar}>
        <div style={S.tbLogo}>🩻</div>
        <span style={S.tbTitle}>MSK MRI Report Generator</span>
        {user && <span style={S.tbUser}>{user.email}</span>}
        <button style={S.tbBtn} onClick={logout}>Sign Out</button>
      </div>

      <div style={S.body}>
        {/* Sidebar */}
        <aside style={S.side}>

          {/* Body part */}
          <div>
            <div style={S.sLbl}>Body Part</div>
            <div style={S.bpGrid}>
              {BODY_PARTS.map(b=>(
                <button key={b.id} style={S.bpBtn(bodyPart===b.id)} onClick={()=>{ setBodyPart(b.id); setReport(null); setError(""); }}>
                  <span>{b.icon}</span><span>{b.label}</span>
                </button>
              ))}
            </div>
          </div>

          {bodyPart==="spine" && (
            <div>
              <div style={S.sLbl}>Spine Region</div>
              <div style={S.srGrid}>
                {SPINE_REGIONS.map(r=>(
                  <button key={r} style={S.srBtn(spineRegion===r)} onClick={()=>setSpineRegion(r)}>{r}</button>
                ))}
              </div>
            </div>
          )}

          {bodyPart!=="spine" && bodyPart!=="pelvis" && (
            <div style={S.fg}>
              <label style={S.lbl}>Laterality</label>
              <select style={S.inp} value={side} onChange={e=>setSide(e.target.value)}>
                <option>Right</option><option>Left</option><option>Bilateral</option>
              </select>
            </div>
          )}

          <div style={S.fRow}>
            <div style={S.fg}><label style={S.lbl}>Age</label><input style={S.inp} type="number" placeholder="45" value={age} onChange={e=>setAge(e.target.value)}/></div>
            <div style={S.fg}><label style={S.lbl}>Sex</label>
              <select style={S.inp} value={sex} onChange={e=>setSex(e.target.value)}>
                <option value="">—</option><option>Male</option><option>Female</option>
              </select>
            </div>
          </div>

          <div style={S.fg}><label style={S.lbl}>Comparison</label><input style={S.inp} placeholder="e.g. MRI 01/15/2024  (blank = None)" value={comparison} onChange={e=>setComparison(e.target.value)}/></div>
          <div style={S.fg}><label style={S.lbl}>History / Indication</label><textarea style={S.ta(55)} placeholder="e.g. Low back pain with radiculopathy..." value={indication} onChange={e=>setIndication(e.target.value)}/></div>

          {/* Dictation area */}
          <div style={S.fg}>
            <label style={S.lbl}>Dictation</label>
            {micSupported && (
              <button style={S.micBtn(recording)} onClick={toggleMic}>
                <span style={{ fontSize:16 }}>{recording ? "⏹" : "🎙"}</span>
                {recording ? "Stop Recording" : "Start Microphone"}
                {recording && <span style={{ marginLeft:"auto", fontSize:11, opacity:0.7 }}>● live</span>}
              </button>
            )}
            <textarea
              style={{ ...S.ta(130), marginTop: micSupported ? 6 : 0 }}
              placeholder="Speak into mic above, or type/paste your dictated findings here..."
              value={dictation}
              onChange={e=>setDictation(e.target.value)}
            />
            {dictation.trim().length > 20 && (
              <button style={S.detectBtn} onClick={()=>detectBodyPart(dictation)}>
                🔍 Auto-detect body part from dictation
              </button>
            )}
          </div>

          <div>
            <div style={S.sLbl}>Include</div>
            <div style={S.ckGrid}>
              {[["Citations",wantCite,setWantCite],["Differentials",wantDiff,setWantDiff],["Recs",wantRec,setWantRec]].map(([lbl,val,set])=>(
                <label key={lbl} style={S.ckRow}><input type="checkbox" checked={val} onChange={e=>set(e.target.checked)} style={{ accentColor:"#1f6feb" }}/>{lbl}</label>
              ))}
            </div>
          </div>

          <button style={S.genBtn(loading)} disabled={loading} onClick={generate}>
            {loading ? "Generating…" : "⚡  Generate Report"}
          </button>
        </aside>

        {/* Main output */}
        <main style={S.main}>
          {error && <div style={S.err}>⚠ {error}</div>}

          {!report && !loading && !error && (
            <div style={S.empty}>
              <div style={{ fontSize:44 }}>🩻</div>
              <div style={{ fontSize:15, fontWeight:600, color:"#8b949e" }}>MSK MRI Report Generator</div>
              <div style={{ fontSize:12, maxWidth:400, lineHeight:1.8, marginTop:10, color:"#6e7681" }}>
                Select body part · Enter history · Dictate or type findings · Click Generate<br/>
                Copy button produces PowerScribe-compatible plain text
              </div>
            </div>
          )}

          {loading && (
            <div style={S.empty}>
              <div style={{ fontSize:40 }}>⏳</div>
              <div style={{ fontSize:14, color:"#8b949e", marginTop:8 }}>Generating {studyLabel} MRI report…</div>
            </div>
          )}

          {report && !loading && (()=>{
            const r = report;
            return (
              <>
                <div style={S.rHdr}>
                  <div>
                    <div style={{ fontSize:17, fontWeight:700, letterSpacing:"-0.3px", textTransform:"uppercase" }}>{r._meta.studyLabel} MRI</div>
                    <div style={{ fontSize:11, color:"#6e7681", marginTop:4 }}>Patient: {r._meta.patient} &nbsp;·&nbsp; {r._meta.ts}</div>
                  </div>
                  <button style={S.cpBtn(copied)} onClick={copyText}>{copied?"✓ Copied":"⎘ Copy to PowerScribe"}</button>
                </div>

                {r.technique && <div style={S.card}><div style={S.cHdr("#8b949e","#1c2128")}><Dot color="#8b949e"/> Technique</div><div style={S.cBody}>{r.technique}</div></div>}
                <div style={S.card}><div style={S.cHdr("#8b949e","#1c2128")}><Dot color="#8b949e"/> Comparison</div><div style={S.cBody}>{r.comparison||r._meta.comparison}</div></div>
                <div style={S.card}><div style={S.cHdr("#8b949e","#1c2128")}><Dot color="#8b949e"/> History</div><div style={S.cBody}>{r.history||r._meta?.history||"Not provided"}</div></div>

                {r.findings?.subsections?.length>0 && (
                  <div style={S.card}>
                    <div style={S.cHdr("#58a6ff","rgba(56,139,253,0.08)")}><Dot color="#58a6ff"/> Findings</div>
                    <div style={S.cBody}>
                      {r.findings.subsections.map((sub,i)=>(
                        <div key={i} style={{ marginBottom:i<r.findings.subsections.length-1?18:0 }}>
                          <div style={S.subT}>{sub.title}:</div>
                          <div style={{ lineHeight:1.85, whiteSpace:"pre-line" }}>{sub.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {r.impression?.length>0 && (
                  <div style={S.card}>
                    <div style={S.cHdr("#3fb950","rgba(63,185,80,0.08)")}><Dot color="#3fb950"/> Impression</div>
                    <div style={S.cBody}>
                      {r.impression.map((item,i)=>{
                        const st = PRI[item.priority]||PRI.minor;
                        return <div key={i} style={{ display:"flex",gap:10,padding:"9px 12px",borderRadius:7,background:st.bg,borderLeft:`2px solid ${st.border}`,marginBottom:i<r.impression.length-1?8:0 }}>
                          <span style={{ fontWeight:700,fontSize:12,color:"#6e7681",minWidth:20,paddingTop:1 }}>{i+1}.</span>
                          <span style={{ lineHeight:1.7 }}>{item.text}</span>
                        </div>;
                      })}
                    </div>
                  </div>
                )}

                {r.differentials?.length>0 && (
                  <div style={S.card}>
                    <div style={S.cHdr("#d29922","rgba(210,153,34,0.08)")}><Dot color="#d29922"/> Differential Diagnosis</div>
                    <div style={S.cBody}>
                      {r.differentials.map((d,i)=>{
                        const ps=PROB[d.probability]||PROB.low;
                        return <div key={i} style={{ marginBottom:i<r.differentials.length-1?12:0 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:3 }}>
                            <span style={{ fontWeight:700,fontSize:12,color:"#d29922",minWidth:22 }}>{d.rank}.</span>
                            <span style={{ fontWeight:600,flex:1 }}>{d.name}</span>
                            <span style={{ fontSize:11,padding:"2px 9px",borderRadius:20,fontWeight:600,background:ps.bg,color:ps.color }}>{d.probability}</span>
                          </div>
                          <div style={{ paddingLeft:32,fontSize:12,color:"#8b949e",lineHeight:1.6 }}>{d.rationale}</div>
                        </div>;
                      })}
                    </div>
                  </div>
                )}

                {r.recommendations?.length>0 && (
                  <div style={S.card}>
                    <div style={S.cHdr("#bc8cff","rgba(188,140,255,0.08)")}><Dot color="#bc8cff"/> Recommendations</div>
                    <div style={S.cBody}>{r.recommendations.map((rec,i)=>(
                      <div key={i} style={{ display:"flex",gap:9,marginBottom:i<r.recommendations.length-1?9:0 }}>
                        <span style={{ color:"#bc8cff",marginTop:2 }}>→</span>
                        <span style={{ lineHeight:1.7 }}>{rec}</span>
                      </div>
                    ))}</div>
                  </div>
                )}

                {r.citations?.length>0 && (
                  <div style={S.card}>
                    <div style={S.cHdr("#6e7681","#1c2128")}><Dot color="#6e7681"/> Literature Citations</div>
                    <div style={S.cBody}>{r.citations.map((c,i)=>(
                      <div key={i} style={S.cite}><span style={{ color:"#6e7681",fontWeight:700,marginRight:7 }}>[{i+1}]</span>{c}</div>
                    ))}</div>
                  </div>
                )}
              </>
            );
          })()}
        </main>
      </div>
    </div>
  );
}
