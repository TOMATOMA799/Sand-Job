import React, { useState } from "react";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const bg             = '#121214';
  const cardBg          = '#1a191e';
  const fg              = '#ffffff';
  const subFg           = '#9ca3af';
  const borderCol       = '#333336';
  const inputBg         = '#232326';
  const errorBg         = '#2a1515';
  const errorBorder     = '#7f1d1d';
  const errorText       = '#f87171';

  const isFormValid = username.trim().length > 0 && password.length > 0;

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: `1px solid ${borderCol}`,
    borderRadius: '6px',
    background: inputBg,
    color: fg,
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    color: fg,
    marginBottom: '6px',
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      setErrorMessage("Please enter your username and password");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('authToken', data.token);
        window.location.href = '/';
      } else {
        setErrorMessage(data.message || "Invalid username or password");
      }
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '32px', background: cardBg, borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, textAlign: 'center', marginBottom: '4px', color: fg }}>Sign In</h2>
        <p style={{ fontSize: '14px', textAlign: 'center', marginBottom: '20px', color: subFg }}>hello :D</p>

        {errorMessage && (
          <div style={{ marginBottom: '16px', padding: '12px', background: errorBg, border: `1px solid ${errorBorder}`, borderRadius: '6px' }}>
            <p style={{ color: errorText, fontSize: '14px' }}>{errorMessage}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrorMessage(""); }}
              onKeyDown={handleKeyDown}
              style={inputStyle}
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(""); }}
                onKeyDown={handleKeyDown}
                style={{ ...inputStyle, paddingRight: '80px' }}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#60a5fa' }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: 'none',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '14px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              background: isSubmitting ? '#4b5563' : '#5865f2',
              transition: 'background 0.2s ease',
            }}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
