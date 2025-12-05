import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Tab } from "@/components/tab"
import { Redeem } from "@/pages/redeem"
import { useAuth } from "../contexts/AuthContext"

function MyQrPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { getMyTransactions } = useAuth();
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);
  const transferData = JSON.stringify({
    type: 'transfer',
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(transferData)}`;

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await getMyTransactions({limit: 1});
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

  const handleDownload = async () => {
    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "rewardly-qr-code.png"
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

  return (
    <>
      <div className="auth-hero" style={{ marginBottom: '2rem' }}>
        <h1 style={{ marginTop: '2rem' }}>Share your QR to start a transaction.</h1>
        <p className="auth-subtitle">Cashiers can scan this to apply promotions and assign points instantly.</p>
      </div>

      <div className="auth-panels two-col">
        <div className="auth-card">
          <h3>Your QR code</h3>
          <p className="auth-meta">Show this at checkout or download it for your wallet.</p>
          <img
            className="qr-sample"
            src={qrUrl}
            alt="Sample Rewardly QR code"
            aria-label="Show enlarged QR code"
            tabIndex={0}
            role="button"
            onClick={() => setIsModalOpen(true)}
            onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIsModalOpen(true)}
            style={{ cursor: "pointer" }}
          />
          <Button variant="ghost" size="sm" aria-label="Download QR code" onClick={handleDownload}>Download QR</Button>
        </div>
        <div className="auth-card">
          <h3>Recent scans</h3>
          <div className="auth-meta" style={{marginBottom: '1.25rem'}}>Most recent scan:</div>
          {recent && <div className="recent-scan-sample" style={{background: '#f6f8fa', borderRadius: '0.75rem', padding: '1rem', marginBottom: '0.5rem'}}>
            <div style={{fontWeight: 600, marginBottom: '0.25rem'}}>{String(recent.type).charAt(0).toUpperCase() + String(recent.type).slice(1)} {}</div>
            <div style={{fontSize: '0.95rem', color: '#555'}}>Cashier: {recent.processedBy}</div>
            <div style={{fontSize: '0.95rem', color: '#555'}}>Redeemed: {recent.redeemed === 'true'?"True" : "False"}</div>
            <div style={{fontSize: '0.95rem', color: '#555'}}>ID: TX-{recent.id}</div>
          </div>}
          <p className="auth-meta">Share your code to kick off a purchase or redemption.</p>
        </div>
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
              src={qrUrl}
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

export function QrPage() {
  const [qr, setQr] = useState("myQr");
  return <>
      <div className="auth-hero" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'left' }}>
        <Tab isOn={qr === 'myQr'} onClick={() => setQr("myQr")}>My QR</Tab>
        <Tab isOn={qr !== 'myQr'} onClick={() => setQr("redeemQr")}>Redeem Points</Tab>
      </ div>
        {qr === 'myQr' && <MyQrPage />}
        {qr === 'redeemQr' && <Redeem />}
      </ div>

  </>
}
