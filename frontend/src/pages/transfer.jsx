import { Button } from "@/components/ui/button"
import { Tab } from "@/components/tab"
import { useAuth } from "../contexts/AuthContext"

export function Transfer() {
  const { makeTransfer } = useAuth();
  const handleTransfer = (e) => {
    console.log("foo")
      e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    const requiredFields = ["transfer-user-id", "transfer-points"];
    const missing = {};
    console.log(data)
    requiredFields.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        missing[field] = "Required";
      }
    });

    if (Object.keys(missing).length > 0) {
      return;
    }

    const transactionPayload = {
      type: "transfer",
      amount: parseInt(data["transfer-points"], 10),
    };

    makeTransfer(data["transfer-user-id"], transactionPayload)

    e.target.reset();
}
  return (
    <>
      <div className="auth-hero">
        <Tab isOn={true}>Transfer points</Tab>
        <h1 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Send points to another member.</h1>
        <p className="auth-subtitle" style={{ marginBottom: '1.25rem' }}>Enter their user ID and amount. Transfers process instantly with audit logs.</p>
      </div>

      <div className="auth-panels two-col">
        <div className="auth-card">
          <h3>Transfer form</h3>
          <div className="auth-card__form">
            <form onSubmit={handleTransfer}>
              <label className="stack" htmlFor="transfer-user-id">
                <span>User ID</span>
                <input id="transfer-user-id" name="transfer-user-id" type="text" placeholder="utorid / member ID" aria-label="Recipient user ID" />
              </label>

              <label className="stack" htmlFor="transfer-points">
                <span>Points</span>
                <input id="transfer-points" type="number" name="transfer-points" placeholder="e.g., 200" aria-label="Points to transfer" />
              </label>

              <div className="form-actions">
                <Button type="submit" className="send-transfer" size="sm" aria-label="Send transfer">
                  Send transfer
                </Button>
              </div>
            </form>
          </div>
          </div>
          <div className="auth-card">
          <h3>Tips</h3>
          <ul className="tips-list">
            <li>
              <strong>Double-check recipient</strong>
              <div className="muted">Confirm the user ID or scan their QR to avoid misdirected transfers.</div>
            </li>
            <li>
              <strong>Audit trail</strong>
              <div className="muted">All transfers are logged under Transactions — include a memo if relevant.</div>
            </li>
            <li>
              <strong>Instant settlement</strong>
              <div className="muted">Transfers process instantly; refunds require manual review.</div>
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}
