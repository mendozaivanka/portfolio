import { useEffect, useState } from "react";

/** Live HH:MM clock. Renders a placeholder on the server, then ticks in the browser. */
export default function Clock({ timeZone }: { timeZone?: string }) {
  const [time, setTime] = useState("--:--");

  useEffect(() => {
    let fmt: Intl.DateTimeFormat;
    try {
      fmt = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: timeZone || undefined });
    } catch {
      // Invalid zone name in site.ts: fall back to the visitor's own time
      fmt = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return <time id="clock">{time}</time>;
}
