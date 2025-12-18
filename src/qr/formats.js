export function buildPayload(type, data) {
  if (type === "url") return (data.url || "").trim();
  if (type === "text") return (data.text || "").trim();

  if (type === "wifi") {
    const ssid = esc(data.ssid || "");
    const pass = esc(data.password || "");
    const enc = (data.encryption || "WPA").toUpperCase();
    const hidden = data.hidden ? "true" : "false";
    // WIFI:T:WPA;S:myssid;P:mypass;H:false;;
    return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
  }

  if (type === "vcard") {
    const first = (data.first || "").trim();
    const last = (data.last || "").trim();
    const org = (data.org || "").trim();
    const title = (data.title || "").trim();
    const phone = (data.phone || "").trim();
    const email = (data.email || "").trim();
    const website = (data.website || "").trim();

    return [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(last)};${esc(first)};;;`,
      `FN:${esc((first + " " + last).trim())}`,
      org ? `ORG:${esc(org)}` : "",
      title ? `TITLE:${esc(title)}` : "",
      phone ? `TEL;TYPE=CELL:${esc(phone)}` : "",
      email ? `EMAIL:${esc(email)}` : "",
      website ? `URL:${esc(website)}` : "",
      "END:VCARD"
    ].filter(Boolean).join("\n");
  }

  return "";
}

function esc(s) {
  return String(s)
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
