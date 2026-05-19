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
const bodies=['knee','shoulder','hip','wrist','elbow','ankle','spine','pelvis','foot'];
const grid={display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',padding:'16px',minHeight:'100vh',background:'linear-gradient(135deg,#0f172a,#1e3a5f)',fontFamily:'system-ui,sans-serif',boxSizing:'border-box'};
const col=()=>({background:'white',borderRadius:'14px',padding:'0',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.2)'});
const hdr=(c)=>({background:c,padding:'12px 16px',display:'flex',alignItems:'center',gap:'8px'});
const htxt={color:'white',fontWeight:'700',fontSize:'12px',textTransform:'uppercase',letterSpacing:'0.1em',margin:0};
const bod={padding:'16px',display:'flex',flexDirection:'column',gap:'12px',flex:1};
const inp={width:'100%',padding:'9px 12px',border:'1px solid #e2e8f0',borderRadius:'8px',fontSize:'14px',boxSizing:'border-box'};
const btn=(bg,disabled)=>({width:'100%',padding:'11px',borderRadius:'8px',border:'none',background:disabled?'#cbd5e1':bg,color:'white',fontSize:'14px',fontWeight:'600',cursor:disabled?'not-allowed':'pointer',transition:'all 0.15s'});

const generate=async()=>{
  if(!text.trim())return;
  setLoading(true);setReport('');
  try{
    const r=await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6',
        max_tokens:1000,
        system:`You are an expert MSK radiologist. Generate a professional MRI report for a ${body} MRI. Use sections: TECHNIQUE, FINDINGS, IMPRESSION.`,
        messages:[{role:'user',content:`Body part: ${body}\nFindings: ${text}`}]
      })
    });
    const d=await r.json();
    if(d?.error)setReport('Error: '+d.error);
    else setReport(d?.content?.[0]?.text||'Error generating report.');
  }catch(e){setReport('Network error. Please try again.');}
  setLoading(false);
};

const toggleMic=()=>{
  if(listening){recRef.current?.stop();setListening(false);return;}
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){alert('Speech recognition not supported.');return;}
  try{
    const rec=new SR();
    rec.continuous=true;rec.interimResults=true;rec.lang='en-US';
    let final='';
    rec.onstart=()=>setListening(true);
    rec.onresult=(e)=>{
      let interim='';
      for(let i=e.resultIndex;i<e.results.length;i++){
        const t=e.results[i][0].transcript;
        if(e.results[i].isFinal)final+=t+' ';
        else interim+=t;
      }
      setText(final+interim);
    };
    rec.onerror=(e)=>{setListening(false);if(e.error==='not-allowed')alert('Microphone access denied.');};
    rec.onend=()=>setListening(false);
    rec.start();recRef.current=rec;
  }catch(e){setListening(false);alert('Could not start microphone.');}
};

const copyReport=()=>{
  if(!report)return;
  navigator.clipboard.writeText(report);
  setCopied(true);
  setTimeout(()=>setCopied(false),2000);
};

return(
<div style={grid}>

  {/* COL 1 - INPUT */}
  <div style={col()}>
    <div style={hdr('#2563eb')}><span style={{fontSize:16}}>📝</span><p style={htxt}>Dictation Input</p></div>
    <div style={bod}>
      <div>
        <label style={{fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:4}}>Body Part</label>
        <select style={inp} value={body} onChange={e=>setBody(e.target.value)}>
          {bodies.map(b=><option key={b} value={b}>{b.charAt(0).toUpperCase()+b.slice(1)}</option>)}
        </select>
      </div>
      <div>
        <label style={{fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',display:'block',marginBottom:4}}>Findings</label>
        <textarea
          style={{...inp,minHeight:200,resize:'vertical',lineHeight:1.6,fontFamily:'inherit',border:listening?'1.5px solid #ef4444':'1px solid #e2e8f0',outline:'none'}}
          value={text}
          onChange={e=>setText(e.target.value)}
          placeholder="Type or dictate findings here…"
        />
      </div>
      <button
        style={{...btn(listening?'#ef4444':'white',false),color:listening?'white':'#475569',border:'1.5px solid '+(listening?'#ef4444':'#e2e8f0')}}
        onClick={toggleMic}>
        {listening?'⏹ Stop Recording':'🎤 Start Dictation'}
      </button>
      <button style={btn('linear-gradient(135deg,#2563eb,#1d4ed8)',loading||!text.trim())} onClick={generate} disabled={loading||!text.trim()}>
        {loading?'Generating…':'✨ Generate Report'}
      </button>
    </div>
  </div>

  {/* COL 2 - REPORT */}
  <div style={col()}>
    <div style={hdr('#7c3aed')}><span style={{fontSize:16}}>📄</span><p style={htxt}>Generated Report</p></div>
    <div style={bod}>
      <div style={{flex:1,padding:14,border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,lineHeight:1.8,whiteSpace:'pre-wrap',overflowY:'auto',minHeight:320,maxHeight:'65vh',background:'#f8fafc',fontFamily:"'Courier New',monospace"}}>
        {loading
          ?<span style={{color:'#94a3b8',fontStyle:'italic'}}>Generating report…</span>
          :report||<span style={{color:'#94a3b8',fontStyle:'italic'}}>Report will appear here after generation.</span>
        }
      </div>
      <button
        style={{...btn(copied?'#16a34a':'white',!report),color:copied?'white':'#475569',border:'1.5px solid '+(copied?'#86efac':'#e2e8f0'),background:copied?'#16a34a':(!report?'#f8fafc':'white')}}
        onClick={copyReport}
        disabled={!report}>
        {copied?'✓ Copied to Clipboard':'📋 Copy for PowerScribe'}
      </button>
    </div>
  </div>

  {/* COL 3 - REFERENCE */}
  <div style={col()}>
    <div style={hdr('#0891b2')}><span style={{fontSize:16}}>📐</span><p style={htxt}>Reference Panel</p></div>
    <div style={bod}>
      <p style={{color:'#64748b',fontSize:13,margin:0}}>Measurement diagrams and normal values — coming in next update.</p>
      <div style={{padding:'12px',background:'#f0f9ff',borderRadius:8,border:'1px dashed #bae6fd',color:'#0369a1',fontSize:12,lineHeight:1.6}}>
        <strong>Joints covered:</strong> Knee, Shoulder, Hip, Wrist, Elbow, Ankle, Spine, Pelvis, Foot
      </div>
    </div>
  </div>

</div>
);
}
