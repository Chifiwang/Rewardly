import { Button } from "@/components/ui/button";
import { Tab } from "@/components/tab";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AddUserDialog({ onSubmit }) {
  const [userId, setUserId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    console.log(userId);

    onSubmit?.(userId);

    // reset for next open
    setUserId("");
  };

  return (
    <Dialog>
      {/* Trigger — automatically opens dialog */}
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Add User</Button>
      </DialogTrigger>

      {/* Content */}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Add User</DialogTitle>
          <DialogDescription>
            Enter a numeric user ID to add a user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="userid">User ID</Label>
            <Input
              id="userid"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., doejo67"
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Add User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function AwardPointsAllDialogue({ onSubmit }) {
  const [userId, setUserId] = useState("");
  const [points, setPoints] = useState(0);
  const [remark, setRemark] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Submitted userId:", userId, points, remark); // <- now you get the value

  onSubmit(userId, points, remark);

    setUserId("");
    setPoints(null);
    setRemark(null);
};
  return (
    <Dialog>
      {/* Trigger — automatically opens dialog */}
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">Award Points to Guest</Button>
      </DialogTrigger>

      {/* Content */}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Award to User</DialogTitle>
          <DialogDescription>
            Enter a numeric user ID to add a user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="points">Number of Points</Label>
            <Input
              id="points"
              name="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="e.g., 100"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remark">Remark</Label>
            <Input
              id="remark"
              name="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">
              Award to User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
function AwardPointsDialogue({ onSubmit }) {
  const [userId, setUserId] = useState("");
  const [points, setPoints] = useState(0);
  const [remark, setRemark] = useState("");

const handleSubmit = (e) => {
  e.preventDefault();
  if (!userId.trim()) return;

  console.log("Submitted userId:", userId, points, remark); // <- now you get the value

  onSubmit(userId, points, remark);

    setUserId("");
    setPoints(null);
    setRemark(null);
};
  return (
    <Dialog>
      {/* Trigger — automatically opens dialog */}
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost">Award Points to Guest</Button>
      </DialogTrigger>

      {/* Content */}
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Award to User</DialogTitle>
          <DialogDescription>
            Enter a numeric user ID to add a user.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="userid">User ID</Label>
            <Input
              id="userid"
              name="userid"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., doejo67"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="points">Number of Points</Label>
            <Input
              id="points"
              name="points"
              type="number"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="e.g., 100"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remark">Remark</Label>
            <Input
              id="remark"
              name="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full">
              Award to User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export function OrganizerDashboard() {
  const navigate = useNavigate();
  const {  loading, myEvents, myTransactions, events, updateEvent, deleteEvent, addUserToEvent, awardPointsToGuest } = useAuth();
  const { user, viewRole } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  console.log(activeRole);
  const getOrganized = () => { return events.filter(e => (activeRole === 'manager' || activeRole === 'superuser') || events.some(o => o.utorid === user.utorid)) }

  // ----------------------------
  // Hooks first
  // ----------------------------
  const eventsForUser = useMemo(() => {
    // Otherwise, get only events the user organizes
    const organized = getOrganized ? getOrganized() : [];
    return organized.slice().sort((a, b) => {
      const aTime = a.startTime ? new Date(a.startTime).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.startTime ? new Date(b.startTime).getTime() : Number.POSITIVE_INFINITY;
      return aTime - bTime;
    });
  }, [myEvents, getOrganized]);

  const upcomingCount = eventsForUser.length;
  const previewEvents = eventsForUser.slice(0, 3);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login#login-form");
    }
  }, [user, loading, navigate]);

  const pageSize = 4; // items per page
  const [page, setPage] = useState(1);
  const [showPrevious, setShowPrevious] = useState(false);
  const now = new Date();
  const upcomingEvents = eventsForUser.filter(event => !event.endTime || new Date(event.endTime) >= now);
  const previousEvents = eventsForUser.filter(event => event.endTime && new Date(event.endTime) < now);

  const eventsToShow = showPrevious ? previousEvents : upcomingEvents;
  const totalPages = Math.max(1, Math.ceil(eventsToShow.length / pageSize));
  const pagedEvents = eventsToShow.slice((page - 1) * pageSize, page * pageSize);
  // ----------------------------
  // Named callbacks
  // ----------------------------
  const handleViewEvent = (eventId) => { console.log("View event", eventId); navigate(`${eventId}`)};
  const handleEditEvent = (eventId) => { console.log("Edit event", eventId); navigate(`${eventId}/edit`)};
  const handleAddUserToEvent = (eventId, guestId) => { console.log("Add user to event", eventId); addUserToEvent(eventId, guestId)};
  const handleAwardPointsGuest = (eventId, guestId, points, remark) => { console.log(eventId, guestId, points, remark); awardPointsToGuest(eventId, guestId, points, remark)};

  // ----------------------------
  // Conditional JSX only
  // ----------------------------
  if (!user) return <div>Loading...</div>;

  return (
    <div className="dashboard-page">
      <div className="auth-hero hero-roomy" id="overview">
        <h1 className="auth-heading xl">Your Event Organizer Dashboard</h1>
        <p className="auth-subtitle">
          Manage your events, participants, and reward points.
        </p>
      </div>

      <section className="auth-grid roomy">
        <div className="auth-card tall highlight">
          <h3>Events you manage</h3>
          <p className="auth-kpi">{upcomingCount}</p>
          <p className="auth-meta">Total events you are responsible for.</p>
        </div>
      </section>

      <section className="auth-section roomy">
        <div className="auth-section__header">
          <div>
            <h2>Upcoming events</h2>
          </div>

        </div>
        <div className="auth-list compact">
          {previewEvents.length === 0 && (
            <article className="auth-card">
              <p className="auth-meta">No events assigned. Create or request an event to manage.</p>
            </article>
          )}
             {/* -------------------- Upcoming / Previous Toggle -------------------- */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
        <Button variant={!showPrevious ? "default" : "outline"} onClick={() => { setShowPrevious(false); setPage(1); }}>
          Upcoming Events ({upcomingEvents.length})
        </Button>
        <Button variant={showPrevious ? "default" : "outline"} onClick={() => { setShowPrevious(true); setPage(1); }}>
          Previous Events ({previousEvents.length})
        </Button>
            <div style={{"width": "100%"}}></div>
          <Button variant="ghost" size="sm" asChild className="">
            <a href="/events">See all events</a>
          </Button>
      </div>

      {/* -------------------- Event list -------------------- */}
      <div className="auth-list">
        {pagedEvents.length === 0 ? (
          <div className="auth-card">
            <p className="auth-meta">{showPrevious ? "No previous events." : "No upcoming events."}</p>
          </div>
        ) : (
          pagedEvents.map((event) => (
            <article key={event.id || event.name} className="auth-card">
              <div className="auth-card__row">
                <h3>{event.name}</h3>
                <span className="auth-badge">{event.startTime ? new Date(event.startTime).toLocaleDateString() : "TBD"}</span>
              </div>
              <p className="auth-meta">{event.description || "No description"}</p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <Button size="sm" onClick={() => handleViewEvent(event.id)}>View</Button>
                <Button size="sm" variant="outline" onClick={() => handleEditEvent(event.id)}>Edit</Button>
                <AddUserDialog onSubmit={(guestId) => handleAddUserToEvent(event.id, guestId)} />
                <AwardPointsDialogue onSubmit={(guestId, points, remark) => handleAwardPointsGuest(event.id, guestId, points, remark)} />
              </div>
            </article>
          ))
        )}
      </div>

      {/* -------------------- Pagination -------------------- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
        <span className="auth-meta">Page {page} of {totalPages}</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>←</Button>
          <Button variant="ghost" size="icon" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>→</Button>
        </div>
      </div>        </div>
      </section>
      <Outlet/>
    </div>
  );
}

