'use client';

// ─── RHEUMATOLOGY DDX DATA ───────────────────────────────────────────────────
// Extracted from page.js. Used by RheumDDxPanel.

const RHEUM_JOINTS = {
  hand: {
    label: 'Hand',
    categories: [
      {
        label: 'Findings',
        findings: [
          // Distribution
          { id:'h_dip', label:'DIP joint involvement', diags:['OA','EOA','PsA','Gout'] },
          { id:'h_pip', label:'PIP joint involvement', diags:['OA','EOA','RA','PsA','JIA','Gout'] },
          { id:'h_mcp', label:'MCP joint involvement', diags:['RA','CPPD','Hem','JIA','Gout','SLE'] },
          { id:'h_cmc', label:'1st CMC (thumb base) involvement', diags:['OA','EOA'] },
          { id:'h_carpal', label:'Carpal involvement', diags:['RA','CPPD','JIA','Gout'] },
          { id:'h_asymmetric', label:'Asymmetric distribution', diags:['PsA','Gout','OA'] },
          { id:'h_symmetric', label:'Symmetric distribution', diags:['RA','SLE','EOA'] },
          // Erosions
          { id:'h_no_erosion', label:'Osteophytes without erosions', diags:['OA'] },
          { id:'h_marginal_erosion', label:'Marginal erosions (bare area)', diags:['RA','PsA','ReA','JIA','Gout'] },
          { id:'h_pencil_cup', label:'Pencil-in-cup erosion', diags:['PsA','ReA'] },
          { id:'h_gullwing', label:'Gull-wing erosion at DIP', diags:['EOA'] },
          { id:'h_overhanging', label:'Overhanging margin erosion', diags:['Gout'] },
          { id:'h_central_erosion', label:'Central erosion with marginal osteophytes', diags:['EOA'] },
          { id:'h_radial_mch', label:'Erosions radial 2nd–3rd metacarpal heads', diags:['RA'] },
          { id:'h_hook_osteo', label:'Hook-like/drooping osteophytes at MCP heads', diags:['CPPD','Hem'] },
          // Bone density & new bone
          { id:'h_periosteal', label:'Fluffy periostitis / periosteal reaction', diags:['PsA','ReA'] },
          { id:'h_periarticular_op', label:'Periarticular osteopenia', diags:['RA','JIA','SLE'] },
          { id:'h_diffuse_op', label:'Diffuse osteopenia', diags:['RA'] },
          { id:'h_preserved_density', label:'Preserved bone density', diags:['OA','Gout','PsA','ReA','CPPD'] },
          { id:'h_osteophytes', label:'Osteophytes present', diags:['OA','EOA','CPPD','Hem'] },
          { id:'h_ivory_phal', label:'Ivory phalanx (osteosclerosis)', diags:['PsA'] },
          { id:'h_ankylosis', label:'Bony ankylosis', diags:['JIA','RA','PsA'] },
          { id:'h_brachydactyly', label:'Brachydactyly / premature physeal fusion', diags:['JIA'] },
          // Soft tissue & calcification
          { id:'h_sausage', label:'Sausage digit (entire digit swollen)', diags:['PsA','ReA'] },
          { id:'h_sym_swelling', label:'Symmetric periarticular swelling', diags:['RA'] },
          { id:'h_tophus', label:'Soft-tissue tophus / lumpy-bumpy swelling', diags:['Gout'] },
          { id:'h_calc_soft', label:'Periarticular soft-tissue calcification', diags:['Scl','CPPD','Gout','HADD'] },
          { id:'h_fluffy_calc', label:'Fluffy/amorphous periarticular calcification (no erosion)', diags:['HADD'] },
          { id:'h_chondrocalc', label:'Chondrocalcinosis', diags:['CPPD','Hem'] },
          { id:'h_acroosteolysis', label:'Acro-osteolysis (distal phalanx resorption)', diags:['Scl'] },
          { id:'h_reducible_sublux', label:'Reducible subluxations at MCPs/PIPs', diags:['SLE'] },
          { id:'h_nonreducible_sublux', label:'Non-reducible subluxations / deformity', diags:['RA'] },
          { id:'h_swan_neck', label:'Swan neck deformity', diags:['RA'] },
          { id:'h_boutonniere', label:'Boutonnière deformity', diags:['RA'] },
          { id:'h_ulnar_dev', label:'Ulnar deviation at MCPs', diags:['RA'] },
          { id:'h_spade_tufts', label:'Spade-like terminal tufts / tuftal enlargement', diags:['Acromegaly'] },
          // Cartilage
          { id:'h_asym_narrow', label:'Asymmetric joint space narrowing', diags:['OA','Gout'] },
          { id:'h_sym_narrow', label:'Symmetric joint space narrowing', diags:['RA','PsA','JIA','SLE'] },
          { id:'h_preserved_space', label:'Preserved joint space', diags:['Gout'] },
          { id:'h_widened_space', label:'Widened joint space (early disease)', diags:['Acromegaly'] },
          { id:'hand_hpoa', label:'Periosteal new bone formation along diaphyses (HPOA)', diags:['HPOA'] },
        ],
      },
    ],
  },
  wrist: {
    label: 'Wrist',
    categories: [
      {
        label: 'Findings',
        findings: [
          { id:'w_pancarpal', label:'Pan-carpal / diffuse involvement', diags:['RA','JIA'] },
          { id:'w_cmc_only', label:'1st CMC thumb base involvement only', diags:['OA','EOA'] },
          { id:'w_cmc_erosion', label:'CMC osteophytes with erosions', diags:['EOA'] },
          { id:'w_cmc_gout', label:'CMC erosions without osteophytes', diags:['Gout'] },
          { id:'w_ulnar_styloid', label:'Ulnar styloid erosion', diags:['RA'] },
          { id:'w_scapholunar', label:'Wide scapholunate interval (>3 mm; Terry Thomas sign)', diags:['CPPD','RA','Gout'] },
          { id:'w_periarticular_op', label:'Periarticular osteopenia', diags:['RA','JIA'] },
          { id:'w_marginal_erosion', label:'Marginal erosions', diags:['RA','PsA','Gout'] },
          { id:'w_overhanging', label:'Overhanging margin erosion', diags:['Gout'] },
          { id:'w_pencil_cup', label:'Pencil-in-cup erosion', diags:['PsA','ReA'] },
          { id:'w_ankylosis', label:'Carpal ankylosis', diags:['JIA','RA'] },
          { id:'w_preserved_density', label:'Preserved bone density', diags:['OA','Gout','PsA','CPPD'] },
          { id:'w_chondrocalc', label:'Chondrocalcinosis (TFCC / cartilage)', diags:['CPPD'] },
          { id:'w_calcten', label:'Calcification in tendons / periarticular tissues', diags:['HADD','CPPD'] },
          { id:'w_fluffy_calc', label:'Fluffy/amorphous periarticular calcification (no erosion)', diags:['HADD'] },
          { id:'w_soft_calc', label:'Soft-tissue / periarticular calcification', diags:['Scl','CPPD','Gout','HADD'] },
          { id:'w_sublux', label:'Subluxations / reducible malalignment', diags:['RA','SLE'] },
          { id:'w_sym_narrow', label:'Symmetric joint space narrowing', diags:['RA','JIA'] },
          { id:'w_asym_narrow', label:'Asymmetric joint space narrowing', diags:['OA','Gout'] },
          { id:'w_osteophytes', label:'Osteophytes present', diags:['OA','CPPD','Hem'] },
          { id:'w_periosteal', label:'Periosteal reaction / fluffy periostitis', diags:['PsA','ReA'] },
          { id:'wrist_hpoa', label:'Periosteal new bone formation along diaphyses (HPOA)', diags:['HPOA'] },
          { id:'w_ul_abutment', label:'Positive ulnar variance + subchondral sclerosis / cyst at ulnar lunate / triquetrum (ulnolunate abutment)', diags:['ULAb'] },
          { id:'w_sig_notch', label:'Ulnar shortening / positive variance + distal ulnar head narrowing or impingement at sigmoid notch', diags:['SigNotch'] },
        ],
      },
    ],
  },
  elbow: {
    label: 'Elbow',
    categories: [
      {
        label: 'Findings',
        findings: [
          { id:'el_enlarged_radhead', label:'Enlarged radial head', diags:['Hemo','JIA'] },
          { id:'el_effusion_present', label:'Joint effusion present', diags:['RA','Hemo','JIA','Gout','CPPD','Sep'] },
          { id:'el_effusion_absent', label:'Joint effusion absent', diags:['OA'] },
          { id:'el_osteo_bodies', label:'Osteochondral bodies present', diags:['OA','CPPD'] },
          { id:'el_syn_oc', label:'Multiple intra-articular calcified bodies of similar size', diags:['SynOC'] },
          { id:'el_jointspace_narrow', label:'Joint space narrowing', diags:['OA','RA','Hemo','JIA'] },
          { id:'el_synovial_density', label:'Increased soft-tissue density (hemosiderin)', diags:['Hemo'] },
          { id:'el_involvement_1in3', label:'Isolated elbow involvement (~1/3 RA patients)', diags:['RA'] },
          { id:'el_oa_posttrauma', label:'Joint space narrowing + osteophytes (post-trauma pattern)', diags:['OA'] },
          { id:'el_erosions', label:'Marginal erosions without osteophytes', diags:['RA'] },
          { id:'el_calcten', label:'Periarticular / tendon calcification', diags:['HADD'] },
          { id:'el_fluffy_calc', label:'Fluffy/amorphous periarticular calcification (no erosion)', diags:['HADD'] },
          { id:'el_chondrocalc', label:'Chondrocalcinosis', diags:['CPPD'] },
          { id:'el_periarticular_op', label:'Periarticular osteopenia', diags:['RA','JIA'] },
          { id:'elbow_hpoa', label:'Periosteal new bone formation along diaphyses (HPOA)', diags:['HPOA'] },
        ],
      },
    ],
  },
  shoulder: {
    label: 'Shoulder',
    categories: [
      {
        label: 'Findings',
        findings: [
          { id:'sh_high_humerus', label:'High-riding humerus (superior migration)', diags:['RA','RCA'] },
          { id:'sh_lateral_erosion', label:'Lateral humeral head erosion', diags:['RA'] },
          { id:'sh_distal_clav_pencil', label:'"Penciling" of distal clavicle (AC joint erosion)', diags:['RA'] },
          { id:'sh_glenohumeral_narrow', label:'Glenohumeral joint space narrowing', diags:['OA','RA'] },
          { id:'sh_osteophytes', label:'Osteophytes / subchondral sclerosis', diags:['OA'] },
          { id:'sh_ac_erosion', label:'AC joint erosion', diags:['RA'] },
          { id:'sh_acromion_erosion', label:'Erosion / irregularity at acromion (inferior surface)', diags:['AS','RA'] },
          { id:'sh_calcten', label:'Calcification in supraspinatus / rotator cuff tendon', diags:['HADD'] },
          { id:'sh_fluffy_calc', label:'Fluffy/amorphous periarticular calcification (no erosion)', diags:['HADD'] },
          { id:'sh_milwaukee', label:'Rapid joint destruction + calcium deposits', diags:['HADD'] },
          { id:'sh_pvns', label:'Joint space narrowing + cortical erosions + preserved bone density', diags:['PVNS'] },
          { id:'sh_chondrocalc', label:'Chondrocalcinosis (glenohumeral)', diags:['CPPD'] },
          { id:'sh_subchondral_cysts', label:'Prominent subchondral cysts', diags:['OA','CPPD','PVNS'] },
          { id:'sh_syn_oc', label:'Multiple intra-articular calcified bodies of similar size', diags:['SynOC'] },
          { id:'shoulder_hpoa', label:'Periosteal new bone formation along diaphyses (HPOA)', diags:['HPOA'] },
        ],
      },
    ],
  },
  hip: {
    label: 'Hip',
    categories: [
      {
        label: 'Findings',
        findings: [
          { id:'hip_superolat', label:'Superolateral femoral head migration', diags:['OA'] },
          { id:'hip_axial', label:'Axial (concentric) cartilage loss / migration', diags:['RA','JIA'] },
          { id:'hip_medial', label:'Medial migration', diags:['OA'] },
          { id:'hip_protrusio', label:'Protrusio deformity (medial beyond ilioischial line)', diags:['RA'] },
          { id:'hip_jointspace_superior', label:'Superior joint space narrowing', diags:['OA'] },
          { id:'hip_concentric', label:'Concentric / uniform joint space narrowing', diags:['RA','JIA'] },
          { id:'hip_osteophytes', label:'Osteophytes + subchondral sclerosis', diags:['OA'] },
          { id:'hip_bilateral', label:'Bilateral symmetric involvement', diags:['OA','RA'] },
          { id:'hip_epiphyseal_enlarge', label:'Epiphyseal enlargement (hyperemia)', diags:['JIA','Hemo'] },
          { id:'hip_erosions', label:'Erosions without new bone formation', diags:['RA'] },
          { id:'hip_pvns', label:'Joint space narrowing + cortical erosions + preserved density', diags:['PVNS'] },
          { id:'hip_chondrocalc', label:'Chondrocalcinosis', diags:['CPPD'] },
          { id:'hip_subchondral_cysts', label:'Prominent subchondral cysts', diags:['OA','CPPD','PVNS'] },
          { id:'hip_syn_oc', label:'Multiple intra-articular calcified bodies of similar size', diags:['SynOC'] },
          { id:'hip_calcten', label:'Periarticular / tendon calcification', diags:['HADD'] },
          { id:'hip_hpoa', label:'Periosteal new bone formation along diaphyses (HPOA)', diags:['HPOA'] },
        ],
      },
    ],
  },
  knee: {
    label: 'Knee',
    categories: [
      {
        label: 'Findings',
        findings: [
          { id:'kn_medial', label:'Medial tibiofemoral predominant narrowing', diags:['OA'] },
          { id:'kn_lateral', label:'Lateral tibiofemoral predominant narrowing', diags:['CPPD'] },
          { id:'kn_patellofemoral', label:'Patellofemoral predominant (isolated)', diags:['CPPD'] },
          { id:'kn_all3', label:'All 3 compartments involved', diags:['OA','RA','CPPD'] },
          { id:'kn_sym_all3', label:'Symmetric all 3 compartments without erosions', diags:['RA'] },
          { id:'kn_osteophytes', label:'Osteophytes present', diags:['OA','CPPD'] },
          { id:'kn_subchondral_cysts', label:'Prominent subchondral cysts', diags:['OA','CPPD','PVNS'] },
          { id:'kn_sclerosis', label:'Subchondral sclerosis', diags:['OA','CPPD'] },
          { id:'kn_no_erosion', label:'No erosions', diags:['OA','CPPD','Hemo'] },
          { id:'kn_intercondylar_notch', label:'Widened intercondylar notch', diags:['Hemo','JIA'] },
          { id:'kn_epiphyseal_enlarge', label:'Epiphyseal enlargement / ballooning (hyperemia)', diags:['Hemo','JIA'] },
          { id:'kn_chondrocalc', label:'Chondrocalcinosis (menisci / cartilage)', diags:['CPPD'] },
          { id:'kn_effusion', label:'Joint effusion present', diags:['RA','Hemo','JIA','Gout','CPPD','PVNS','Sep'] },
          { id:'kn_effusion_absent', label:'Joint effusion absent', diags:['OA'] },
          { id:'kn_osteo_bodies', label:'Osteochondral bodies present (loose bodies)', diags:['OA','CPPD'] },
          { id:'kn_syn_oc', label:'Multiple intra-articular calcified bodies of similar size', diags:['SynOC'] },
          { id:'kn_popliteus_erosion', label:'Popliteus insertion erosion', diags:['Gout'] },
          { id:'kn_calc_nodules', label:'Calcified soft-tissue nodules near the patella', diags:['Gout'] },
          { id:'kn_polar_patellar', label:'Non-articular polar patellar erosions', diags:['Gout'] },
          { id:'kn_uniform_narrow', label:'Uniform joint space narrowing', diags:['RA','JIA'] },
          { id:'kn_pvns', label:'Joint narrowing + cortical erosions + preserved density', diags:['PVNS'] },
          { id:'kn_bilateral', label:'Bilateral symmetric involvement', diags:['OA','RA','CPPD'] },
          { id:'knee_hpoa', label:'Periosteal new bone formation along diaphyses (HPOA)', diags:['HPOA'] },
        ],
      },
    ],
  },
  foot: {
    label: 'Foot',
    categories: [
      {
        label: 'Findings',
        findings: [
          { id:'ft_1mtp_oa', label:'1st MTP osteophytes / hallux rigidus', diags:['OA'] },
          { id:'ft_1mtp_gout', label:'1st MTP soft-tissue swelling + overhanging erosion margin', diags:['Gout'] },
          { id:'ft_mtp_ra', label:'MTP erosions (forefoot — multiple MTPs)', diags:['RA'] },
          { id:'ft_5mtp_erosion', label:'Erosion at 5th MTP joint', diags:['RA'] },
          { id:'ft_ip_psa', label:'Great toe IP + MTP involvement', diags:['PsA'] },
          { id:'ft_ivory', label:'Ivory phalanx (osteosclerosis of toe)', diags:['PsA'] },
          { id:'ft_plantar_spur_psa', label:'Plantar calcaneal spur WITH periosteal reaction', diags:['PsA'] },
          { id:'ft_plantar_spur_oa', label:'Plantar calcaneal spur WITHOUT reactive new bone', diags:['OA'] },
          { id:'ft_calcaneal_erosion', label:'Posterior-superior calcaneal erosion', diags:['ReA','PsA'] },
          { id:'ft_achilles_thick', label:'Achilles thickening / enthesophyte', diags:['ReA','PsA','AS'] },
          { id:'ft_fluffy_periosteal', label:'Fluffy periosteal reaction calcaneus', diags:['ReA','PsA'] },
          { id:'ft_mtp_ra_forefoot', label:'MTP involvement (forefoot)', diags:['RA'] },
          { id:'ft_talocalcaneonavicular', label:'Talocalcaneonavicular joint involved', diags:['RA'] },
          { id:'ft_sausage_toe', label:'Sausage toe (diffuse digit swelling)', diags:['ReA','PsA'] },
          { id:'ft_tophus', label:'Soft-tissue tophi / lumpy-bumpy swelling', diags:['Gout'] },
          { id:'ft_overhanging', label:'Overhanging erosion margin', diags:['Gout'] },
          { id:'ft_calcten', label:'Periarticular / tendon calcification', diags:['HADD'] },
          { id:'foot_hpoa', label:'Periosteal new bone formation along diaphyses (HPOA)', diags:['HPOA'] },
        ],
      },
    ],
  },
  si: {
    label: 'SI Joints',
    categories: [
      {
        label: 'Findings',
        findings: [
          { id:'si_sym', label:'Symmetric sacroiliitis (bilateral)', diags:['AS','IBD'] },
          { id:'si_asym', label:'Asymmetric sacroiliitis', diags:['PsA','ReA'] },
          { id:'si_unilateral', label:'Unilateral sacroiliitis', diags:['Sep','PsA','ReA'] },
          { id:'si_oa_inferior', label:'OA changes limited to inferior (synovial) portion', diags:['OA'] },
          { id:'si_oa_bridging', label:'OA with bridging superior osteophytes', diags:['OA'] },
          { id:'si_erosions_iliac', label:'Erosions on iliac aspect of SI joint', diags:['AS','PsA','ReA','IBD'] },
          { id:'si_sclerosis', label:'Subchondral sclerosis', diags:['AS','OA','PsA','ReA','IBD','OCI'] },
          { id:'si_ankylosis', label:'SI joint ankylosis', diags:['AS'] },
          { id:'si_iliac_sclerosis_only', label:'Dense sclerosis iliac side only — no erosion, no joint space loss', diags:['OCI'] },
          { id:'si_triangular_sclerosis', label:'Triangular / flame-shaped iliac sclerosis adjacent to SI joint', diags:['OCI'] },
          { id:'si_normal_joint_space', label:'Normal SI joint space preserved', diags:['OCI','OA'] },
          { id:'si_bilateral_oci', label:'Bilateral symmetrical iliac sclerosis in parous female', diags:['OCI'] },
        ],
      },
    ],
  },
  'c-spine': {
    label: 'Cervical Spine',
    categories: [
      {
        label: 'RA Findings',
        findings: [
          { id:'cs_atlantoaxial', label:'Atlantoaxial (C1–C2) subluxation', diags:['RA'] },
          { id:'cs_adi_widened', label:'ADI > 2.5 mm (atlanto-dental interval)', diags:['RA'] },
          { id:'cs_vertical_impact', label:'Vertical atlantoaxial impaction (dens protrudes toward foramen magnum)', diags:['RA'] },
          { id:'cs_odontoid_erosion', label:'Odontoid erosion', diags:['RA'] },
          { id:'cs_multilevel_sublux', label:'Multilevel subluxations', diags:['RA'] },
          { id:'cs_no_boneproduction', label:'Erosions WITHOUT bone production', diags:['RA'] },
          { id:'cs_osteopenia', label:'Diffuse osteopenia with erosions', diags:['RA'] },
          { id:'cs_facet_erosion', label:'Facet joint erosions', diags:['RA','AS'] },
        ],
      },
      {
        label: 'AS / Spondyloarthropathy Findings',
        findings: [
          { id:'cs_syndesmophytes', label:'Delicate syndesmophytes (bridging)', diags:['AS'] },
          { id:'cs_bamboo', label:'Bamboo spine / spinal ankylosis', diags:['AS'] },
          { id:'cs_squaring', label:'Squaring of vertebral body margins', diags:['AS'] },
          { id:'cs_romanus', label:'Romanus lesion (anterior corner erosion)', diags:['AS'] },
          { id:'cs_bulky_bridging', label:'Bulky / coarse asymmetric bony bridging', diags:['PsA','ReA'] },
          { id:'cs_dagger_sign', label:'Dagger sign (fused spinous processes)', diags:['AS'] },
          { id:'cs_andersson', label:'Andersson lesion (pseudarthrosis in ankylosed spine)', diags:['AS'] },
        ],
      },
      {
        label: 'DDD / Other',
        findings: [
          { id:'cs_ddd', label:'Disc space narrowing + osteophytes (DDD)', diags:['OA'] },
          { id:'cs_transverse_lig', label:'Calcification at transverse ligament / periodontoid region', diags:['CPPD'] },
          { id:'cs_vacuum', label:'Vacuum phenomenon in disc', diags:['OA'] },
          { id:'cs_dish', label:'Flowing anterior osteophytes spanning ≥4 levels (DISH)', diags:['DISH'] },
          { id:'cs_disc_calc', label:'Disc calcification at multiple levels', diags:['Ochronosis','CPPD'] },
        ],
      },
    ],
  },
  't-spine': {
    label: 'Thoracic Spine',
    categories: [
      {
        label: 'Findings',
        findings: [
          { id:'ts_syndesmophytes', label:'Delicate syndesmophytes / bamboo spine', diags:['AS'] },
          { id:'ts_romanus', label:'Romanus lesion (anterior corner erosion)', diags:['AS'] },
          { id:'ts_squaring', label:'Vertebral body squaring', diags:['AS'] },
          { id:'ts_dagger_sign', label:'Dagger sign (fused spinous processes)', diags:['AS'] },
          { id:'ts_bulky_bridging', label:'Bulky asymmetric bony bridging', diags:['PsA','ReA'] },
          { id:'ts_dish', label:'Flowing anterior osteophytes ≥4 levels (DISH)', diags:['DISH'] },
          { id:'ts_ddd', label:'Disc space narrowing + osteophytes (DDD)', diags:['OA'] },
          { id:'ts_disc_calc', label:'Intervertebral disc calcification', diags:['Ochronosis','CPPD'] },
          { id:'ts_gibbus', label:'Gibbus deformity (acute angular kyphosis)', diags:['TB','Fracture'] },
          { id:'ts_si_symmetric', label:'Symmetric sacroiliitis on same film', diags:['AS','IBD'] },
        ],
      },
    ],
  },
  'l-spine': {
    label: 'Lumbar Spine',
    categories: [
      {
        label: 'DDD / OA Findings',
        findings: [
          { id:'ls_ddd', label:'Disc space narrowing + osteophytes (DDD)', diags:['OA'] },
          { id:'ls_vacuum', label:'Vacuum phenomenon in disc (pathognomonic DDD)', diags:['OA'] },
          { id:'ls_facet_oa', label:'Facet joint OA (sclerosis / osteophytes)', diags:['OA'] },
          { id:'ls_dish', label:'Flowing anterior osteophytes spanning ≥4 levels (DISH)', diags:['DISH'] },
          { id:'ls_spondylolisthesis', label:'Degenerative spondylolisthesis', diags:['OA'] },
          { id:'ls_disc_calc', label:'Disc calcification (multilevel)', diags:['Ochronosis','CPPD'] },
        ],
      },
      {
        label: 'AS / Spondyloarthropathy Findings',
        findings: [
          { id:'ls_syndesmophytes', label:'Delicate syndesmophytes (vertical bridging)', diags:['AS'] },
          { id:'ls_bamboo', label:'Bamboo spine appearance', diags:['AS'] },
          { id:'ls_squaring', label:'Vertebral body squaring (anterior erosion)', diags:['AS'] },
          { id:'ls_romanus', label:'Romanus lesion (anterior corner erosion/sclerosis)', diags:['AS'] },
          { id:'ls_dagger_sign', label:'Dagger sign (fused spinous processes on AP view)', diags:['AS'] },
          { id:'ls_bulky_bridging', label:'Bulky asymmetric bony bridging (lateral osteophytes)', diags:['PsA','ReA'] },
          { id:'ls_facet_erosion', label:'Facet joint erosions', diags:['AS','RA'] },
          { id:'ls_andersson', label:'Andersson lesion (pseudarthrosis in ankylosed spine)', diags:['AS'] },
          { id:'ls_si_symmetric', label:'Symmetric sacroiliitis visible on same film', diags:['AS','IBD'] },
          { id:'ls_si_asymmetric', label:'Asymmetric sacroiliitis visible on same film', diags:['PsA','ReA'] },
        ],
      },
    ],
  },
};


// Diagnosis display info
const DIAG_INFO = {
  OA:         { label:'Osteoarthritis', color:'#0891b2', bg:'#ecfeff', darkBg:'#0c2d36', darkColor:'#67e8f9' },
  EOA:        { label:'Erosive OA', color:'#0e7490', bg:'#e0f7fa', darkBg:'#0a2233', darkColor:'#38bdf8' },
  RA:         { label:'Rheumatoid Arthritis', color:'#dc2626', bg:'#fef2f2', darkBg:'#3b0a0a', darkColor:'#fca5a5' },
  PsA:        { label:'Psoriatic Arthritis', color:'#7c3aed', bg:'#f5f3ff', darkBg:'#2e1a4a', darkColor:'#c4b5fd' },
  AS:         { label:'Ankylosing Spondylitis', color:'#b45309', bg:'#fffbeb', darkBg:'#2d1a05', darkColor:'#fcd34d' },
  ReA:        { label:'Reactive Arthropathy', color:'#065f46', bg:'#ecfdf5', darkBg:'#022c1b', darkColor:'#6ee7b7' },
  IBD:        { label:'IBD Arthropathy', color:'#1d4ed8', bg:'#eff6ff', darkBg:'#0c1f5a', darkColor:'#93c5fd' },
  Gout:       { label:'Gout', color:'#9d174d', bg:'#fdf2f8', darkBg:'#3b0a1e', darkColor:'#f9a8d4' },
  CPPD:       { label:'CPPD', color:'#0f766e', bg:'#f0fdfa', darkBg:'#062824', darkColor:'#5eead4' },
  HADD:       { label:'Hydroxyapatite (HADD)', color:'#6b21a8', bg:'#faf5ff', darkBg:'#2d0f4a', darkColor:'#d8b4fe' },
  SLE:        { label:'Systemic Lupus (SLE)', color:'#be185d', bg:'#fdf2f8', darkBg:'#3b0a2a', darkColor:'#fbcfe8' },
  JIA:        { label:'Juvenile Idiopathic Arthritis', color:'#92400e', bg:'#fef3c7', darkBg:'#3a1505', darkColor:'#fde68a' },
  Hemo:       { label:'Hemophilic Arthropathy', color:'#1e3a5f', bg:'#e0e7ff', darkBg:'#0f1f3a', darkColor:'#a5b4fc' },
  Scl:        { label:'Scleroderma', color:'#374151', bg:'#f3f4f6', darkBg:'#111827', darkColor:'#d1d5db' },
  Hem:        { label:'Hemochromatosis', color:'#78350f', bg:'#fff7ed', darkBg:'#2d1005', darkColor:'#fdba74' },
  Sep:        { label:'Septic / Infectious', color:'#991b1b', bg:'#fef2f2', darkBg:'#3b0a0a', darkColor:'#fca5a5' },
  Amyloid:    { label:'Amyloid Arthropathy', color:'#4b5563', bg:'#f9fafb', darkBg:'#111827', darkColor:'#9ca3af' },
  Acromegaly: { label:'Acromegaly', color:'#0f766e', bg:'#f0fdfa', darkBg:'#062824', darkColor:'#5eead4' },
  DISH:       { label:'DISH', color:'#0369a1', bg:'#e0f2fe', darkBg:'#0a2333', darkColor:'#7dd3fc' },
  Ochronosis: { label:'Ochronosis', color:'#1e293b', bg:'#f1f5f9', darkBg:'#0f172a', darkColor:'#94a3b8' },
  TB:         { label:'TB (Pott Disease)', color:'#b91c1c', bg:'#fef2f2', darkBg:'#3b0a0a', darkColor:'#fca5a5' },
  Fracture:   { label:'Compression Fracture', color:'#374151', bg:'#f3f4f6', darkBg:'#111827', darkColor:'#d1d5db' },
  PVNS:       { label:'PVNS / TSGCT', color:'#1e3a5f', bg:'#e0e7ff', darkBg:'#0f1f3a', darkColor:'#a5b4fc' },
  RCA:        { label:'Rotator Cuff Arthropathy', color:'#0f766e', bg:'#f0fdfa', darkBg:'#062824', darkColor:'#5eead4' },
  OCI:        { label:'Osteitis Condensans Ilii', color:'#92400e', bg:'#fef3c7', darkBg:'#3a1505', darkColor:'#fde68a' },
  HPOA:       { label:'HPOA (Hypertrophic Osteoarthropathy)', color:'#0369a1', bg:'#e0f2fe', darkBg:'#0a2333', darkColor:'#7dd3fc' },
  SynOC:      { label:'Synovial Osteochondromatosis', color:'#0f766e', bg:'#f0fdfa', darkBg:'#062824', darkColor:'#5eead4' },
  ULAb:       { label:'Ulnolunate Abutment Syndrome', color:'#0369a1', bg:'#e0f2fe', darkBg:'#0a2333', darkColor:'#7dd3fc' },
  SigNotch:   { label:'Sigmoid Notch / Ulnar Impingement', color:'#0369a1', bg:'#e0f2fe', darkBg:'#0a2333', darkColor:'#7dd3fc' },
};

// ── Rheum Prompt Builder ────────────────────────────────────────────────────
function buildRheumPrompt(joint, laterality, views) {
  const jLabel = RHEUM_JOINTS[joint]?.label || joint;
  const latLabel = laterality === 'bilateral' ? 'Bilateral' : (laterality === 'left' ? 'Left' : 'Right');
  const viewsLabel = views ? `, ${views} view${views==='1'?'':'s'}` : '';
  return `You are a subspecialty MSK radiologist generating a structured radiograph report for a rheumatology case.

CRITICAL FORMATTING RULES:
- NEVER use markdown. No asterisks, no bold, no dashes, no bullet points.
- Section headers (TECHNIQUE, FINDINGS, IMPRESSION) on their own line in ALL CAPS with colon.
- Subheadings: "Structure Name: finding text" — Title Case, colon, finding on same line.
- ABSOLUTE RULE — ZERO TOLERANCE: NEVER include any commentary, interpretation notes, correction notices, clarification notes, or meta-statements anywhere in the output. This includes phrases like "I interpreted X as Y", "I assumed you meant Z", or any notation about speech recognition corrections. Silently apply best clinical interpretation. Output must contain ONLY formal radiology report content.

TECHNIQUE:
${latLabel} radiograph of the ${jLabel.toLowerCase()}${viewsLabel}.

FINDINGS RULES:
1. Not mentioned: write "No acute abnormality." for all structures including Soft Tissues and Bones.
2. Positive findings: exact dictated words only.
3. For joints: address joint space (narrowing pattern, distribution), subchondral bone (sclerosis, cysts), osteophytes, erosions (marginal, central, overhanging), bone density, periosteal reaction, soft-tissue swelling, calcifications, subluxations or deformities.
4. BONES: address cortex integrity and any fracture or lesion.

IMPRESSION RULES — FOLLOW EXACTLY:
- The impression must be concise. Do NOT repeat or summarize individual findings from the FINDINGS section.
- Use SINGULAR: "The imaging pattern IS most consistent with the diagnosis of [X]." — never "patterns are."
- Secondary differential: after the first sentence, add "Next consideration includes [Y]." Keep it brief — one short clause maximum.
- Two coexisting entities: "The imaging pattern is most consistent with [X] superimposed with [Y]." Then optionally one brief next consideration sentence.
- Normal: "No radiographic evidence of significant arthropathy of the ${jLabel.toLowerCase()}."
- KNEE-SPECIFIC CPPD vs OA RULE: If chondrocalcinosis is present WITH isolated patellofemoral narrowing and/or prominent subchondral cysts, favor CPPD as the primary diagnosis. If chondrocalcinosis is present WITH tricompartmental or medial-predominant narrowing and osteophytes, favor OA as primary with CPPD as next consideration.
- Do NOT reference ABCDE or ABCDEs anywhere in the report.
- Do NOT restate or paraphrase findings from the FINDINGS section in the impression.
- Use complete sentences only — no numbered lists.
- Maximum 2–3 sentences total in the impression.

FORMAT — one blank line between each section:
${buildReportHeading('XR', jLabel.toLowerCase(), laterality==='bilateral'?'bilateral':(laterality==='left'?'left':'right'), '', '')}

HISTORY:

COMPARISON: None.

TECHNIQUE:
${latLabel} radiograph of the ${jLabel.toLowerCase()}${viewsLabel}.

FINDINGS:
Structure: finding

IMPRESSION:
The imaging pattern is most consistent with the diagnosis of [X].`;
}

// ── Rheum DDx Panel ─────────────────────────────────────────────────────────
// ── Rheum Example Images (base64 embedded) ──────────────────────────────────
const RHEUM_EXAMPLE_IMAGES = {
  // ── SI Joints ──────────────────────────────────────────────────────────────
  si_erosions_iliac: {
    src: '/images/msk/rheum_si_erosions_iliac.jpg',
    caption: 'Symmetric sacroiliitis: CT shows sclerosis and erosions on the iliac aspect of both SI joints bilaterally.',
  },
  si_unilateral: {
    src: '/images/msk/rheum_si_unilateral.jpg',
    caption: 'Unilateral sacroiliitis: AP pelvis showing asymmetric sacroiliac joint involvement.',
  },
  // ── Hip ────────────────────────────────────────────────────────────────────
  hip_axial: {
    src: '/images/msk/rheum_hip_axial.jpg',
    caption: 'Axial migration and protrusio deformity: AP pelvis showing concentric joint space narrowing and medial femoral head migration, characteristic of inflammatory arthritis.',
  },
  hip_protrusio: {
    src: '/images/msk/rheum_hip_protrusio.jpg',
    caption: 'Protrusio deformity: Bilateral hip radiograph demonstrating medial migration of femoral heads beyond the ilioischial line, consistent with rheumatoid arthritis.',
  },
  // ── Hand ───────────────────────────────────────────────────────────────────
  h_mcp: {
    src: '/images/msk/rheum_h_mcp.jpg',
    caption: 'Rheumatoid arthritis: Marginal erosions at the MCPs and carpal joints with periarticular osteopenia and symmetric joint space narrowing.',
  },
  h_carpal: {
    src: '/images/msk/rheum_h_carpal.jpg',
    caption: 'Rheumatoid arthritis: Pan-carpal involvement with erosions and periarticular osteopenia, characteristic of RA.',
  },
  h_acroosteolysis: {
    src: '/images/msk/rheum_h_acroosteolysis.jpg',
    caption: 'Acro-osteolysis: Resorption of the distal phalanges, characteristic of scleroderma and other collagen vascular diseases.',
  },
  hand_hpoa: {
    src: '/images/msk/rheum_hand_hpoa.jpg',
    caption: 'HPOA (Hypertrophic Pulmonary Osteoarthropathy): Periosteal new bone formation along the diaphyses, associated with pulmonary disease.',
  },
  // ── Wrist ──────────────────────────────────────────────────────────────────
  w_scapholunar: {
    src: '/images/msk/rheum_w_scapholunar.jpg',
    caption: 'Wide scapholunate interval (Terry Thomas sign): PA wrist radiograph showing abnormal widening of the scapholunate space (>3 mm), indicating scapholunate ligament disruption. This is an early finding preceding SLAC wrist collapse, and can be seen in CPPD, RA, and gout.',
  },
  // ── Foot ───────────────────────────────────────────────────────────────────
  ft_mtp_ra: {
    src: '/images/msk/rheum_ft_mtp_ra.jpg',
    caption: 'Rheumatoid arthritis: MTP joint erosions in the forefoot with periarticular osteopenia and joint space narrowing.',
  },
  ft_mtp_ra_forefoot: {
    src: '/images/msk/rheum_ft_mtp_ra_forefoot.jpg',
    caption: 'Rheumatoid arthritis — forefoot involvement: MTP erosions bilaterally with classic RA distribution.',
  },
  ft_5mtp_erosion: {
    src: '/images/msk/rheum_ft_5mtp_erosion.jpg',
    caption: '5th MTP erosion: Marginal erosion at the 5th metatarsophalangeal joint, raising suspicion for rheumatoid arthritis.',
  },
  // ── Knee ───────────────────────────────────────────────────────────────────
  kn_uniform_narrow: {
    src: '/images/msk/rheum_kn_uniform_narrow.jpg',
    caption: 'Inflammatory arthropathy of the knee: Uniform joint space narrowing without significant osteophytes, consistent with rheumatoid arthritis.',
  },
  // ── Cervical Spine ─────────────────────────────────────────────────────────
  cs_atlantoaxial: {
    src: '/images/msk/rheum_cs_atlantoaxial.jpg',
    caption: 'Atlantoaxial subluxation in RA: Lateral cervical spine radiograph showing widening of the atlanto-dental interval, consistent with C1-C2 instability from rheumatoid pannus.',
  },
  cs_adi_widened: {
    src: '/images/msk/rheum_cs_adi_widened.jpg',
    caption: 'Widened atlanto-dental interval (ADI): Lateral c-spine showing ADI > 2.5 mm, consistent with transverse ligament laxity from RA.',
  },
  // ── Elbow ──────────────────────────────────────────────────────────────────
  el_osteo_bodies: {
    src: '/images/msk/rheum_el_osteo_bodies.jpg',
    caption: 'Synovial osteochondromatosis: Lateral elbow radiograph showing multiple intra-articular calcified bodies of similar size, characteristic of synovial osteochondromatosis.',
  },
};
// Synovial osteochondromatosis — knee/shoulder/hip reuse the elbow image
RHEUM_EXAMPLE_IMAGES.kn_syn_oc = RHEUM_EXAMPLE_IMAGES.el_osteo_bodies;
// Wrist — ulnar-sided pathology
RHEUM_EXAMPLE_IMAGES.w_sig_notch = {
  src: '/images/msk/rheum_w_sig_notch.jpg',
  caption: 'Ulnar impingement / sigmoid notch impingement: Radiograph showing positive ulnar variance with impingement of the distal ulna at the sigmoid notch of the radius, causing pain and limited forearm rotation.',
};
RHEUM_EXAMPLE_IMAGES.h_boutonniere = {
  src: '/images/msk/rheum_h_boutonniere.jpg',
  caption: 'Boutonnière deformity: Lateral radiograph of the finger showing PIP flexion with DIP hyperextension, caused by rupture of the central slip of the extensor tendon — a classic deformity of rheumatoid arthritis.',
};
RHEUM_EXAMPLE_IMAGES.w_ul_abutment = {
  src: '/images/msk/rheum_w_ul_abutment.jpg',
  caption: 'Ulnolunate abutment syndrome: Radiograph demonstrating positive ulnar variance with subchondral sclerosis and cystic change at the proximal ulnar aspect of the lunate and/or triquetrum, consistent with impaction syndrome from chronic ulnocarpal loading.',
};
// Knee gout findings share the same example image
const _kneeGoutImg = {
  src: '/images/msk/knee_gout.jpg',
  caption: 'Gout of the knee: Lateral radiograph demonstrating calcified periarticular soft-tissue nodules near the patella (tophi) and non-articular polar patellar erosions — classic features of tophaceous gout at the knee.',
};
RHEUM_EXAMPLE_IMAGES.kn_calc_nodules = _kneeGoutImg;
RHEUM_EXAMPLE_IMAGES.kn_polar_patellar = _kneeGoutImg;
RHEUM_EXAMPLE_IMAGES.sh_syn_oc = RHEUM_EXAMPLE_IMAGES.el_osteo_bodies;
RHEUM_EXAMPLE_IMAGES.hip_syn_oc = RHEUM_EXAMPLE_IMAGES.el_osteo_bodies;


export { RHEUM_JOINTS, DIAG_INFO, RHEUM_EXAMPLE_IMAGES, buildRheumPrompt };
