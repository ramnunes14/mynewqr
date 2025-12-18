import "./style.css";
import { setYear } from "./seo.js";
import { buildPayload } from "./qr/formats.js";
import { renderToCanvas, renderToSVG, drawLogoOverlay } from "./qr/render.js";

setYear();

const DEFAULT_SIZE = 360;
const DEFAULT_MARGIN = 2;
const state = { type: "url", lang: "pt" };

const translations = {
  pt: {
    metaTitle: "Gerador de QR Code Grátis — PNG/SVG, Cores e Logo",
    metaDesc: "Gera QR Codes grátis para URL, texto, Wi-Fi e vCard. Personaliza cores, logo e exporta PNG/SVG.",
    heroTitle: "Cria o teu QR Code em segundos",
    heroSub: "Grátis • Sem registo • Download PNG e SVG",
    tabs: { url: "URL", text: "Texto", vcard: "vCard", wifi: "Wi-Fi" },
    labelURL: "URL",
    placeholderURL: "https://example.com",
    labelText: "Texto",
    placeholderText: "Escreve o texto...",
    wifi: {
      ssid: "SSID",
      pass: "Password",
      enc: "Encriptação",
      hidden: "Rede oculta",
      optEnc: { wpa: "WPA/WPA2", wep: "WEP", nopass: "Sem password" },
      optHidden: { no: "Não", yes: "Sim" }
    },
    vcard: {
      first: "Nome",
      last: "Apelido",
      phone: "Telefone",
      email: "Email",
      org: "Empresa",
      title: "Cargo",
      website: "Website"
    },
    adSlot: "Espaço reservado para anúncio",
    details: "Personalização",
    ec: "Error correction",
    color: "Cor QR",
    bg: "Fundo",
    logo: "Logo (opcional)",
    logoHint: "Usa EC Q/H para logo.",
    logoSize: "Tamanho do logo (%)",
    logoRound: "Arredondar logo",
    optRound: { yes: "Sim", no: "Não" },
    copy: "Copiar imagem",
    reset: "Reset",
    previewTitle: "Pré-visualização",
    previewDesc: "Atualiza em tempo real.",
    tip: "Para logo, usa EC = Q/H (margem padrão 2).",
    downloadPng: "Download PNG",
    downloadSvg: "Download SVG",
    note: "Gerado localmente no teu browser. Não guardamos nada."
  },
  en: {
    metaTitle: "Free QR Code Generator — PNG/SVG, Colors & Logo",
    metaDesc: "Create QR Codes for URL, text, Wi-Fi, and vCard. Customize colors, logo, download PNG/SVG.",
    heroTitle: "Create your QR Code in seconds",
    heroSub: "Free • No signup • Download PNG & SVG",
    tabs: { url: "URL", text: "Text", vcard: "vCard", wifi: "Wi-Fi" },
    labelURL: "URL",
    placeholderURL: "https://example.com",
    labelText: "Text",
    placeholderText: "Write your text...",
    wifi: {
      ssid: "SSID",
      pass: "Password",
      enc: "Encryption",
      hidden: "Hidden network",
      optEnc: { wpa: "WPA/WPA2", wep: "WEP", nopass: "No password" },
      optHidden: { no: "No", yes: "Yes" }
    },
    vcard: {
      first: "First name",
      last: "Last name",
      phone: "Phone",
      email: "Email",
      org: "Company",
      title: "Job title",
      website: "Website"
    },
    adSlot: "Ad placeholder",
    details: "Personalization",
    ec: "Error correction",
    color: "QR color",
    bg: "Background",
    logo: "Logo (optional)",
    logoHint: "Use EC Q/H for logo.",
    logoSize: "Logo size (%)",
    logoRound: "Round logo",
    optRound: { yes: "Yes", no: "No" },
    copy: "Copy image",
    reset: "Reset",
    previewTitle: "Preview",
    previewDesc: "Updates in real time.",
    tip: "For logo, use EC = Q/H (default margin 2).",
    downloadPng: "Download PNG",
    downloadSvg: "Download SVG",
    note: "Generated locally in your browser. We do not store any data."
  },
  es: {
    metaTitle: "Generador de QR Gratis — PNG/SVG, Colores y Logo",
    metaDesc: "Crea códigos QR para URL, texto, Wi-Fi y vCard. Personaliza colores, logo y descarga PNG/SVG.",
    heroTitle: "Crea tu código QR en segundos",
    heroSub: "Gratis • Sin registro • Descarga PNG y SVG",
    tabs: { url: "URL", text: "Texto", vcard: "vCard", wifi: "Wi-Fi" },
    labelURL: "URL",
    placeholderURL: "https://example.com",
    labelText: "Texto",
    placeholderText: "Escribe el texto...",
    wifi: {
      ssid: "SSID",
      pass: "Contraseña",
      enc: "Encriptación",
      hidden: "Red oculta",
      optEnc: { wpa: "WPA/WPA2", wep: "WEP", nopass: "Sin contraseña" },
      optHidden: { no: "No", yes: "Sí" }
    },
    vcard: {
      first: "Nombre",
      last: "Apellido",
      phone: "Teléfono",
      email: "Email",
      org: "Empresa",
      title: "Cargo",
      website: "Sitio web"
    },
    adSlot: "Espacio reservado para anuncio",
    details: "Personalización",
    ec: "Corrección de error",
    color: "Color del QR",
    bg: "Fondo",
    logo: "Logo (opcional)",
    logoHint: "Usa EC Q/H para logo.",
    logoSize: "Tamaño del logo (%)",
    logoRound: "Redondear logo",
    optRound: { yes: "Sí", no: "No" },
    copy: "Copiar imagen",
    reset: "Reiniciar",
    previewTitle: "Previsualización",
    previewDesc: "Se actualiza en tiempo real.",
    tip: "Para logo, usa EC = Q/H (margen por defecto 2).",
    downloadPng: "Descargar PNG",
    downloadSvg: "Descargar SVG",
    note: "Generado localmente en tu navegador. No guardamos datos."
  }
};

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
  btnCopy: document.getElementById("btnCopy"),
  btnReset: document.getElementById("btnReset"),
  menuToggle: document.getElementById("menuToggle"),
  navLinks: document.getElementById("navLinks"),
  langSwitch: document.getElementById("langSwitch"),
  metaTitle: document.querySelector("title"),
  metaDesc: document.querySelector('meta[name="description"]'),
  ogTitle: document.querySelector('meta[property="og:title"]'),
  ogDesc: document.querySelector('meta[property="og:description"]')
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
        <label>Texto</label>
        <textarea id="in_text" placeholder="Escreve o texto aqui">Ol\u00e1!</textarea>
      </div>
    `;
  } else if (t === "wifi") {
    els.inputs.innerHTML = `
      <div class="row2">
        <div>
          <label>SSID</label>
          <input id="in_ssid" placeholder="Nome da rede Wi-Fi">
        </div>
        <div>
          <label>Password</label>
          <input id="in_pass" placeholder="Palavra-passe">
        </div>
      </div>
      <div class="row2">
        <div>
          <label>Encripta\u00e7\u00e3o</label>
          <select id="in_enc">
            <option value="WPA" selected>WPA/WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">Sem password</option>
          </select>
        </div>
        <div>
          <label>Rede oculta</label>
          <select id="in_hidden">
            <option value="no" selected>N\u00e3o</option>
            <option value="yes">Sim</option>
          </select>
        </div>
      </div>
    `;
  } else if (t === "vcard") {
    els.inputs.innerHTML = `
      <div class="row2">
        <div><label>Nome</label><input id="in_first" placeholder="Primeiro nome"></div>
        <div><label>Apelido</label><input id="in_last" placeholder="Apelido"></div>
      </div>
      <div class="row2">
        <div><label>Telefone</label><input id="in_phone" placeholder="+351..."></div>
        <div><label>Email</label><input id="in_email" placeholder="email@dominio.com"></div>
      </div>
      <div class="row2">
        <div><label>Empresa</label><input id="in_org" placeholder="Empresa"></div>
        <div><label>Cargo</label><input id="in_title" placeholder="Cargo"></div>
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
    toast("EC ajustado para H para melhorar leitura com logo.");
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

  // guarda para download/copy
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

async function copyImage() {
  try {
    if (!navigator.clipboard || !window.ClipboardItem) throw new Error("Clipboard API n\u00e3o suportada");
    const blob = await (await fetch(els.canvas.toDataURL("image/png"))).blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    toast("Imagem copiada");
  } catch {
    toast("N\u00e3o foi poss\u00edvel copiar (tenta no Chrome/Edge).");
  }
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
els.btnCopy.addEventListener("click", copyImage);
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
