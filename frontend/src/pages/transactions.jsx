import { X } from "lucide-react"
import {useState, useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useSearchParams, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"
import { Tab } from "@/components/tab"

function MakeTransaction() {
const { addTransaction } = useAuth();
const [Ids, setIds] = useState([]);
const [currentId, setCurrentId] = useState('');
const [status, setStatus] = useState("");

const addId = () => {
  const newIds = currentId.split(',')
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n));

  if (newIds.length > 0) {
    setIds([...Ids, ...newIds]);
    setCurrentId('');
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  if (!data.utorid || !data.spent) {
    setStatus("Utorid and amount are required.");
    return;
  }
  try {
    await addTransaction({
      utorid: data.utorid,
      type: "purchase",
      spent: Number(data.spent),
      promotionIds: Ids,
      remark: data.remark || ""
    });
    setStatus("Transaction created successfully.");
    setIds([]);
    setCurrentId("");
    e.target.reset();
  } catch (err) {
    setStatus(err.message || "Failed to create transaction.");
  }
};
  return (
    <div className="w-full flex justify-center items-center" style={{"marginTop":"2rem"}}>
      <form style={{"width":"90%"}} onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Transaction</FieldLegend>
            <FieldDescription>
              All transactions are payments
            </FieldDescription>
            <FieldGroup>
              <Field>
              <FieldLabel htmlFor="utorid-1">
                Utorid <span style={{ color: "var(--destructive)" }}>*</span>
              </FieldLabel>
              <Input
                id="utorid-1"
                name="utorid"
                placeholder="doejo34"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="spend-1">
                Amount Spent <span style={{ color: "var(--destructive)" }}>*</span>
              </FieldLabel>
              <Input
                id="spend-1"
                name="spent"
                placeholder="29.99"
                required
              />
              <FieldDescription>
                Enter the the amount spent
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Promotions</FieldLegend>
            <FieldDescription>
                Enter the promotion Ids used in this purchase. Either one by one or in bulk by comma separating them.
            </FieldDescription>
            <FieldGroup>
              <Field orientation="horizontal">
  <div className="flex gap-2 mb-4">
    <Input
      type="promo-id-1"
      value={currentId}
      onChange={(e) => setCurrentId(e.target.value)}
      placeholder="Enter Id(s)"
      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addId())}
    />
    <Button type="button" onClick={addId}>Add</Button>
  </div>

  <div className="flex flex-wrap gap-2 mb-4" style={{"height": "36px"}}>
    {Ids.map((num, index) => (
      <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded rounded-md">
        <span>{num}</span>
        <button
          type="button"
          aria-label={`Remove promotion ID ${num}`}
          onClick={() => setIds(Ids.filter((_, i) => i !== index))}
          tabIndex={0}
          onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setIds(Ids.filter((_, i) => i !== index))}
        >
        <X style={{"height":"15px"}} aria-hidden="true" />
        </button>
      </div>
    ))}
  </div>
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSet>
            <FieldGroup>
              <Field>
              <FieldLabel htmlFor="remark-1">
                Remark
              </FieldLabel>
              <Textarea
                id="remark-1"
                name="remark"
                placeholder="Add any additional comments"
                className="resize-none"
              />
            </Field>
          </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
          </Field>
          {status && <p className="auth-meta" style={{ color: status.includes("successfully") ? "var(--foreground)" : "var(--destructive)" }}>{status}</p>}
        </FieldGroup>
      </form>
    </div>
  )
}

function MyTransactions() {
  const navigate = useNavigate();
  const { myTransactions, user, viewRole, updateTransaction, deleteTransaction } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const [typeFilter, setTypeFilter] = useState('all');
  const [idFilter, setIdFilter] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const [editMsg, setEditMsg] = useState("");

  // Filter transactions based on both filters
  const filteredTransactions = myTransactions.filter((tx) => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesId = idFilter === '' || tx.id.toString().includes(idFilter);
    return matchesType && matchesId;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortOrder === 'latest') {
      return b.id - a.id; // Assuming higher ID = newer transaction
    } else {
      return a.id - b.id; // Lower ID = older transaction
    }
  });

  const totalPages = Math.max(1, Math.ceil(sortedTransactions.length / pageSize));
  const pagedTransactions = sortedTransactions.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, idFilter, sortOrder, filteredTransactions.length]);

  return <>
      <div className="auth-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', marginTop: '2rem',  padding: '0 0', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger style={{ width: '200px' }}>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="redemption">Redemption</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Search by transaction ID"
            aria-label="Search by transaction ID"
            value={idFilter}
            onChange={(e) => setIdFilter(e.target.value)}
            style={{ flex: 1, maxWidth: '300px' }}
          />
        </div>
        
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger style={{ width: '150px' }}>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="latest">Latest First</SelectItem>
            <SelectItem value="earliest">Earliest First</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="auth-list">
        {pagedTransactions.map((tx) => (
          <article key={tx.id} className={`auth-card tx-card tx-card-${tx.type}`}>
            <div className="auth-card__row">
              <h3>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</h3>
              <span className="auth-badge">
                {tx.spent && ` $${tx.spent}`}
                {tx.earned && ` +${tx.earned} pts`}
                {tx.redeemed && ` -${tx.redeemed} pts`}
                {tx.sent && ` ${tx.sent} pts`}
              </span>
            </div>
            <p className="auth-meta">
              {tx.remark || 'No remark'}
            </p>
            <p className="auth-meta">ID: {tx.id}</p>
            <div className="tx-card-button">
        {(activeRole === 'manager' || activeRole === 'superuser' || activeRole === 'organizer') &&
          <Button type="button" size="sm" aria-label={`Adjust transaction ${tx.id}`} onClick={()=>navigate(`/transactions/${tx.id}/adjustment`)}
              className="mr-1"
              >Adjust</Button>
          }
              <Button variant="" size="sm" aria-label={`View transaction ${tx.id}`} onClick={() => {
                navigate(`/transactions/${tx.id}`);
              }}>View</Button>
              {(activeRole === 'manager' || activeRole === 'superuser') && (
                <>
                  <Button variant="" size="sm" onClick={async () => {
                    const remark = window.prompt("Update remark", tx.remark || "");
                    if (remark === null) return;
                    try {
                      await updateTransaction(tx.id, { remark });
                      setEditMsg("Remark updated.");
                    } catch (e) {
                      setEditMsg(e.message || "Update failed.");
                    }
                  }}>Edit</Button>
                  <Button variant="" size="sm" onClick={async () => {
                    try {
                      await deleteTransaction(tx.id);
                      setEditMsg("Transaction deleted.");
                    } catch (e) {
                      setEditMsg(e.message || "Delete failed.");
                    }
                  }}>Delete</Button>
                </>
              )}
            </div>
          </article>
        ))}
        {editMsg && <p className="auth-meta" style={{ marginTop: '0.75rem' }}>{editMsg}</p>}
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
}

function RedeemTransactions() {
  const navigate = useNavigate();
  const { transactions, user, viewRole } = useAuth();
  const [typeFilter, setTypeFilter] = useState('all');
  const [idFilter, setIdFilter] = useState('');
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const [ redeem, setRedeem ] = useState(null);
  const { getTransaction, processTransaction } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    console.log(data)
    const requiredFields = ["utorid-1"];
    const missing = {};
    requiredFields.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        missing[field] = "Required";
      }
    });

    if (Object.keys(missing).length > 0) {
      setRedeem("fail");
      console.log("fail")
      return;
    }

    console.log(data["utorid-1"])
    const tx = await getTransaction(data["utorid-1"]);
    console.log(tx)
    if (tx.type === 'redemption') {
      setRedeem(tx);
      console.log(tx)
    } else {
      setRedeem(null);
      console.log("fail2")
    }
    e.target.reset();
  };
  const handleSubmit2 = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    processTransaction(redeem.id);

    setRedeem(null);
    console.log(redeem.id)
    console.log("here")
    e.target.reset();
  };

  // Filter transactions based on both filters
  const filteredTransactions = transactions.filter((tx) => {
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    const matchesId = idFilter === '' || tx.id.toString().includes(idFilter);
    return matchesType && matchesId;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const pagedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, idFilter, filteredTransactions.length]);

  return <>

    {redeem ? redeem === 'fail' ?  <div>hi</div> : <>
<div className="w-full flex justify-center items-center" style={{"marginTop":"2rem", "width":"90%"}}>
  <form style={{"width":"90%"}} onSubmit={handleSubmit2}>
    <FieldGroup>
      <FieldSet>
        <FieldLegend>Redemption: TX-{redeem.id}</FieldLegend>
        <FieldDescription>
          Review Transaction TX-{redeem.id} for approval
        </FieldDescription>

        <FieldGroup>
          <Field>
            <FieldLabel>Transaction ID</FieldLabel>
            <FieldDescription>{redeem.id}</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Type</FieldLabel>
            <span className={`tx-badge redemption`}>
              Redemption
            </span>
          </Field>

          {redeem.redeemed !== null && redeem.redeemed !== undefined && (
            <Field>
              <FieldLabel>Redeemed</FieldLabel>
              <FieldDescription>{redeem.redeemed} points</FieldDescription>
            </Field>
          )}

          <Field>
            <FieldLabel>User (UTORid)</FieldLabel>
            <FieldDescription>{redeem.utorid}</FieldDescription>
          </Field>

          {redeem.createdBy && (
            <Field>
              <FieldLabel>Created By</FieldLabel>
              <FieldDescription>{redeem.createdBy}</FieldDescription>
            </Field>
          )}

          {redeem.relatedId !== null && redeem.relatedId !== undefined && (
            <Field>
              <FieldLabel>Related ID</FieldLabel>
              <FieldDescription>{redeem.relatedId}</FieldDescription>
            </Field>
          )}

          {redeem.remark && (
            <Field>
              <FieldLabel>Remark</FieldLabel>
              <Input name="remark"/>
            </Field>
          )}
        </FieldGroup>
      </FieldSet>

      <FieldSeparator />

      <Field orientation="horizontal">
        <Button type="submit" variant="default">Approve</Button>
        <Button type="button" variant="outline" onClick={() => setRedeem(null)}>Cancel</Button>
      </Field>
    </FieldGroup>
  </form>
</div>
    </>: <>
         <div className="w-full flex justify-center items-center" style={{"marginTop":"2rem"}}>
      <form style={{"width":"90%"}} onSubmit={handleSubmit}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Redeem Points</FieldLegend>
            <FieldDescription>
              Redeem points for a transaction
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="utorid-1">
                  Transaction Id <span style={{ color: "var(--destructive)" }}>*</span>
                </FieldLabel>
                <Input
                  id="utorid-1"
                  name="utorid-1"
                  placeholder="312"
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <FieldSeparator />
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
          </Field>
        </FieldGroup>
      </form>
    </div> </>}
    </>

}

export function Transactions() {
  const { user, viewRole } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const canCreateTransaction = activeRole === "cashier" || activeRole === "manager" || activeRole === "superuser";

  const [ view, changeView ] = useState('myTransactions');
  const toggleMyEvents = () => {
    console.log("here");
    changeView('myTransactions');
  };
  const toggleAllEvents = () => {
    console.log("here2");
    changeView('makeTransaction');
  };
  const toggleRedeemEvents = () => {
    console.log("here2");
    changeView('redeemTransactions');
  };


  return (
    <>
      <div className="auth-hero" style={{"marginBottom":"1.5rem"}}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'left' }}>
          <Tab
            isOn={view === 'myTransactions'}
            onClick={toggleMyEvents}
          >
            My Transactions
          </Tab>

          {canCreateTransaction && (
            <>
            <Tab
              isOn={view === 'makeTransaction'}
              onClick={toggleAllEvents}
            >
              Create Transaction
            </Tab>
            <Tab
              isOn={view === 'redeemTransactions'}
              onClick={toggleRedeemEvents}
            >
              Redeem Points
            </Tab>
          </>
          )}
        </div>
      </div>

      {view === 'myTransactions'? <MyTransactions /> : (canCreateTransaction ? view === 'makeTransaction' ? <MakeTransaction /> : <RedeemTransactions />: <MyTransactions />)}
      <Outlet />

    </>
  )
}
