import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Tab } from "@/components/tab"
import { useAuth } from "../contexts/AuthContext"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"

function ViewEvent({event, name}) {
  const {addMyTransaction} = useAuth();
  console.log(event);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const requiredFields = ["spend-1"];
    const missing = {};
    requiredFields.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        missing[field] = "Required";
      }
    });

    if (Object.keys(missing).length > 0) {
      return;
    }

    addMyTransaction({amount: parseInt(data["spend-1"]), type:"redemption"});
    e.target.reset();
  };

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">{name}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
      <form onSubmit={handleSubmit}>
          <DialogHeader className="mb-5">
            <DialogTitle>{name}</DialogTitle>
            <DialogDescription>How many points do you want to redeem?</DialogDescription>
          </DialogHeader>
        <FieldGroup>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="spend-1">
                  Points Redeemed <span style={{ color: "var(--destructive)" }}>*</span>
                </FieldLabel>
                <Input
                  id="spend-1"
                  name="spend-1"
                  placeholder="100"
                  required
                />
                <FieldDescription>
                  Enter the points to be redeemed
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator className="mb-5"/>
        </FieldGroup>

          <DialogFooter>
          <Field orientation="horizontal">
            <DialogClose asChild>
            <Button type="submit">Submit</Button>
            </DialogClose>
          </Field>
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
      </form>
        </DialogContent>
    </Dialog>
  )
}

export function Redeem() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { getMyTransactions } = useAuth();
  const { user, viewRole } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getMyTransactions({type: "redemption", limit: 1});
        console.log(`recent: ${data}`)
        if (data) setRecent(data.results[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  fetchRecent();
  }, []);
  const qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=Rewardly+Sample+QR"

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download QR code:", error)
    }
  }

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false)
      }
    }
    window.addEventListener("keydown", handleEscape)

    // Prevent scrolling when modal is open
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      window.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = ""
    }
  }, [isModalOpen])

  const handleRedeem = () => {
    console.log("redeem")
  }

  return (
    <>
      <div className="auth-hero" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginTop: '2rem' }}>Share your QR with a cashier to redeem points.</h1>
        <p className="auth-subtitle">Cashiers can scan this to apply points instantly.</p>
      </div>

      <div className="auth-panels two-col">
        <div className="auth-card">
          <h3>Your QR code</h3>
          <p className="auth-meta">Show this at checkout or download it for your wallet.</p>
          <img
            className="qr-sample"
            src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=Rewardly+Sample+QR"
            alt="Sample Rewardly QR code"
            aria-label="Show enlarged QR code"
            tabIndex={0}
            role="button"
            onClick={() => setIsModalOpen(true)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsModalOpen(true)}
            style={{ cursor: "pointer" }}
          />
          <Button variant="ghost" size="sm" aria-label="Download QR code" onClick={handleDownload}>Download QR</Button>
          <ViewEvent name={"Redeem Points"}/>
        </div>
        {<div className="auth-card">
          <h3>Recent scans</h3>
          <div className="auth-meta" style={{marginBottom: '1.25rem'}}>Most recent scan:</div>
          {recent && <div className="recent-scan-sample" style={{background: '#f6f8fa', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem'}}>
            <div style={{fontWeight: 600, marginBottom: '0.25rem'}}>{String(recent.type).charAt(0).toUpperCase() + String(recent.type).slice(1)} {}</div>
            <div style={{fontSize: '0.95rem', color: '#555'}}>Cashier: {recent.processedBy}</div>
            <div style={{fontSize: '0.95rem', color: '#555'}}>Redeemed: {recent.redeemed === 'true'?"True" : "False"}</div>
            <div style={{fontSize: '0.95rem', color: '#555'}}>ID: TX-{recent.id}</div>
          </div>}
          <p className="auth-meta">Share your code to kick off a purchase or redemption.</p>
        </div>}
      </div>

      {isModalOpen && createPortal(
        <div className="qr-modal-overlay" role="dialog" aria-modal="true" aria-label="QR code modal" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsModalOpen(false)
          }
        }}>
          <div className="qr-modal-content">
            <img
              className="qr-modal-image"
              src="https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=Rewardly+Sample+QR"
              alt="Large Sample Rewardly QR code"
            />
            <p className="qr-modal-hint">Click outside to close or press Escape</p>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
