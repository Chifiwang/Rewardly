import { X } from "lucide-react"
import {useState} from "react"
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
import { useParams, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"
import { Tab } from "@/components/tab"
import { NotFound } from "../pages/notFound"

export function AdjustTransaction() {
  const { id } = useParams();
const [Ids, setIds] = useState([]);
const [currentId, setCurrentId] = useState('');
  const { user, viewRole, getTransaction } = useAuth();
  const navigate = useNavigate();
  const activeRole = viewRole || user?.role || "user";

const addId = () => {
  const newIds = currentId.split(',')
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n));

  if (newIds.length > 0) {
    setIds([...Ids, ...newIds]);
    setCurrentId('');
  }
};
  if ((activeRole !== 'manager' && activeRole !== 'superuser') || !getTransaction(id)) {
    return <NotFound />
  }

  return (
    <>
      <div className="auth-hero" style={{"marginBottom":"1.5rem"}}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start', justifyContent: 'left' }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/transactions")}>
            ← Back to transactions
          </Button>
          <Tab
            isOn={true}
          >
            Adjust Transaction: TX-{id}
          </Tab>
        </div>
      </div>
    <div className="w-full flex justify-center items-center" style={{"marginTop":"2rem"}}>
      <form style={{"width":"90%"}}>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Transaction</FieldLegend>
            <FieldDescription>
                Make an adjustment to transaction TX-{id}
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="utorid-1">
                  Utorid
                </FieldLabel>
                <Input
                  id="utorid-1"
                  placeholder="doejo34"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="spend-1">
                  Amount Spent
                </FieldLabel>
                <Input
                  id="spend-1"
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
                  placeholder="Add any additional comments"
                  className="resize-none"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  </>
  )
}
