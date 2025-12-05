import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tab } from "@/components/tab";
import { ViewEventCard } from "./viewEvent";

const hours = Array.from({ length: 24 }, (_, i) => i);
const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function FullPageCalendar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Handle authentication redirect properly with useEffect
  useEffect(() => {
    if (!loading && user === null) {
      navigate("/login#login-form");
    }
  }, [user, navigate, loading]);

  // Show loading state while checking auth
  if (loading || user === null) {
    return <div>Loading...</div>;
  }

  return <CalendarContent />;
}

function CreateEventPanel() {
  const { addEvent, user, viewRole } = useAuth();
  const [success, setSuccess] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [showEventsThisWeek, setShowEventsThisWeek] = useState(false);
  const [allEvents, setAllEvents] = useState([]);

  // Fetch events for the collapsible list
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/events?limit=500`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setAllEvents(data.results || []);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (user && showEventsThisWeek) {
      fetchAllEvents();
    }
  }, [user, showEventsThisWeek]);

  const effectiveRole = viewRole || user?.role || 'user';

  // Get events for this week
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const eventsThisWeek = allEvents.filter(e => {
    if (!e.startTime) return false;
    const eventStart = new Date(e.startTime);
    return eventStart >= weekStart && eventStart < weekEnd;
  });

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

  const navigate = useNavigate();

  return (
    <div style={{ width: '100%', padding: '1rem 0' }}>
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Create Event Form */}
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

        {/* Collapsible Events This Week Section */}
        <div style={{ marginTop: '2rem' }}>
          <Button
            onClick={() => setShowEventsThisWeek(!showEventsThisWeek)}
            variant="outline"
            style={{ marginBottom: '1rem' }}
          >
            {showEventsThisWeek ? '▼ Hide' : '▶ Show'} Events This Week
          </Button>

          {showEventsThisWeek && (
            <div className="space-y-4">
              {eventsThisWeek.length === 0 ? (
                <p className="auth-meta">No events this week</p>
              ) : (
                eventsThisWeek.map((event) => {
                  const eventStart = new Date(event.startTime);
                  return (
                    <article key={event.id} className="auth-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div className="auth-card__row" style={{ alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <h3>{event.name}</h3>
                          <span className="auth-meta">{eventStart ? eventStart.toDateString() : 'Anytime'}</span>
                        </div>
                        <span style={{ padding: '0.15rem 0.6rem', border: '1px solid var(--border)', borderRadius: '999px' }}>
                          {event.location || 'Location TBA'}
                        </span>
                      </div>
                      <p className="auth-meta" style={{ marginTop: '0.35rem' }}>{event.description || event.meta}</p>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                        <Button className="send-transfer" size="sm" onClick={() => navigate(`/events/${event.id}`, { state: { event } })}>View</Button>
                        {effectiveRole !== 'user' && effectiveRole !== 'cashier' && effectiveRole !== 'regular' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => navigate(`/events/${event.id}`)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Dialog */}
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

function CalendarContent() {
  const { user, viewRole, myEvents = [], events = [] } = useAuth();
  const navigate = useNavigate();
  const effectiveRole = viewRole || user?.role || 'user';

  useEffect(() => {
    // Small debug log to help track role-related rendering issues
    console.log('Calendar debug:', {
      effectiveRole,
      userRole: user?.role,
      viewRole,
    });
  }, [effectiveRole, user?.role, viewRole]);
  
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    d.setDate(d.getDate() - day); // start of week
    return d;
  });

  const [allEvents, setAllEvents] = useState([]);
  const [rsvpStatus, setRsvpStatus] = useState({}); // Track RSVP status for UI
  const [isAdding, setIsAdding] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", day: 0, start: 0, end: 1 });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [use24Hour, setUse24Hour] = useState(true); // Toggle for time format
  
  // Default view: managers/superusers see "allEvents", others see "myEvents"
  const getDefaultView = () => {
    return ["manager", "superuser"].includes(effectiveRole) ? 'allEvents' : 'myEvents';
  };
  
  const [view, setView] = useState(getDefaultView());
  const todayDate = new Date();
  const isToday = (date) => date.toDateString() === todayDate.toDateString();

  // color palette for events to make overlaps distinct
  const COLORS = ["#0f172a", "#0b5fff", "#0ea5a4", "#ef4444", "#f59e0b", "#7c3aed"];

  // Fetch all events based on user role
  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/events?limit=500`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Calendar fetched events:', data.results?.length || 0);
          setAllEvents(data.results || []);
        } else {
          console.error('Failed to fetch events:', response.status);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    if (user) {
      fetchAllEvents();
    }
  }, [user]);

  const startNextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const startPrevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  // Determine if user can edit/delete an event
  const canManageEvent = (event) => {
    // use effectiveRole (may be viewRole) for permission checks
    if (effectiveRole === 'superuser' || effectiveRole === 'manager') return true;
    if (effectiveRole === 'organizer') {
      // Organizer can only manage events they're responsible for
      return event.organizers?.some(org => org.utorid === user.utorid);
    }
    return false;
  };

  // Filter events based on user role
  const getVisibleEvents = () => {
    if (effectiveRole === 'superuser' || effectiveRole === 'manager') {
      // See all events
      return allEvents;
    }
    if (effectiveRole === 'organizer') {
      // See all published events + their organized events
      return allEvents.filter(e => 
        e.published || e.organizers?.some(org => org.utorid === user.utorid)
      );
    }
    // Regular users and cashiers see: published events + events they're registered to
    const myEventIds = new Set(myEvents.map(e => e.id));
    return allEvents.filter(e => e.published || myEventIds.has(e.id));
  };

  const visibleEvents = getVisibleEvents();

  useEffect(() => {
    console.log('Calendar state:', {
      allEventsCount: allEvents.length,
      visibleEventsCount: visibleEvents.length,
      myEventsCount: myEvents.length,
      effectiveRole,
      allEventsFirst: allEvents[0]?.name
    });
  }, [allEvents, visibleEvents, myEvents, effectiveRole]);

  const formatTime = (date) => {
    if (use24Hour) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  };

  const formatHour = (hour) => {
    if (use24Hour) {
      return `${hour}:00`;
    } else {
      const isPM = hour >= 12;
      const displayHour = hour === 0 ? 12 : (hour > 12 ? hour - 12 : hour);
      return `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`;
    }
  };

  const handleRSVP = (event) => {
    // Navigate to RSVP page for the event
    navigate(`/events/${event.id}`);
  };

  const handleEdit = (event) => {
    navigate(`/events/${event.id}`);
  };

  const handleDelete = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/events/${event.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        // Remove from display
        setDeleteConfirm(null);
        // Refresh events list
      }
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // get dates for the current week
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isUserAttending = (event) => rsvpStatus[event.id] || event.guests?.some(g => g.utorid === user.utorid);

  return (
    <div className="p-6">
      {/* Page header tabs (My Events / All Events / Today / Create) */}
      <div className="auth-hero" style={{ marginBottom: '1rem', marginTop: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'left' }}>
          {!['manager', 'superuser'].includes(effectiveRole) && (
            <Tab isOn={view === 'myEvents'} onClick={() => setView('myEvents')}>My Events</Tab>
          )}
          <Tab isOn={view === 'allEvents'} onClick={() => setView('allEvents')}>All Events</Tab>
          <Tab isOn={view === 'today'} onClick={() => setView('today')}>Today View</Tab>
          {( ["manager","superuser","organizer"].includes(effectiveRole) ) && (
            <Tab isOn={view === 'createEvent'} onClick={() => setView('createEvent')}>Create Event</Tab>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="promotions-toolbar">
        <div className="filters">
          <Button onClick={startPrevWeek}>Previous</Button>
          <Button onClick={startNextWeek}>Next</Button>
          <Button onClick={() => setCurrentWeekStart(() => {
            const d = new Date();
            const day = d.getDay();
            d.setDate(d.getDate() - day);
            return d;
          })}>
            Back to Today
          </Button>
          <Button 
            onClick={() => setUse24Hour(!use24Hour)}
            variant={use24Hour ? "default" : "outline"}
          >
            {use24Hour ? "24 Hour" : "12 Hour"}
          </Button>
        </div>
      </div>

      {/* My Events Calendar Grid - Shows only RSVP'd events */}
      {view === 'myEvents' && (
        <div className="overflow-auto border rounded-lg mt-6">
        <div className="grid grid-cols-8">
          <div className="border-r border-b p-2"></div>
          {weekDates.map((d, idx) => (
            <div
              key={idx}
              className="border-b border-r p-2 text-center font-semibold text-sm"
              style={isToday(d) ? { backgroundColor: 'rgba(59,130,246,0.08)', color: '#0f172a' } : undefined}
            >
              {days[idx]} {d.getDate()}
            </div>
          ))}

          {hours.map((h) => (
            <div key={h} className="contents">
              <div className="border-r border-b p-1 text-right text-xs">{formatHour(h)}</div>
              {weekDates.map((d, idx) => {
                // For My Events view, only show events user is RSVP'd to
                const eventsToShow = view === 'myEvents' ? myEvents : visibleEvents;
                const cellEvents = eventsToShow.filter(
                  (e) => {
                    if (!e.startTime || !e.endTime) return false;
                    const eventStart = new Date(e.startTime);
                    const eventEnd = new Date(e.endTime);
                    const cellDate = new Date(d);
                    
                    // Check if this cell's day matches the event's start day
                    // AND this hour is the starting hour of the event
                    return cellDate.toDateString() === eventStart.toDateString() &&
                            eventStart.getHours() === h;
                  }
                );
                return (
                  <div
                    key={idx}
                    className="border-b border-r relative h-12"
                    style={isToday(d) ? { backgroundColor: 'rgba(59,130,246,0.05)' } : undefined}
                  >
                    {cellEvents.map((ev, evIdx) => {
                      const eventStart = new Date(ev.startTime);
                      const eventEnd = new Date(ev.endTime);
                      const duration = (eventEnd - eventStart) / (1000 * 60 * 60); // hours
                      
                      // Cap duration to not exceed the remaining hours in the day
                      const hoursLeftInDay = 24 - h;
                      const displayDuration = Math.min(duration, hoursLeftInDay);
                      
                                            // Offset overlapping events horizontally
                                            const totalEvents = cellEvents.length;
                                            const offsetPercent = totalEvents > 1 ? (evIdx * (100 / totalEvents)) : 0;
                                            const widthPercent = totalEvents > 1 ? (100 / totalEvents) : 100;
                      
                      return (
                        <TooltipProvider key={ev.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-0 text-white text-xs px-1 rounded m-0.5 overflow-hidden cursor-pointer transition hover:z-10 hover:shadow-lg"
                                style={{
                                  height: `${displayDuration * 48 - 4}px`,
                                                                    left: `${offsetPercent}%`,
                                                                    width: `${widthPercent}%`,
                                  backgroundColor: COLORS[ev.id % COLORS.length],
                                  border: '1px solid rgba(0,0,0,0.08)'
                                }}
                                onClick={() => { setSelectedEvent(ev); setModalOpen(true); }}
                              >
                                {ev.name}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-2 text-xs">
                                <p className="font-semibold">{ev.name}</p>
                                <p>{formatTime(eventStart)} - {formatTime(eventEnd)}</p>
                                {ev.location && <p>Location: {ev.location}</p>}
                                {ev.description && <p>{ev.description}</p>}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        </div>
      )}

      {/* All Events Calendar Grid - Shows all visible events based on role */}
      {view === 'allEvents' && (
        <div className="overflow-auto border rounded-lg mt-6">
        <div className="grid grid-cols-8">
          <div className="border-r border-b p-2"></div>
          {weekDates.map((d, idx) => (
            <div
              key={idx}
              className="border-b border-r p-2 text-center font-semibold text-sm"
              style={isToday(d) ? { backgroundColor: 'rgba(59,130,246,0.08)', color: '#0f172a' } : undefined}
            >
              {days[idx]} {d.getDate()}
            </div>
          ))}

          {hours.map((h) => (
            <div key={h} className="contents">
              <div className="border-r border-b p-1 text-right text-xs">{formatHour(h)}</div>
              {weekDates.map((d, idx) => {
                // For All Events view, show all visible events based on role
                const eventsToShow = visibleEvents;
                const cellEvents = eventsToShow.filter(
                  (e) => {
                    if (!e.startTime || !e.endTime) return false;
                    const eventStart = new Date(e.startTime);
                    const eventEnd = new Date(e.endTime);
                    const cellDate = new Date(d);
                    
                    // Check if this cell's day matches the event's start day
                    // AND this hour is the starting hour of the event
                    return cellDate.toDateString() === eventStart.toDateString() &&
                           eventStart.getHours() === h;
                  }
                );
                return (
                  <div
                    key={idx}
                    className="border-b border-r relative h-12"
                    style={isToday(d) ? { backgroundColor: 'rgba(59,130,246,0.05)' } : undefined}
                  >
                    {cellEvents.map((ev, evIdx) => {
                      // Offset overlapping events horizontally
                      const totalEvents = cellEvents.length;
                      const offsetPercent = totalEvents > 1 ? (evIdx * (100 / totalEvents)) : 0;
                      const widthPercent = totalEvents > 1 ? (100 / totalEvents) : 100;
                      const eventStart = new Date(ev.startTime);
                      const eventEnd = new Date(ev.endTime);
                      const duration = (eventEnd - eventStart) / (1000 * 60 * 60); // hours
                      
                      // Cap duration to not exceed the remaining hours in the day
                      const hoursLeftInDay = 24 - h;
                      const displayDuration = Math.min(duration, hoursLeftInDay);
                      
                      return (
                        <TooltipProvider key={ev.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute top-0 text-white text-xs px-1 rounded m-0.5 overflow-hidden cursor-pointer transition hover:z-10 hover:shadow-lg"
                                style={{
                                  height: `${displayDuration * 48 - 4}px`,
                                  left: `${offsetPercent}%`,
                                  width: `${widthPercent}%`,
                                  backgroundColor: COLORS[ev.id % COLORS.length],
                                  border: '1px solid rgba(0,0,0,0.08)'
                                }}
                                onClick={() => { setSelectedEvent(ev); setModalOpen(true); }}
                              >
                                {ev.name}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-2 text-xs">
                                <p className="font-semibold">{ev.name}</p>
                                <p>{formatTime(eventStart)} - {formatTime(eventEnd)}</p>
                                {ev.location && <p>Location: {ev.location}</p>}
                                {ev.description && <p>{ev.description}</p>}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        </div>
      )}

      {/* Today View - Single day column */}
      {view === 'today' && (
        <div className="mt-6 max-w-2xl">
          <div className="border rounded-lg overflow-hidden">
            <div
              className="p-4 text-center font-semibold text-base bg-blue-50"
              style={{ backgroundColor: 'rgba(59,130,246,0.08)', color: '#0f172a' }}
            >
              {todayDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <div className="space-y-3 p-4 max-h-96 overflow-y-auto">
              {visibleEvents.filter(e => {
                const eventStart = new Date(e.startTime);
                return eventStart.toDateString() === todayDate.toDateString();
              }).length === 0 ? (
                <p className="text-gray-500">No events today</p>
              ) : (
                visibleEvents.filter(e => {
                  const eventStart = new Date(e.startTime);
                  return eventStart.toDateString() === todayDate.toDateString();
                }).sort((a, b) => new Date(a.startTime) - new Date(b.startTime)).map(ev => {
                  const eventStart = new Date(ev.startTime);
                  const eventEnd = new Date(ev.endTime);
                  return (
                    <div
                      key={ev.id}
                      className="p-3 rounded border cursor-pointer hover:bg-blue-50 transition"
                      style={{
                        borderLeft: `4px solid ${COLORS[ev.id % COLORS.length]}`
                      }}
                      onClick={() => { setSelectedEvent(ev); setModalOpen(true); }}
                    >
                      <div className="font-semibold">{ev.name}</div>
                      <div className="text-sm text-gray-600">
                        {formatTime(eventStart)} - {formatTime(eventEnd)}
                      </div>
                      {ev.location && <div className="text-sm text-gray-500">{ev.location}</div>}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Events List View for Actions */}
      {view !== 'createEvent' && (
      <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold">{view === 'allEvents' ? 'All Events' : view === 'today' ? 'Today' : 'My Events'}</h3>
        {(view === 'myEvents' ? myEvents : visibleEvents).length === 0 ? (
          <p className="text-gray-500">{view === 'myEvents' ? 'No events you are registered to' : view === 'today' ? 'No events today' : 'No events'}</p>
        ) : (
          (view === 'myEvents' ? myEvents : visibleEvents).map((event) => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            const isThisWeek = eventStart >= currentWeekStart && eventStart < new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            const isTodayEvent = eventStart.toDateString() === todayDate.toDateString();
            
            if (view === 'myEvents' && !isThisWeek) return null;
            if (view === 'today' && !isTodayEvent) return null;

            return (
              <article key={event.id} className="auth-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="auth-card__row" style={{ alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <h3>{event.name}</h3>
                    <span className="auth-meta">{eventStart ? eventStart.toDateString() : 'Anytime'}</span>
                  </div>
                  <span style={{ padding: '0.15rem 0.6rem', border: '1px solid var(--border)', borderRadius: '999px' }}>
                    {event.location || 'Location TBA'}
                  </span>
                </div>
                <p className="auth-meta" style={{ marginTop: '0.35rem' }}>{event.description || event.meta}</p>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                  <Button className="send-transfer" size="sm" onClick={() => navigate(`/events/${event.id}`, { state: { event } })}>View</Button>

                  {canManageEvent(event) && !["regular", "user", "cashier"].includes(effectiveRole) && (
                    <>
                      <Button
                        onClick={() => handleEdit(event)}
                        variant="outline"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => setDeleteConfirm(event.id)}
                        variant="destructive"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
      )}

      {view === 'createEvent' && <CreateEventPanel />}

      {/* Event Detail Modal (opens when clicking a calendar block) */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[640px]">
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <DialogClose asChild>
              <Button variant="ghost">Close</Button>
            </DialogClose>
          </div>
          <ViewEventCard event={selectedEvent} onClose={() => setModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (deleteConfirm) {
                  const eventToDelete = visibleEvents.find(e => e.id === deleteConfirm);
                  if (eventToDelete) {
                    handleDelete(eventToDelete);
                  }
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

