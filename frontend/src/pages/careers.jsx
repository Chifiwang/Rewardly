import "./infoPage.css"

const openings = [
  {
    role: "Senior Product Designer",
    meta: "Remote · North America",
    body: "Design orchestrations for cashiers, managers, and members with an eye on accessibility and motion design.",
  },
  {
    role: "Full-stack Engineer",
    meta: "Hybrid · Toronto",
    body: "Ship React frontends plus Node/SQL backends that power real-time loyalty operations across channels.",
  },
  {
    role: "Customer Onboarding Lead",
    meta: "Remote · EST",
    body: "Guide new partners through data migration, training, and launch playbooks with empathy and precision.",
  },
]

const perks = [
  "Flexible, async-first culture",
  "Annual learning & wellness budget",
  "Quarterly hack weeks focused on loyalty experiments",
  "Equity for every full-time teammate",
]

export function Careers() {
  return (
    <div className="info-page" role="main" aria-label="Careers at Rewardly">
      <div className="info-page__shell">
        <header className="info-page__header">
          <p className="eyebrow">Careers</p>
          <h1>Help reinvent how brands reward their communities.</h1>
          <p>
            We’re a distributed team of builders who care deeply about customer journeys. If you love polished UX, thoughtful
            systems, and collaborative shipping, we’d love to meet you.
          </p>
        </header>

        <section className="info-page__section">
          <h2>Open roles</h2>
          <ul className="info-page__list">
            {openings.map((job) => (
              <li key={job.role}>
                <strong>{job.role}</strong>
                <span className="info-page__meta">{job.meta}</span>
                <p>{job.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="info-page__section">
          <h2>Why Rewardly</h2>
          <div className="info-page__grid">
            {perks.map((perk) => (
              <article key={perk} className="info-page__card">
                <p>{perk}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
