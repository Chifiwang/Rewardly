import { useState, useRef, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { QrCode, UserRound, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAuth } from "../contexts/AuthContext"

export function LoggedNavbar() {
  const [isMobile, changeSize] = useState(null);
  const linksRef = useRef(null);
  // default to no mask until we compute scrollability
  const [mask, setMask] = useState("none");
  const { pathname, hash } = useLocation()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const auth = useAuth();
  const utorid = auth?.user?.utorid || "demo-user"
  const navigate = useNavigate()
  const roleOrder = ["user", "cashier", "organizer", "manager", "superuser"];
  const roleLabels = {
    user: "Regular User",
    cashier: "Cashier",
    organizer: "Event Organizer",
    manager: "Manager",
    superuser: "Superuser"
  };

  // Determine the active role - either viewRole or actual user role
  const activeRole = auth?.viewRole || auth?.user?.role || "user"
  const userRole = auth?.user?.role || "user";
  const userRank = roleOrder.indexOf(userRole);
  const switchableRoles = roleOrder.filter((r) => roleOrder.indexOf(r) <= userRank);

  // Define which links are visible for each role
  const roleLinks = {
    user: ["/dashboard", "/qr", "/transfer", "/promotions", "/events", "/transactions", "/calendar"],
    cashier: ["/dashboard", "/qr", "/transfer", "/promotions", "/events", "/transactions", "/calendar", "/register"],
    manager: ["/dashboard", "/qr", "/transfer", "/promotions", "/events", "/transactions", "/calendar", "/register", "/admin"],
    organizer: ["/dashboard", "/qr", "/transfer", "/promotions", "/events", "/transactions", "/calendar"],
    superuser: ["/dashboard", "/qr", "/transfer", "/promotions", "/events", "/transactions", "/calendar", "/register", "/admin"]
  }

  const visibleLinks = roleLinks[activeRole] || roleLinks.user

  const shouldShowLink = (route) => {
    return visibleLinks.includes(route)
  }

	useEffect(() => {
	  const handleResize = () => {
		if (window.innerWidth >= 768 && isMobile) {
		  console.log("view changed")
		  changeSize(false);
	    } else if (window.innerWidth < 768 && !isMobile) {
			console.log("view changed")
			changeSize(true);
		}
	  };

        changeSize(window.innerWidth < 768);

	  window.addEventListener('resize', handleResize);
	  return () => window.removeEventListener('resize', handleResize);
	}, [isMobile])


useEffect(() => {
  const el = linksRef.current;
  if (!el) return;

  const update = () => {
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScroll = scrollWidth - clientWidth;

    // Not scrollable → no mask
    if (scrollWidth <= clientWidth) {
      setMask("none");
      return;
    }

    // Left edge → fade only on the right
    if (scrollLeft <= 0) {
      setMask(
        "linear-gradient(to right, rgba(0,0,0,1) 0, rgba(0,0,0,1) calc(100% - 100px), rgba(0,0,0,0) 100%)"
      );
      return;
    }

    // Right edge → fade only on the left
    if (scrollLeft >= maxScroll - 1) {
      setMask(
        "linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) 100px, rgba(0,0,0,1) 100%)"
      );
      return;
    }

    // Middle → fade both ends
    setMask(
      "linear-gradient(to right, rgba(0,0,0,0) 0, rgba(0,0,0,1) 100px, rgba(0,0,0,1) calc(100% - 100px), rgba(0,0,0,0) 100%)"
    );
  };

  update();
  el.addEventListener("scroll", update);
  window.addEventListener("resize", update);

  return () => {
    el.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
}, [pathname]);


  useEffect(() => {
    const handleClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const normalizeHash = (value) => value || "#overview"
  const currentHash = normalizeHash(hash)

  const isActive = (route) => {
    if (route.startsWith("/dashboard#")) {
      const targetHash = normalizeHash(route.substring(route.indexOf("#")))
      return pathname.startsWith("/dashboard") && currentHash === targetHash
    }
    return pathname.startsWith(route)
  }

  const handleLogout = () => {
    console.log("here");
    auth.logout();
  }

  return (
    <header className="auth-navbar">
      <div className="auth-navbar__inner">
        <Link to="/app" className="auth-navbar__brand" aria-label="Rewardly home">
          <QrCode className="auth-navbar__icon" aria-hidden />
          <span className="auth-navbar__logo-text">Rewardly</span>
        </Link>

				{(isMobile !== null) && (!isMobile ? <>
        <nav className="auth-navbar__links" aria-label="Authenticated navigation"
          ref={linksRef}
          style={{
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
        >
          {shouldShowLink("/dashboard") && <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>Dashboard</Link>}
          {shouldShowLink("/qr") && <Link to="/qr" className={isActive("/qr") ? "active" : ""}>My QR</Link>}
          {shouldShowLink("/transfer") && <Link to="/transfer" className={isActive("/transfer") ? "active" : ""}>Transfer</Link>}
          {shouldShowLink("/promotions") && <Link to="/promotions" className={isActive("/promotions") ? "active" : ""}>Promotions</Link>}
          {shouldShowLink("/events") && <Link to="/events" className={isActive("/events") ? "active" : ""}>Events</Link>}
          {shouldShowLink("/transactions") && <Link to="/transactions" className={isActive("/transactions") ? "active" : ""}>Transactions</Link>}
          {shouldShowLink("/calendar") && <Link to="/calendar" className={isActive("/calendar") ? "active" : ""}>Calendar</Link>}
          {shouldShowLink("/admin") && <Link to="/admin" className={isActive("/admin") ? "active" : ""}>Admin</Link>}
        </nav>

        <div className="auth-navbar__profile" ref={dropdownRef}>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button className="app-navbar__login" asChild>
                <Link to="#"><UserRound aria-hidden /></Link>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <Link to={`/profile/${utorid}`}>My profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>Switch View</DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => auth.switchViewRole(null)}>
                        {auth.viewRole === null ? "✓ " : ""}My Role ({auth?.user?.role || "user"})
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {switchableRoles.map((role) => (
                        <DropdownMenuItem key={role} onClick={() => auth.switchViewRole(role)}>
                          {auth.viewRole === role ? "✓ " : ""}{roleLabels[role] || role}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                auth.logout();
                navigate("/login")
              }}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </> : <>
          <div className="auth-navbar__profile" ref={dropdownRef}>
          <Button variant="ghost" size="icon" className="profile-trigger" onClick={() => setOpen(!open)} aria-label="Profile menu">
            <UserRound aria-hidden />
          </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button className="app-navbar__login" asChild>
                            <Link to="/login#login-form"><Menu /></Link>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <Link to={`/profile/${utorid}`}>My profile</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>Switch View</DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => auth.switchViewRole(null)}>
                              {auth.viewRole === null ? "✓ " : ""}My Role ({auth?.user?.role || "user"})
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {switchableRoles.map((role) => (
                              <DropdownMenuItem key={role} onClick={() => auth.switchViewRole(role)}>
                                {auth.viewRole === role ? "✓ " : ""}{roleLabels[role] || role}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                            auth.logout();
                            navigate("/login")
                         }}>
                          Log out
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
	                      <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
	                      <Link to="/qr" className={isActive("/qr") ? "active" : ""}>My QR</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
	                      <Link to="/transfer" className={isActive("/transfer") ? "active" : ""}>Transfer</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
	                      <Link to="/promotions" className={isActive("/promotions") ? "active" : ""}>Promotions</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
	                      <Link to="/events" className={isActive("/events") ? "active" : ""}>Events</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
	                      <Link to="/transactions" className={isActive("/transactions") ? "active" : ""}>Transactions</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
	                      <Link to="/calendar" className={isActive("/calendar") ? "active" : ""}>Calendar</Link>
                        </DropdownMenuItem>
                        {shouldShowLink("/admin") && (
                          <DropdownMenuItem>
                            <Link to="/admin" className={isActive("/admin") ? "active" : ""}>Admin</Link>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
          </div>

        </>)}
      </div>
    </header>
  )
}
