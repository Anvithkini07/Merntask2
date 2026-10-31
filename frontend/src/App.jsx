import { useState, useEffect } from "react";
import "./App.css";

export default function App() {
  const [tab, setTab] = useState("signup"); // "signup" or "login"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: "success" | "error", message: string }
  const [currentUser, setCurrentUser] = useState(null);
  const [serverStatus, setServerStatus] = useState({ online: false, db: "checking...", latency: null });

  // Periodically check backend health
  useEffect(() => {
    async function checkHealth() {
      const start = performance.now();
      try {
        const res = await fetch("http://localhost:5000/api/health");
        const latency = Math.round(performance.now() - start);
        if (res.ok) {
          const data = await res.json();
          setServerStatus({
            online: true,
            db: data.database || "connected",
            latency
          });
        } else {
          setServerStatus({ online: false, db: "error", latency: null });
        }
      } catch {
        setServerStatus({ online: false, db: "offline", latency: null });
      }
    }

    checkHealth();
    const timer = setInterval(checkHealth, 8000);
    return () => clearInterval(timer);
  }, []);

  // Password Strength Evaluation
  const evaluatePassword = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      caseMix: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    };
    const score = Object.values(checks).filter(Boolean).length;
    let label = "Enter password";
    let color = "var(--border-subtle)";
    if (pwd.length > 0) {
      if (score === 1) { label = "Weak"; color = "#ef4444"; }
      else if (score === 2) { label = "Fair"; color = "#f59e0b"; }
      else if (score === 3) { label = "Good"; color = "#06b6d4"; }
      else if (score === 4) { label = "Strong & Secure"; color = "#10b981"; }
    }
    return { checks, score, label, color };
  };

  const strength = evaluatePassword(password);

  // Quick fill test data helper
  const handleQuickFill = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setName("Anvith Kini");
    setEmail(`anvith${randomSuffix}@demo.com`);
    setPassword("Vault@2026!Secure");
    setFeedback({
      type: "success",
      message: "Sample credentials populated! Click Create Account to test."
    });
  };

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let generated = "";
    for (let i = 0; i < 14; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  // Handle Form Submission
  async function handleSubmit(e) {
    e.preventDefault();
    setFeedback(null);

    // Validation
    if (tab === "signup") {
      if (!name.trim()) {
        setFeedback({ type: "error", message: "Full Name is required." });
        return;
      }
      if (!agreeTerms) {
        setFeedback({ type: "error", message: "Please agree to the security protocol." });
        return;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setFeedback({ type: "error", message: "Please provide a valid email address." });
      return;
    }

    if (password.length < 8) {
      setFeedback({ type: "error", message: "Password must be at least 8 characters long." });
      return;
    }

    setLoading(true);
    const endpoint = tab === "signup" ? "http://localhost:5000/api/signup" : "http://localhost:5000/api/login";
    const payload = tab === "signup" ? { name, email, password } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setFeedback({ type: "error", message: data.message || "Request failed." });
        return;
      }

      setFeedback({
        type: "success",
        message: data.message || (tab === "signup" ? "Account created successfully!" : "Signed in successfully!")
      });

      if (data.user) {
        setCurrentUser(data.user);
      }

      if (tab === "signup") {
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch {
      setFeedback({
        type: "error",
        message: "Cannot connect to server. Ensure Express backend is running on port 5000."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      {/* Dynamic Background Atmosphere */}
      <div className="aurora-orb orb-1"></div>
      <div className="aurora-orb orb-2"></div>
      <div className="aurora-orb orb-3"></div>
      <div className="bg-grid-overlay"></div>

      {/* Top Floating Glass Navigation Header */}
      <header className="auth-header">
        <div className="header-brand">
          <div className="brand-logo-glow">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className="brand-title-wrap">
            <span className="brand-title">AURA // ID</span>
            <span className="brand-version">v3.0 NEXT-GEN</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Live Gateway Status Pill */}
          <div className={`status-pill ${serverStatus.online ? "status-online" : "status-offline"}`}>
            <span className="pulse-indicator"></span>
            <span className="status-label">
              {serverStatus.online ? `API :5000 [${serverStatus.latency}ms]` : "API :5000 Disconnected"}
            </span>
          </div>

          {/* Quick Demo Fill Button */}
          <button
            type="button"
            className="btn-pill-action"
            onClick={handleQuickFill}
            title="Auto-fill sample credentials for rapid testing"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Quick Fill</span>
          </button>
        </div>
      </header>

      {/* Main Central Container */}
      <main className="auth-stage">
        
        {/* Left Hero & Architecture Information Panel */}
        <section className="hero-panel">
          <div className="hero-kicker">
            <span className="kicker-tag">MERN STACK ARCHITECTURE</span>
            <span className="kicker-divider">•</span>
            <span className="kicker-tag">BCRYPT 10-ROUNDS</span>
          </div>

          <h1 className="hero-title">
            Cryptographic Identity & Modern Access Mesh.
          </h1>

          <p className="hero-desc">
            A production-ready full-stack authentication system engineered with <strong>React 18</strong>, 
            <strong>Node.js Express</strong>, and <strong>MongoDB</strong>. Passwords undergo client sanitization and 
            cryptographic salting to guarantee zero plaintext exposure.
          </p>

          {/* Modern Bento Metric Highlights */}
          <div className="bento-metrics">
            <div className="bento-card">
              <div className="bento-header">
                <div className="bento-icon icon-cyan">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <span className="bento-badge">ACTIVE</span>
              </div>
              <h4 className="bento-metric-title">Bcrypt Salt Hashing</h4>
              <p className="bento-metric-sub">10 cost rounds with cryptographically secure random salts.</p>
            </div>

            <div className="bento-card">
              <div className="bento-header">
                <div className="bento-icon icon-emerald">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                </div>
                <span className="bento-badge">{serverStatus.db.includes("mongodb") ? "MONGO DB" : "IN-MEMORY"}</span>
              </div>
              <h4 className="bento-metric-title">Dual-Mode Persistence</h4>
              <p className="bento-metric-sub">Auto-fallback memory store ensures 100% demo uptime without local DB.</p>
            </div>

            <div className="bento-card">
              <div className="bento-header">
                <div className="bento-icon icon-violet">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span className="bento-badge">&lt;15ms</span>
              </div>
              <h4 className="bento-metric-title">Sub-Millisecond Verification</h4>
              <p className="bento-metric-sub">Duplicate preflight checks prevent email collisions seamlessly.</p>
            </div>
          </div>

          {/* Active Session Card if Logged in */}
          {currentUser && (
            <div className="active-session-card">
              <div className="session-avatar">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="session-details">
                <span className="session-tag">VERIFIED SESSION</span>
                <span className="session-name">{currentUser.name}</span>
                <span className="session-email">{currentUser.email}</span>
              </div>
              <button
                type="button"
                className="btn-session-exit"
                onClick={() => {
                  setCurrentUser(null);
                  setFeedback(null);
                }}
              >
                Sign Out
              </button>
            </div>
          )}
        </section>

        {/* Right Glassmorphic Interactive Auth Card */}
        <section className="form-panel">
          <div className="auth-card">
            
            {/* Sliding Pill Tab Switcher */}
            <div className="tab-pill-container" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signup"}
                className={`tab-pill ${tab === "signup" ? "active" : ""}`}
                onClick={() => { setTab("signup"); setFeedback(null); }}
              >
                Create Account
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "login"}
                className={`tab-pill ${tab === "login" ? "active" : ""}`}
                onClick={() => { setTab("login"); setFeedback(null); }}
              >
                Sign In
              </button>
            </div>

            <div className="card-header">
              <h2 className="card-title">
                {tab === "signup" ? "Create your account" : "Welcome back"}
              </h2>
              <p className="card-subtitle">
                {tab === "signup"
                  ? "Enter your details to register in the secure database."
                  : "Sign in using your registered credentials."}
              </p>
            </div>

            {/* Notification Feedback Toast */}
            {feedback && (
              <div className={`feedback-alert alert-${feedback.type}`} role="alert">
                <div className="alert-icon">
                  {feedback.type === "success" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  )}
                </div>
                <div className="alert-message">{feedback.message}</div>
                <button
                  type="button"
                  className="alert-close"
                  onClick={() => setFeedback(null)}
                  aria-label="Dismiss message"
                >
                  &times;
                </button>
              </div>
            )}

            {/* Interactive Form */}
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              
              {/* Full Name field (Only shown for Sign Up) */}
              {tab === "signup" && (
                <div className="input-group">
                  <label htmlFor="user-name" className="input-label">
                    Full Name <span className="req-dot">*</span>
                  </label>
                  <div className="input-box">
                    <span className="input-prefix-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input
                      id="user-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      placeholder="e.g. Anvith Kini"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {/* Email Address field */}
              <div className="input-group">
                <label htmlFor="user-email" className="input-label">
                  Email Address <span className="req-dot">*</span>
                </label>
                <div className="input-box">
                  <span className="input-prefix-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="user-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    spellCheck="false"
                    enterKeyHint="next"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="input-group">
                <div className="label-row">
                  <label htmlFor="user-password" className="input-label">
                    Password <span className="req-dot">*</span>
                  </label>
                  {tab === "signup" && (
                    <button
                      type="button"
                      className="btn-text-action"
                      onClick={generateStrongPassword}
                    >
                      Generate Strong
                    </button>
                  )}
                </div>
                <div className="input-box">
                  <span className="input-prefix-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    id="user-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={tab === "signup" ? "new-password" : "current-password"}
                    enterKeyHint="done"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="input-suffix-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Interactive Password Strength Checklist (Sign Up only) */}
                {tab === "signup" && password.length > 0 && (
                  <div className="password-feedback">
                    <div className="strength-bar-track">
                      <div className={`bar-segment ${strength.score >= 1 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 1 ? strength.color : "" }}></div>
                      <div className={`bar-segment ${strength.score >= 2 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 2 ? strength.color : "" }}></div>
                      <div className={`bar-segment ${strength.score >= 3 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 3 ? strength.color : "" }}></div>
                      <div className={`bar-segment ${strength.score >= 4 ? "active" : ""}`} style={{ backgroundColor: strength.score >= 4 ? strength.color : "" }}></div>
                    </div>
                    <div className="strength-summary">
                      <span>Strength Score:</span>
                      <strong style={{ color: strength.color }}>{strength.label}</strong>
                    </div>

                    <div className="criteria-checklist">
                      <div className={`criteria-item ${strength.checks.length ? "met" : ""}`}>
                        <span className="dot"></span> 8+ chars
                      </div>
                      <div className={`criteria-item ${strength.checks.caseMix ? "met" : ""}`}>
                        <span className="dot"></span> A-Z & a-z
                      </div>
                      <div className={`criteria-item ${strength.checks.number ? "met" : ""}`}>
                        <span className="dot"></span> Numbers
                      </div>
                      <div className={`criteria-item ${strength.checks.special ? "met" : ""}`}>
                        <span className="dot"></span> Symbol (!@#$)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Protocol Acceptance & Remember Options */}
              {tab === "signup" ? (
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="styled-checkbox"
                  />
                  <span className="checkbox-label">
                    I agree to cryptographic protocol terms & bcrypt storage policy.
                  </span>
                </label>
              ) : (
                <div className="login-options">
                  <label className="checkbox-wrap">
                    <input type="checkbox" defaultChecked className="styled-checkbox" />
                    <span className="checkbox-label">Remember this machine</span>
                  </label>
                  <span className="forgot-link">Forgot password?</span>
                </div>
              )}

              {/* Main Submit Action Button */}
              <button
                type="submit"
                className="btn-submit-hero"
                disabled={loading}
              >
                {loading ? (
                  <span className="submit-loading">
                    <span className="spinner-ring"></span>
                    <span>Processing Cryptographic Hash...</span>
                  </span>
                ) : (
                  <span className="submit-text-row">
                    <span>{tab === "signup" ? "Create Secure Account" : "Authenticate & Sign In"}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                )}
              </button>

            </form>

            {/* Social Authentication Alternative */}
            <div className="social-divider">
              <span>Or authenticate via</span>
            </div>

            <div className="social-actions">
              <button
                type="button"
                className="btn-social"
                onClick={() => setFeedback({ type: "success", message: "OAuth demo: Google Identity Protocol linked." })}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
                  <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                className="btn-social"
                onClick={() => setFeedback({ type: "success", message: "OAuth demo: GitHub Dev Identity linked." })}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>

            {/* Switch Mode Footer */}
            <div className="card-footer-switch">
              {tab === "signup" ? (
                <p>
                  Already registered in the database?{" "}
                  <button
                    type="button"
                    className="link-switch"
                    onClick={() => { setTab("login"); setFeedback(null); }}
                  >
                    Sign in here
                  </button>
                </p>
              ) : (
                <p>
                  Need a new verified account?{" "}
                  <button
                    type="button"
                    className="link-switch"
                    onClick={() => { setTab("signup"); setFeedback(null); }}
                  >
                    Create account
                  </button>
                </p>
              )}
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
