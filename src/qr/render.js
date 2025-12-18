import QRCode from "qrcode";

export async function renderToCanvas(canvas, payload, opts) {
  const {
    size = 512,
    margin = 2,
    ec = "M",
    fg = "#111111",
    bg = "#ffffff"
  } = opts;

  canvas.width = size;
  canvas.height = size;

  await QRCode.toCanvas(canvas, payload || " ", {
    errorCorrectionLevel: ec,
    margin,
    width: size,
    color: { dark: fg, light: bg }
  });
}

export async function renderToSVG(payload, opts) {
  const { margin = 2, ec = "M", fg = "#111111", bg = "#ffffff" } = opts;

  return QRCode.toString(payload || " ", {
    type: "svg",
    errorCorrectionLevel: ec,
    margin,
    color: { dark: fg, light: bg }
  });
}

export async function drawLogoOverlay(canvas, file, logoScalePct = 22, round = true) {
  if (!file) return;

  const img = await fileToImage(file);
  const ctx = canvas.getContext("2d");

  const size = canvas.width;
  const logoSize = Math.floor((size * logoScalePct) / 100);
  const x = Math.floor((size - logoSize) / 2);
  const y = Math.floor((size - logoSize) / 2);

  // fundo branco atras do logo para legibilidade
  const pad = Math.floor(logoSize * 0.10);
  const bx = x - pad, by = y - pad, bs = logoSize + pad * 2;

  ctx.save();
  ctx.fillStyle = "#ffffff";
  if (round) {
    roundedRect(ctx, bx, by, bs, bs, Math.floor(bs * 0.22));
    ctx.fill();
  } else {
    ctx.fillRect(bx, by, bs, bs);
  }
  ctx.restore();

  ctx.save();
  if (round) {
    roundedRect(ctx, x, y, logoSize, logoSize, Math.floor(logoSize * 0.22));
    ctx.clip();
  }
  ctx.drawImage(img, x, y, logoSize, logoSize);
  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}
