import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react"
import { RevealOnScroll } from "@/components/reveal"
import CountUp from "@/components/countup"
import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

import "./hero.css"

const stats = [
  { label: "Active members", value: "12k+" },
  { label: "Daily redemptions", value: "480" },
  { label: "Events automated", value: "58" },
]

const rolePanels = [
  {
    title: "Members",
    description:
      "View balances, access QR codes, request redemptions, transfer points, and browse curated promotions.",
    actions: ["Points dashboard", "Transfer & redemption", "Events RSVP"],
  },
  {
    title: "Cashiers",
    description:
      "Create transactions in seconds, apply promotions confidently, and finalize redemption requests without QR scanners.",
    actions: ["Guided purchase flows", "Manual redemption lookup"],
  },
  {
    title: "Managers & Superusers",
    description:
      "Audit users, mark suspicious activity, publish events & promos, and award points from a single command center.",
    actions: ["User + transaction controls", "Promotion & event studios"],
  },
]

const highlights = [
  {
    title: "QR-first journeys",
    detail:
      "Generate persistent QR codes for members, cashiers, and redemption requests so any touchpoint can scan and go.",
  },
  {
    title: "Infinite, filterable lists",
    detail:
      "Transactions, events, promotions, and users all ship with search, ordering, pagination, and deep-linking by default.",
  },
  {
    title: "Deployment ready",
    detail:
      "Secure API gateways, observability hooks, and cloud-friendly configs make rollout and monitoring straightforward.",
  },
]

const stories = [
  {
    quote:
      "Switching from manager to cashier mode is seamless. The nav remembers where I left off in each context.",
    author: "Joy, Store Manager",
  },
  {
    quote:
      "Event RSVPs are no longer spreadsheets. I can add organizers, award points, and notify guests instantly.",
    author: "Theo, Event Producer",
  },
]

export function Hero() {
  const location = useLocation()

  useEffect(() => {
    const scrollToHash = (hash) => {
      if (!hash) return
      const el = document.querySelector(hash)
      if (!el) return
      const nav = document.querySelector(".app-navbar")
      const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0
      const extra = 12 // extra spacing under navbar
      const top = window.scrollY + el.getBoundingClientRect().top - navHeight - extra
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
    }

    const handleSmoothScroll = (event) => {
      const anchor = event.target.closest && event.target.closest("a")
      if (anchor && anchor.hash) {
        event.preventDefault()
        scrollToHash(anchor.hash)
      }
    }

    document.addEventListener("click", handleSmoothScroll)

    return () => {
      document.removeEventListener("click", handleSmoothScroll)
    }
  }, [])

  // When navigated to with a hash (for example from navbar links), scroll smoothly.
  useEffect(() => {
    if (location && location.hash) {
      const el = document.querySelector(location.hash)
      if (el) {
        const nav = document.querySelector(".app-navbar")
        const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0
        const extra = 12
        setTimeout(() => {
          const top = window.scrollY + el.getBoundingClientRect().top - navHeight - extra
          window.scrollTo({ top: Math.max(0, top), behavior: "smooth" })
        }, 60)
      }
    }
  }, [location.hash])

  return (
    <div className="hero" role="main" aria-label="Rewardly landing page">
      <RevealOnScroll>
        <section className="hero__section" id="platform">
          <div className="hero__copy">
          <p className="eyebrow">
            <Sparkles aria-hidden />
            Loyalty operating system
          </p>
          <h1>
            Orchestrate every reward interaction from one command center.
          </h1>
          <p className="subtitle">
            Give members, cashiers, and managers the tools they need to earn, redeem, and supervise points in real time—
            from QR journeys to promotion launches and event RSVPs.
          </p>
          <div className="hero__actions">
            <Link to="/request-demo" className="primary" aria-label="Get started instantly">
              Get started instantly
              <ArrowRight aria-hidden />
            </Link>
            <a href="#highlights" className="secondary">
              See how it works
            </a>
          </div>
          <dl className="hero__stats">
            {stats.map((item) => {
              // parse value strings like "12k+" or "480"
              const raw = String(item.value)
              if (raw.toLowerCase().includes("k")) {
                const num = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0
                return (
                  <div key={item.label}>
                    <dt>
                      <CountUp end={num} suffix="k+" className="stat-number" />
                    </dt>
                    <dd>{item.label}</dd>
                  </div>
                )
              }

              const n = parseInt(raw.replace(/[^0-9]/g, "")) || 0
              return (
                <div key={item.label}>
                  <dt>
                    <CountUp end={n} className="stat-number" />
                  </dt>
                  <dd>{item.label}</dd>
                </div>
              )
            })}
          </dl>
          </div>
          <div className="hero__panel">
            <div className="panel-card">
              <div className="panel-header">
                <h2>Ops snapshot</h2>
                <p>Live insights your service teams rely on.</p>
              </div>
              <ul>
                <li>
                  <CheckCircle2 aria-hidden />
                  4 redemption requests awaiting cashier review.
                </li>
                <li>
                  <CheckCircle2 aria-hidden />
                  2 promotions expiring this week with auto alerts.
                </li>
                <li>
                  <CheckCircle2 aria-hidden />
                  8 events collecting RSVPs in the next 48 hours.
                </li>
                <li>
                  <CheckCircle2 aria-hidden />
                  Financial ledger synced with adjustment history.
                </li>
              </ul>
            </div>
            <div className="panel-card muted">
              <p>
                <strong>Why service teams choose us</strong>
              </p>
              <p>
                Role switching, QR routing, and paginated work queues stay visible at the top of the experience so teams
                can demo, train, and launch faster.
              </p>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="hero__roles" id="roles">
        <div className="roles-header">
          <h2>Role-based journeys</h2>
          <p>
            Every persona gets its own curated workspace with short cuts to the tasks they handle dozens of times a day.
          </p>
        </div>
        <div className="role-grid">
          {rolePanels.map((role) => (
            <article key={role.title} className="role-card">
              <header>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
              </header>
              <ul>
                {role.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="hero__highlights" id="highlights">
        <div className="highlights-header">
          <h2>Product highlights</h2>
          <p>
            Built to move from pilot to production: modular APIs, responsive dashboards, and observability baked in for
            both business and engineering stakeholders.
          </p>
        </div>
        <div className="highlight-grid">
          {highlights.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="hero__stories" id="stories">
        <div className="stories-header">
          <p className="eyebrow">Testimonials from loyalty leaders</p>
          <h2>Teams love how quickly they can deploy and scale.</h2>
        </div>
        <div className="stories-grid">
          {stories.map((story) => (
            <blockquote key={story.author}>
              <p>{story.quote}</p>
              <cite>{story.author}</cite>
            </blockquote>
          ))}
        </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="hero__cta" id="demo">
        <div>
          <p className="eyebrow">Ready to launch</p>
          <h2>Deploy your loyalty hub, invite your team, delight customers.</h2>
          <p>
            Roll out branded member experiences, empower in-store teammates, and keep leadership informed with the same
            stack—no custom dev shop required.
          </p>
        </div>
        <div className="cta-actions">
          <Link to="/request-demo" className="primary" aria-label="Book onboarding">
            Book onboarding
            <ArrowRight aria-hidden />
          </Link>
          <a href="#platform" className="secondary" aria-label="Explore platform">Explore platform</a>
        </div>
        </section>
      </RevealOnScroll>
    </div>
  )
}
