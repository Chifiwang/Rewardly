import { User, Mail, Lock, Eye, EyeOff, CheckCircle, UserPlus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { Tab } from "@/components/tab"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function Register() {
    const { register, user, viewRole } = useAuth();
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selectedRole, setSelectedRole] = useState("regular");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const [data, setData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    // Check if user has permission to register new users
    // viewRole is null when user is viewing as their actual role
    const effectiveRole = viewRole || user?.role || 'user';
    const canRegister = effectiveRole === 'cashier' || effectiveRole === 'manager' || effectiveRole === 'superuser';

    const handleChange = (e) => {
        const { id, value } = e.target;
        setData((prev) => ({ ...prev, [id]: value }));
        if (error) setError("");
        if (success) setSuccess("");
    };

    const validateForm = () => {
        if (data.username.length < 3 || data.username.length > 20) {
            setError("Username must be between 3 and 20 characters");
            return false;
        }

        if (!data.firstname.trim() || !data.lastname.trim()) {
            setError("First name and last name are required");
            return false;
        }

        if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            setError("Please enter a valid email address");
            return false;
        }

        if (data.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }

        if (data.password !== data.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        if (!selectedRole) {
            setError("Please select a role");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const trimmedUsername = data.username.trim();
            const fullName = `${data.firstname.trim()} ${data.lastname.trim()}`.trim();
            const emailValue = data.email && data.email.trim().length > 0 ? data.email.trim() : `${trimmedUsername}@example.com`;
            
            const requestBody = { utorid: trimmedUsername, name: fullName, email: emailValue, password: data.password };

            const res = await fetch(`${BACKEND_URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(requestBody)
            });
            const resData = await res.json();
            if (!res.ok) throw new Error(resData.error || "Registration failed");

            const roleRes = await fetch(`${BACKEND_URL}/users/${trimmedUsername}/role`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ role: selectedRole })
            });
            const roleData = await roleRes.json();
            if (!roleRes.ok) throw new Error(roleData.error || "Role assignment failed");

            setSuccess(`Account created successfully for ${trimmedUsername}!`);
            setData({ username: '', firstname: '', lastname: '', email: '', password: '', confirmPassword: '' });
            setSelectedRole("regular");
            if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError(err.message || "Registration failed. Please try again.");
            setIsSubmitting(false);
            return;
        }
        setIsSubmitting(false);
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    if (!canRegister) {
        return (
            <div className="admin-page">
                <div className="auth-hero hero-roomy">
                    <Tab isOn={true}>Access Denied</Tab>
                    <h1 className="auth-heading xl">Insufficient Permissions</h1>
                    <p className="auth-subtitle">
                        You need cashier, manager, or superuser privileges to register new users.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="auth-hero hero-roomy">
                <Tab isOn={true}>User Registration</Tab>
                <h1 className="auth-heading xl">Register New Member</h1>
                <p className="auth-subtitle">
                    Create a new member account. New users will receive 500 welcome bonus points.
                </p>
            </div>

            <section style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "100%", padding: "1.5rem 0" }}>
                    {success && (
                        <div style={{
                            padding: "1rem",
                            marginBottom: "1.5rem",
                            background: "var(--success-bg, #d1fae5)",
                            border: "1px solid var(--success-border, #10b981)",
                            borderRadius: "8px",
                            color: "var(--success-text, #065f46)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <CheckCircle size={20} />
                              <span>{success}</span>
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.25rem" }}>
                        <div className="stack">
                            <label htmlFor="username">
                                Username <span style={{ color: "var(--destructive)" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter username (utorid)"
                                    value={data.username}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    minLength={3}
                                    maxLength={20}
                                    style={{ paddingLeft: "2.5rem" }}
                                />
                                <User 
                                    size={18} 
                                    style={{ 
                                        position: "absolute", 
                                        left: "0.75rem", 
                                        top: "50%", 
                                        transform: "translateY(-50%)",
                                        color: "var(--muted-foreground)"
                                    }} 
                                />
                            </div>
                            <span className="auth-meta">3-20 characters, used for login</span>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div className="stack">
                                <label htmlFor="firstname">
                                    First Name <span style={{ color: "var(--destructive)" }}>*</span>
                                </label>
                                <Input
                                    id="firstname"
                                    type="text"
                                    placeholder="First name"
                                    value={data.firstname}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="stack">
                                <label htmlFor="lastname">
                                    Last Name <span style={{ color: "var(--destructive)" }}>*</span>
                                </label>
                                <Input
                                    id="lastname"
                                    type="text"
                                    placeholder="Last name"
                                    value={data.lastname}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="stack">
                            <label htmlFor="email">Email</label>
                            <div style={{ position: "relative" }}>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="email@example.com (optional)"
                                    value={data.email}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    style={{ paddingLeft: "2.5rem" }}
                                />
                                <Mail 
                                    size={18} 
                                    style={{ 
                                        position: "absolute", 
                                        left: "0.75rem", 
                                        top: "50%", 
                                        transform: "translateY(-50%)",
                                        color: "var(--muted-foreground)"
                                    }} 
                                />
                            </div>
                        </div>

                        <div className="stack">
                            <label>
                                Role <span style={{ color: "var(--destructive)" }}>*</span>
                            </label>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                {["regular", "cashier", "manager", "superuser"].map((role) => (
                                    <Button
                                        key={role}
                                        type="button"
                                        variant={selectedRole === role ? "default" : "outline"}
                                        onClick={() => setSelectedRole(role)}
                                        disabled={isSubmitting}
                                        style={{ textTransform: "capitalize" }}
                                    >
                                        {role}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="stack">
                            <label htmlFor="password">
                                Password <span style={{ color: "var(--destructive)" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Minimum 6 characters"
                                    value={data.password}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    minLength={6}
                                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                                />
                                <Lock 
                                    size={18} 
                                    style={{ 
                                        position: "absolute", 
                                        left: "0.75rem", 
                                        top: "50%", 
                                        transform: "translateY(-50%)",
                                        color: "var(--muted-foreground)"
                                    }} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isSubmitting}
                                    style={{
                                        position: "absolute",
                                        right: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "var(--muted-foreground)",
                                        padding: "0.25rem"
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <span className="auth-meta">Must be at least 6 characters</span>
                        </div>

                        <div className="stack">
                            <label htmlFor="confirmPassword">
                                Confirm Password <span style={{ color: "var(--destructive)" }}>*</span>
                            </label>
                            <div style={{ position: "relative" }}>
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Re-enter password"
                                    value={data.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                    minLength={6}
                                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                                />
                                <Lock 
                                    size={18} 
                                    style={{ 
                                        position: "absolute", 
                                        left: "0.75rem", 
                                        top: "50%", 
                                        transform: "translateY(-50%)",
                                        color: "var(--muted-foreground)"
                                    }} 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    disabled={isSubmitting}
                                    style={{
                                        position: "absolute",
                                        right: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        color: "var(--muted-foreground)",
                                        padding: "0.25rem"
                                    }}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div style={{ 
                                padding: "0.75rem 1rem", 
                                background: "var(--destructive-bg, #fee2e2)", 
                                border: "1px solid var(--destructive, #ef4444)",
                                borderRadius: "6px",
                                color: "var(--destructive, #dc2626)",
                                fontSize: "0.875rem"
                            }}>
                                {error}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                            <Button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="send-transfer"
                                style={{ flex: 1 }}
                            >
                                {isSubmitting ? (
                                    <>Creating Account...</>
                                ) : (
                                    <>
                                        <UserPlus size={18} />
                                        Create Account
                                    </>
                                )}
                            </Button>
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => {
                                    setData({
                                        username: '',
                                        firstname: '',
                                        lastname: '',
                                        email: '',
                                        password: '',
                                        confirmPassword: ''
                                    });
                                    setSelectedRole("regular");
                                    setError("");
                                    setSuccess("");
                                }}
                                disabled={isSubmitting}
                            >
                                Clear
                            </Button>
                        </div>
                    </form>

                    <div style={{ 
                        marginTop: "2rem", 
                        padding: "1.25rem", 
                        background: "var(--muted)", 
                        borderRadius: "8px",
                        borderLeft: "4px solid var(--primary)"
                    }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "0.75rem" }}>
                            New Member Benefits
                        </h3>
                        <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "grid", gap: "0.5rem" }}>
                            <li style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                500 welcome bonus points credited immediately
                            </li>
                            <li style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                Access to all active promotions and events
                            </li>
                            <li style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                Personalized QR code for quick transactions
                            </li>
                            <li style={{ fontSize: "0.875rem", color: "var(--muted-foreground)" }}>
                                Full transaction history and point tracking
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

        </div>
    );
}
