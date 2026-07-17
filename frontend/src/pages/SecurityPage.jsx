import "../styles/legal.css";

function SecurityPage() {
  return (
    <div className="legal-root">
      <header className="legal-hero">
        <span className="legal-hero-icon">🛡️</span>
        <div className="legal-hero-badge">Security</div>
        <h1>Security at <span>IAMverse</span></h1>
        <p>
          Security is at the core of everything we build. Learn about
          the measures we take to protect your data and our platform.
        </p>
        <span className="legal-hero-date">Last updated: July 7, 2026</span>
      </header>

      <div className="legal-content">
        <div className="legal-section">
          <h2><span className="legal-section-icon">🏗️</span> Our Security Philosophy</h2>
          <p>
            As an Identity &amp; Access Management advisory platform, we hold
            ourselves to the highest security standards. We understand that our
            users trust us with sensitive organisational data, and we take that
            responsibility seriously.
          </p>
          <p>
            Our security practices are built on the principles of defence in
            depth, least privilege, and continuous improvement.
          </p>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">🔐</span> Security Measures</h2>
          <div className="legal-info-grid">
            <div className="legal-info-item">
              <span className="info-icon">🔒</span>
              <h4>Encryption in Transit</h4>
              <p>All data transmitted between your browser and our servers is encrypted using TLS 1.2+ (HTTPS).</p>
            </div>
            <div className="legal-info-item">
              <span className="info-icon">🗄️</span>
              <h4>Encryption at Rest</h4>
              <p>Sensitive data stored in our databases is encrypted using industry-standard AES-256 encryption.</p>
            </div>
            <div className="legal-info-item">
              <span className="info-icon">🔑</span>
              <h4>Authentication</h4>
              <p>User authentication is handled via Firebase Authentication with secure token-based session management.</p>
            </div>
            <div className="legal-info-item">
              <span className="info-icon">🧱</span>
              <h4>Access Controls</h4>
              <p>Role-based access controls ensure admin and user functions are strictly separated and audited.</p>
            </div>
            <div className="legal-info-item">
              <span className="info-icon">📝</span>
              <h4>Audit Logging</h4>
              <p>All authentication events and administrative actions are logged for monitoring and forensics.</p>
            </div>
            <div className="legal-info-item">
              <span className="info-icon">🛡️</span>
              <h4>Input Validation</h4>
              <p>All user inputs are validated and sanitised server-side to prevent injection and XSS attacks.</p>
            </div>
          </div>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">🏛️</span> Infrastructure Security</h2>
          <ul>
            <li>Application hosted on secure cloud infrastructure with automated scaling</li>
            <li>Regular security patches and dependency updates</li>
            <li>Network segmentation between public-facing and internal services</li>
            <li>Automated backups with encrypted storage</li>
            <li>DDoS protection and rate limiting on all API endpoints</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">🔄</span> Security Practices</h2>
          <ul>
            <li>Secure development lifecycle (SDLC) with code reviews</li>
            <li>Dependency vulnerability scanning via automated tools</li>
            <li>Principle of least privilege for all service accounts</li>
            <li>Password hashing using bcrypt with salt rounds</li>
            <li>JWT tokens with short expiry and secure rotation</li>
            <li>CORS policy restricting cross-origin requests</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">📢</span> Responsible Disclosure</h2>
          <p>
            We appreciate the security research community&apos;s efforts in helping
            keep IAMverse safe. If you discover a security vulnerability,
            please report it responsibly:
          </p>
          <div className="legal-card">
            <h3>How to Report</h3>
            <p>
              Email us at{" "}
              <a href="mailto:raghu.honawad@identityrays.com" style={{ color: "#818cf8", textDecoration: "none" }}>
                raghu.honawad@identityrays.com
              </a>{" "}
              with a detailed description of the vulnerability. Please include
              steps to reproduce and any relevant screenshots. We aim to
              acknowledge reports within 48 hours.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">📅</span> Incident Response</h2>
          <p>
            In the event of a security incident, our response plan includes:
          </p>
          <ul>
            <li>Immediate containment and assessment of the incident scope</li>
            <li>Notification to affected users within 72 hours of confirmed breach</li>
            <li>Root cause analysis and remediation</li>
            <li>Post-incident review and security improvements</li>
            <li>Cooperation with relevant authorities as required by law</li>
          </ul>
        </div>

        <div className="legal-contact">
          <h3>Security Concerns?</h3>
          <p>
            Reach out to us at{" "}
            <a href="mailto:raghu.honawad@identityrays.com">
              raghu.honawad@identityrays.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SecurityPage;
