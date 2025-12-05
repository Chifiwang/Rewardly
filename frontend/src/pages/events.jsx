import { Button } from "@/components/ui/button"
import { useState, useMemo, useEffect } from "react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter } from "@/components/filter"
import { useAuth } from "../contexts/AuthContext"
import { ViewEventRoute } from "../pages/viewEvent"
import { useSearchParams, useNavigate, Outlet } from "react-router-dom";
import { Tab } from "@/components/tab"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function CreateEventPanel() {
  const { addEvent } = useAuth();
  const [success, setSuccess] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const requiredFields = ["name", "description", "location", "startTime", "endTime", "capacity", "points"];
    const missing = {};
    requiredFields.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        missing[field] = "Required";
      }
    });

    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      setSuccess("");
      return;
    }

    setErrors({});
    addEvent(data);
    setSuccess("Event created successfully");
    setSuccessOpen(true);
    e.target.reset();
  };

  return (
    <div style={{ width: '100%', padding: '1rem 0' }}>
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Create a new event</h2>
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>Set the basics, then publish.</p>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="name-new">Name <span style={{ color: "var(--destructive)" }}>*</span></Label>
            <Input id="name-new" name="name" placeholder="Rewards Rally" aria-invalid={!!errors.name} />
            {errors.name && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.name}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description-new">Description <span style={{ color: "var(--destructive)" }}>*</span></Label>
            <Input id="description-new" name="description" placeholder="Kick off with double points." aria-invalid={!!errors.description} />
            {errors.description && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.description}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location-new">Location <span style={{ color: "var(--destructive)" }}>*</span></Label>
            <Input id="location-new" name="location" placeholder="BA 1160" aria-invalid={!!errors.location} />
            {errors.location && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.location}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="startTime-new">Start Time <span style={{ color: "var(--destructive)" }}>*</span></Label>
            <Input id="startTime-new" name="startTime" type="datetime-local" aria-invalid={!!errors.startTime} />
            {errors.startTime && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.startTime}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="endTime-new">End Time <span style={{ color: "var(--destructive)" }}>*</span></Label>
            <Input id="endTime-new" name="endTime" type="datetime-local" aria-invalid={!!errors.endTime} />
            {errors.endTime && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.endTime}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="capacity-new">Capacity <span style={{ color: "var(--destructive)" }}>*</span></Label>
            <Input id="capacity-new" name="capacity" type="number" min="0" step="1" placeholder="100" aria-invalid={!!errors.capacity} />
            {errors.capacity && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.capacity}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="points-new">Points <span style={{ color: "var(--destructive)" }}>*</span></Label>
            <Input id="points-new" name="points" type="number" min="0" step="1" placeholder="100" aria-invalid={!!errors.points} />
            {errors.points && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.points}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="submit" className="send-transfer">Create Event</Button>
          </div>
        </form>
      </div>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>{success}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="send-transfer" onClick={() => setSuccessOpen(false)}>Dismiss</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExpiredBadge() {
  const [showTip, setShowTip] = useState(false);
  return (
    <span
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
      style={{
        position: 'absolute',
        top: '0.85rem',
        right: '0.85rem',
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: 'var(--destructive)',
        color: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '12px',
        cursor: 'default'
      }}
      aria-label="Expired: The date for this event has passed."
    >
      !
      {showTip && (
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '24px',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.4rem 0.6rem',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            zIndex: 2
          }}
        >
          Expired: The date for this event has passed.
        </span>
      )}
    </span>
  );
}

const formatDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

function DeleteEventDialog({ onConfirm, triggerLabel = "Delete" }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleDelete = async () => {
    if (!password.trim()) {
      setError("Please enter your password to confirm.");
      return;
    }
    setError("");
    const result = await onConfirm(password);
    if (result.success) {
      setOpen(false);
      setPassword("");
      setSuccessOpen(true);
    } else {
      setError(result.error === "Invalid password" ? "Invalid password. Try again." : result.error);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default" size="sm" className="send-transfer">{triggerLabel}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The event will be removed for everyone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Label htmlFor="delete-password">Confirm with password</Label>
            <Input
              id="delete-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p style={{ color: "var(--destructive)" }}>{error}</p>}
          </div>
          <DialogFooter style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <DialogClose asChild>
              <Button variant="default" className="send-transfer">Cancel</Button>
            </DialogClose>
            <Button variant="default" className="send-transfer" onClick={handleDelete} disabled={!password.trim()}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>Event deleted successfully.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="send-transfer" onClick={() => setSuccessOpen(false)}>Dismiss</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditEventDialog({ event, onSave, triggerLabel = "Edit" }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const parsed = {
      ...data,
      capacity: data.capacity ? Number(data.capacity) : 0,
      points: data.points ? Number(data.points) : 0,
    };
    onSave(event.id, parsed);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="send-transfer">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update event details and save changes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-edit">Name</Label>
              <Input id="name-edit" name="name" defaultValue={event.name} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-edit">Description</Label>
              <Input id="description-edit" name="description" defaultValue={event.description || ""} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="location-edit">Location</Label>
              <Input id="location-edit" name="location" defaultValue={event.location || ""} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="startTime-edit">Start Time</Label>
              <Input id="startTime-edit" name="startTime" defaultValue={formatDateTimeLocal(event.startTime)} type="datetime-local" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="endTime-edit">End Time</Label>
              <Input id="endTime-edit" name="endTime" defaultValue={formatDateTimeLocal(event.endTime)} type="datetime-local" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="capacity-edit">Capacity</Label>
              <Input id="capacity-edit" name="capacity" defaultValue={event.capacity ?? 0} type="number" min="0" step="1" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="points-edit">Points</Label>
              <Input id="points-edit" name="points" defaultValue={event.points ?? 0} type="number" min="0" step="1" />
            </div>
          </div>
          <DialogFooter style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <DialogClose asChild>
              <Button variant="default" className="send-transfer">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" className="send-transfer">Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CreateEvent() {
  const { addEvent } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    console.log(data);
    addEvent(data);
  }
  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="default" style={{"height":"46px"}} className="send-transfer">Create Event</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>
              Create to your event here. Click publish when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-1">Name</Label>
              <Input id="name-1" name="name" defaultValue="My-Event" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-1">Description</Label>
              <Input id="description-1" name="description" defaultValue="A really fun event" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="location-1">Location</Label>
              <Input id="location-1" name="location" defaultValue="Moon" />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="startTime-1">Start Time</Label>
              <Input id="startTime-1" name="startTime" defaultValue="Now" type="datetime-local"/>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="endTime-1">End Time</Label>
              <Input id="endTime-1" name="endTime" defaultValue="Never" type="datetime-local"/>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="capacity-1">Capacity</Label>
              <Input id="capacity-1" name="capacity" defaultValue="100"
                              type="number"
                              min="0"
                              step="1"
                            />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="points-1">Points</Label>
              <Input id="points-1" name="points" defaultValue="100"
                              type="number"
                              min="0"
                              step="1"
                            />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default" className="send-transfer">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
            <Button type="submit" className="send-transfer">Create</Button>
            </DialogClose>
          </DialogFooter>
      </form>
        </DialogContent>
    </Dialog>
  )
}

function MyEvents() {
  const { myEvents, user, viewRole, updateEvent, deleteEvent } = useAuth();
  const navigate = useNavigate();
  const activeRole = viewRole || user?.role || "user";
  console.log(activeRole)
  const canManageEvents = ["manager", "superuser", "organizer"].includes(activeRole);
  const pageSize = 4;
  const [page, setPage] = useState(1);
  const [showPrevious, setShowPrevious] = useState(false);

  const now = new Date();
  const upcomingEvents = (myEvents || []).filter(event => !event.endTime || new Date(event.endTime) >= now);
  const previousEvents = (myEvents || []).filter(event => event.endTime && new Date(event.endTime) < now);

  const eventsToShow = showPrevious ? previousEvents : upcomingEvents;
  const totalPages = Math.max(1, Math.ceil(eventsToShow.length / pageSize));
  const pagedEvents = eventsToShow.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (id, password) => {
    return await deleteEvent(id, password);
  };

  const handleUpdate = (id, data) => {
    updateEvent(id, data);
  };

  return (
    <>
      <h1 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Manage and monitor every member experience.</h1>
      <p className="auth-subtitle" style={{ marginBottom: '1rem' }}>Review your schedule and guest engagement in one spot.</p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Button
          variant={!showPrevious ? "default" : "outline"}
          onClick={() => { setShowPrevious(false); setPage(1); }}
        >
          Upcoming Events ({upcomingEvents.length})
        </Button>
        <Button
          variant={showPrevious ? "default" : "outline"}
          onClick={() => { setShowPrevious(true); setPage(1); }}
        >
          Previous Events ({previousEvents.length})
        </Button>
      </div>

      <div className="auth-list">
        {pagedEvents.length === 0 ? (
          <div className="auth-card">
            <p className="auth-meta">{showPrevious ? "No previous events." : "No upcoming events."}</p>
          </div>
        ) : (
          pagedEvents.map((event) => (
            <article key={event.name} className="auth-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div className="auth-card__row" style={{ alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <h3>{event.name}</h3>
                  <span className="auth-meta">{event.startTime ? new Date(event.startTime).toDateString() : "Anytime"}</span>
                </div>
                <span style={{ padding: '0.15rem 0.6rem', border: '1px solid var(--border)', borderRadius: '999px' }}>
                  {event.location || "Location TBA"}
                </span>
              </div>
              <p className="auth-meta" style={{ marginTop: '0.35rem' }}>{event.description || event.meta}</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                <Button className="send-transfer" size="sm" onClick={() => navigate(`${event.id}`, { state: { event } })}>View</Button>
                {canManageEvents && (
                  <>
                    <EditEventDialog event={event} onSave={handleUpdate} triggerLabel="Edit" />
                    <DeleteEventDialog onConfirm={(password) => handleDelete(event.id, password)} />
                  </>
                )}
              </div>
            </article>
          ))
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <span className="auth-meta">Page {page} of {totalPages}</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page" style={{color: 'var(--foreground)'}}>
            ←
          </Button>
          <Button variant="ghost" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page" style={{color: 'var(--foreground)'}}>
            →
          </Button>
        </div>
      </div>
    </>
  );
}

function SearchEvents() {
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("earliest")
  const { user, viewRole, events: authEvents, updateEvent, deleteEvent } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const [params] = useSearchParams();
  const all = Object.fromEntries(params.entries());
  const navigate = useNavigate();
  const canManageEvents = ["manager", "superuser", "organizer"].includes(activeRole);
  const pageSize = 8;
  const [page, setPage] = useState(1);
  const filtered = useMemo(() => {
    const now = new Date()
    const base = authEvents || []

    const startedParam = all.started === "true" || all.started === true
    const endedParam = all.ended === "true" || all.ended === true
    const showFull = all.showFull === "true" || all.showFull === true
    const showExpired = all.showExpired === "true" || all.showExpired === true
    const nameParam = all.name?.toLowerCase()
    const descParam = all.description?.toLowerCase()

    const filteredEvents = base.filter((e) => {
      const starts = e.startTime ? new Date(e.startTime) : null
      const ends = e.endTime ? new Date(e.endTime) : null
      const hasStarted = starts ? starts <= now : true
      const hasEnded = ends ? ends < now : false

      // Hide expired events by default unless showExpired is true
      if (!showExpired && hasEnded) return false

      if (startedParam && !hasStarted) return false
      if (endedParam && !hasEnded) return false
      if (!showFull && e.capacity !== undefined && e.capacity !== null && e.capacity === 0) return false

      const matchesQuery =
        !query ||
        e.name?.toLowerCase().includes(query.toLowerCase()) ||
        e.description?.toLowerCase().includes(query.toLowerCase())
      if (!matchesQuery) return false

      if (nameParam && !e.name?.toLowerCase().includes(nameParam)) return false
      if (descParam && !e.description?.toLowerCase().includes(descParam)) return false

      return true
    });

    const sorted = [...filteredEvents].sort((a, b) => {
      const aStart = a.startTime ? new Date(a.startTime).getTime() : Number.POSITIVE_INFINITY;
      const bStart = b.startTime ? new Date(b.startTime).getTime() : Number.POSITIVE_INFINITY;
      const aPoints = a.points !== undefined ? Number(a.points) : Number.NEGATIVE_INFINITY;
      const bPoints = b.points !== undefined ? Number(b.points) : Number.NEGATIVE_INFINITY;

      if (sort === "latest") {
        return (bStart === Number.POSITIVE_INFINITY ? Number.NEGATIVE_INFINITY : bStart) - (aStart === Number.POSITIVE_INFINITY ? Number.NEGATIVE_INFINITY : aStart);
      }
      if (sort === "pointsAsc") {
        return aPoints - bPoints;
      }
      if (sort === "pointsDesc") {
        return bPoints - aPoints;
      }
      return aStart - bStart;
    });

    return sorted;
  }, [all, authEvents, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedEvents = filtered.slice((page - 1) * pageSize, page * pageSize);

  const filters = {
    name: ["string", "Event Name"],
    description: ["string", "Description"],
    started: ["boolean", "Event Started"],
    ended: ["boolean", "Event Ended"],
    showFull: ["boolean", "Full Events"],
    showExpired: ["boolean", "Show Expired Events"],

  }

  const handleDelete = async (id, password) => {
    return await deleteEvent(id, password);
  };

  const handleUpdate = (id, data) => {
    updateEvent(id, data);
  };

  useEffect(() => {
    setPage(1);
  }, [query, sort, filtered.length, all.started, all.ended, all.showFull, all.showExpired, all.name, all.description]);

  return (
    <>
      <div className="auth-hero">
        <h1>Find and join events.</h1>
        <p className="auth-subtitle">Filter by status, search by name, and add the ones you care about.</p>
      </div>

      <div className="promotions-toolbar" style={{ alignItems: 'center', gap: '1rem' }}>
        <div className="search-add">
          <div className="search">
            <input
              aria-label="Search events"
              placeholder="Search events"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Label style={{ minWidth: "80px" }}>Sort by</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="earliest">Earliest first</SelectItem>
                <SelectItem value="latest">Latest first</SelectItem>
                <SelectItem value="pointsAsc">Points (low to high)</SelectItem>
                <SelectItem value="pointsDesc">Points (high to low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Filter name={"Event Filters"} desc={"Apply different filters to search for events"} fields={filters}/>
        </div>
      </div>

      <div className="promo-grid">
        {pagedEvents.length === 0 && (
          <div className="auth-card">
            <p className="muted">No promotions match your filters.</p>
          </div>
        )}


{pagedEvents.map((e) => {
  const isExpired = e.endTime && new Date(e.endTime) <= new Date();
  const startDate = e.startTime ? new Date(e.startTime).toLocaleDateString() : "TBD";
  const location = e.location || "Location TBA";
  return (
    <article key={e.name} className="promo-card auth-card" style={{position: 'relative', display: 'flex', flexDirection: 'column'}}>
      {isExpired && (
        <ExpiredBadge />
      )}
      <div className="promo-card__head" style={{display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start'}}>
        <h3 style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{e.name}</h3>
        <div className="auth-meta" style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-start' }}>
          <span>{startDate}</span>
          <span style={{ padding: '0.15rem 0.5rem', border: '1px solid var(--border)', borderRadius: '999px' }}>{location}</span>
        </div>
      </div>
      <div className="promo-card__actions" style={{marginTop: 'auto', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'nowrap', width: '100%'}}>
        <Button size="sm" variant="default" className="send-transfer" onClick={() => navigate(`${e.id}`, { state: { event: e } })}>View</Button>
        {canManageEvents && (
          <>
            <EditEventDialog event={e} onSave={handleUpdate} triggerLabel="Edit" />
            <DeleteEventDialog onConfirm={(password) => handleDelete(e.id, password)} />
          </>
        )}
      </div>
    </article>
  );
})}

      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <span className="auth-meta">Page {page} of {totalPages}</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} aria-label="Previous page" style={{color: 'var(--foreground)'}}>
            ←
          </Button>
          <Button variant="ghost" size="icon" disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} aria-label="Next page" style={{color: 'var(--foreground)'}}>
            →
          </Button>
        </div>
      </div>
    </>
  );
}

export function Events() {
  const { user, viewRole } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const canManageEvents = ["manager", "superuser", "organizer"].includes(activeRole);
  const [ view, changeView ] = useState('myEvents');
  const toggleMyEvents = () => {
    console.log("here");
    changeView('myEvents');
  };
  const toggleAllEvents = () => {
    console.log("here2");
    changeView('searchEvents');
  };
  const toggleCreateEvent = () => {
    changeView('createEvent');
  };
  //todo params and then routing

  return (
    <>
      <div className="auth-hero" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'left' }}>
          <Tab
            isOn={view === 'myEvents'}
            onClick={toggleMyEvents}
          >
            My Events
          </Tab>
          <Tab
            isOn={view === 'searchEvents'}
            size="default"
            onClick={toggleAllEvents}
          >
            All Events
          </Tab>
          {canManageEvents && (
            <Tab
              isOn={view === 'createEvent'}
              size="default"
              onClick={toggleCreateEvent}
            >
              Create Event
            </Tab>
          )}
        </div>
      </div>

      {view === 'myEvents' && <MyEvents />}
      {view === 'searchEvents' && <SearchEvents />}
      {view === 'createEvent' && canManageEvents && <CreateEventPanel />}
      <Outlet />
    </>
  )
}
