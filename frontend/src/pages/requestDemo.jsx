import { useState } from "react"
import { ArrowLeft, ArrowRight, NotebookPen, PieChart, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import "./requestDemo.css"

const steps = [
  {
    icon: Users,
    title: "Team alignment",
    detail: "Share priorities across members, cashiers, and managers so the walkthrough mirrors real life.",
  },
  {
    icon: NotebookPen,
    title: "Live build review",
    detail: "We demo dashboards, QR journeys, and admin tooling with your data seeded in our sandbox.",
  },
  {
    icon: PieChart,
    title: "Plan & rollout",
    detail: "Leave with a deployment checklist, success metrics, and optional integrations to explore.",
  },
]

const defaultForm = {
  name: "",
  email: "",
  company: "",
  teamSize: "",
  focus: "",
  message: "",
}

export function RequestDemo() {
  const [form, setForm] = useState(defaultForm)
  const [status, setStatus] = useState(null)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name || !form.email) {
      setStatus({ type: "error", message: "Please include your name and work email so we can respond." })
      return
    }

    setStatus({ type: "pending", message: "Sending your request…" })
    setTimeout(() => {
      setStatus({
        type: "success",
        message: "Thanks for reaching out! We just emailed you a scheduling link.",
      })
      setForm(defaultForm)
    }, 1000)
  }

  return (
    <section className="demo">
      <div className="demo__shell">
        <div className="demo__intro">
          <Link to="/" className="demo__back">
            <ArrowLeft aria-hidden />
            Back home
          </Link>
          <p className="eyebrow">Request a demo</p>
          <h1>See Rewardly tailored to your use cases.</h1>
          <p>
            Tell us about your loyalty goals and we’ll host a live walkthrough with your flows—points accrual, redemptions,
            events, and analytics. No canned slides, just product.
          </p>
        </div>

        <div className="demo__grid">
          <form className="demo__form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label>
                Full name
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Avery Singh" required />
              </label>
              <label>
                Work email
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@brand.com" required />
              </label>
            </div>
            <div className="form-row">
              <label>
                Company
                <Input name="company" value={form.company} onChange={handleChange} placeholder="Northwind Collective" />
              </label>
              <label>
                Team size
                <Input name="teamSize" value={form.teamSize} onChange={handleChange} placeholder="Stores, cashiers, or members" />
              </label>
            </div>
            <label>
              Primary focus
              <Input name="focus" value={form.focus} onChange={handleChange} placeholder="Redemptions, events, reporting…" />
            </label>
            <label>
              Additional notes
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                placeholder="Share current challenges or integrations to explore."
              />
            </label>

            <div className="demo__actions">
              <Button className="app-navbar__login" type="submit">
                Schedule my demo
                <ArrowRight aria-hidden />
              </Button>
              <Link to="/" className="demo__secondary">Cancel</Link>
            </div>

            {status && (
              <p className={`demo__status demo__status--${status.type}`}>
                {status.message}
              </p>
            )}
          </form>

          <div className="demo__steps">
            <div className="demo__card">
              <p className="eyebrow">What happens next</p>
              {steps.map((step) => (
                <article key={step.title}>
                  <step.icon aria-hidden />
                  <div>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="demo__card muted">
              <p className="eyebrow">Prefer email?</p>
              <h3>introductions@rewardly.app</h3>
              <p>We reply within one business day with a scheduling link and tailored agenda.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
