import "./infoPage.css"

const sections = [
  {
    title: "Quickstart",
    items: [
      "Clone backend repo and copy into /backend directory.",
      "Run npm install in /frontend and /backend, then configure env files.",
      "Use npm run dev for local testing; npm run build for deployment artifacts.",
    ],
  },
  {
    title: "Deployment",
    items: [
      "Build frontend and serve via static host (Vercel, Netlify, S3+CloudFront).",
      "Deploy backend Node server on Render/Heroku/Fly with persistent SQLite/Postgres.",
      "Update WEBSITE doc with final URLs and demo credentials.",
    ],
  },
  {
    title: "Testing",
    items: [
      "Seed script populates users, transactions, events, promotions.",
      "Cypress smoke tests verify login, QR displays, pagination flows.",
      "API schema documented via OpenAPI YAML checked into repo.",
    ],
  },
]

export function Documentation() {
  return (
    <div className="info-page">
      <div className="info-page__shell">
        <header className="info-page__header">
          <p className="eyebrow">Documentation</p>
          <h1>Everything you need to run Rewardly locally or in the cloud.</h1>
          <p>
            This quick reference highlights the main steps from INSTALL—perfect for teammates and graders who want to verify
            your environment.
          </p>
        </header>

        <div className="info-page__grid">
          {sections.map((section) => (
            <article key={section.title} className="info-page__card">
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
