// mskDictionaryData.js — LucidMSK Dictation Dictionary (weighted MSK lexicon)
// Per architecture rule: data objects live in their own file. Named exports only.
// Consumed by mskDictionaryUtils.js; page.js only imports the builder.
//
// RECONCILIATION NOTE (2026-08-21): This is the authentic file from the
// original design session (uploaded by Adam after a prior session's rebuild
// attempt had to reseed the term list from scratch). It has been restored as
// the canonical version and merged with a handful of additions from that
// rebuild:
//   - Baastrup entry: renamed to "Baastrup's disease" and merged with the
//     "bass drops disease" family of heard-forms (these match an existing
//     standing correction rule already hardcoded in page.js's buildPrompt()).
//   - supraspinatus / infraspinatus: boost raised 9->10 and "supraspinous" /
//     "infraspinous" added to heard[], since page.js already treats these as
//     unambiguous shoulder-context garbles.
//   - 16 new entries appended across shoulder/knee/hip/foot/wrist/elbow scopes
//     (genu valgum/varum, tibial plateau, chondral flap, quadriceps tendon,
//     subcoracoid, biceps pulley, sublabral foramen, trochanteric bursitis,
//     os acetabuli, syndesmosis, talar dome, spring ligament, Guyon canal,
//     pisotriquetral, annular ligament) that were present in the rebuild but
//     absent here.
// Total: 172 entries (156 original + 16 merged), plus MSK_DICTIONARY_WATCHLIST.
//
// ─────────────────────────────────────────────────────────────────────────────
// BOOST SCALE (1–10) — how hard the engine should push toward this term
// ─────────────────────────────────────────────────────────────────────────────
//  10  LOCK       Term has no plausible English homophone in a radiology report.
//                 Deterministic find/replace runs BEFORE the LLM sees the text.
//                 Reserved for eponyms + orphan anatomy (Schmorl, Modic, Lisfranc).
//   9  NEAR-LOCK  Snap unless a competing MSK term fits the sentence better.
//   7–8 STRONG    Prefer this term whenever the scope context matches.
//   5–6 MODERATE  Correct when the transcript is clearly wrong; leave plausible
//                 English alone.
//   3–4 NUDGE     Only correct if the surrounding words are obvious nonsense.
//   1–2 WATCH     Log-only. Nothing is corrected. Use this while you decide
//                 whether a term earns promotion. Track these in
//                 MSK_DICTIONARY_WORKLIST.md.
//
// FIELDS
//   term   — the correct output spelling. This is what lands in the report.
//   boost  — 1–10, see scale above.
//   scope  — 'global' | 'spine' | 'shoulder' | 'knee' | 'hip' | 'foot' |
//            'wrist' | 'elbow'. Scoped entries only load for that body part,
//            which keeps the prompt small and prevents cross-joint false hits.
//   heard  — array of garbled forms actually produced by the speech engine.
//            Add to this list every time you catch a new mangle.
//   auto   — optional. false = never run deterministic replace, prompt-only.
//            Set this when a garbled form is also a legitimate English phrase
//            ("small node", "second", "tofu") and a blind swap would be unsafe.
//   note   — optional. Free text for you; never sent to the model.

export const BOOST_MAX = 10;

export const MSK_DICTIONARY = [
  // ───────────────────────── GLOBAL — pathology & tissue ─────────────────────
  { term: 'osteoarthrosis', boost: 7, scope: 'global', heard: ['osteo arthrosis', 'osteo arthrosis', 'austere arthrosis'] },
  { term: 'enthesopathy', boost: 9, scope: 'global', heard: ['in the sopathy', 'and the soft they', 'enthesis pathy', 'anthesopathy'] },
  { term: 'tenosynovitis', boost: 9, scope: 'global', heard: ['teno synovitis', 'ten o synovitis', 'tendo synovitis'] },
  { term: 'tendinosis', boost: 8, scope: 'global', heard: ['tendonosis', 'tendinoses', 'ten dinosis'], note: 'Distinct from tendinitis — do not merge.' },
  { term: 'subchondral', boost: 9, scope: 'global', heard: ['sub chondral', 'sub condral', 'subcontrol', 'sub cantrell'] },
  { term: 'marrow edema', boost: 8, scope: 'global', heard: ['marrow adema', 'marrow a dema', 'narrow edema'] },
  { term: 'periostitis', boost: 8, scope: 'global', heard: ['perry ostitis', 'periosteitis'] },
  { term: 'sequestrum', boost: 10, scope: 'global', heard: ['sequest rum', 'see quest rum'] },
  { term: 'involucrum', boost: 10, scope: 'global', heard: ['in volucrum', 'involuchrum'] },
  { term: 'osteomyelitis', boost: 9, scope: 'global', heard: ['osteo myelitis', 'osteo my litis'] },
  { term: 'osteonecrosis', boost: 8, scope: 'global', heard: ['osteo necrosis'] },
  { term: 'nonossifying fibroma', boost: 9, scope: 'global', heard: ['non ossifying fibroma', 'non aussie fying fibroma'] },
  { term: 'osteoid osteoma', boost: 9, scope: 'global', heard: ['osteo id osteoma', 'austered osteoma'] },
  { term: 'chondroblastoma', boost: 9, scope: 'global', heard: ['chondro blastoma', 'condra blastoma'] },
  { term: 'enchondroma', boost: 10, scope: 'global', heard: ['in chondroma', 'and chondroma', 'encondroma'] },
  { term: 'osteochondroma', boost: 9, scope: 'global', heard: ['osteo chondroma'] },
  { term: 'Ewing sarcoma', boost: 10, scope: 'global', heard: ['ewings sarcoma', 'you wing sarcoma', 'yuing sarcoma'] },
  { term: 'myxoid', boost: 9, scope: 'global', heard: ['mixoid', 'mix oid', 'my void'] },
  { term: 'lipoma arborescens', boost: 10, scope: 'global', heard: ['lipoma arborescence', 'lipoma arbor essence'] },
  { term: 'tenosynovial giant cell tumor', boost: 9, scope: 'global', heard: ['teno synovial giant cell tumor'], note: 'Modern name for PVNS.' },
  { term: 'synovial chondromatosis', boost: 9, scope: 'global', heard: ['synovial chondro matosis'] },
  { term: 'tophus', boost: 8, scope: 'global', heard: ['toe fuss', 'tofu', 'top us'], auto: false, note: '"tofu" is real English — prompt-only.' },
  { term: 'chondrocalcinosis', boost: 9, scope: 'global', heard: ['chondro calcinosis', 'condra calcinosis'] },
  { term: 'hydroxyapatite', boost: 9, scope: 'global', heard: ['hydroxy appetite', 'hydroxy apatite', 'hydroxide appetite'] },
  { term: 'Brodie abscess', boost: 10, scope: 'global', heard: ['brody abscess', 'broadie abscess'] },
  { term: 'Looser zone', boost: 10, scope: 'global', heard: ['loser zone', 'losers zone', 'looser\u2019s zone'] },
  { term: 'fibrous dysplasia', boost: 8, scope: 'global', heard: ['fibris dysplasia', 'fibrous displasia'] },
  { term: 'physeal', boost: 10, scope: 'global', heard: ['fecal', 'fiseal', 'fizzle', 'fizzy all'], auto: false, note: 'HIGH RISK garble — "fecal". Prompt-only so thecal sac is not clobbered.' },
  { term: 'apophysis', boost: 9, scope: 'global', heard: ['a pophysis', 'apoph is is'] },
  { term: 'metaphysis', boost: 8, scope: 'global', heard: ['meta physis', 'metaphasis'] },
  { term: 'diaphysis', boost: 8, scope: 'global', heard: ['dia physis', 'diaphasis'] },
  { term: 'Salter-Harris', boost: 10, scope: 'global', heard: ['salter harris', 'salt her harris', 'psalter harris'] },
  { term: 'sacroiliitis', boost: 9, scope: 'global', heard: ['sacro ilitis', 'sacro iliitis', 'sacral ilitis'] },
  { term: 'syndesmophyte', boost: 10, scope: 'global', heard: ['syndesmo fight', 'sin desmo fight', 'syndesma fight'] },
  { term: 'ankylosing spondylitis', boost: 9, scope: 'global', heard: ['ankle losing spondylitis', 'anky losing spondylitis'] },
  { term: 'diffuse idiopathic skeletal hyperostosis', boost: 8, scope: 'global', heard: ['dish', 'd i s h'], auto: false, note: 'Only expand when clearly spine/enthesis context.' },
  { term: 'fat-saturated', boost: 7, scope: 'global', heard: ['fat sat', 'fat saturated', 'fats at'] },
  { term: 'STIR', boost: 7, scope: 'global', heard: ['stir', 'stur', 'sturr'], auto: false },
  { term: 'proton density', boost: 7, scope: 'global', heard: ['photon density', 'protein density'] },
  { term: 'craniocaudal', boost: 7, scope: 'global', heard: ['cranio caudal', 'crane io caudal'] },
  { term: 'anteroposterior', boost: 7, scope: 'global', heard: ['antero posterior', 'anterior posterior'] },

  // ───────────────────────────────── SPINE ───────────────────────────────────
  { term: 'foraminal', boost: 10, scope: 'spine', heard: ['animal', 'animals', 'for a minal', 'ferrymen', 'formal'], auto: false, note: '"animal" is real English — prompt-only, but boost stays 10.' },
  { term: 'neuroforaminal', boost: 10, scope: 'spine', heard: ['neuro animal', 'neuro formal', 'euro foraminal'] },
  { term: 'ligamentum flavum', boost: 10, scope: 'spine', heard: ['ligamentum flavor', 'ligament um flavor', 'ligamentum flavia'] },
  { term: 'thecal sac', boost: 10, scope: 'spine', heard: ['vehicle sack', 'fecal sac', 'thecal sack', 'the cal sac', 'the kell sac'] },
  { term: 'conus medullaris', boost: 10, scope: 'spine', heard: ['cone us medullaris', 'konus medullaris', 'ernest terminates', 'earnest terminates'] },
  { term: 'cauda equina', boost: 10, scope: 'spine', heard: ['cauda equine a', 'coda equina', 'kotta akina', 'kata equina'] },
  { term: 'pars interarticularis', boost: 10, scope: 'spine', heard: ['pars inter articular is', 'parse inter articularis', 'pars interarticular is'] },
  { term: 'spondylolisthesis', boost: 9, scope: 'spine', heard: ['spondylo listhesis', 'spawn dilo listhesis', 'spondylolysthesis'] },
  { term: 'spondylolysis', boost: 9, scope: 'spine', heard: ['spondylo lysis', 'spawn dilo lysis'] },
  { term: 'retrolisthesis', boost: 9, scope: 'spine', heard: ['retro listhesis', 'retro lis thesis'] },
  { term: 'anterolisthesis', boost: 9, scope: 'spine', heard: ['antero listhesis', 'anterior listhesis'] },
  { term: 'Schmorl node', boost: 10, scope: 'spine', heard: ["tomorrow's node", 'schmoral node', 'shmoral node', 'smore node', 'small node'], auto: false, note: '"small node" collides with lymph node — prompt-only.' },
  { term: 'Modic change', boost: 10, scope: 'spine', heard: ['motor can play change', 'motor can change', 'modic can change', 'modick change'] },
  { term: 'uncovertebral', boost: 10, scope: 'spine', heard: ['unco vertebral', 'uncle vertebral', 'unk over tebral'] },
  { term: 'annular fissure', boost: 9, scope: 'spine', heard: ['angular fissure', 'annular fisher', 'a nuclear fissure'] },
  { term: 'subarticular recess', boost: 9, scope: 'spine', heard: ['sub articular recess', 'sub particular recess'] },
  { term: 'facet arthropathy', boost: 8, scope: 'spine', heard: ['facet arthur pathy', 'faucet arthropathy', 'facet arthro pathy'] },
  { term: "Baastrup's disease", boost: 10, scope: 'spine', heard: ['bass trup', 'bay strup', 'bahstrup', 'bass drops disease', "bass drop's disease", "bastrop's disease", 'bastrops disease', 'the bass drops disease'], note: 'Anatomically distinct from Schmorl node (kissing spinous processes / interspinous bursitis vs. disc/endplate herniation) — never conflate. See also the Schmorl node entry above.' },
  { term: 'syringomyelia', boost: 10, scope: 'spine', heard: ['syringo myelia', 'sarin go myelia'] },
  { term: 'syrinx', boost: 9, scope: 'spine', heard: ['sirens', 'sarin x', 'cyrenks'], auto: false },
  { term: 'filum terminale', boost: 10, scope: 'spine', heard: ['file um terminal', 'filum terminal', 'philim terminale'] },
  { term: 'Tarlov cyst', boost: 10, scope: 'spine', heard: ['tar love cyst', 'tarloff cyst', 'car love cyst'] },
  { term: 'dural ectasia', boost: 9, scope: 'spine', heard: ['dural ectasy', 'dural ect asia', 'neural ectasia'] },
  { term: 'Meyerding', boost: 10, scope: 'spine', heard: ['my herding', 'meyer ding', 'mire ding'] },
  { term: 'canal or foraminal', boost: 9, scope: 'spine', heard: ['no can hour for', 'canal or formal', 'can our foraminal'] },

  // ──────────────────────────────── SHOULDER ─────────────────────────────────
  { term: 'supraspinatus', boost: 10, scope: 'shoulder', heard: ['super spinatus', 'supra spin at us', 'supra spinatis', 'supraspinous'], note: 'Boosted to 10 — "supraspinous" is unambiguous in a shoulder-exam context (matches the standing correction already hardcoded in buildPrompt()).' },
  { term: 'infraspinatus', boost: 10, scope: 'shoulder', heard: ['infra spin at us', 'infra spinatis', 'infraspinous'], note: 'Boosted to 10 — "infraspinous" is unambiguous in a shoulder-exam context (matches the standing correction already hardcoded in buildPrompt()).' },
  { term: 'subscapularis', boost: 9, scope: 'shoulder', heard: ['sub scapular is', 'sub scapularus'] },
  { term: 'teres minor', boost: 8, scope: 'shoulder', heard: ['tears minor', 'terrace minor', 'terrace miner'] },
  { term: 'glenohumeral', boost: 9, scope: 'shoulder', heard: ['glen o humoral', 'glenn humeral', 'gleno humoral'] },
  { term: 'acromioclavicular', boost: 9, scope: 'shoulder', heard: ['a chromio clavicular', 'acromio clavicular', 'chromo clavicular'] },
  { term: 'coracoacromial', boost: 10, scope: 'shoulder', heard: ['chorico chromial', 'core aco chromial', 'coraco chromial'] },
  { term: 'spinoglenoid notch', boost: 10, scope: 'shoulder', heard: ['spino glenoid notch', 'spine o glenoid notch'] },
  { term: 'suprascapular', boost: 9, scope: 'shoulder', heard: ['super scapular', 'supra scapula'] },
  { term: 'quadrilateral space', boost: 8, scope: 'shoulder', heard: ['quadra lateral space', 'quad lateral space'] },
  { term: 'Hill-Sachs', boost: 10, scope: 'shoulder', heard: ['hill sacks', 'hills sacks', 'hill sax', 'hill sacs', 'hills axe'] },
  { term: 'Bankart', boost: 10, scope: 'shoulder', heard: ['bank art', 'bancart', 'ban cart', 'bank heart'] },
  { term: 'HAGL lesion', boost: 10, scope: 'shoulder', heard: ['haggle lesion', 'hag l lesion', 'hagel lesion'] },
  { term: 'ALPSA lesion', boost: 10, scope: 'shoulder', heard: ['alpsa lesion', 'al pssa lesion', 'alpha sa lesion'] },
  { term: 'Perthes lesion', boost: 10, scope: 'shoulder', heard: ['purpose lesion', 'perth is lesion'] },
  { term: 'GLAD lesion', boost: 9, scope: 'shoulder', heard: ['glad lesion', 'g lad lesion'], auto: false },
  { term: 'Buford complex', boost: 10, scope: 'shoulder', heard: ['bufford complex', 'buffered complex', 'buffalo complex'] },
  { term: 'sublabral recess', boost: 9, scope: 'shoulder', heard: ['sub labral recess', 'sub labral recess'] },
  { term: 'SLAP tear', boost: 8, scope: 'shoulder', heard: ['s l a p tear', 'slapped ear'], auto: false },
  { term: 'os acromiale', boost: 10, scope: 'shoulder', heard: ['os acromial', 'oz acromiale', 'as acromiale'] },
  { term: 'Bennett lesion', boost: 9, scope: 'shoulder', heard: ['bennet lesion', 'bennett legion'] },
  { term: 'subcoracoid', boost: 7, scope: 'shoulder', heard: ['sub core acoid', 'sub chorico id'] },
  { term: 'biceps pulley', boost: 6, scope: 'shoulder', heard: ['biceps pulling', 'bicep pulley'] },
  { term: 'sublabral foramen', boost: 8, scope: 'shoulder', heard: ['sub labral for a man', 'sub labral foreman'], auto: false, note: '"for a man" is ordinary English on its own — prompt-only. Distinct from sublabral recess above; only correct when the dictation is describing a discrete anterosuperior labral gap, not a recess.' },

  // ────────────────────────────────── KNEE ───────────────────────────────────
  { term: 'medial trochlear facet', boost: 10, scope: 'knee', heard: ['medical truck layer for set', 'medial trochlear for set', 'medial truck layer facet'] },
  { term: 'lateral trochlear facet', boost: 10, scope: 'knee', heard: ['lateral truck layer for set', 'lateral trochlear for set', 'lateral truck layer facet'] },
  { term: 'trochlear groove', boost: 9, scope: 'knee', heard: ['truck layer groove', 'trochlea groove'] },
  { term: 'modified Outerbridge', boost: 10, scope: 'knee', heard: ['modified outer bridge', 'modified otter bridge', 'modified out of bridge'] },
  { term: 'meniscocapsular', boost: 10, scope: 'knee', heard: ['meniscal capsular', 'meniscus capsular', 'menisco capsular'] },
  { term: 'meniscal root', boost: 8, scope: 'knee', heard: ['meniscal route', 'meniscus root'] },
  { term: 'ramp lesion', boost: 8, scope: 'knee', heard: ['ram lesion', 'ramp legion'] },
  { term: 'discoid meniscus', boost: 9, scope: 'knee', heard: ['disco meniscus', 'disc oid meniscus', 'discord meniscus'] },
  { term: 'popliteus', boost: 8, scope: 'knee', heard: ['pop lightest', 'populous', 'pop liteus'], auto: false, note: 'Do not collapse with popliteal — different structure.' },
  { term: 'pes anserine', boost: 10, scope: 'knee', heard: ['pez answering', 'pace anserine', 'pest anserine', 'pes answering'] },
  { term: 'Hoffa fat pad', boost: 10, scope: 'knee', heard: ['hoffas fat pad', 'hopper fat pad', 'hoffa\u2019s fat pad'] },
  { term: 'infrapatellar', boost: 9, scope: 'knee', heard: ['infra patellar', 'infra patella'] },
  { term: 'plica', boost: 9, scope: 'knee', heard: ['plika', 'pleka', 'plicka', 'police uh'] },
  { term: 'Blumensaat line', boost: 10, scope: 'knee', heard: ['bloomin sat line', 'blumen sought line', 'blue men sat line'] },
  { term: 'Segond fracture', boost: 10, scope: 'knee', heard: ['se gone fracture', 'second fracture', 'seg on fracture'], auto: false, note: '"second fracture" is real English — prompt-only.' },
  { term: 'Wrisberg ligament', boost: 10, scope: 'knee', heard: ['rizberg ligament', 'whiz berg ligament', 'risberg ligament'] },
  { term: 'Humphrey ligament', boost: 9, scope: 'knee', heard: ['humphry ligament', 'humphries ligament'] },
  { term: 'Gerdy tubercle', boost: 10, scope: 'knee', heard: ['gerty tubercle', 'gurdy tubercle', 'jerky tubercle'] },
  { term: 'arcuate', boost: 8, scope: 'knee', heard: ['arc you it', 'arcuit', 'arc wait'] },
  { term: 'fabella', boost: 10, scope: 'knee', heard: ['fabula', 'fa bella', 'fablla'] },
  { term: 'Pellegrini-Stieda', boost: 10, scope: 'knee', heard: ['pilgrim east eda', 'pellegrino steed a', 'pellegrini steeda'] },
  { term: 'Osgood-Schlatter', boost: 10, scope: 'knee', heard: ['as good schlatter', 'osgood slaughter', 'os good schlatter'] },
  { term: 'Sinding-Larsen-Johansson', boost: 10, scope: 'knee', heard: ['sinding larson johansson', 'sending larsen johansson'] },
  { term: 'Baker cyst', boost: 8, scope: 'knee', heard: ['bakers cyst', 'baker\u2019s cyst', 'bacher cyst'] },
  { term: 'genu valgum', boost: 8, scope: 'knee', heard: ['gen you val gum', 'genu val gum'] },
  { term: 'genu varum', boost: 8, scope: 'knee', heard: ['gen you var um', 'genu var um'] },
  { term: 'tibial plateau', boost: 7, scope: 'knee', heard: ['tibial plato', 'tibial platoh'] },
  { term: 'chondral flap', boost: 6, scope: 'knee', heard: ['condral flap', 'chondral flat'] },
  { term: 'quadriceps tendon', boost: 6, scope: 'knee', heard: ['quad riceps tendon'] },

  // ─────────────────────────────────── HIP ───────────────────────────────────
  { term: 'acetabular labrum', boost: 9, scope: 'hip', heard: ['acetabular labrium', 'acetabula labrum'] },
  { term: 'femoroacetabular impingement', boost: 9, scope: 'hip', heard: ['femoro acetabular impingement', 'femur acetabular impingement'] },
  { term: 'cam morphology', boost: 8, scope: 'hip', heard: ['camp morphology', 'calm morphology'] },
  { term: 'pincer morphology', boost: 8, scope: 'hip', heard: ['pinscher morphology', 'pincher morphology'] },
  { term: 'ischiofemoral', boost: 10, scope: 'hip', heard: ['ischio femoral', 'iskio femoral', 'issue femoral'] },
  { term: 'iliopsoas', boost: 10, scope: 'hip', heard: ['ilio psoas', 'ilio so as', 'illegal psoas', 'ileo soas'] },
  { term: 'gluteus medius', boost: 8, scope: 'hip', heard: ['glutes medius', 'gluteus median'] },
  { term: 'gluteus minimus', boost: 8, scope: 'hip', heard: ['glutes minimus', 'gluteus minimum'] },
  { term: 'fovea capitis', boost: 10, scope: 'hip', heard: ['fovia capitis', 'phobia capitis'] },
  { term: 'Legg-Calvé-Perthes', boost: 10, scope: 'hip', heard: ['leg calve perthes', 'leg calf purpose', 'legg calve purpose'] },
  { term: 'transient osteoporosis', boost: 8, scope: 'hip', heard: ['transient osteo porosis'] },
  { term: 'trochanteric bursitis', boost: 8, scope: 'hip', heard: ['tro can teric bursitis', 'trow can teric bursitis'] },
  { term: 'os acetabuli', boost: 7, scope: 'hip', heard: ['aw a set tabuli', 'os a set tabuli'] },

  // ────────────────────────────── FOOT / ANKLE ───────────────────────────────
  { term: 'Lisfranc', boost: 10, scope: 'foot', heard: ['lis frank', 'list frank', 'list franc', 'lease frank'] },
  { term: 'Chopart', boost: 10, scope: 'foot', heard: ['show part', 'chop art', 'shop art'] },
  { term: 'talocalcaneal', boost: 10, scope: 'foot', heard: ['talo calcaneal', 'tallow calcaneal'] },
  { term: 'calcaneonavicular', boost: 10, scope: 'foot', heard: ['calcaneo navicular', 'calcaneum navicular'] },
  { term: 'sinus tarsi', boost: 10, scope: 'foot', heard: ['sinus tarsy', 'sinus tarsal', 'sinus tarzi'] },
  { term: 'peroneus brevis', boost: 9, scope: 'foot', heard: ['peroneus brevis', 'peroneal brevis', 'pero nius brevis'] },
  { term: 'peroneus longus', boost: 9, scope: 'foot', heard: ['peroneal longus', 'pero nius longus'] },
  { term: 'os trigonum', boost: 10, scope: 'foot', heard: ['oz trigonum', 'os trigone um', 'as trigonum'] },
  { term: 'flexor hallucis longus', boost: 10, scope: 'foot', heard: ['flexor hallucinations longus', 'flexor halluces longus', 'flexor hallucis longis'] },
  { term: 'plantar fascia', boost: 9, scope: 'foot', heard: ['plantar fashion', 'planter fascia', 'plantar facia'] },
  { term: 'Achilles', boost: 8, scope: 'foot', heard: ['a keys', 'a killies', 'achillies'] },
  { term: 'Kager fat pad', boost: 10, scope: 'foot', heard: ['cager fat pad', 'kegger fat pad', 'cougar fat pad'] },
  { term: 'Haglund', boost: 10, scope: 'foot', heard: ['hey glunn', 'hog lund', 'hag land', 'haglan'] },
  { term: 'Morton neuroma', boost: 9, scope: 'foot', heard: ['mortons neuroma', 'morton\u2019s neuroma', 'martin neuroma'] },
  { term: 'Freiberg infraction', boost: 10, scope: 'foot', heard: ['fryberg infraction', 'freiburg infraction', 'fry berg infraction'] },
  { term: 'accessory navicular', boost: 9, scope: 'foot', heard: ['accessory navicula', 'accessory nav icular'] },
  { term: 'Jones fracture', boost: 8, scope: 'foot', heard: ['jones fracture', 'joan fracture'], auto: false },
  { term: 'syndesmosis', boost: 8, scope: 'foot', heard: ['cinder mosis', 'syn dez mosis', 'cinder dez mosis'] },
  { term: 'talar dome', boost: 7, scope: 'foot', heard: ['tailor dome'] },
  { term: 'spring ligament', boost: 6, scope: 'foot', heard: ['string ligament'], auto: false, note: '"string" is ordinary English — only correct in a subtalar/spring-tibialis-posterior support-complex context.' },

  // ────────────────────────────── WRIST / HAND ───────────────────────────────
  { term: 'scapholunate', boost: 10, scope: 'wrist', heard: ['scaffold lunate', 'scapho lunate', 'scalp lunate', 'scapula lunate'] },
  { term: 'lunotriquetral', boost: 10, scope: 'wrist', heard: ['luno tri quetral', 'lunar triquetral', 'luna triquetral'] },
  { term: 'triangular fibrocartilage complex', boost: 9, scope: 'wrist', heard: ['t f c c', 'tfcc', 'triangular fibro cartilage complex'], auto: false },
  { term: 'hook of the hamate', boost: 9, scope: 'wrist', heard: ['hook of the hey mate', 'hook of the hamate', 'hook of the hemate'] },
  { term: 'Stener lesion', boost: 10, scope: 'wrist', heard: ['steiner lesion', 'stenner lesion', 'steamer lesion'] },
  { term: 'Dupuytren', boost: 10, scope: 'wrist', heard: ['dupatran', 'do pit trans', 'dupuytrens', 'du pui tren'] },
  { term: 'de Quervain', boost: 10, scope: 'wrist', heard: ['de kirvan', 'decorating', 'dick or vain', 'the quervain'] },
  { term: 'extensor carpi ulnaris', boost: 9, scope: 'wrist', heard: ['extensor carpi ulnar is', 'extensor carpe ulnaris'] },
  { term: 'Kienböck', boost: 10, scope: 'wrist', heard: ['keen bock', 'kean bach', 'keinbock', 'kienbock'] },
  { term: 'Preiser', boost: 10, scope: 'wrist', heard: ['pricer', 'praiser', 'pryzer'] },
  { term: 'Madelung', boost: 10, scope: 'wrist', heard: ['maddie lung', 'madalung', 'model lung'] },
  { term: 'Guyon canal', boost: 7, scope: 'wrist', heard: ['guy on canal', 'gy on canal'] },
  { term: 'pisotriquetral', boost: 7, scope: 'wrist', heard: ['piso try quetral', 'piso tri quetral'] },

  // ───────────────────────────────── ELBOW ───────────────────────────────────
  { term: 'radiocapitellar', boost: 10, scope: 'elbow', heard: ['radio capitellar', 'radio capital lar', 'radio capitular'] },
  { term: 'olecranon', boost: 9, scope: 'elbow', heard: ['ole cranon', 'oh crayon', 'olecranin'] },
  { term: 'ulnar collateral ligament', boost: 8, scope: 'elbow', heard: ['ulna collateral ligament', 'ulnar colateral ligament'] },
  { term: 'common extensor tendon', boost: 7, scope: 'elbow', heard: ['common extender tendon'] },
  { term: 'cubital tunnel', boost: 8, scope: 'elbow', heard: ['cubicle tunnel', 'cubital tunnel', 'cupital tunnel'] },
  { term: 'Panner disease', boost: 10, scope: 'elbow', heard: ['panter disease', 'pandora disease', 'panner\u2019s disease'] },
  { term: 'annular ligament', boost: 7, scope: 'elbow', heard: ['an you lar ligament', 'annular ligaments'] },
];

// Terms you are still evaluating. Boost 1–2 only — nothing here is corrected.
// Promote into MSK_DICTIONARY above once you have caught a real garble for it.
export const MSK_DICTIONARY_WATCHLIST = [
  { term: 'Bosniak', boost: 2, scope: 'global', heard: [], note: 'Incidental renal cysts on hip/spine MR.' },
  { term: 'Kohler disease', boost: 2, scope: 'foot', heard: [] },
  { term: 'Maffucci syndrome', boost: 2, scope: 'global', heard: [] },
  { term: 'Milwaukee shoulder', boost: 2, scope: 'shoulder', heard: [] },
];
