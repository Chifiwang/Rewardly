import { ArrowRight, Mail, MapPin, Phone } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import "@/App.css";

export function Footer() {
  const productLinks = [
    { label: "Platform overview", href: "/#platform" },
    { label: "Role-based apps", href: "/#roles" },
    { label: "Payments & QR", href: "/#highlights" },
    { label: "Security", href: "/#highlights" },
  ]

  const companyLinks = [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Partners", href: "/partners" },
    { label: "Press", href: "/press" },
  ]

  const resources = [
    { label: "Help center", href: "/help" },
    { label: "Documentation", href: "/docs" },
    { label: "API status", href: "/status" },
  ]

  return (
    <footer className="app-footer" role="contentinfo" aria-label="Site footer">
      <div className="footer-top">
        <div className="footer-brand">
          <span className="footer-pill">Rewardly OS</span>
          <h3>Where loyal moments feel effortless.</h3>
          <p>
            Design customer journeys, empower teams, and monitor performance from a single command center engineered for
            modern brands.
          </p>
        </div>

        <div className="footer-columns">
          <div>
            <h4>Product</h4>
            <nav aria-label="Product">
              {productLinks.map((link) => (
                <Link key={link.label} to={link.href} aria-label={link.label}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div>
            <h4>Company</h4>
            <nav aria-label="Company">
              {companyLinks.map((link) => (
                <a key={link.label} href={link.href} aria-label={link.label}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div>
            <h4>Resources</h4>
            <nav aria-label="Resources">
              {resources.map((link) => (
                <a key={link.label} href={link.href} aria-label={link.label}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        <div className="footer-newsletter">
          <p>Stay in the loop</p>
          <h4>Product launches, case studies, and invites—monthly.</h4>
          <form className="footer-form" onSubmit={(event) => event.preventDefault()}>
            <div className="footer-input">
              <Input type="email" placeholder="you@brand.com" aria-label="Email address" required />
              <Button type="submit" aria-label="Subscribe to newsletter">
                Subscribe
                <ArrowRight aria-hidden />
              </Button>
            </div>
            <small>We’ll only email you twice a month. No fluff, just value.</small>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-contact">
          <span>
            <Mail aria-hidden />
            support@rewardly.app
          </span>
          <span>
            <Phone aria-hidden />
            +1 800 555 0100
          </span>
          <span>
            <MapPin aria-hidden />
            Toronto · Boston · Seattle
          </span>
        </div>
        <div className="footer-copy">
          <p>© 2025 Rewardly. From CSC309, with love.</p>
        </div>
      </div>
    </footer>
  )
}
