/* ───────── Config: edit these ───────── */
const CONFIG = {
  location: "Your City, XX",
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // e.g. "Asia/Manila"
  email: "hello@example.com",
  prompts: [
    "You are a calm, precise assistant…",
    "Extract every invoice line item as JSON.",
    "Think step by step, then answer in one line.",
    "If you're unsure, say so. Never guess.",
    "Classify this ticket: billing, bug, or feature?",
  ],
  // Eval pass rate (%) for prompt versions v1…v9, drawn as the hero sparkline
  passRates: [71, 74, 82, 80, 85, 88, 90, 93, 95],
};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;

/* ───────── Location + live clock ───────── */
const loc = $("#location");
if (loc) loc.textContent = CONFIG.location;

const clock = $("#clock");
if (clock) {
  const fmt = new Intl.DateTimeFormat([], { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: CONFIG.timeZone });
  const tick = () => (clock.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);
}

/* ───────── Theme: light / dark / system ───────── */
const THEME_BG = { light: "#fbf6f7", dark: "#171014" };
const systemDark = matchMedia("(prefers-color-scheme: dark)");
const effectiveTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");

function syncThemeUI() {
  const mode = root.dataset.theme || "system";
  $$("[data-theme-set]").forEach((b) => b.setAttribute("aria-checked", b.dataset.themeSet === mode));
  // Keep the browser chrome (address bar) matching the page
  $$('meta[name="theme-color"]').forEach((m) => (m.content = THEME_BG[effectiveTheme()]));
}
function setTheme(mode) {
  if (mode === "system") delete root.dataset.theme;
  else root.dataset.theme = mode;
  try {
    if (mode === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", mode);
  } catch (_) {}
  syncThemeUI();
}
systemDark.addEventListener("change", syncThemeUI);
syncThemeUI();

// Dropdown menu (shadcn DropdownMenu-style)
const themeBtn = $("#themeToggle"), themeMenu = $("#themeMenu");
if (themeBtn && themeMenu) {
  const closeMenu = () => { themeMenu.hidden = true; themeBtn.setAttribute("aria-expanded", "false"); };
  themeBtn.addEventListener("click", () => {
    const opening = themeMenu.hidden;
    themeMenu.hidden = !opening;
    themeBtn.setAttribute("aria-expanded", String(opening));
    if (opening) themeMenu.querySelector('[aria-checked="true"], button')?.focus();
  });
  themeMenu.addEventListener("click", (e) => {
    const b = e.target.closest("[data-theme-set]");
    if (!b) return;
    setTheme(b.dataset.themeSet);
    closeMenu();
    themeBtn.focus();
  });
  themeMenu.addEventListener("keydown", (e) => {
    const items = $$("button", themeMenu);
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown") { e.preventDefault(); items[(i + 1) % items.length].focus(); }
    if (e.key === "ArrowUp") { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".menu-wrap")) closeMenu(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !themeMenu.hidden) { closeMenu(); themeBtn.focus(); }
  });
}

/* ───────── Toast ───────── */
const toast = $("#toast");
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(showToast.t);
  showToast.t = setTimeout(() => toast.classList.remove("show"), 2000);
}

/* ───────── Email ───────── */
$$("[data-email-link]").forEach((a) => (a.href = `mailto:${CONFIG.email}`));
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(CONFIG.email);
    showToast(`Copied ${CONFIG.email}`);
  } catch (_) {
    showToast(CONFIG.email);
  }
}
$$("[data-copy-email]").forEach((b) => b.addEventListener("click", copyEmail));

/* ───────── "Currently prompting" ticker ───────── */
const ticker = $("#promptTicker");
if (ticker) {
  let i = 0;
  setInterval(() => {
    i = (i + 1) % CONFIG.prompts.length;
    ticker.style.opacity = 0;
    setTimeout(() => {
      ticker.textContent = CONFIG.prompts[i];
      ticker.style.opacity = 1;
    }, 300);
  }, 5000);
}

/* ───────── Sparkline + version toggle ───────── */
const spark = $(".spark");
if (spark) {
  const vals = CONFIG.passRates;
  const W = 240, H = 64, pad = 6;
  const min = Math.min(...vals) - 4, max = Math.max(...vals) + 2;
  const pts = vals.map((v, i) => [
    pad + (i * (W - 2 * pad)) / (vals.length - 1),
    H - pad - ((v - min) / (max - min)) * (H - 2 * pad),
  ]);
  const line = pts.map((p) => p.map((n) => n.toFixed(1)).join(",")).join(" ");
  const area = `M${pts[0][0]},${H - pad} L${line.replace(/ /g, " L")} L${pts.at(-1)[0]},${H - pad} Z`;

  function draw(idx) {
    const [x, y] = pts[idx];
    spark.innerHTML =
      `<line x1="0" x2="${W}" y1="${H - pad}" y2="${H - pad}" stroke="var(--border)" stroke-width="1"/>` +
      `<path d="${area}" fill="var(--s2)" opacity=".6"/>` +
      `<polyline points="${line}" fill="none" stroke="var(--s5)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>` +
      `<circle cx="${x}" cy="${y}" r="3.5" fill="var(--accent)" stroke="var(--s5)" stroke-width="1"/>`;
  }

  const rate = $("#passRate"), delta = $("#passDelta");
  const base = vals[2]; // v3
  function selectVersion(v) {
    const idx = Number(v.slice(1)) - 1;
    draw(idx);
    rate.innerHTML = `${vals[idx]}<small>%</small>`;
    const diff = vals[idx] - base;
    delta.textContent = diff ? `+${diff} pts since v3` : "baseline";
    $$(".seg button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.v === v));
  }
  $$(".seg button").forEach((b) => b.addEventListener("click", () => selectVersion(b.dataset.v)));
  selectVersion("v9");
}

/* ───────── Project tabs (projects.html) ───────── */
const tabs = $$(".tab");
const cards = $$(".pcard");
const emptyNote = $("#emptyNote");
tabs.forEach((tab) => {
  const f = tab.dataset.filter;
  const n = f === "all" ? cards.length : cards.filter((c) => c.dataset.cat.split(" ").includes(f)).length;
  tab.insertAdjacentHTML("beforeend", `<span class="count">${n}</span>`);
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.setAttribute("aria-selected", t === tab));
    let shown = 0;
    cards.forEach((c) => {
      const match = f === "all" || c.dataset.cat.split(" ").includes(f);
      c.hidden = !match;
      if (match) shown++;
    });
    if (emptyNote) emptyNote.hidden = shown > 0;
  });
});

/* ───────── Command menu (⌘K) ───────── */
const ICON = {
  page: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"/><path d="M14 3v5h5"/>',
  hash: '<path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/>',
  sun: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  link: '<path d="M7 17 17 7M8 7h9v9"/>',
};
const onHome = !!$(".hero");
const COMMANDS = [
  { group: "Pages", label: "Home", icon: "page", href: "index.html" },
  { group: "Pages", label: "Projects", icon: "page", href: "projects.html" },
  { group: "Pages", label: "Tools", icon: "page", href: "tools.html" },
  { group: "Sections", label: "About me", icon: "hash", href: onHome ? "#about" : "index.html#about" },
  { group: "Sections", label: "Contact", icon: "hash", href: onHome ? "#contact" : "index.html#contact" },
  { group: "Actions", label: "Copy email address", icon: "copy", run: copyEmail },
  { group: "Theme", label: "Light mode", icon: "sun", run: () => setTheme("light") },
  { group: "Theme", label: "Dark mode", icon: "moon", run: () => setTheme("dark") },
  { group: "Theme", label: "Follow system theme", icon: "monitor", run: () => setTheme("system") },
  { group: "Links", label: "GitHub", icon: "link", href: "https://github.com/", external: true },
  { group: "Links", label: "LinkedIn", icon: "link", href: "https://www.linkedin.com/", external: true },
];

const cmd = $("#cmd"), cmdInput = $("#cmdInput"), cmdList = $("#cmdList");
if (cmd) {
  let results = [], active = 0;

  function render() {
    const q = cmdInput.value.trim().toLowerCase();
    results = COMMANDS.filter((c) => c.label.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
    active = Math.min(active, Math.max(results.length - 1, 0));
    if (!results.length) {
      cmdList.innerHTML = `<li class="cmd-empty">No results found.</li>`;
      return;
    }
    let html = "", group = "";
    results.forEach((c, i) => {
      if (c.group !== group) {
        group = c.group;
        html += `<li class="cmd-group label" role="presentation">${group}</li>`;
      }
      html +=
        `<li class="cmd-item" role="option" id="cmd-${i}" data-i="${i}" aria-selected="${i === active}">` +
        `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[c.icon]}</svg>` +
        `${c.label}</li>`;
    });
    cmdList.innerHTML = html;
    cmdInput.setAttribute("aria-activedescendant", `cmd-${active}`);
    $(`#cmd-${active}`)?.scrollIntoView({ block: "nearest" });
  }

  function open() {
    cmdInput.value = "";
    active = 0;
    render();
    cmd.showModal();
    cmdInput.focus();
  }

  function run(c) {
    if (!c) return;
    cmd.close();
    if (c.run) return c.run();
    if (c.external) return window.open(c.href, "_blank", "noopener");
    location.href = c.href;
  }

  $$("[data-cmd-open]").forEach((b) => b.addEventListener("click", open));
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      cmd.open ? cmd.close() : open();
    }
  });
  cmdInput.addEventListener("input", () => { active = 0; render(); });
  cmdInput.addEventListener("keydown", (e) => {
    if (!results.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); active = (active + 1) % results.length; render(); }
    if (e.key === "ArrowUp") { e.preventDefault(); active = (active - 1 + results.length) % results.length; render(); }
    if (e.key === "Enter") { e.preventDefault(); run(results[active]); }
  });
  cmdList.addEventListener("click", (e) => {
    const item = e.target.closest(".cmd-item");
    if (item) run(results[Number(item.dataset.i)]);
  });
  cmdList.addEventListener("mousemove", (e) => {
    const item = e.target.closest(".cmd-item");
    if (item && Number(item.dataset.i) !== active) { active = Number(item.dataset.i); render(); }
  });
  // Close when clicking the backdrop
  cmd.addEventListener("click", (e) => { if (e.target === cmd) cmd.close(); });
}

/* ───────── Reveal on scroll ───────── */
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }),
  { threshold: 0.1 }
);
$$(".reveal").forEach((el, idx) => {
  el.style.transitionDelay = `${Math.min(idx, 3) * 70}ms`;
  io.observe(el);
});

/* ───────── Footer year ───────── */
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();
