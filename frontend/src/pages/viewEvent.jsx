import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Update this import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

export function ViewEventCard({ event, onClose }) {
  const { addMyEvent, myEvents, rsvpEvent, unRSVPEvent } = useAuth();
  const [successOpen, setSuccessOpen] = useState(false);
  const [unRSVPOpen, setUnRSVPOpen] = useState(false);

  if (!event) return null;

  const isActive = !event.endTime || new Date(event.endTime) > new Date();
  const hasEnded = event.endTime && new Date(event.endTime) < new Date();
  const alreadyRSVPd = myEvents.some(e => e.id === event.id);

  const handleRSVP = () => {
    rsvpEvent(event.id);
    addMyEvent(event);
    setSuccessOpen(true);
  };

  const handleUnRSVP = async () => {
    console.log("Attempting to cancel RSVP for event:", event.id);
    const success = await unRSVPEvent(event.id);
    console.log("Cancel RSVP result:", success);
    if (success) {
      setUnRSVPOpen(true);
    } else {
      console.error("Failed to cancel RSVP");
    }
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
        {event.location && (
          <div className="grid gap-3">
            <Label>Location</Label>
            <p className="text-sm">{event.location}</p>
          </div>
        )}
        <div className="grid gap-3">
          <Label>Start Time</Label>
          <p className="text-sm">{new Date(event.startTime).toLocaleString()}</p>
        </div>
        <div className="grid gap-3">
          <Label>End Time</Label>
          <p className="text-sm">{new Date(event.endTime).toLocaleString()}</p>
        </div>
        {event.capacity && (
          <div className="grid gap-3">
            <Label>Capacity</Label>
            <p className="text-sm">{event.capacity} attendees</p>
          </div>
        )}
        {event.pointsRemain !== null && event.pointsRemain !== undefined && (
          <div className="grid gap-3">
            <Label>Points Remaining</Label>
            <p className="text-sm">{event.pointsRemain}</p>
          </div>
        )}
        {event.pointsAwarded !== null && event.pointsAwarded !== undefined && (
          <div className="grid gap-3">
            <Label>Points Awarded</Label>
            <p className="text-sm">{event.pointsAwarded}</p>
          </div>
        )}
        {event.organizers && event.organizers.length > 0 && (
          <div className="grid gap-3">
            <Label>Organizers</Label>
            <p className="text-sm">{event.organizers.map(org => org.name).join(', ')}</p>
          </div>
        )}
        <div className="grid gap-3">
          <Label>Status</Label>
          <span className={"promo-badge " + (isActive ? "active" : "expired")}>
            {isActive ? "Active" : "Expired"}
          </span>
        </div>
      </div>
      <DialogFooter style={{ width: '100%' }}>
        {alreadyRSVPd && hasEnded ? (
          <Button type="button" variant="default" className="send-transfer" disabled style={{ width: '100%', justifyContent: 'center' }}>
            This event has passed
          </Button>
        ) : alreadyRSVPd ? (
          <Button type="button" variant="destructive" className="send-transfer" onClick={handleUnRSVP} style={{ width: '100%', justifyContent: 'center' }}>
            Cancel RSVP
          </Button>
        ) : isActive ? (
          <Button type="button" variant="default" className="send-transfer" onClick={handleRSVP} style={{ width: '100%', justifyContent: 'center' }}>
            RSVP
          </Button>
        ) : (
          <Button type="button" variant="default" className="send-transfer" disabled style={{ width: '100%', justifyContent: 'center' }}>
            Expired
          </Button>
        )}
      </DialogFooter>
      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>RSVP submitted successfully!</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="send-transfer" onClick={() => { setSuccessOpen(false); if (onClose) onClose(); }}>Dismiss</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={unRSVPOpen} onOpenChange={setUnRSVPOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>RSVP Cancelled</DialogTitle>
            <DialogDescription>Your RSVP has been cancelled successfully.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="send-transfer" onClick={() => { setUnRSVPOpen(false); if (onClose) onClose(); }}>Dismiss</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ViewEventRoute() {
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
