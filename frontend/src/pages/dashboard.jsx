import { Button } from "@/components/ui/button"
import { Tab } from "@/components/tab"
import { NotFound } from "./notFound"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { OrganizerDashboard } from "../pages/organizer"


export function Dashboard() {
    const navigate = useNavigate();
    const { user, loading, myEvents, myPromotions, myTransactions, promotions, transactions } = useAuth();
    const [ view, changeView ] = useState('mainDash');
    const toggleMainDash = () => {
      console.log("here");
      changeView('mainDash');
    };
    const toggleEventDash = () => {
      console.log("here2");
      changeView('eventDash');
    };
    // Handle authentication redirect properly with useEffect
    useEffect(() => {
        if (!loading && user === null) {
            navigate("/login#login-form");
        }
    }, [user, navigate, loading]);

    // Show loading state while checking auth
    if (user === null) {
        return <div>Loading...</div>; // or a proper loading component
    }

    // Handle different user roles
    switch (user.role) {
        case "regular":
        case "cashier":
        case "manager":
        case "superuser":
            return (
        <>
               <div className="auth-hero hero-roomy" id="overview">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'left' }} className="mb-5">
        <Tab isOn={view === 'mainDash'} onClick={toggleMainDash}>Main Dashboard</Tab>
        <Tab isOn={view === 'eventDash'} onClick={toggleEventDash}>Event Dashboard</Tab>
          </div>

      </div>
          {view === "mainDash" && <DashboardUser
                    user={user}
                    myEvents={myEvents}
                    myPromotions={myPromotions}
                    myTransactions={myTransactions}
                    promotions={promotions}
                    transactions={transactions}
                />}
          {view === "eventDash" && <OrganizerDashboard />}
                </>
            );
        default:
            return <div>Invalid user role</div>;
    }
}

function DashboardUser({user, myEvents = [], myPromotions = [], myTransactions = [], promotions = [], transactions = []}) {
  const pointBalance = user?.points ?? 0;
  const eventsForUser = useMemo(() => (myEvents || []).slice().sort((a, b) => {
    const aTime = a.startTime ? new Date(a.startTime).getTime() : Number.POSITIVE_INFINITY;
    const bTime = b.startTime ? new Date(b.startTime).getTime() : Number.POSITIVE_INFINITY;
    return aTime - bTime;
  }), [myEvents]);
  const upcomingCount = eventsForUser.length;
  const previewEvents = eventsForUser.slice(0, 3);

  const promoList = useMemo(() => {
    const base = (myPromotions && myPromotions.length > 0) ? myPromotions : promotions || [];
    return base.slice().sort((a, b) => {
      const aEnd = a.endTime ? new Date(a.endTime).getTime() : Number.POSITIVE_INFINITY;
      const bEnd = b.endTime ? new Date(b.endTime).getTime() : Number.POSITIVE_INFINITY;
      return aEnd - bEnd;
    });
  }, [myPromotions, promotions]);
  const promoPreview = promoList.slice(0, 3);


  const txPreview = useMemo(() => {
    const base = (myTransactions && myTransactions.length > 0)
        ? myTransactions
        : transactions || [];

    return base
      .slice()
      .sort((a, b) => {
        const aId = Number.isFinite(a.id) ? a.id : 0;
        const bId = Number.isFinite(b.id) ? b.id : 0;
        return bId - aId;
      })
      .slice(0, 3);
  }, [myTransactions, transactions]);

  const formatTxBadge = (tx) => {
    if (tx.spent) return `-$${tx.spent}`;
    if (tx.redeemed) return `-${tx.redeemed} pts`;
    if (tx.sent) return `-${tx.sent} pts`;
    if (tx.earned) return `+${tx.earned} pts`;
    if (tx.amount) return `${tx.amount}`;
    return "—";
  };

  return (
    <div className="dashboard-page">
        <h1 className="auth-heading xl">Your loyalty home base</h1>
        <p className="auth-subtitle">
          Check balances, see what’s next, and jump into actions with one click. Use the nav for QR, transfers, promos,
          events, and full history.
        </p>

      <section className="auth-grid roomy">
        <div className="auth-card tall highlight">
          <h3>Points balance</h3>
          <p className="auth-kpi big">{pointBalance.toLocaleString()}</p>
          <p className="auth-meta">Total points across your programs.</p>
          <div className="sparkline" aria-hidden />
        </div>
        <div className="auth-card">
          <h3>Upcoming events</h3>
          <p className="auth-kpi">{upcomingCount}</p>
          <p className="auth-meta">Check full details in Events.</p>
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="default" className="send-transfer" size="sm" asChild>
              <a href="/events">Open events</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="auth-section roomy">
        <div className="auth-section__header">
          <div>
            <h2>Promotions</h2>
            <p className="auth-subtitle">Active offers ready to use on purchases or transfers.</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/promotions">See all</a>
          </Button>
        </div>
        <div className="auth-list compact">
          {promoPreview.length === 0 && (
            <article className="auth-card">
              <p className="auth-meta">No promotions applied yet. Browse all promotions to add one.</p>
            </article>
          )}
          {promoPreview.map((promo) => (
            <article key={promo.id || promo.name} className="auth-card">
              <div className="auth-card__row">
                <h3>{promo.name || promo.title}</h3>
                <span className="auth-badge">
                  {promo.endTime ? new Date(promo.endTime).toLocaleDateString() : "Active"}
                </span>
              </div>
              <p className="auth-meta">{promo.description || promo.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="auth-section roomy">
        <div className="auth-section__header">
          <div>
            <h2>Events</h2>
            <p className="auth-subtitle">Stay on top of RSVPs and upcoming experiences.</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/events">Manage in Events</a>
          </Button>
        </div>
        <div className="auth-list compact">
          {previewEvents.length === 0 && (
            <article className="auth-card">
              <p className="auth-meta">No upcoming events yet. Check All Events to join.</p>
            </article>
          )}
          {previewEvents.map((event) => (
            <article key={event.id || event.name} className="auth-card">
              <div className="auth-card__row">
                <h3>{event.name || event.title}</h3>
                <span className="auth-badge">Upcoming</span>
              </div>
              <p className="auth-meta">Date: {event.startTime ? new Date(event.startTime).toDateString() : "TBD"}</p>
              <Button variant="ghost" size="sm">RSVP</Button>
            </article>
          ))}
        </div>
      </section>

      <section className="auth-section roomy">
        <div className="auth-section__header">
          <div>
            <h2>Recent transactions</h2>
            <p className="auth-subtitle">A quick glance at your latest activity.</p>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <a href="/transactions">Open history</a>
          </Button>
        </div>
        <div className="auth-list compact">
          {txPreview.length === 0 && (
            <article className="auth-card tx-card">
              <p className="auth-meta">No recent transactions yet.</p>
            </article>
          )}
          {txPreview.map((tx) => (
            <article key={tx.id} className="auth-card tx-card">
              <div className="auth-card__row">
                <h3>{tx.type?.charAt(0).toUpperCase() + tx.type?.slice(1)}</h3>
                <span className="auth-badge">{formatTxBadge(tx)}</span>
              </div>
              <p className="auth-meta">{tx.remark || 'No remark'}</p>
              <p className="auth-meta">ID: {tx.id}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
