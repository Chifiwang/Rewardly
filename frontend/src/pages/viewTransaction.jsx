import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function ViewTransactionRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getTransaction, viewRole, user } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const [ transaction, setTransaction ] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const data = await getTransaction(id);
        if (data) {
          setTransaction(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id]);

  useEffect(() => {
    if (!loading && !transaction) {
      navigate(-1);
    }
  }, [loading, transaction, navigate]);

  const [suspicious, setSuspicious] = useState(transaction ? transaction.suspicious:null);
  if (!transaction) return null;
  const markSuspicious = (val) => {
    setSuspicious(val);
  }

  const closeDialog = () => {
    navigate(-1);
  };

  // Helper function to format transaction type
  const formatType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  console.log(transaction)

  // Helper function to get badge class
  const getBadgeClass = (type) => {
    const badges = {
      purchase: 'purchase',
      redemption: 'redemption',
      adjustment: 'adjustment',
      event: 'event',
      transfer: 'transfer'
    };
    return `tx-badge ${badges[type] || ''}`;
  };

  return (
    <>
    <Dialog defaultOpen={true} open={true} onOpenChange={() => navigate(-1)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Transaction ID: {transaction.id}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label>Type</Label>
            <span className={getBadgeClass(transaction.type)}>
              {formatType(transaction.type)}
            </span>
          </div>

          {transaction.spent !== null && transaction.spent !== undefined && (
            <div className="grid gap-3">
              <Label>Spent</Label>
              <p className="text-sm">${transaction.spent}</p>
            </div>
          )}

          {transaction.earned !== null && transaction.earned !== undefined && (
            <div className="grid gap-3">
              <Label>Earned</Label>
              <p className="text-sm">{transaction.earned} points</p>
            </div>
          )}

          {transaction.amount !== null && transaction.amount !== undefined && (
            <div className="grid gap-3">
              <Label>Amount</Label>
              <p className="text-sm">${transaction.amount}</p>
            </div>
          )}

          {transaction.redeemed !== null && transaction.redeemed !== undefined && (
            <div className="grid gap-3">
              <Label>Redeemed</Label>
              <p className="text-sm">{transaction.redeemed} points</p>
            </div>
          )}

          {transaction.sent !== null && transaction.sent !== undefined && (
            <div className="grid gap-3">
              <Label>Sent</Label>
              <p className="text-sm">{transaction.sent} points</p>
            </div>
          )}

          {transaction.sender && (
            <div className="grid gap-3">
              <Label>Sender</Label>
              <p className="text-sm">{transaction.sender}</p>
            </div>
          )}

          {transaction.recipient && (
            <div className="grid gap-3">
              <Label>Recipient</Label>
              <p className="text-sm">{transaction.recipient}</p>
            </div>
          )}

          <div className="grid gap-3">
            <Label>User (UTORid)</Label>
            <p className="text-sm">{transaction.utorid}</p>
          </div>

          {transaction.createdBy && (
            <div className="grid gap-3">
              <Label>Created By</Label>
              <p className="text-sm">{transaction.createdBy}</p>
            </div>
          )}

          {transaction.processedBy && (
            <div className="grid gap-3">
              <Label>Processed By</Label>
              <p className="text-sm">{transaction.processedBy}</p>
            </div>
          )}

          {transaction.relatedId !== null && transaction.relatedId !== undefined && (
            <div className="grid gap-3">
              <Label>Related ID</Label>
              <p className="text-sm">{transaction.relatedId}</p>
            </div>
          )}

          {transaction.remark && (
            <div className="grid gap-3">
              <Label>Remark</Label>
              <p className="text-sm">{transaction.remark}</p>
            </div>
          )}

          {transaction.promotionIds && transaction.promotionIds.length > 0 && (
            <div className="grid gap-3">
              <Label>Related Promotions</Label>
              <div className="flex flex-wrap gap-2">
                {transaction.promotionIds.map(promo => (
                  <span key={promo.id} className="auth-badge text-xs">
                    {promo.name || `Promo ${promo.id}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {(activeRole === 'manager' || activeRole === 'superuser' || activeRole === 'organizer') &&
          <div className="grid gap-3">
            <Label>Suspicious Status</Label>
            <div className="flex">
              <Switch
                id="suspicious-toggle"
                checked={suspicious}
                onCheckedChange={(val) => markSuspicious(val)}
              />
              <Label htmlFor="suspicious-toggle" className="pl-4">
                Mark as Suspicious
              </Label>
            </div>
          </div>}

        <DialogFooter>
        {(activeRole === 'manager' || activeRole === 'superuser' || activeRole === 'organizer') &&
          <Button type="button" onClick={()=>navigate("adjustment")}>Adjust</Button>
          }
          <Button type="button" onClick={closeDialog}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
