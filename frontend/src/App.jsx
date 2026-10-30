import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signup"); // "signup" or "login"
  const [serverOnline, setServerOnline] = useState(null);

  // Check backend server connection on mount
  useEffect(() => {
    async function checkServer() {
      try {
        const res = await fetch("http://localhost:5000/");
        if (res.ok) setServerOnline(true);
        else setServerOnline(false);
      } catch {
        setServerOnline(false);
      }
    }
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, []);

  // Compute live password strength
  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 1, label: "Weak (min 8 chars)", color: "#ef4444" };
    if (score === 2) return { score: 2, label: "Fair", color: "#f59e0b" };
    if (score === 3) return { score: 3, label: "Good", color: "#06b6d4" };
    return { score: 4, label: "Strong & Hardened", color: "#10b981" };
  };

  const strength = getPasswordStrength();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    if (!name.trim()) {
      setMessage("Full name is required.");
      setMessageType("error");
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage("Please enter a valid email address.");
      setMessageType("error");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setMessageType("error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Signup failed.");
        setMessageType("error");
        return;
      }

      setMessage(data.message || "Account created successfully!");
      setMessageType("success");
      setName("");
      setEmail("");
      setPassword("");
    } catch {
      setMessage("Cannot connect to server. Ensure Express backend is running on port 5000.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vault-layout">
      {/* Radiant Background Aura */}
      <div className="vault-glow glow-primary"></div>
      <div className="vault-glow glow-secondary"></div>

      <div className="vault-container">
        
        {/* Left Hero Protocol Showcase */}
        <div className="hero-showcase">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            <span>VAULT PROTOCOL v2.4</span>
          </div>

          <h1 className="hero-heading">
            Enterprise Identity & Secure Access Mesh.
          </h1>

          <p className="hero-lead">
            A full-stack authentication system engineered with modern React,
            Node.js, Express, and MongoDB. Securely stores user credentials with
            cryptographic salting and bcrypt hashing.
          </p>

          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon icon-indigo">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <div className="feature-text">
                <h3>Bcrypt Salted Hashing</h3>
                <p>10 rounds of cryptographic salting ensures passwords are never stored in plain text.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon icon-cyan">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
              </div>
              <div className="feature-text">
                <h3>Pre-flight Duplicate Guard</h3>
                <p>Automated uniqueness validation rejects redundant account creation with HTTP 409.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon icon-emerald">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <div className="feature-text">
                <h3>MongoDB Document Store</h3>
                <p>Mongoose schema persistence with automated lowercase indexing and timestamps.</p>
              </div>
            </div>
          </div>

          <div className="server-status-strip">
            <span className={`status-indicator ${serverOnline ? "online" : serverOnline === false ? "offline" : "checking"}`}></span>
            <span className="status-label">
              {serverOnline === true && "API Gateway Online (Port 5000)"}
              {serverOnline === false && "API Gateway Offline (Start node server.js)"}
              {serverOnline === null && "Connecting to API Gateway..."}
            </span>
          </div>
        </div>

        {/* Right Glassmorphic Auth Card */}
        <div className="auth-card-panel">
          <div className="auth-glass-card">
            
            {/* Form Header */}
            <div className="card-top">
              <div className="brand-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <h2 className="card-headline">{activeTab === "signup" ? "Get Started" : "Welcome Back"}</h2>
              <p className="card-subheadline">
                {activeTab === "signup"
                  ? "Sign up to register your account into MongoDB"
                  : "Sign in with your verified credentials"}
              </p>
            </div>

            {/* Segmented Switcher Tab */}
            <div className="tab-switcher">
              <button
                type="button"
                className={`tab-btn ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => { setActiveTab("signup"); setMessage(""); }}
              >
                Create Account
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === "login" ? "active" : ""}`}
                onClick={() => { setActiveTab("login"); setMessage(""); }}
              >
                Sign In
              </button>
            </div>

            {activeTab === "signup" ? (
              <form onSubmit={handleSubmit} className="auth-form" noValidate>
                {/* Full Name Field */}
                <div className="input-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </span>
                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Email Address Field */}
                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password Field with Show/Hide & Strength Meter */}
                <div className="input-group">
                  <div className="label-row">
                    <label htmlFor="password">Password</label>
                    <span className="label-hint">Min. 8 characters</span>
                  </div>
                  <div className="input-wrapper">
                    <span className="input-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create secure password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="strength-meter">
                      <div className="strength-bars">
                        <div className={`bar ${strength.score >= 1 ? "filled" : ""}`} style={{ backgroundColor: strength.score >= 1 ? strength.color : "" }}></div>
                        <div className={`bar ${strength.score >= 2 ? "filled" : ""}`} style={{ backgroundColor: strength.score >= 2 ? strength.color : "" }}></div>
                        <div className={`bar ${strength.score >= 3 ? "filled" : ""}`} style={{ backgroundColor: strength.score >= 3 ? strength.color : "" }}></div>
                        <div className={`bar ${strength.score >= 4 ? "filled" : ""}`} style={{ backgroundColor: strength.score >= 4 ? strength.color : "" }}></div>
                      </div>
                      <span className="strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                </div>

                {/* Submit Action Button */}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? (
                    <span className="btn-content">
                      <span className="spinner"></span>
                      <span>Creating Account...</span>
                    </span>
                  ) : (
                    <span className="btn-content">
                      <span>Join Us</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </span>
                  )}
                </button>
              </form>
            ) : (
              /* Interactive Mock Sign In Tab */
              <div className="login-preview">
                <div className="login-info-box">
                  <div className="info-icon">🔐</div>
                  <h3>Sign In Portal</h3>
                  <p>
                    Registered credentials in MongoDB are authenticated via bcrypt compare against hashed salt documents.
                  </p>
                </div>
                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => { setActiveTab("signup"); setMessage(""); }}
                >
                  Return to Registration Form
                </button>
              </div>
            )}

            {/* Dynamic Status Notification Alert */}
            {message && (
              <div className={`status-banner banner-${messageType}`} role="status">
                <span className="banner-icon">
                  {messageType === "success" ? "✓" : "!"}
                </span>
                <span className="banner-text">{message}</span>
              </div>
            )}

            {/* Login Link Footer */}
            <p className="login-text">
              {activeTab === "signup" ? (
                <>
                  Already have an account?{" "}
                  <strong onClick={() => { setActiveTab("login"); setMessage(""); }}>Log in</strong>
                </>
              ) : (
                <>
                  Need an account?{" "}
                  <strong onClick={() => { setActiveTab("signup"); setMessage(""); }}>Sign up</strong>
                </>
              )}
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
