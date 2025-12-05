import "./infoPage.css"

const principles = [
  {
    title: "Design for trust",
    body: "Customers and teammates deserve clarity. We build transparent journeys with clear states, logs, and safeguards.",
  },
  {
    title: "Ship together",
    body: "Rewardly pairs product, design, and support so launches feel cohesive. Every touchpoint is vetted by real teams.",
  },
  {
    title: "Measure impact",
    body: "We obsess over loyalty lift, repeat visits, and operational savings—not vanity metrics.",
  },
]

const milestones = [
  { label: "Founding", detail: "Inspired by scrappy campus stores, Rewardly launched to modernize loyalty tech." },
  { label: "Expansion", detail: "Grew from single-store pilots to multi-region retailers and event organizers." },
  { label: "Now", detail: "Serving hospitality, education, and hybrid commerce with a unified control center." },
]

export function About() {
  return (
    <div className="info-page" role="main" aria-label="About Rewardly">
      <div className="info-page__shell">
        <header className="info-page__header">
          <p className="eyebrow">Our story</p>
          <h1>The loyalty operating system crafted for modern teams.</h1>
          <p>
            Rewardly started as a passion project to help campus retailers run delightful programs without legacy systems. Today,
            we power experiences for retailers, venues, and member communities across North America.
          </p>
        </header>

        <section className="info-page__section">
          <h2>What guides us</h2>
          <div className="info-page__grid">
            {principles.map((item) => (
              <article key={item.title} className="info-page__card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-page__section">
          <h2>Mental timeline</h2>
          <ul className="info-page__list">
            {milestones.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
