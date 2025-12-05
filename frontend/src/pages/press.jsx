import "./infoPage.css"

const resources = [
  { title: "Media kit", body: "Download logos, product shots, and UI mockups for your coverage." },
  { title: "Brand guidelines", body: "Use our naming, colors, and tone correctly when referencing Rewardly." },
  { title: "Executive bios", body: "Meet the leadership shaping product, engineering, and customer experience." },
]

const headlines = [
  {
    title: "New loyalty OS bridges in-store and digital",
    outlet: "Retail Pulse",
  },
  {
    title: "Event organizers adopt Rewardly for rapid RSVPs",
    outlet: "Venue Weekly",
  },
  {
    title: "Cashier-first design drives faster redemptions",
    outlet: "Commerce Design Digest",
  },
]

export function Press() {
  return (
    <div className="info-page" role="main" aria-label="Rewardly press">
      <div className="info-page__shell">
        <header className="info-page__header">
          <p className="eyebrow">Press</p>
          <h1>Stories worth sharing about Rewardly.</h1>
          <p>
            Cover how brands modernize loyalty, or learn what’s next for our product. Our team responds quickly with data,
            demos, and interviews.
          </p>
        </header>

        <section className="info-page__section">
          <h2>Resources</h2>
          <div className="info-page__grid">
            {resources.map((item) => (
              <article key={item.title} className="info-page__card">
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="info-page__section">
          <h2>Recent highlights</h2>
          <ul className="info-page__list">
            {headlines.map((story) => (
              <li key={story.title}>
                <strong>{story.title}</strong>
                <span className="info-page__meta">{story.outlet}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
