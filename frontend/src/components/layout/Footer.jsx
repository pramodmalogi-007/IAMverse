import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import "../../styles/footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Link to="/" className="site-footer__logo">
            <img src={logo} alt="IAMverse" className="site-footer__logo-img" />
            <span>IAMverse</span>
          </Link>
          <p className="site-footer__text">
            Identity security and access governance for modern enterprises.
          </p>
          <p className="site-footer__trust">
            Secure access. Risk visibility. Actionable recommendations.
          </p>
          {/* LinkedIn icon */}
          <a
            href="https://www.linkedin.com/company/identityrays"
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__social"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
        </div>

        <div className="site-footer__links">
          <nav className="site-footer__column" aria-label="Product">
            <h3>Product</h3>
            <Link to="/">Home</Link>
            <Link to="/assessment">Assessment</Link>
            <Link to="/recommendations">Recommendations</Link>
          </nav>

          <nav className="site-footer__column" aria-label="Account">
            <h3>Account</h3>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
            <Link to="/forgot-password">Forgot Password</Link>
          </nav>

          <nav className="site-footer__column" aria-label="Contact Us">
            <h3>Contact Us</h3>
            <span>R C Nagar, Dharwad 580001</span>
            <span>Karnataka, India</span>
            <a href="tel:+919923153642">+91 99231 53642</a>
            <a href="mailto:raghu.honawad@identityrays.com">raghu.honawad@identityrays.com</a>
          </nav>

          <nav className="site-footer__column" aria-label="Legal">
            <h3>Legal</h3>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/security">Security</Link>
          </nav>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>&copy; 2026 IAMverse. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;