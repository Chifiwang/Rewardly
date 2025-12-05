import "@/App.css";

export function FooterLogged() {
  return (
    <footer className="app-footer footer-logged flex-shrink-0">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-pill">Rewardly OS</span>
          <h3>Need help?</h3>
          <p>Visit Help Center or open Documentation to get unstuck fast.</p>
        </div>
        <div className="footer-columns compact">
          <div>
            <h4>Shortcuts</h4>
            <nav aria-label="Shortcuts">
              <a href="/qr">My QR</a>
              <a href="/transfer">Transfer</a>
              <a href="/promotions">Promotions</a>
              <a href="/transactions">Transactions</a>
              <a href="/calendar">Calendar</a>
            </nav>
          </div>
          <div>
            <h4>Support</h4>
            <nav aria-label="Support">
              <a href="/help">Help center</a>
              <a href="/docs">Documentation</a>
              <a href="/status">API status</a>
            </nav>
          </div>
        </div>
        <div className="footer-minimal">
          <span>© 2025 Rewardly</span>
        </div>
      </div>
    </footer>
  )
}
