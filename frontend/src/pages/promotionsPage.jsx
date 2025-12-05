import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Filter } from "@/components/filter"
import { useAuth } from "../contexts/AuthContext"
import { useSearchParams, useNavigate, Outlet } from "react-router-dom";
import { Tab } from "@/components/tab"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const requiredMark = <span style={{ color: "var(--destructive)" }}>*</span>;

function DeletePromotionDialog({ onConfirm, triggerLabel = "Delete" }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleDelete = () => {
    if (!password.trim()) {
      setError("Please enter your password to confirm.");
      return;
    }
    setError("");
    onConfirm(password);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="send-transfer">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete promotion?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The promotion will be removed for everyone.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <Label htmlFor="delete-password">Confirm with password</Label>
          <Input
            id="delete-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p style={{ color: "var(--destructive)" }}>{error}</p>}
        </div>
          <DialogFooter style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <DialogClose asChild>
              <Button variant="default" className="send-transfer">Cancel</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button variant="default" className="send-transfer" onClick={handleDelete} disabled={!password.trim()}>Delete</Button>
            </DialogClose>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditPromotionDialog({ promotion, onSave, triggerLabel = "Edit" }) {
  const { deletePromotion } = useAuth();
  const [dirty, setDirty] = useState(false);
  const [open, setOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    onSave(promotion.id, data);
    setDirty(false);
    setOpen(false);
  };

  const handleDelete = () => {
    if (!deletePassword.trim()) {
      setDeleteError("Password is required to delete.");
      return;
    }
    setDeleteError("");
    deletePromotion(promotion.id, deletePassword)
      .then(() => {
        setDeleteOpen(false);
        setOpen(false);
        setDirty(false);
        setDeletePassword("");
      })
      .catch((err) => {
        setDeleteError(err.message || "Failed to delete promotion.");
      });
  };

  const handleOpenChange = (next) => {
    if (!next && dirty) {
      setDiscardOpen(true);
      return;
    }
    setOpen(next);
    if (!next) setDirty(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm" className="send-transfer">{triggerLabel}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogDescription>Update promotion details and save changes.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="name-edit">Name</Label>
              <Input id="name-edit" name="name" defaultValue={promotion.name} onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description-edit">Description</Label>
              <Input id="description-edit" name="description" defaultValue={promotion.description || ""} onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="type-edit">Type</Label>
              <Input id="type-edit" name="type" defaultValue={promotion.type || ""} onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="startTime-edit">Start Time</Label>
              <Input id="startTime-edit" name="startTime" type="datetime-local" defaultValue={promotion.startTime} onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="endTime-edit">End Time</Label>
              <Input id="endTime-edit" name="endTime" type="datetime-local" defaultValue={promotion.endTime} onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="minSpending-edit">Minimum Spending Requirement</Label>
              <Input id="minSpending-edit" name="minSpending" type="number" min="0" step="1" defaultValue={promotion.minSpending ?? ""} onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="rate-edit">Point Accumulation Rate</Label>
              <Input id="rate-edit" name="rate" type="number" min="0" step="0.01" defaultValue={promotion.rate ?? ""} onChange={() => setDirty(true)} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="points-edit">Points</Label>
              <Input id="points-edit" name="points" type="number" min="0" step="1" defaultValue={promotion.points ?? ""} onChange={() => setDirty(true)} />
            </div>
          </div>
          <DialogFooter style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="outline"
              className="send-transfer"
              style={{ borderColor: 'var(--destructive)', color: 'var(--destructive)', background: 'transparent' }}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
            <DialogClose asChild>
              <Button type="submit" className="send-transfer" style={{ marginLeft: 'auto' }}>Save changes</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>

      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>You have some changes. Discard or keep editing?</DialogDescription>
          </DialogHeader>
          <DialogFooter style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" className="send-transfer" onClick={() => setDiscardOpen(false)}>Keep editing</Button>
            <Button
              className="send-transfer"
              onClick={() => {
                setDiscardOpen(false);
                setDirty(false);
                setOpen(false);
              }}
            >
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Delete promotion</DialogTitle>
            <DialogDescription>Enter your password to confirm deletion.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <Label htmlFor="delete-password">Password</Label>
            <Input
              id="delete-password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            {deleteError && <p style={{ color: "var(--destructive)" }}>{deleteError}</p>}
          </div>
          <DialogFooter style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button variant="outline" className="send-transfer" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button className="send-transfer" onClick={handleDelete} disabled={!deletePassword.trim()}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}

function CreatePromotionPanel() {
  const { addPromotion, promotions } = useAuth();
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    const requiredFields = ["name", "description", "type", "startTime", "endTime", "points"];
    const missing = {};
    requiredFields.forEach((field) => {
      if (!data[field] || String(data[field]).trim() === "") {
        missing[field] = "Required";
      }
    });

    const name = (data.name || "").toString().trim();
    if (name && promotions.some(p => (p.name || "").toString().trim().toLowerCase() === name.toLowerCase())) {
      missing.name = "A promotion with this name already exists.";
    }

    if (Object.keys(missing).length > 0) {
      setErrors(missing);
      setSuccess("");
      return;
    }

    setErrors({});
    addPromotion(data);
    setSuccess("Promotion created successfully");
    setSuccessOpen(true);
    e.target.reset();
  };

  return (
    <div style={{ width: '100%', padding: '1rem 0' }}>
      <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '0.5rem' }}>Create a new promotion</h2>
        <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>Set the basics, then publish.</p>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="promo-name">Name {requiredMark}</Label>
            <Input id="promo-name" name="name" placeholder="Double Points Weekend" aria-invalid={!!errors.name} />
            {errors.name && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.name}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="promo-description">Description {requiredMark}</Label>
            <Input id="promo-description" name="description" placeholder="Earn 2x on every swipe." aria-invalid={!!errors.description} />
            {errors.description && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.description}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="promo-type">Type {requiredMark}</Label>
            <Input id="promo-type" name="type" placeholder="Automatic" aria-invalid={!!errors.type} />
            {errors.type && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.type}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="promo-start">Start Time {requiredMark}</Label>
            <Input id="promo-start" name="startTime" type="datetime-local" aria-invalid={!!errors.startTime} />
            {errors.startTime && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.startTime}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="promo-end">End Time {requiredMark}</Label>
            <Input id="promo-end" name="endTime" type="datetime-local" aria-invalid={!!errors.endTime} />
            {errors.endTime && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.endTime}</span>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="promo-min">Minimum Spending</Label>
            <Input id="promo-min" name="minSpending" type="number" min="0" step="1" placeholder="0" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="promo-rate">Point Accumulation Rate</Label>
            <Input id="promo-rate" name="rate" type="number" min="0" step="0.01" placeholder="1.5" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="promo-points">Points {requiredMark}</Label>
            <Input id="promo-points" name="points" type="number" min="0" step="1" placeholder="500" aria-invalid={!!errors.points} />
            {errors.points && <span className="auth-meta" style={{ color: "var(--destructive)" }}>{errors.points}</span>}
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Button type="submit" className="send-transfer">Create Promotion</Button>
          </div>
        </form>
      </div>
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

function SearchPromotions() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("latest")
  const { user, viewRole, promotions, myPromotions, addMyPromotions, updatePromotion, deletePromotion, applyPromotion } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const [params] = useSearchParams();
  const all = Object.fromEntries(params.entries());
  const pageSize = 6;
  const [page, setPage] = useState(1);
  const [applyMessages, setApplyMessages] = useState({});
  const [successOpen, setSuccessOpen] = useState(false);
  const [successText, setSuccessText] = useState("");

  const filtered = useMemo(() => {
    const now = new Date();
    const startedParam = all.started === "true" || all.started === true;
    const endedParam = all.ended === "true" || all.ended === true;
    const nameParam = all.name?.toLowerCase();
    const descParam = all.description?.toLowerCase();

    const list = (promotions || []).filter((promo) => {
      const starts = promo.startTime ? new Date(promo.startTime) : null;
      const ends = promo.endTime ? new Date(promo.endTime) : null;
      const hasStarted = starts ? starts <= now : true;
      const hasEnded = ends ? ends < now : false;

      if (startedParam && !hasStarted) return false;
      if (endedParam && !hasEnded) return false;

      const matchesQuery =
        !query ||
        promo.name?.toLowerCase().includes(query.toLowerCase()) ||
        promo.description?.toLowerCase().includes(query.toLowerCase());
      if (!matchesQuery) return false;
      if (nameParam && !promo.name?.toLowerCase().includes(nameParam)) return false;
      if (descParam && !promo.description?.toLowerCase().includes(descParam)) return false;
      return true;
    });

    return [...list].sort((a, b) => {
      const aStart = a.startTime ? new Date(a.startTime).getTime() : Number.NEGATIVE_INFINITY;
      const bStart = b.startTime ? new Date(b.startTime).getTime() : Number.NEGATIVE_INFINITY;
      if (sort === "earliest") return aStart - bStart;
      return bStart - aStart;
    });
  }, [all, promotions, query, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pagedPromos = filtered.slice((page - 1) * pageSize, page * pageSize);

  const filters = {
    name: ["string", "Promotion Name"],
    description: ["string", "Description"],
    started: ["boolean", "Promotion Started"],
    ended: ["boolean", "Promotion Ended"],
  }

  const addToMyPromotion = (e) => {
    addMyPromotions(e);
  }

  const handleDelete = (id, _password) => {
    deletePromotion(id);
  };

  const handleUpdate = (id, data) => {
    updatePromotion(id, data);
  };

  const handleApply = async (promo) => {
    // If already applied, just surface the popup and return
    if ((myPromotions || []).some((p) => p.id === promo.id)) {
      setSuccessText(`${promo.name} is already applied.`);
      setSuccessOpen(true);
      return;
    }
    try {
      await applyPromotion(promo.id);
      addMyPromotions(promo);
      setSuccessText(`Applied ${promo.name} successfully.`);
      setSuccessOpen(true);
    } catch (e) {
      const msg = e.message || "Failed to apply promotion.";
      // If already applied, show popup with that message
      if (msg.toLowerCase().includes("already") || msg.toLowerCase().includes("exists")) {
        setSuccessText(msg);
        setSuccessOpen(true);
      }
      setApplyMessages((prev) => ({ ...prev, [promo.id]: msg }));
    }
  };

  useEffect(() => {
    setPage(1);
  }, [query, sort, filtered.length, all.started, all.ended, all.name, all.description]);

  return (
    <>
      <div className="auth-hero" style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>
        <h1>Offers tailored to your account.</h1>
        <p className="auth-subtitle">Apply promos during checkout or transfers. Filter by status or search by name.</p>
      </div>

      <div className="promotions-toolbar" style={{ alignItems: 'center', gap: '1rem' }}>
        <div className="search-add">
          <div className="search">
            <input
              aria-label="Search promotions"
              placeholder="Search promotions"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <Label style={{ minWidth: "80px" }}>Sort by</Label>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest first</SelectItem>
                <SelectItem value="earliest">Earliest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Filter name="Promotion Filter" desc="Filter promotions" fields={filters}/>
        </div>
      </div>

      <div className="promo-grid">
        {pagedPromos.length === 0 && (
          <div className="auth-card">
            <p className="muted">No promotions match your filters.</p>
          </div>
        )}

{pagedPromos.map((promo) => {
  const isExpired = promo.endTime && new Date(promo.endTime) <= new Date();
  return (
    <article key={promo.name} className="promo-card auth-card" style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.5rem'}}>
      <div className="promo-card__head" style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem'}}>
        <h3 style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0}}>{promo.name}</h3>
        <span
          className={"promo-badge " + (!promo.endTime || !isExpired ? "active" : "expired")}
        >
          {promo.endTime ? new Date(promo.endTime).toLocaleDateString() : "No End Date"}
        </span>
      </div>
      <p className="auth-meta" style={{ textAlign: 'left' }}>{promo.description}</p>
      <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
        {promo.points !== undefined && promo.points !== null && <span className="auth-badge" style={{background: 'var(--muted)', color: 'var(--foreground)'}}>Points: {promo.points}</span>}
        {promo.minSpending !== undefined && promo.minSpending !== null && <span className="auth-badge" style={{background: 'var(--muted)', color: 'var(--foreground)'}}>Min spend: ${promo.minSpending}</span>}
      </div>
      <div className="promo-card__actions" style={{marginTop: 'auto', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'nowrap', alignItems: 'center', width: '100%'}}>
        <Button variant="default" className="send-transfer" size="sm" onClick={()=>{
              navigate(`${promo.id}`, { state: { promotion: promo } });
                        }}>View</Button>
        {(activeRole === 'manager' || activeRole === 'superuser') && (
            <EditPromotionDialog promotion={promo} onSave={handleUpdate} />
        )}
        <Button variant="default" className="send-transfer" size="sm" onClick={() => handleApply(promo)} disabled={isExpired}>Apply</Button>
      </div>
    </article>
)})}

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Promotion applied</DialogTitle>
            <DialogDescription>{successText}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button className="send-transfer" onClick={() => setSuccessOpen(false)}>Dismiss</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  )
}

function MyPromotions() {
  const navigate = useNavigate();
  const { myPromotions, user, viewRole, updatePromotion, deletePromotion } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const canManagePromos = activeRole === "manager" || activeRole === "superuser";
  const pageSize = 5;
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil((myPromotions?.length || 0) / pageSize));
  const pagedPromos = (myPromotions || []).slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = (id, _password) => {
    deletePromotion(id);
  };

  const handleUpdate = (id, data) => {
    updatePromotion(id, data);
  };

  return <>
    <h1 style={{ marginTop: '2rem', marginBottom: '0.5rem' }}>Your Active Promotions</h1>
    <p className="auth-subtitle" style={{ marginBottom: '2rem' }}>View all promotions you've applied to your account.</p>
    <div className="auth-list">
      {pagedPromos.map((promo) => (
        <article key={promo.name} className="auth-card">
          <div className="auth-card__row">
            <h3>{promo.name}</h3>
            <span className="auth-badge">{promo.type}</span>
          </div>
          <p className="auth-meta">{promo.description}</p>
          <p className="auth-meta pb-2">
            {promo.endTime ? `Expires: ${new Date(promo.endTime).toDateString()}` : "No expiration"}
          </p>
        <div className="promo-card__actions" style={{marginTop: 'auto', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap'}}>
            <Button variant="default" className="send-transfer" size="sm" aria-label={`View promotion ${promo.name}`} onClick={()=>{
                  navigate(`${promo.id}`, { state: { promotion: promo } });
                            }}>View</Button>
            {canManagePromos && (
              <>
                <EditPromotionDialog promotion={promo} onSave={handleUpdate} />
                <DeletePromotionDialog onConfirm={(password) => handleDelete(promo.id, password)} />
              </>
            )}
          </div>
        </article>
      ))}
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

export function PromotionsPage() {
  const { user, viewRole } = useAuth();
  const activeRole = viewRole || user?.role || "user";
  const canManagePromos = activeRole === "manager" || activeRole === "superuser";
  const [ view, changeView ] = useState('myPromotions');
  const toggleMyEvents = () => {
    console.log("here");
    changeView('myPromotions');
  };
  const toggleAllEvents = () => {
    console.log("here2");
    changeView('searchPromotions');
  };
  const toggleCreate = () => {
    changeView('createPromotion');
  };

  return (
    <>
      <div className="auth-hero" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', justifyContent: 'left' }}>
          <Tab
            isOn={view === 'myPromotions'}
            onClick={toggleMyEvents}
          >
            My Promotions
          </Tab>
          <Tab
            isOn={view === 'searchPromotions'}
            onClick={toggleAllEvents}
          >
            All Promotions
          </Tab>
          {canManagePromos && (
            <Tab
              isOn={view === 'createPromotion'}
              onClick={toggleCreate}
            >
              Create Promotion
            </Tab>
          )}
        </div>
      </div>

      {view === 'myPromotions' && <MyPromotions />}
      {view === 'searchPromotions' && <SearchPromotions />}
      {view === 'createPromotion' && canManagePromos && <CreatePromotionPanel />}
      <Outlet />
    </>
  )}
