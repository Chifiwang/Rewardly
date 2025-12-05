import "./infoPage.css"

const services = [
  { name: "Frontend", status: "Operational", detail: "Vercel global edge network", updated: "2 min ago" },
  { name: "Backend API", status: "Operational", detail: "Render (Toronto) with autoscaling", updated: "5 min ago" },
  { name: "Database", status: "Operational", detail: "Postgres + daily backups", updated: "10 min ago" },
]

const incidents = [
  { title: "Resolved: QR generation delay", date: "Jan 03", detail: "Caching layer misconfiguration fixed within 14 minutes." },
  { title: "Maintenance: Database upgrade", date: "Jan 12", detail: "Scheduled downtime at 01:00 ET for 8 minutes." },
]

export function ApiStatus() {
  return (
    <div className="info-page">
      <div className="info-page__shell">
        <header className="info-page__header">
          <p className="eyebrow">API status</p>
          <h1>Live health for every Rewardly service.</h1>
          <p>Monitor uptime, receive scheduled maintenance updates, and view historical incidents.</p>
        </header>

        <section className="info-page__section">
          <h2>Current status</h2>
          <ul className="info-page__list">
            {services.map((service) => (
              <li key={service.name}>
                <strong>{service.name}</strong>
                <span className="info-page__meta">{service.status} · {service.updated}</span>
                <p>{service.detail}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="info-page__section">
          <h2>Recent incidents</h2>
          <ul className="info-page__list">
            {incidents.map((incident) => (
              <li key={incident.title}>
                <strong>{incident.title}</strong>
                <span className="info-page__meta">{incident.date}</span>
                <p>{incident.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}
