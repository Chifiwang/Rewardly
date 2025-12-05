import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"

import { Button } from "@/components/ui/button"

const defaultProfile = {
  name: "Demo User",
  email: "demo@rewardly.app",
  birthday: "",
  address: "",
  phone: "",
}

const defaultSubscriptions = {
  emailNewsletter: true,
  emailUpdates: true,
  emailProduct: false,
  smsAlerts: true,
  smsPromotions: false,
}

export function Profile() {
  const { utorid } = useParams()
  const [form, setForm] = useState(() => ({ ...defaultProfile }))
  const [baseline, setBaseline] = useState(() => ({ ...defaultProfile }))
  const [status, setStatus] = useState(null)
  const [subscriptions, setSubscriptions] = useState(() => ({ ...defaultSubscriptions }))
  const [baselineSubscriptions, setBaselineSubscriptions] = useState(() => ({ ...defaultSubscriptions }))

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setStatus("Profile updates staged locally. Connect backend to persist them.")
    setBaseline({ ...form })
    setBaselineSubscriptions({ ...subscriptions })
  }

  const handleCancel = () => {
    setForm({ ...baseline })
    setStatus(null)
    setSubscriptions({ ...baselineSubscriptions })
  }

  const isDirty = useMemo(
    () =>
      Object.keys(defaultProfile).some(
        (key) => form[key] !== baseline[key]
      ) ||
      Object.keys(defaultSubscriptions).some(
        (key) => subscriptions[key] !== baselineSubscriptions[key]
      ),
    [form, baseline, subscriptions, baselineSubscriptions]
  )

  const handleSubscriptionChange = (event) => {
    const { name, checked } = event.target
    setSubscriptions((prev) => ({ ...prev, [name]: checked }))
  }

  const handleUnsubscribeAll = () => {
    const cleared = Object.fromEntries(
      Object.keys(defaultSubscriptions).map((key) => [key, false])
    )
    setSubscriptions(cleared)
  }

  const isFullyUnsubscribed = useMemo(
    () => Object.values(subscriptions).every((value) => !value),
    [subscriptions]
  )

  return (
    <div className="profile-page">
      <div className="auth-hero hero-roomy">
        <p className="eyebrow">Profile</p>
        <h1 className="auth-heading xl">Manage your account details</h1>
        <p className="auth-subtitle">Keep your contact details current so teammates can reach you; locked fields are maintained via support.</p>
      </div>

      <form className="profile-grid" onSubmit={handleSubmit}>
        <div className="auth-card tall profile-card identity-card">
          <div className="profile-card__header">
            <h3>Identity</h3>
            <p className="auth-meta">UTorID and name are read-only. Reach support if you need them updated.</p>
          </div>

          <label className="stack">
            <span>UTorID</span>
            <input value={utorid || "unknown"} disabled />
          </label>
          <label className="stack">
            <span>Name</span>
            <input value={form.name} name="name" disabled />
          </label>
        </div>

        <div className="auth-card tall profile-card contact-card">
          <div className="profile-card__header">
            <h3>Contact & preferences</h3>
            <p className="auth-meta">Update your preferred contact channel. These changes are stored locally for the demo.</p>
          </div>

          <label className="stack">
            <span>Email</span>
            <input value={form.email} name="email" onChange={handleChange} placeholder="you@brand.com" />
          </label>
          <label className="stack">
            <span>Phone</span>
            <input value={form.phone} name="phone" onChange={handleChange} placeholder="+1 (555) 010-1234" />
          </label>
          <label className="stack">
            <span>Address</span>
            <input value={form.address} name="address" onChange={handleChange} placeholder="123 Front St, Toronto" />
          </label>
          <label className="stack">
            <span>Birthday</span>
            <input type="date" value={form.birthday} name="birthday" onChange={handleChange} />
          </label>

          <div className="profile-actions">
            <Button className="auth-btn" type="submit" size="sm">Save changes</Button>
            {isDirty && (
              <Button variant="ghost" type="button" onClick={handleCancel}>Cancel</Button>
            )}
          </div>
          {status && <p className="auth-meta" aria-live="polite">{status}</p>}
        </div>

        <div className="auth-card tall profile-card subscription-card">
          <div className="profile-card__header">
            <h3>Subscription settings</h3>
            <p className="auth-meta">Choose what you want to receive; uncheck any box to opt out.</p>
          </div>

          <div className="subscription-section">
            <p className="subscription-section__title">Email</p>
            <div className="subscription-list">
              <label className="subscription-option">
                <input
                  type="checkbox"
                  name="emailNewsletter"
                  checked={subscriptions.emailNewsletter}
                  onChange={handleSubscriptionChange}
                />
                <span>Rewardly newsletter</span>
              </label>
              <label className="subscription-option">
                <input
                  type="checkbox"
                  name="emailUpdates"
                  checked={subscriptions.emailUpdates}
                  onChange={handleSubscriptionChange}
                />
                <span>Important updates</span>
              </label>
              <label className="subscription-option">
                <input
                  type="checkbox"
                  name="emailProduct"
                  checked={subscriptions.emailProduct}
                  onChange={handleSubscriptionChange}
                />
                <span>Product news & experiments</span>
              </label>
            </div>
          </div>

          <div className="subscription-section">
            <p className="subscription-section__title">SMS</p>
            <div className="subscription-list">
              <label className="subscription-option">
                <input
                  type="checkbox"
                  name="smsAlerts"
                  checked={subscriptions.smsAlerts}
                  onChange={handleSubscriptionChange}
                />
                <span>Security alerts & sign-in approvals</span>
              </label>
              <label className="subscription-option">
                <input
                  type="checkbox"
                  name="smsPromotions"
                  checked={subscriptions.smsPromotions}
                  onChange={handleSubscriptionChange}
                />
                <span>Promotions & event reminders</span>
              </label>
            </div>
          </div>

          <div className="subscription-cta">
            <Button
              variant="ghost"
              className="unsubscribe-all"
              type="button"
              onClick={handleUnsubscribeAll}
              disabled={isFullyUnsubscribed}
            >
              Unsubscribe from everything
            </Button>
            <p className="auth-meta">Turning this on will opt you out of every Rewardly email and SMS.</p>
          </div>
        </div>
      </form>
    </div>
  )
}
