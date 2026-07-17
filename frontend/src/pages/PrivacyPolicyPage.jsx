import "../styles/legal.css";

function PrivacyPolicyPage() {
  return (
    <div className="legal-root">
      <header className="legal-hero">
        <span className="legal-hero-icon">🔒</span>
        <div className="legal-hero-badge">Legal Document</div>
        <h1>Privacy <span>Policy</span></h1>
        <p>
          We value your privacy. This policy explains how IAMverse collects,
          uses, and protects your personal data.
        </p>
        <span className="legal-hero-date">Last updated: July 7, 2026</span>
      </header>

      <div className="legal-content">
        <div className="legal-section">
          <h2><span className="legal-section-icon">📋</span> Introduction</h2>
          <p>
            IAMverse (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting
            your privacy. This Privacy Policy describes how we collect, use,
            disclose, and safeguard your information when you use our Identity
            &amp; Access Management assessment platform and related services.
          </p>
          <p>
            By accessing or using our platform, you agree to the practices
            described in this policy. If you do not agree with our policies,
            please do not use our services.
          </p>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">📊</span> Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Account information: name, email address, and password when you register</li>
            <li>Assessment responses: your answers to the IAM questionnaire</li>
            <li>Usage data: pages visited, features used, timestamps, and browser information</li>
            <li>Device data: IP address, device type, operating system, and browser type</li>
            <li>Communication data: any messages or inquiries you send to us</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">⚙️</span> How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li>To generate personalised IAM product recommendations based on your assessment</li>
            <li>To create and maintain your user account</li>
            <li>To improve our platform, algorithms, and user experience</li>
            <li>To communicate with you regarding your account or our services</li>
            <li>To detect, prevent, and address security issues or fraudulent activity</li>
            <li>To comply with legal obligations and enforce our terms</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">🤝</span> Data Sharing &amp; Disclosure</h2>
          <p>
            We do not sell your personal information. We may share data in limited circumstances:
          </p>
          <ul>
            <li>With service providers who assist in operating our platform (e.g., hosting, analytics)</li>
            <li>When required by law, regulation, or legal process</li>
            <li>To protect the rights, property, and safety of IAMverse and our users</li>
            <li>In connection with a merger, acquisition, or sale of assets (with prior notice)</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">🛡️</span> Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your
            data, including encryption in transit (TLS), secure authentication
            via Firebase, and access controls. However, no method of
            transmission over the internet is 100% secure.
          </p>
          <div className="legal-card">
            <h3>Your Assessment Data</h3>
            <p>
              Your questionnaire responses are processed server-side to generate
              recommendations and are stored securely. You can retake the
              assessment at any time which will overwrite previous responses.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">🍪</span> Cookies &amp; Local Storage</h2>
          <p>
            Our platform uses browser local storage to persist your session
            and assessment results for a smoother experience. We may also use
            cookies for authentication and analytics. You can configure your
            browser settings to manage cookies at any time.
          </p>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">✅</span> Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate or incomplete data</li>
            <li>Request deletion of your personal data</li>
            <li>Object to or restrict certain processing of your data</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p>
            To exercise any of these rights, please contact us using the
            details below.
          </p>
        </div>

        <div className="legal-contact">
          <h3>Questions About Your Privacy?</h3>
          <p>
            Contact us at{" "}
            <a href="mailto:raghu.honawad@identityrays.com">
              raghu.honawad@identityrays.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
