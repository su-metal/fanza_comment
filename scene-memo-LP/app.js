window.sceneMemoLocaleReady.then(copy => {
  const locale = window.sceneMemoLocale;
  let isTokyo = false;
  try { isTokyo = Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Tokyo"; } catch {}
  const price = isTokyo ? "¥500" : "$3.99";
  const vars = value => value.replaceAll("{price}", price);
  document.documentElement.lang = locale;
  document.title = vars(copy.title);
  const setMeta = (selector, value) => { const node = document.querySelector(selector); if (node) node.content = vars(value); };
  setMeta('meta[name="description"]', copy.description);
  setMeta('meta[property="og:title"]', copy.title);
  setMeta('meta[property="og:description"]', copy.description);
  setMeta('meta[property="og:locale"]', copy.ogLocale);

  if (copy.heroHtml) {
    const heroTitle = document.querySelector(".chosen-hero-title");
    if (heroTitle) heroTitle.innerHTML = copy.heroHtml;
  }
  const strings = Object.fromEntries(Object.entries(copy.strings || {}).map(([source, value]) => [source, vars(value)]));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let textNode;
  while ((textNode = walker.nextNode())) {
    const current = textNode.nodeValue;
    const source = current.trim();
    if (Object.prototype.hasOwnProperty.call(strings, source)) {
      const leading = current.match(/^\s*/)[0];
      const trailing = current.match(/\s*$/)[0];
      textNode.nodeValue = leading + strings[source] + trailing;
    }
  }
  const priceOffer = document.querySelector("#price-offer");
  if (isTokyo && priceOffer && copy.pricingPromo) {
    priceOffer.querySelector("[data-offer-label]").textContent = copy.pricingPromo.label;
    priceOffer.querySelector("[data-offer-until]").textContent = copy.pricingPromo.until;
    priceOffer.querySelector("[data-offer-next-price]").textContent = copy.pricingPromo.nextPrice;
    priceOffer.hidden = false;
  }
  const setAttr = (selector, name, value) => { const node = document.querySelector(selector); if (node) node.setAttribute(name, value); };
  setAttr(".theme-switch", "aria-label", copy.attrs.theme);
  setAttr(".caption-switch", "aria-label", copy.attrs.captions);
  setAttr("#note-input", "placeholder", copy.attrs.placeholder);
  setAttr("#note-form button", "aria-label", copy.attrs.save);
  setAttr("#timeline", "aria-label", copy.attrs.timeline);
  setAttr("#play", "aria-label", copy.demo.play);

  const t = (key, values = {}) => {
    const template = copy.demo[key] || key;
    return template.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
  };
  const demo = copy.demo;
  const notes = demo.notes.map((text, i) => ({ t: [0, 48, 95, 142][i], text }));
  const captionParts = demo.captions;
  let time = 0, playing = false, repeating = false, requestedScene = -1;
  const $ = selector => document.querySelector(selector);
  const fmt = value => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
  const colors = [
    "radial-gradient(ellipse at 40% 25%,#a43a66 0%,#4b1739 40%,#160f20 85%)",
    "radial-gradient(ellipse at 35% 35%,#c75b58 0%,#61203e 40%,#180c23 85%)",
    "radial-gradient(ellipse at 45% 30%,#9d3d91 0%,#50153f 40%,#140c1b 85%)",
    "radial-gradient(ellipse at 40% 35%,#8f2849 0%,#38112e 40%,#100b18 85%)"
  ];
  const sceneAssets = ["assets/demo-swim-varied-1-v1.png", "assets/demo-swim-varied-2-v1.png", "assets/demo-swim-varied-3-v1.png", "assets/demo-swim-varied-4-v1.png"];
  const sceneImages = sceneAssets.map(src => { const image = new Image(); image.src = src; return image; });
  function showSceneImage(index) {
    if (requestedScene === index) return;
    requestedScene = index;
    const apply = () => {
      if (requestedScene !== index) return;
      const photo = $(".demo-photo");
      photo.src = sceneAssets[index];
      photo.alt = `${demo.alts[index]}${demo.generated}`;
      photo.dataset.scene = String(index + 1);
      $(".player").dataset.layout = index !== 0 ? "memo-left" : "memo-right";
      $(".player").dataset.scene = String(index + 1);
    };
    const image = sceneImages[index];
    if (image.complete && image.naturalWidth > 0) apply();
    else image.addEventListener("load", apply, { once: true });
  }
  function update() {
    const index = time >= 142 ? 3 : time >= 95 ? 2 : time >= 48 ? 1 : 0;
    $("#timeline").value = time;
    $("#clock").textContent = fmt(time);
    $("#scene-number").textContent = `${demo.sceneLabel || "SCENE"} 0${index + 1} / 04`;
    $(".caption-lead").textContent = captionParts[index][0];
    $(".caption-accent").textContent = captionParts[index][1];
    showSceneImage(index);
    $(".scenery").style.background = colors[index];
    $(".demo-photo").style.filter = "brightness(1)";
    const active = notes.filter(note => note.t <= time).at(-1);
    document.querySelectorAll(".note").forEach(button => button.classList.toggle("active", Boolean(active && Number(button.dataset.time) === active.t)));
  }
  function renderNotes() {
    const container = $("#notes");
    container.replaceChildren();
    notes.sort((a, b) => a.t - b.t).forEach(note => {
      const button = document.createElement("button");
      button.className = "note";
      button.type = "button";
      const timestamp = document.createElement("time");
      timestamp.textContent = fmt(note.t);
      const label = document.createElement("span");
      label.textContent = note.text;
      button.append(timestamp, label);
      button.addEventListener("click", () => { time = note.t; update(); $("#demo-message").textContent = t("jump", { time: fmt(note.t), text: note.text }); });
      button.dataset.time = note.t;
      container.append(button);
    });
    update();
  }

  $("#timeline").addEventListener("input", event => { time = Number(event.target.value); update(); });
  $("#play").addEventListener("click", () => {
    if (time >= 180) time = 0;
    playing = !playing;
    $("#play").textContent = playing ? "Ⅱ" : "▶";
    $("#play").setAttribute("aria-label", t(playing ? "pause" : "play"));
    update();
  });
  $("#repeat").addEventListener("click", () => {
    repeating = !repeating;
    $("#repeat").setAttribute("aria-pressed", String(repeating));
    if (repeating) { time = 48; playing = true; $("#play").textContent = "Ⅱ"; $("#play").setAttribute("aria-label", t("pause")); }
    $("#demo-message").textContent = t(repeating ? "repeatOn" : "repeatOff");
    update();
  });
  $("#note-form").addEventListener("submit", event => {
    event.preventDefault();
    const value = $("#note-input").value.trim();
    if (!value) return;
    if (notes.length >= 12) { $("#demo-message").textContent = t("maxNotes"); return; }
    const existing = notes.find(note => note.t === time);
    if (existing) existing.text = value;
    else notes.push({ t: time, text: value });
    $("#note-input").value = "";
    renderNotes();
    $("#demo-message").textContent = t("saved", { time: fmt(time) });
  });
  setInterval(() => {
    if (!playing) return;
    time++;
    if (repeating && time >= 95) time = 48;
    if (time >= 180) { time = 180; playing = false; $("#play").textContent = "▶"; $("#play").setAttribute("aria-label", t("play")); }
    update();
  }, 1000);
  renderNotes();

  const themeButtons = document.querySelectorAll("[data-theme-choice]");
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme)));
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "light" ? "#fffafc" : "#0c090c";
    try { localStorage.setItem("scene-memo-lp-theme", theme); } catch {}
  }
  themeButtons.forEach(button => button.addEventListener("click", () => setTheme(button.dataset.themeChoice)));
  themeButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.themeChoice === document.documentElement.dataset.theme)));

  const captionButtons = document.querySelectorAll("[data-caption-choice]");
  function setCaptionStyle(style) {
    const value = style === "cinema" ? "cinema" : "magazine";
    $(".demo-shell").dataset.captionStyle = value;
    captionButtons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.captionChoice === value)));
    try { localStorage.setItem("scene-memo-caption-style", value); } catch {}
  }
  let savedCaptionStyle = "magazine";
  try { savedCaptionStyle = localStorage.getItem("scene-memo-caption-style") || "magazine"; } catch {}
  setCaptionStyle(savedCaptionStyle);
  captionButtons.forEach(button => button.addEventListener("click", () => setCaptionStyle(button.dataset.captionChoice)));
});
