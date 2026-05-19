'use client';
import{useState,useRef,useEffect}from'react';

export default function DashboardPage(){
const[text,setText]=useState('');
const[report,setReport]=useState('');
const[loading,setLoading]=useState(false);
const[listening,setListening]=useState(false);
const[body,setBody]=useState('knee');
const[side,setSide]=useState('left');
const[contrast,setContrast]=useState('without');
const[copied,setCopied]=useState(false);
const[micError,setMicError]=useState('');
const recRef=useRef(null);
const shouldRestartRef=useRef(false);
const accumulatedRef=useRef('');

const bodies=['knee','shoulder','hip','wrist','elbow','ankle','spine','pelvis','foot'];
const bilateralParts=['spine','pelvis'];
const showSide=!bilateralParts.includes(body);

const technique=`Multiplanar multisequence MRI of the ${showSide?side+' ':''} ${body} ${contrast} IV contrast.`;

const SYSTEM_PROMPT=(part,lat,con)=>`You are a subspecialty MSK radiologist generating a structured MRI report. Use precise radiology terminology. Format exactly as shown with section headers in ALL CAPS followed by a colon on their own line.

TECHNIQUE:
Multiplanar multisequence MRI of the ${lat?lat+' ':''}${part} ${con} IV contrast.

FINDINGS:
[Organize by anatomical structure with subheadings in Title Case followed by colon. State findings concisely per structure. Use "unremarkable" for normal. Be specific about signal intensity, morphology, size, and location of abnormalities.]

IMPRESSION:
[Number each significant finding, most important first. If normal write: Unremarkable MRI of the ${lat?lat+' ':''}${part}.]`;

const generate=async()=>{
  if(!text.trim())return;
  setLoading(true);setReport('');
  const lat=showSide?side:'';
  try{
    const r=await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6',
        max_tokens:1500,
        system:SYSTEM_PROMPT(body,lat,contrast),
        messages:[{role:'user',content:`Generate an MRI report for a ${lat?lat+' ':''}${body} MRI (${contrast} IV contrast) based on these dictated findings:\n\n${text}`}]
      })
    });
    const d=await r.json();
    if(d?.error)setReport('Error: '+d.error);
    else setReport(d?.content?.[0]?.text||'Error generating report.');
  }catch(e){setReport('Network error. Please try again.');}
  setLoading(false);
};

// ── Mic: non-continuous mode with manual restart (most compatible with Edge) ──
const stopMic=()=>{
  shouldRestartRef.current=false;
  try{recRef.current?.stop();}catch(e){}
  recRef.current=null;
  setListening(false);
};

const startMic=()=>{
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    setMicError('Speech recognition not supported. Please use Chrome or Edge.');
    return;
  }
  setMicError('');
  try{
    const rec=new SR();
    // Non-continuous is more reliable in Edge — we restart manually on onend
    rec.continuous=false;
    rec.interimResults=false;
    rec.lang='en-US';
    rec.maxAlternatives=1;

    rec.onstart=()=>{
      setListening(true);
    };

    rec.onspeechstart=()=>{
      setMicError('');
    };

    rec.onresult=(e)=>{
      for(let i=0;i<e.results.length;i++){
        if(e.results[i].isFinal){
          accumulatedRef.current+=e.results[i][0].transcript+' ';
        }
      }
      setText(accumulatedRef.current.trim());
    };

    rec.onerror=(e)=>{
      if(e.error==='not-allowed'){
        setMicError('Microphone access denied. Click the lock icon in your browser address bar and allow microphone.');
        stopMic();
        return;
      }
      if(e.error==='no-speech'||e.error==='audio-capture'){
        // non-fatal — just restart
        return;
      }
      console.warn('Speech error:',e.error);
    };

    rec.onend=()=>{
      // Auto-restart as long as shouldRestartRef is true
      if(shouldRestartRef.current){
        try{
          const rec2=new SR();
          rec2.continuous=false;
          rec2.interimResults=false;
          rec2.lang='en-US';
          rec2.maxAlternatives=1;
          rec2.onstart=rec.onstart;
          rec2.onspeechstart=rec.onspeechstart;
          rec2.onresult=rec.onresult;
          rec2.onerror=rec.onerror;
          rec2.onend=rec.onend;
          rec2.start();
          recRef.current=rec2;
        }catch(err){
          setListening(false);
          shouldRestartRef.current=false;
        }
      }else{
        setListening(false);
      }
    };

    rec.start();
    recRef.current=rec;
  }catch(e){
    setMicError('Could not start microphone: '+e.message);
    setListening(false);
  }
};

const toggleMic=()=>{
  if(listening){
    stopMic();
  }else{
    accumulatedRef.current=text?text+' ':'';
    shouldRestartRef.current=true;
    startMic();
  }
};

// cleanup on unmount
useEffect(()=>()=>stopMic(),[]);

const copyReport=()=>{
  if(!report)return;
  navigator.clipboard.writeText(report);
  setCopied(true);
  setTimeout(()=>setCopied(false),2500);
};

const formatReport=(txt)=>{
  if(!txt)return null;
  return txt.split('\n').map((line,i)=>{
    const isHeader=/^(TECHNIQUE|FINDINGS|IMPRESSION):?/.test(line.trim());
    const isSubheader=/^[A-Z][A-Za-z\s\/\-]+:/.test(line.trim())&&!isHeader&&line.trim().length<60;
    const isNumbered=/^\d+\./.test(line.trim());
    if(isHeader)return(
      <div key={i} style={{marginTop:i>0?20:0,marginBottom:6}}>
        <span style={{fontSize:11,fontWeight:800,letterSpacing:'0.14em',color:'#1e3a5f',borderBottom:'2px solid #2563eb',paddingBottom:3,display:'inline-block'}}>{line.trim()}</span>
      </div>
    );
    if(isSubheader)return(
      <div key={i} style={{marginTop:10,marginBottom:2}}>
        <span style={{fontSize:13,fontWeight:700,color:'#1e293b'}}>{line.trim()}</span>
      </div>
    );
    if(isNumbered){
      const num=line.match(/^\d+\./)[0];
      return(
        <div key={i} style={{marginTop:5,paddingLeft:4,fontSize:13,color:'#1e293b',lineHeight:1.7,display:'flex',gap:6}}>
          <span style={{fontWeight:700,color:'#2563eb',flexShrink:0}}>{num}</span>
          <span>{line.slice(num.length).trim()}</span>
        </div>
      );
    }
    if(!line.trim())return<div key={i} style={{height:5}}/>;
    return<div key={i} style={{fontSize:13,color:'#374151',lineHeight:1.8,paddingLeft:4}}>{line}</div>;
  });
};

// ── Styles ──
const grid={display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',padding:'16px',minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)',fontFamily:"'Segoe UI',system-ui,sans-serif",boxSizing:'border-box'};
const col=()=>({background:'white',borderRadius:'14px',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.25)',border:'1px solid rgba(255,255,255,0.08)'});
const hdr=(c)=>({background:`linear-gradient(135deg,${c}ee,${c}bb)`,padding:'13px 16px',display:'flex',alignItems:'center',gap:'8px'});
const htxt={color:'white',fontWeight:'700',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.12em',margin:0};
const bod={padding:'16px',display:'flex',flexDirection:'column',gap:'12px',flex:1};
const inp={width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box',color:'#1e293b',outline:'none',background:'white'};
const lbl={fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:5};
const row={display:'flex',gap:8};

return(
<div style={grid}>

  {/* ── COL 1: INPUT ── */}
  <div style={col()}>
    <div style={hdr('#1d4ed8')}><span style={{fontSize:16}}>📝</span><p style={htxt}>Dictation Input</p></div>
    <div style={bod}>

      <div style={row}>
        <div style={{flex:2}}>
          <label style={lbl}>Body Part</label>
          <select style={inp} value={body} onChange={e=>setBody(e.target.value)}>
            {bodies.map(b=><option key={b} value={b}>{b.charAt(0).toUpperCase()+b.slice(1)}</option>)}
          </select>
        </div>
        {showSide&&(
          <div style={{flex:1}}>
            <label style={lbl}>Side</label>
            <select style={inp} value={side} onChange={e=>setSide(e.target.value)}>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="bilateral">Bilateral</option>
            </select>
          </div>
        )}
      </div>

      <div>
        <label style={lbl}>Contrast</label>
        <select style={inp} value={contrast} onChange={e=>setContrast(e.target.value)}>
          <option value="without">Without IV contrast</option>
          <option value="with">With IV contrast</option>
          <option value="with and without">With and without IV contrast</option>
        </select>
      </div>

      <div style={{padding:'8px 10px',background:'#f0f9ff',borderRadius:7,border:'1px solid #bae6fd',fontSize:11,color:'#0369a1',fontStyle:'italic',lineHeight:1.5}}>
        {technique}
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        <label style={lbl}>Findings</label>
        <textarea
          style={{...inp,flex:1,minHeight:180,resize:'vertical',lineHeight:1.65,fontFamily:'inherit',border:listening?'1.5px solid #ef4444':'1px solid #e2e8f0',boxShadow:listening?'0 0 0 3px rgba(239,68,68,0.1)':'none',transition:'border 0.15s,box-shadow 0.15s'}}
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder="Type or dictate findings here…"
        />
      </div>

      {micError&&<div style={{fontSize:11,color:'#dc2626',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:6,padding:'6px 10px',lineHeight:1.5}}>{micError}</div>}

      <button
        onClick={toggleMic}
        style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid '+(listening?'#fca5a5':'#e2e8f0'),background:listening?'#fef2f2':'white',fontSize:'14px',fontWeight:600,cursor:'pointer',color:listening?'#dc2626':'#475569',transition:'all 0.15s'}}>
        <span style={{width:8,height:8,borderRadius:'50%',background:listening?'#ef4444':'#94a3b8',boxShadow:listening?'0 0 8px #ef4444':'none',transition:'all 0.3s',flexShrink:0}}/>
        {listening?'⏹ Stop Recording':'🎤 Start Dictation'}
      </button>

      <button
        onClick={generate}
        disabled={loading||!text.trim()}
        style={{width:'100%',padding:'11px',borderRadius:'8px',border:'none',background:(loading||!text.trim())?'#cbd5e1':'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'white',fontSize:'14px',fontWeight:700,cursor:(loading||!text.trim())?'not-allowed':'pointer',boxShadow:(loading||!text.trim())?'none':'0 4px 14px rgba(37,99,235,0.35)',letterSpacing:'0.02em'}}>
        {loading?'Generating…':'✨ Generate Report'}
      </button>

    </div>
  </div>

  {/* ── COL 2: REPORT ── */}
  <div style={col()}>
    <div style={hdr('#6d28d9')}><span style={{fontSize:16}}>📄</span><p style={htxt}>Generated Report</p></div>
    <div style={bod}>
      <div style={{flex:1,padding:'14px 16px',border:'1px solid #e2e8f0',borderRadius:'10px',overflowY:'auto',minHeight:340,maxHeight:'68vh',background:report?'white':'#f8fafc'}}>
        {loading
          ?<div style={{display:'flex',flexDirection:'column',gap:10,paddingTop:4}}>
              {[60,85,70,90,55,75].map((w,i)=>(
                <div key={i} style={{height:10,background:'#e2e8f0',borderRadius:4,width:w+'%',opacity:0.6+i*0.05}}/>
              ))}
              <style>{`@keyframes shimmer{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
            </div>
          :report
            ?<div style={{fontFamily:"Georgia,'Times New Roman',serif"}}>{formatReport(report)}</div>
            :<div style={{color:'#94a3b8',fontStyle:'italic',fontSize:13,paddingTop:4,lineHeight:1.7}}>Report will appear here after generation.</div>
        }
      </div>
      <button
        onClick={copyReport}
        disabled={!report}
        style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid '+(copied?'#86efac':'#e2e8f0'),background:copied?'#f0fdf4':(!report?'#f8fafc':'white'),fontSize:'13px',fontWeight:600,cursor:!report?'not-allowed':'pointer',color:copied?'#16a34a':'#475569',transition:'all 0.2s'}}>
        {copied?'✓ Copied to Clipboard':'📋 Copy for PowerScribe'}
      </button>
    </div>
  </div>

  {/* ── COL 3: REFERENCE ── */}
  <div style={col()}>
    <div style={hdr('#0e7490')}><span style={{fontSize:16}}>📐</span><p style={htxt}>Reference Panel</p></div>
    <div style={bod}>
      <p style={{color:'#64748b',fontSize:13,margin:0,lineHeight:1.6}}>Measurement diagrams and normal values by joint — coming in next update.</p>
      <div style={{display:'flex',flexDirection:'column',gap:5,marginTop:4}}>
        {['Knee','Shoulder','Hip','Wrist','Elbow','Ankle','Spine','Pelvis','Foot'].map(j=>(
          <div key={j} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',background:'#f0f9ff',borderRadius:7,border:'1px solid #e0f2fe',fontSize:12,color:'#0369a1',fontWeight:500}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#0891b2',flexShrink:0}}/>
            {j}
          </div>
        ))}
      </div>
    </div>
  </div>

</div>
);
}
