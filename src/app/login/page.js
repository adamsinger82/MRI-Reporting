'use client';
export const dynamic = 'force-dynamic'; // v2026-06-09
import { useState, useRef, useEffect } from 'react';
// LucidMSK logo font
if (typeof document !== 'undefined' && !document.getElementById('rajdhani-font')) {
  const link = document.createElement('link');
  link.id = 'rajdhani-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@700&display=swap';
  document.head.appendChild(link);
}
import { JOINT_DATA, DIAGRAM_SVGS } from './referenceData';
import CopyButton from './CopyButton';

// ─── EXTRACTED DATA IMPORTS ───────────────────────────────────────────────────
import { MRI_GRADING_DATA, CT_GRADING_DATA } from '../data/gradingData';
import {
  BODY_PARTS, BODY_PARTS_CT, BILATERAL,
  ABSENT_STRUCTURES, ANATOMY_MRI, ANATOMY_CT, ANATOMY,
  getAnatomy, getEffectiveJointData, buildGradingContext,
  buildReportHeading, buildPrompt, formatReport, isAbsentStructure
} from '../data/promptBuilders';
import {
  PELVIS_LABELS, SHOULDER_LABELS, SAG_SHOULDER_LABELS,
  COR_SHOULDER_LABELS, ELBOW_LABELS, AX_T1_ELBOW_LABELS, COR_ELBOW_LABELS
} from '../data/atlasLabels';
import { ATLAS_JOINTS, ATLAS_REGIONS_MAP, VHP_BASE, localSlices } from '../data/atlasData';
import { ARTHROPLASTY_DATA, ARTHROPLASTY_JOINTS, ArthroplastyPanel } from '../data/arthroplastyData';
import { RHEUM_JOINTS, buildRheumPrompt } from '../data/rheumData';

// ─── ANATOMY ATLAS MODAL ───────────────────────────────────────────────────
// Rebuilt with split layout: image on left (dots only), labels sidebar on right
// Label editor uses imgRef.getBoundingClientRect() to record clicks relative
// to the ACTUAL image pixels — not the container — fixing coordinate drift.
function AtlasModal({ onClose }) {
  const [selectedRegion, setSelectedRegion] = useState('Pelvis');
  const [selectedJoint, setSelectedJoint] = useState('pelvis');
  const [sliceIdx, setSliceIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [renderTick, setRenderTick] = useState(0);
  const [loadedSet, setLoadedSet] = useState(new Set());  const [sequence, setSequence] = useState('t1');
  const sequenceRef = useRef('t1');
  const [labelMode, setLabelMode] = useState(false);
  const [visibleLayers, setVisibleLayers] = useState({ nerves:true, muscles:true, arteries:true, veins:true, bones:true, ligaments:true, joints:true, spaces:true, cartilage:true });
  const [userLabels, setUserLabels] = useState({});
  const [pendingClick, setPendingClick] = useState(null);
  const [pendingText, setPendingText] = useState('');
  const imgRef = useRef(null);
  const imgContainerRef = useRef(null);
  const imgAreaRef = useRef(null); // ref to the image area div (excludes bars)

  const regionJoints = ATLAS_REGIONS_MAP[selectedRegion] || {};
  const jointData = ATLAS_JOINTS[selectedJoint];

  useEffect(() => {
    const keys = Object.keys(ATLAS_REGIONS_MAP[selectedRegion] || {});
    if (keys.length > 0) {
      setSelectedJoint(keys[0]);
      const j = ATLAS_JOINTS[keys[0]];
      const idx = j && !j.isBrachialPlexus ? (j.useLocalMRI ? j.defaultSlice-1 : (j.slices||[]).indexOf(j.defaultSlice)) : 0;
      setSliceIdx(Math.max(0, idx));
    }
  }, [selectedRegion]);

  useEffect(() => {
    if (jointData && !jointData.isBrachialPlexus) {
      const idx = jointData.useLocalMRI ? jointData.defaultSlice-1 : (jointData.slices||[]).indexOf(jointData.defaultSlice);
      setSliceIdx(Math.max(0, idx));
      setImgError(false);
      setLoadedSet(new Set());
      // Reset sequence to first available for this joint
      if (jointData.sequences) {
        const firstSeq = Object.keys(jointData.sequences)[0];
        setSequence(firstSeq);
        sequenceRef.current = firstSeq;
      }
    }
  }, [selectedJoint]);

  // Wheel scroll — 80ms throttle, NO imgLoaded reset (prevents spinner flash on cached images)
  const wheelThrottleRef = useRef(0);
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    const handleWheel = (e) => {
      e.preventDefault();
      if (!jointData) return;
      const now = Date.now();
      if (now - wheelThrottleRef.current < 80) return;
      wheelThrottleRef.current = now;
      setSliceIdx(i => {
        const activeSqKey = jointData?.sequences?.[sequenceRef.current] ? sequenceRef.current : Object.keys(jointData?.sequences||{})[0];
        const sq = jointData?.sequences?.[activeSqKey] || null;
        const slices = sq ? sq.slices : (jointData?.slices || []);
        return e.deltaY > 0 ? Math.min(slices.length-1, i+1) : Math.max(0, i-1);
      });
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [jointData]);

  // Smart preload — ±10 immediately on joint/sequence change, rest lazily after 1s
  // Keeps initial load snappy; browser cache handles subsequent scrolls
  useEffect(() => {
    if (!jointData) return;
    const preloadSqKey = jointData?.sequences?.[sequenceRef.current] ? sequenceRef.current : Object.keys(jointData?.sequences||{})[0];
    const sq = jointData?.sequences?.[preloadSqKey] || null;
    const src = sq || (jointData?.useLocalMRI ? jointData : null);
    if (!src) return;
    const sliceArr = sq ? sq.slices : (jointData.slices || []);
    const pathFn = sq
      ? (i) => `${sq.path}${sq.pad===0?sliceArr[i]:String(sliceArr[i]).padStart(sq.pad||3,'0')}${sq.ext}`
      : (i) => `${jointData.localPath}${String(sliceArr[i]).padStart(3,'0')}${jointData.localExt||'.webp'}`;
    const center = sliceIdx || Math.floor(sliceArr.length / 2);
    // Tier 1: ±10 slices — load immediately (covers fast local scrolling)
    const tier1 = [], tier2 = [], tier3 = [];
    sliceArr.forEach((_, i) => {
      const d = Math.abs(i - center);
      if (d <= 10) tier1.push(i);
      else if (d <= 35) tier2.push(i);
      else tier3.push(i);
    });
    tier1.forEach(i => { const img = new Image(); img.src = pathFn(i); });
    // Tier 2: ±35 after 800ms
    const t2 = setTimeout(() => {
      tier2.forEach(i => { const img = new Image(); img.src = pathFn(i); });
    }, 800);
    // Tier 3: rest after 2.5s (user is likely settled on a joint by then)
    const t3 = setTimeout(() => {
      tier3.forEach(i => { const img = new Image(); img.src = pathFn(i); });
    }, 2500);
    return () => { clearTimeout(t2); clearTimeout(t3); };
  }, [selectedJoint, sequence]);

  useEffect(() => { setSliceIdx(0); setImgError(false); setLoadedSet(new Set()); }, [sequence]);

  // seqData / imgUrl — must be defined BEFORE any useEffect that depends on imgUrl
  const seqData = jointData?.sequences
    ? (jointData.sequences[sequence] || jointData.sequences[Object.keys(jointData.sequences)[0]] || null)
    : null;
  const activeSlices = seqData ? seqData.slices : (jointData?.slices || []);
  const currentSlice = activeSlices[sliceIdx] ?? null;
  const imgUrl = jointData && currentSlice
    ? seqData
      ? `${seqData.path}${seqData.pad===0?currentSlice:String(currentSlice).padStart(seqData.pad||3,'0')}${seqData.ext}`
      : jointData.useLocalMRI
        ? `${jointData.localPath}${String(currentSlice).padStart(3,'0')}${jointData.localExt||'.webp'}`
        : `${VHP_BASE}/${jointData.folder}/a_vm${currentSlice}.png`
    : null;

  // imgLoaded = current slice is in the loadedSet
  const imgLoaded = imgUrl ? loadedSet.has(imgUrl) : false;

  // No probe needed — onLoad handler on each img populates loadedSet

  // ── Label click handler — coords relative to ACTUAL image pixels ──────────
  const handleImageClick = (e) => {
    if (!labelMode || !imgRef.current) return;
    const ir = imgRef.current.getBoundingClientRect();
    const natW = imgRef.current.naturalWidth  > 0 ? imgRef.current.naturalWidth  : imgRef.current.getBoundingClientRect().width;
    const natH = imgRef.current.naturalHeight > 0 ? imgRef.current.naturalHeight : imgRef.current.getBoundingClientRect().height;
    const scale = Math.min(ir.width / natW, ir.height / natH);
    const ow = natW * scale;
    const oh = natH * scale;
    // Top-left of actual rendered pixels within the element
    const pxLeft = ir.left + (ir.width  - ow) / 2;
    const pxTop  = ir.top  + (ir.height - oh) / 2;
    const x = parseFloat(((e.clientX - pxLeft) / ow * 100).toFixed(1));
    const y = parseFloat(((e.clientY - pxTop)  / oh * 100).toFixed(1));
    if (x < 0 || x > 100 || y < 0 || y > 100) return;
    setPendingClick({ x, y });
    setPendingText('');
  };

  const saveLabel = () => {
    if (!pendingClick || !pendingText.trim()) { setPendingClick(null); return; }
    const key = `${selectedJoint}_${currentSlice}`;
    setUserLabels(prev => ({ ...prev, [key]: [...(prev[key] || []), [pendingClick.x, pendingClick.y, pendingText.trim()]] }));
    setPendingClick(null); setPendingText('');
  };

  const deleteLabel = (key, i) => {
    setUserLabels(prev => { const arr = [...(prev[key] || [])]; arr.splice(i, 1); return { ...prev, [key]: arr }; });
  };

  const exportLabels = () => {
    const blob = new Blob([JSON.stringify(userLabels, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'atlas_labels.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const currentLabelKey = `${selectedJoint}_${currentSlice}`;
  const currentLabels = userLabels[currentLabelKey] || [];
  const totalLabels = Object.values(userLabels).reduce((s, arr) => s + arr.length, 0);

  // Permanent baked-in labels — T1 pelvis only
  const allPermanentLabels = (seqData?.permanentLabels && currentSlice != null)
    ? (seqData.permanentLabels[currentSlice] || []) : [];

  const getLabelLayer = (name) => {
    const n = name.toLowerCase();
    if (/tunnel|canal|notch|recess|foramen|fossa|alcock|hunter|spinoglenoid|suprascapular notch|cubital tunnel|carpal tunnel|guyon|bursa|quadrilateral space|biceps groove|cyst|\bspace\b|sinus tarsi|inframalleolar|retromalleolar/.test(n)) return 'spaces';
    // Cartilage before joints — prevents "tibiofemoral compartment cartilage" matching the joints rule
    // Includes patellar/trochlear facets (articular surfaces) but excludes trochanter/tuberosity facets (tendon footprints) and fibrocartilage
    if (/patellar facet|facet of the patella|trochlear facet|trochlear groove|compartment cartilage|condyle cartilage|articular cartilage|glenoid cartilage|humeral head cartilage|radiocapitellar cartilage|ulnohumeral.*cartilage|\bcartilage\b/.test(n) && !/trochanter|tuberosity|fibrocartilage|triangular/.test(n)) return 'cartilage';
    if (/\bjoint\b(?!.*capsule)|ac joint|si joint|acromioclavicular|glenohumeral|sacroiliac|radiocarpal|midcarpal|lisfranc joint|patellofemoral|tibiofibular joint|tibiotalar|subtalar|facet joint/.test(n)) return 'joints';
    if (/nerve|plexus|nvb|ganglion|cutaneous nerve|antebrachial|brachial plexus/.test(n)) return 'nerves';
    if (/artery|femoral art|iliac a|neurovascular bundle/.test(n)) return 'arteries';
    if (/vein|saphenous|femoral vein|iliac v/.test(n)) return 'veins';
    // Ligaments before bones — prevents "intermalleolar ligament", "deltoid (tibiocalcaneal...)" matching bone keywords
    if (/ligament|ligamentous|sacrospinous|sacrotuberous|aponeurosis|osbourne|lacertus|retinaculum|coracoclavicular|coracoacromial|ucl|lcl|acl|pcl|mcl|collateral|annular|labrum|labral|anchor|fascia|capsule|\btfc\b|central disc|subsheath|meniscus|meniscal|intermeniscal|popliteomeniscal|popliteofibular|fabellofibular|anterolateral|meniscocapsular|root ligament|fat pad|plica|hoffa|prefemoral|suprapatellar|infrapatellar|footprint|\bband\b|white.*zone|red.*zone|zone.*white|zone.*red|\batfl\b|\bptfl\b|\bcfl\b|deltoid|interosseous membrane|lisfranc/.test(n)) return 'ligaments';
    if (/sacrum|ilium|iliac bone|femur|acetabulum|trochanter|coccyx|symphysis|ramus|tubercle|tuberosity|asis|aiis|intertrochanteric|pubic|humerus|\bradius\b|\bulna\b|ulnar styloid|ulnar groove|radial tuberosity|olecranon|capitellum|trochlea|epicondyle|sublime tubercle|glenoid|acromion|clavicle|\bscapula\b|scapular spine|coracoid|coracoid process|humeral head|femoral head|femoral neck|femoral diaphysis|vertebra|vertebral body|\bL[1-5]\b|\bS[1-5]\b|\bC[1-7]\b|ischial tuberosity|pubic bone|iliac crest|scaphoid|lunate|triquetrum|pisiform|capitate|hamate|trapezium|trapezoid|metacarpal|lister|epiphysis|metaphysis|diaphysis|physis|plateau|tibial tubercle|tibial spine|femoral trochlea|\bpatella\b|\bfibula\b|\btibia\b|\bfemur\b|talar|talus|\bnavicular\b|\bcalcaneus\b|calcaneal|malleolus|malleolar|\bplafond\b|sustentaculum|metatarsal|cuneiform|\bcuboid\b/.test(n)) return 'bones';
    return 'muscles';
  };

  const colorMap = { nerves:'#facc15', muscles:'#f97316', arteries:'#ef4444', veins:'#60a5fa', bones:'#ffffff', ligaments:'#d1d5db', joints:'#34d399', spaces:'#c084fc', cartilage:'#67e8f9' };

  const permanentLabels = allPermanentLabels.filter(([,,name]) => (visibleLayers[getLabelLayer(name)] ?? true));

  // Sort labels by Y position for vertical alignment with dots
  const sidebarLabels = permanentLabels.slice().sort((a, b) => a[1] - b[1]);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'8px' }}>
      <div style={{ background:'#0f172a',borderRadius:16,width:'min(99vw,1600px)',height:'min(96vh,1000px)',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#1e3a5f,#1d4ed8)',padding:'10px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:16 }}>🔬</span>
            <span style={{ color:'white',fontWeight:800,fontSize:13,letterSpacing:'0.08em' }}>ANATOMY ATLAS — MRI</span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',borderRadius:8,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600 }}>✕</button>
        </div>

        <div style={{ display:'flex',flex:1,overflow:'hidden',minHeight:0 }}>

          {/* Col 1 — joint selector */}
          <div style={{ width:140,borderRight:'1px solid #1e293b',padding:10,display:'flex',flexDirection:'column',gap:5,overflowY:'auto',background:'#0f172a',flexShrink:0 }}>
            <p style={{ fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'0 0 3px' }}>Region</p>
            <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}
              style={{ width:'100%',padding:'5px 7px',border:'1px solid #334155',borderRadius:5,fontSize:10,background:'#1e293b',color:'#e2e8f0' }}>
              {Object.keys(ATLAS_REGIONS_MAP).map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <p style={{ fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'8px 0 3px' }}>Joint</p>
            {Object.entries(regionJoints).map(([k, v]) => (
              <button key={k} onClick={() => setSelectedJoint(k)}
                style={{ padding:'6px 8px',borderRadius:6,border:'1px solid '+(selectedJoint===k?'#3b82f6':'#334155'),background:selectedJoint===k?'#1e3a5f':'#1e293b',color:selectedJoint===k?'#93c5fd':'#94a3b8',fontSize:11,fontWeight:selectedJoint===k?700:400,cursor:'pointer',textAlign:'left' }}>
                {v.label}
              </button>
            ))}

            {/* Layer toggles */}
            <p style={{ fontSize:9,fontWeight:700,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.08em',margin:'12px 0 4px' }}>Labels</p>
            <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
              <button onClick={() => setVisibleLayers({ nerves:true,muscles:true,tendons:true,arteries:true,veins:true,bones:true,ligaments:true,joints:true,spaces:true,cartilage:true })}
                style={{ padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:700,border:'1px solid #475569',background:'#1e293b',color:'#94a3b8',cursor:'pointer',textAlign:'left' }}>All On</button>
              <button onClick={() => setVisibleLayers({ nerves:false,muscles:false,tendons:false,arteries:false,veins:false,bones:false,ligaments:false,joints:false,spaces:false,cartilage:false })}
                style={{ padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:700,border:'1px solid #475569',background:'#1e293b',color:'#94a3b8',cursor:'pointer',textAlign:'left' }}>All Off</button>
              {[
                {key:'nerves',    label:'Nerves',    color:'#facc15'},
                {key:'muscles',   label:'Muscles',   color:'#f97316'},
                {key:'arteries',  label:'Arteries',  color:'#ef4444'},
                {key:'veins',     label:'Veins',     color:'#60a5fa'},
                {key:'bones',     label:'Bones',     color:'#e2e8f0'},
                {key:'joints',    label:'Joints',    color:'#34d399'},
                {key:'cartilage', label:'Cartilage', color:'#67e8f9'},
                {key:'ligaments', label:'Ligaments', color:'#a3e635'},
                {key:'spaces',    label:'Spaces',    color:'#c084fc'},
              ].map(({key,label,color}) => (
                <button key={key} onClick={() => setVisibleLayers(prev => ({...prev,[key]:!prev[key]}))}
                  style={{ padding:'5px 10px',borderRadius:6,fontSize:11,fontWeight:700,border:'1px solid '+color,background:visibleLayers[key]?color+'33':'transparent',color:visibleLayers[key]?color:'#475569',cursor:'pointer',textAlign:'left' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Col 2+3 — IMAGE + SIDEBAR in a shared flex row with SVG leader lines */}
          <div style={{ flex:1,display:'flex',flexDirection:'row',overflow:'hidden',position:'relative' }}>

          {/* Col 2 — IMAGE */}
          <div ref={imgContainerRef}
            style={{ flex:'1 1 0',minWidth:0,display:'flex',flexDirection:'column',background:'#020617',overflow:'hidden',position:'relative' }}>

            {/* Sequence toggle */}
            {jointData?.sequences && (
              <div style={{ display:'flex',gap:4,padding:'5px 12px',background:'#0a0f1a',borderBottom:'1px solid #1e293b',flexShrink:0 }}>
                <span style={{ fontSize:9,color:'#475569',fontWeight:600,alignSelf:'center',marginRight:4 }}>SEQUENCE:</span>
                {Object.entries(jointData.sequences).map(([key, sq]) => (
                  <button key={key} onClick={() => { setSequence(key); sequenceRef.current = key; }}
                    style={{ padding:'3px 10px',borderRadius:5,border:'1px solid '+(sequence===key?'#3b82f6':'#334155'),background:sequence===key?'#1d4ed8':'#1e293b',color:sequence===key?'white':'#64748b',fontSize:10,fontWeight:sequence===key?700:400,cursor:'pointer',display:'flex',alignItems:'center',gap:5 }}>
                    {sq.label}
                    {!sq.permanentLabels && (
                      <span style={{ fontSize:8,fontWeight:700,color:'#f59e0b',background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.4)',borderRadius:3,padding:'1px 4px',letterSpacing:'0.04em' }}>LABELS PENDING</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Slice navigator */}
            {jointData && (
              <div style={{ display:'flex',alignItems:'center',gap:6,padding:'6px 12px',background:'#0f172a',borderBottom:'1px solid #1e293b',flexShrink:0 }}>
                <button onClick={() => { setSliceIdx(i => Math.max(0,i-1)); }} disabled={sliceIdx===0}
                  style={{ background:sliceIdx===0?'#1e293b':'#1d4ed8',border:'none',color:'white',borderRadius:5,width:24,height:24,cursor:sliceIdx===0?'default':'pointer',fontSize:14,fontWeight:700,opacity:sliceIdx===0?0.4:1,flexShrink:0 }}>‹</button>
                <div style={{ flex:1,display:'flex',alignItems:'center',gap:6 }}>
                  <input type="range" min={0} max={activeSlices.length-1} value={sliceIdx}
                    onChange={e => { setSliceIdx(Number(e.target.value)); }}
                    style={{ flex:1,accentColor:'#3b82f6',cursor:'pointer' }} />
                  <span style={{ color:'#93c5fd',fontSize:10,fontWeight:700,whiteSpace:'nowrap',background:'#1e293b',padding:'2px 7px',borderRadius:4,border:'1px solid #3b82f6',minWidth:52,textAlign:'center' }}>
                    {sliceIdx+1} / {activeSlices.length}
                  </span>
                </div>
                <button onClick={() => { setSliceIdx(i => Math.min(activeSlices.length-1,i+1)); }} disabled={sliceIdx===activeSlices.length-1}
                  style={{ background:sliceIdx===activeSlices.length-1?'#1e293b':'#1d4ed8',border:'none',color:'white',borderRadius:5,width:24,height:24,cursor:sliceIdx===activeSlices.length-1?'default':'pointer',fontSize:14,fontWeight:700,opacity:sliceIdx===activeSlices.length-1?0.4:1,flexShrink:0 }}>›</button>
              </div>
            )}

            {/* Image area — click handler here so coords are relative to image area only */}
            <div ref={imgAreaRef} onClick={handleImageClick}
              style={{ flex:'1 1 0',minHeight:0,position:'relative',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:labelMode?'crosshair':'default' }}>
              {!imgLoaded && !imgError && (
                <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:10,color:'#475569',zIndex:2 }}>
                  <div style={{ width:32,height:32,border:'3px solid #1d4ed8',borderTop:'3px solid transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite' }}/>
                  <span style={{ fontSize:11 }}>Loading…</span>
                </div>
              )}
              {imgError && (
                <div style={{ color:'#ef4444',fontSize:12,textAlign:'center',padding:16 }}>
                  <div style={{ fontSize:28,marginBottom:6 }}>⚠️</div>
                  <div>Image unavailable — Slice {currentSlice}</div>
                </div>
              )}
              {/* Pre-render all slices — visible one shows instantly from cache, others hidden */}
              {activeSlices.map((sl, i) => {
                const url = seqData
                  ? `${seqData.path}${seqData.pad===0?sl:String(sl).padStart(seqData.pad||3,'0')}${seqData.ext}`
                  : jointData?.useLocalMRI
                    ? `${jointData.localPath}${String(sl).padStart(3,'0')}${jointData.localExt||'.webp'}`
                    : `${VHP_BASE}/${jointData.folder}/a_vm${sl}.png`;
                const isActive = i === sliceIdx;
                return (
                  <img key={url} src={url}
                    ref={isActive ? imgRef : null}
                    onLoad={() => {
                      setLoadedSet(prev => { const n = new Set(prev); n.add(url); return n; });
                      if (isActive) requestAnimationFrame(() => setRenderTick(t => t+1));
                    }}
                    onError={() => { if (isActive) setImgError(true); }}
                    style={{ width:'100%',height:'100%',objectFit:'contain',
                      display: isActive ? 'block' : 'none',
                      position:'absolute', inset:0, borderRadius:4, userSelect:'none' }}
                    loading="eager"
                    decoding="async"
                    alt={`Slice ${sl}`}
                  />
                );
              })}

              {/* DOTS ONLY on image — no text labels */}
              {/* Single SVG overlay — dots + lines + labels all in one coordinate space */}
              {imgLoaded && imgRef.current && imgAreaRef.current && renderTick >= 0 && (() => {
                const imgEl = imgRef.current;
                const ar  = imgAreaRef.current.getBoundingClientRect();
                const ir  = imgEl.getBoundingClientRect();
                // Labels were recorded as % of the rendered image pixels.
                // Use naturalWidth/Height to compute true rendered rect inside objectFit:contain.
                // Guard against natW/natH = 0 (image not yet decoded) — fall back to element size.
                const natW = imgEl.naturalWidth  > 0 ? imgEl.naturalWidth  : ir.width;
                const natH = imgEl.naturalHeight > 0 ? imgEl.naturalHeight : ir.height;
                const scale = Math.min(ir.width / natW, ir.height / natH);
                const ow = natW * scale;
                const oh = natH * scale;
                if (!ow || !oh || !isFinite(ow) || !isFinite(oh)) return null;
                // Offset of rendered image pixels within the container
                const ol = (ir.left - ar.left) + (ir.width  - ow) / 2;
                const ot = (ir.top  - ar.top)  + (ir.height - oh) / 2;
                return (
                  <svg style={{ position:'absolute', left:ol, top:ot, width:ow, height:oh, pointerEvents:'none', overflow:'visible' }}
                    viewBox={`0 0 ${ow} ${oh}`}>

                    {/* Permanent labels — evenly spaced vertically to prevent overlap */}
                    {(() => {
                      const fontSize = Math.max(10, Math.min(13, ow / 60));
                      const lineH = fontSize + 5; // min spacing between label rows
                      const n = permanentLabels.length;
                      if (n === 0) return null;
                      const labelRight = seqData?.labelSide === 'right';
                      // Sort by Y so labels roughly follow anatomy top-to-bottom
                      const sorted = permanentLabels.map(([x,y,name],origIdx) => ({x,y,name,origIdx}))
                        .sort((a,b) => a.y - b.y);
                      // Distribute label Y positions evenly across image height
                      // with a small top/bottom margin
                      const topMargin = fontSize;
                      const botMargin = fontSize;
                      const spread = oh - topMargin - botMargin;
                      return sorted.map(({x, y, name, origIdx}, i) => {
                        const col = colorMap[getLabelLayer(name)] || '#ffffff';
                        const px = (x / 100) * ow;
                        const py = (y / 100) * oh; // dot stays at true position
                        // Text Y: evenly distributed
                        const ty = n === 1 ? oh / 2 : topMargin + (i / (n - 1)) * spread;
                        const textX = 8;
                        const maxLabelW = ow * 0.38; // max label area = 38% of image width
                        const lineStartX = Math.min(textX + name.length * fontSize * 0.62 + 4, maxLabelW);
                        const jogX = Math.min(lineStartX + 20, px - 4);
                        if (labelRight) {
                          const textXr = ow - 8;
                          const maxLabelWr = ow * 0.38;
                          const lineStartXr = Math.max(ow - (name.length * fontSize * 0.62 + 12), ow - maxLabelWr);
                          const jogXr = Math.max(lineStartXr - 20, px + 4);
                          return (
                            <g key={'p'+origIdx}>
                              <circle cx={px} cy={py} r="4" fill={col} opacity="0.95"
                                stroke="rgba(0,0,0,0.7)" strokeWidth="1"/>
                              <polyline
                                points={`${lineStartXr},${ty} ${jogXr},${ty} ${jogXr},${py} ${px+1},${py}`}
                                fill="none" stroke={col} strokeWidth="0.9" opacity="0.65"/>
                              <text x={textXr} y={ty} fontSize={fontSize} fill="rgba(0,0,0,0.9)"
                                fontFamily="system-ui,sans-serif" fontWeight="700"
                                textAnchor="end" dominantBaseline="middle" dx="1" dy="1">{name}</text>
                              <text x={textXr} y={ty} fontSize={fontSize} fill={col}
                                fontFamily="system-ui,sans-serif" fontWeight="700"
                                textAnchor="end" dominantBaseline="middle">{name}</text>
                            </g>
                          );
                        }
                        return (
                          <g key={'p'+origIdx}>
                            <circle cx={px} cy={py} r="4" fill={col} opacity="0.95"
                              stroke="rgba(0,0,0,0.7)" strokeWidth="1"/>
                            <polyline
                              points={`${lineStartX},${ty} ${jogX},${ty} ${jogX},${py} ${px-1},${py}`}
                              fill="none" stroke={col} strokeWidth="0.9" opacity="0.65"/>
                            <text x={textX} y={ty} fontSize={fontSize} fill="rgba(0,0,0,0.9)"
                              fontFamily="system-ui,sans-serif" fontWeight="700"
                              textAnchor="start" dominantBaseline="middle" dx="1" dy="1">{name}</text>
                            <text x={textX} y={ty} fontSize={fontSize} fill={col}
                              fontFamily="system-ui,sans-serif" fontWeight="700"
                              textAnchor="start" dominantBaseline="middle">{name}</text>
                          </g>
                        );
                      });
                    })()}

                    {/* User label dots */}
                    {currentLabels.map(([x, y, text], li) => {
                      const px = (x / 100) * ow;
                      const py = (y / 100) * oh;
                      const textXu = 10; const lineStartXu = textXu + (text.length * 7.2 + 4);
                      const fontSize = Math.max(10, Math.min(13, ow / 60));
                      return (
                        <g key={'u'+li}>
                          <circle cx={px} cy={py} r="5" fill="#facc15" opacity="0.95"
                            stroke="rgba(0,0,0,0.7)" strokeWidth="1.5"/>
                          <line x1={lineStartXu} y1={py} x2={px-5} y2={py}
                            stroke="#facc15" strokeWidth="1" opacity="0.7"/>
                          <text x={textXu} y={py} fontSize={fontSize} fill="rgba(0,0,0,0.85)"
                            fontFamily="system-ui,sans-serif" fontWeight="700"
                            textAnchor="start" dominantBaseline="middle" dx="1" dy="1">{text}</text>
                          <text x={textXu} y={py} fontSize={fontSize} fill="#facc15"
                            fontFamily="system-ui,sans-serif" fontWeight="700"
                            textAnchor="start" dominantBaseline="middle">{text}</text>
                        </g>
                      );
                    })}

                    {/* Pending click dot */}
                    {pendingClick && (
                      <circle
                        cx={(pendingClick.x/100)*ow}
                        cy={(pendingClick.y/100)*oh}
                        r="6" fill="#facc15" opacity="0.95"
                        stroke="white" strokeWidth="2"/>
                    )}
                  </svg>
                );
              })()}

              {labelMode && imgLoaded && !pendingClick && (
                <div style={{ position:'absolute',bottom:6,left:'50%',transform:'translateX(-50%)',background:'rgba(250,204,21,0.15)',border:'1px solid #facc15',borderRadius:5,padding:'3px 8px',pointerEvents:'none' }}>
                  <span style={{ fontSize:9,color:'#facc15',fontWeight:600 }}>Click a structure to label it</span>
                </div>
              )}

{/* Label input moved to sidebar — no overlap with image */}
            </div>

            {/* Bottom bar */}
            <div style={{ padding:'5px 12px',background:'#0f172a',borderTop:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0 }}>
              <span style={{ fontSize:9,color:'#64748b',fontStyle:'italic' }}>{jointData?.view || ''}</span>
              <div style={{ display:'flex',gap:6 }}>
                <button onClick={() => { setLabelMode(m => !m); setPendingClick(null); }}
                  style={{ padding:'3px 9px',borderRadius:5,border:'1px solid '+(labelMode?'#facc15':'#334155'),background:labelMode?'rgba(250,204,21,0.12)':'transparent',color:labelMode?'#facc15':'#64748b',fontSize:9,fontWeight:700,cursor:'pointer' }}>
                  {labelMode ? '✏️ Labeling ON' : '✏️ Label'}
                </button>
                {totalLabels > 0 && (
                  <button onClick={exportLabels}
                    style={{ padding:'3px 9px',borderRadius:5,border:'1px solid #22c55e',background:'rgba(34,197,94,0.1)',color:'#22c55e',fontSize:9,fontWeight:700,cursor:'pointer' }}>
                    Export JSON ({totalLabels})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Col 3 — LABEL SIDEBAR with Y-aligned labels + leader lines */}
          <div style={{ flex:'0 0 180px',width:180,background:'#000000',borderLeft:'1px solid #1e293b',display:'flex',flexDirection:'column',overflow:'hidden',position:'relative' }}>
          {jointData?.isBrachialPlexus && (
            <div style={{ overflowY:'auto',padding:'10px 8px',display:'flex',flexDirection:'column',gap:2,height:'100%' }}>
              <div style={{ fontSize:9,fontWeight:800,letterSpacing:'0.12em',color:'#60a5fa',textTransform:'uppercase',marginBottom:8,paddingBottom:5,borderBottom:'1px solid #1e293b' }}>Key</div>
              {[
                { section:'Roots', color:'#60a5fa', items:[['C5–T1','Nerve roots']] },
                { section:'Trunks', color:'#60a5fa', items:[['UT','Upper trunk'],['MT','Middle trunk'],['LT','Lower trunk']] },
                { section:'Divisions', color:'#94a3b8', items:[['A','Anterior div.'],['P','Posterior div.']] },
                { section:'Cords', color:'#a78bfa', items:[['LC','Lateral cord'],['PC','Posterior cord'],['MC','Medial cord']] },
                { section:'Terminal', color:'#4ade80', items:[['MCN','Musculocutaneous'],['AN','Axillary'],['RN','Radial'],['UN','Ulnar'],['MN','Median']] },
              ].map(({section,color,items}) => (
                <div key={section} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:8,fontWeight:700,letterSpacing:'0.1em',color:'#475569',textTransform:'uppercase',marginBottom:4 }}>{section}</div>
                  {items.map(([abbr,full]) => (
                    <div key={abbr} style={{ display:'flex',gap:5,alignItems:'baseline',marginBottom:4,paddingLeft:2 }}>
                      <span style={{ fontSize:11,fontWeight:800,color,minWidth:34,flexShrink:0 }}>{abbr}</span>
                      <span style={{ fontSize:10,color:'#94a3b8',lineHeight:1.3 }}>{full}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {!jointData?.isBrachialPlexus && (<>

            {/* Label input at top when in label mode */}
            {pendingClick && (
              <div style={{ padding:'8px 10px',background:'#1e3a5f',borderBottom:'2px solid #3b82f6',flexShrink:0,zIndex:10 }}>
                <p style={{ margin:'0 0 5px',fontSize:10,color:'#93c5fd',fontWeight:700 }}>
                  📍 Name this structure
                </p>
                <input autoFocus value={pendingText} onChange={e => setPendingText(e.target.value)}
                  onKeyDown={e => { if (e.key==='Enter') saveLabel(); if (e.key==='Escape') setPendingClick(null); }}
                  placeholder="e.g. sciatic nerve"
                  style={{ width:'100%',padding:'5px 8px',background:'#0f172a',border:'1px solid #3b82f6',borderRadius:5,color:'#e2e8f0',fontSize:11,outline:'none',boxSizing:'border-box',marginBottom:5 }}/>
                <div style={{ display:'flex',gap:4 }}>
                  <button onClick={saveLabel} style={{ flex:1,padding:'4px',background:'#1d4ed8',border:'none',borderRadius:4,color:'white',fontSize:10,fontWeight:700,cursor:'pointer' }}>Save</button>
                  <button onClick={() => setPendingClick(null)} style={{ flex:1,padding:'4px',background:'#334155',border:'none',borderRadius:4,color:'#94a3b8',fontSize:10,cursor:'pointer' }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Labels drawn on image — sidebar just shows count + delete for user labels */}
            <div style={{ flex:1,overflowY:'auto',padding:'4px 0' }}>
              {sidebarLabels.length > 0 && (
                <div style={{ padding:'6px 10px',color:'#334155',fontSize:9 }}>
                  {sidebarLabels.length} structure{sidebarLabels.length!==1?'s':''} labeled
                </div>
              )}
              {currentLabels.map(([x,y,text], i) => (
                <div key={'u'+i} style={{ display:'flex',alignItems:'center',gap:6,padding:'3px 10px' }}>
                  <div style={{ width:6,height:6,borderRadius:'50%',background:'#facc15',flexShrink:0 }}/>
                  <span style={{ flex:1,fontSize:10,color:'#facc15',fontWeight:500 }}>{text}</span>
                  <button onClick={() => deleteLabel(currentLabelKey, i)}
                    style={{ background:'none',border:'none',color:'#ef4444',cursor:'pointer',fontSize:10,padding:0 }}>✕</button>
                </div>
              ))}
            </div>

            {/* Export button at bottom */}
            {totalLabels > 0 && (
              <div style={{ padding:'6px 10px',borderTop:'1px solid #1e293b',flexShrink:0 }}>
                <button onClick={exportLabels}
                  style={{ width:'100%',padding:'4px',borderRadius:5,border:'1px solid #22c55e',background:'rgba(34,197,94,0.1)',color:'#22c55e',fontSize:9,fontWeight:700,cursor:'pointer' }}>
                  Export JSON ({totalLabels})
                </button>
              </div>
            )}
          </>)}
          </div>

          </div>{/* end Col 2+3 wrapper */}

        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// ─── RESEARCH POSTS ────────────────────────────────────────────────────────
// Add new posts to the TOP of this array. Each old post moves down automatically.
// Fields: date, title, journal, citation, summary (array of bullet strings),
//         keyTakeaway, link (optional DOI/PubMed URL), tags (array of strings)
const RESEARCH_POSTS = [
  {
    date: 'May 25, 2026',
    title: 'Example Post — Replace With Your First Article Review',
    journal: 'Journal Name · Year',
    citation: 'Author A, Author B, et al. Full article title here. Journal. Year;Vol(Issue):Pages.',
    summary: [
      'Study design and population: describe the cohort, imaging modality, and primary objective.',
      'Key finding 1: the most important result with numbers where relevant.',
      'Key finding 2: secondary findings or subgroup analysis.',
      'Methodology note: anything notable about the technique, grading system, or statistical approach.',
    ],
    keyTakeaway: 'One sentence distilling the clinical bottom line — what this changes or confirms in your practice.',
    link: 'https://scholar.google.com/scholar?q=replace+with+article+title',
    tags: ['Knee', 'Cartilage', 'MRI'],
  },
];

// ─── SUPABASE CLIENT (lazy, no extra package needed) ────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getSupabase = (accessToken) => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) return null;
  // Use user JWT if provided (required for RLS policies that check auth.uid())
  const authHeader = accessToken ? `Bearer ${accessToken}` : `Bearer ${key}`;
  const headers = { 'Content-Type':'application/json', apikey:key, Authorization:authHeader };
  return {
    from: (table) => ({
      select: (cols='*') => ({
        eq: (col, val) => ({
          order: (col2, opts={}) => fetch(`${SUPABASE_URL}/rest/v1/${table}?select=${cols}&${col}=eq.${encodeURIComponent(val)}&order=${col2}.${opts.ascending===false?'desc':'asc'}`, { headers }).then(r=>r.json()),
        }),
      }),
      insert: (row) => fetch(`${SUPABASE_URL}/rest/v1/${table}`, { method:'POST', headers:{...headers,'Prefer':'return=representation'}, body:JSON.stringify(row) }).then(async r=>{ const d=await r.json(); if(!r.ok) throw new Error(JSON.stringify(d)); return d; }),
      delete: () => ({
        eq: (col, val) => fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}`, { method:'DELETE', headers }).then(r => r.status === 204 ? null : r.json()),
      }),
    }),
  };
};


// ─── ARTICLE LIKES ───────────────────────────────────────────────────────────
function ArticleLikes({ postIdx }) {
  const [likes, setLikes] = useState(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const storageKey = `liked_post_${postIdx}`;
  // Use a stable fingerprint: storageKey value stored at like-time
  const fingerprint = storageKey;

  const fetchCount = () => {
    // Fetch all rows for this post and count them — simplest approach with our minimal client
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) { setLikes(0); return; }
    fetch(`${SUPABASE_URL}/rest/v1/article_likes?select=id&post_idx=eq.${postIdx}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
      .then(r => r.json())
      .then(data => setLikes(Array.isArray(data) ? data.length : 0))
      .catch(() => setLikes(0));
  };

  useEffect(() => {
    try { setHasLiked(!!localStorage.getItem(storageKey)); } catch {}
    fetchCount();
  }, [postIdx]);

  const handleLike = async () => {
    if (animating) return;
    setAnimating(true);
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) { setTimeout(() => setAnimating(false), 400); return; }
    const headers = { 'Content-Type':'application/json', apikey:key, Authorization:`Bearer ${key}` };

    if (hasLiked) {
      try {
        // Delete by fingerprint column
        await fetch(`${SUPABASE_URL}/rest/v1/article_likes?post_idx=eq.${postIdx}&fingerprint=eq.${encodeURIComponent(fingerprint)}`, {
          method: 'DELETE', headers,
        });
        setHasLiked(false);
        localStorage.removeItem(storageKey);
        setLikes(l => Math.max(0, (l || 1) - 1));
      } catch {}
    } else {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/article_likes`, {
          method: 'POST',
          headers: { ...headers, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ post_idx: postIdx, fingerprint, created_at: new Date().toISOString() }),
        });
        setHasLiked(true);
        localStorage.setItem(storageKey, '1');
        setLikes(l => (l || 0) + 1);
      } catch {}
    }
    // Re-fetch true count from DB after a short delay
    setTimeout(() => { fetchCount(); setAnimating(false); }, 600);
  };

  return (
    <button onClick={handleLike}
      style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'5px 12px',borderRadius:20,border:'1px solid',
        borderColor: hasLiked ? 'rgba(239,68,68,0.5)' : '#1e3a5f',
        background: hasLiked ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)',
        color: hasLiked ? '#f87171' : '#475569',
        cursor:'pointer', fontSize:12, fontWeight:600,
        transform: animating ? 'scale(1.2)' : 'scale(1)',
        transition:'all 0.15s ease',
        userSelect:'none' }}>
      <span style={{ fontSize:14, lineHeight:1 }}>{hasLiked ? '❤️' : '🤍'}</span>
      <span>{likes === null ? '…' : likes}</span>
    </button>
  );
}

// ─── COMMENT SECTION (per article) ──────────────────────────────────────────
function ArticleComments({ postIdx, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setLoading(true);
    setComments([]);
    // Pass user token if available so RLS authenticated read policy passes
    const sb = getSupabase(currentUser?.access_token);
    if (!sb) { setLoading(false); return; }
    sb.from('article_comments').select('*').eq('post_idx', postIdx).order('created_at', { ascending:true })
      .then(data => {
        setComments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load comments:', err);
        setLoading(false);
      });
  }, [postIdx, currentUser?.access_token]);

  const submit = async () => {
    if (!text.trim() || !currentUser) return;
    setSubmitting(true); setError('');
    try {
      // Moderation check — fail CLOSED
      try {
        const modRes = await fetch('/api/moderate-comment', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ text: text.trim() }),
          cache: 'no-store',
        });
        if (!modRes.ok) {
          setError(`Moderation unavailable (${modRes.status}). Please try again.`);
          setSubmitting(false); return;
        }
        const modData = await modRes.json();
        if (modData.blocked) {
          setError(modData.reason || 'Comment not allowed. Please keep discussion professional and on-topic.');
          setSubmitting(false); return;
        }
      } catch (modErr) {
        setError('Moderation service unavailable. Please try again.');
        setSubmitting(false); return;
      }

      // Save to Supabase — pass user JWT so RLS policy (auth.uid() = user_id) passes
      const sb = getSupabase(currentUser.access_token);
      const result = await sb.from('article_comments').insert({
        post_idx: postIdx,
        user_id: currentUser.id,
        user_email: currentUser.email,
        body: text.trim(),
        created_at: new Date().toISOString(),
      });
      const saved = Array.isArray(result) ? result[0] : null;
      if (saved) { setComments(prev => [...prev, saved]); setText(''); setShowForm(false); }
      else setError('Failed to save. Please try again.');
    } catch (e) { setError('Failed to post comment. Please try again.'); }
    setSubmitting(false);
  };

  const deleteComment = async (id) => {
    try {
      const sb = getSupabase(currentUser?.access_token);
      await sb.from('article_comments').delete().eq('id', id);
    } catch (e) { console.error('Delete failed:', e); }
    // Optimistically remove from UI regardless
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const fmt = (iso) => { try { return new Date(iso).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}); } catch { return ''; } };

  return (
    <div style={{ marginTop:14,borderTop:'1px solid #1e3a5f',paddingTop:12,display:'flex',flexDirection:'column',gap:8 }}>

      {/* Header row */}
      <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
        <span style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em' }}>
          💬 Discussion {comments.length > 0 && `(${comments.length})`}
        </span>
        {currentUser && (
          <button onClick={() => { setShowForm(f=>!f); setError(''); setText(''); }}
            style={{ fontSize:10,fontWeight:600,color:'#059669',background:'rgba(5,150,105,0.1)',border:'1px solid rgba(5,150,105,0.25)',borderRadius:6,padding:'3px 9px',cursor:'pointer' }}>
            {showForm ? 'Cancel' : '+ Add Comment'}
          </button>
        )}
      </div>

      {/* Scrollable comments list */}
      {loading ? (
        <div style={{ fontSize:11,color:'#475569',padding:'4px 0' }}>Loading…</div>
      ) : (
        <div style={{ overflowY:'auto',maxHeight:160,display:'flex',flexDirection:'column',gap:7,paddingRight:4,flexShrink:0 }}>
          {comments.map(c => (
            <div key={c.id} style={{ background:'rgba(255,255,255,0.03)',border:'1px solid #1e3a5f',borderRadius:7,padding:'8px 11px',display:'flex',gap:8,alignItems:'flex-start',flexShrink:0 }}>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',gap:6,alignItems:'baseline',marginBottom:3,flexWrap:'wrap' }}>
                  <span style={{ fontSize:10,fontWeight:700,color:'#60a5fa' }}>{c.user_email?.split('@')[0] || 'User'}</span>
                  <span style={{ fontSize:9,color:'#334155' }}>{fmt(c.created_at)}</span>
                </div>
                <p style={{ fontSize:12,color:'#cbd5e1',lineHeight:1.6,margin:0 }}>{c.body}</p>
              </div>
              {currentUser?.id === c.user_id && (
                <button onClick={() => deleteComment(c.id)}
                  style={{ fontSize:9,color:'#475569',background:'none',border:'none',cursor:'pointer',flexShrink:0,padding:'2px 4px',borderRadius:4 }}
                  title="Delete your comment">✕</button>
              )}
            </div>
          ))}
          {comments.length === 0 && !showForm && (
            <p style={{ fontSize:11,color:'#334155',fontStyle:'italic',margin:0 }}>No comments yet. {currentUser ? 'Be the first.' : 'Sign in to comment.'}</p>
          )}
        </div>
      )}

      {/* New comment form — always fully visible below comments */}
      {showForm && currentUser && (
        <div style={{ display:'flex',flexDirection:'column',gap:6,flexShrink:0,borderTop:'1px solid #1e3a5f',paddingTop:8 }}>
          <textarea value={text} onChange={e=>setText(e.target.value)}
            placeholder="Share your clinical perspective or questions about this paper…"
            style={{ width:'100%',height:64,background:'#0f172a',border:'1px solid #334155',borderRadius:7,color:'#e2e8f0',fontSize:12,padding:'8px 10px',resize:'none',lineHeight:1.5,boxSizing:'border-box' }} />
          {error && <p style={{ fontSize:11,color:'#f87171',margin:0,lineHeight:1.4 }}>{error}</p>}
          <div style={{ display:'flex',gap:7,justifyContent:'flex-end' }}>
            <button onClick={() => { setShowForm(false); setError(''); setText(''); }}
              style={{ fontSize:11,color:'#64748b',background:'none',border:'1px solid #334155',borderRadius:6,padding:'5px 12px',cursor:'pointer' }}>Cancel</button>
            <button onClick={submit} disabled={submitting || !text.trim()}
              style={{ fontSize:11,fontWeight:700,color:'white',background:submitting||!text.trim()?'#1e3a5f':'#059669',border:'none',borderRadius:6,padding:'5px 14px',cursor:submitting||!text.trim()?'not-allowed':'pointer' }}>
              {submitting ? 'Checking…' : 'Post Comment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECOMMEND ARTICLE FORM ──────────────────────────────────────────────────
function RecommendArticleForm({ currentUser, onClose }) {
  const [form, setForm] = useState({ title:'', authors:'', journal:'', year:'', note:'' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const inp = { width:'100%', background:'#0f172a', border:'1px solid #334155', borderRadius:7, color:'#e2e8f0', fontSize:12, padding:'7px 10px', boxSizing:'border-box' };

  const submit = async () => {
    if (!form.title.trim() || !currentUser) return;
    setSubmitting(true); setError('');
    try {
      const sb = getSupabase(currentUser?.access_token);
      const result = await sb.from('article_recommendations').insert({
        user_id: currentUser.id,
        user_email: currentUser.email,
        title: form.title.trim(),
        authors: form.authors.trim(),
        journal: form.journal.trim(),
        year: form.year.trim(),
        note: form.note.trim(),
        created_at: new Date().toISOString(),
        status: 'pending',
      });
      if (Array.isArray(result) && result[0]) setDone(true);
      else setError('Failed to submit. Please try again.');
    } catch { setError('Network error. Please try again.'); }
    setSubmitting(false);
  };

  if (done) return (
    <div style={{ padding:'20px',textAlign:'center' }}>
      <div style={{ fontSize:28,marginBottom:8 }}>✅</div>
      <p style={{ color:'#a7f3d0',fontWeight:700,fontSize:14 }}>Recommendation submitted!</p>
      <p style={{ color:'#64748b',fontSize:12 }}>Thank you — it will be reviewed for inclusion.</p>
      <button onClick={onClose} style={{ marginTop:12,padding:'6px 18px',borderRadius:7,border:'none',background:'#059669',color:'white',fontWeight:700,fontSize:12,cursor:'pointer' }}>Close</button>
    </div>
  );

  return (
    <div style={{ padding:'16px 20px',display:'flex',flexDirection:'column',gap:10 }}>
      <div style={{ fontSize:13,fontWeight:700,color:'#e2e8f0',marginBottom:4 }}>📬 Recommend an Article</div>
      <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
        <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Article Title *</label>
        <input style={inp} value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Full article title" />
      </div>
      <div style={{ display:'flex',gap:8 }}>
        <div style={{ flex:2,display:'flex',flexDirection:'column',gap:5 }}>
          <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Authors</label>
          <input style={inp} value={form.authors} onChange={e=>set('authors',e.target.value)} placeholder="Author A, Author B, et al." />
        </div>
        <div style={{ flex:1,display:'flex',flexDirection:'column',gap:5 }}>
          <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Year</label>
          <input style={inp} value={form.year} onChange={e=>set('year',e.target.value)} placeholder="2024" maxLength={4} />
        </div>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
        <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Journal</label>
        <input style={inp} value={form.journal} onChange={e=>set('journal',e.target.value)} placeholder="e.g. Skeletal Radiology" />
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:5 }}>
        <label style={{ fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em' }}>Why relevant to MSK radiology?</label>
        <textarea style={{...inp,minHeight:60,resize:'vertical'}} value={form.note} onChange={e=>set('note',e.target.value)} placeholder="Brief note on clinical relevance or why this should be included…" />
      </div>
      {error && <p style={{ fontSize:11,color:'#f87171',margin:0 }}>{error}</p>}
      <div style={{ display:'flex',gap:8,justifyContent:'flex-end',marginTop:4 }}>
        <button onClick={onClose} style={{ fontSize:11,color:'#64748b',background:'none',border:'1px solid #334155',borderRadius:6,padding:'6px 14px',cursor:'pointer' }}>Cancel</button>
        <button onClick={submit} disabled={submitting || !form.title.trim()}
          style={{ fontSize:11,fontWeight:700,color:'white',background:submitting||!form.title.trim()?'#1e3a5f':'#059669',border:'none',borderRadius:6,padding:'6px 16px',cursor:submitting||!form.title.trim()?'not-allowed':'pointer' }}>
          {submitting ? 'Submitting…' : 'Submit Recommendation'}
        </button>
      </div>
    </div>
  );
}

// ─── RESEARCH MODAL ────────────────────────────────────────────────────────
// ─── MSK HUB DROPDOWN ────────────────────────────────────────────────────────
function MSKHubDropdown({ onOpenResearch, onOpenJobs, onOpenCme }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  return (
    <div ref={ref} style={{ position:'relative', display:'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(99,179,237,0.4)',background:'rgba(99,179,237,0.1)',color:'#90cdf4',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)',whiteSpace:'nowrap' }}>
        <span>🗂️</span> MSK Hub
      </button>
      {open && (
        <div style={{ position:'absolute',top:'calc(100% + 6px)',left:0,background:'#1a2332',border:'1px solid rgba(99,179,237,0.2)',borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,0.9)',zIndex:99999,minWidth:210,overflow:'hidden' }}>
          <button
            onClick={() => { setOpen(false); onOpenResearch(); }}
            style={{ display:'block',width:'100%',padding:'11px 18px',background:'transparent',border:'none',borderBottom:'1px solid rgba(99,179,237,0.08)',color:'#cbd5e0',fontSize:13,textAlign:'left',cursor:'pointer',transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(99,179,237,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            📰 Latest MSK Research
          </button>
          <button
            onClick={() => { setOpen(false); onOpenCme(); }}
            style={{ display:'block',width:'100%',padding:'11px 18px',background:'transparent',border:'none',borderBottom:'1px solid rgba(99,179,237,0.08)',color:'#cbd5e0',fontSize:13,textAlign:'left',cursor:'pointer',transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(99,179,237,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            🎓 CME Library
          </button>
          <button
            onClick={() => { setOpen(false); onOpenJobs(); }}
            style={{ display:'block',width:'100%',padding:'11px 18px',background:'transparent',border:'none',color:'#cbd5e0',fontSize:13,textAlign:'left',cursor:'pointer',transition:'background 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(99,179,237,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
            💼 Jobs Board
          </button>

        </div>
      )}
    </div>
  );
}

// ─── RESEARCH MODAL INNER ────────────────────────────────────────────────────
function ResearchModalInner({ currentUser }) {
  const [expanded, setExpanded] = useState(null);
  const [showRecommend, setShowRecommend] = useState(false);
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:0 }}>
      {showRecommend && (
        <div style={{ background:'#141f30',borderBottom:'1px solid #1e3a5f',marginBottom:16,borderRadius:10,overflow:'hidden' }}>
          <RecommendArticleForm currentUser={currentUser} onClose={() => setShowRecommend(false)} />
        </div>
      )}
      <div style={{ display:'flex',flexDirection:'column',gap:12 }}>
        {RESEARCH_POSTS.map((post, idx) => {
          const isOpen = expanded === idx;
          const isLatest = idx === 0;
          return (
            <div key={idx} style={{ background:isOpen?'#1e293b':'#141f30',border:'1px solid '+(isOpen?'#059669':'#1e3a5f'),borderRadius:12,overflow:'hidden',transition:'border-color 0.2s' }}>
              <div onClick={() => setExpanded(isOpen ? null : idx)}
                style={{ padding:'14px 18px',cursor:'pointer',display:'flex',gap:14,alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:5,flexWrap:'wrap' }}>
                    {isLatest && <span style={{ background:'#059669',color:'white',fontSize:9,fontWeight:800,padding:'2px 7px',borderRadius:999,letterSpacing:'0.08em',textTransform:'uppercase' }}>NEW</span>}
                    {post.tags.map(tag => <span key={tag} style={{ background:'rgba(99,102,241,0.2)',color:'#a5b4fc',fontSize:9,fontWeight:600,padding:'2px 7px',borderRadius:999 }}>{tag}</span>)}
                    <span style={{ fontSize:10,color:'#475569',marginLeft:'auto' }}>{post.date}</span>
                  </div>
                  <div style={{ fontSize:14,fontWeight:700,color:'#e2e8f0',lineHeight:1.4,marginBottom:3 }}>{post.title}</div>
                  <div style={{ fontSize:11,color:'#64748b',fontStyle:'italic' }}>{post.journal}</div>
                </div>
                <div style={{ color:'#475569',fontSize:18,fontWeight:300,flexShrink:0,marginTop:2,transition:'transform 0.2s',transform:isOpen?'rotate(90deg)':'none' }}>›</div>
              </div>
              {isOpen && (
                <div style={{ padding:'0 18px 18px',borderTop:'1px solid #1e3a5f',overflowY:'auto',maxHeight:'55vh' }}>
                  <div style={{ padding:'10px 12px',background:'rgba(255,255,255,0.03)',borderRadius:7,marginTop:12,marginBottom:14 }}>
                    <span style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em' }}>Citation  </span>
                    <span style={{ fontSize:11,color:'#94a3b8',lineHeight:1.6 }}>{post.citation}</span>
                  </div>
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10,fontWeight:700,color:'#475569',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8 }}>Summary</div>
                    {post.summary.map((bullet, bi) => (
                      <div key={bi} style={{ display:'flex',gap:8,marginBottom:6 }}>
                        <span style={{ color:'#059669',fontWeight:700,fontSize:13,flexShrink:0,marginTop:1 }}>›</span>
                        <span style={{ fontSize:13,color:'#cbd5e1',lineHeight:1.7 }}>{bullet}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'linear-gradient(135deg,rgba(5,150,105,0.15),rgba(6,95,70,0.1))',border:'1px solid rgba(5,150,105,0.3)',borderRadius:8,padding:'10px 14px',marginBottom:12 }}>
                    <span style={{ fontSize:10,fontWeight:800,color:'#059669',textTransform:'uppercase',letterSpacing:'0.08em' }}>🔑 Key Takeaway  </span>
                    <span style={{ fontSize:13,color:'#a7f3d0',lineHeight:1.6,fontWeight:500 }}>{post.keyTakeaway}</span>
                  </div>
                  <div style={{ display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',marginTop:0 }}>
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer"
                        style={{ display:'inline-flex',alignItems:'center',gap:5,padding:'6px 12px',borderRadius:7,border:'1px solid #1e3a5f',background:'rgba(255,255,255,0.04)',color:'#60a5fa',fontSize:11,fontWeight:600,textDecoration:'none' }}>
                        🔗 Search on Google Scholar →
                      </a>
                    )}
                    <ArticleLikes postIdx={idx} />
                  </div>
                  <ArticleComments postIdx={idx} currentUser={currentUser} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:16,paddingTop:12,borderTop:'1px solid #1e293b',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
        <span style={{ fontSize:10,color:'#475569',fontStyle:'italic' }}>Add new posts to the top of RESEARCH_POSTS in page.js</span>
        <div style={{ display:'flex',gap:8,alignItems:'center' }}>
          <span style={{ fontSize:10,color:'#334155' }}>{RESEARCH_POSTS.length} post{RESEARCH_POSTS.length !== 1 ? 's' : ''}</span>
          {currentUser && !showRecommend && (
            <button onClick={() => setShowRecommend(true)}
              style={{ fontSize:10,fontWeight:700,color:'#059669',background:'rgba(5,150,105,0.1)',border:'1px solid rgba(5,150,105,0.25)',borderRadius:6,padding:'4px 10px',cursor:'pointer' }}>
              📬 Recommend Article
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MSK HUB MODAL ───────────────────────────────────────────────────────────
const JOB_TYPES = ['Full-Time','Part-Time','Fellowship','Locums','Research','Industry'];
const ADMIN_NOTIFY_EMAIL = 'admin@lucidmsk.com';
const emptyJobForm = { title:'', institution:'', location:'', job_type:'Full-Time', salary_range:'', apply_link:'', description:'' };

// ─── CME TAB INNER ──────────────────────────────────────────────────────────
const CME_SPECIALTIES = ['All', 'Knee', 'Shoulder', 'Hip', 'Ankle', 'Wrist/Hand', 'Elbow', 'Spine', 'Pelvis', 'Soft Tissue Tumors', 'Trauma', 'General MSK'];
const CME_FORMATS     = ['All', 'Video Lecture', 'Case-Based Module', 'Quiz/Self-Assessment', 'Podcast', 'Article Review', 'Slide Deck'];
const CME_CREDITS     = ['All', '0.25 AMA PRA Cat 1', '0.5 AMA PRA Cat 1', '1.0 AMA PRA Cat 1', '1.5 AMA PRA Cat 1', '2.0 AMA PRA Cat 1'];

function CmeTabInner({ currentUser, isAdmin, sbHeaders, sbUrl }) {
  const [modules, setModules]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterSpec, setFilterSpec]   = useState('All');
  const [filterFmt, setFilterFmt]     = useState('All');
  const [completedIds, setCompletedIds] = useState(new Set());
  const [activeModule, setActiveModule] = useState(null);
  const [moduleTab, setModuleTab]       = useState('content');
  const [contentViewed, setContentViewed] = useState(false);
  const [testQuestions, setTestQuestions] = useState([]);
  const [testAnswers, setTestAnswers]   = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResult, setTestResult]     = useState(null);
  const [testLoading, setTestLoading]   = useState(false);
  const [showUpload, setShowUpload]     = useState(false);
  const [uploadForm, setUploadForm]     = useState({ title:'', specialty:'Knee', format:'Video Lecture', credits:'1.0', description:'', duration_min:'', url:'', objectives:'', author:'', thumbnail_url:'', content_type:'video', video_url:'', file_url:'' });
  const [uploadQuestions, setUploadQuestions] = useState([
    { question_text:'', options:['','','',''], correct_index:0 },
    { question_text:'', options:['','','',''], correct_index:0 },
    { question_text:'', options:['','','',''], correct_index:0 },
  ]);
  const [uploadErr, setUploadErr]     = useState('');
  const [uploadOk, setUploadOk]       = useState('');
  const [saving, setSaving]           = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const thumbInputRef = useRef(null);

  const sbH = sbHeaders ? sbHeaders() : (() => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    return { 'Content-Type':'application/json', 'apikey': key, 'Authorization': `Bearer ${(currentUser?.access_token || key)}` };
  })();
  const sbU = sbUrl || ((p) => `${SUPABASE_URL}/rest/v1/${p}`);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(sbU('cme_modules?select=*&status=eq.published&order=created_at.desc'), { headers: sbH });
        const data = await res.json();
        setModules(Array.isArray(data) ? data : []);
        if (currentUser) {
          const r2  = await fetch(sbU(`cme_completions?select=module_id&user_id=eq.${currentUser.id}`), { headers: sbH });
          const d2  = await r2.json();
          if (Array.isArray(d2)) setCompletedIds(new Set(d2.map(x => x.module_id)));
        }
      } catch(e) { console.error('CME fetch error', e); }
      setLoading(false);
    })();
  }, []);

  const markComplete = async (moduleId) => {
    if (!currentUser || completedIds.has(moduleId)) return;
    try {
      await fetch(sbU('cme_completions'), {
        method: 'POST',
        headers: { ...sbH, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ user_id: currentUser.id, module_id: moduleId, completed_at: new Date().toISOString() })
      });
      setCompletedIds(prev => new Set([...prev, moduleId]));
    } catch(e) { console.error('markComplete error', e); }
  };

  const submitModule = async () => {
    setUploadErr(''); setUploadOk('');
    if (!uploadForm.title.trim())       return setUploadErr('Title is required.');
    if (!uploadForm.description.trim()) return setUploadErr('Description is required.');
    const validQuestions = uploadQuestions.filter(q => q.question_text.trim() && q.options.every(o => o.trim()));
    if (validQuestions.length < 3)      return setUploadErr('At least 3 complete questions required (all 4 options filled).');
    setSaving(true);
    try {
      const payload = {
        ...uploadForm,
        status: 'published',
        duration_min: parseInt(uploadForm.duration_min)||null,
        created_by: currentUser?.id,
        question_count: validQuestions.length,
      };
      const res = await fetch(sbU('cme_modules'), {
        method: 'POST',
        headers: { ...sbH, 'Prefer': 'return=representation' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(await res.text());
      const [newMod] = await res.json();
      // Save questions
      for (let i = 0; i < validQuestions.length; i++) {
        const q = validQuestions[i];
        await fetch(sbU('cme_questions'), {
          method: 'POST',
          headers: { ...sbH, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ module_id: newMod.id, question_text: q.question_text, options: q.options, correct_index: q.correct_index, order_index: i })
        });
      }
      setModules(prev => [newMod, ...prev]);
      setUploadOk(`Module published with ${validQuestions.length} questions!`);
      setUploadForm({ title:'', specialty:'Knee', format:'Video Lecture', credits:'1.0', description:'', duration_min:'', url:'', objectives:'', author:'', thumbnail_url:'', content_type:'video', video_url:'', file_url:'' });
      setUploadQuestions([
        { question_text:'', options:['','','',''], correct_index:0 },
        { question_text:'', options:['','','',''], correct_index:0 },
        { question_text:'', options:['','','',''], correct_index:0 },
      ]);
    } catch(e) { console.error('submitModule error', e); setUploadErr('Failed to publish. Please try again.'); }
    setSaving(false);
  };

  const deleteModule = async (moduleId) => {
    if (!window.confirm('Delete this CME module? This cannot be undone.')) return;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/cme_modules?id=eq.${moduleId}`, {
        method: 'DELETE',
        headers: { ...sbH, 'Prefer': 'return=minimal' }
      });
      if (!res.ok) throw new Error(await res.text());
      setModules(prev => prev.filter(m => m.id !== moduleId));
      setActiveModule(null);
    } catch(e) { console.error('deleteModule error', e); alert('Delete failed. Check RLS policy — see instructions.'); }
  };

  const openModule = async (m) => {
    setActiveModule(m);
    setModuleTab('content');
    setContentViewed(false);
    setTestQuestions([]);
    setTestAnswers({});
    setTestSubmitted(false);
    setTestResult(null);
    // Pre-fetch questions
    try {
      const res = await fetch(sbU(`cme_questions?module_id=eq.${m.id}&order=order_index.asc`), { headers: sbH });
      const data = await res.json();
      if (Array.isArray(data)) setTestQuestions(data);
    } catch(e) { console.error('loadQuestions error', e); }
  };

  const submitTest = async () => {
    if (!currentUser || !activeModule) return;
    setTestLoading(true);
    const total = testQuestions.length;
    if (total === 0) { setTestLoading(false); return; }
    let correct = 0;
    testQuestions.forEach(q => {
      if (testAnswers[q.id] === q.correct_index) correct++;
    });
    const score = correct / total;
    const threshold = parseFloat(activeModule.pass_threshold) || 0.75;
    const passed = score >= threshold;
    const credits = parseFloat(activeModule.credits) || 1.0;
    setTestResult({ score, passed, correct, total, credits });
    setTestSubmitted(true);
    // Record attempt
    try {
      await fetch(sbU('cme_attempts'), {
        method: 'POST',
        headers: { ...sbH, 'Prefer': 'return=minimal' },
        body: JSON.stringify({ user_id: currentUser.id, module_id: activeModule.id, score, passed, completed_at: new Date().toISOString() })
      });
    } catch(e) { console.error('submitTest attempt error', e); }
    // If passed, mark complete and log credits
    if (passed && !completedIds.has(activeModule.id)) {
      try {
        await fetch(sbU('cme_completions'), {
          method: 'POST',
          headers: { ...sbH, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ user_id: currentUser.id, module_id: activeModule.id, completed_at: new Date().toISOString() })
        });
        setCompletedIds(prev => new Set([...prev, activeModule.id]));
      } catch(e) { console.error('markComplete error', e); }
    }
    setTestLoading(false);
  };

  const resetTest = () => {
    setTestAnswers({});
    setTestSubmitted(false);
    setTestResult(null);
  };

  const uploadThumbnail = async (file) => {
    if (!file) return;
    const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
    if (!allowed.includes(file.type)) { setUploadErr('Thumbnail must be a JPG, PNG, WebP, or GIF image.'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadErr('Thumbnail must be under 5MB.'); return; }
    setThumbnailUploading(true);
    setUploadErr('');
    try {
      const ext      = file.name.split('.').pop();
      const filename = `cme-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const res = await fetch(
        `${SUPABASE_URL}/storage/v1/object/cme-thumbnails/${filename}`,
        {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${currentUser?.access_token || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            'Content-Type': file.type,
            'x-upsert': 'false',
          },
          body: file,
        }
      );
      if (!res.ok) { const e = await res.json(); throw new Error(e.message || JSON.stringify(e)); }
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/cme-thumbnails/${filename}`;
      setUploadForm(f => ({ ...f, thumbnail_url: publicUrl }));
    } catch(e) {
      console.error('uploadThumbnail error', e);
      setUploadErr(`Thumbnail upload failed: ${e.message}`);
    }
    setThumbnailUploading(false);
  };

  const filtered = modules.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.title?.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q) || m.author?.toLowerCase().includes(q) || m.specialty?.toLowerCase().includes(q);
    const matchSpec   = filterSpec === 'All' || m.specialty === filterSpec;
    const matchFmt    = filterFmt  === 'All' || m.format    === filterFmt;
    return matchSearch && matchSpec && matchFmt;
  });

  const totalCredits = [...completedIds].reduce((sum, id) => {
    const m = modules.find(x => x.id === id);
    return sum + (parseFloat(m?.credits) || 0);
  }, 0);

  const inp  = { background:'#0f172a', border:'1px solid rgba(99,179,237,0.2)', borderRadius:8, color:'#e2e8f0', fontSize:13, padding:'9px 12px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' };
  const lbl  = { color:'#90cdf4', fontSize:12, fontWeight:700, letterSpacing:'0.04em', display:'block', marginBottom:4 };

  if (activeModule) {
    const isVideo = activeModule.content_type === 'video' || activeModule.video_url;
    const isPdf   = activeModule.content_type === 'pdf'   || activeModule.file_url;
    const contentUrl = activeModule.video_url || activeModule.file_url || activeModule.url || '';
    const alreadyPassed = completedIds.has(activeModule.id);
    const passThreshold = parseFloat(activeModule.pass_threshold) || 0.75;
    const allAnswered = testQuestions.length > 0 && testQuestions.every(q => testAnswers[q.id] !== undefined);

    // YouTube embed helper
    const getYouTubeId = (url) => {
      const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&\n]+)/);
      return m ? m[1] : null;
    };

    return (
      <div>
        {/* Back button + header */}
        <button onClick={() => setActiveModule(null)} style={{ background:'none', border:'none', color:'#90cdf4', cursor:'pointer', fontSize:13, fontWeight:700, marginBottom:14, padding:0 }}>← Back to CME Library</button>

        <div style={{ background:'#0f172a', borderRadius:14, border:'1px solid rgba(99,179,237,0.15)', overflow:'hidden' }}>
          {/* Module header */}
          <div style={{ padding:'18px 22px', borderBottom:'1px solid rgba(99,179,237,0.1)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
              <div style={{ color:'#e2e8f0', fontSize:16, fontWeight:800, lineHeight:1.3, flex:1 }}>{activeModule.title}</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', flexShrink:0 }}>
                <span style={{ background:'rgba(99,179,237,0.1)', color:'#90cdf4', borderRadius:6, padding:'2px 9px', fontSize:11, fontWeight:700 }}>{activeModule.format}</span>
                <span style={{ background:'rgba(104,211,145,0.1)', color:'#68d391', borderRadius:6, padding:'2px 9px', fontSize:11, fontWeight:700 }}>{activeModule.credits} credit{parseFloat(activeModule.credits)!==1?'s':''}</span>
                {alreadyPassed && <span style={{ background:'rgba(104,211,145,0.15)', color:'#68d391', borderRadius:6, padding:'2px 9px', fontSize:11, fontWeight:700 }}>✅ Completed</span>}
              </div>
            </div>
            <div style={{ display:'flex', gap:14, color:'#4a5568', fontSize:11, marginTop:6, flexWrap:'wrap' }}>
              {activeModule.author    && <span>👤 {activeModule.author}</span>}
              {activeModule.specialty && <span>🦴 {activeModule.specialty}</span>}
              {activeModule.duration_min && <span>⏱ {activeModule.duration_min} min</span>}
            </div>
          </div>

          {/* Tab bar */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(99,179,237,0.1)' }}>
            {['content','test'].map(t => {
              const labels = { content:'📺 Content', test:'📝 Post-Test' };
              const locked = t === 'test' && !contentViewed && !alreadyPassed;
              const active = moduleTab === t;
              return (
                <button key={t} onClick={() => { if (!locked) setModuleTab(t); }}
                  style={{ flex:1, padding:'11px 0', background: active ? 'rgba(99,179,237,0.08)' : 'none', border:'none', borderBottom: active ? '2px solid #90cdf4' : '2px solid transparent', color: locked ? '#374151' : active ? '#90cdf4' : '#64748b', fontSize:13, fontWeight:700, cursor: locked ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}>
                  {labels[t]}{locked ? ' 🔒' : ''}
                </button>
              );
            })}
          </div>

          {/* CONTENT TAB */}
          {moduleTab === 'content' && (
            <div style={{ padding:'20px 22px' }}>
              {/* Video embed */}
              {isVideo && contentUrl && (() => {
                const ytId = getYouTubeId(contentUrl);
                return ytId ? (
                  <div style={{ position:'relative', paddingBottom:'56.25%', height:0, borderRadius:10, overflow:'hidden', marginBottom:18, border:'1px solid rgba(99,179,237,0.15)' }}>
                    <iframe src={`https://www.youtube.com/embed/${ytId}`} style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', border:'none' }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  </div>
                ) : (
                  <a href={contentUrl} target="_blank" rel="noopener noreferrer" style={{ display:'block', padding:'14px 18px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:10, color:'#90cdf4', fontSize:13, fontWeight:700, textDecoration:'none', marginBottom:18 }}>▶️ Open Video →</a>
                );
              })()}

              {/* PDF embed */}
              {isPdf && !isVideo && contentUrl && (
                <div style={{ marginBottom:18 }}>
                  <iframe src={contentUrl} style={{ width:'100%', height:500, border:'1px solid rgba(99,179,237,0.15)', borderRadius:10 }} title="CME Module PDF" />
                </div>
              )}

              {/* Description + objectives */}
              {activeModule.description && <p style={{ color:'#a0aec0', fontSize:13, lineHeight:1.7, marginBottom:16 }}>{activeModule.description}</p>}
              {activeModule.objectives && (
                <div style={{ background:'rgba(99,179,237,0.05)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:10, padding:'14px 18px', marginBottom:18 }}>
                  <div style={{ color:'#90cdf4', fontSize:11, fontWeight:700, marginBottom:8, letterSpacing:'0.05em' }}>LEARNING OBJECTIVES</div>
                  {activeModule.objectives.split('\n').filter(Boolean).map((obj, i) => (
                    <div key={i} style={{ color:'#a0aec0', fontSize:12, lineHeight:1.6, display:'flex', gap:8, marginBottom:4 }}>
                      <span style={{ color:'#3b82f6', flexShrink:0 }}>{i+1}.</span><span>{obj}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Admin delete */}
              {isAdmin && (
                <button onClick={() => deleteModule(activeModule.id)}
                  style={{ padding:'8px 16px', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:8, color:'#fc8181', fontSize:12, fontWeight:700, cursor:'pointer', marginBottom:14 }}>
                  🗑️ Delete Module
                </button>
              )}

              {/* Unlock post-test button */}
              {!contentViewed && !alreadyPassed && testQuestions.length > 0 && (
                <button onClick={() => { setContentViewed(true); setModuleTab('test'); }}
                  style={{ width:'100%', padding:'13px', background:'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(99,179,237,0.08))', border:'1px solid rgba(99,179,237,0.35)', borderRadius:10, color:'#90cdf4', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                  I've reviewed this content — Take the Post-Test →
                </button>
              )}
              {testQuestions.length === 0 && !alreadyPassed && (
                <div style={{ color:'#4a5568', fontSize:12, textAlign:'center', padding:'10px 0' }}>No post-test questions added yet.</div>
              )}
              {alreadyPassed && (
                <div style={{ textAlign:'center', padding:'14px', background:'rgba(104,211,145,0.07)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:10, color:'#68d391', fontSize:13, fontWeight:700 }}>
                  ✅ You have already passed this module and earned {activeModule.credits} credit{parseFloat(activeModule.credits)!==1?'s':''}.
                </div>
              )}
            </div>
          )}

          {/* POST-TEST TAB */}
          {moduleTab === 'test' && (
            <div style={{ padding:'20px 22px' }}>
              {/* Already passed */}
              {alreadyPassed && !testSubmitted && (
                <div style={{ textAlign:'center', padding:'28px', color:'#68d391' }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>🏆</div>
                  <div style={{ fontSize:15, fontWeight:700 }}>Module Completed</div>
                  <div style={{ fontSize:12, color:'#4a5568', marginTop:6 }}>You already earned {activeModule.credits} credit{parseFloat(activeModule.credits)!==1?'s':''} for this module.</div>
                </div>
              )}

              {/* Result screen */}
              {testSubmitted && testResult && (
                <div>
                  <div style={{ textAlign:'center', padding:'24px 16px', background: testResult.passed ? 'rgba(104,211,145,0.07)' : 'rgba(245,101,101,0.07)', border:`1px solid ${testResult.passed ? 'rgba(104,211,145,0.25)' : 'rgba(245,101,101,0.2)'}`, borderRadius:12, marginBottom:20 }}>
                    <div style={{ fontSize:40, marginBottom:8 }}>{testResult.passed ? '🎉' : '😔'}</div>
                    <div style={{ fontSize:18, fontWeight:800, color: testResult.passed ? '#68d391' : '#fc8181', marginBottom:6 }}>
                      {testResult.passed ? 'Congratulations — You Passed!' : 'Not Quite — Please Retry'}
                    </div>
                    <div style={{ fontSize:14, color:'#a0aec0', marginBottom:4 }}>
                      Score: {testResult.correct}/{testResult.total} ({Math.round(testResult.score * 100)}%) — Pass threshold: {Math.round(passThreshold * 100)}%
                    </div>
                    {testResult.passed && (
                      <div style={{ fontSize:13, color:'#68d391', fontWeight:700, marginTop:6 }}>
                        🎓 {testResult.credits} CME credit{testResult.credits !== 1 ? 's' : ''} earned
                      </div>
                    )}
                  </div>

                  {/* Answer review */}
                  <div style={{ marginBottom:20 }}>
                    {testQuestions.map((q, i) => {
                      const selected = testAnswers[q.id];
                      const correct  = q.correct_index;
                      const isRight  = selected === correct;
                      return (
                        <div key={q.id} style={{ marginBottom:14, padding:'14px 16px', background:'rgba(15,23,42,0.6)', border:`1px solid ${isRight ? 'rgba(104,211,145,0.2)' : 'rgba(245,101,101,0.2)'}`, borderRadius:10 }}>
                          <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, marginBottom:10 }}>{i+1}. {q.question_text}</div>
                          {q.options.map((opt, oi) => {
                            const isSelected = selected === oi;
                            const isCorrect  = correct === oi;
                            return (
                              <div key={oi} style={{ padding:'7px 12px', marginBottom:4, borderRadius:7, fontSize:12,
                                background: isCorrect ? 'rgba(104,211,145,0.12)' : isSelected && !isCorrect ? 'rgba(245,101,101,0.1)' : 'transparent',
                                border: `1px solid ${isCorrect ? 'rgba(104,211,145,0.3)' : isSelected && !isCorrect ? 'rgba(245,101,101,0.25)' : 'transparent'}`,
                                color: isCorrect ? '#68d391' : isSelected && !isCorrect ? '#fc8181' : '#64748b',
                                display:'flex', alignItems:'center', gap:8 }}>
                                <span>{isCorrect ? '✓' : isSelected && !isCorrect ? '✗' : '○'}</span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Certificate or retry */}
                  {testResult.passed ? (
                    <div style={{ background:'rgba(104,211,145,0.06)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:12, padding:'20px 22px', textAlign:'center' }}>
                      <div style={{ color:'#68d391', fontSize:13, fontWeight:700, marginBottom:4 }}>🏅 Certificate of Completion</div>
                      <div style={{ color:'#a0aec0', fontSize:12, marginBottom:14 }}>
                        This certifies that <strong style={{ color:'#e2e8f0' }}>{currentUser?.email}</strong> has successfully completed<br/>
                        <strong style={{ color:'#e2e8f0' }}>{activeModule.title}</strong><br/>
                        and earned <strong style={{ color:'#68d391' }}>{testResult.credits} CME credit{testResult.credits !== 1 ? 's' : ''}</strong> on {new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })}.
                      </div>
                      <button onClick={() => window.print()}
                        style={{ padding:'10px 24px', background:'rgba(104,211,145,0.12)', border:'1px solid rgba(104,211,145,0.3)', borderRadius:9, color:'#68d391', fontSize:13, fontWeight:700, cursor:'pointer' }}>
                        🖨️ Print Certificate
                      </button>
                    </div>
                  ) : (
                    <button onClick={resetTest}
                      style={{ width:'100%', padding:'12px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.25)', borderRadius:10, color:'#90cdf4', fontSize:14, fontWeight:700, cursor:'pointer' }}>
                      🔄 Retake Post-Test
                    </button>
                  )}
                </div>
              )}

              {/* Questions */}
              {!testSubmitted && !alreadyPassed && (
                <div>
                  <div style={{ color:'#90cdf4', fontSize:13, fontWeight:700, marginBottom:16 }}>
                    Post-Test — {testQuestions.length} Question{testQuestions.length!==1?'s':''} · Pass score: {Math.round(passThreshold*100)}%
                  </div>
                  {testQuestions.map((q, i) => (
                    <div key={q.id} style={{ marginBottom:18, padding:'16px 18px', background:'rgba(15,23,42,0.5)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:12 }}>
                      <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, marginBottom:12 }}>{i+1}. {q.question_text}</div>
                      {q.options.map((opt, oi) => {
                        const selected = testAnswers[q.id] === oi;
                        return (
                          <div key={oi} onClick={() => setTestAnswers(prev => ({ ...prev, [q.id]: oi }))}
                            style={{ padding:'9px 14px', marginBottom:6, borderRadius:8, fontSize:12, cursor:'pointer', transition:'all 0.12s',
                              background: selected ? 'rgba(99,179,237,0.15)' : 'rgba(99,179,237,0.03)',
                              border: `1px solid ${selected ? 'rgba(99,179,237,0.5)' : 'rgba(99,179,237,0.1)'}`,
                              color: selected ? '#90cdf4' : '#94a3b8',
                              display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ width:18, height:18, borderRadius:'50%', border:`2px solid ${selected ? '#90cdf4' : '#374151'}`, background: selected ? '#90cdf4' : 'transparent', flexShrink:0, display:'inline-block' }} />
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                  <button onClick={submitTest} disabled={!allAnswered || testLoading}
                    style={{ width:'100%', padding:'13px', background: allAnswered ? 'linear-gradient(135deg,rgba(104,211,145,0.2),rgba(104,211,145,0.08))' : 'rgba(55,65,81,0.3)', border:`1px solid ${allAnswered ? 'rgba(104,211,145,0.35)' : 'rgba(55,65,81,0.4)'}`, borderRadius:10, color: allAnswered ? '#68d391' : '#374151', fontSize:14, fontWeight:700, cursor: allAnswered ? 'pointer' : 'not-allowed' }}>
                    {testLoading ? '⏳ Submitting...' : allAnswered ? '✅ Submit Post-Test' : `Answer all ${testQuestions.length} questions to submit`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:12, borderBottom:'1px solid rgba(99,179,237,0.1)', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ color:'#90cdf4', fontSize:15, fontWeight:700 }}>CME Library</div>
          <div style={{ color:'#4a5568', fontSize:12, marginTop:2 }}>AMA PRA Category 1 credits — MSK Radiology</div>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          {currentUser && (
            <div style={{ background:'rgba(104,211,145,0.08)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:8, padding:'6px 14px', color:'#68d391', fontSize:12, fontWeight:700 }}>
              🎓 {totalCredits.toFixed(2)} credits earned · {completedIds.size} module{completedIds.size!==1?'s':''} completed
            </div>
          )}
          {isAdmin && (
            <button onClick={() => setShowUpload(v => !v)}
              style={{ padding:'7px 16px', background: showUpload ? 'rgba(245,189,64,0.12)' : 'rgba(99,179,237,0.08)', border:'1px solid '+(showUpload?'rgba(245,189,64,0.3)':'rgba(99,179,237,0.2)'), borderRadius:8, color: showUpload ? '#f6bd40':'#90cdf4', fontSize:12, fontWeight:700, cursor:'pointer' }}>
              {showUpload ? '✕ Cancel Upload' : '⬆️ Upload Module'}
            </button>
          )}
        </div>
      </div>

      {/* Admin upload form */}
      {isAdmin && showUpload && (
        <div style={{ background:'rgba(245,189,64,0.04)', border:'1px solid rgba(245,189,64,0.15)', borderRadius:12, padding:'20px 22px', marginBottom:20 }}>
          <div style={{ color:'#f6bd40', fontSize:13, fontWeight:700, marginBottom:16 }}>📤 Upload New CME Module</div>
          {uploadErr && <div style={{ color:'#fc8181', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{uploadErr}</div>}
          {uploadOk  && <div style={{ color:'#68d391', background:'rgba(104,211,145,0.08)', border:'1px solid rgba(104,211,145,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:14 }}>{uploadOk}</div>}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            <div><label style={lbl}>Module Title *</label><input style={inp} value={uploadForm.title} onChange={e => setUploadForm(f=>({...f,title:e.target.value}))} placeholder="e.g. ACL Tears: Anatomy to MRI Pattern Recognition" /></div>
            <div><label style={lbl}>Author / Faculty</label><input style={inp} value={uploadForm.author} onChange={e => setUploadForm(f=>({...f,author:e.target.value}))} placeholder="Dr. Jane Smith, MD" /></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12, marginBottom:12 }}>
            <div><label style={lbl}>Specialty</label>
              <select style={inp} value={uploadForm.specialty} onChange={e => setUploadForm(f=>({...f,specialty:e.target.value}))}>
                {CME_SPECIALTIES.filter(s=>s!=='All').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Format</label>
              <select style={inp} value={uploadForm.format} onChange={e => setUploadForm(f=>({...f,format:e.target.value}))}>
                {CME_FORMATS.filter(f=>f!=='All').map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Credits</label>
              <select style={inp} value={uploadForm.credits} onChange={e => setUploadForm(f=>({...f,credits:e.target.value}))}>
                {CME_CREDITS.filter(c=>c!=='All').map(c => <option key={c} value={c.split(' ')[0]}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Duration (min)</label><input style={inp} type="number" value={uploadForm.duration_min} onChange={e => setUploadForm(f=>({...f,duration_min:e.target.value}))} placeholder="45" /></div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Module URL * <span style={{ color:'#4a5568', fontWeight:400 }}>(hosted video, PDF, or SCORM link)</span></label>
            <input style={inp} value={uploadForm.url} onChange={e => setUploadForm(f=>({...f,url:e.target.value}))} placeholder="https://..." />
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Thumbnail Image <span style={{ color:'#4a5568', fontWeight:400 }}>(optional — JPG, PNG, or WebP · max 5MB)</span></label>
            <input ref={thumbInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" style={{ display:'none' }} onChange={e => uploadThumbnail(e.target.files[0])} />
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <button type="button" onClick={() => thumbInputRef.current?.click()} disabled={thumbnailUploading}
                style={{ padding:'9px 16px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:8, color: thumbnailUploading ? '#4a5568' : '#90cdf4', fontSize:12, fontWeight:700, cursor: thumbnailUploading ? 'not-allowed' : 'pointer', flexShrink:0 }}>
                {thumbnailUploading ? '⏳ Uploading...' : '📁 Choose Image'}
              </button>
              {uploadForm.thumbnail_url
                ? <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                    <img src={uploadForm.thumbnail_url} alt="thumbnail preview" style={{ height:40, width:70, objectFit:'cover', borderRadius:5, border:'1px solid rgba(99,179,237,0.2)' }} />
                    <span style={{ color:'#68d391', fontSize:11, fontWeight:700 }}>✅ Uploaded</span>
                    <button type="button" onClick={() => { setUploadForm(f=>({...f,thumbnail_url:''})); if(thumbInputRef.current) thumbInputRef.current.value=''; }}
                      style={{ background:'none', border:'none', color:'#fc8181', fontSize:11, cursor:'pointer', padding:0 }}>✕ Remove</button>
                  </div>
                : <span style={{ color:'#374151', fontSize:11 }}>No image selected — module will show default 🎓 icon</span>
              }
            </div>
          </div>
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Description *</label>
            <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} value={uploadForm.description} onChange={e => setUploadForm(f=>({...f,description:e.target.value}))} placeholder="Brief overview of the module content and clinical relevance..." />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={lbl}>Learning Objectives <span style={{ color:'#4a5568', fontWeight:400 }}>(one per line)</span></label>
            <textarea style={{ ...inp, minHeight:80, resize:'vertical' }} value={uploadForm.objectives} onChange={e => setUploadForm(f=>({...f,objectives:e.target.value}))} placeholder={"Identify the key MRI findings of ACL tears\nDescribe partial vs complete tears\nApply grading criteria in clinical practice"} />
          </div>

          {/* Content type + URL */}
          <div style={{ marginBottom:12 }}>
            <label style={lbl}>Content Type</label>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              {['video','pdf'].map(ct => (
                <button key={ct} type="button" onClick={() => setUploadForm(f=>({...f,content_type:ct}))}
                  style={{ padding:'7px 18px', borderRadius:7, fontSize:12, fontWeight:700, cursor:'pointer', border:`1px solid ${uploadForm.content_type===ct ? 'rgba(99,179,237,0.5)' : 'rgba(99,179,237,0.15)'}`, background: uploadForm.content_type===ct ? 'rgba(99,179,237,0.12)' : 'transparent', color: uploadForm.content_type===ct ? '#90cdf4' : '#64748b' }}>
                  {ct === 'video' ? '▶️ Video (YouTube)' : '📄 PDF / Slides'}
                </button>
              ))}
            </div>
            {uploadForm.content_type === 'video'
              ? <input style={inp} value={uploadForm.video_url} onChange={e => setUploadForm(f=>({...f,video_url:e.target.value,url:e.target.value}))} placeholder="https://www.youtube.com/watch?v=..." />
              : <input style={inp} value={uploadForm.file_url} onChange={e => setUploadForm(f=>({...f,file_url:e.target.value,url:e.target.value}))} placeholder="https://... (Supabase storage URL or public PDF link)" />
            }
          </div>

          {/* Post-test question builder */}
          <div style={{ marginBottom:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <label style={{ ...lbl, marginBottom:0 }}>Post-Test Questions * <span style={{ color:'#4a5568', fontWeight:400 }}>(min 3, all 4 options required)</span></label>
              <button type="button" onClick={() => setUploadQuestions(qs => [...qs, { question_text:'', options:['','','',''], correct_index:0 }])}
                style={{ padding:'5px 12px', background:'rgba(99,179,237,0.08)', border:'1px solid rgba(99,179,237,0.2)', borderRadius:6, color:'#90cdf4', fontSize:11, fontWeight:700, cursor:'pointer' }}>
                + Add Question
              </button>
            </div>
            {uploadQuestions.map((q, qi) => (
              <div key={qi} style={{ background:'rgba(15,23,42,0.6)', border:'1px solid rgba(99,179,237,0.1)', borderRadius:10, padding:'14px 16px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ color:'#90cdf4', fontSize:12, fontWeight:700 }}>Q{qi+1}</span>
                  {uploadQuestions.length > 3 && (
                    <button type="button" onClick={() => setUploadQuestions(qs => qs.filter((_,i)=>i!==qi))}
                      style={{ background:'none', border:'none', color:'#fc8181', fontSize:11, cursor:'pointer', padding:0 }}>✕ Remove</button>
                  )}
                </div>
                <input style={{ ...inp, marginBottom:8 }} value={q.question_text} onChange={e => setUploadQuestions(qs => qs.map((x,i) => i===qi ? {...x, question_text:e.target.value} : x))} placeholder={`Question ${qi+1} text...`} />
                {q.options.map((opt, oi) => (
                  <div key={oi} style={{ display:'flex', gap:6, alignItems:'center', marginBottom:5 }}>
                    <input type="radio" name={`correct_${qi}`} checked={q.correct_index===oi} onChange={() => setUploadQuestions(qs => qs.map((x,i) => i===qi ? {...x, correct_index:oi} : x))} style={{ accentColor:'#68d391', flexShrink:0 }} />
                    <input style={{ ...inp, flex:1 }} value={opt} onChange={e => setUploadQuestions(qs => qs.map((x,i) => i===qi ? {...x, options:x.options.map((o,j)=>j===oi?e.target.value:o)} : x))} placeholder={`Option ${String.fromCharCode(65+oi)}`} />
                  </div>
                ))}
                <div style={{ color:'#4a5568', fontSize:10, marginTop:4 }}>🟢 Radio button = correct answer</div>
              </div>
            ))}
          </div>

          <button onClick={submitModule} disabled={saving}
            style={{ padding:'10px 24px', background:'linear-gradient(135deg,rgba(245,189,64,0.2),rgba(245,189,64,0.08))', border:'1px solid rgba(245,189,64,0.35)', borderRadius:9, color:'#f6bd40', fontSize:13, fontWeight:700, cursor:saving?'not-allowed':'pointer' }}>
            {saving ? '⏳ Publishing...' : '🚀 Publish Module'}
          </button>
        </div>
      )}

      {/* Search + filters */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap' }}>
        <input style={{ ...inp, flex:'1 1 200px', background:'#0f172a' }} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍  Search modules, topics, faculty..." />
        <select style={{ ...inp, flex:'0 0 auto', width:'auto', background:'#0f172a' }} value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
          {CME_SPECIALTIES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select style={{ ...inp, flex:'0 0 auto', width:'auto', background:'#0f172a' }} value={filterFmt} onChange={e => setFilterFmt(e.target.value)}>
          {CME_FORMATS.map(f => <option key={f}>{f}</option>)}
        </select>
      </div>

      {/* Module grid */}
      {loading && <p style={{ color:'#718096', fontSize:13 }}>Loading CME modules...</p>}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign:'center', color:'#4a5568', padding:'56px 24px' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>🎓</div>
          <div style={{ fontSize:14 }}>{modules.length === 0 ? 'No CME modules published yet.' : 'No modules match your search.'}</div>
          {isAdmin && modules.length === 0 && <div style={{ fontSize:12, marginTop:8, color:'#374151' }}>Use "Upload Module" above to add the first module.</div>}
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {filtered.map(m => {
          const done = completedIds.has(m.id);
          return (
            <div key={m.id} onClick={() => openModule(m)} style={{ background:'#0f172a', border:'1px solid '+(done?'rgba(104,211,145,0.25)':'rgba(99,179,237,0.12)'), borderRadius:12, overflow:'hidden', cursor:'pointer', transition:'border-color 0.15s,transform 0.15s', position:'relative' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='translateY(0)'}>
              {m.thumbnail_url
                ? <div style={{ width:'100%', height:110, background:`url(${m.thumbnail_url}) center/cover`, borderBottom:'1px solid rgba(99,179,237,0.08)' }} />
                : <div style={{ width:'100%', height:70, background:'linear-gradient(135deg,#0c2340,#1a3a5c)', display:'flex', alignItems:'center', justifyContent:'center', borderBottom:'1px solid rgba(99,179,237,0.08)', fontSize:28 }}>🎓</div>
              }
              {done && <div style={{ position:'absolute', top:8, right:8, background:'rgba(104,211,145,0.9)', borderRadius:20, padding:'2px 8px', fontSize:10, fontWeight:800, color:'#065f46' }}>✅ DONE</div>}
              <div style={{ padding:'14px 16px' }}>
                <div style={{ color:'#e2e8f0', fontSize:13, fontWeight:700, lineHeight:1.4, marginBottom:8 }}>{m.title}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:8 }}>
                  <span style={{ background:'rgba(99,179,237,0.08)', color:'#64748b', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{m.specialty}</span>
                  <span style={{ background:'rgba(139,92,246,0.08)', color:'#a78bfa', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{m.format}</span>
                  <span style={{ background:'rgba(104,211,145,0.08)', color:'#68d391', borderRadius:5, padding:'2px 7px', fontSize:10, fontWeight:700 }}>{m.credits} cr</span>
                </div>
                <p style={{ color:'#64748b', fontSize:11, lineHeight:1.5, margin:0, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{m.description}</p>
                {m.duration_min && <div style={{ color:'#374151', fontSize:10, marginTop:8 }}>⏱ {m.duration_min} min{m.author ? ` · ${m.author}` : ''}</div>}
                {isAdmin && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteModule(m.id); }}
                    style={{ marginTop:10, padding:'5px 12px', background:'rgba(245,101,101,0.08)', border:'1px solid rgba(245,101,101,0.2)', borderRadius:6, color:'#fc8181', fontSize:11, fontWeight:700, cursor:'pointer', width:'100%' }}>
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MSKHubModal({ initialTab, onClose, currentUser, isAdmin }) {
  const [tab, setTab]                 = useState(initialTab || 'research');
  const [jobs, setJobs]               = useState([]);
  const [pending, setPending]         = useState([]);
  const [form, setForm]               = useState(emptyJobForm);
  const [formErr, setFormErr]         = useState('');
  const [formOk, setFormOk]           = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const sbHeaders = () => {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const token = currentUser?.access_token || key;
    return { 'Content-Type':'application/json', 'apikey': key, 'Authorization': `Bearer ${token}` };
  };
  const sbUrl = (path) => `${SUPABASE_URL}/rest/v1/${path}`;

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(
        sbUrl(`job_posts?select=*&status=eq.approved&expires_at=gte.${today}&order=created_at.desc`),
        { headers: sbHeaders() }
      );
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch(e) { console.error('fetchJobs error:', e); }
    setLoadingJobs(false);
  };

  const fetchPending = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(
        sbUrl(`job_posts?select=*&status=eq.pending&order=created_at.desc`),
        { headers: sbHeaders() }
      );
      const data = await res.json();
      setPending(Array.isArray(data) ? data : []);
    } catch(e) { console.error('fetchPending error:', e); }
  };

  useEffect(() => {
    if (tab === 'jobs') fetchJobs();
    if (tab === 'cme') { /* CME modules load on mount inside CmeTabInner */ }
    if (tab === 'admin') { console.log('Admin tab opened, isAdmin:', isAdmin); fetchPending(); }
  }, [tab]);

  const setField = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submitJob = async () => {
    setFormErr(''); setFormOk('');
    if (!form.title.trim())       return setFormErr('Job title is required.');
    if (!form.institution.trim()) return setFormErr('Institution is required.');
    if (!form.location.trim())    return setFormErr('Location is required.');
    if (!form.apply_link.trim())  return setFormErr('Application link or contact email is required.');
    if (!form.description.trim()) return setFormErr('Job description is required.');
    setSubmitting(true);
    try {
      const expires = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
      const res = await fetch(sbUrl('job_posts'), {
        method: 'POST',
        headers: { ...sbHeaders(), 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...form, user_id: currentUser.id, status:'pending', expires_at: expires })
      });
      if (!res.ok) {
        const e = await res.json();
        console.error('Supabase insert error:', JSON.stringify(e));
        console.error('user_id being sent:', currentUser.id);
        console.error('access_token present:', !!currentUser?.access_token);
        throw new Error(JSON.stringify(e));
      }
      // Notify admin
      try {
        await fetch('/api/notify-admin', { method:'POST', headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ to: ADMIN_NOTIFY_EMAIL, subject: `[LucidMSK] New Job Post Pending: ${form.title}`,
            html: `<div style="font-family:sans-serif;padding:24px;background:#0f1923;color:#e2e8f0;border-radius:12px;"><h2 style="color:#90cdf4;">New Job Post Pending Approval</h2><p><b>Title:</b> ${form.title}</p><p><b>Institution:</b> ${form.institution}</p><p><b>Location:</b> ${form.location}</p><p><b>Type:</b> ${form.job_type}</p><p><b>Submitted by:</b> ${currentUser.email}</p><p style="margin-top:20px;color:#718096;">Log in to LucidMSK → MSK Hub → Admin tab to approve or remove this post.</p></div>` }) });
      } catch(_) {}
      setForm(emptyJobForm);
      setFormOk('Submitted! Your post will appear on the board once approved (usually within 24 hours).');
    } catch(e) {
      console.error('submitJob error:', e);
      setFormErr('Submission failed. Please try again.');
    }
    setSubmitting(false);
  };

  const approvePost = async id => {
    try {
      await fetch(sbUrl(`job_posts?id=eq.${id}`), { method:'PATCH', headers:{ ...sbHeaders(),'Prefer':'return=minimal' }, body: JSON.stringify({status:'approved'}) });
      fetchPending(); fetchJobs();
    } catch(e) { console.error('approvePost error:', e); }
  };
  const removePost = async id => {
    try {
      await fetch(sbUrl(`job_posts?id=eq.${id}`), { method:'PATCH', headers:{ ...sbHeaders(),'Prefer':'return=minimal' }, body: JSON.stringify({status:'removed'}) });
      fetchPending(); fetchJobs();
    } catch(e) { console.error('removePost error:', e); }
  };

  // ── shared styles ──
  const inp = { background:'#1a2332', border:'1px solid rgba(99,179,237,0.2)', borderRadius:8, color:'#e2e8f0', fontSize:13, padding:'9px 12px', outline:'none', width:'100%', boxSizing:'border-box', fontFamily:'inherit' };
  const lbl = { color:'#90cdf4', fontSize:12, fontWeight:700, letterSpacing:'0.04em', display:'block', marginBottom:4 };

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.78)',backdropFilter:'blur(4px)',zIndex:1000,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'16px',overflowY:'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#0f172a',borderRadius:16,width:'min(99vw,880px)',maxHeight:'90vh',display:'flex',flexDirection:'column',boxShadow:'0 30px 80px rgba(0,0,0,0.7)',border:'1px solid rgba(99,179,237,0.15)' }}>

        {/* Header */}
        <div style={{ background:'linear-gradient(135deg,#0c2340,#153a5c)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0,borderBottom:'1px solid rgba(99,179,237,0.15)' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:20 }}>🗂️</span>
            <div>
              <div style={{ color:'white',fontWeight:800,fontSize:14,letterSpacing:'0.08em' }}>MSK HUB</div>
              <div style={{ color:'rgba(255,255,255,0.5)',fontSize:11,marginTop:1 }}>MSK Radiology Research · Careers · Opportunities</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',borderRadius:8,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600 }}>✕</button>
        </div>

        {/* Tab bar */}
        <div onClick={e => e.stopPropagation()} style={{ display:'flex',gap:3,padding:'10px 16px 0',background:'#0f172a',flexShrink:0,position:'relative',zIndex:10 }}>
          {[
            { id:'research', label:'📰 Latest Research' },
            { id:'cme',      label:'🎓 CME' },
            { id:'jobs',     label:'💼 Jobs Board' },
            ...(isAdmin     ? [{ id:'admin', label:`🛡️ Admin${pending.length > 0 ? ` (${pending.length})` : ''}` }] : []),
          ].map(t => (
            <button key={t.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTab(t.id); if (t.id === 'admin') fetchPending(); if (t.id === 'jobs') fetchJobs(); }}
              style={{ padding:'9px 16px',borderRadius:'8px 8px 0 0',border:'1px solid '+(tab===t.id?'rgba(99,179,237,0.3)':'rgba(99,179,237,0.1)'),borderBottom:'none',background:tab===t.id?'#1a2332':'rgba(99,179,237,0.05)',color:tab===t.id?'#90cdf4':'#94a3b8',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap',pointerEvents:'auto',zIndex:1,position:'relative' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex:1,overflowY:'auto',padding:'20px 24px',background:'#1a2332' }}>

          {/* ── Research tab — existing ResearchModal content ── */}
          {tab === 'research' && <ResearchModalInner currentUser={currentUser} />}

          {/* ── Jobs Board tab ── */}
          {tab === 'jobs' && (
            <div>
              <div style={{ color:'#90cdf4',fontSize:15,fontWeight:700,marginBottom:16,paddingBottom:10,borderBottom:'1px solid rgba(99,179,237,0.1)' }}>MSK Radiology Opportunities</div>
              {loadingJobs && <p style={{ color:'#718096',fontSize:13 }}>Loading...</p>}
              {!loadingJobs && jobs.length === 0 && (
                <div style={{ textAlign:'center',color:'#4a5568',padding:'48px 24px' }}>
                  <div style={{ fontSize:40,marginBottom:12 }}>🩻</div>
                  <div style={{ fontSize:14 }}>No active job postings yet.</div>
                </div>
              )}
              {jobs.map(job => (
                <div key={job.id} style={{ background:'#0f172a',border:'1px solid rgba(99,179,237,0.1)',borderRadius:12,padding:'18px 20px',marginBottom:12 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,flexWrap:'wrap' }}>
                    <div style={{ color:'#e2e8f0',fontSize:16,fontWeight:700 }}>{job.title}</div>
                    <span style={{ background:'rgba(99,179,237,0.1)',color:'#90cdf4',borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700,border:'1px solid rgba(99,179,237,0.2)',flexShrink:0 }}>{job.job_type}</span>
                  </div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:12,margin:'8px 0',color:'#718096',fontSize:12 }}>
                    <span>🏥 {job.institution}</span>
                    <span>📍 {job.location}</span>
                    {job.salary_range && <span>💰 {job.salary_range}</span>}
                    <span>⏳ Expires {new Date(job.expires_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color:'#a0aec0',fontSize:13,lineHeight:1.6,margin:'10px 0' }}>{job.description}</p>
                  <div style={{ display:'flex',gap:8,flexWrap:'wrap',alignItems:'center' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(job.apply_link.startsWith('http') ? job.apply_link : `mailto:${job.apply_link}`, '_blank'); }}
                      style={{ display:'inline-block',padding:'7px 18px',background:'rgba(99,179,237,0.1)',border:'1px solid rgba(99,179,237,0.3)',borderRadius:8,color:'#90cdf4',fontSize:12,fontWeight:700,textDecoration:'none',cursor:'pointer' }}>
                      {job.apply_link.startsWith('http') ? '🔗 Apply / Learn More →' : '✉️ Email to Apply →'}
                    </button>
                    <span style={{ color:'#4a5568',fontSize:11 }}>or copy:</span>
                    <span style={{ color:'#64748b',fontSize:11,fontFamily:'monospace',background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:5,padding:'3px 8px',userSelect:'all',cursor:'text' }}>{job.apply_link}</span>
                    {isAdmin && <button onClick={(e) => { e.stopPropagation(); removePost(job.id); }} style={{ padding:'7px 14px',background:'rgba(245,101,101,0.1)',border:'1px solid rgba(245,101,101,0.25)',borderRadius:8,color:'#fc8181',fontSize:12,fontWeight:600,cursor:'pointer' }}>Remove</button>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CME tab ── */}
          {tab === 'cme' && <CmeTabInner currentUser={currentUser} isAdmin={isAdmin} sbHeaders={sbHeaders} sbUrl={sbUrl} />}

          {/* ── Admin tab ── */}
          {tab === 'admin' && isAdmin && (
            <div>
              <div style={{ color:'#90cdf4',fontSize:15,fontWeight:700,marginBottom:16,paddingBottom:10,borderBottom:'1px solid rgba(99,179,237,0.1)' }}>
                Pending Approval
                {pending.length > 0 && <span style={{ background:'rgba(245,101,101,0.15)',color:'#fc8181',border:'1px solid rgba(245,101,101,0.3)',borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700,marginLeft:10 }}>{pending.length} pending</span>}
              </div>
              {pending.length === 0 && <div style={{ textAlign:'center',color:'#4a5568',padding:'48px 24px',fontSize:14 }}>✅ No posts pending approval.</div>}
              {pending.map(job => (
                <div key={job.id} style={{ background:'#0f172a',border:'1px solid rgba(245,189,64,0.2)',borderRadius:12,padding:'18px 20px',marginBottom:12 }}>
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8,flexWrap:'wrap' }}>
                    <div style={{ color:'#e2e8f0',fontSize:15,fontWeight:700 }}>{job.title}</div>
                    <span style={{ background:'rgba(245,189,64,0.1)',color:'#f6bd40',borderRadius:6,padding:'2px 10px',fontSize:11,fontWeight:700,border:'1px solid rgba(245,189,64,0.3)',flexShrink:0 }}>{job.job_type}</span>
                  </div>
                  <div style={{ display:'flex',flexWrap:'wrap',gap:12,margin:'8px 0',color:'#718096',fontSize:12 }}>
                    <span>🏥 {job.institution}</span>
                    <span>📍 {job.location}</span>
                    {job.salary_range && <span>💰 {job.salary_range}</span>}
                    <span>📅 Submitted {new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color:'#a0aec0',fontSize:13,lineHeight:1.6,margin:'10px 0' }}>{job.description}</p>
                  <div style={{ display:'flex',gap:8 }}>
                    <button onClick={() => approvePost(job.id)} style={{ padding:'7px 16px',background:'rgba(104,211,145,0.12)',border:'1px solid rgba(104,211,145,0.3)',borderRadius:8,color:'#68d391',fontSize:13,fontWeight:600,cursor:'pointer' }}>✅ Approve</button>
                    <button onClick={() => removePost(job.id)}  style={{ padding:'7px 16px',background:'rgba(245,101,101,0.1)', border:'1px solid rgba(245,101,101,0.25)',borderRadius:8,color:'#fc8181', fontSize:13,fontWeight:600,cursor:'pointer' }}>🗑️ Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── RESEARCH MODAL INNER (extracted so it works inside MSKHub) ───────────────
// This is the original ResearchModal body, refactored as a sub-component
function ResearchModal({ onClose, currentUser }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:'8px' }}>
      <div style={{ background:'#0f172a',borderRadius:16,width:'min(99vw,860px)',height:'min(96vh,1000px)',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ background:'linear-gradient(135deg,#065f46,#059669)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0 }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:18 }}>📰</span>
            <div>
              <div style={{ color:'white',fontWeight:800,fontSize:14,letterSpacing:'0.08em' }}>LATEST MSK RADIOLOGY RESEARCH</div>
              <div style={{ color:'rgba(255,255,255,0.6)',fontSize:11,marginTop:1 }}>Weekly article reviews — key findings distilled for clinical practice</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',color:'white',borderRadius:8,padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600 }}>✕</button>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'20px 24px' }}>
          <ResearchModalInner currentUser={currentUser} />
        </div>
      </div>
    </div>
  );
}

// ─── MSK DDx MODAL ─────────────────────────────────────────────────────────
function DdxModal({ onClose }) {
  const [tissueType, setTissueType] = useState('bone');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [boneLocation, setBoneLocation] = useState('epiphysis');
  const [depth, setDepth] = useState('deep');
  const [ctLytic, setCtLytic] = useState(false);
  const [ctSclerotic, setCtSclerotic] = useState(false);
  const [ctGroundGlass, setCtGroundGlass] = useState(false);
  const [ctChondroid, setCtChondroid] = useState(false);
  const [mriT1, setMriT1] = useState('');
  const [mriT2, setMriT2] = useState('');
  const [mriContrast, setMriContrast] = useState('');
  const [adcValue, setAdcValue] = useState('');
  const [gender, setGender] = useState('');
  const [ctDensity, setCtDensity] = useState('');
  const [macroFat, setMacroFat] = useState(false);
  const [softTissueExt, setSoftTissueExt] = useState(false);
  const [endostalScalloping, setEndostalScalloping] = useState(false);
  const [periostealRxn, setPeriostealRxn] = useState(false);
  const [fluidFluidLevels, setFluidFluidLevels] = useState(false);
  const [marrowEdema, setMarrowEdema] = useState(false);
  const [ddxResult, setDdxResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const inp = { width:'100%',padding:'8px 10px',border:'1px solid #e2e8f0',borderRadius:8,fontSize:13,color:'#1e293b',background:'white',boxSizing:'border-box' };
  const lbl = { fontSize:11,fontWeight:600,color:'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',display:'block',marginBottom:4 };

  const generateDdx = async () => {
    setIsGenerating(true);
    setDdxResult('');
    const ctFindings = [ctLytic&&'lytic',ctSclerotic&&'sclerotic/blastic',ctGroundGlass&&'ground glass',ctChondroid&&'chondroid matrix'].filter(Boolean).join(', ');
    const aggressiveFeatures = [
      softTissueExt&&'extra-osseous soft tissue extension',
      endostalScalloping&&'deep endosteal scalloping (>2/3 cortical thickness)',
      periostealRxn&&'periosteal reaction',
      fluidFluidLevels&&'fluid-fluid levels',
      marrowEdema&&'marrow edema around intraosseous lesion',
    ].filter(Boolean).join(', ');
    const prompt = `You are a subspecialty MSK radiologist. Generate a prioritized differential diagnosis.

Patient: Age ${age||'unknown'}, Gender: ${gender||'not specified'}, Location: ${location||'not specified'}
Tissue type: ${tissueType}
${tissueType==='bone' ? `Bone location (epiphysis/metaphysis/diaphysis): ${boneLocation}` : `Depth: ${depth} to fascia`}
${ctFindings ? `CT matrix/density: ${ctFindings}` : ''}
${ctDensity ? `CT density relative to muscle: ${ctDensity}` : ''}
${macroFat ? 'Macroscopic fat present (T1 bright, drops on fat-sat)' : ''}
${aggressiveFeatures ? `Aggressive/additional features: ${aggressiveFeatures}` : ''}
${mriT1 ? `MRI T1: ${mriT1}` : ''}
${mriT2 ? `MRI T2: ${mriT2}` : ''}
${mriContrast ? `MRI enhancement: ${mriContrast}` : ''}
${adcValue ? `ADC value: ${adcValue} x10-3 mm2/s` : ''}

Provide a ranked differential with CONFIDENCE LEVELS:

TOP DIFFERENTIAL DIAGNOSES (ranked by likelihood):
For each diagnosis provide:
- Diagnosis name
- Confidence level: HIGH / MODERATE / LOW
- Key supporting features from the given data
- Distinguishing features from next diagnosis

Then provide:
KEY DISTINGUISHING FEATURES for top diagnosis
RECOMMENDED NEXT STEPS
RED FLAGS suggesting malignancy

Be concise and clinically actionable. Use WHO 2020 bone tumor classification, Kransdorf/Murphey criteria, and USP6 family recognition criteria (Broski & Wenger, Skeletal Radiol 2023).

IMPORTANT: If the pattern fits a USP6-driven neoplasm (myositis ossificans, ABC, nodular fasciitis, FOPD, fibroma of tendon sheath), explicitly flag this in your response with a USP6 FAMILY ALERT. These lesions mimic malignancy but are benign.

IMPORTANT: If a vertebral or sacrococcygeal lesion is described as T1 hypointense, T2 hyperintense, non-enhancing, centrally located, ± mild sclerosis, ± multifocal, WITHOUT lysis / extraosseous mass / avid enhancement — place BENIGN NOTOCHORDAL CELL TUMOR (BNCT) at the top of the differential. Flag with a BNCT ALERT and state that biopsy is NOT recommended for typical BNCT; imaging surveillance is appropriate.`;

    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1200,
          system:`You are a subspecialty MSK radiologist expert in bone and soft tissue tumor imaging. Provide evidence-based differential diagnoses using WHO 2020 bone tumor classification, Kransdorf/Murphey criteria, and current molecular pathology knowledge.

CRITICAL KNOWLEDGE — USP6-DRIVEN NEOPLASM FAMILY (Broski & Wenger, Skeletal Radiol 2023):
Recognize this family of benign self-limiting mesenchymal neoplasms that share USP6 gene rearrangements on chr 17p13. All occur in young adults, often show RAPID GROWTH mimicking malignancy, and have overlapping imaging features. Members:

1. MYOSITIS OSSIFICANS: Intramuscular, 3 stages (early/intermediate/mature).
   - Early: Non-specific soft tissue mass, T1 iso/hypointense, T2 hyperintense, perilesional edema — mimics sarcoma
   - Key MRI: "striate" pattern (intact muscle fibers coursing through mass on images parallel to fibers)
   - Pathognomonic: PERIPHERAL zonal calcification (centripetal) — OPPOSITE to extraskeletal osteosarcoma (central/centrifugal)
   - With time: shrinks, edema resolves, develops internal fat signal (marrow maturation)
   - US: outer hypoechoic / middle hyperechoic (calcifying rim) / central hypoechoic zones
   - FDG PET: may be avid — peripheral calcification on CT component is key

2. ANEURYSMAL BONE CYST (ABC) — Primary (USP6+) vs Secondary (USP6−):
   - Location: metaphysis of long bones, posterior vertebral elements
   - XR/CT: lytic, expansile, eccentric metaphyseal, narrow zone of transition, thin cortical shell, delicate trabeculation (periosteal ridges not true bony septations)
   - MRI: multiple fluid-fluid levels (REQUISITE for conventional ABC), variable T1/T2 signal cysts, thin peripheral/septal enhancement
   - Scintigraphy: classic "doughnut sign" (photopenic center + peripheral uptake)
   - ABC vs Telangiectatic Osteosarcoma: ABC = intact expanded cortex, no periosteal reaction, no soft tissue mass, thin septal enhancement, >2/3 cystic spaces with FFL. TOS = cortical destruction, periosteal reaction, soft tissue mass, nodular enhancement — 22% of TOS misdiagnosed as ABC on imaging alone → USP6 analysis critical
   - Surface (periosteal) ABC: diaphyseal, scalloped cortical defect, may mimic periosteal osteosarcoma or chondroma → USP6 analysis invaluable

3. SOLID ABC (Giant Cell Lesion of Small Bones): 5% of ABCs; solidly enhancing T2 hyperintense soft tissue component; FFL may be absent; marked FDG uptake may mimic metastasis/sarcoma

4. SOFT TISSUE ABC: ~60 reported cases; mean age 30y; thin peripheral eggshell calcification + FFL + perilesional edema; GROWS (unlike myositis ossificans which stabilizes/involutes); FFL only 4/10 on MRI; often needs surgical resection

5. NODULAR FASCIITIS (most common benign fibrous ST tumor):
   - Age 20-40y; volar forearm, extremities; RAPID GROWTH; self-limiting (spontaneous regression months)
   - MRI: ovoid, broad fascial base, low T1/heterogeneous high T2, perilesional edema, heterogeneous enhancement with areas of nonenhancement
   - Key signs: "fascia tail sign" (broad fascial base + linear extension along fascia), "inverted target sign" (central T2 hyperintense focus in hypointense background = cystic degeneration/myxoid)
   - Intramuscular subtype: most likely mistaken for sarcoma (larger, deeper, less well-defined)
   - FDG PET: variable uptake, may mimic metastasis
   - DDx: desmoid fibromatosis, myxofibrosarcoma, MPNST; if intramuscular add sarcoma and myositis ossificans

6. FIBROMA OF TENDON SHEATH (Tenosynovial Nodular Fasciitis):
   - Age 20-50y; 82% in distal upper extremity (fingers/hands/wrists); painless, slow-growing
   - MRI: LOWER signal than muscle on BOTH T1 and T2 (high collagen); may have increased T2 in cellular/myxoid variants
   - Key DDx: Tenosynovial Giant Cell Tumor (formerly GCTTS) — "blooming artifact" on GRE strongly favors TSGCT; FTS has central T2 hypointensity + oval morphology; TSGCT has peripheral T2 hypointensity + lobular morphology; T2 signal ratio tumor:tendon >3 favors TSGCT

7. FIBRO-OSSEOUS PSEUDOTUMOR OF DIGITS (FOPD):
   - Subcutaneous fingers (especially index finger); young adults; rapid growth
   - XR/MRI: subcutaneous soft tissue mass with variable/amorphous mineralization ± partial zonal ossification (less complete than myositis ossificans)
   - Radiolucent cleft separating from bone (no attachment); no periostitis
   - Key DDx: florid reactive periostitis, BPOP, turret exostosis, periosteal chondroma

SHARED USP6 FAMILY RED FLAGS FOR BENIGN DIAGNOSIS (NOT malignancy):
- Young adult + rapid growth + peripheral zonal ossification → myositis ossificans NOT sarcoma
- Multiple FFL + thin septal enhancement + intact cortex → ABC NOT telangiectatic osteosarcoma
- Broad fascial base + fascia tail sign + spontaneous regression → nodular fasciitis NOT fibrosarcoma
- Low T1 AND T2 + finger/wrist + tendon association → fibroma of tendon sheath NOT TSGCT/sarcoma
- Subcutaneous finger mass + amorphous ossification + radiolucent bone cleft → FOPD NOT extraskeletal osteosarcoma

USP6 NEGATIVITY does not exclude diagnosis (sensitivity <100% for all entities).
Secondary ABC (USP6−) occurs with: chondroblastoma, GCT, osteoblastoma, fibrous dysplasia.
Telangiectatic osteosarcoma is USP6− — biopsy with USP6 analysis critical when ABC vs TOS unclear.

--- UPDATED KNOWLEDGE: SKELETAL RADIOLOGY 2023 PAPERS ---

PAPER A — TSGCT DIGITS: LOCALIZED vs DIFFUSE (Jeong et al, Skel Radiol 2023, n=28):
LOCALIZED TYPE (n=22): median 1.8cm, single nodule, CIRCUMSCRIBED margin, PERIPHERAL HYPOINTENSE RIM on T2 (86.4%), speckled central hypointensity (faint hemosiderin), bone erosion 50%, articular involvement 18%, muscle involvement 0%, recurrence <15%. En bloc resection curative.
DIFFUSE TYPE (n=6): median 4.3cm, MULTINODULAR (66.7%), INFILTRATIVE margin (83.3%), NO peripheral rim (0%), GRANULAR central hypointensity (83.3%) = strong hemosiderin, articular involvement 100%, muscle involvement 67%, tendon destruction 67%, recurrence 50%. Requires adjuvant therapy.
ROC BEST DISCRIMINATORS for diffuse type: absent peripheral rim AUC 0.932 (sens 100%, spec 86%), infiltrative margin AUC 0.917, articular involvement AUC 0.909.
NOT DISCRIMINATORY: bone erosion (both types), neurovascular encasement (both types), septum (both types ~83-91%).
KEY CLINICAL POINT: Both types arise from tendon sheath digits (extra-articular). Diffuse type = higher recurrence, often requires radical resection +/- pexidartinib (CSF1 inhibitor). Diffuse TSGCT digit = extra-articular equivalent of PVNS.

PAPER B — NOVEL FUSION SARCOMAS: ROUND CELL, SPINDLE CELL, TARGETABLE TK, GIANT CELL (Fanburg-Smith et al, Skel Radiol 2023):
ROUND CELL TUMORS:
- Classic Ewing (EWSR1::FLI1 80%, EWSR1::ERG 8%): diaphyseal long bone, large soft tissue component, minimal periosteal reaction, CD99 crisp cytoplasmic membrane staining, poor prognosis.
- CIC-REARRANGED sarcoma (CIC::DUX4): young adults (older than Ewing), larger/more necrosis/myxoid change, WT1+ nuclear-to-Golgi dot pattern, CD99 Golgi only, DISMAL prognosis. FDG uptake higher than Ewing. Treat like Ewing but outcomes poor.
- BCOR-ALTERED sarcoma (BCOR::CCNB3): teens, pelvis/lower extremity, lytic or sclerotic, T2 heterogeneous with flow voids, CD99 NEGATIVE, BCOR+ CCNB3+, similar/slightly better than Ewing. BCOR::ITD = aggressive infantile variant (<=2yr), invades spinal canal.
- EWSR1/FUS::NFATc2 SOLID: young adults, long bone metadiaphysis, EWSR1 amplification on FISH (key feature), mTOR targetable, behavior better than Ewing with survival after metastasectomy. IHC: CD99+, EMA+, low MIB1. DO NOT respond to Ewing therapy.
- EWSR1/FUS::NFATc2 CYSTIC (Unicameral Bone Cyst variant): 40-67% of simple bone cysts harbor this fusion; well-defined lytic metaphyseal lesion + fracture (fallen fragment sign), NO mass/nodule on MRI; peripheral rim enhancement only; local recurrence common, NO metastases. These lack EWSR1 amplification (distinguishes from solid type).
- EWSR1/FUS::NFATc2 VASCULAR: mimics intraosseous hemangioma/sclerosing hemangioma; multifocal possible (rib/pelvis/spine/femur); arcs-and-rings matrix confuses with cartilage DDx; favorable outcome to date.
SPINDLE CELL:
- INTRAOSSEOUS RMS (EWSR1/FUS::TFCP2): young adults, craniofacial/gnathic/rib/long bones, LARGE LYTIC MASS WITH CORTICAL DESTRUCTION, NO MATRIX (critical feature — distinguishes from osteosarcoma), ALK+, MyoD1+, myogenin rare/absent, desmin variable. High grade, aggressive. Key DDx clue: no osteoid matrix despite aggressive appearance.
TARGETABLE TYROSINE KINASE FUSIONS (children/young adults, RAS::MAPK pathway):
- ALK fusion sarcoma: MIMICS VASCULAR MALFORMATION (infiltrative, pericytoid vessels, feeder vessels); low-intermediate T2; infiltrative pattern with fascial tails; FDG avid; treat with Crizotinib.
- NTRK fusion sarcoma: bone or soft tissue; IN BONE MIMICS OSTEOSARCOMA (metaphyseal, cortical destruction) BUT NO MATRIX/MINERALIZATION — if young patient + intraosseous + no matrix -> NGS mandatory; high-grade with TPR/KANK1 fusions; treat with Larotrectinib.
- Other BRAF/RAF1/RET/FGFR1/ABL1 fusions: similar infiltrative ovoid-spindled pattern; targetable with respective inhibitors.
- SHARED IHC: focal S100+, focal CD34+, SOX10 NEGATIVE (distinguishes from nerve sheath); NGS required for final classification.
GIANT CELL RICH TUMORS:
- GCT BONE (H3F3A G34W mutation): classic metaphyseal eccentric lytic to "end of bone," adults; G34W stains mononuclear cells but spares osteoclast giant cells; denosumab knocks out monocytic cells leaving spindled stromal cells which can form bone.
- PRIMARY MALIGNANT GCT: nodule of UPS-like or osteosarcoma-like area within classic GCT; both components G34W+; cortical destruction/sclerotic change radiologically.
- TSGCT/PVNS (CSF1 rearrangement, targetable with PEXIDARTINIB): intra- or extra-articular; low T2 + GRE blooming = pathognomonic; MALIGNANT TSGCT = loss of giant cells, epithelioid histiocytoid, >10 mitoses/10hpf, necrosis — CSF1 often ABSENT in malignant foci -> pexidartinib ineffective for malignant cases.
- GIANT CELL TUMOR SOFT TISSUE (HMGA2::NCOR2): well-delineated soft tissue mass, homogeneous enhancement +/- ABC-like cystic change; keratin AE1/3 stains mononuclear stromal cells (spares giant cells); borderline/low grade.

PAPER C — PET/MR PEDIATRIC BONE TUMORS (Padwal et al, Skel Radiol 2023):
KEY ADVANTAGES of 18F-FDG PET/MR over PET/CT: >=73% radiation reduction, superior soft tissue contrast, single anesthesia, simultaneous local + whole-body staging in ~60 min.
OSTEOSARCOMA on PET/MR: soft tissue components T2-hyperintense + FDG-avid; bone-forming components T2-hypointense + low FDG avidity -> heterogeneous appearance. Photopenic center = poor prognosis. Tumor thrombus up to 40% (SUVmax 7.9-20 for tumor thrombus vs no uptake for benign thrombus). Post-therapy SUVmax <2.5 = good response; SUVmax >5 = poor response. Skip lesions detected with 95.2% accuracy by PET vs 66.7% conventional imaging.
EWING SARCOMA on PET/MR: restricted diffusion + hypermetabolic. Pre-therapy SUVmax >=12 = poor response predictor. FDG reduction >30% after chemo = treatment response. PET > bone scan for osseous metastases (88% vs 37%). CHECK PANCREAS for metastases (specific affinity unique to Ewing). RECIST criteria DO NOT apply to bone tumors.
BONE LYMPHOMA on PET/MR: T1 hypointense, markedly restricted diffusion, T2 LOWER than sarcomas (unique feature), cortex typically intact (spreads via Haversian canals). FDG PPV up to 100% for active disease. Response by Lugano criteria.
LCH on PET/MR: proliferative phase = T2 hyperintense + restricted diffusion + enhancement + marked FDG uptake. Treated LCH = T2 iso/hypointense + less diffusion restriction + less FDG. BRAF V600E mutation associated. PET/CT superior to bone surveys/MR/CT/bone scan for active lesion detection.

--- UPDATED KNOWLEDGE: SKELETAL RADIOLOGY 2023 PAPERS (BATCH 2) ---

PAPER D — CHORDOMA & BNCT (Murphey et al, Skel Radiol 2023):
BNCT (BENIGN NOTOCHORDAL CELL TUMOR):
- Incidence: 19% of cadaveric spines; clivus 11.5%, sacrococcygeal 12%, cervical 5%, thoracic 0%, lumbar 2%
- Radiograph: usually OCCULT; larger lesions show mild patchy sclerosis
- CT: PATCHY SCLEROSIS with MAINTAINED TRABECULAR ARCHITECTURE (trabeculae infiltrated but NOT destroyed) — key distinguishing feature; lesions typically <35mm; NO osteolysis
- MRI: low-intermediate T1 (marrow replacement), HIGH T2 signal (myxoid); minute foci of preserved yellow marrow fat on T1 = diagnostic clue; NO contrast enhancement; NO cortical destruction; NO soft tissue mass
- Bone scan/PET: usually NORMAL or mildly reduced uptake
- MANAGEMENT: BIOPSY NOT WARRANTED for typical BNCT — biopsy may provoke misdiagnosis as chordoma leading to unnecessary surgery; imaging surveillance recommended
- ANCT (Atypical Notochordal Cell Tumor): term for BNCT with atypical features (minute soft tissue extension, faint enhancement, small lytic foci); requires close follow-up but usually minimal progression over 3-10 years

CONVENTIONAL CHORDOMA (CC):
- Demographics: age 50-60 years (median 60), 2:1 male, Caucasian; 1-4% of primary malignant bone tumors
- Location: sacrococcygeal 50%, sphenooccipital (clival) 33%, mobile spine 17%; sacrococcygeal predilection for S4-S5; mobile spine predilection for C2
- Clinical: slow growing, insidious onset; sacrococcygeal symptoms = back pain, constipation, neuropathy; bowel/bladder incontinence = late/ominous sign
- Radiograph: large mixed lytic-sclerotic midline lesion; CALCIFICATION 50-70% sacrococcygeal; mobile spine shows ivory vertebra or bone destruction; disc space SPARED (extends around disc, not through it)
- CT: predominantly lytic + presacral soft tissue mass; calcification 60-90%; low attenuation (myxoid); pseudocapsule; mild-moderate septal/peripheral enhancement
- MRI: T1 low-intermediate; T2 HIGH (92-100%) = hallmark; MULTILOBULATED with septations (100%); hemorrhage 66-77% (high T1+T2); heterogeneous enhancement (95%); soft tissue mass 100% sacrococcygeal; SI joint transgression 23%; multilevel extension AROUND disc spaces (disc-SPARING)
- FDG-PET: moderate uptake (SUVmax avg 5.8); useful for treatment monitoring

DEDIFFERENTIATED CHORDOMA (DC):
- Biphasic: CC component + HIGH GRADE sarcoma component (UPS-like or osteosarcoma-like)
- MRI BIMORPHIC: CC portion = high T2/low enhancement; dedifferentiated portion = INTERMEDIATE T2 + PROMINENT ENHANCEMENT + lower ADC
- More aggressive than CC; dismal prognosis

POORLY DIFFERENTIATED CHORDOMA (PDC):
- Age 1-29 years (median 11), female 2:1; CLIVUS/CERVICAL SPINE predominance (rarely sacrococcygeal)
- IHC: brachyury+ cytokeratin+ but S100 NEGATIVE; INI1 (SMARCB1) LOSS = key diagnostic feature
- MRI: LOWER T2 signal than CC (more cellular, less myxoid); avid enhancement; lower ADC
- Very aggressive, early metastases, dismal prognosis

BNCT vs CC KEY DISCRIMINATORS:
- BNCT: maintained trabeculae + patchy sclerosis + no bone destruction + no soft tissue mass + no enhancement = BENIGN, surveillance only
- CC: cortical destruction + soft tissue mass + enhancement = MALIGNANT, aggressive treatment
- ANCT: between these two; biopsy + follow-up required
- TREATMENT: wide en-bloc resection + proton beam RT (50-60% local control at 5yr); local recurrence 19-75%; 5-yr survival 45-86%

BNCT PATTERN RECOGNITION — ACTIVE TRIGGER RULE:
When a vertebral or sacrococcygeal bone lesion is described with ALL of the following features, place BNCT at the TOP of the differential diagnosis list:
  REQUIRED POSITIVE features: T1 hypointense (marrow replacement), T2 hyperintense, NO contrast enhancement, central location within the vertebral body/segment, ± mild sclerosis on CT, ± multifocal involvement
  REQUIRED NEGATIVE features (must be absent): NO lytic destruction, NO extraosseous/soft tissue mass, NO avid or moderate enhancement
If ANY of the following are present, remove BNCT from the differential and elevate chordoma or dedifferentiated chordoma: frank osteolysis, extraosseous soft tissue extension, avid enhancement. Flag this exclusion explicitly.
Format when BNCT is top diagnosis: "1. Benign notochordal cell tumor (BNCT) — imaging features are characteristic: T1 hypointense, T2 hyperintense, no enhancement, no soft tissue mass, [± patchy sclerosis], central vertebral location. Biopsy is NOT recommended for typical BNCT; imaging surveillance is appropriate. If any atypical features develop (soft tissue extension, enhancement, lysis), upgrade to atypical notochordal cell tumor (ANCT) and consider biopsy."

PAPER E — WHO 2020 BONE TUMOR CLASSIFICATION (Hwang, Hameed, Kransdorf, Skel Radiol 2023):
KEY RECLASSIFICATIONS:
- CHONDROBLASTOMA: moved to BENIGN (recurrence <=5%, no distant mets)
- CHONDROMYXOID FIBROMA: moved to BENIGN (despite 3-22% local recurrence)
- ABC: USP6 rearrangement in 70% of primary ABCs (key diagnostic marker); "giant cell lesion of small bones" = solid ABC variant; old terminology NO LONGER RECOMMENDED
- SYNOVIAL CHONDROMATOSIS: BENIGN to INTERMEDIATE (locally aggressive); malignant transformation 1-6.4% (median 20yr); marrow invasion + cortical destruction = chondrosarcomatous transformation
- OFD-LIKE ADAMANTINOMA: malignant to INTERMEDIATE (locally aggressive); 20% local recurrence
- EPITHELIOID HEMANGIOMA: now INTERMEDIATE (locally aggressive ONLY, no longer rarely metastasizing); FOS/FOSB rearrangements; multifocal 18-25%
- ERDHEIM-CHESTER DISEASE: now HEMATOPOIETIC NEOPLASM; bilateral diaphyseal/metaphyseal osteosclerosis of long bones SPARING axial skeleton/hands/feet; cardiac + retroperitoneal involvement >50%; BRAF inhibitors (dabrafenib) effective; shares MAPK pathway mutations with LCH and Rosai-Dorfman

ENCHONDROMA vs ACT/CS1:
- ACT (appendicular) = CS1 (axial/flat bones) — HISTOLOGICALLY IDENTICAL, distinguished by location only
- Features favoring ACT/CS1 over enchondroma: size >5cm, endosteal scalloping >2/3 cortex, expansile remodeling, cortical destruction, soft tissue extension, pain, bone scan uptake
- Presence of marrow fat + no deep scalloping = enchondroma or regression; 87% of enchondromas stable/regress on MRI
- Secondary peripheral CS from osteochondroma: cartilage cap >2.0cm (perpendicular to tidemark) = malignancy threshold

NEW 2020 WHO ENTITIES:
- HIBERNOMA OF BONE: benign brown adipocyte tumor; spine/pelvis; older women; sclerotic 64%, lytic 18%; variable T1 fat signal; SUVmax 3.0-4.1 on PET
- FIBROCARTILAGINOUS MESENCHYMOMA: locally aggressive; age <30; metaphysis of long bones/pelvis; lytic + sclerotic rim + cortical destruction; no GNAS/IDH/MDM2 (distinguishes from FD/CS/low-grade OS)
- DEDIFFERENTIATED ADAMANTINOMA: new malignant entity; classic adamantinoma + sarcomatoid transition; metastases in 2/3 patients
- ROSAI-DORFMAN DISEASE: reclassified from benign; bone 5-10%; intramedullary lytic + cortical destruction + mimics malignancy

OSTEOSARCOMA: now 6 subtypes; secondary OS is now separate entity with 6 subtypes (Paget, radiation, infarct, osteomyelitis, implant, fibrous dysplasia)

PAPER F — ANGIOLIPOMA (Kransdorf et al, Skel Radiol 2023, n=778 lesions, 344 patients):
CLINICAL PROFILE:
- ALL subcutaneous (100%); forearm 30.6%, arm 17%, thigh 14.4%; upper extremity >50% of all lesions
- Median size 2.4cm (range 0.4-7.7cm); multifocal 36% in this series
- PAINFUL (tenderness to palpation, worsens with pressure/elastic bands) — due to intracapillary FIBRIN THROMBI (pathognomonic finding)
- Molecular: PRKD2 mutations and/or PIK3CA activating mutations (PI3K/AKT pathway)
- Age: late teens to 80s; median 50 years; uncommon in children

ULTRASOUND:
- HETEROGENEOUS (virtually 100%) + MILDLY HYPERECHOIC vs adjacent fat (86.1%)
- Vascularity ABSENT 73.2% (key negative finding on color Doppler); mild vascularity 18.3%
- Ovoid shape; abuts skin 85.5%

CT:
- Fat in 85% of lesions
- KEY FEATURE: CURVILINEAR SUBCAPSULAR VASCULARITY (linear densities most prominent at periphery/subcapsular) = corresponds to peripheral capillary channels
- Cellular angiolipoma (>90% vascular) = no visible fat, prominent enhancement; can mimic Kaposi sarcoma

MRI:
- "DIRTY FAT" appearance on T1 (fat signal interrupted by vascular component)
- Moderate enhancement 69.2%; mild 19.2%
- CHEMICAL SHIFT IMAGING: signal dropout >56% confirms fat even when vascular component is confluent
- Small FOV + thin slices REQUIRED; routine protocols miss lesions

ANGIOLIPOMA vs LIPOMA CHEAT SHEET:
- Angiolipoma: HETEROGENEOUS + HYPERECHOIC + OVOID + PAINFUL + MULTIFOCAL + curvilinear vascularity CT + dirty fat MRI
- Lipoma: HOMOGENEOUS + ISOECHOIC + SPINDLE SHAPE + painless + NO vascularity (0%) + clean fat signal
- "Infiltrating angiolipoma" is OBSOLETE TERM; WHO now calls these INTRAMUSCULAR ANGIOMAS (unrelated entity)`,

          messages:[{role:'user',content:prompt}],
        }),
      });
      const data = await res.json();
      setDdxResult(data?.content?.[0]?.text || 'Error generating DDx.');
    } catch { setDdxResult('Network error. Please try again.'); }
    setIsGenerating(false);
  };

  const tog = (val, setter, current) => (
    <button onClick={() => setter(current === val ? '' : val)}
      style={{ padding:'6px 12px',borderRadius:7,border:'1px solid '+(current===val?'#2563eb':'#e2e8f0'),background:current===val?'#eff6ff':'white',color:current===val?'#2563eb':'#64748b',fontSize:12,fontWeight:current===val?700:400,cursor:'pointer',whiteSpace:'nowrap' }}>
      {val}
    </button>
  );

  const chk = (label, val, setter) => (
    <label style={{ display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:12,color:val?'#1e293b':'#64748b' }}>
      <input type="checkbox" checked={val} onChange={e=>setter(e.target.checked)} style={{ width:14,height:14,accentColor:'#2563eb' }}/>
      {label}
    </label>
  );

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16 }}>
      <div style={{ background:'white',borderRadius:16,width:'min(95vw,820px)',maxHeight:'92vh',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 25px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
          <div style={{ display:'flex',alignItems:'center',gap:10 }}>
            <span style={{ fontSize:20 }}>🔬</span>
            <span style={{ color:'white',fontWeight:800,fontSize:15,letterSpacing:'0.06em' }}>MSK LESION DDx GENERATOR</span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.15)',border:'none',color:'white',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontSize:13,fontWeight:600 }}>✕ Close</button>
        </div>
        <div style={{ display:'flex',flex:1,overflow:'hidden',minHeight:0 }}>
          {/* Left — inputs */}
          <div style={{ width:320,borderRight:'1px solid #e2e8f0',padding:16,overflowY:'auto',flexShrink:0,display:'flex',flexDirection:'column',gap:12 }}>
            {/* Tissue type toggle */}
            <div>
              <label style={lbl}>Tissue Type</label>
              <div style={{ display:'flex',gap:6 }}>
                {['bone','soft tissue'].map(t => (
                  <button key={t} onClick={() => setTissueType(t)}
                    style={{ flex:1,padding:'8px 0',borderRadius:8,border:'2px solid '+(tissueType===t?'#2563eb':'#e2e8f0'),background:tissueType===t?'#eff6ff':'white',color:tissueType===t?'#2563eb':'#64748b',fontSize:13,fontWeight:tissueType===t?700:400,cursor:'pointer' }}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              <div style={{ flex:1 }}>
                <label style={lbl}>Age</label>
                <input style={inp} type="number" placeholder="e.g. 45" value={age} onChange={e=>setAge(e.target.value)}/>
              </div>
              <div style={{ flex:1 }}>
                <label style={lbl}>Gender</label>
                <div style={{ display:'flex',gap:5 }}>
                  {['M','F'].map(g => (
                    <button key={g} onClick={() => setGender(gender===g?'':g)}
                      style={{ flex:1,padding:'8px 0',borderRadius:8,border:'2px solid '+(gender===g?'#2563eb':'#e2e8f0'),background:gender===g?'#eff6ff':'white',color:gender===g?'#2563eb':'#64748b',fontSize:13,fontWeight:gender===g?700:400,cursor:'pointer' }}>
                      {g==='M'?'Male':'Female'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label style={lbl}>Anatomic Location</label>
              <input style={inp} placeholder="e.g. distal femur, thigh" value={location} onChange={e=>setLocation(e.target.value)}/>
            </div>
            {tissueType === 'bone' ? (
              <div>
                <label style={lbl}>Location in Bone</label>
                <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                  {['epiphysis','metaphysis','diaphysis','epiphysis/metaphysis','metadiaphysis'].map(v => tog(v, setBoneLocation, boneLocation))}
                </div>
              </div>
            ) : (
              <div>
                <label style={lbl}>Depth</label>
                <div style={{ display:'flex',gap:6 }}>
                  {['superficial (above fascia)','deep (below fascia)'].map(v => tog(v, setDepth, depth))}
                </div>
              </div>
            )}
            <div>
              <label style={lbl}>CT Matrix / Morphology</label>
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                {chk('Lytic', ctLytic, setCtLytic)}
                {chk('Sclerotic / blastic', ctSclerotic, setCtSclerotic)}
                {chk('Ground glass', ctGroundGlass, setCtGroundGlass)}
                {chk('Chondroid matrix', ctChondroid, setCtChondroid)}
              </div>
            </div>
            <div>
              <label style={lbl}>CT Density (vs Muscle)</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {['Hypodense','Isodense','Hyperdense'].map(v => tog(v, setCtDensity, ctDensity))}
              </div>
            </div>
            <div>
              <label style={lbl}>Macroscopic Fat</label>
              <div style={{ display:'flex',gap:6 }}>
                {chk('Fat present (T1 bright / CT -50 to -150 HU)', macroFat, setMacroFat)}
              </div>
            </div>
            <div>
              <label style={lbl}>Aggressive / Additional Features</label>
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                {chk('Extra-osseous soft tissue extension', softTissueExt, setSoftTissueExt)}
                {chk('Deep endosteal scalloping (>2/3 cortex)', endostalScalloping, setEndostalScalloping)}
                {chk('Periosteal reaction', periostealRxn, setPeriostealRxn)}
                {chk('Fluid-fluid levels', fluidFluidLevels, setFluidFluidLevels)}
                {chk('Marrow edema around intraosseous lesion', marrowEdema, setMarrowEdema)}
              </div>
            </div>
            <div>
              <label style={lbl}>MRI T1 Signal</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {['Low','Intermediate','High','Heterogeneous'].map(v => tog(v, setMriT1, mriT1))}
              </div>
            </div>
            <div>
              <label style={lbl}>MRI T2 Signal</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {['Low','Intermediate','High','Heterogeneous'].map(v => tog(v, setMriT2, mriT2))}
              </div>
            </div>
            <div>
              <label style={lbl}>MRI Contrast Enhancement</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:5 }}>
                {['None','Peripheral','Septal','Avid homogeneous','Heterogeneous'].map(v => tog(v, setMriContrast, mriContrast))}
              </div>
            </div>
            <div>
              <label style={lbl}>ADC Value (×10⁻³ mm²/s)</label>
              <input style={inp} placeholder="e.g. 0.8 (low) or 1.8 (high)" value={adcValue} onChange={e=>setAdcValue(e.target.value)}/>
            </div>
            <button onClick={generateDdx} disabled={isGenerating || (!age && !location)}
              style={{ width:'100%',padding:12,borderRadius:10,border:'none',background:(isGenerating||(!age&&!location))?'#e2e8f0':'linear-gradient(135deg,#4f46e5,#7c3aed)',color:(isGenerating||(!age&&!location))?'#94a3b8':'white',fontSize:14,fontWeight:700,cursor:(isGenerating||(!age&&!location))?'not-allowed':'pointer',letterSpacing:'0.02em',boxShadow:(isGenerating||(!age&&!location))?'none':'0 4px 16px rgba(124,58,237,0.35)' }}>
              {isGenerating ? '⏳ Generating DDx…' : '🔬 Generate DDx'}
            </button>
          </div>
          {/* Right — results */}
          <div style={{ flex:1,padding:16,overflowY:'auto',background:'#f8fafc' }}>
            {ddxResult ? (
              <div style={{ fontFamily:"'Segoe UI',system-ui,sans-serif",fontSize:13,lineHeight:1.7,color:'#1e293b' }}>
                {ddxResult.split('\n').map((line, i) => {
                  const t = line.trim();
                  const isH = /^#{1,3}\s|^[A-Z][A-Z\s]{2,}:/.test(t);
                  const isNum = /^\d+\./.test(t);
                  const isHigh = /\bHIGH\b/.test(t);
                  const isMod = /\bMODERATE\b/.test(t);
                  const isLow = /\bLOW\b/.test(t);
                  const confColor = isHigh ? '#dc2626' : isMod ? '#d97706' : isLow ? '#6b7280' : null;
                  return (
                    <div key={i} style={{ marginTop: isH ? 14 : isNum ? 8 : 2 }}>
                      {isH
                        ? <span style={{ fontSize:11,fontWeight:800,color:'#4f46e5',textTransform:'uppercase',letterSpacing:'0.08em',borderBottom:'1px solid #e0e7ff',display:'block',paddingBottom:3 }}>{t.replace(/^#+\s/,'')}</span>
                        : isNum
                          ? <span style={{ color:'#1e293b',fontWeight:700 }}>{t}</span>
                          : confColor
                            ? <span style={{ display:'inline-block',padding:'2px 8px',borderRadius:6,background:isHigh?'#fef2f2':isMod?'#fffbeb':'#f9fafb',color:confColor,fontWeight:700,fontSize:11,marginBottom:2 }}>{t}</span>
                            : <span style={{ color:'#374151' }}>{t}</span>
                      }
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:12,color:'#94a3b8' }}>
                <div style={{ fontSize:48 }}>🦴</div>
                <div style={{ fontSize:14,fontWeight:600 }}>Enter patient details and imaging findings</div>
                <div style={{ fontSize:12,textAlign:'center',maxWidth:220,lineHeight:1.6 }}>Fill in age, location, and at least one imaging characteristic, then click Generate DDx</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REFERENCE PANEL ──────────────────────────────────────────────────────
function ReferencePanel({ selectedBodyPart, modality = 'MRI', spineRegion = 'lumbar', darkMode = false }) {
  const rawJointData = getEffectiveJointData(selectedBodyPart, modality);
  const jointData = (rawJointData && selectedBodyPart === 'spine') ? {
    ...rawJointData,
    measurements: (rawJointData.measurements || []).filter(m =>
      !m.spineRegions || m.spineRegions.includes(spineRegion)
    )
  } : rawJointData;
  const [selectedMeasurementId, setSelectedMeasurementId] = useState('');
  useEffect(() => { setSelectedMeasurementId(''); }, [selectedBodyPart, modality]);
  const selectedMeasurement = jointData?.measurements?.find(m => m.id === selectedMeasurementId);
  const accent = '#0891b2';
  const dm = darkMode;
  if (!jointData) return <div style={{ color:'#94a3b8',fontSize:13,textAlign:'center',padding:20 }}>{modality === 'CT' ? 'No CT fracture classification available for this region. Switch to a specific bone region or select MRI for grading scales.' : 'Select a body part.'}</div>;
  return (
    <div style={{ display:'flex',flexDirection:'column',gap:0,height:'100%' }}>
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent,margin:0 }}>{jointData.label}</p>
        <select style={{ width:'100%',padding:'8px 10px',border:'1px solid '+(dm?'#334155':'#e2e8f0'),borderRadius:8,fontSize:13,background:dm?'#0f172a':'white',cursor:'pointer',color:dm?'#e2e8f0':'#1e293b',boxSizing:'border-box' }}
          value={selectedMeasurementId} onChange={e => setSelectedMeasurementId(e.target.value)}>
          <option value="">— Select a measurement —</option>
          {(jointData.measurements||[]).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
        {selectedMeasurement ? (
          <div style={{ display:'flex',flexDirection:'column',gap:8 }}>
            <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
              <span style={{ display:'inline-block',padding:'2px 8px',background:dm?'#0c4a6e':'#e0f2fe',color:dm?'#7dd3fc':'#0369a1',borderRadius:999,fontSize:11,fontWeight:600,width:'fit-content' }}>{selectedMeasurement.plane}</span>
              {selectedMeasurement.description ? <p style={{ fontSize:12,color:dm?'#94a3b8':'#64748b',margin:0,lineHeight:1.5 }}>{selectedMeasurement.description}</p> : null}
            </div>
            <div style={{ border:'1px solid '+(dm?'#334155':'#e2e8f0'),borderRadius:8,overflow:'hidden',background:dm?'#0f172a':'#fafbfc',padding:8 }}>
              {selectedMeasurement.canalImages ? (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                  {selectedMeasurement.canalImages.map((img,idx) => (
                    <div key={idx} style={{ textAlign:'center' }}>
                      <img src={img.src} alt={img.label} style={{ width:'100%', borderRadius:4, display:'block', marginBottom:3 }} />
                      <p style={{ fontSize:11, fontWeight:600, color:dm?'#e2e8f0':'#1e293b', margin:0 }}>{img.label}</p>
                    </div>
                  ))}
                </div>
              ) : selectedMeasurement.modicImages ? (
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {selectedMeasurement.modicImages.map((img,idx) => (
                    <div key={idx} style={{ background:dm?'#0f172a':'white', border:'1px solid '+(dm?'#334155':'#e2e8f0'), borderRadius:6, padding:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:4 }}>
                        <span style={{ fontSize:12, fontWeight:700, color:dm?'#e2e8f0':'#1e293b' }}>{img.label}</span>
                        <span style={{ fontSize:11, color:dm?'#94a3b8':'#64748b' }}>{img.sublabel}</span>
                      </div>
                      <img src={img.src} alt={img.label} style={{ width:'100%', borderRadius:4, display:'block', marginBottom:4 }} />
                      <div style={{ display:'flex', justifyContent:'space-around' }}>
                        {img.colLabels.map((lbl,li) => (
                          <span key={li} style={{ fontSize:10, color:dm?'#94a3b8':'#64748b', fontWeight:500 }}>{lbl}</span>
                        ))}
                      </div>
                      <div style={{ textAlign:'center', marginTop:2 }}>
                        <span style={{ fontSize:10, color:dm?'#7dd3fc':'#0369a1' }}>{img.signalLine}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : selectedMeasurement.discZoneImage ? (
                <div>
                  <img src={selectedMeasurement.discZoneImage} alt='Disc zone locations' style={{ width:'100%', borderRadius:6, display:'block', marginBottom:6 }} />
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 10px', padding:'4px 2px' }}>
                    {[['#ef4444','Central'],['#22c55e','Paracentral'],['#3b82f6','Foraminal'],['#eab308','Extraforaminal']].map(([col,lbl]) => (
                      <span key={lbl} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:dm?'#e2e8f0':'#1e293b' }}>
                        <span style={{ width:10, height:10, borderRadius:2, background:col, display:'inline-block', flexShrink:0 }} />{lbl}
                      </span>
                    ))}
                  </div>
                </div>
              ) : selectedMeasurement.diagram === 'sanders_calcaneus' ? <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCANcBawDASIAAhEBAxEB/8QAHQABAAEFAQEBAAAAAAAAAAAAAAgDBAUGBwIBCf/EAGgQAAEDAwEEAwYNDQ0FBAkEAwABAgMEBREGBxIhMQgTQQkUIjdRYRUXGDJWV3GBlbO00dIjOEJVc3R1doSRk5SxFjM2R1JyhZKWocHE1CQ1YrLTJVPh8CY0OUNjgoOiwkRUo8NkZfH/xAAaAQEBAAMBAQAAAAAAAAAAAAAAAwECBgQF/8QAOBEBAAIBAAgFAgUDAgcBAAAAAAECAwQFERIhMTJREzNhcYEiQQYUIyVSQoKxkcE1YnKhwuHwkv/aAAwDAQACEQMRAD8AmWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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" alt="Sanders calcaneus classification" style={{width:'100%',maxWidth:520,display:'block',margin:'0 auto',borderRadius:4}} /> : (DIAGRAM_SVGS[selectedMeasurement.diagram] || <div style={{ padding:24,textAlign:'center',color:'#94a3b8',fontSize:12 }}>Diagram coming soon</div>)}
            </div>
            {selectedMeasurement.citations && (
              <div style={{ display:'flex',flexDirection:'column',gap:4 }}>
                <p style={{ fontSize:10,fontWeight:700,color:dm?'#64748b':'#64748b',textTransform:'uppercase',letterSpacing:'0.06em',margin:0 }}>📚 References</p>
                {selectedMeasurement.citations.map((c,i) => (
                  <a key={i} href={c.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:11,color:'#60a5fa',textDecoration:'none',lineHeight:1.5,display:'block',padding:'4px 8px',background:dm?'#1e3a5f':'#eff6ff',borderRadius:6,border:'1px solid '+(dm?'#1d4ed8':'#bfdbfe') }}>
                    📄 {c.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding:12,background:dm?'#0f172a':'#f0f9ff',borderRadius:8,color:dm?'#475569':'#64748b',fontSize:12,textAlign:'center',border:'1px dashed '+(dm?'#334155':'#bae6fd') }}>Select a measurement to see the diagram and references</div>
        )}
      </div>
      <div style={{ height:1,background:dm?'#334155':'linear-gradient(to right,transparent,#e2e8f0,transparent)',margin:'14px 0',flexShrink:0 }} />
      <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
        <p style={{ fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:accent,margin:0 }}>{selectedMeasurement?.id === 'modic_changes' ? '🔬 Imaging Findings' : selectedMeasurement?.id === 'disc_nomenclature' ? '📖 Terminology' : '📊 Normal Values'}</p>
        {selectedMeasurement ? (
          <table style={{ width:'100%',borderCollapse:'collapse',fontSize:12 }}>
            <tbody>
              {selectedMeasurement.normalValues.map((nv,i) => (
                <tr key={i} style={{ borderBottom:'1px solid '+(dm?'#334155':'#f1f5f9') }}>
                  <td style={{ padding:'5px 4px',color:dm?'#94a3b8':'#64748b',width:'45%',verticalAlign:'top' }}>{nv.label}</td>
                  <td style={{ padding:'5px 4px',color:dm?'#e2e8f0':'#1e293b',fontWeight:600,fontFamily:"'Courier New',monospace" }}>{nv.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display:'flex',flexDirection:'column',gap:5,overflowY:'auto',maxHeight:320 }}>
            {(jointData.measurements||[]).map(m => (
              <div key={m.id} onClick={() => setSelectedMeasurementId(m.id)}
                style={{ padding:'7px 10px',background:dm?'#0f172a':'#f8fafc',borderRadius:7,border:'1px solid '+(dm?'#334155':'#f1f5f9'),cursor:'pointer' }}>
                <div style={{ fontSize:12,fontWeight:600,color:'#0891b2' }}>{m.label}</div>
                <div style={{ fontSize:11,color:dm?'#94a3b8':'#64748b' }}>{m.normalValues[0]?.label}: {m.normalValues[0]?.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── INCIDENTAL FINDINGS HELPERS ─────────────────────────────────────────────
// Fleischner Society 2017 guidelines for incidental pulmonary nodules
function getFleischnerRec(type, size) {
  const recs = {
    solid: {
      '<6mm':    { low: 'No routine follow-up', high: 'Optional CT at 12 months' },
      '6-8mm':   { low: 'CT at 6-12 months, then 18-24 months if stable', high: 'CT at 6-12 months, then 18-24 months if stable' },
      '>8mm':    { low: 'Consider CT at 3 months, PET/CT, or tissue sampling', high: 'CT at 3 months, PET/CT, or tissue sampling' },
    },
    ggo: {
      '<6mm':    { low: 'No routine follow-up', high: 'No routine follow-up' },
      '6-8mm':   { low: 'CT at 6-12 months to confirm persistence, then CT every 2 years until 5 years', high: 'CT at 6-12 months to confirm persistence, then CT every 2 years until 5 years' },
      '>8mm':    { low: 'CT at 3-6 months to confirm persistence, then CT every year for 3 years', high: 'CT at 3-6 months to confirm persistence, then CT every year for 3 years' },
    },
    partsolid: {
      '<6mm':    { low: 'No routine follow-up', high: 'No routine follow-up' },
      '6-8mm':   { low: 'CT at 3-6 months. If stable and solid component <6mm, annual CT x 5 years', high: 'CT at 3-6 months. If stable and solid component <6mm, annual CT x 5 years' },
      '>8mm':    { low: 'CT at 3-6 months. PET/CT or tissue sampling if solid component grows or >8mm', high: 'CT at 3-6 months. PET/CT or tissue sampling if solid component grows or >8mm' },
    },
  };
  return recs[type]?.[size] || null;
}

// ACR Incidental Renal Findings Committee guidelines
function getRenalRec(finding) {
  const recs = {
    'simple cyst (<1cm)':        { rec: 'No follow-up needed. Benign simple cyst.' },
    'simple cyst (1-3.9cm)':     { rec: 'No follow-up needed if classic simple cyst. Bosniak I.' },
    'simple cyst (≥4cm)':        { rec: 'No follow-up needed if classic simple cyst. Confirm with ultrasound if not classic.' },
    'minimally complex (Bosniak II)':  { rec: 'No follow-up needed.' },
    'Bosniak IIF':               { rec: 'CT or MRI at 6 months, then annually for 5 years.' },
    'Bosniak III':               { rec: 'Urologic referral. ~50% malignancy rate.' },
    'Bosniak IV':                { rec: 'Urologic referral. Surgical or ablative therapy recommended.' },
    'solid mass (<1cm)':         { rec: 'Urologic consultation. Growth rate assessment with short-interval follow-up CT/MRI.' },
    'solid mass (1-3.9cm)':      { rec: 'Urologic consultation. CT/MRI with and without contrast for characterization.' },
    'solid mass (≥4cm)':         { rec: 'Urologic consultation. Surgical planning.' },
  };
  return recs[finding] || null;
}

// ACR/SRU guidelines for incidental gynecologic findings
function getGynRec(finding, isPostmenopausal) {
  const recs = {
    'simple cyst (<3cm)': {
      pre:  'No follow-up needed. Likely functional or physiologic cyst.',
      post: 'No follow-up needed if <1cm. Follow-up ultrasound in 1 year if 1-3cm.',
    },
    'simple cyst (3-5cm)': {
      pre:  'Follow-up ultrasound in 1 year.',
      post: 'Follow-up ultrasound in 1 year.',
    },
    'simple cyst (5-7cm)': {
      pre:  'Follow-up ultrasound in 6-12 months or GYN referral.',
      post: 'GYN referral.',
    },
    'simple cyst (>7cm)': {
      pre:  'MRI or GYN referral.',
      post: 'GYN referral or surgical evaluation.',
    },
    'complex cyst': {
      pre:  'GYN referral. IOTA characterization or ADNEX model recommended.',
      post: 'GYN referral. Malignancy risk higher in postmenopausal patients.',
    },
    'fibroid (small <3cm)': {
      pre:  'No follow-up needed if asymptomatic.',
      post: 'No follow-up needed. New growth in postmenopausal patient warrants evaluation.',
    },
    'endometrial thickening': {
      pre:  'Clinical correlation. Endometrial biopsy if symptomatic.',
      post: 'GYN referral. Endometrial biopsy recommended if >4mm.',
    },
  };
  return recs[finding] || null;
}

// ACR Incidental Aortic Findings guidelines
function getAortaRec(finding) {
  const recs = {
    '<3cm':         { rec: 'Normal aortic diameter. No follow-up needed.' },
    '3-3.9cm':      { rec: 'Infrarenal aortic ectasia. Vascular surgery notification. Ultrasound or CT in 3 years.' },
    '4-4.9cm':      { rec: 'AAA — moderate. Vascular surgery referral. CT/ultrasound every 6-12 months.' },
    '5-5.4cm':      { rec: 'AAA — large. Urgent vascular surgery referral. Surgical planning.' },
    '≥5.5cm':       { rec: 'AAA — surgical threshold. Urgent vascular surgery referral. Surgical repair indicated.' },
    'penetrating ulcer': { rec: 'Vascular surgery notification. Short-interval CT follow-up in 3-6 months. Urgent if symptomatic.' },
    'intramural hematoma': { rec: 'Urgent vascular surgery notification. High risk for dissection.' },
  };
  return recs[finding] || null;
}

// ─── INCIDENTAL PANEL COMPONENT ───────────────────────────────────────────────
function IncidentalPanel({ showLung, showGU, noduleType, setNoduleType, noduleSize, setNoduleSize,
  renalFinding, setRenalFinding, gynFinding, setGynFinding, aortaFinding, setAortaFinding,
  patientAge, setPatientAge, patientSex, setPatientSex, isPostmenopausal }) {

  const tog = (val, current, setter) => (
    <button onClick={() => setter(current === val ? '' : val)}
      style={{ padding:'4px 8px',borderRadius:6,border:'1px solid '+(current===val?'#dc2626':'#334155'),background:current===val?'#fef2f2':'transparent',color:current===val?'#dc2626':'#94a3b8',fontSize:10,fontWeight:current===val?700:400,cursor:'pointer' }}>
      {val}
    </button>
  );

  return (
    <div style={{ background:'#1a0a0a',border:'1.5px solid #dc2626',borderRadius:8,padding:'10px 12px',display:'flex',flexDirection:'column',gap:10 }}>
      {showLung && (
        <div>
          <div style={{ fontSize:10,fontWeight:800,color:'#ef4444',letterSpacing:'0.1em',marginBottom:6 }}>⚠️ INCIDENTAL LESION CHECKER — LUNG</div>
          <div style={{ fontSize:10,color:'#94a3b8',marginBottom:4 }}>Nodule type:</div>
          <div style={{ display:'flex',gap:4,flexWrap:'wrap',marginBottom:6 }}>
            {['solid','ggo','partsolid'].map(t => tog(t, noduleType, setNoduleType))}
          </div>
          {noduleType && (
            <>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:4 }}>Size:</div>
              <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                {['<6mm','6-8mm','>8mm'].map(s => tog(s, noduleSize, setNoduleSize))}
              </div>
            </>
          )}
        </div>
      )}
      {showGU && (
        <div>
          <div style={{ fontSize:10,fontWeight:800,color:'#ef4444',letterSpacing:'0.1em',marginBottom:6 }}>⚠️ INCIDENTAL LESION CHECKER — GU / AORTA</div>
          <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
            <div>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Renal finding:</div>
              <select value={renalFinding} onChange={e=>setRenalFinding(e.target.value)}
                style={{ width:'100%',padding:'4px 6px',borderRadius:5,fontSize:10,background:'#0f172a',color:'#e2e8f0',border:'1px solid #334155' }}>
                <option value="">— None —</option>
                {['simple cyst (<1cm)','simple cyst (1-3.9cm)','simple cyst (≥4cm)','minimally complex (Bosniak II)','Bosniak IIF','Bosniak III','Bosniak IV','solid mass (<1cm)','solid mass (1-3.9cm)','solid mass (≥4cm)'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Gynecologic finding:</div>
              <select value={gynFinding} onChange={e=>setGynFinding(e.target.value)}
                style={{ width:'100%',padding:'4px 6px',borderRadius:5,fontSize:10,background:'#0f172a',color:'#e2e8f0',border:'1px solid #334155' }}>
                <option value="">— None —</option>
                {['simple cyst (<3cm)','simple cyst (3-5cm)','simple cyst (5-7cm)','simple cyst (>7cm)','complex cyst','fibroid (small <3cm)','endometrial thickening'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            {gynFinding && (
              <div style={{ display:'flex',gap:6 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Patient age:</div>
                  <input type="number" value={patientAge} onChange={e=>setPatientAge(e.target.value)} placeholder="Age"
                    style={{ width:'100%',padding:'4px 6px',borderRadius:5,fontSize:10,background:'#0f172a',color:'#e2e8f0',border:'1px solid #334155' }}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Sex:</div>
                  <div style={{ display:'flex',gap:3 }}>
                    {['M','F'].map(s => (
                      <button key={s} onClick={()=>setPatientSex(patientSex===s?'':s)}
                        style={{ flex:1,padding:'4px',borderRadius:5,border:'1px solid '+(patientSex===s?'#2563eb':'#334155'),background:patientSex===s?'#1e3a5f':'transparent',color:patientSex===s?'#93c5fd':'#94a3b8',fontSize:10,cursor:'pointer' }}>
                        {s==='M'?'M':'F'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize:10,color:'#94a3b8',marginBottom:3 }}>Aortic diameter:</div>
              <div style={{ display:'flex',gap:4,flexWrap:'wrap' }}>
                {['<3cm','3-3.9cm','4-4.9cm','5-5.4cm','≥5.5cm','penetrating ulcer','intramural hematoma'].map(v => tog(v, aortaFinding, setAortaFinding))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── MAIN DASHBOARD ────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tqwdkisqqvbujcjvzdlw.supabase.co';
const getAnonKey = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const ADMIN_EMAIL = 'admin@lucidmsk.com';
const ADMIN_EMAILS = ['admin@lucidmsk.com', 'adamsinger82@gmail.com'];
const SESSION_TOKEN_KEY = 'msk_session_token';

// Generate a random session token
const generateSessionToken = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

// Write session token to profiles table
const writeSessionToken = async (userId, token, accessToken) => {
  try {
    await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: getAnonKey(),
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ session_token: token, session_updated_at: new Date().toISOString() }),
    });
  } catch(e) { console.warn('writeSessionToken failed', e); }
};

// Verify session token matches DB — returns 'valid' | 'invalid' | 'error'
const verifySessionToken = async (userId, token, accessToken) => {
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${userId}&select=session_token`, {
      headers: { apikey: getAnonKey(), Authorization: `Bearer ${accessToken}` },
    });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return 'error';
    return data[0].session_token === token ? 'valid' : 'invalid';
  } catch { return 'error'; }
};

// ── Terms of Use text (rendered as JSX) ──────────────────────────────────────
const TOU_TEXT = (
  <div style={{ fontFamily: 'inherit' }}>
    <h2 style={{ color:'white', fontSize:16, fontWeight:700, marginBottom:4 }}>LucidMSK — Terms of Use Agreement</h2>
    <p style={{ color:'rgba(255,255,255,0.4)', fontSize:11, marginBottom:20 }}>Effective Date: May 30, 2026</p>

    {[
      ['1. Acceptance of Terms', 'By creating an account, accessing, or using the LucidMSK application ("Application"), you ("User") agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, you must not access or use the Application. Your continued use of the Application constitutes your ongoing acceptance of these Terms as they may be updated from time to time.'],
      ['2. Description of the Application', 'LucidMSK is an AI-assisted platform designed to support musculoskeletal (MSK) radiology reporting and reference. The Application is intended to assist fellowship-trained radiologists and qualified medical professionals in the drafting, structuring, and referencing of radiology reports. LucidMSK utilizes artificial intelligence to provide decision support, reference material, and reporting assistance.\n\nThe Application is provided as a professional reference and drafting tool only. It does not constitute the practice of medicine and is not a substitute for the independent clinical judgment of a licensed medical professional.'],
      ['3. Intended Users', 'The Application is intended for use exclusively by licensed medical professionals, including but not limited to radiologists, physicians, and other qualified healthcare providers. By using the Application, you represent and warrant that:\n\n• You are a licensed medical professional in good standing in your jurisdiction;\n• You have the training, qualifications, and licensure necessary to interpret and apply radiology reports and medical information;\n• You will use the Application only in connection with your professional duties and in compliance with all applicable laws and regulations.'],
      ['4. Educational and Assistive Purpose Only', 'ALL content, output, suggestions, draft reports, reference material, and information provided by the Application are for EDUCATIONAL AND ASSISTIVE PURPOSES ONLY. The Application is a drafting and reference aid — not a diagnostic tool, not a clinical decision-making system, and not a replacement for independent professional judgment.\n\nLucidMSK AI-generated content:\n• May contain errors, omissions, or inaccuracies;\n• Has not been reviewed or approved by the FDA or any regulatory authority as a medical device;\n• Does not constitute a final radiology report or medical opinion;\n• Must be independently reviewed, verified, and approved by the licensed medical professional before use in any clinical context.'],
      ['5. User Responsibility and Assumption of Risk', 'YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE APPLICATION IS AT YOUR SOLE RISK. As a licensed medical professional, you bear full and exclusive responsibility for:\n\n• All clinical decisions, diagnoses, interpretations, and medical opinions you make in connection with your use of the Application;\n• The accuracy, completeness, and appropriateness of any radiology report or medical documentation you produce, whether or not assisted by the Application;\n• Independently verifying all Application output before relying upon it in any clinical context;\n• Compliance with all applicable professional standards, institutional policies, and legal requirements governing the practice of radiology and medicine in your jurisdiction;\n• Patient safety and the standard of care owed to your patients.\n\nThe Application is a tool to assist your professional judgment — it does not replace it. You remain solely responsible for all patient care decisions.'],
      ['6. Disclaimer of Warranties', 'THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, LUCIDMSK AND ITS OWNERS, DEVELOPERS, EMPLOYEES, AGENTS, AND AFFILIATES ("LUCIDMSK PARTIES") EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:\n\n• Any implied warranty of merchantability, fitness for a particular purpose, or non-infringement;\n• Any warranty that the Application will be uninterrupted, error-free, secure, or free of viruses or harmful components;\n• Any warranty regarding the accuracy, reliability, completeness, or timeliness of any content or output generated by the Application;\n• Any warranty that the Application is suitable for clinical, diagnostic, or therapeutic use.'],
      ['7. Limitation of Liability and Release', 'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU AGREE THAT THE LUCIDMSK PARTIES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF, OR INABILITY TO USE, THE APPLICATION, INCLUDING BUT NOT LIMITED TO:\n\n• Any harm to patients or third parties arising from clinical decisions made with or without reference to the Application;\n• Any errors, inaccuracies, or omissions in Application output;\n• Any loss of data, revenue, reputation, or professional standing;\n• Any claim arising from your reliance on Application-generated content.\n\nTHIS LIMITATION APPLIES REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE) AND EVEN IF LUCIDMSK HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.'],
      ['8. Indemnification and Waiver of Claims', 'By using the Application, you agree to indemnify, defend, and hold harmless the LucidMSK Parties from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys\' fees) arising out of or in any way connected with:\n\n• Your use of or reliance upon the Application;\n• Any clinical decision, diagnosis, report, or medical action you take in connection with the Application;\n• Your violation of these Terms;\n• Your violation of any applicable law, regulation, or professional standard;\n• Any claim by a patient, employer, insurer, or third party arising from your use of the Application.\n\nYOU EXPRESSLY WAIVE ANY AND ALL CLAIMS, CAUSES OF ACTION, AND RIGHTS TO BRING LEGAL ACTION OF ANY KIND AGAINST THE LUCIDMSK PARTIES ARISING FROM OR RELATED TO YOUR USE OF THE APPLICATION. This waiver includes but is not limited to claims in contract, tort, negligence, product liability, medical malpractice, and any statutory cause of action.'],
      ['9. No Doctor-Patient Relationship', 'Use of the Application does not create a doctor-patient relationship, a physician-patient relationship, or any other professional-client relationship between the User and LucidMSK or its owners, developers, or employees. LucidMSK is not a licensed healthcare provider and does not provide medical advice, diagnosis, or treatment.'],
      ['10. Privacy, Data, and Prohibition on PHI', '10.1 Prohibition on PHI Input. YOU ARE STRICTLY PROHIBITED from entering, uploading, transmitting, or otherwise providing any Protected Health Information ("PHI") or Personally Identifiable Information ("PII") — as defined under HIPAA and its implementing regulations, or any other applicable law — into the Application. This prohibition includes but is not limited to patient names, dates of birth, addresses, medical record numbers, social security numbers, or any other information that could reasonably be used to identify an individual patient. You agree to de-identify all patient information in accordance with HIPAA Safe Harbor or Expert Determination standards.\n\n10.2 No Liability for Inadvertently Provided PHI. LucidMSK is not designed, intended, or approved as a HIPAA-compliant platform and does not function as a Business Associate under HIPAA. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE LUCIDMSK PARTIES SHALL HAVE NO LIABILITY WHATSOEVER FOR ANY PHI OR PII THAT IS INADVERTENTLY, ACCIDENTALLY, OR OTHERWISE PROVIDED TO THE APPLICATION BY ANY USER. Any such disclosure is entirely the responsibility of the User who provided it.\n\n10.3 Your Compliance Responsibility. You are solely responsible for ensuring your use of the Application complies with all applicable privacy laws and regulations, including HIPAA, HITECH, state privacy laws, and any institutional policies governing patient data.'],
      ['11. Modifications to Terms', 'LucidMSK reserves the right to modify these Terms at any time. Updated Terms will be posted within the Application. Your continued use of the Application following the posting of updated Terms constitutes your acceptance of the revised Terms.'],
      ['12. Governing Law', 'These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, United States of America, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Georgia.'],
      ['13. Severability', 'If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.'],
      ['14. Third-Party Services and Infrastructure', 'The Application is built upon and hosted using third-party software platforms, cloud infrastructure, and service providers, including but not limited to hosting providers, database services, authentication services, artificial intelligence APIs, and payment processors (collectively, "Third-Party Services"). By using the Application, you acknowledge and agree to the following:\n\n14.1 Data Sharing with Third Parties. In the course of providing the Application\'s functionality, certain information you input or that is generated through your use of the Application — including but not limited to account information, usage data, and content you submit — may be transmitted to, processed by, or stored with Third-Party Services. LucidMSK does not sell your personal information to third parties, but cannot guarantee how Third-Party Services handle data transmitted to them in the course of Application operation.\n\n14.2 Disclaimer of Liability for Third-Party Failures. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, LUCIDMSK EXPRESSLY DISCLAIMS ALL LIABILITY FOR ANY: (a) breach, loss, unauthorized access, or misuse of data that occurs at the Third-Party Service level; (b) failure, interruption, degradation, or unavailability of the Application resulting from Third-Party Service outages, downtime, or technical failures; (c) temporary or permanent loss of service, data, or functionality caused by changes to, discontinuation of, or failures within any Third-Party Service; or (d) actions, omissions, privacy practices, or security incidents of any Third-Party Service provider.\n\n14.3 Service Availability. LucidMSK does not guarantee uninterrupted or error-free access to the Application. Temporary loss of service or impaired functionality resulting from Third-Party Service issues is outside LucidMSK\'s control, and LucidMSK shall have no liability for any damages, losses, or inconvenience arising therefrom.\n\n14.4 User Acknowledgment. By using the Application, you expressly acknowledge that you understand the Application relies on Third-Party Services and that you accept the risks associated with such reliance, including the data sharing and service availability risks described in this section.'],
      ['15. Entire Agreement', 'These Terms constitute the entire agreement between you and LucidMSK with respect to the subject matter herein and supersede all prior or contemporaneous agreements, representations, warranties, and understandings.'],
    ].map(([title, body]) => (
      <div key={title} style={{ marginBottom:18 }}>
        <h3 style={{ color:'rgba(255,255,255,0.9)', fontSize:13, fontWeight:700, marginBottom:6 }}>{title}</h3>
        {body.split('\n\n').map((para, i) => (
          <p key={i} style={{ margin:'0 0 8px', color:'rgba(255,255,255,0.65)', fontSize:12.5, lineHeight:1.7, whiteSpace:'pre-line' }}>{para}</p>
        ))}
      </div>
    ))}

    <div style={{ marginTop:24, padding:'14px 16px', background:'rgba(79,70,229,0.12)', border:'1px solid rgba(79,70,229,0.3)', borderRadius:8 }}>
      <p style={{ color:'rgba(255,255,255,0.85)', fontSize:12, fontWeight:600, margin:0, lineHeight:1.6 }}>
        USER ACKNOWLEDGMENT: BY CLICKING "I AGREE," CREATING AN ACCOUNT, OR USING THE LUCIDMSK APPLICATION, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF USE IN THEIR ENTIRETY. YOU ACKNOWLEDGE THAT YOU ARE A LICENSED MEDICAL PROFESSIONAL AND THAT YOU ARE SOLELY RESPONSIBLE FOR ALL CLINICAL DECISIONS YOU MAKE IN CONNECTION WITH YOUR USE OF THIS APPLICATION.
      </p>
    </div>
  </div>
);

// ── Approval helpers ─────────────────────────────────────────────────────────
async function getApprovalStatus(userId, accessToken) {
  const key = getAnonKey();
  const r = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${userId}&select=approved`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  if (!rows || rows.length === 0) return null;
  return rows[0].approved === true;
}

async function getPendingUsers(accessToken) {
  const key = getAnonKey();
  const r = await fetch(`${SUPA_URL}/rest/v1/profiles?approved=eq.false&rejected=eq.false&select=id,email,created_at`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return [];
  return r.json();
}

async function getApprovedUsers(accessToken) {
  const key = getAnonKey();
  const r = await fetch(`${SUPA_URL}/rest/v1/profiles?approved=eq.true&select=id,email,created_at`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return [];
  return r.json();
}

async function callAdminFunc(funcName, userId, accessToken) {
  const key = getAnonKey();
  try {
    const r = await fetch(`${SUPA_URL}/rest/v1/rpc/${funcName}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ target_user_id: userId }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error(`${funcName} failed`, r.status, t);
      return { ok: false, error: `${r.status}: ${t}` };
    }
    return { ok: true };
  } catch(e) {
    return { ok: false, error: e.message };
  }
}

async function setApproved(userId, accessToken) {
  return callAdminFunc('approve_user', userId, accessToken);
}

async function setRejected(userId, accessToken) {
  return callAdminFunc('reject_user', userId, accessToken);
}

async function revokeAccess(userId, accessToken) {
  return callAdminFunc('revoke_user', userId, accessToken);
}

// ── Waiting screen ────────────────────────────────────────────────────────────
function PendingApprovalPage({ onSignOut }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#1a0a2e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'10%', left:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.12),transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'8%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)', filter:'blur(40px)' }} />
      </div>
      <div style={{ width:'100%', maxWidth:420, position:'relative', textAlign:'center' }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>⏳</div>
          <h2 style={{ color:'white', fontSize:22, fontWeight:700, margin:'0 0 12px', letterSpacing:'-0.02em' }}>Account Pending Approval</h2>
          <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.6, margin:'0 0 24px' }}>
            Your account has been created and is awaiting admin approval.<br/>
            You'll have full access once approved. This typically takes 1–2 business days.
          </p>
          <p style={{ color:'rgba(255,255,255,0.3)', fontSize:12, margin:'0 0 32px' }}>
            Questions? Contact <span style={{ color:'rgba(148,163,255,0.7)' }}>admin@lucidmsk.com</span>
          </p>
        </div>
        <button
          onClick={onSignOut}
          style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', padding:'10px 28px', borderRadius:9, fontSize:14, cursor:'pointer' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Rejected screen ────────────────────────────────────────────────────────────
function RejectedPage({ onSignOut }) {
  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#1a0a2e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:420, position:'relative', textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🚫</div>
        <h2 style={{ color:'white', fontSize:22, fontWeight:700, margin:'0 0 12px' }}>Access Not Approved</h2>
        <p style={{ color:'rgba(255,255,255,0.55)', fontSize:14, lineHeight:1.6, margin:'0 0 32px' }}>
          Your account was not approved for access to LucidMSK.<br/>
          Contact <span style={{ color:'rgba(148,163,255,0.7)' }}>admin@lucidmsk.com</span> if you believe this is an error.
        </p>
        <button
          onClick={onSignOut}
          style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.7)', padding:'10px 28px', borderRadius:9, fontSize:14, cursor:'pointer' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ── Admin panel ────────────────────────────────────────────────────────────────
function AdminPanel({ currentUser, onClose }) {
  const [tab, setTab] = useState('pending'); // 'pending' | 'approved'
  const [pending, setPending] = useState([]);
  const [approvedList, setApprovedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const load = async () => {
    setLoading(true);
    const [p, a] = await Promise.all([
      getPendingUsers(currentUser.access_token),
      getApprovedUsers(currentUser.access_token),
    ]);
    setPending(p || []);
    setApprovedList(a || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const handleApprove = async (userId, email) => {
    const res = await setApproved(userId, currentUser.access_token);
    if (res.ok) { flash(`✅ Approved: ${email}`); load(); }
    else flash(`❌ ${res.error}`);
  };

  const handleReject = async (userId, email) => {
    const res = await setRejected(userId, currentUser.access_token);
    if (res.ok) { flash(`🚫 Rejected: ${email}`); load(); }
    else flash(`❌ ${res.error}`);
  };

  const handleRevoke = async (userId, email) => {
    const res = await revokeAccess(userId, currentUser.access_token);
    if (res.ok) { flash(`↩️ Access revoked: ${email}`); load(); }
    else flash(`❌ ${res.error}`);
  };

  const rowStyle = { display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.07)' };
  const btnStyle = (color) => ({ background:`rgba(${color},0.15)`, border:`1px solid rgba(${color},0.35)`, color:`rgb(${color})`, padding:'5px 14px', borderRadius:7, fontSize:12, cursor:'pointer', whiteSpace:'nowrap' });

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.75)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#0f172a', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, width:'100%', maxWidth:560, maxHeight:'80vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
        {/* Header */}
        <div style={{ padding:'18px 20px 14px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div>
            <div style={{ color:'white', fontSize:16, fontWeight:700 }}>🛡️ Admin Panel</div>
            <div style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginTop:2 }}>LucidMSK Member Management</div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.5)', fontSize:20, cursor:'pointer', padding:'2px 6px' }}>✕</button>
        </div>
        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
          {[['pending',`Pending (${pending.length})`],['approved',`Approved (${approvedList.length})`]].map(([key,label]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex:1, background:'none', border:'none', borderBottom: tab===key ? '2px solid #5b9ef7' : '2px solid transparent', color: tab===key ? 'white' : 'rgba(255,255,255,0.4)', padding:'10px 0', fontSize:13, cursor:'pointer', transition:'all 0.15s' }}>{label}</button>
          ))}
        </div>
        {/* Flash message */}
        {actionMsg && (
          <div style={{ margin:'8px 16px 0', padding:'8px 14px', background:'rgba(255,255,255,0.07)', borderRadius:7, color:'rgba(255,255,255,0.8)', fontSize:13 }}>{actionMsg}</div>
        )}
        {/* Content */}
        <div style={{ overflowY:'auto', padding:'12px 20px', flex:1 }}>
          {loading ? (
            <div style={{ color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'32px 0', fontSize:13 }}>Loading…</div>
          ) : tab === 'pending' ? (
            pending.length === 0 ? (
              <div style={{ color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'32px 0', fontSize:13 }}>No pending users 🎉</div>
            ) : pending.map(u => (
              <div key={u.id} style={rowStyle}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'white', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                  <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:2 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Unknown date'}</div>
                </div>
                <button onClick={() => handleApprove(u.id, u.email)} style={btnStyle('100,200,100')}>Approve</button>
                <button onClick={() => handleReject(u.id, u.email)} style={btnStyle('255,100,100')}>Reject</button>
              </div>
            ))
          ) : (
            approvedList.length === 0 ? (
              <div style={{ color:'rgba(255,255,255,0.3)', textAlign:'center', padding:'32px 0', fontSize:13 }}>No approved users yet</div>
            ) : approvedList.map(u => (
              <div key={u.id} style={rowStyle}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ color:'white', fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.email}</div>
                  <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:2 }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</div>
                </div>
                {u.email !== ADMIN_EMAIL && (
                  <button onClick={() => handleRevoke(u.id, u.email)} style={btnStyle('255,180,80')}>Revoke</button>
                )}
                {u.email === ADMIN_EMAIL && (
                  <span style={{ color:'rgba(148,163,255,0.6)', fontSize:11 }}>Admin</span>
                )}
              </div>
            ))
          )}
        </div>
        {/* Footer */}
        <div style={{ padding:'10px 20px', borderTop:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
          <button onClick={load} style={{ background:'none', border:'1px solid rgba(255,255,255,0.15)', color:'rgba(255,255,255,0.5)', padding:'6px 16px', borderRadius:7, fontSize:12, cursor:'pointer' }}>↻ Refresh</button>
        </div>
      </div>
    </div>
  );
}

async function supaSignUp(email, password) {
  const r = await fetch(`${SUPA_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: getAnonKey() },
    body: JSON.stringify({ email, password, data: {}, gotrue_meta_security: {}, options: { emailRedirectTo: 'https://lucidmsk.com/auth/callback' } }),
  });
  const data = await r.json();
  // Create profiles row immediately after signup; admin email auto-approved
  if (data?.user?.id) {
    const isAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    await fetch(`${SUPA_URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: {
        apikey: getAnonKey(),
        Authorization: `Bearer ${data.access_token || getAnonKey()}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal,resolution=ignore-duplicates',
      },
      body: JSON.stringify({ id: data.user.id, email: email.trim().toLowerCase(), approved: isAdmin, rejected: false, terms_accepted_at: new Date().toISOString() }),
    });
  }
  return data;
}

async function supaSignIn(email, password) {
  const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: getAnonKey() },
    body: JSON.stringify({ email, password }),
  });
  return r.json();
}

async function supaSignOut(accessToken) {
  await fetch(`${SUPA_URL}/auth/v1/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: getAnonKey(), Authorization: `Bearer ${accessToken}` },
  });
}

async function supaGetUser(accessToken) {
  const r = await fetch(`${SUPA_URL}/auth/v1/user`, {
    headers: { apikey: getAnonKey(), Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) return null;
  return r.json();
}

function saveSession(session) {
  try {
    localStorage.setItem('msk_session', JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: Date.now() + (session.expires_in || 3600) * 1000,
      user: session.user,
    }));
  } catch {}
}

function loadSession() {
  try {
    const raw = localStorage.getItem('msk_session');
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.expires_at && s.expires_at < Date.now()) { localStorage.removeItem('msk_session'); return null; }
    return s;
  } catch { return null; }
}

function clearSession() {
  try { localStorage.removeItem('msk_session'); } catch {}
}

// ─── AVATAR OPTIONS ──────────────────────────────────────────────────────────
const AVATAR_OPTIONS = [
  { id:'stethoscope', icon:'🩺' },
  { id:'xray',        icon:'🩻' },
  { id:'bone',        icon:'🦴' },
  { id:'brain',       icon:'🧠' },
  { id:'microscope',  icon:'🔬' },
  { id:'dna',         icon:'🧬' },
  { id:'shield',      icon:'🛡️' },
  { id:'star',        icon:'⭐' },
];

function saveUserPrefs(userId, prefs) {
  try { localStorage.setItem(`msk_prefs_${userId}`, JSON.stringify(prefs)); } catch {}
}
function loadUserPrefs(userId) {
  try {
    const raw = localStorage.getItem(`msk_prefs_${userId}`);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
function getInitials(firstName, lastName, email) {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (firstName) return firstName.slice(0,2).toUpperCase();
  return (email?.[0] || '?').toUpperCase();
}
function getAvatarIcon(avatarChoice) {
  return AVATAR_OPTIONS.find(a => a.id === avatarChoice)?.icon || '👤';
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarMode, setAvatarMode] = useState('initials'); // 'initials' | 'icon'
  const [avatarChoice, setAvatarChoice] = useState('stethoscope');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touChecked, setTouChecked] = useState(false);
  const [touModalOpen, setTouModalOpen] = useState(false);
  const [touViewed, setTouViewed] = useState(false);

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 9,
    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)',
    color: 'white', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }
    if (mode === 'signup' && password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (mode === 'signup' && password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (mode === 'signup' && !touChecked) { setError('You must read and agree to the Terms of Use to create an account.'); return; }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const data = await supaSignUp(email.trim(), password);
        if (data.error) { setError(data.error.message || data.msg || 'Sign up failed.'); }
        else if (data.user && !data.session) {
          setSuccess('Account created! Please check your email to confirm your address, then sign in.');
          setMode('signin');
        } else if (data.access_token) {
          saveSession(data);
          const uid = data.user?.id;
          if (uid) saveUserPrefs(uid, { firstName, lastName, avatarMode, avatarChoice });
          onLogin({ ...data.user, access_token: data.access_token });
        } else {
          setSuccess('Account created! Please sign in.');
          setMode('signin');
        }
      } else {
        const data = await supaSignIn(email.trim(), password);
        if (data.error || data.error_description) {
          const errMsg = (data.error_description || data.error || '').toLowerCase();
          if (errMsg.includes('email not confirmed') || errMsg.includes('not confirmed')) {
            setError('Your email address is not yet confirmed. Please check your inbox for a verification email.');
          } else {
            setError(data.error_description || data.error || 'Invalid email or password.');
          }
        } else if (data.access_token) {
          saveSession(data); onLogin({ ...data.user, access_token: data.access_token });
        } else {
          setError('Invalid email or password.');
        }
      }
    } catch { setError('Network error. Please check your connection.'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(135deg,#0a0f1e 0%,#0f172a 50%,#1a0a2e 100%)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      {/* Background decoration */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none' }}>
        <div style={{ position:'absolute', top:'10%', left:'5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(37,99,235,0.12),transparent 70%)', filter:'blur(40px)' }} />
        <div style={{ position:'absolute', bottom:'15%', right:'8%', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)', filter:'blur(40px)' }} />
      </div>

      <div style={{ width:'100%', maxWidth:420, position:'relative' }}>
        {/* Logo */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:16, marginBottom:32 }}>
          <svg width="64" height="64" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
            <defs>
              <filter id="login-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3.5" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <circle cx="36" cy="36" r="33" stroke="#1a3a6b" strokeWidth="1.2"/>
            <rect x="32" y="18" width="8" height="36" rx="4" fill="#5b9ef7" opacity="0.08"/>
            <ellipse cx="36" cy="18" rx="7" ry="5" fill="#5b9ef7" opacity="0.18"/>
            <ellipse cx="36" cy="54" rx="7" ry="5" fill="#5b9ef7" opacity="0.18"/>
            <line x1="33" y1="22" x2="33" y2="50" stroke="#5b9ef7" strokeWidth="1.5" opacity="0.35"/>
            <line x1="39" y1="22" x2="39" y2="50" stroke="#5b9ef7" strokeWidth="1.5" opacity="0.35"/>
            <line x1="36" y1="14" x2="20" y2="28" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="36" y1="14" x2="52" y2="28" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="20" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="52" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="20" y1="28" x2="16" y2="44" stroke="#4a90d9" strokeWidth="0.8" className="ll"/>
            <line x1="52" y1="28" x2="56" y2="44" stroke="#4a90d9" strokeWidth="0.8" className="ll"/>
            <line x1="36" y1="36" x2="26" y2="44" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="36" y1="36" x2="46" y2="44" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="16" y1="44" x2="36" y2="58" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="56" y1="44" x2="36" y2="58" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="26" y1="44" x2="36" y2="58" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="46" y1="44" x2="36" y2="58" stroke="#7ab8f5" strokeWidth="0.8"/>
            <circle cx="36" cy="14" r="3.2" fill="#5b9ef7" filter="url(#login-glow)" className="ln1"/>
            <circle cx="20" cy="28" r="2.5" fill="#4a90d9" filter="url(#login-glow)" className="ln2"/>
            <circle cx="52" cy="28" r="2.5" fill="#4a90d9" filter="url(#login-glow)" className="ln2"/>
            <circle cx="16" cy="44" r="2.5" fill="#4a90d9" filter="url(#login-glow)" className="ln3"/>
            <circle cx="56" cy="44" r="2.5" fill="#4a90d9" filter="url(#login-glow)" className="ln3"/>
            <circle cx="26" cy="44" r="2"   fill="#7ab8f5" filter="url(#login-glow)" className="ln2"/>
            <circle cx="46" cy="44" r="2"   fill="#7ab8f5" filter="url(#login-glow)" className="ln2"/>
            <circle cx="36" cy="58" r="3.2" fill="#5b9ef7" filter="url(#login-glow)" className="ln1"/>
            <circle cx="36" cy="36" r="3.8" fill="#90caf9" filter="url(#login-glow)" className="ln3"/>
          </svg>
          <div>
            <div style={{ color:'#e0eaff', fontWeight:700, fontSize:34, letterSpacing:'2px', fontFamily:'Rajdhani, sans-serif', lineHeight:1 }}>
              Lucid<span style={{ color:'#5b9ef7' }}>MSK</span>
            </div>
            <div style={{ color:'#3a6aaa', fontSize:9, letterSpacing:'4px', textTransform:'uppercase', fontWeight:300, marginTop:4 }}>
              AI-Powered MSK Radiology Assistant
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'rgba(255,255,255,0.04)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'28px 32px', boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>
          {/* Mode tabs */}
          <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:10, padding:3, marginBottom:24, gap:2 }}>
            {[['signin','Sign In'],['signup','Create Account']].map(([m,l]) => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                style={{ flex:1, padding:'8px', borderRadius:8, border:'none', cursor:'pointer', fontSize:13, fontWeight:700,
                  background: mode===m ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'transparent',
                  color: mode===m ? 'white' : 'rgba(255,255,255,0.45)',
                  boxShadow: mode===m ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                  transition:'all 0.2s' }}>
                {l}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {mode === 'signup' && (<>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>First Name</label>
                  <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Jane" style={inp} />
                </div>
                <div style={{ flex:1 }}>
                  <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Last Name</label>
                  <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Smith" style={inp} />
                </div>
              </div>
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:8 }}>Profile Style</label>
                <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                  <button type="button" onClick={()=>setAvatarMode('initials')}
                    style={{ padding:'6px 14px', borderRadius:8, border:'1px solid', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
                      borderColor: avatarMode==='initials' ? '#4f46e5' : 'rgba(255,255,255,0.15)',
                      background: avatarMode==='initials' ? 'rgba(79,70,229,0.2)' : 'rgba(255,255,255,0.05)',
                      color: avatarMode==='initials' ? '#a5b4fc' : 'rgba(255,255,255,0.5)' }}>
                    Initials
                  </button>
                  {AVATAR_OPTIONS.map(av => (
                    <button key={av.id} type="button" onClick={()=>{ setAvatarMode('icon'); setAvatarChoice(av.id); }}
                      style={{ width:36, height:36, borderRadius:'50%', border:'2px solid', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s',
                        borderColor: avatarMode==='icon' && avatarChoice===av.id ? '#4f46e5' : 'rgba(255,255,255,0.15)',
                        background: avatarMode==='icon' && avatarChoice===av.id ? 'rgba(79,70,229,0.25)' : 'rgba(255,255,255,0.05)' }}>
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>
            </>)}
            <div>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                placeholder="you@example.com" style={inp} autoComplete="email" />
            </div>
            <div>
              <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                placeholder={mode==='signup'?'Min. 8 characters':'Your password'} style={inp} autoComplete={mode==='signup'?'new-password':'current-password'} />
            </div>
            {mode === 'signup' && (
              <div>
                <label style={{ display:'block', color:'rgba(255,255,255,0.6)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Confirm Password</label>
                <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&handleSubmit()}
                  placeholder="Repeat password" style={inp} autoComplete="new-password" />
              </div>
            )}

            {error && <p style={{ margin:0, padding:'8px 12px', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:8, color:'#fca5a5', fontSize:12, lineHeight:1.5 }}>{error}</p>}
            {success && <p style={{ margin:0, padding:'8px 12px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:8, color:'#6ee7b7', fontSize:12, lineHeight:1.5 }}>{success}</p>}

            {/* Terms of Use checkbox — signup only */}
            {mode === 'signup' && (
              <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:9 }}>
                <input
                  type="checkbox"
                  id="tou-checkbox"
                  checked={touChecked}
                  onChange={e => setTouChecked(e.target.checked)}
                  disabled={!touViewed}
                  style={{ marginTop:2, cursor: touViewed ? 'pointer' : 'not-allowed', accentColor:'#4f46e5', width:15, height:15, flexShrink:0 }}
                />
                <label htmlFor="tou-checkbox" style={{ color:'rgba(255,255,255,0.6)', fontSize:12, lineHeight:1.5, cursor: touViewed ? 'pointer' : 'default' }}>
                  I have read and agree to the{' '}
                  <button type="button" onClick={() => { setTouModalOpen(true); setTouViewed(true); }}
                    style={{ background:'none', border:'none', color:'#818cf8', fontSize:12, cursor:'pointer', textDecoration:'underline', padding:0 }}>
                    Terms of Use
                  </button>
                  {!touViewed && <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}> — click to read first</span>}
                </label>
              </div>
            )}

            {/* ToU Modal Overlay */}
            {touModalOpen && (
              <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
                onClick={e => { if (e.target === e.currentTarget) setTouModalOpen(false); }}>
                <div style={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, width:'100%', maxWidth:680, maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
                    <span style={{ color:'white', fontWeight:700, fontSize:15 }}>LucidMSK — Terms of Use</span>
                    <button onClick={() => setTouModalOpen(false)} style={{ background:'none', border:'none', color:'#64748b', fontSize:18, cursor:'pointer', lineHeight:1 }}>✕</button>
                  </div>
                  <div style={{ overflowY:'auto', padding:'20px 24px', flex:1, color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.75 }}>
                    {TOU_TEXT}
                  </div>
                  <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'flex-end', gap:10, flexShrink:0 }}>
                    <button onClick={() => setTouModalOpen(false)}
                      style={{ padding:'9px 22px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ padding:'12px', borderRadius:10, border:'none', cursor:loading?'not-allowed':'pointer', fontWeight:800, fontSize:14, letterSpacing:'0.04em',
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg,#2563eb,#4f46e5)',
                color: loading ? 'rgba(255,255,255,0.4)' : 'white',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(37,99,235,0.4)',
                transition:'all 0.15s', marginTop:4 }}>
              {loading ? '⏳ Please wait…' : mode==='signin' ? '→ Sign In' : '→ Create Account'}
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}

// ── CME Banner: keyword-matches report text against CME modules ──────────────
function findCmeMatches(reportText, modules) {
  if (!reportText || !modules?.length) return [];
  // Tokenize report: lowercase words 4+ chars (skip short filler words)
  const tokens = reportText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  if (!tokens.length) return [];
  const tokenSet = new Set(tokens);
  const scored = modules.map(m => {
    const haystack = `${m.title || ''} ${m.specialty || ''}`.toLowerCase();
    const haystackTokens = haystack.match(/\b[a-z]{4,}\b/g) || [];
    let score = 0;
    haystackTokens.forEach(t => { if (tokenSet.has(t)) score++; });
    return { ...m, score };
  }).filter(m => m.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

function CmeBanner({ matches, dm }) {
  if (!matches?.length) return null;
  return (
    <div style={{
      background: dm ? 'rgba(20,83,45,0.35)' : 'rgba(220,252,231,0.9)',
      border: `1px solid ${dm ? '#166534' : '#86efac'}`,
      borderRadius: 10,
      padding: '10px 12px',
      marginBottom: 12,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: dm ? '#4ade80' : '#15803d', marginBottom: 7, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
        🎓 Related CME Available
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {matches.map(m => (
          <a
            key={m.id}
            href={m.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: dm ? 'rgba(34,197,94,0.15)' : 'white',
              border: `1px solid ${dm ? '#166534' : '#bbf7d0'}`,
              borderRadius: 7,
              padding: '7px 10px',
              textDecoration: 'none',
              cursor: m.url ? 'pointer' : 'default',
            }}
          >
            <span style={{ fontSize: 14 }}>📋</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: dm ? '#4ade80' : '#15803d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.title}
              </div>
              {m.specialty && (
                <div style={{ fontSize: 10, color: dm ? '#86efac' : '#16a34a', marginTop: 1 }}>{m.specialty}</div>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'white', background: dm ? '#16a34a' : '#22c55e', borderRadius: 5, padding: '2px 7px', whiteSpace: 'nowrap', flexShrink: 0 }}>
              CLAIM CME
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // ── Auth state ────────────────────────────────────────────────────────────
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [approvalStatus, setApprovalStatus] = useState(null);
  const [sessionKickedOut, setSessionKickedOut] = useState(false);
  const sessionCheckRef = useRef(null); // null=checking, true=approved, false=pending, 'rejected'=rejected
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showTouModal, setShowTouModal] = useState(false);
  const [userPrefs, setUserPrefs] = useState({ firstName:'', lastName:'', avatarMode:'initials', avatarChoice:'stethoscope' });
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);

  // Restore session + prefs — with token refresh if expiring within 10 minutes
  useEffect(() => {
    const doRestore = async () => {
      const s = loadSession();
      if (!s?.user || !s?.access_token || !localStorage.getItem('msk_session')) {
        setAuthLoading(false); return;
      }
      let accessToken = s.access_token;
      // Refresh if token expires within 10 minutes (600000ms)
      const expiresIn = (s.expires_at || 0) - Date.now();
      if (expiresIn < 600000 && s.refresh_token) {
        try {
          const r = await fetch(`${SUPA_URL}/auth/v1/token?grant_type=refresh_token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', apikey: getAnonKey() },
            body: JSON.stringify({ refresh_token: s.refresh_token }),
          });
          if (r.ok) {
            const fresh = await r.json();
            if (fresh.access_token) {
              saveSession(fresh);
              accessToken = fresh.access_token;
            }
          }
        } catch {} // Refresh failed — use existing token, will expire eventually
      }
      const prefs = loadUserPrefs(s.user.id);
      if (prefs) setUserPrefs(p => ({ ...p, ...prefs }));
      const restoredUser = { ...s.user, access_token: accessToken };

      // ── Session token check (skip for admins) ──────────────────────────
      if (!ADMIN_EMAILS.includes(restoredUser.email?.toLowerCase())) {
        const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
        if (storedToken) {
          const result = await verifySessionToken(restoredUser.id, storedToken, accessToken);
          if (result === 'invalid') {
            // Another device logged in — kick this one out
            localStorage.removeItem('msk_session');
            localStorage.removeItem(SESSION_TOKEN_KEY);
            setSessionKickedOut(true);
            setAuthLoading(false);
            return;
          }
        }
      }

      setAuthUser(restoredUser);
      // Re-check approval on session restore
      if (restoredUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setApprovalStatus(true);
      } else {
        try {
          const rows = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${restoredUser.id}&select=approved,rejected`, {
            headers: { apikey: getAnonKey(), Authorization: `Bearer ${accessToken}` },
          }).then(r => r.json());
          if (!rows || rows.length === 0) setApprovalStatus(false);
          else if (rows[0].rejected) setApprovalStatus('rejected');
          else setApprovalStatus(rows[0].approved === true);
        } catch { setApprovalStatus(false); }
      }
      setAuthLoading(false);
    };
    doRestore();
  }, []);

  // ── Fetch published CME modules once (used for CME banner matching) ──────
  useEffect(() => {
    fetch(`${SUPABASE_URL}/rest/v1/cme_modules?select=id,title,specialty,url&status=eq.published`, {
      headers: { apikey: getAnonKey() }
    }).then(r => r.ok ? r.json() : []).then(data => {
      if (Array.isArray(data)) setCmeModules(data);
    }).catch(() => {});
  }, []);

  const handleLogin = async (user) => {
    // Load prefs BEFORE setting authUser so auto-save guard doesn't overwrite them
    const prefs = loadUserPrefs(user.id);
    if (prefs) setUserPrefs(p => ({ ...p, ...prefs }));
    setSessionKickedOut(false);
    // ── Generate + write session token (skip for admins) ──────────────────
    if (!ADMIN_EMAILS.includes(user.email?.toLowerCase())) {
      const token = generateSessionToken();
      localStorage.setItem(SESSION_TOKEN_KEY, token);
      await writeSessionToken(user.id, token, user.access_token);
    }
    setAuthUser(user);
    // Check approval status immediately after login (admin always bypasses)
    if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      setApprovalStatus(true);
    } else {
      // Retry up to 4 times with 500ms delay — JWT sometimes needs a moment
      // to propagate through Supabase RLS before the profiles query returns data
      const checkApproval = async (retries = 4, delay = 500) => {
        try {
          const rows = await fetch(`${SUPA_URL}/rest/v1/profiles?id=eq.${user.id}&select=approved,rejected`, {
            headers: { apikey: getAnonKey(), Authorization: `Bearer ${user.access_token}` },
          }).then(r => r.json());
          if (!rows || rows.length === 0) {
            // Empty result — JWT may not have propagated yet, retry
            if (retries > 0) {
              await new Promise(res => setTimeout(res, delay));
              return checkApproval(retries - 1, delay);
            }
            setApprovalStatus(false); // genuinely no profile row
          } else if (rows[0].rejected) {
            setApprovalStatus('rejected');
          } else {
            setApprovalStatus(rows[0].approved === true);
          }
        } catch {
          if (retries > 0) {
            await new Promise(res => setTimeout(res, delay));
            return checkApproval(retries - 1, delay);
          }
          setApprovalStatus(false);
        }
      };
      await checkApproval();
    }
  };
  const handleSignOut = () => {
    // Clear session token from localStorage
    try { localStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
    // Clear session check interval
    if (sessionCheckRef.current) { clearInterval(sessionCheckRef.current); sessionCheckRef.current = null; }
    // Wipe ALL auth-related storage synchronously — no server call needed
    try {
      localStorage.removeItem('msk_session');
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith('sb-') || k.includes('supabase')) localStorage.removeItem(k);
      });
    } catch {}
    setAuthUser(null);
    setApprovalStatus(null);
    setSessionKickedOut(false);
    setShowAdminPanel(false);
    setUserPrefs({ firstName:'', lastName:'', avatarMode:'initials', avatarChoice:'stethoscope' });
    setShowAvatarPopup(false);
  };

  // ── Mobile state ──────────────────────────────────────────────────────────
  const [mobileTab, setMobileTab] = useState(0); // 0=Dictation, 1=Report, 2=Reference
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const [selectedBodyPart, setSelectedBodyPart] = useState('spine');
  const [side, setSide] = useState('left');
  const [contrast, setContrast] = useState('without');
  const [modality, setModality] = useState('MRI');
  const [dictationText, setDictationText] = useState('');
  const [generatedReport, setGeneratedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState('');
  const [spineRegion, setSpineRegion] = useState('lumbar');
  const [showAtlas, setShowAtlas] = useState(false);
  const [showDdx, setShowDdx] = useState(false);
  const [showResearch, setShowResearch] = useState(false);
  const [showHub, setShowHub] = useState(false);
  const [hubTab, setHubTab] = useState('research'); // 'research' | 'jobs' | 'cme'
  const [cmeModules, setCmeModules] = useState([]);  // CME library — loaded once at app mount

  const [darkMode, setDarkMode] = useState(false);
  const dm = darkMode;
  const recognitionRef = useRef(null);
  const isRheumRef = useRef(false); // tracks current modality for STT handler
  const finalTranscriptPersistRef = useRef(''); // persists transcript across recognition restarts

  // ── Incidental findings state ──────────────────────────────────────────────
  // Fleischner (lung nodule)
  const [noduleType, setNoduleType] = useState('');       // 'solid'|'ggo'|'partsolid'
  const [noduleSize, setNoduleSize] = useState('');       // size bucket string
  // GU incidentals
  const [renalFinding, setRenalFinding] = useState('');
  const [gynFinding, setGynFinding] = useState('');
  const [aortaFinding, setAortaFinding] = useState('');
  // Patient demographics (for GYN menopausal logic)
  const [patientAge, setPatientAge] = useState('');
  const [patientSex, setPatientSex] = useState('');
  const [layPersonSummary, setLayPersonSummary] = useState(false);
  const [includeDoseOpt, setIncludeDoseOpt] = useState(true);
  const [massMode, setMassMode] = useState('auto'); // 'auto' | 'new' | 'followup' | 'postresection'
  // ── Arthroplasty module state ─────────────────────────────────────────────
  const [arthroplastyEnabled, setArthroplastyEnabled] = useState(false);
  const [arthroplastyType, setArthroplastyType] = useState(''); // shoulder: 'rtsa'|'atsa'|'hemi'; hip: 'tha'; knee: 'tka'
  const [arthroplastyChecklist, setArthroplastyChecklist] = useState({});
  const [arthroplastyGrading, setArthroplastyGrading] = useState('');
  const [arthroplastyImageTab, setArthroplastyImageTab] = useState(0);
  // ── Rheum module state ──────────────────────────────────────────────────
  const [rheumJoint, setRheumJoint] = useState('knee');
  const [rheumLaterality, setRheumLaterality] = useState('left');
  const [rheumViews, setRheumViews] = useState('2');
  const [rheumChecks, setRheumChecks] = useState({});
  const [rheumFreeText, setRheumFreeText] = useState('');
  const [isGeneratingRheum, setIsGeneratingRheum] = useState(false);
  const WEBSITE_URL = 'https://mri-reporting.vercel.app'; // update to your actual patient-facing URL

  const showSide = !BILATERAL.includes(selectedBodyPart);
  const isCT = modality === 'CT';
  const isRheum = modality === 'Rheum';
  useEffect(() => { isRheumRef.current = isRheum; }, [isRheum]);
  const partLabel = selectedBodyPart === 'spine' ? `${spineRegion} spine` : selectedBodyPart;
  const sideLabel = showSide ? `${side} ` : '';
  const contrastLabel = contrast === 'without' ? 'without' : contrast === 'with' ? 'with' : 'with and without';

  const technique = isCT
    ? `CT scan of the ${sideLabel}${partLabel} ${contrastLabel} IV contrast. Multiplanar reformats were created.${includeDoseOpt ? ' One or more of the following dose optimizing techniques were utilized for this exam: automated exposure control, adjustment of the mA and/or kV according to patient size, and/or use of iterative reconstruction technique.' : ''}`
    : `Multiplanar multisequence MRI of the ${sideLabel}${partLabel} ${contrastLabel} IV contrast.`;


  // ── Incidental trigger logic ──────────────────────────────────────────────
  const showLungWarning = isCT && (
    selectedBodyPart === 'shoulder' ||
    (selectedBodyPart === 'spine' && ['cervical','thoracic'].includes(spineRegion))
  );
  const showGUWarning = !isRheum && (
    selectedBodyPart === 'hip' ||
    selectedBodyPart === 'pelvis' ||
    (selectedBodyPart === 'spine' && spineRegion === 'lumbar')
  );

  // Menopausal status inference
  const age = parseInt(patientAge) || null;
  const isPostmenopausal = patientSex === 'F' && age !== null ? age >= 51 : null;
  // null = unknown (show both tiers)

  // Build incidental findings text for injection into prompt
  const buildIncidentalBlock = () => {
    const lines = [];

    // Fleischner
    if (showLungWarning && noduleType && noduleSize) {
      const fleischner = getFleischnerRec(noduleType, noduleSize);
      if (fleischner) {
        lines.push(`INCIDENTAL PULMONARY NODULE — ${noduleType.toUpperCase()} — ${noduleSize}:`);
        lines.push(`Low-risk patient: ${fleischner.low}`);
        lines.push(`High-risk patient: ${fleischner.high}`);
        lines.push(`Citation: MacMahon H et al. Guidelines for Management of Incidental Pulmonary Nodules Detected on CT Images: From the Fleischner Society 2017. Radiology 2017;284(1):228-243.`);
      }
    }

    // Renal
    if (showGUWarning && renalFinding) {
      const renal = getRenalRec(renalFinding);
      if (renal) {
        lines.push(`INCIDENTAL RENAL FINDING — ${renalFinding}:`);
        lines.push(renal.rec);
        lines.push(`Citation: Herts BR et al. ACR Incidental Findings Committee Recommendation for CT and MRI of the Kidney. J Am Coll Radiol 2018;15(2):264-273.`);
      }
    }

    // GYN
    if (showGUWarning && gynFinding) {
      const gyn = getGynRec(gynFinding, isPostmenopausal);
      if (gyn) {
        lines.push(`INCIDENTAL GYNECOLOGIC FINDING — ${gynFinding}:`);
        if (isPostmenopausal === null) {
          lines.push(`If premenopausal: ${gyn.pre}`);
          lines.push(`If postmenopausal: ${gyn.post}`);
        } else {
          lines.push(isPostmenopausal ? gyn.post : gyn.pre);
        }
        lines.push(`Citation: Patel MD et al. ACR Appropriateness Criteria / SRU Consensus Guidelines on Management of Adnexal Cysts. J Am Coll Radiol 2020.`);
      }
    }

    // Aorta
    if (showGUWarning && aortaFinding) {
      const aorta = getAortaRec(aortaFinding);
      if (aorta) {
        lines.push(`INCIDENTAL AORTIC FINDING — ${aortaFinding}:`);
        lines.push(aorta.rec);
        lines.push(`Citation: Khosa F et al. ACR Incidental Findings Committee Recommendations for Abdominal Aortic Aneurysm. J Am Coll Radiol 2013;10(8):575-579.`);
      }
    }

    return lines.length ? lines.join('\n') : '';
  };

  // Reset incidentals when body part / modality / spine region changes
  const resetIncidentals = () => {
    setNoduleType(''); setNoduleSize('');
    setRenalFinding(''); setGynFinding('');
    setAortaFinding('');
  };
  const resetArthroplasty = () => {
    setArthroplastyEnabled(false);
    setArthroplastyType('');
    setArthroplastyChecklist({});
    setArthroplastyGrading('');
    setArthroplastyImageTab(0);
  };

  const generateReport = async () => {
    const textToUse = isRheum ? rheumFreeText : dictationText;
    if (!textToUse.trim()) return;
    setGeneratedReport(''); // always clears center col — any button can override
    setIsGenerating(true);
    const lat = showSide ? side : '';
    // ── Mass mode resolution ─────────────────────────────────────────────────
    const massKeywords = [
      'mass','tumor','tumour','cancer','malignancy','malignant',
      'carcinoma','sarcoma','lymphoma','metastasis','metastatic',
      'metastases','neoplasm','neoplastic','lesion','recurrence',
      'recurrent','oncology','oncologic'
    ];
    const hasMassKeyword = massKeywords.some(k => textToUse.toLowerCase().includes(k));
    // Resolve effective mode: if user pinned a mode, use it; otherwise 'auto' passes through to prompt
    const resolvedMassMode = massMode; // 'auto' lets the prompt do its own detection
    try {
      const layPersonInstruction = layPersonSummary
        ? `\n\nADDITIONAL SECTION — IMPORTANT: After you have completed the full formal radiology report including TECHNIQUE, FINDINGS, IMPRESSION, and any REFERENCES/FOOTNOTE sections, append one final separate section at the very end. Do not modify the formal report sections in any way. The additional section must begin with the exact header "UNDERSTANDING YOUR RESULTS:" on its own line in ALL CAPS. Then write 2-5 plain-language sentences summarizing the key findings for a patient with a high school education. Rules: no medical jargon — use "wear and tear" not "osteoarthritis", "cartilage damage" not "chondromalacia", "torn" not "ruptured", "fluid buildup" not "effusion", "pinched nerve" not "radiculopathy". Be clear but reassuring in tone. Do not repeat the formal impression verbatim`
        : '';
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:2000,
          system: isRheum ? buildRheumPrompt(rheumJoint, rheumLaterality, rheumViews) + layPersonInstruction : buildPrompt(selectedBodyPart, lat, contrast, spineRegion, modality, includeDoseOpt, resolvedMassMode) + layPersonInstruction,
          messages:[{role:'user',content:`Dictated findings:\n\n${isRheum ? rheumFreeText : dictationText}${(!isRheum && buildIncidentalBlock()) ? '\n\nINCIDENTAL FINDINGS TO ADD TO IMPRESSION AND REFERENCES:\n' + buildIncidentalBlock() : ''}`}],
        }),
      });
      const data = await res.json();
      if (data?.error) setGeneratedReport('Error: ' + data.error);
      else { setGeneratedReport(data?.content?.[0]?.text || 'Error generating report.'); setMobileTab(1); }
    } catch { setGeneratedReport('Network error. Please try again.'); }
    setIsGenerating(false);
  };

  // ── Generate Report from DDx checkboxes ───────────────────────────────────
  const generateRheumReport = async () => {
    setIsGeneratingRheum(true);
    setGeneratedReport(''); // always clears and replaces center col
    const jLabel = RHEUM_JOINTS[rheumJoint]?.label || rheumJoint;
    // Build a structured finding list from checked boxes
    const checkedFindings = [];
    const jData = RHEUM_JOINTS[rheumJoint];
    if (jData) {
      jData.categories.forEach(cat => {
        cat.findings.forEach(f => {
          if (rheumChecks[f.id]) checkedFindings.push(`[${cat.label}] ${f.label}`);
        });
      });
    }
    const findingsSummary = checkedFindings.length > 0
      ? checkedFindings.map(f => `• ${f}`).join('\n')
      : '(No specific findings selected — generate differential only)';
    try {
      const res = await fetch('/api/generate', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          model:'claude-sonnet-4-6',
          max_tokens:1500,
          system: buildRheumPrompt(rheumJoint, rheumLaterality, rheumViews),
          messages:[{role:'user',content:`Radiographic findings checked by the radiologist:\n\n${findingsSummary}\n\nPlease generate a structured X-ray report. For the impression (2-3 sentences maximum): use SINGULAR — "The imaging pattern is most consistent with the diagnosis of [X]." If there is a secondary consideration add "Next consideration includes [Y]." (brief). If two entities coexist: "The imaging pattern is most consistent with [X] superimposed with [Y]." KNEE CPPD vs OA: if chondrocalcinosis + isolated patellofemoral narrowing or prominent subchondral cysts → favor CPPD primary; if chondrocalcinosis + tricompartmental or medial narrowing + osteophytes → favor OA primary with CPPD next. Do NOT repeat findings from FINDINGS. Do NOT reference ABCDE or ABCDEs.`}],
        }),
      });
      const data = await res.json();
      if (data?.error) setGeneratedReport('Error: ' + data.error);
      else { setGeneratedReport(data?.content?.[0]?.text || 'Error generating report.'); setMobileTab(1); }
    } catch { setGeneratedReport('Network error. Please try again.'); }
    setIsGeneratingRheum(false);
  };

  const keepaliveTimerRef = useRef(null);

  const startKeepalive = (getRecRef) => {
    stopKeepalive();
    keepaliveTimerRef.current = setInterval(() => {
      const rec = getRecRef();
      if (!rec) { stopKeepalive(); return; }
      // Restart recognition before browser's ~60s silence timeout fires
      // We do this by stopping; onend will immediately restart with persisted transcript
      try { rec.stop(); } catch {}
    }, 8000);
  };

  const stopKeepalive = () => {
    if (keepaliveTimerRef.current) { clearInterval(keepaliveTimerRef.current); keepaliveTimerRef.current = null; }
  };

  const toggleListening = () => {
    if (isListening) { stopKeepalive(); recognitionRef.current?.stop(); setIsListening(false); return; }
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Please use Chrome or Edge.'); return; }
    setMicError('');
    finalTranscriptPersistRef.current = ''; // reset transcript on fresh dictation start
    try {
      const recognition = new SR();
      recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US'; recognition.maxAlternatives = 1;
      recognition.onstart = () => setIsListening(true);
      recognition.onaudiostart = () => setIsListening(true);
      recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalTranscriptPersistRef.current += t + ' ';
          else interim += t;
        }
        const transcript = finalTranscriptPersistRef.current + interim;
        if (isRheumRef.current) setRheumFreeText(transcript);
        else setDictationText(transcript);
      };
      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') { stopKeepalive(); setMicError('Microphone access denied. Click the lock icon in your address bar.'); setIsListening(false); }
      };
      recognition.onend = () => {
        if (recognitionRef.current === recognition) {
          setTimeout(() => {
            if (recognitionRef.current !== recognition) return;
            const SR2 = window.webkitSpeechRecognition || window.SpeechRecognition;
            try {
              const rec2 = new SR2();
              rec2.continuous = true; rec2.interimResults = true; rec2.lang = 'en-US'; rec2.maxAlternatives = 1;
              rec2.onstart = recognition.onstart; rec2.onaudiostart = recognition.onaudiostart;
              rec2.onresult = recognition.onresult; rec2.onerror = recognition.onerror; rec2.onend = recognition.onend;
              rec2.start(); recognitionRef.current = rec2;
            } catch { stopKeepalive(); setIsListening(false); }
          }, 150);
        }
      };
      recognition.start();
      recognitionRef.current = recognition;
      startKeepalive(() => recognitionRef.current);
    } catch (err) { stopKeepalive(); setIsListening(false); setMicError('Could not start microphone: ' + err.message); }
  };

  const stopListening = () => { stopKeepalive(); const rec = recognitionRef.current; recognitionRef.current = null; try { rec?.stop(); } catch {} setIsListening(false); };
  useEffect(() => () => { stopKeepalive(); recognitionRef.current?.stop(); }, []);

  const inp = { width:'100%',padding:'9px 12px',border:'1px solid '+(dm?'#334155':'#dde3ed'),borderRadius:8,fontSize:14,boxSizing:'border-box',color:dm?'#e2e8f0':'#1e293b',outline:'none',background:dm?'#0f172a':'white' };
  const lbl = { fontSize:11,fontWeight:600,color:dm?'#94a3b8':'#64748b',textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:5 };

  const colHdr = (gradient, icon, title) => (
    <div style={{ background:gradient,padding:'15px 18px',display:'flex',alignItems:'center',gap:10 }}>
      <span style={{ fontSize:18,filter:'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{icon}</span>
      <span style={{ color:'white',fontWeight:800,fontSize:13,textTransform:'uppercase',letterSpacing:'0.14em',textShadow:'0 1px 3px rgba(0,0,0,0.2)' }}>{title}</span>
    </div>
  );

  // Auto-save userPrefs — only when logged in, and only when prefs are non-default
  // (prevents sign-out state reset from overwriting stored prefs)
  const prefsInitialized = useRef(false);
  useEffect(() => {
    if (!authUser?.id) { prefsInitialized.current = false; return; }
    // Skip the first fire right after login (that's the restore, not a user change)
    if (!prefsInitialized.current) { prefsInitialized.current = true; return; }
    saveUserPrefs(authUser.id, userPrefs);
  }, [userPrefs, authUser?.id]);

  // Close avatar popup on outside click — uses ref to check if click is outside
  const avatarPopupRef = useRef(null);
  useEffect(() => {
    if (!showAvatarPopup) return;
    const handleMouseDown = (e) => {
      if (avatarPopupRef.current && !avatarPopupRef.current.contains(e.target)) {
        setShowAvatarPopup(false);
      }
    };
    // Use mousedown so it fires before focus/blur on inputs
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showAvatarPopup]);

  // ── Periodic session token check every 5 minutes ──────────────────────────
  useEffect(() => {
    if (!authUser || ADMIN_EMAILS.includes(authUser.email?.toLowerCase())) return;
    const check = async () => {
      const storedToken = localStorage.getItem(SESSION_TOKEN_KEY);
      if (!storedToken) return;
      const result = await verifySessionToken(authUser.id, storedToken, authUser.access_token);
      if (result === 'invalid') {
        if (sessionCheckRef.current) { clearInterval(sessionCheckRef.current); sessionCheckRef.current = null; }
        try { localStorage.removeItem('msk_session'); localStorage.removeItem(SESSION_TOKEN_KEY); } catch {}
        setAuthUser(null);
        setApprovalStatus(null);
        setSessionKickedOut(true);
      }
    };
    sessionCheckRef.current = setInterval(check, 5 * 60 * 1000); // every 5 min
    return () => { if (sessionCheckRef.current) clearInterval(sessionCheckRef.current); };
  }, [authUser]);

  // ── AUTH GATE ── after all hooks ───────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ color:'rgba(255,255,255,0.4)',fontSize:14 }}>⏳ Loading…</div>
    </div>
  );
  // ── Session kicked out gate ────────────────────────────────────────────────
  if (sessionKickedOut) return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ background:'#0f172a', border:'1px solid rgba(245,101,101,0.3)', borderRadius:16, padding:'40px 36px', maxWidth:420, textAlign:'center', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize:40, marginBottom:16 }}>🔒</div>
        <div style={{ color:'#f87171', fontSize:18, fontWeight:800, marginBottom:10 }}>Signed Out</div>
        <div style={{ color:'#94a3b8', fontSize:14, lineHeight:1.7, marginBottom:28 }}>
          Your account was signed in on another device.<br/>
          Each account can only be active on one device at a time.
        </div>
        <button onClick={() => setSessionKickedOut(false)}
          style={{ padding:'12px 32px', background:'linear-gradient(135deg,rgba(99,179,237,0.2),rgba(99,179,237,0.08))', border:'1px solid rgba(99,179,237,0.35)', borderRadius:10, color:'#90cdf4', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          Sign In Again
        </button>
      </div>
    </div>
  );
  if (!authUser) return <LoginPage onLogin={handleLogin} />;
  // Approval gate — show while checking or if not yet approved
  if (approvalStatus === null) return (
    <div style={{ minHeight:'100vh',background:'#0a0f1e',display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ color:'rgba(255,255,255,0.4)',fontSize:14 }}>⏳ Checking access…</div>
    </div>
  );
  if (approvalStatus === 'rejected') return <RejectedPage onSignOut={handleSignOut} />;
  if (approvalStatus === false) return <PendingApprovalPage onSignOut={handleSignOut} />;

  return (
    <div style={{ minHeight:'100vh',background:'linear-gradient(160deg,#0d1b2a 0%,#1a3a5c 45%,#0d1b2a 100%)',fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {showAtlas && <AtlasModal onClose={() => setShowAtlas(false)} />}
      {showDdx && <DdxModal onClose={() => setShowDdx(false)} />}
      {showResearch && <ResearchModal onClose={() => setShowResearch(false)} currentUser={authUser} />}
      {showHub && <MSKHubModal initialTab={hubTab} onClose={() => setShowHub(false)} currentUser={authUser} isAdmin={['admin@lucidmsk.com','adamsinger82@gmail.com'].includes(authUser?.email?.toLowerCase())} />}

      {showAdminPanel && ['admin@lucidmsk.com','adamsinger82@gmail.com'].includes(authUser?.email?.toLowerCase()) && (
        <AdminPanel currentUser={authUser} onClose={() => setShowAdminPanel(false)} />
      )}

      {/* ── ToU Modal (accessible from profile settings) ── */}
      {showTouModal && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowTouModal(false); }}>
          <div style={{ background:'#1e293b', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, width:'100%', maxWidth:720, maxHeight:'82vh', display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.6)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.1)', flexShrink:0 }}>
              <span style={{ color:'white', fontWeight:700, fontSize:15 }}>LucidMSK — Terms of Use</span>
              <button onClick={() => setShowTouModal(false)} style={{ background:'none', border:'none', color:'#64748b', fontSize:18, cursor:'pointer', lineHeight:1 }}>✕</button>
            </div>
            <div style={{ overflowY:'auto', padding:'20px 26px', flex:1, color:'rgba(255,255,255,0.75)', fontSize:13, lineHeight:1.75 }}>
              {TOU_TEXT}
            </div>
            <div style={{ padding:'14px 22px', borderTop:'1px solid rgba(255,255,255,0.1)', display:'flex', justifyContent:'flex-end', flexShrink:0 }}>
              <button onClick={() => setShowTouModal(false)}
                style={{ padding:'9px 24px', borderRadius:9, border:'none', background:'linear-gradient(135deg,#2563eb,#4f46e5)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="msk-header" style={{ background:'rgba(255,255,255,0.04)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'12px 20px',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',position:'relative',zIndex:500 }}>
        {/* Left: LucidMSK logo */}
        <div className="msk-header-logo" style={{ display:'flex',alignItems:'center',gap:10,flexShrink:0 }}>
          <svg width="36" height="36" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
            <defs>
              <filter id="hdr-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="3" result="b"/>
                <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <style>{`
                @keyframes lucidNodeGlow {
                  0%,100%{filter:drop-shadow(0 0 4px #5b9ef7) drop-shadow(0 0 8px #90CAF9);opacity:1}
                  50%{filter:drop-shadow(0 0 8px #1976D2) drop-shadow(0 0 16px #42A5F5);opacity:0.7}
                }
                @keyframes lucidLineFade {
                  0%,100%{opacity:0.55} 50%{opacity:0.25}
                }
                .ln1{animation:lucidNodeGlow 2.6s ease-in-out infinite}
                .ln2{animation:lucidNodeGlow 2.6s ease-in-out infinite 0.65s}
                .ln3{animation:lucidNodeGlow 2.6s ease-in-out infinite 1.3s}
                .ll {animation:lucidLineFade  2.6s ease-in-out infinite}
              `}</style>
            </defs>
            <circle cx="36" cy="36" r="33" stroke="#1a3a6b" strokeWidth="1.2"/>
            <rect x="32" y="18" width="8" height="36" rx="4" fill="#5b9ef7" opacity="0.08"/>
            <ellipse cx="36" cy="18" rx="7" ry="5" fill="#5b9ef7" opacity="0.18"/>
            <ellipse cx="36" cy="54" rx="7" ry="5" fill="#5b9ef7" opacity="0.18"/>
            <line x1="33" y1="22" x2="33" y2="50" stroke="#5b9ef7" strokeWidth="1.5" opacity="0.35"/>
            <line x1="39" y1="22" x2="39" y2="50" stroke="#5b9ef7" strokeWidth="1.5" opacity="0.35"/>
            <line x1="36" y1="14" x2="20" y2="28" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="36" y1="14" x2="52" y2="28" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="20" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="52" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="20" y1="28" x2="16" y2="44" stroke="#4a90d9" strokeWidth="0.8" className="ll"/>
            <line x1="52" y1="28" x2="56" y2="44" stroke="#4a90d9" strokeWidth="0.8" className="ll"/>
            <line x1="36" y1="36" x2="26" y2="44" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="36" y1="36" x2="46" y2="44" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="16" y1="44" x2="36" y2="58" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="56" y1="44" x2="36" y2="58" stroke="#4a90d9" strokeWidth="0.9" className="ll"/>
            <line x1="26" y1="44" x2="36" y2="58" stroke="#7ab8f5" strokeWidth="0.8"/>
            <line x1="46" y1="44" x2="36" y2="58" stroke="#7ab8f5" strokeWidth="0.8"/>
            <circle cx="36" cy="14" r="3.2" fill="#5b9ef7" filter="url(#hdr-glow)" className="ln1"/>
            <circle cx="20" cy="28" r="2.5" fill="#4a90d9" filter="url(#hdr-glow)" className="ln2"/>
            <circle cx="52" cy="28" r="2.5" fill="#4a90d9" filter="url(#hdr-glow)" className="ln2"/>
            <circle cx="16" cy="44" r="2.5" fill="#4a90d9" filter="url(#hdr-glow)" className="ln3"/>
            <circle cx="56" cy="44" r="2.5" fill="#4a90d9" filter="url(#hdr-glow)" className="ln3"/>
            <circle cx="26" cy="44" r="2"   fill="#7ab8f5" filter="url(#hdr-glow)" className="ln2"/>
            <circle cx="46" cy="44" r="2"   fill="#7ab8f5" filter="url(#hdr-glow)" className="ln2"/>
            <circle cx="36" cy="58" r="3.2" fill="#5b9ef7" filter="url(#hdr-glow)" className="ln1"/>
            <circle cx="36" cy="36" r="3.8" fill="#90caf9" filter="url(#hdr-glow)" className="ln3"/>
          </svg>
          <span style={{ color:'#e0eaff', fontWeight:700, fontSize:22, letterSpacing:'2px', fontFamily:'Rajdhani, sans-serif', lineHeight:1 }}>
            Lucid<span style={{ color:'#5b9ef7' }}>MSK</span>
          </span>
        </div>

        {/* Center: MRI/CT toggle + tool buttons */}
        <div className="msk-header-center" style={{ display:'flex',alignItems:'center',justifyContent:'space-evenly',gap:16,flex:1,margin:'0 20px' }}>
          {/* MRI / CT / Rheum toggle */}
          <div style={{ display:'flex',alignItems:'center',background:'rgba(255,255,255,0.08)',borderRadius:10,padding:3,gap:2 }}>
            {[
              {id:'MRI', label:'MRI', active:'linear-gradient(135deg,#1d4ed8,#4f46e5)'},
              {id:'CT',  label:'CT',  active:'linear-gradient(135deg,#0e7490,#0891b2)'},
              {id:'Rheum',label:'Rheum', active:'linear-gradient(135deg,#7c2d92,#a855f7)'},
            ].map(({id,label,active}) => (
              <button key={id} onClick={() => setModality(id)}
                style={{ padding:'6px 18px',borderRadius:8,border:'none',cursor:'pointer',fontSize:13,fontWeight:700,letterSpacing:'0.06em',transition:'all 0.2s',
                  background:modality===id?active:'transparent',
                  color:modality===id?'white':'rgba(255,255,255,0.45)',
                  boxShadow:modality===id?'0 2px 8px rgba(0,0,0,0.25)':'none' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Atlas button */}
          <button onClick={() => setShowAtlas(true)}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',color:'white',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>🫁</span> MRI Anatomy Atlas
          </button>

          {/* Dark mode toggle */}
          <button onClick={() => setDarkMode(d => !d)}
            title={dm ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:9,border:'1px solid rgba(255,255,255,0.2)',background:dm?'rgba(255,255,255,0.15)':'rgba(255,255,255,0.08)',color:'white',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>{dm ? '☀️' : '🌙'}</span> {dm ? 'Light' : 'Dark'}
          </button>

          {/* MSK Hub dropdown */}
          <MSKHubDropdown
            onOpenResearch={() => { setHubTab('research'); setShowHub(true); }}
            onOpenCme={() => { setHubTab('cme'); setShowHub(true); }}
            onOpenJobs={() => { setHubTab('jobs'); setShowHub(true); }}
          />

          {/* DDx button */}
          <button onClick={() => setShowDdx(true)}
            style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 16px',borderRadius:9,border:'1px solid rgba(124,58,237,0.5)',background:'rgba(124,58,237,0.15)',color:'#c4b5fd',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.15s',backdropFilter:'blur(4px)' }}>
            <span>🔬</span> MSK Lesion DDx
          </button>
        </div>

        {/* Mobile: hamburger */}
        <button className="msk-hamburger" onClick={() => setMobileDrawer(d => !d)}
          style={{ display:'none',alignItems:'center',justifyContent:'center',width:38,height:38,borderRadius:9,border:'1px solid rgba(255,255,255,0.2)',background:'rgba(255,255,255,0.08)',cursor:'pointer',flexShrink:0,marginLeft:'auto' }}>
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <rect y="0" width="18" height="2" rx="1" fill="rgba(255,255,255,0.8)"/>
            <rect y="6" width="18" height="2" rx="1" fill="rgba(255,255,255,0.8)"/>
            <rect y="12" width="18" height="2" rx="1" fill="rgba(255,255,255,0.8)"/>
          </svg>
        </button>

        {/* Right: avatar button + sign out */}
        <div className="msk-header-right" style={{ display:'flex',alignItems:'center',gap:8,flexShrink:0,position:'relative' }}>

          {/* Avatar button — click to open prefs popup */}
          <button onClick={() => setShowAvatarPopup(p => !p)} title="Profile & Avatar"
            style={{ width:36,height:36,borderRadius:'50%',border:'2px solid rgba(255,255,255,0.2)',background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,transition:'all 0.15s',boxShadow:showAvatarPopup?'0 0 0 3px rgba(99,102,241,0.4)':'none' }}>
            {userPrefs.avatarMode === 'icon'
              ? <span style={{ fontSize:18,lineHeight:1 }}>{getAvatarIcon(userPrefs.avatarChoice)}</span>
              : <span style={{ fontSize:12,fontWeight:800,color:'white',letterSpacing:'-0.02em' }}>{getInitials(userPrefs.firstName, userPrefs.lastName, authUser?.email)}</span>
            }
          </button>

          {/* Admin button — only for admin users */}
          {['admin@lucidmsk.com','adamsinger82@gmail.com'].includes(authUser?.email?.toLowerCase()) && (
            <button onClick={() => setShowAdminPanel(true)}
              style={{ padding:'7px 13px',borderRadius:8,border:'1px solid rgba(148,163,255,0.35)',background:'rgba(148,163,255,0.1)',color:'rgba(148,163,255,0.9)',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap' }}>
              🛡️ Admin
            </button>
          )}

          {/* Sign Out */}
          <button onClick={handleSignOut}
            style={{ padding:'7px 13px',borderRadius:8,border:'1px solid rgba(255,255,255,0.15)',background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:600,cursor:'pointer',transition:'all 0.15s',whiteSpace:'nowrap' }}>
            Sign Out
          </button>

          {/* Avatar preference popup */}
          {showAvatarPopup && (
            <div ref={avatarPopupRef}
              style={{ position:'absolute',top:48,right:0,zIndex:500,background:'#1e293b',border:'1px solid rgba(255,255,255,0.12)',borderRadius:14,padding:18,minWidth:280,boxShadow:'0 16px 48px rgba(0,0,0,0.5)' }}>
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
                <span style={{ color:'white',fontWeight:700,fontSize:13 }}>Profile Settings</span>
                <button onClick={() => setShowAvatarPopup(false)} style={{ background:'none',border:'none',color:'#64748b',fontSize:16,cursor:'pointer',padding:'0 4px' }}>✕</button>
              </div>
              <p style={{ color:'#64748b',fontSize:11,margin:'0 0 12px' }}>{authUser?.email}</p>

              {/* Name fields */}
              <div style={{ display:'flex',gap:8,marginBottom:12 }}>
                <input value={userPrefs.firstName||''} onChange={e=>setUserPrefs(p=>({...p,firstName:e.target.value}))}
                  placeholder="First name"
                  style={{ flex:1,padding:'7px 10px',borderRadius:7,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:12,outline:'none' }} />
                <input value={userPrefs.lastName||''} onChange={e=>setUserPrefs(p=>({...p,lastName:e.target.value}))}
                  placeholder="Last name"
                  style={{ flex:1,padding:'7px 10px',borderRadius:7,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.06)',color:'white',fontSize:12,outline:'none' }} />
              </div>

              {/* Style toggle */}
              <p style={{ color:'rgba(255,255,255,0.5)',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em',margin:'0 0 8px' }}>Display Style</p>
              <div style={{ display:'flex',gap:8,marginBottom:14 }}>
                <button onClick={() => setUserPrefs(p=>({...p,avatarMode:'initials'}))}
                  style={{ flex:1,padding:'7px',borderRadius:8,border:'1px solid',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                    borderColor:userPrefs.avatarMode==='initials'?'#4f46e5':'rgba(255,255,255,0.1)',
                    background:userPrefs.avatarMode==='initials'?'rgba(79,70,229,0.2)':'rgba(255,255,255,0.04)',
                    color:userPrefs.avatarMode==='initials'?'#a5b4fc':'rgba(255,255,255,0.4)' }}>
                  Initials
                </button>
                <button onClick={() => setUserPrefs(p=>({...p,avatarMode:'icon'}))}
                  style={{ flex:1,padding:'7px',borderRadius:8,border:'1px solid',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.15s',
                    borderColor:userPrefs.avatarMode==='icon'?'#4f46e5':'rgba(255,255,255,0.1)',
                    background:userPrefs.avatarMode==='icon'?'rgba(79,70,229,0.2)':'rgba(255,255,255,0.04)',
                    color:userPrefs.avatarMode==='icon'?'#a5b4fc':'rgba(255,255,255,0.4)' }}>
                  Icon
                </button>
              </div>

              {/* Avatar icon grid */}
              {userPrefs.avatarMode === 'icon' && (
                <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginBottom:14 }}>
                  {AVATAR_OPTIONS.map(av => (
                    <button key={av.id} onClick={() => setUserPrefs(p=>({...p,avatarChoice:av.id}))}
                      style={{ width:40,height:40,borderRadius:'50%',border:'2px solid',fontSize:20,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.12s',
                        borderColor:userPrefs.avatarChoice===av.id?'#4f46e5':'rgba(255,255,255,0.1)',
                        background:userPrefs.avatarChoice===av.id?'rgba(79,70,229,0.25)':'rgba(255,255,255,0.04)' }}>
                      {av.icon}
                    </button>
                  ))}
                </div>
              )}

              {/* Terms of Use link */}
              <button
                onClick={() => setShowTouModal(true)}
                style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid rgba(148,163,255,0.25)', background:'rgba(148,163,255,0.06)', color:'rgba(148,163,255,0.8)', fontSize:12, fontWeight:600, cursor:'pointer', textAlign:'left', marginBottom:10 }}>
                📋 View Terms of Use
              </button>

              {/* Preview + Save */}
              <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                <div style={{ width:40,height:40,borderRadius:'50%',background:'linear-gradient(135deg,#2563eb,#7c3aed)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  {userPrefs.avatarMode==='icon'
                    ? <span style={{ fontSize:20 }}>{getAvatarIcon(userPrefs.avatarChoice)}</span>
                    : <span style={{ fontSize:13,fontWeight:800,color:'white' }}>{getInitials(userPrefs.firstName,userPrefs.lastName,authUser?.email)}</span>
                  }
                </div>
                <button onClick={() => { setShowAvatarPopup(false); }}
                  style={{ flex:1,padding:'9px',borderRadius:9,border:'none',background:'linear-gradient(135deg,#2563eb,#4f46e5)',color:'white',fontWeight:700,fontSize:13,cursor:'pointer' }}>
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE DRAWER (hidden on desktop via CSS) ── */}
      {mobileDrawer && (
        <div className="msk-drawer" style={{ display:'none',flexDirection:'column',background:'#0d1b2a',borderBottom:'1px solid rgba(255,255,255,0.1)',padding:'12px 14px',gap:8,zIndex:200 }}>
          {/* Modality toggle */}
          <div style={{ display:'flex',alignItems:'center',background:'rgba(255,255,255,0.08)',borderRadius:10,padding:3,gap:2 }}>
            {[
              {id:'MRI', label:'MRI', active:'linear-gradient(135deg,#1d4ed8,#4f46e5)'},
              {id:'CT',  label:'CT',  active:'linear-gradient(135deg,#0e7490,#0891b2)'},
              {id:'Rheum',label:'Rheum', active:'linear-gradient(135deg,#7c2d92,#a855f7)'},
            ].map(({id,label,active}) => (
              <button key={id} onClick={() => { setModality(id); setMobileDrawer(false); }}
                style={{ flex:1,padding:'10px 8px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:700,letterSpacing:'0.06em',transition:'all 0.2s',
                  background:modality===id?active:'transparent',
                  color:modality===id?'white':'rgba(255,255,255,0.45)',
                  boxShadow:modality===id?'0 2px 8px rgba(0,0,0,0.25)':'none' }}>
                {label}
              </button>
            ))}
          </div>
          {/* Tool buttons */}
          {[
            { label:'🫁 MRI Anatomy Atlas', onClick:() => { setShowAtlas(true); setMobileDrawer(false); }, color:'rgba(255,255,255,0.08)', border:'rgba(255,255,255,0.2)', textColor:'white' },
            { label:'📰 Latest MSK Research', onClick:() => { setHubTab('research'); setShowHub(true); setMobileDrawer(false); }, color:'rgba(16,185,129,0.12)', border:'rgba(16,185,129,0.5)', textColor:'#6ee7b7' },
            { label:'💼 MSK Jobs Board', onClick:() => { setHubTab('jobs'); setShowHub(true); setMobileDrawer(false); }, color:'rgba(99,179,237,0.12)', border:'rgba(99,179,237,0.4)', textColor:'#90cdf4' },
            { label:'🔬 MSK Lesion DDx', onClick:() => { setShowDdx(true); setMobileDrawer(false); }, color:'rgba(124,58,237,0.15)', border:'rgba(124,58,237,0.5)', textColor:'#c4b5fd' },
            { label:dm?'☀️ Light Mode':'🌙 Dark Mode', onClick:() => { setDarkMode(d=>!d); setMobileDrawer(false); }, color:'rgba(255,255,255,0.08)', border:'rgba(255,255,255,0.2)', textColor:'white' },
          ].map((btn,i) => (
            <button key={i} onClick={btn.onClick}
              style={{ width:'100%',padding:'12px 14px',borderRadius:10,border:`1px solid ${btn.border}`,background:btn.color,color:btn.textColor,fontSize:14,fontWeight:700,cursor:'pointer',textAlign:'left',letterSpacing:'0.03em' }}>
              {btn.label}
            </button>
          ))}
          <button onClick={() => { handleSignOut(); setMobileDrawer(false); }}
            style={{ width:'100%',padding:'12px 14px',borderRadius:10,border:'1px solid rgba(255,100,100,0.3)',background:'rgba(239,68,68,0.08)',color:'#fca5a5',fontSize:14,fontWeight:700,cursor:'pointer',textAlign:'left' }}>
            ← Sign Out
          </button>
        </div>
      )}

      {/* ── MOBILE TAB BAR (hidden on desktop via CSS) ── */}
      <div className="msk-tab-bar" style={{ display:'none',position:'sticky',top:0,zIndex:100,background:'rgba(13,27,42,0.97)',backdropFilter:'blur(8px)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'6px 12px',gap:6 }}>
        {[
          { label:'📝 Dictation', icon:'📝' },
          { label:'📄 Report',    icon:'📄' },
          { label:'📐 Reference', icon:'📐' },
        ].map((t,i) => (
          <button key={i} onClick={() => setMobileTab(i)}
            style={{ flex:1,padding:'10px 4px',borderRadius:9,border:'none',cursor:'pointer',fontSize:12,fontWeight:700,transition:'all 0.2s',
              background: mobileTab===i
                ? (i===0 ? (isRheum?'linear-gradient(135deg,#7c2d92,#a855f7)':isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#4f46e5)') : i===1 ? 'linear-gradient(135deg,#5b21b6,#7c3aed)' : (isRheum?'linear-gradient(135deg,#7c2d92,#a855f7)':isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#4f46e5)'))
                : 'rgba(255,255,255,0.05)',
              color: mobileTab===i ? 'white' : 'rgba(255,255,255,0.4)',
              boxShadow: mobileTab===i ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── THREE COLUMN GRID ── */}
      <div className="msk-grid">

        {/* Col 1 — Dictation */}
        <div className={`msk-col${mobileTab===0?' mobile-active':''}`} style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr(isRheum?'linear-gradient(135deg,#7c2d92,#a855f7)':isCT?'linear-gradient(135deg,#0e7490,#0891b2)':'linear-gradient(135deg,#1d4ed8,#2563eb)', isRheum?'🩻':isCT?'🔬':'📝', isRheum?'X-Ray Dictation (Rheum)':isCT?'CT Dictation Input':'MRI Dictation Input')}
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            <div style={{ display:'flex',gap:8 }}>
              {isRheum ? (<>
                <div style={{ flex:2 }}><label style={lbl}>Joint / Region</label>
                  <select style={inp} value={rheumJoint} onChange={e => { setRheumJoint(e.target.value); setRheumChecks({}); }}>
                    {[['hand','Hand'],['wrist','Wrist'],['elbow','Elbow'],['shoulder','Shoulder'],['hip','Hip'],['knee','Knee'],['foot','Foot'],['si','SI Joints'],['c-spine','Cervical Spine'],['t-spine','Thoracic Spine'],['l-spine','Lumbar Spine']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
                <div style={{ flex:1 }}><label style={lbl}>Laterality</label>
                  <select style={inp} value={rheumLaterality} onChange={e => setRheumLaterality(e.target.value)}>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="bilateral">Bilateral</option>
                  </select>
                </div>
                <div style={{ flex:1 }}><label style={lbl}>Views</label>
                  <select style={inp} value={rheumViews} onChange={e => setRheumViews(e.target.value)}>
                    <option value="1">1 view</option>
                    <option value="2">2 views</option>
                    <option value="3">3 views</option>
                    <option value="4">4 views</option>
                    <option value="4+">4+ views</option>
                  </select>
                </div>
              </>) : (<>
                <div style={{ flex:2 }}><label style={lbl}>Body Part</label>
                  <select style={inp} value={selectedBodyPart} onChange={e => { setSelectedBodyPart(e.target.value); resetIncidentals(); resetArthroplasty(); }}>
                    {(isCT ? BODY_PARTS_CT : BODY_PARTS).map(b => {
                      const LABELS = {'femur/thigh':'Femur / Thigh','tibia/fibula':'Tibia / Fibula','humerus':'Humerus','forearm':'Forearm','fingers':'Fingers'};
                      const label = LABELS[b] || (b.charAt(0).toUpperCase()+b.slice(1));
                      return <option key={b} value={b}>{label}</option>;
                    })}
                  </select>
                </div>
                {showSide && <div style={{ flex:1 }}><label style={lbl}>Side</label>
                  <select style={inp} value={side} onChange={e => setSide(e.target.value)}>
                    <option value="left">Left</option><option value="right">Right</option><option value="bilateral">Bilateral</option>
                  </select>
                </div>}
                {selectedBodyPart === 'spine' && <div style={{ flex:1 }}><label style={lbl}>Region</label>
                  <select style={inp} value={spineRegion} onChange={e => setSpineRegion(e.target.value)}>
                    <option value="cervical">Cervical</option><option value="thoracic">Thoracic</option><option value="lumbar">Lumbar</option>
                  </select>
                </div>}
              </>)}
            </div>
            {!isRheum && <div><label style={lbl}>Contrast</label>
              <select style={inp} value={contrast} onChange={e => setContrast(e.target.value)}>
                <option value="without">Without IV contrast</option>
                <option value="with">With IV contrast</option>
                <option value="with and without">With and without IV contrast</option>
              </select>
            </div>}
            {!isRheum && <div style={{ padding:'9px 12px',background:dm?(isCT?'#0c2d36':'#1e1b4b'):(isCT?'linear-gradient(135deg,#ecfeff,#f0f9ff)':'linear-gradient(135deg,#eff6ff,#f0f9ff)'),borderRadius:8,border:dm?'1px solid '+(isCT?'#164e63':'#312e81'):(isCT?'1px solid #a5f3fc':'1px solid #bfdbfe'),fontSize:12,color:isCT?'#22d3ee':'#818cf8',fontStyle:'italic',lineHeight:1.6 }}>
              {technique}
            </div>}
            {isCT && (
              <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'7px 10px',borderRadius:7,border:'1px solid '+(includeDoseOpt?(dm?'#164e63':'#a5f3fc'):(dm?'#334155':'#e2e8f0')),background:includeDoseOpt?(dm?'#0c2d36':'#ecfeff'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
                <input type="checkbox" checked={includeDoseOpt} onChange={e=>setIncludeDoseOpt(e.target.checked)} style={{ width:14,height:14,accentColor:'#0891b2',cursor:'pointer' }}/>
                <span style={{ fontSize:11,fontWeight:600,color:includeDoseOpt?(dm?'#22d3ee':'#0e7490'):(dm?'#64748b':'#64748b') }}>Include dose optimization sentence</span>
              </label>
            )}
            {/* ── Arthroplasty checkbox (CT only, shoulder/hip/knee) ── */}
            {isCT && ARTHROPLASTY_JOINTS.includes(selectedBodyPart) && (
              <div style={{ display:'flex',flexDirection:'column',gap:6 }}>
                <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'7px 10px',borderRadius:7,border:'1px solid '+(arthroplastyEnabled?(dm?'#0891b2':'#a5f3fc'):(dm?'#334155':'#e2e8f0')),background:arthroplastyEnabled?(dm?'#0c2d36':'#ecfeff'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
                  <input type="checkbox" checked={arthroplastyEnabled} onChange={e=>{ setArthroplastyEnabled(e.target.checked); if(!e.target.checked){ setArthroplastyType(''); setArthroplastyChecklist({}); setArthroplastyGrading(''); }}} style={{ width:14,height:14,accentColor:'#0891b2',cursor:'pointer' }}/>
                  <span style={{ fontSize:11,fontWeight:700,color:arthroplastyEnabled?(dm?'#22d3ee':'#0e7490'):(dm?'#64748b':'#64748b'),letterSpacing:'0.02em' }}>🔩 Arthroplasty</span>
                </label>
                {arthroplastyEnabled && ARTHROPLASTY_DATA[selectedBodyPart]?.types.length > 1 && (
                  <div style={{ padding:'8px 10px',background:dm?'rgba(8,145,178,0.1)':'#f0fdfe',border:'1px solid '+(dm?'#164e63':'#a5f3fc'),borderRadius:7,display:'flex',flexDirection:'column',gap:5 }}>
                    <div style={{ fontSize:10,fontWeight:700,color:dm?'#64748b':'#94a3b8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:2 }}>Implant Type</div>
                    {ARTHROPLASTY_DATA[selectedBodyPart].types.map(t => (
                      <label key={t.id} style={{ display:'flex',alignItems:'center',gap:7,cursor:'pointer',fontSize:12,color:arthroplastyType===t.id?(dm?'#22d3ee':'#0891b2'):(dm?'#94a3b8':'#475569'),fontWeight:arthroplastyType===t.id?700:400 }}>
                        <input type="checkbox" checked={arthroplastyType===t.id} onChange={()=>{ setArthroplastyType(arthroplastyType===t.id?'':t.id); setArthroplastyChecklist({}); setArthroplastyGrading(''); }} style={{ width:13,height:13,accentColor:'#0891b2',cursor:'pointer' }}/>
                        {t.label}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* ── Incidental Findings Panel ── */}
            {(showLungWarning || showGUWarning) && (
              <IncidentalPanel
                showLung={showLungWarning}
                showGU={showGUWarning}
                noduleType={noduleType} setNoduleType={setNoduleType}
                noduleSize={noduleSize} setNoduleSize={setNoduleSize}
                renalFinding={renalFinding} setRenalFinding={setRenalFinding}
                gynFinding={gynFinding} setGynFinding={setGynFinding}
                aortaFinding={aortaFinding} setAortaFinding={setAortaFinding}
                patientAge={patientAge} setPatientAge={setPatientAge}
                patientSex={patientSex} setPatientSex={setPatientSex}
                isPostmenopausal={isPostmenopausal}
              />
            )}
            <div style={{ flex:1,display:'flex',flexDirection:'column' }}><label style={lbl}>Findings</label>
              <textarea className="msk-textarea" style={{ ...inp,flex:1,minHeight:160,resize:'vertical',lineHeight:1.7,fontFamily:'inherit',border:isListening?'1.5px solid #ef4444':'1px solid #dde3ed',boxShadow:isListening?'0 0 0 3px rgba(239,68,68,0.1)':'none',transition:'all 0.15s' }}
                value={isRheum ? rheumFreeText : dictationText} onChange={e => { if (isRheum) { setRheumFreeText(e.target.value); } else { setDictationText(e.target.value); finalTranscriptPersistRef.current = e.target.value; } }} placeholder={`Type or dictate ${isRheum?'X-ray':isCT?'CT':'MRI'} findings here…`}
                spellCheck={false} autoCorrect="off" autoCapitalize="off" />
            </div>
            {micError && <div style={{ fontSize:11,color:'#dc2626',background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:7,padding:'7px 10px',lineHeight:1.5 }}>{micError}</div>}
            <button onClick={isListening ? stopListening : toggleListening}
              style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:10,borderRadius:9,border:'1.5px solid '+(isListening?'#fca5a5':(dm?'#334155':'#dde3ed')),background:isListening?'#fef2f2':(dm?'#0f172a':'#f8fafc'),fontSize:14,fontWeight:600,cursor:'pointer',color:isListening?'#dc2626':(dm?'#94a3b8':'#475569'),transition:'all 0.15s' }}>
              <span style={{ width:8,height:8,borderRadius:'50%',background:isListening?'#ef4444':'#94a3b8',boxShadow:isListening?'0 0 8px #ef4444':'none',flexShrink:0,transition:'all 0.3s' }} />
              {isListening ? '⏹ Stop Recording' : '🎤 Start Dictation'}
            </button>
            <label style={{ display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'8px 12px',borderRadius:8,border:'1px solid '+(layPersonSummary?(dm?'#1d4ed8':'#bfdbfe'):(dm?'#334155':'#e2e8f0')),background:layPersonSummary?(dm?'#1e3a5f':'#eff6ff'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
              <input type="checkbox" checked={layPersonSummary} onChange={e=>setLayPersonSummary(e.target.checked)} style={{ width:15,height:15,accentColor:'#2563eb',cursor:'pointer' }}/>
              <span style={{ fontSize:12,fontWeight:600,color:layPersonSummary?(dm?'#93c5fd':'#1d4ed8'):(dm?'#64748b':'#64748b') }}>🧑‍🏫 Add "Understanding Your Results" patient summary</span>
            </label>
            {!isRheum && (
              <div style={{ padding:'8px 12px',borderRadius:8,border:'1px solid '+(massMode!=='auto'?(dm?'#7c2d12':'#fed7aa'):(dm?'#334155':'#e2e8f0')),background:massMode!=='auto'?(dm?'#3b0f02':'#fff7ed'):(dm?'#0f172a':'#f8fafc'),transition:'all 0.15s' }}>
                <div style={{ fontSize:11,fontWeight:600,color:massMode!=='auto'?(dm?'#fb923c':'#c2410c'):(dm?'#64748b':'#94a3b8'),letterSpacing:'0.06em',textTransform:'uppercase',marginBottom:6 }}>🔬 Mass / Tumor Case Type</div>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                  {[
                    { val:'auto', label:'Auto-detect' },
                    { val:'new',  label:'New case' },
                    { val:'followup', label:'Follow-up' },
                    { val:'postresection', label:'Post-resection' },
                  ].map(({ val, label }) => {
                    const active = massMode === val;
                    return (
                      <button key={val} onClick={() => setMassMode(val)}
                        style={{ padding:'4px 10px',borderRadius:6,border:'1px solid '+(active?(dm?'#f97316':'#ea580c'):(dm?'#334155':'#d1d5db')),background:active?(dm?'#7c2d12':'#ffedd5'):'transparent',color:active?(dm?'#fb923c':'#c2410c'):(dm?'#94a3b8':'#6b7280'),fontSize:11,fontWeight:active?700:500,cursor:'pointer',transition:'all 0.12s' }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {(() => {
              const leftHasText = isRheum ? !!rheumFreeText.trim() : !!dictationText.trim();
              const leftDisabled = isGenerating || isGeneratingRheum || !leftHasText;
              const leftBg = leftDisabled ? (dm?'#1e293b':'#e2e8f0') : isRheum ? 'linear-gradient(135deg,#7c2d92,#a855f7)' : isCT ? 'linear-gradient(135deg,#0e7490,#0891b2)' : 'linear-gradient(135deg,#2563eb,#4f46e5)';
              const leftColor = leftDisabled ? (dm?'#475569':'#94a3b8') : 'white';
              const leftShadow = leftDisabled ? 'none' : isRheum ? '0 4px 16px rgba(168,85,247,0.35)' : '0 4px 16px rgba(37,99,235,0.35)';
              const canReset = !!(leftHasText || generatedReport);
              return (
                <div style={{ display:'flex',gap:8 }}>
                  <button onClick={generateReport} disabled={leftDisabled}
                    style={{ flex:2,padding:'10px 12px',borderRadius:9,border:'none',background:leftBg,color:leftColor,fontSize:13,fontWeight:700,cursor:leftDisabled?'not-allowed':'pointer',boxShadow:leftShadow,letterSpacing:'0.02em' }}>
                    {(isGenerating||isGeneratingRheum) ? '⏳ Generating…' : `✨ Generate ${isRheum?'X-Ray':isCT?'CT':'MRI'} Report`}
                  </button>
                  <button onClick={() => {
                    if (isListening) stopListening();
                    stopKeepalive();
                    finalTranscriptPersistRef.current = '';
                    setDictationText('');
                    setRheumFreeText('');
                    setGeneratedReport('');
                  }} disabled={!canReset}
                    title="Clear dictation and report — start next case"
                    style={{ flex:1,padding:'10px 12px',borderRadius:9,border:'1.5px solid '+(canReset?(dm?'#475569':'#cbd5e1'):(dm?'#1e293b':'#e2e8f0')),background:canReset?(dm?'#1e293b':'#f8fafc'):(dm?'#0f172a':'#f1f5f9'),color:canReset?(dm?'#94a3b8':'#64748b'):(dm?'#334155':'#cbd5e1'),fontSize:12,fontWeight:600,cursor:canReset?'pointer':'not-allowed',transition:'all 0.15s',flexShrink:0 }}
                    onMouseEnter={e => { if (canReset) e.currentTarget.style.background = dm?'#dc2626':'#fee2e2'; e.currentTarget.style.color = dm?'#fca5a5':'#dc2626'; e.currentTarget.style.borderColor = dm?'#ef4444':'#fca5a5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = canReset?(dm?'#1e293b':'#f8fafc'):(dm?'#0f172a':'#f1f5f9'); e.currentTarget.style.color = canReset?(dm?'#94a3b8':'#64748b'):(dm?'#334155':'#cbd5e1'); e.currentTarget.style.borderColor = canReset?(dm?'#475569':'#cbd5e1'):(dm?'#1e293b':'#e2e8f0'); }}>
                    Reset Report
                  </button>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Col 2 — Report */}
        <div className={`msk-col${mobileTab===1?' mobile-active':''}`} style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr('linear-gradient(135deg,#5b21b6,#7c3aed)', '📄', 'Generated Report')}
          <div style={{ padding:16,display:'flex',flexDirection:'column',gap:12,flex:1 }}>
            <div className="msk-report-box" style={{ flex:1,padding:'14px 16px',border:'1px solid '+(dm?'#334155':'#e8edf5'),borderRadius:10,overflowY:'auto',minHeight:340,maxHeight:'65vh',background:dm?'#0f172a':(generatedReport?'white':'#f8fafc') }}>
              {isGenerating
                ? <div style={{ display:'flex',flexDirection:'column',gap:10,paddingTop:4 }}>{[55,80,65,90,50,72,60].map((w,i) => <div key={i} style={{ height:9,background:`rgba(37,99,235,${0.06+i*0.02})`,borderRadius:4,width:w+'%' }} />)}</div>
                : generatedReport
                  ? <div style={{ fontFamily:"Georgia,'Times New Roman',serif" }}>{formatReport(generatedReport, dm ? {
                      neg:'#64748b',   // dark mode normals: medium slate — visible but subdued
                      pos:'#fbbf24',   // dark mode positives: amber/yellow — warm, clear, not harsh
                      lbl:'#94a3b8',   // subheading labels
                      body:'#cbd5e1',  // impression body text
                      posW:600,
                      border:'#334155',
                      hdr:'#93c5fd'
                    } : {
                      neg:'#6b7280',   // light mode normals: grey
                      pos:'#dc2626',   // light mode positives: red
                      lbl:'#1e293b',
                      body:'#1e293b',
                      posW:600,
                      border:'#e2e8f0',
                      hdr:'#1e3a5f'
                    })}</div>
                  : <div style={{ color:'#94a3b8',fontStyle:'italic',fontSize:13,textAlign:'center',paddingTop:40,lineHeight:1.8 }}><div style={{ fontSize:32,marginBottom:10 }}>📋</div>Report will appear here after generation.</div>
              }
            </div>
            <CopyButton generatedReport={generatedReport} dm={dm} />
          </div>
        </div>

        {/* Col 3 — Reference */}
        <div className={`msk-col${mobileTab===2?' mobile-active':''}`} style={{ background:dm?'#1e293b':'white',borderRadius:16,overflow:'hidden',boxShadow:'0 4px 24px rgba(0,0,0,0.18)',display:'flex',flexDirection:'column' }}>
          {colHdr(
            arthroplastyEnabled && isCT && ARTHROPLASTY_JOINTS.includes(selectedBodyPart)
              ? 'linear-gradient(135deg,#0e7490,#0891b2)'
              : isRheum ? 'linear-gradient(135deg,#7c2d92,#a855f7)' : isCT ? 'linear-gradient(135deg,#0e7490,#0891b2)' : 'linear-gradient(135deg,#1d4ed8,#4f46e5)',
            arthroplastyEnabled && isCT && ARTHROPLASTY_JOINTS.includes(selectedBodyPart) ? '🔩' : isRheum ? '🩻' : isCT ? '🦴' : '📐',
            arthroplastyEnabled && isCT && ARTHROPLASTY_JOINTS.includes(selectedBodyPart)
              ? `${selectedBodyPart.charAt(0).toUpperCase()+selectedBodyPart.slice(1)} Arthroplasty — CT Review`
              : isRheum ? 'Rheum DDx Builder' : isCT ? 'CT Fracture Classification' : 'MRI Grading Reference'
          )}
          <div className="msk-ref-panel" style={{ padding:16,flex:1,overflowY:'auto' }}>
            <CmeBanner matches={findCmeMatches(generatedReport, cmeModules)} dm={dm} />
            {isRheum
              ? <RheumDDxPanel
                  rheumJoint={rheumJoint}
                  rheumLaterality={rheumLaterality}
                  rheumViews={rheumViews}
                  rheumChecks={rheumChecks}
                  setRheumChecks={setRheumChecks}
                  onGenerate={generateRheumReport}
                  isGenerating={isGeneratingRheum}
                  dm={dm}
                />
              : arthroplastyEnabled && isCT && ARTHROPLASTY_JOINTS.includes(selectedBodyPart) && (arthroplastyType || ARTHROPLASTY_DATA[selectedBodyPart]?.types.length === 1)
                ? <ArthroplastyPanel
                    joint={selectedBodyPart}
                    arthroplastyType={arthroplastyType}
                    arthroplastyChecklist={arthroplastyChecklist}
                    setArthroplastyChecklist={setArthroplastyChecklist}
                    arthroplastyGrading={arthroplastyGrading}
                    setArthroplastyGrading={setArthroplastyGrading}
                    arthroplastyImageTab={arthroplastyImageTab}
                    setArthroplastyImageTab={setArthroplastyImageTab}
                    dm={dm}
                  />
                : arthroplastyEnabled && isCT && ARTHROPLASTY_JOINTS.includes(selectedBodyPart) && !arthroplastyType
                  ? <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%',gap:10,color:dm?'#475569':'#94a3b8',textAlign:'center',padding:24 }}>
                      <div style={{ fontSize:32 }}>🔩</div>
                      <div style={{ fontSize:13,fontWeight:600,color:dm?'#64748b':'#94a3b8' }}>Select an implant type in the left panel to load the complication checklist and grading systems.</div>
                    </div>
                  : <ReferencePanel selectedBodyPart={selectedBodyPart} modality={modality} spineRegion={spineRegion} dm={dm} />
            }
          </div>
        </div>

      </div>

      <style>{`
        .msk-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; padding:16px; box-sizing:border-box; }

        /* ── MOBILE STYLES (≤768px) — desktop completely unaffected ── */
        @media (max-width:768px) {

          /* Grid: single column, no gap */
          .msk-grid { grid-template-columns:1fr !important; gap:0 !important; padding:0 !important; }

          /* Hide all panels by default on mobile; show only active */
          .msk-col { display:none !important; }
          .msk-col.mobile-active { display:flex !important; flex-direction:column; min-height:calc(100vh - 120px); }

          /* Textarea + report box sizing */
          .msk-report-box { min-height:260px !important; max-height:55vh !important; }
          .msk-textarea { min-height:140px !important; font-size:16px !important; }
          .msk-ref-panel { max-height:none !important; overflow-y:visible !important; }

          /* Header: compact single row */
          .msk-header { padding:10px 14px !important; gap:8px !important; flex-wrap:nowrap !important; }
          .msk-header-logo span[style] { font-size:17px !important; }
          .msk-header-center { display:none !important; }
          .msk-header-right { margin-left:auto; }

          /* Hamburger menu (mobile only) */
          .msk-hamburger { display:flex !important; }

          /* Mobile nav drawer */
          .msk-drawer { display:flex !important; }

          /* Mobile tab bar */
          .msk-tab-bar { display:flex !important; }

          /* Touch-friendly select/input sizing */
          select, input[type="text"], input[type="email"], input[type="password"] {
            font-size:16px !important;
            min-height:42px !important;
          }

          /* Larger tap targets for buttons */
          .msk-col button { min-height:44px !important; }
        }

        /* Desktop: hide mobile-only elements */
        .msk-hamburger { display:none; }
        .msk-drawer { display:none; }
        .msk-tab-bar { display:none; }
      `}</style>
    </div>
  );
}
