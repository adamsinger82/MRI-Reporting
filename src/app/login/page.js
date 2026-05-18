"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const login = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/dashboard");
    router.refresh();
  };

  const S = {
    wrap:  { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0d1117", fontFamily:"system-ui,sans-serif" },
    box:   { background:"#161b22", border:"1px solid #30363d", borderRadius:12, padding:"36px 32px", width:"100%", maxWidth:380 },
    logo:  { display:"flex", alignItems:"center", gap:10, marginBottom:28 },
    logoI: { width:32, height:32, background:"#1f6feb", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 },
    h1:    { color:"#e6edf3", fontSize:20, fontWeight:700, margin:0 },
    sub:   { color:"#8b949e", fontSize:13, marginTop:4 },
    lbl:   { display:"block", fontSize:12, color:"#8b949e", fontWeight:500, marginBottom:5 },
    inp:   { width:"100%", background:"#1c2128", border:"1px solid #30363d", borderRadius:7, color:"#e6edf3", fontSize:14, padding:"9px 11px", fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
    fg:    { marginBottom:16 },
    btn:   { width:"100%", background:"#1f6feb", border:"none", borderRadius:8, color:"white", fontSize:14, fontWeight:600, padding:"11px", cursor:"pointer", fontFamily:"inherit", marginTop:8 },
    err:   { background:"rgba(248,81,73,0.1)", border:"1px solid rgba(248,81,73,0.3)", borderRadius:7, color:"#f85149", fontSize:13, padding:"9px 12px", marginBottom:16 },
  };

  return (
    <div style={S.wrap}>
      <div style={S.box}>
        <div style={S.logo}>
          <div style={S.logoI}>🩻</div>
          <div>
            <div style={S.h1}>MSK MRI Reports</div>
            <div style={S.sub}>Sign in to your account</div>
          </div>
        </div>
        {error && <div style={S.err}>{error}</div>}
        <form onSubmit={login}>
          <div style={S.fg}>
            <label style={S.lbl}>Email</label>
            <input style={S.inp} type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div style={S.fg}>
            <label style={S.lbl}>Password</label>
            <input style={S.inp} type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button style={S.btn} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div style={{ marginTop:20, fontSize:12, color:"#6e7681", textAlign:"center" }}>
          Contact your administrator to create an account.
        </div>
      </div>
    </div>
  );
}
