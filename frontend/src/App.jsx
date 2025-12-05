import { Routes, Route, useLocation } from "react-router-dom"
import { useEffect } from "react"
import { AppNavbar } from "./components/app-navbar"
import { LoggedNavbar } from "./components/logged-navbar"
import { Hero } from "./pages/hero"
import { Login } from "./pages/login"
import { NotFound } from "./pages/notFound"
import { About } from "./pages/about"
import { Careers } from "./pages/careers"
import { Partners } from "./pages/partners"
import { Press } from "./pages/press"
import { HelpCenter } from "./pages/helpCenter"
import { Documentation } from "./pages/documentation"
import { ApiStatus } from "./pages/apiStatus"
import { ForgotPassword } from "./pages/forgotPassword"
import { Footer } from "./components/footer"
import { FooterLogged } from "./components/footer-logged"
import { RequestDemo } from "./pages/requestDemo"
import { Dashboard } from "./pages/dashboard"
import { Events } from "./pages/events"
import { ViewEventRoute } from "./pages/viewEvent"
import { ViewEventRouteEdit } from "./pages/viewEventEdit"
import { QrPage } from "./pages/qr"
import { Transfer } from "./pages/transfer"
import { PromotionsPage } from "./pages/promotionsPage"
import { ViewPromotionRoute } from "./pages/viewPromotion"
import { ViewTransactionRoute } from "./pages/viewTransaction"
import { Transactions } from "./pages/transactions"
import { AdjustTransaction } from "./pages/adjustTransaction"
import { Admin } from "./pages/admin"
import { Profile } from "./pages/profile"
import { FullPageCalendar } from "./pages/calendar"
import { OrganizerDashboard } from "./pages/organizer"
import { AuthProvider, useAuth  } from "./contexts/AuthContext"
import { Register } from "./pages/register"

import './App.css'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // prefer reduced motion if the user has that enabled
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior = prefersReducedMotion ? 'auto' : 'auto'
    // Defer to the next tick so route content can render first
    const t = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior })
    }, 0)
return () => clearTimeout(t) }, [pathname])
  return null
}

function PageTransition({ children }) {
  return (
    <div className="page-transition">
      {children}
    </div>
  )
}

function AppShell() {
  const location = useLocation()
  const authRoutes = ["/dashboard", "/events", "/app", "/qr", "/transfer", "/promotions", "/transactions", "/admin", "/profile", "/help", "/docs", "/status", "/calendar", "/organizer", "/register"]
  const isAuthRoute = authRoutes.some((route) => location.pathname.startsWith(route))

  return (
    <div className={isAuthRoute ? "auth-shell" : "app-shell"} style={
                { "display": "flex", "flexDirection" : "column"}
            }>
      <ScrollToTop />
      {isAuthRoute ? <LoggedNavbar /> : <AppNavbar />}
      <main className={`flex-1 ${isAuthRoute ? "auth-main" : "main"}`}>
        <Routes>
          <Route path="/" element={<PageTransition><Hero /></PageTransition>}/>
          <Route path="/login" element={<PageTransition><Login /></PageTransition>}/>
          <Route path="/request-demo" element={<PageTransition><RequestDemo /></PageTransition>}/>
          <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>}/>
          <Route path="/about" element={<PageTransition><About /></PageTransition>}/>
          <Route path="/careers" element={<PageTransition><Careers /></PageTransition>}/>
          <Route path="/partners" element={<PageTransition><Partners /></PageTransition>}/>
          <Route path="/press" element={<PageTransition><Press /></PageTransition>}/>
          <Route path="/help" element={<PageTransition><HelpCenter /></PageTransition>}/>
          <Route path="/docs" element={<PageTransition><Documentation /></PageTransition>}/>
          <Route path="/status" element={<PageTransition><ApiStatus /></PageTransition>}/>
          <Route path="/register" element={<PageTransition><Register /></PageTransition>}/>
          <Route path="/app" element={<PageTransition><Dashboard /></PageTransition>}/>
          <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>}>
              <Route path=":id" element={<ViewEventRoute />} />
              <Route path=":id/edit" element={<ViewEventRouteEdit />} />
          </Route>
          <Route path="/events" element={<PageTransition><Events /></PageTransition>}>
              <Route path=":id" element={<ViewEventRoute />} />
          </Route>
          <Route path="/qr" element={<PageTransition><QrPage /></PageTransition>}/>
          <Route path="/transfer" element={<PageTransition><Transfer /></PageTransition>}/>
          <Route path="/promotions" element={<PageTransition><PromotionsPage /></PageTransition>}>
              <Route path=":id" element={<ViewPromotionRoute />} />
          </Route>
          <Route path="/transactions" element={<PageTransition><Transactions /></PageTransition>}>
              <Route path=":id" element={<ViewTransactionRoute />} />
          </Route>
          <Route path="/transactions/:id/adjustment" element={<PageTransition><AdjustTransaction /></PageTransition>} />
          <Route path="/transactions/:id/adjustment" element={<PageTransition><AdjustTransaction /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><Admin /></PageTransition>}/>
          <Route path="/register" element={<PageTransition><Register /></PageTransition>}/>
          <Route path="/calendar" element={<PageTransition><FullPageCalendar /></PageTransition>}/>
          <Route path="/profile/:utorid" element={<PageTransition><Profile /></PageTransition>}/>
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>}/>
        </Routes>
      </main>
      {isAuthRoute ? <FooterLogged /> : <Footer />}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

export default App
