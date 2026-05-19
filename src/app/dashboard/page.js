'use client';
import{useState,useRef}from'react';
export default function DashboardPage(){
const[text,setText]=useState('');
const[report,setReport]=useState('');
const[loading,setLoading]=useState(false);
const[listening,setListening]=useState(false);
const[body,setBody]=useState('knee');
const[copied,setCopied]=useState(false);
const recRef=useRef(null);
const finalRef=useRef('');
const bodies=['knee','shoulder','hip','wrist','elbow','ankle','spine','pelvis','foot'];

const SYSTEM_PROMPT=(part)=>`You are a subspecialty MSK radiologist generating a structured MRI report. Be concise, precise, and use standard radiology terminology. Format the report exactly as follows with these section headers on their own lines in ALL CAPS followed by a colon:

TECHNIQUE:
Describe the MRI sequences performed for a ${part} MRI (e.g. sagittal PD fat-sat, coronal T1, axial T2, etc). Keep to 2 sentences.

FINDINGS:
Organize findings by anatomical structure relevant to the ${part}. Use subheadings in title case followed by a colon (e.g. "Anterior Cruciate Ligament:", "Medial Meniscus:", "Articular Cartilage:", etc). For each structure state findings concisely. Use "unremarkable" for normal structures. Be specific about signal, morphology, and location of any abnormalities.

IMPRESSION:
Number each significant finding. Lead with the most clinically important finding. If normal, state "Unremarkable ${part} MRI."

Do not add any preamble or commentary outside these three sections.`;

const generate=async()=>{
  if(!text.trim())return;
  setLoading(true);setReport('');
  try{
    const r=await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6',
        max_tokens:1500,
        system:SYSTEM_PROMPT(body),
        messages:[{role:'user',content:`Generate an MRI report for a ${body} MRI based on these dictated findings:\n\n${text}`}]
      })
    });
    const d=await r.json();
    if(d?.error)setReport('Error: '+d.error);
    else setReport(d?.content?.[0]?.text||'Error generating report.');
  }catch(e){setReport('Network error. Please try again.');}
  setLoading(false);
};

const toggleMic=()=>{
  if(listening){
    try{recRef.current?.stop();}catch(e){}
    recRef.current=null;
    setListening(false);
    return;
  }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition||window.mozSpeechRecognition||window.msSpeechRecognition;
  if(!SR){alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');return;}
  finalRef.current='';
  const startRec=()=>{
    try{
      const rec=new SR();
      rec.continuous=true;
      rec.interimResults=true;
      rec.lang='en-US';
      rec.maxAlternatives=1;
      rec.onstart=()=>setListening(true);
      rec.onresult=(e)=>{
        let interim='';
        for(let i=e.resultIndex;i<e.results.length;i++){
          const t=e.results[i][0].transcript;
          if(e.results[i].isFinal)finalRef.current+=t+' ';
          else interim+=t;
        }
        setText(finalRef.current+interim);
      };
      rec.onerror=(e)=>{
        if(e.error==='not-allowed'){alert('Microphone access denied. Please allow microphone access and try again.');setListening(false);return;}
        if(e.error==='no-speech')return;
        console.error('Speech error:',e.error);
      };
      rec.onend=()=>{
        if(recRef.current===rec){
          try{rec.start();}catch(err){setListening(false);}
        }
      };
      rec.start();
      recRef.current=rec;
    }catch(e){
      setListening(false);
      alert('Could not start microphone: '+e.message);
    }
  };
  startRec();
};

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
    const isSubheader=/^[A-Z][a-zA-Z\s]+:/.test(line.trim())&&!isHeader;
    const isNumbered=/^\d+\./.test(line.trim());
    if(isHeader)return(
      <div key={i} style={{marginTop:i>0?18:0,marginBottom:4}}>
        <span style={{fontSize:12,fontWeight:800,letterSpacing:'0.12em',color:'#1e3a5f',borderBottom:'2px solid #2563eb',paddingBottom:2}}>{line}</span>
      </div>
    );
    if(isSubheader)return(
      <div key={i} style={{marginTop:8,marginBottom:2}}>
        <span style={{fontSize:13,fontWeight:700,color:'#374151'}}>{line}</span>
      </div>
    );
    if(isNumbered)return(
      <div key={i} style={{marginTop:4,paddingLeft:4,fontSize:13,color:'#1e293b',lineHeight:1.7}}>
        <span style={{fontWeight:600,color:'#2563eb'}}>{line.match(/^\d+\./)[0]}</span>
        {line.slice(line.match(/^\d+\./)[0].length)}
      </div>
    );
    if(!line.trim())return<div key={i} style={{height:4}}/>;
    return<div key={i} style={{fontSize:13,color:'#374151',lineHeight:1.75,paddingLeft:4}}>{line}</div>;
  });
};

const grid={display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',padding:'16px',minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#0f172a 100%)',fontFamily:"'Segoe UI',system-ui,sans-serif",boxSizing:'border-box'};
const col=()=>({background:'white',borderRadius:'14px',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 8px 32px rgba(0,0,0,0.25)',border:'1px solid rgba(255,255,255,0.1)'});
const hdr=(c)=>({background:`linear-gradient(135deg,${c},${c}cc)`,padding:'13px 16px',display:'flex',alignItems:'center',gap:'8px'});
const htxt={color:'white',fontWeight:'700',fontSize:'11px',textTransform:'uppercase',letterSpacing:'0.12em',margin:0,textShadow:'0 1px 2px rgba(0,0,0,0.2)'};
const bod={padding:'16px',display:'flex',flexDirection:'column',gap:'12px',flex:1};
const inp={width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box',color:'#1e293b',outline:'none'};
const lbl={fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:5};

return(
<div style={grid}>

  {/* COL 1 */}
  <div style={col()}>
    <div style={hdr('#1d4ed8')}><span style={{fontSize:16}}>📝</span><p style={htxt}>Dictation Input</p></div>
    <div style={bod}>
      <div>
        <label style={lbl}>Body Part</label>
        <select style={inp} value={body} onChange={e=>setBody(e.target.value)}>
          {bodies.map(b=><option key={b} value={b}>{b.charAt(0).toUpperCase()+b.slice(1)}</option>)}
        </select>
      </div>
      <div style={{flex:1,display:'flex',flexDirection:'column'}}>
        <label style={lbl}>Findings</label>
        <textarea
          style={{...inp,flex:1,minHeight:220,resize:'vertical',lineHeight:1.65,fontFamily:'inherit',border:listening?'1.5px solid #ef4444':'1px solid #e2e8f0',boxShadow:listening?'0 0 0 3px rgba(239,68,68,0.1)':'none',transition:'border 0.15s'}}
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder="Type or dictate findings here…"
        />
      </div>
      <button
        onClick={toggleMic}
        style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'10px',borderRadius:'8px',border:'1.5px solid '+(listening?'#fca5a5':'#e2e8f0'),background:listening?'#fef2f2':'white',fontSize:'14px',fontWeight:600,cursor:'pointer',color:listening?'#dc2626':'#475569',transition:'all 0.15s'}}>
        <span style={{display:'inline-block',width:8,height:8,borderRadius:'50%',background:listening?'#ef4444':'#94a3b8',boxShadow:listening?'0 0 6px #ef4444':'none',transition:'all 0.15s'}}/>
        {listening?'Stop Recording':'🎤 Start Dictation'}
      </button>
      <button
        onClick={generate}
        disabled={loading||!text.trim()}
        style={{width:'100%',padding:'11px',borderRadius:'8px',border:'none',background:(loading||!text.trim())?'#cbd5e1':'linear-gradient(135deg,#2563eb,#1d4ed8)',color:'white',fontSize:'14px',fontWeight:700,cursor:(loading||!text.trim())?'not-allowed':'pointer',boxShadow:(loading||!text.trim())?'none':'0 4px 14px rgba(37,99,235,0.4)',letterSpacing:'0.02em',transition:'all 0.15s'}}>
        {loading?'Generating…':'✨ Generate Report'}
      </button>
    </div>
  </div>

  {/* COL 2 */}
  <div style={col()}>
    <div style={hdr('#6d28d9')}><span style={{fontSize:16}}>📄</span><p style={htxt}>Generated Report</p></div>
    <div style={bod}>
      <div style={{flex:1,padding:'16px',border:'1px solid #e2e8f0',borderRadius:'10px',overflowY:'auto',minHeight:340,maxHeight:'68vh',background:report?'white':'#f8fafc'}}>
        {loading
          ?<div style={{display:'flex',flexDirection:'column',gap:8,paddingTop:8}}>
              <div style={{height:10,background:'#e2e8f0',borderRadius:4,width:'60%',animation:'pulse 1.5s infinite'}}/>
              <div style={{height:10,background:'#e2e8f0',borderRadius:4,width:'85%',animation:'pulse 1.5s infinite'}}/>
              <div style={{height:10,background:'#e2e8f0',borderRadius:4,width:'70%',animation:'pulse 1.5s infinite'}}/>
              <style>{`@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}`}</style>
            </div>
          :report
            ?<div style={{fontFamily:"Georgia,'Times New Roman',serif"}}>{formatReport(report)}</div>
            :<div style={{color:'#94a3b8',fontStyle:'italic',fontSize:13,paddingTop:8}}>Report will appear here after generation.</div>
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

  {/* COL 3 */}
  <div style={col()}>
    <div style={hdr('#0e7490')}><span style={{fontSize:16}}>📐</span><p style={htxt}>Reference Panel</p></div>
    <div style={bod}>
      <p style={{color:'#64748b',fontSize:13,margin:0,lineHeight:1.6}}>Measurement diagrams and normal values by joint — coming in next update.</p>
      <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:4}}>
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
