'use client';
export const dynamic = 'force-dynamic';

// LucidMSK — app/terms/page.js
// Standalone Terms of Use page — accessible at lucidmsk.com/terms
// Linked from signup flow and profile settings

export default function TermsPage() {
  const sections = [
    ['1. Acceptance of Terms', 'By creating an account, accessing, or using the LucidMSK application ("Application"), you ("User") agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, you must not access or use the Application. Your continued use of the Application constitutes your ongoing acceptance of these Terms as they may be updated from time to time.'],
    ['2. Description of the Application', 'LucidMSK is an AI-assisted platform designed to support musculoskeletal (MSK) radiology reporting and reference. The Application is intended to assist fellowship-trained radiologists and qualified medical professionals in the drafting, structuring, and referencing of radiology reports. LucidMSK utilizes artificial intelligence to provide decision support, reference material, and reporting assistance.\n\nThe Application is provided as a professional reference and drafting tool only. It does not constitute the practice of medicine and is not a substitute for the independent clinical judgment of a licensed medical professional.'],
    ['3. Intended Users', 'The Application is intended for use exclusively by licensed medical professionals, including but not limited to radiologists, physicians, and other qualified healthcare providers. By using the Application, you represent and warrant that:\n\n• You are a licensed medical professional in good standing in your jurisdiction;\n• You have the training, qualifications, and licensure necessary to interpret and apply radiology reports and medical information;\n• You will use the Application only in connection with your professional duties and in compliance with all applicable laws and regulations.'],
    ['4. Educational and Assistive Purpose Only', 'ALL content, output, suggestions, draft reports, reference material, and information provided by the Application are for EDUCATIONAL AND ASSISTIVE PURPOSES ONLY. The Application is a drafting and reference aid — not a diagnostic tool, not a clinical decision-making system, and not a replacement for independent professional judgment.\n\nLucidMSK AI-generated content:\n• May contain errors, omissions, or inaccuracies;\n• Has not been reviewed or approved by the FDA or any regulatory authority as a medical device;\n• Does not constitute a final radiology report or medical opinion;\n• Must be independently reviewed, verified, and approved by the licensed medical professional before use in any clinical context.'],
    ['5. User Responsibility and Assumption of Risk', 'YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT YOUR USE OF THE APPLICATION IS AT YOUR SOLE RISK. As a licensed medical professional, you bear full and exclusive responsibility for:\n\n• All clinical decisions, diagnoses, interpretations, and medical opinions you make in connection with your use of the Application;\n• The accuracy, completeness, and appropriateness of any radiology report or medical documentation you produce, whether or not assisted by the Application;\n• Independently verifying all Application output before relying upon it in any clinical context;\n• Compliance with all applicable professional standards, institutional policies, and legal requirements;\n• Patient safety and the standard of care owed to your patients.\n\nThe Application is a tool to assist your professional judgment — it does not replace it.'],
    ['6. Disclaimer of Warranties', 'THE APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, LUCIDMSK AND ITS OWNERS, DEVELOPERS, EMPLOYEES, AGENTS, AND AFFILIATES ("LUCIDMSK PARTIES") EXPRESSLY DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:\n\n• Any implied warranty of merchantability, fitness for a particular purpose, or non-infringement;\n• Any warranty that the Application will be uninterrupted, error-free, or free of viruses;\n• Any warranty regarding the accuracy, reliability, or completeness of any Application output;\n• Any warranty that the Application is suitable for clinical, diagnostic, or therapeutic use.'],
    ['7. Limitation of Liability and Release', 'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, YOU AGREE THAT THE LUCIDMSK PARTIES SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF THE APPLICATION, INCLUDING BUT NOT LIMITED TO:\n\n• Any harm to patients or third parties arising from clinical decisions made with or without reference to the Application;\n• Any errors, inaccuracies, or omissions in Application output;\n• Any loss of data, revenue, reputation, or professional standing.\n\nTHIS LIMITATION APPLIES REGARDLESS OF THE THEORY OF LIABILITY AND EVEN IF LUCIDMSK HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.'],
    ['8. Indemnification and Waiver of Claims', "By using the Application, you agree to indemnify, defend, and hold harmless the LucidMSK Parties from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable attorneys' fees) arising out of or in any way connected with your use of the Application, any clinical decision you make in connection with the Application, your violation of these Terms, or any claim by a patient, employer, insurer, or third party.\n\nYOU EXPRESSLY WAIVE ANY AND ALL CLAIMS AND RIGHTS TO BRING LEGAL ACTION OF ANY KIND AGAINST THE LUCIDMSK PARTIES ARISING FROM OR RELATED TO YOUR USE OF THE APPLICATION."],
    ['9. No Doctor-Patient Relationship', 'Use of the Application does not create a doctor-patient relationship or any other professional-client relationship between the User and LucidMSK or its owners, developers, or employees. LucidMSK is not a licensed healthcare provider and does not provide medical advice, diagnosis, or treatment.'],
    ['10. Privacy, Data, and Prohibition on PHI', '10.1 Prohibition on PHI Input. YOU ARE STRICTLY PROHIBITED from entering, uploading, transmitting, or otherwise providing any Protected Health Information ("PHI") or Personally Identifiable Information ("PII") — as defined under HIPAA and its implementing regulations — into the Application. You agree to de-identify all patient information in accordance with HIPAA Safe Harbor or Expert Determination standards before using any patient-related information in connection with the Application.\n\n10.2 No Liability for Inadvertently Provided PHI. LucidMSK is not designed, intended, or approved as a HIPAA-compliant platform and does not function as a Business Associate under HIPAA. TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE LUCIDMSK PARTIES SHALL HAVE NO LIABILITY WHATSOEVER FOR ANY PHI OR PII THAT IS INADVERTENTLY, ACCIDENTALLY, OR OTHERWISE PROVIDED TO THE APPLICATION BY ANY USER. Any such disclosure is entirely the responsibility of the User who provided it.\n\n10.3 Your Compliance Responsibility. You are solely responsible for ensuring your use of the Application complies with all applicable privacy laws and regulations, including HIPAA, HITECH, and state privacy laws.'],
    ['11. Modifications to Terms', 'LucidMSK reserves the right to modify these Terms at any time. Updated Terms will be posted within the Application. Your continued use of the Application following the posting of updated Terms constitutes your acceptance of the revised Terms.'],
    ['12. Governing Law', 'These Terms shall be governed by and construed in accordance with the laws of the State of Georgia, United States of America, without regard to its conflict of law provisions. Any dispute arising under these Terms shall be subject to the exclusive jurisdiction of the state and federal courts located in Georgia.'],
    ['13. Severability', 'If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect and enforceable.'],
    ['14. Entire Agreement', 'These Terms constitute the entire agreement between you and LucidMSK with respect to the subject matter herein and supersede all prior or contemporaneous agreements, representations, warranties, and understandings.'],
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #1a0a2e 100%)',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
          <svg width="48" height="48" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="36" cy="36" r="33" stroke="#1a3a6b" strokeWidth="1.2"/>
            <rect x="32" y="18" width="8" height="36" rx="4" fill="#5b9ef7" opacity="0.08"/>
            <line x1="36" y1="14" x2="20" y2="28" stroke="#4a90d9" strokeWidth="0.9"/>
            <line x1="36" y1="14" x2="52" y2="28" stroke="#4a90d9" strokeWidth="0.9"/>
            <line x1="20" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <line x1="52" y1="28" x2="36" y2="36" stroke="#5b9ef7" strokeWidth="1"/>
            <circle cx="36" cy="14" r="3.2" fill="#5b9ef7"/>
            <circle cx="36" cy="36" r="3.8" fill="#90caf9"/>
            <circle cx="36" cy="58" r="3.2" fill="#5b9ef7"/>
          </svg>
          <div>
            <div style={{ color: '#e0eaff', fontWeight: 700, fontSize: 28, letterSpacing: '2px', lineHeight: 1 }}>
              Lucid<span style={{ color: '#5b9ef7' }}>MSK</span>
            </div>
            <div style={{ color: '#3a6aaa', fontSize: 11, letterSpacing: '3px', textTransform: 'uppercase', marginTop: 4 }}>
              Terms of Use
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '32px 36px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>Terms of Use Agreement</h1>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Effective Date: May 30, 2026</span>
          </div>

          {sections.map(([title, body]) => (
            <div key={title} style={{ marginBottom: 24 }}>
              <h2 style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{title}</h2>
              {body.split('\n\n').map((para, i) => (
                <p key={i} style={{ margin: '0 0 10px', color: 'rgba(255,255,255,0.62)', fontSize: 13.5, lineHeight: 1.75, whiteSpace: 'pre-line' }}>{para}</p>
              ))}
            </div>
          ))}

          {/* Acknowledgment box */}
          <div style={{ marginTop: 32, padding: '16px 18px', background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 10 }}>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1.65 }}>
              USER ACKNOWLEDGMENT: BY CLICKING "I AGREE," CREATING AN ACCOUNT, OR USING THE LUCIDMSK APPLICATION, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF USE IN THEIR ENTIRETY. YOU ACKNOWLEDGE THAT YOU ARE A LICENSED MEDICAL PROFESSIONAL AND THAT YOU ARE SOLELY RESPONSIBLE FOR ALL CLINICAL DECISIONS YOU MAKE IN CONNECTION WITH YOUR USE OF THIS APPLICATION.
            </p>
          </div>

          {/* Back link */}
          <div style={{ marginTop: 28, textAlign: 'center' }}>
            <a href="/" style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none' }}>
              ← Return to LucidMSK
            </a>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 24 }}>
          © 2026 LucidMSK. All rights reserved.
        </p>
      </div>
    </div>
  );
}
