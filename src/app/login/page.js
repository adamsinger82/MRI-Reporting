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
import { JOINT_DATA } from './referenceData';
import CopyButton from './CopyButton';

// ─── EXTRACTED DATA IMPORTS ───────────────────────────────────────────────────
import { MRI_GRADING_DATA, CT_GRADING_DATA } from '../data/gradingData';
import {
  BODY_PARTS, BODY_PARTS_CT, BILATERAL,
  ABSENT_STRUCTURES, ANATOMY_MRI, ANATOMY_CT, ANATOMY,
  getAnatomy, getEffectiveJointData, buildGradingContext,
  buildReportHeading, buildPrompt, formatReport, isAbsentStructure
} from '../data/promptBuilders';
import { PELVIS_LABELS, SHOULDER_LABELS, ELBOW_LABELS } from '../data/atlasLabels';
import { ATLAS_JOINTS, ATLAS_REGIONS_MAP, VHP_BASE, localSlices } from '../data/atlasData';
import { ARTHROPLASTY_DATA, ARTHROPLASTY_JOINTS, ArthroplastyPanel } from '../data/arthroplastyData';
import { RHEUM_JOINTS, buildRheumPrompt, RheumDDxPanel } from '../data/rheumData';

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
              ) : selectedMeasurement.diagram ? (
              <img
                src={selectedMeasurement.diagram}
                alt={selectedMeasurement.id}
                style={{ width:'100%', borderRadius:6, display:'block' }}
              />
            ) : (
              <div style={{ padding:24,textAlign:'center',color:'#94a3b8',fontSize:12 }}>Diagram coming soon</div>
            )}
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

  // isListeningRef mirrors isListening state so async STT callbacks can read current intent
  const isListeningRef = useRef(false);

  const toggleListening = () => {
    if (isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsListening(false);
      return;
    }
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported. Please use Chrome or Edge.'); return; }
    setMicError('');
    finalTranscriptPersistRef.current = ''; // reset transcript on fresh dictation start
    isListeningRef.current = true;
    setIsListening(true);

    const startRecognition = () => {
      if (!isListeningRef.current) return; // user stopped while restart was pending
      const SR2 = window.webkitSpeechRecognition || window.SpeechRecognition;
      try {
        const recognition = new SR2();
        recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'en-US'; recognition.maxAlternatives = 1;
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
          // Fatal errors — stop and inform user
          if (event.error === 'not-allowed') {
            isListeningRef.current = false;
            recognitionRef.current = null;
            setMicError('Microphone access denied. Click the lock icon in your address bar.');
            setIsListening(false);
          }
          // no-speech, network, audio-capture: non-fatal — onend fires next and restarts
        };
        recognition.onend = () => {
          // Only restart if user hasn't pressed Stop and this is still the active instance
          if (isListeningRef.current && recognitionRef.current === recognition) {
            recognitionRef.current = null;
            setTimeout(startRecognition, 150); // brief pause avoids browser throttling
          }
        };
        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        isListeningRef.current = false;
        recognitionRef.current = null;
        setIsListening(false);
        setMicError('Could not start microphone: ' + err.message);
      }
    };

    startRecognition();
  };

  const stopListening = () => {
    isListeningRef.current = false;
    const rec = recognitionRef.current;
    recognitionRef.current = null;
    try { rec?.stop(); } catch {}
    setIsListening(false);
  };
  useEffect(() => () => { isListeningRef.current = false; recognitionRef.current?.stop(); }, []);

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
