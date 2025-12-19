import "./style.css";
import { setYear } from "./seo.js";
import { buildPayload } from "./qr/formats.js";
import { renderToCanvas, renderToSVG, drawLogoOverlay } from "./qr/render.js";

setYear();

const DEFAULT_SIZE = 360;
const DEFAULT_MARGIN = 2;
const state = { type: "url" };

const els = {
  tabs: Array.from(document.querySelectorAll(".tab")),
  inputs: document.getElementById("inputs"),
  ec: document.getElementById("ec"),
  fg: document.getElementById("fg"),
  bg: document.getElementById("bg"),
  logo: document.getElementById("logo"),
  logoScale: document.getElementById("logoScale"),
  logoRound: document.getElementById("logoRound"),
  canvas: document.getElementById("qrCanvas"),
  previewBox: document.getElementById("previewBox"),
  payloadPreview: document.getElementById("payloadPreview"),
  btnDownloadPng: document.getElementById("btnDownloadPng"),
  btnDownloadSvg: document.getElementById("btnDownloadSvg"),
  btnReset: document.getElementById("btnReset"),
  menuToggle: document.getElementById("menuToggle"),
  navLinks: document.getElementById("navLinks")
};

function renderInputs() {
  const t = state.type;

  if (t === "url") {
    els.inputs.innerHTML = `
      <div class="row">
        <label>URL</label>
        <input id="in_url" placeholder="https://example.com">
      </div>
    `;
  } else if (t === "text") {
    els.inputs.innerHTML = `
      <div class="row">
        <label>Text</label>
        <textarea id="in_text" placeholder="Write your text here">Hello!</textarea>
      </div>
    `;
  } else if (t === "wifi") {
    els.inputs.innerHTML = `
      <div class="row2">
        <div>
          <label>SSID</label>
          <input id="in_ssid" placeholder="Wi-Fi network name">
        </div>
        <div>
          <label>Password</label>
          <input id="in_pass" placeholder="Password">
        </div>
      </div>
      <div class="row2">
        <div>
          <label>Encryption</label>
          <select id="in_enc">
            <option value="WPA" selected>WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">No password</option>
          </select>
        </div>
        <div>
          <label>Hidden network</label>
          <select id="in_hidden">
            <option value="no" selected>No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>
    `;
  } else if (t === "vcard") {
    els.inputs.innerHTML = `
      <div class="row2">
        <div><label>First name</label><input id="in_first" placeholder="First name"></div>
        <div><label>Last name</label><input id="in_last" placeholder="Last name"></div>
      </div>
      <div class="row2">
        <div><label>Phone</label><input id="in_phone" placeholder="+1..."></div>
        <div><label>Email</label><input id="in_email" placeholder="email@example.com"></div>
      </div>
      <div class="row2">
        <div><label>Company</label><input id="in_org" placeholder="Company"></div>
        <div><label>Job title</label><input id="in_title" placeholder="Title"></div>
      </div>
      <div class="row">
        <label>Website</label>
        <input id="in_website" placeholder="https://...">
      </div>
    `;
  }
}

function readFormData() {
  const t = state.type;

  if (t === "url") {
    return { url: document.getElementById("in_url")?.value || "" };
  }
  if (t === "text") {
    return { text: document.getElementById("in_text")?.value || "" };
  }
  if (t === "wifi") {
    return {
      ssid: document.getElementById("in_ssid")?.value || "",
      password: document.getElementById("in_pass")?.value || "",
      encryption: document.getElementById("in_enc")?.value || "WPA",
      hidden: (document.getElementById("in_hidden")?.value || "no") === "yes"
    };
  }
  if (t === "vcard") {
    return {
      first: document.getElementById("in_first")?.value || "",
      last: document.getElementById("in_last")?.value || "",
      phone: document.getElementById("in_phone")?.value || "",
      email: document.getElementById("in_email")?.value || "",
      org: document.getElementById("in_org")?.value || "",
      title: document.getElementById("in_title")?.value || "",
      website: document.getElementById("in_website")?.value || ""
    };
  }
  return {};
}

function setType(t, force = false) {
  if (!force && state.type === t) return;
  state.type = t;
  els.tabs.forEach(tab => {
    const active = tab.dataset.type === t;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });
  renderInputs();
  scheduleGenerate();
}

async function generate() {
  const payload = buildPayload(state.type, readFormData());

  els.payloadPreview.textContent = payload
    ? payload.replace(/\s+/g, " ").slice(0, 120)
    : "\u2014";

  const logoFile = els.logo.files?.[0];
  let ec = els.ec.value;
  if (logoFile && (ec === "L" || ec === "M")) {
    ec = "H";
    els.ec.value = "H";
    toast("EC set to H for better readability with a logo.");
  }

  const opts = {
    size: DEFAULT_SIZE,
    margin: DEFAULT_MARGIN,
    ec,
    fg: els.fg.value,
    bg: els.bg.value
  };

  if (els.previewBox) els.previewBox.classList.add("loading");
  try {
    await renderToCanvas(els.canvas, payload, opts);

    if (logoFile) {
      const scale = clampNum(els.logoScale.value, 10, 40, 22);
      const round = els.logoRound.value === "yes";
      await drawLogoOverlay(els.canvas, logoFile, scale, round);
    }
  } finally {
    if (els.previewBox) els.previewBox.classList.remove("loading");
  }

  // guarda para download
  window.__QR_PAYLOAD__ = payload;
  window.__QR_OPTS__ = opts;
}

function download(fmt = "png") {
  if (fmt === "png") {
    const a = document.createElement("a");
    a.download = "qrcode.png";
    a.href = els.canvas.toDataURL("image/png");
    a.click();
    return;
  }

  (async () => {
    const payload = window.__QR_PAYLOAD__ || "";
    const opts = window.__QR_OPTS__ || { margin: 2, ec: "M", fg: "#111111", bg: "#ffffff" };
    const svg = await renderToSVG(payload, opts);

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.download = "qrcode.svg";
    a.href = url;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 500);
  })();
}

function resetAll() {
  setType("url", true);
  els.ec.value = "M";
  els.fg.value = "#111111";
  els.bg.value = "#ffffff";
  els.logo.value = "";
  els.logoScale.value = 22;
  els.logoRound.value = "yes";
  runGenerate();
}

function clampNum(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.position = "fixed";
  t.style.left = "50%";
  t.style.bottom = "22px";
  t.style.transform = "translateX(-50%)";
  t.style.padding = "10px 12px";
  t.style.borderRadius = "14px";
  t.style.border = "1px solid rgba(255,255,255,.14)";
  t.style.background = "rgba(17,21,33,.92)";
  t.style.color = "#eef2ff";
  t.style.zIndex = "9999";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

let generateTimer = null;
let generating = false;
let pending = false;

async function runGenerate() {
  if (generating) {
    pending = true;
    return;
  }
  generating = true;
  try {
    await generate();
  } finally {
    generating = false;
    if (pending) {
      pending = false;
      runGenerate();
    }
  }
}

function scheduleGenerate() {
  if (generateTimer) clearTimeout(generateTimer);
  generateTimer = setTimeout(() => {
    runGenerate();
  }, 120);
}

els.tabs.forEach(tab => {
  tab.addEventListener("click", () => setType(tab.dataset.type));
});

els.btnDownloadPng.addEventListener("click", () => download("png"));
els.btnDownloadSvg.addEventListener("click", () => download("svg"));
els.btnReset.addEventListener("click", resetAll);

["ec","fg","bg","logoScale","logoRound"].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener("input", scheduleGenerate);
  el.addEventListener("change", scheduleGenerate);
});
els.logo.addEventListener("change", runGenerate);
els.inputs.addEventListener("input", scheduleGenerate);
els.inputs.addEventListener("change", scheduleGenerate);

if (els.menuToggle && els.navLinks) {
  els.menuToggle.addEventListener("click", () => {
    const open = els.navLinks.classList.toggle("open");
    els.menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  Array.from(els.navLinks.querySelectorAll("a")).forEach(a => {
    a.addEventListener("click", () => {
      els.navLinks.classList.remove("open");
      els.menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// init
setType("url", true);
runGenerate();
