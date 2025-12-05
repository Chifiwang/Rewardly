import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Update this import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";

export function ViewEventCard({ event, onClose }) {
  const { addMyEvent, myEvents, updateEvent } = useAuth();
  const [successOpen, setSuccessOpen] = useState(false);
  const [unRSVPOpen, setUnRSVPOpen] = useState(false);

  if (!event) return null;

  const alreadyRSVPd = myEvents.some(e => e.id === event.id);

  // -----------------------------
  // Form state
  // -----------------------------
  const [form, setForm] = useState({
    name: event.name || "",
    description: event.description || "",
    location: event.location || "",
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    capacity: event.capacity || "",
    pointsRemain: event.pointsRemain ?? "",
    pointsAwarded: event.pointsAwarded ?? "",
  });

  // -----------------------------
  // Submit handler
  // -----------------------------
  const handleSubmit = () => {
    const payload = {};

    if (form.name !== event.name) payload.name = form.name;
    if (form.description !== event.description) payload.description = form.description;
    if (form.location !== event.location) payload.location = form.location;

    // Safely handle startTime
    if (form.startTime) {
      const d = new Date(form.startTime);
      if (!isNaN(d.getTime()) && d.toISOString() !== event.startTime) {
        payload.startTime = d.toISOString();
      }
    }

    // Safely handle endTime
    if (form.endTime) {
      const d = new Date(form.endTime);
      if (!isNaN(d.getTime()) && d.toISOString() !== event.endTime) {
        payload.endTime = d.toISOString();
      }
    }

    if (form.capacity !== event.capacity) payload.capacity = form.capacity ? Number(form.capacity) : null;
    if (form.pointsRemain !== event.pointsRemain) payload.pointsRemain = form.pointsRemain !== "" ? Number(form.pointsRemain) : null;k
    if (form.pointsAwarded !== event.pointsAwarded) payload.pointsAwarded = form.pointsAwarded !== "" ? Number(form.pointsAwarded) : null;

    payload.id = event.id;

    updateEvent(event.id, payload);
    console.log("UPDATED EVENT PAYLOAD:", payload);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{event.name}</DialogTitle>
        {event.description && (
          <DialogDescription>
            {event.description}
          </DialogDescription>
        )}
      </DialogHeader>

      <div className="grid gap-4">

        {/* NAME */}
        <div className="grid gap-3">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* DESCRIPTION */}
        <div className="grid gap-3">
          <Label>Description</Label>
          <Input
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* LOCATION */}
        <div className="grid gap-3">
          <Label>Location</Label>
          <Input
            value={form.location}
            onChange={e => setForm({ ...form, location: e.target.value })}
          />
        </div>

        {/* START TIME */}
        <div className="grid gap-3">
          <Label>Start Time</Label>
          <Input
            type="datetime-local"
            value={form.startTime ? new Date(form.startTime).toISOString().slice(0,16) : ""}
            onChange={e => setForm({ ...form, startTime: e.target.value })}
          />
        </div>

        {/* END TIME */}
        <div className="grid gap-3">
          <Label>End Time</Label>
          <Input
            type="datetime-local"
            value={form.endTime ? new Date(form.endTime).toISOString().slice(0,16) : ""}
            onChange={e => setForm({ ...form, endTime: e.target.value })}
          />
        </div>

        {/* CAPACITY */}
        <div className="grid gap-3">
          <Label>Capacity</Label>
          <Input
            type="number"
            value={form.capacity}
            onChange={e => setForm({ ...form, capacity: e.target.value })}
          />
        </div>

        {/* POINTS REMAIN */}
        <div className="grid gap-3">
          <Label>Points Remaining</Label>
          <Input
            type="number"
            value={form.pointsRemain}
            onChange={e => setForm({ ...form, pointsRemain: e.target.value })}
          />
        </div>

        {/* POINTS AWARDED */}
        <div className="grid gap-3">
          <Label>Points Awarded</Label>
          <Input
            type="number"
            value={form.pointsAwarded}
            onChange={e => setForm({ ...form, pointsAwarded: e.target.value })}
          />
        </div>

      </div>

      <DialogFooter style={{ width: "100%" }}>
        <Button
          type="button"
          variant="default"
          className="send-transfer"
          style={{ width: "100%", justifyContent: "center" }}
          onClick={handleSubmit}
        >
          Confirm Changes
        </Button>
      </DialogFooter>

    </>
  );
}
export function ViewEventRouteEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { events } = useAuth();
  const passedEvent = location.state?.event;

  // Find the event by ID
  const event = passedEvent || events.find(e => e.id === id || e.id === parseInt(id));

  // If event not found, redirect back
  if (!event) {
    navigate(-1);
    return null;
  }

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={() => navigate(-1)}>
      <DialogContent className="sm:max-w-[425px]">
        <ViewEventCard event={event} onClose={() => navigate(-1)} />
      </DialogContent>
    </Dialog>
  )
}
