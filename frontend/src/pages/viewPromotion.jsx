import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext'; // Update this import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export function ViewPromotionRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { promotions, applyPromotion } = useAuth();
  const [message, setMessage] = useState("");
  const passedPromotion = location.state?.promotion;
  const { getPromotion } = useAuth();
  const [promotion, setPromotion] = useState(passedPromotion || null);
  const [loading, setLoading] = useState(!passedPromotion);

  useEffect(() => {
    const fetchPromotion = async () => {
      // First, try to find the promotion locally
      const localPromotion = passedPromotion || promotions.find(p => p.id === id || p.id === parseInt(id));
      if (localPromotion) {
        setPromotion(localPromotion);
        setLoading(false);
        return;
      }

      // Otherwise, fetch from backend
      try {
        const data = await getPromotion(id);
        if (data) {
          setPromotion(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotion();
  }, [id, passedPromotion, promotions, getPromotion]);

  // While loading, don't render anything
  if (loading) return null;

  // If still not found after fetching, redirect
  if (!promotion) {
    navigate(-1);
    return null;
  }
  const isActive = !promotion.endTime || new Date(promotion.endTime) > new Date();

  return (
    <Dialog defaultOpen={true} open={true} onOpenChange={() => navigate(-1)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{promotion.name}</DialogTitle>
            {promotion.description && (
              <DialogDescription>
                {promotion.description}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label>Type</Label>
              <p className="text-sm">{promotion.type}</p>
            </div>
            {promotion.startTime && (
              <div className="grid gap-3">
                <Label>Start Time</Label>
                <p className="text-sm">{new Date(promotion.startTime).toLocaleString()}</p>
              </div>
            )}
            {promotion.endTime && (
              <div className="grid gap-3">
                <Label>End Time</Label>
                <p className="text-sm">{new Date(promotion.endTime).toLocaleString()}</p>
              </div>
            )}
            {promotion.minSpending !== null && promotion.minSpending !== undefined && (
              <div className="grid gap-3">
                <Label>Minimum Spending</Label>
                <p className="text-sm">${promotion.minSpending}</p>
              </div>
            )}
            {promotion.rate !== null && promotion.rate !== undefined && (
              <div className="grid gap-3">
                <Label>Rate</Label>
                <p className="text-sm">{promotion.rate}x multiplier</p>
              </div>
            )}
            {promotion.points !== null && promotion.points !== undefined && (
              <div className="grid gap-3">
                <Label>Points</Label>
                <p className="text-sm">{promotion.points} points</p>
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
            {message && <p className="auth-meta" style={{ color: "var(--foreground)" }}>{message}</p>}
            {isActive ? (
              <Button
                type="button"
                variant="default"
                className="send-transfer"
                onClick={async () => {
                  try {
                    await applyPromotion(promotion.id);
                    setMessage("Promotion applied successfully.");
                  } catch (e) {
                    setMessage(e.message || "Failed to apply promotion.");
                  }
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Apply
              </Button>
            ) : (
              <Button type="button" variant="default" className="send-transfer" disabled style={{ width: '100%', justifyContent: 'center' }}>
                Expired
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}
