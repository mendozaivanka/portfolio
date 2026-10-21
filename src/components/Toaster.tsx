import { useEffect, useState } from "react";
import { onToast } from "../lib/toast";

/** Sonner-style toast: listens for toast() calls from any island. */
export default function Toaster() {
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: number | undefined;
    const off = onToast((msg) => {
      setMessage(msg);
      setVisible(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setVisible(false), 2000);
    });
    return () => {
      off();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`toast${visible ? " show" : ""}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
