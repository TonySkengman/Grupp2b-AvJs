export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2>Grupp2b</h2>
          <p>Kvalitetsprodukter till bra priser.</p>
        </div>

        <div className="footer-section">
          <h3>Kundservice</h3>
          <ul>
            <li><a href="/">Kontakt</a></li>
            <li><a href="/">Leverans</a></li>
            <li><a href="/">Retur & reklamation</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Följ oss</h3>
          <div className="social-links">
            <a href="/">Instagram</a>
            <a href="/">Facebook</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Grupp2b. Alla rättigheter förbehållna.
      </div>
    </footer>
  );
}
