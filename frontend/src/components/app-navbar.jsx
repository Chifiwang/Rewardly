import { Link, useLocation, useNavigate } from "react-router-dom"
import { QrCode, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useRef, useEffect } from "react"

const navLinks = [
	{ label: "Platform", href: "#platform" },
	{ label: "Roles", href: "#roles" },
	{ label: "Highlights", href: "#highlights" },
	{ label: "Stories", href: "#stories" },
]

export function AppNavbar() {
	const [isMobile, changeSize] = useState(null);
	const linksRef = useRef(null);
	// default to no mask so items are fully visible until we compute scrollability
	const [mask, setMask] = useState("none");
	const location = useLocation()
	const navigate = useNavigate()

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
	}, [location.pathname]);

	const handleBrandClick = (e) => {
		e.preventDefault()
		// If already on homepage, scroll to top. Otherwise navigate to landing page.
		if (location.pathname === "/") {
			window.scrollTo({ top: 0, behavior: "smooth" })
		} else {
			navigate("/")
		}
	}

	return (
		<header className="app-navbar" role="banner" aria-label="Site navigation">
			<div className="app-navbar__inner">
				<Link to="/" className="app-navbar__brand" aria-label="Rewardly home" onClick={handleBrandClick}>
					<QrCode className="brand-icon" aria-hidden />
					<div className="brand-copy">
						<span className="brand-title">Rewardly</span>
					</div>
				</Link>

				{(isMobile !== null) && (!isMobile ? <>
								<nav className="app-navbar__links" aria-label="Primary"
									ref={linksRef}
									style={{
										maskImage: mask,
										WebkitMaskImage: mask,
									}}
									tabIndex={0}
								>
					{navLinks.map((link) => (
						<a
							key={link.label}
							href={link.href}
							onClick={(e) => {
								// If we're already on the homepage, smooth-scroll with offset.
								// Otherwise navigate to home with hash so the Hero can scroll after navigation.
								e.preventDefault()
								if (location.pathname === "/") {
									const el = document.querySelector(link.href)
									if (el) {
										const nav = document.querySelector('.app-navbar')
										const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0
										const extra = 12
										const top = window.scrollY + el.getBoundingClientRect().top - navHeight - extra
										window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
									}
								} else {
									// navigate to /#section
									navigate(`/${link.href}`)
								}
							}}
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="app-navbar__actions">
					<Button variant="ghost" className="app-navbar__cta" asChild>
						<Link to="/request-demo">Request demo</Link>
					</Button>
					<Button className="app-navbar__login" asChild>
						<Link to="/login#login-form">Log In</Link>
					</Button>
				</div>
				</> :
				<>
                  <div className="app-navbar__actions">
					<Button variant="ghost" className="app-navbar__cta" asChild>
						<Link to="/request-demo">Request demo</Link>
					</Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button className="app-navbar__login" asChild>
                            <Link to="/login#login-form"><Menu /></Link>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => navigate("/login#login-form")}>
                                        Log in
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
					{navLinks.map((link) => (
                        <DropdownMenuItem>
						<a
							key={link.label}
							href={link.href}
							onClick={(e) => {
								// If we're already on the homepage, smooth-scroll with offset.
								// Otherwise navigate to home with hash so the Hero can scroll after navigation.
								e.preventDefault()
								if (location.pathname === "/") {
									const el = document.querySelector(link.href)
									if (el) {
										const nav = document.querySelector('.app-navbar')
										const navHeight = nav ? Math.ceil(nav.getBoundingClientRect().height) : 0
										const extra = 12
										const top = window.scrollY + el.getBoundingClientRect().top - navHeight - extra
										window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
									}
								} else {
									// navigate to /#section
									navigate(`/${link.href}`)
								}
							}}
						>
							{link.label}
						</a>
                        </DropdownMenuItem>
					))}
                      </DropdownMenuContent>
                    </DropdownMenu>
				  </div>
				</>)}
			</div>
		</header>
	)
}
