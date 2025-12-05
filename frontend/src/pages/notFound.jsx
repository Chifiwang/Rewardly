


import { Link } from "react-router-dom"
import { Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import "./notFound.css"

export function NotFound() {
  useEffect(() => {
    document.body.classList.add("no-footer", "no-scroll")
    return () => document.body.classList.remove("no-footer", "no-scroll")
  }, [])

  return (
    <div className="NotFound" role="main" aria-label="404 Not Found">
      <div className="notfound-bg-graphic" aria-hidden />
      <div className="notfound-content">
        <motion.div
          className="notfound-icon-wrapper"
          initial={{ y: -10, scale: 0.85, opacity: 0 }}
          animate={{ y: [0, -10, 0], scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        >
          <Sparkles className="notfound-icon" aria-hidden />
          <span className="notfound-glow" />
        </motion.div>
        <h1>Adventure awaits elsewhere.</h1>
        <p className="notfound-desc">
          You’ve wandered off the intended path, but there’s plenty to explore back on your dashboard. Let’s guide you
          home.
        </p>
        <Button className="app-navbar__login notfound-home-btn" asChild>
          <Link to="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
