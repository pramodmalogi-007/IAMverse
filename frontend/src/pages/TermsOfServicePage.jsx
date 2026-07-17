import "../styles/legal.css";

function TermsOfServicePage() {
  return (
    <div className="legal-root">
      <header className="legal-hero">
        <span className="legal-hero-icon">📜</span>
        <div className="legal-hero-badge">Legal Document</div>
        <h1>Terms of <span>Service</span></h1>
        <p>
          Please read these terms carefully before using the IAMverse platform.
          By using our services, you agree to be bound by these terms.
        </p>
        <span className="legal-hero-date">Last updated: July 7, 2026</span>
      </header>

      <div className="legal-content">
        <div className="legal-section">
          <h2><span className="legal-section-icon">📋</span> Acceptance of Terms</h2>
          <p>
            By accessing or using IAMverse (&quot;the Platform&quot;), you agree
            to comply with and be bound by these Terms of Service. If you
            disagree with any part of these terms, you may not access or use
            our services.
          </p>
          <p>
            We reserve the right to modify these terms at any time. Changes
            will be posted on this page with an updated revision date.
            Continued use of the platform after changes constitutes acceptance
            of the revised terms.
          </p>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">💡</span> Description of Services</h2>
          <p>
            IAMverse provides an Identity &amp; Access Management needs
            assessment platform that:
          </p>
          <ul>
            <li>Presents a comprehensive questionnaire covering 11 IAM capability areas</li>
            <li>Analyses your responses using a weighted scoring algorithm</li>
            <li>Generates personalised product recommendations from leading IAM vendors</li>
            <li>Provides executive-level strategy reports and capability ratings</li>
          </ul>
          <div className="legal-card">
            <h3>Advisory Nature</h3>
            <p>
              Our recommendations are advisory in nature and based on the
              information you provide. They do not constitute professional
              consulting advice. Final purchasing and implementation decisions
              should involve your organisation&apos;s IT leadership and appropriate
              vendor evaluation processes.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">👤</span> User Accounts</h2>
          <p>To access certain features, you must create an account. You agree to:</p>
          <ul>
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security and confidentiality of your login credentials</li>
            <li>Notify us immediately of any unauthorised use of your account</li>
            <li>Accept responsibility for all activities under your account</li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms or appear to be fraudulent.
          </p>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">🚫</span> Prohibited Conduct</h2>
          <p>When using the Platform, you agree not to:</p>
          <ul>
            <li>Use the service for any unlawful purpose or in violation of any applicable laws</li>
            <li>Attempt to reverse-engineer, decompile, or extract the scoring algorithms</li>
            <li>Interfere with or disrupt the platform&apos;s infrastructure or security</li>
            <li>Scrape, mine, or collect data from the platform without authorisation</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation</li>
            <li>Upload or transmit malicious code, viruses, or harmful content</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">©️</span> Intellectual Property</h2>
          <p>
            All content, features, algorithms, designs, trademarks, and
            technology on the IAMverse platform are owned by or licensed to us
            and are protected by intellectual property laws. You may not
            reproduce, distribute, or create derivative works without our
            express written permission.
          </p>
          <p>
            Your assessment responses remain your own. However, we may use
            anonymised and aggregated data for improving our algorithms and
            services.
          </p>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">⚠️</span> Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, IAMverse shall not be
            liable for any indirect, incidental, special, consequential, or
            punitive damages arising from your use of the platform, including
            but not limited to:
          </p>
          <ul>
            <li>Loss of data, profits, or business opportunities</li>
            <li>Decisions made based on our recommendations</li>
            <li>Service interruptions or technical failures</li>
            <li>Unauthorised access to your account due to credential compromise</li>
          </ul>
          <div className="legal-card">
            <h3>Disclaimer</h3>
            <p>
              The platform is provided &quot;as is&quot; and &quot;as available&quot; without
              warranties of any kind, whether express or implied, including
              warranties of merchantability, fitness for a particular purpose,
              or non-infringement.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2><span className="legal-section-icon">⚖️</span> Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of India. Any disputes arising under these terms shall be
            subject to the exclusive jurisdiction of the courts located in
            Dharwad, Karnataka, India.
          </p>
        </div>

        <div className="legal-contact">
          <h3>Questions About These Terms?</h3>
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

export default TermsOfServicePage;
