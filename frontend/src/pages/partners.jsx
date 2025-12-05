import "./infoPage.css"

const partnerTypes = [
  {
    title: "Retail & QSR",
    body: "Connect POS and eCommerce signals to Rewardly’s APIs to sync purchases, promotions, and redemptions instantly.",
  },
  {
    title: "Events & Venues",
    body: "Manage guest RSVPs, on-site check-ins, and point awards with branded QR codes and organizer tooling.",
  },
  {
    title: "Agencies & SIs",
    body: "Embed Rewardly as your loyalty layer, with white-label components and shared success metrics.",
  },
]

const benefits = [
  "Dedicated solutions architect",
  "Revenue share for referred accounts",
  "Joint marketing spotlights and case studies",
  "Priority roadmap input for marquee partners",
]

export function Partners() {
  return (
    <div className="info-page" role="main" aria-label="Rewardly partners">
      <div className="info-page__shell">
        <header className="info-page__header">
          <p className="eyebrow">Partners</p>
          <h1>Build loyalty programs your clients brag about.</h1>
          <p>
            Agencies, retailers, and technology providers team up with Rewardly to deliver end-to-end journeys—from QR
            enrollments to cashiers and superusers.
          </p>
        </header>

        <section className="info-page__section">
          <h2>Who we collaborate with</h2>
          <div className="info-page__grid">
            {partnerTypes.map((item) => (
              <article key={item.title} className="info-page__card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-page__section">
          <h2>Partner perks</h2>
          <div className="info-page__grid">
            {benefits.map((perk) => (
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
