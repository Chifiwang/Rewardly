import { useRef, useState, useEffect } from "react"
import { useInView, animate } from "framer-motion"

export function CountUp({ end = 0, suffix = "", duration = 1.2, className = "" }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    let controls
    if (inView) {
      controls = animate(0, end, {
        duration,
        onUpdate: (v) => setValue(v),
      })
    }

    return () => controls && controls.stop()
  }, [inView, end, duration])

  const display = end >= 1 ? Math.floor(value) : value.toFixed(2)

  return (
    <span ref={ref} className={className} aria-hidden>
      {display}
      {suffix}
    </span>
  )
}

export default CountUp
