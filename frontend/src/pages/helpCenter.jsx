import { useState } from "react"
import "./infoPage.css"

const categories = [
  {
    title: "Getting started",
    faqs: [
      {
        q: "How do members enroll?",
        a: "Members can scan their QR code or register through cashier-facing screens. Invite links also work for web signups.",
      },
      {
        q: "Can we import existing users?",
        a: "Yes. Upload CSVs with utorid, points, and roles. Rewardly validates duplicates and keeps audit logs.",
      },
    ],
  },
  {
    title: "Cashier & manager tools",
    faqs: [
      {
        q: "Do cashiers need QR scanners?",
        a: "No. They can manually enter IDs or transaction numbers. QR scanning is optional for faster service.",
      },
      {
        q: "How do managers adjust points?",
        a: "Managers use the Adjustment panel to credit/debit transactions, mark suspicious entries, and leave notes.",
      },
    ],
  },
  {
    title: "Security & roles",
    faqs: [
      {
        q: "What roles exist?",
        a: "Members, cashiers, managers, event organizers, and superusers. Each view is scoped by capability.",
      },
      {
        q: "How often do we review logs?",
        a: "Real-time logging lives in the dashboard. Export CSVs or send to your SIEM weekly.",
      },
    ],
  },
]

export function HelpCenter() {
  const [open, setOpen] = useState({ category: 0, question: 0 })

  const toggle = (categoryIndex, questionIndex) => {
    setOpen((prev) =>
      prev.category === categoryIndex && prev.question === questionIndex
        ? { category: null, question: null }
        : { category: categoryIndex, question: questionIndex }
    )
  }

  return (
    <div className="info-page">
      <div className="info-page__shell">
        <header className="info-page__header">
          <p className="eyebrow">Help center</p>
          <h1>FAQ and guides for every Rewardly role.</h1>
          <p>Use the accordion to explore quick answers. Need more help? Contact support@rewardly.app.</p>
        </header>

        {categories.map((category, categoryIndex) => (
          <section className="info-page__section" key={category.title}>
            <h2>{category.title}</h2>
            {category.faqs.map((faq, questionIndex) => {
              const isOpen = open.category === categoryIndex && open.question === questionIndex
              return (
                <div className="info-page__accordion" key={faq.q}>
                  <button type="button" onClick={() => toggle(categoryIndex, questionIndex)}>
                    {faq.q}
                    <span>{isOpen ? "−" : "+"}</span>
                  </button>
                  {isOpen && <p>{faq.a}</p>}
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </div>
  )
}
