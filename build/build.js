const fs = require("fs"), path = require("path");
const data = JSON.parse(fs.readFileSync(path.join(__dirname, "ds", "ds-data.json"), "utf8"));
const APP = "https://foractive.app.link/hellmfROv5b?~channel=landing_page&~campaign=running_clubs";
const OUT = path.join(__dirname, "..", "docs"), PAGE = path.join(OUT, "running_clubs");
fs.mkdirSync(path.join(PAGE, "assets"), { recursive: true });

let tpl = fs.readFileSync(path.join(__dirname, "template.html"), "utf8");
const used = new Map(); // symbol id -> {viewBox, body}

function sym(id, d) { if (!used.has(id)) used.set(id, d); return id; }
function iconTag(set, name, size, color) {
  let d, id;
  if (set === "fi") { const key = /-(20|24)$/.test(name) ? name : `${name}-${size >= 24 ? 24 : 20}`; d = data.functionalIconData[key]; id = "fi-" + key; }
  else if (set === "si") { d = data.specificIconData[`${name}-24`]; id = "si-" + name; }
  else if (set === "ni") { d = data.navIconData[name]; id = "ni-" + name; }
  if (!d) throw new Error(`missing icon ${set}:${name}`);
  sym(id, d);
  const style = color ? ` style="color:${color}"` : "";
  return `<svg class="ic" width="${size}" height="${size}" aria-hidden="true" focusable="false"${style}><use href="#${id}"/></svg>`;
}
function logoTag(height) {
  const d = data.logoData["logotype-horizontal-on-light-colors"];
  sym("logo-h", d);
  const w = Math.round(height * d.width / d.height * 100) / 100;
  return `<svg class="ic" width="${w}" height="${height}" viewBox="${d.viewBox}" role="img" aria-label="ForActive"><use href="#logo-h"/></svg>`;
}
tpl = tpl.replace(/\{\{(fi|si|ni):([a-z0-9-]+):(\d+)(?::([^}]+))?\}\}/g, (_, set, name, size, color) => iconTag(set, name, +size, color));
tpl = tpl.replace(/\{\{logo:(\d+)\}\}/g, (_, h) => logoTag(+h));
tpl = tpl.split("{{app}}").join(APP);

// FAQ — copy verbatim from RunClubFaq.dc.html
const FAQ = [
  ["Can someone try a run without joining the club?", "Yes. They sign up for one run and pay for a drop-in. No membership needed to try you out."],
  ["Do our runners have to download the app?", "Yes, but nobody has to hunt for it. A runner scans your QR code at check-in and the app takes it from there; they're set up on the spot."],
  ["We only sell drop-ins. Is that a problem?", "No. Start there. Once runners keep buying drop-ins, ForActive suggests a 4-, 8- or 12-run package for you to add to your offer."],
  ["Do we have to move regulars onto a membership ourselves?", "No. When a runner goes to pay for a drop-in and one of your memberships or packages would cost them less per run, the app offers it to them at checkout."],
  ["What about runners who pay cash?", "Fine. There's a cash option, so a runner who pays cash gets recorded like everyone else: same list, same attendance history."],
  ["Can we take program fees and event payments too?", "Yes: membership dues, program fees, recurring programs and event payments, in one place."],
  ["What does it cost the club?", "ForActive is free to start and stays free in any calendar month your club takes in less than $1,000. Every feature at no extra cost: QR check-in, memberships, packages. Over $1,000 in a calendar month, it's a flat $30 that month."],
  ["Is there a contract? What if we stop?", "No contracts. Stop any time, no penalties. Your data belongs to the club and stays yours: your members, your attendance history. What stops is the features, not the list."],
  ["We run a youth program. Can a parent sign up and pay for their kid?", "Yes. That's the everyday case: the parent signs up and pays, the kid runs."],
  ["Who do we talk to if we're stuck?", "A real person. Support is a human who answers."],
  ["Are payments secure?", "Yes. ForActive uses Stripe to process every payment."],
];
const faqHtml = FAQ.map(([q, a], i) => `      <div class="faq-item${i === 0 ? " open" : ""}">
        <button class="faq-q" type="button" aria-expanded="${i === 0}" aria-controls="faq-a-${i}" id="faq-q-${i}"><span>${q}</span>${iconTag("fi", "chevron-down", 24, null).replace('class="ic"', 'class="ic ic--down"')}${iconTag("fi", "chevron-up", 24, null).replace('class="ic"', 'class="ic ic--up"')}</button>
        <p class="faq-a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}">${a}</p>
      </div>`).join("\n");
tpl = tpl.replace("{{faq}}", faqHtml);

// sprite
let sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">\n';
for (const [id, d] of used) sprite += `<symbol id="${id}" viewBox="${d.viewBox}">${d.body}</symbol>\n`;
sprite += "</svg>";
tpl = tpl.replace("{{sprite}}", sprite);
if (/\{\{[a-z]/.test(tpl)) throw new Error("unexpanded token: " + tpl.match(/\{\{[^}]+\}\}/)[0]);

fs.writeFileSync(path.join(PAGE, "index.html"), tpl);
fs.copyFileSync(path.join(__dirname, "styles.css"), path.join(PAGE, "styles.css"));
for (const f of ["hero-club-photo.jpg", "app-scan-photo.png", "maya-avatar.png", "monica-avatar.png"]) fs.copyFileSync(path.join(__dirname, "assets", f), path.join(PAGE, "assets", f));

// favicon from the brand symbol (colour)
const symb = data.logoData["symbol-color"];
fs.writeFileSync(path.join(PAGE, "assets", "favicon.svg"), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${symb.viewBox}">${symb.body}</svg>`);

// root: keep what foractive.info did before (it framed www.foractive.com) — as a redirect
fs.writeFileSync(path.join(OUT, "index.html"), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>ForActive</title>
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=https://www.foractive.com/">
<link rel="canonical" href="https://www.foractive.com/">
<script>location.replace("https://www.foractive.com/");</script>
</head><body><p>Redirecting to <a href="https://www.foractive.com/">foractive.com</a>…</p></body></html>
`);
fs.writeFileSync(path.join(OUT, "404.html"), `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>ForActive</title><meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=https://foractive.info/running_clubs/"></head>
<body><p>Not here. Try <a href="https://foractive.info/running_clubs/">foractive.info/running_clubs</a>.</p></body></html>
`);
fs.writeFileSync(path.join(OUT, "CNAME"), "foractive.info\n");
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");
fs.writeFileSync(path.join(OUT, "robots.txt"), "User-agent: *\nAllow: /\nSitemap: https://foractive.info/sitemap.xml\n");
fs.writeFileSync(path.join(OUT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://foractive.info/running_clubs/</loc></url></urlset>\n`);
console.log("built:", fs.statSync(path.join(PAGE, "index.html")).size, "bytes; symbols:", used.size, [...used.keys()].join(", "));
