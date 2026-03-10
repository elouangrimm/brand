const DATA_URL = "brand-data.json";

let brandData = null;

const toast = document.getElementById("toast");

function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    requestAnimationFrame(() => {
        toast.classList.add("visible");
    });
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.classList.add("hidden"), 200);
    }, 1800);
}

async function copyText(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
        } else {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
        }
        showToast(`Copied: ${text}`);
    } catch {
        showToast("Copy failed");
    }
}

async function copyImageToClipboard(src) {
    try {
        const resp = await fetch(src);
        const blob = await resp.blob();
        const png = blob.type === "image/png" ? blob : await convertToPngBlob(blob);
        await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
        showToast("Copied image");
    } catch {
        showToast("Copy failed — try right-click save");
    }
}

function convertToPngBlob(blob) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const c = document.createElement("canvas");
            c.width = img.naturalWidth;
            c.height = img.naturalHeight;
            c.getContext("2d").drawImage(img, 0, 0);
            c.toBlob(resolve, "image/png");
            URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(blob);
    });
}

function downloadFile(url, filename) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || url.split("/").pop();
    document.body.appendChild(a);
    a.click();
    a.remove();
}

function downloadCanvas(canvas, filename) {
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename;
    a.click();
}

async function copyCanvas(canvas) {
    try {
        const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        showToast("Copied to clipboard");
    } catch {
        showToast("Copy failed");
    }
}

async function loadData() {
    const resp = await fetch(DATA_URL);
    brandData = await resp.json();
    renderAll();
}

function renderAll() {
    renderColors();
    renderPfp();
    renderBanners();
    renderFonts();
    renderStore();
    if (window._renderCardPresets) window._renderCardPresets();
    if (window.renderCard) window.renderCard();
}

function renderColors() {
    const groups = ["primary", "neutrals", "semantic"];
    groups.forEach((group) => {
        const grid = document.querySelector(`.swatch-grid[data-group="${group}"]`);
        if (!grid || !brandData.colors[group]) return;
        grid.innerHTML = "";
        brandData.colors[group].forEach((c) => {
            const el = document.createElement("div");
            el.className = "swatch";
            el.innerHTML = `
                <div class="swatch-color" style="background-color: ${c.hex}"></div>
                <div class="swatch-info">
                    <div class="swatch-name">${c.name}</div>
                    <div class="swatch-hex">${c.hex}</div>
                    <div class="swatch-usage">${c.usage}</div>
                </div>
            `;
            el.addEventListener("click", () => copyText(c.hex));
            grid.appendChild(el);
        });
    });

    document.getElementById("copy-css-vars").addEventListener("click", () => {
        let css = ":root {\n";
        Object.keys(brandData.colors).forEach((group) => {
            brandData.colors[group].forEach((c) => {
                const varName = `--${c.name.toLowerCase().replace(/\s+/g, "-")}`;
                css += `    ${varName}: ${c.hex};\n`;
            });
        });
        css += "}";
        copyText(css);
    });
}

function renderPfp() {
    const grid = document.getElementById("pfp-grid");
    grid.innerHTML = "";
    brandData.profilePictures.forEach((pfp) => {
        const card = document.createElement("div");
        card.className = "image-card";
        card.innerHTML = `
            <img src="${pfp.file}" alt="${pfp.name}" loading="lazy">
            <div class="image-card-info">
                <span class="image-card-name">${pfp.name}</span>
                <button class="image-card-dl" title="Download">↓</button>
            </div>
        `;
        card.querySelector("img").addEventListener("click", () => downloadFile(pfp.file, `pfp_${pfp.name.toLowerCase().replace(/\s+/g, "_")}.png`));
        card.querySelector(".image-card-dl").addEventListener("click", (e) => {
            e.stopPropagation();
            downloadFile(pfp.file, `pfp_${pfp.name.toLowerCase().replace(/\s+/g, "_")}.png`);
        });
        grid.appendChild(card);
    });

    const originalsGrid = document.getElementById("pfp-originals-grid");
    originalsGrid.innerHTML = "";
    const origFiles = [
        "blurple", "newpfp_black", "newpfp_blue", "newpfp_green",
        "newpfp_orange", "newpfp_purple", "newpfp_red",
        "newpfp_transparent", "newpfp_transparent_white", "newpfp_white"
    ];
    origFiles.forEach((name) => {
        const card = document.createElement("div");
        card.className = "image-card";
        const file = `assets/pfp/originals/${name}.png`;
        const displayName = name.replace(/^newpfp_/, "").replace(/_/g, " ");
        card.innerHTML = `
            <img src="${file}" alt="${displayName}" loading="lazy">
            <div class="image-card-info">
                <span class="image-card-name">${displayName}</span>
                <button class="image-card-dl" title="Download">↓</button>
            </div>
        `;
        card.querySelector("img").addEventListener("click", () => downloadFile(file, `pfp_original_${name}.png`));
        card.querySelector(".image-card-dl").addEventListener("click", (e) => {
            e.stopPropagation();
            downloadFile(file, `pfp_original_${name}.png`);
        });
        originalsGrid.appendChild(card);
    });
}

function renderBanners() {
    const grid = document.getElementById("banners-grid");
    grid.innerHTML = "";
    brandData.banners.forEach((b) => {
        const card = document.createElement("div");
        card.className = "banner-card";
        card.innerHTML = `
            <img src="${b.file}" alt="${b.name}" loading="lazy">
            <div class="banner-card-info">
                <span class="banner-card-name">${b.name}</span>
            </div>
        `;
        card.addEventListener("click", () => downloadFile(b.file, `banner_${b.name.toLowerCase()}.png`));
        grid.appendChild(card);
    });

    const originalsGrid = document.getElementById("banners-originals-grid");
    originalsGrid.innerHTML = "";
    const origBanners = ["banner_blue", "banner_green", "banner_orange", "banner_purple", "banner_red", "banner_white"];
    origBanners.forEach((name) => {
        const card = document.createElement("div");
        card.className = "banner-card";
        const file = `assets/banners/originals/${name}.png`;
        const displayName = name.replace(/^banner_/, "");
        card.innerHTML = `
            <img src="${file}" alt="${displayName}" loading="lazy">
            <div class="banner-card-info">
                <span class="banner-card-name">${displayName} (original)</span>
            </div>
        `;
        card.addEventListener("click", () => downloadFile(file, `${name}_original.png`));
        originalsGrid.appendChild(card);
    });
}

function renderFonts() {
    const list = document.getElementById("fonts-list");
    list.innerHTML = "";
    brandData.fonts.forEach((font) => {
        const card = document.createElement("div");
        card.className = "font-card";
        const isMono = font.name.toLowerCase().includes("mono") || font.name.toLowerCase().includes("code");
        card.innerHTML = `
            <div class="font-card-header">
                <div>
                    <div class="font-card-name">${font.name}</div>
                    <div class="font-card-usage">${font.usage}</div>
                </div>
            </div>
            <div class="font-card-preview" style="font-family: ${isMono ? "var(--font-mono)" : "var(--font-sans)"}">
                ${font.preview}
            </div>
            <div class="font-card-stack" title="Click to copy font stack">${font.stack}</div>
            <div class="font-card-actions">
                <a href="${font.url}" target="_blank" class="action-btn">Download</a>
                <button class="action-btn secondary copy-stack-btn">Copy Stack</button>
            </div>
        `;
        card.querySelector(".font-card-stack").addEventListener("click", () => copyText(font.stack));
        card.querySelector(".copy-stack-btn").addEventListener("click", () => copyText(font.stack));
        list.appendChild(card);
    });
}

function renderStore() {
    const grid = document.getElementById("store-grid");
    grid.innerHTML = "";
    brandData.miscImages.forEach((img) => {
        const item = document.createElement("div");
        item.className = "image-card store-item";
        item.dataset.name = img.name.toLowerCase();
        item.dataset.tags = (img.tags || []).join(" ");
        item.innerHTML = `
            <img src="${img.file}" alt="${img.name}" loading="lazy">
            <div class="image-card-info">
                <span class="image-card-name">${img.name}</span>
            </div>
            <div class="store-tags">
                ${(img.tags || []).map((t) => `<span class="store-tag">${t}</span>`).join("")}
            </div>
        `;
        item.addEventListener("click", (e) => {
            e.preventDefault();
            copyImageToClipboard(img.file);
        });
        item.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            downloadFile(img.file, img.file.split("/").pop());
        });
        grid.appendChild(item);
    });

    document.getElementById("store-search").addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase();
        grid.querySelectorAll(".store-item").forEach((el) => {
            const match = el.dataset.name.includes(q) || el.dataset.tags.includes(q);
            el.style.display = match ? "" : "none";
        });
    });
}


(() => {
    let variantMode = "auto";
    let resolvedVariant = "dark";
    let themeColor = "#3b82f6";
    let noiseIntensity = 18;
    let pfpBrandName = "";

    const colorPicker = document.getElementById("pfpgen-color-picker");
    const colorHex = document.getElementById("pfpgen-color-hex");
    const noiseSlider = document.getElementById("pfpgen-noise");
    const noiseValue = document.getElementById("pfpgen-noise-val");
    const previewCanvas = document.getElementById("pfpgen-canvas");
    const dlOriginal = document.getElementById("pfpgen-dl-original");
    const dl1000 = document.getElementById("pfpgen-dl-1000");
    const dlCustom = document.getElementById("pfpgen-dl-custom");
    const customSizeInput = document.getElementById("pfpgen-custom-size");
    const variantBtns = document.querySelectorAll("#pfpgen-tool .variant-btn");
    const brandInput = document.getElementById("pfpgen-brand-input");
    const brandFetchBtn = document.getElementById("pfpgen-brand-fetch");
    const brandStatus = document.getElementById("pfpgen-brand-status");
    const brandColors = document.getElementById("pfpgen-brand-colors");
    const apiKeyInput = document.getElementById("pfpgen-api-key");
    const saveKeyBtn = document.getElementById("pfpgen-save-key");

    const ctx = previewCanvas.getContext("2d");

    const baseDark = new Image();
    const baseLight = new Image();
    let darkLoaded = false;
    let lightLoaded = false;

    baseDark.onload = () => { darkLoaded = true; pfpRender(); };
    baseLight.onload = () => { lightLoaded = true; pfpRender(); };
    baseDark.src = "assets/pfp/base_dark.png";
    baseLight.src = "assets/pfp/base_light.png";

    function hexToRgb(hex) {
        hex = hex.replace("#", "");
        if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }

    function relativeLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map((c) => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    function bestVariant(hex) {
        const { r, g, b } = hexToRgb(hex);
        return relativeLuminance(r, g, b) < 0.4 ? "light" : "dark";
    }

    function resolveVariant() {
        resolvedVariant = variantMode === "auto" ? bestVariant(themeColor) : variantMode;
    }

    function mulberry32(a) {
        return function() {
            a |= 0; a = a + 0x6D2B79F5 | 0;
            let t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    function renderToCanvas(canvas, size) {
        const c = canvas.getContext("2d");
        canvas.width = size;
        canvas.height = size;
        c.imageSmoothingEnabled = false;

        const { r, g, b } = hexToRgb(themeColor);
        const intensity = noiseIntensity / 100;

        const offscreen = document.createElement("canvas");
        offscreen.width = 20;
        offscreen.height = 20;
        const oc = offscreen.getContext("2d");

        const imgData = oc.createImageData(20, 20);
        const rng = mulberry32(42);
        for (let y = 0; y < 20; y++) {
            for (let x = 0; x < 20; x++) {
                const i = (y * 20 + x) * 4;
                const noise = (rng() - 0.5) * 2 * intensity * 80;
                imgData.data[i]     = Math.max(0, Math.min(255, r + noise));
                imgData.data[i + 1] = Math.max(0, Math.min(255, g + noise));
                imgData.data[i + 2] = Math.max(0, Math.min(255, b + noise));
                imgData.data[i + 3] = 255;
            }
        }
        oc.putImageData(imgData, 0, 0);

        const baseImg = resolvedVariant === "dark" ? baseDark : baseLight;
        if (baseImg.complete && baseImg.naturalWidth > 0) {
            oc.drawImage(baseImg, 0, 0, 20, 20);
        }

        c.imageSmoothingEnabled = false;
        c.drawImage(offscreen, 0, 0, size, size);
    }

    function pfpRender() {
        resolveVariant();
        renderToCanvas(previewCanvas, 200);
    }

    function pfpDownload(size) {
        resolveVariant();
        const offCanvas = document.createElement("canvas");
        renderToCanvas(offCanvas, size);
        const link = document.createElement("a");
        link.download = pfpBrandName ? `${pfpBrandName}.png` : `pfp_${size}x${size}.png`;
        link.href = offCanvas.toDataURL("image/png");
        link.click();
    }

    variantBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            variantMode = btn.dataset.variant;
            variantBtns.forEach((b) => b.classList.toggle("active", b.dataset.variant === variantMode));
            pfpRender();
        });
    });

    colorPicker.addEventListener("input", (e) => {
        themeColor = e.target.value;
        colorHex.value = themeColor;
        pfpBrandName = "";
        pfpRender();
    });

    colorHex.addEventListener("input", (e) => {
        let val = e.target.value.trim();
        if (!val.startsWith("#")) val = "#" + val;
        if (/^#[0-9a-fA-F]{6}$/.test(val)) {
            themeColor = val;
            colorPicker.value = val;
            pfpBrandName = "";
            pfpRender();
        }
    });

    noiseSlider.addEventListener("input", (e) => {
        noiseIntensity = parseInt(e.target.value);
        noiseValue.textContent = noiseIntensity + "%";
        pfpRender();
    });

    dlOriginal.addEventListener("click", () => pfpDownload(20));
    dl1000.addEventListener("click", () => pfpDownload(1000));
    dlCustom.addEventListener("click", () => {
        const size = Math.max(20, Math.min(4096, parseInt(customSizeInput.value) || 512));
        pfpDownload(size);
    });

    const API_KEY_STORAGE = "pfpgen_branddev_key";

    function getApiKey() {
        return localStorage.getItem(API_KEY_STORAGE) || "";
    }

    apiKeyInput.value = getApiKey();

    saveKeyBtn.addEventListener("click", () => {
        const key = apiKeyInput.value.trim();
        if (key) {
            localStorage.setItem(API_KEY_STORAGE, key);
            setBrandStatus("Key saved", "success");
        } else {
            localStorage.removeItem(API_KEY_STORAGE);
            setBrandStatus("Key removed", "success");
        }
    });

    function setBrandStatus(msg, type) {
        brandStatus.textContent = msg;
        brandStatus.className = type || "";
    }

    function renderBrandSwatches(colors, selectedHex) {
        brandColors.innerHTML = "";
        if (!colors || colors.length <= 1) return;
        colors.forEach((c) => {
            const hex = c.hex.startsWith("#") ? c.hex : "#" + c.hex;
            const swatch = document.createElement("button");
            swatch.className = "pfpgen-swatch" + (hex.toLowerCase() === selectedHex.toLowerCase() ? " active" : "");
            swatch.style.backgroundColor = hex;
            swatch.title = `${c.name || ""} ${hex}`.trim();
            swatch.addEventListener("click", () => {
                themeColor = hex;
                colorPicker.value = hex;
                colorHex.value = hex;
                pfpRender();
                brandColors.querySelectorAll(".pfpgen-swatch").forEach((s) => s.classList.remove("active"));
                swatch.classList.add("active");
            });
            brandColors.appendChild(swatch);
        });
    }

    async function fetchBrand() {
        const key = getApiKey();
        if (!key) {
            setBrandStatus("Set your brand.dev API key below first", "error");
            document.getElementById("pfpgen-api-settings").open = true;
            return;
        }
        const query = brandInput.value.trim();
        if (!query) {
            setBrandStatus("Enter a brand name or domain", "error");
            return;
        }
        setBrandStatus("Fetching…", "loading");
        brandFetchBtn.disabled = true;
        try {
            const isDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(query);
            const endpoint = isDomain
                ? `https://api.brand.dev/v1/brand/retrieve?domain=${encodeURIComponent(query)}&fast=true`
                : `https://api.brand.dev/v1/brand/retrieve?name=${encodeURIComponent(query)}&fast=true`;
            const res = await fetch(endpoint, { headers: { "Authorization": `Bearer ${key}` } });
            if (!res.ok) {
                if (res.status === 401) setBrandStatus("Invalid API key", "error");
                else if (res.status === 404) setBrandStatus("Brand not found", "error");
                else setBrandStatus(`Error ${res.status}`, "error");
                return;
            }
            const data = await res.json();
            const colors = data?.brand?.colors;
            if (!colors || colors.length === 0) {
                setBrandStatus("No colors found", "error");
                return;
            }
            const primary = colors[0].hex;
            const primaryHex = primary.startsWith("#") ? primary : "#" + primary;
            themeColor = primaryHex;
            colorPicker.value = primaryHex;
            colorHex.value = primaryHex;
            pfpRender();
            const resolvedName = data?.brand?.title || query;
            pfpBrandName = resolvedName.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "").toLowerCase();
            setBrandStatus(`${resolvedName} → ${colors[0].name || primary}`, "success");
            renderBrandSwatches(colors, primaryHex);
        } catch {
            setBrandStatus("Network error", "error");
        } finally {
            brandFetchBtn.disabled = false;
        }
    }

    brandFetchBtn.addEventListener("click", fetchBrand);
    brandInput.addEventListener("keydown", (e) => { if (e.key === "Enter") fetchBrand(); });

    const bannerCanvas = document.getElementById("pfpgen-banner-canvas");
    const bannerCtx = bannerCanvas.getContext("2d");
    const dlBanner = document.getElementById("pfpgen-dl-banner");

    function renderBannerToCanvas(canvas, w, h) {
        const c = canvas.getContext("2d");
        canvas.width = w;
        canvas.height = h;
        c.imageSmoothingEnabled = false;

        const { r, g, b } = hexToRgb(themeColor);
        const intensity = noiseIntensity / 100;

        const offscreen = document.createElement("canvas");
        offscreen.width = w;
        offscreen.height = h;
        const oc = offscreen.getContext("2d");

        const imgData = oc.createImageData(w, h);
        const rng = mulberry32(42);
        for (let y = 0; y < h; y++) {
            for (let x = 0; x < w; x++) {
                const i = (y * w + x) * 4;
                const noise = (rng() - 0.5) * 2 * intensity * 80;
                imgData.data[i]     = Math.max(0, Math.min(255, r + noise));
                imgData.data[i + 1] = Math.max(0, Math.min(255, g + noise));
                imgData.data[i + 2] = Math.max(0, Math.min(255, b + noise));
                imgData.data[i + 3] = 255;
            }
        }
        oc.putImageData(imgData, 0, 0);
        c.drawImage(offscreen, 0, 0);
    }

    function bannerRender() {
        resolveVariant();
        renderBannerToCanvas(bannerCanvas, 600, 200);
    }

    function bannerDownload() {
        resolveVariant();
        const offCanvas = document.createElement("canvas");
        renderBannerToCanvas(offCanvas, 1500, 500);
        const link = document.createElement("a");
        link.download = pfpBrandName ? `${pfpBrandName}_banner.png` : "banner_1500x500.png";
        link.href = offCanvas.toDataURL("image/png");
        link.click();
    }

    dlBanner.addEventListener("click", bannerDownload);

    const origPfpRender = pfpRender;
    pfpRender = function() {
        origPfpRender();
        bannerRender();
    };

    pfpRender();
})();


(() => {
    let logoImg = null;
    let logoShape = "circle";
    const canvas = document.getElementById("card-canvas");
    const ctx = canvas.getContext("2d");

    const titleInput = document.getElementById("card-title");
    const subtitleInput = document.getElementById("card-subtitle");
    const titleColorPicker = document.getElementById("card-title-color");
    const titleColorHex = document.getElementById("card-title-color-hex");
    const subtitleColorPicker = document.getElementById("card-subtitle-color");
    const subtitleColorHex = document.getElementById("card-subtitle-color-hex");
    const bgColorPicker = document.getElementById("card-bg-color");
    const bgColorHex = document.getElementById("card-bg-color-hex");
    const widthInput = document.getElementById("card-width");
    const heightInput = document.getElementById("card-height");
    const logoInput = document.getElementById("card-logo-input");
    const logoDrop = document.getElementById("card-logo-drop");
    const logoLabel = document.getElementById("card-logo-label");
    const downloadBtn = document.getElementById("card-download");
    const copyBtn = document.getElementById("card-copy");
    const shapeBtns = document.querySelectorAll(".card-shape-btn");

    function syncColorInputs(picker, hex) {
        picker.addEventListener("input", (e) => {
            hex.value = e.target.value;
            renderCard();
        });
        hex.addEventListener("input", (e) => {
            let val = e.target.value.trim();
            if (!val.startsWith("#")) val = "#" + val;
            if (/^#[0-9a-fA-F]{6}$/.test(val)) {
                picker.value = val;
                renderCard();
            }
        });
    }

    syncColorInputs(titleColorPicker, titleColorHex);
    syncColorInputs(subtitleColorPicker, subtitleColorHex);
    syncColorInputs(bgColorPicker, bgColorHex);

    titleInput.addEventListener("input", renderCard);
    subtitleInput.addEventListener("input", renderCard);
    widthInput.addEventListener("change", renderCard);
    heightInput.addEventListener("change", renderCard);

    shapeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            logoShape = btn.dataset.shape;
            shapeBtns.forEach((b) => b.classList.toggle("active", b === btn));
            renderCard();
        });
    });

    logoDrop.addEventListener("click", () => logoInput.click());
    logoDrop.addEventListener("dragover", (e) => { e.preventDefault(); logoDrop.classList.add("drag-over"); });
    logoDrop.addEventListener("dragleave", () => logoDrop.classList.remove("drag-over"));
    logoDrop.addEventListener("drop", (e) => {
        e.preventDefault();
        logoDrop.classList.remove("drag-over");
        const file = e.dataTransfer.files[0];
        if (file) loadLogo(file);
    });
    logoInput.addEventListener("change", (e) => {
        if (e.target.files[0]) loadLogo(e.target.files[0]);
    });

    function loadLogo(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                logoImg = img;
                logoDrop.classList.add("has-logo");
                logoDrop.innerHTML = "";
                const preview = document.createElement("img");
                preview.src = e.target.result;
                logoDrop.appendChild(preview);
                renderCard();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function renderCard() {
        const w = parseInt(widthInput.value) || 1200;
        const h = parseInt(heightInput.value) || 630;
        canvas.width = w;
        canvas.height = h;

        const bg = bgColorPicker.value;
        const titleColor = titleColorPicker.value;
        const subtitleColor = subtitleColorPicker.value;
        const titleText = titleInput.value || "";
        const subtitleText = subtitleInput.value || "";

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const padding = w * 0.04;
        const logoSize = Math.min(h * 0.6, w * 0.22);
        const logoX = padding * 1.5;
        const logoY = (h - logoSize) / 2;

        if (logoImg) {
            ctx.save();
            if (logoShape === "circle") {
                ctx.beginPath();
                ctx.arc(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2, 0, Math.PI * 2);
                ctx.clip();
            } else if (logoShape === "rounded") {
                const r = logoSize * 0.15;
                roundRect(ctx, logoX, logoY, logoSize, logoSize, r);
                ctx.clip();
            }
            ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            ctx.restore();
        }

        const textX = logoImg ? logoX + logoSize + padding * 1.2 : padding * 1.5;
        const textAreaW = w - textX - padding * 1.5;

        const maxTitleSize = Math.min(h * 0.18, w * 0.1);
        const titleFamily = '"JetBrains Mono", "SF Mono", monospace';
        let titleFontSize = maxTitleSize;
        ctx.font = `bold ${titleFontSize}px ${titleFamily}`;
        let titleLines = wrapText(ctx, titleText, textAreaW);
        while (titleLines.length > 2 && titleFontSize > 16) {
            titleFontSize -= 2;
            ctx.font = `bold ${titleFontSize}px ${titleFamily}`;
            titleLines = wrapText(ctx, titleText, textAreaW);
        }

        const subFamily = '"JetBrains Mono", "SF Mono", monospace';
        let subFontSize = Math.min(h * 0.09, titleFontSize * 0.55);
        ctx.font = `${subFontSize}px ${subFamily}`;
        let subLines = subtitleText ? wrapText(ctx, subtitleText, textAreaW) : [];
        while (subLines.length > 3 && subFontSize > 12) {
            subFontSize -= 2;
            ctx.font = `${subFontSize}px ${subFamily}`;
            subLines = wrapText(ctx, subtitleText, textAreaW);
        }

        const titleBlockH = titleLines.length * titleFontSize * 1.15;
        const gap = subtitleText ? h * 0.025 : 0;
        const subBlockH = subLines.length * subFontSize * 1.4;
        const totalH = titleBlockH + gap + subBlockH;
        const startY = (h - totalH) / 2;

        ctx.font = `bold ${titleFontSize}px ${titleFamily}`;
        ctx.fillStyle = titleColor;
        ctx.textBaseline = "top";
        let ty = startY;
        titleLines.forEach((line) => {
            ctx.fillText(line, textX, ty);
            ty += titleFontSize * 1.15;
        });

        if (subtitleText && subLines.length) {
            ctx.font = `${subFontSize}px ${subFamily}`;
            ctx.fillStyle = subtitleColor;
            ctx.textBaseline = "top";
            let sy = ty + gap;
            subLines.forEach((line) => {
                ctx.fillText(line, textX, sy);
                sy += subFontSize * 1.4;
            });
        }
    }

    function wrapText(ctx, text, maxW) {
        const words = text.split(" ");
        const lines = [];
        let current = "";
        words.forEach((word) => {
            const test = current ? current + " " + word : word;
            if (ctx.measureText(test).width <= maxW) {
                current = test;
            } else {
                if (current) lines.push(current);
                current = word;
            }
        });
        if (current) lines.push(current);
        return lines;
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    downloadBtn.addEventListener("click", () => {
        downloadCanvas(canvas, `card_${titleInput.value.replace(/\s+/g, "_").toLowerCase() || "untitled"}.png`);
    });

    copyBtn.addEventListener("click", () => copyCanvas(canvas));

    window.renderCard = renderCard;

    function renderCardPresets() {
        const presetsContainer = document.getElementById("card-presets");
        presetsContainer.innerHTML = "";
        if (!brandData || !brandData.projects) return;
        brandData.projects.forEach((project) => {
            const btn = document.createElement("button");
            btn.className = "preset-btn";
            btn.textContent = project.name;
            btn.addEventListener("click", () => {
                titleInput.value = project.name;
                subtitleInput.value = project.subtitle || "";
                if (project.color) {
                    titleColorPicker.value = project.color;
                    titleColorHex.value = project.color;
                }
                if (project.logo) {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.onload = () => {
                        logoImg = img;
                        logoDrop.classList.add("has-logo");
                        logoDrop.innerHTML = "";
                        const preview = document.createElement("img");
                        preview.src = project.logo;
                        logoDrop.appendChild(preview);
                        renderCard();
                    };
                    img.src = project.logo;
                } else {
                    renderCard();
                }
            });
            presetsContainer.appendChild(btn);
        });
    }

    window._renderCardPresets = renderCardPresets;
})();


(() => {
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.dataset.section === entry.target.id);
                });
            }
        });
    }, { rootMargin: "-20% 0px -60% 0px" });

    sections.forEach((section) => observer.observe(section));

    const content = document.getElementById("content");
    content.addEventListener("scroll", () => {
        if (content.scrollTop + content.clientHeight >= content.scrollHeight - 40) {
            const lastSection = sections[sections.length - 1];
            navLinks.forEach((link) => {
                link.classList.toggle("active", link.dataset.section === lastSection.id);
            });
        }
    });
    window.addEventListener("scroll", () => {
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 40) {
            const lastSection = sections[sections.length - 1];
            navLinks.forEach((link) => {
                link.classList.toggle("active", link.dataset.section === lastSection.id);
            });
        }
    });

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            if (window.innerWidth <= 900) {
                document.getElementById("sidebar").classList.remove("open");
            }
        });
    });

    const mobileToggle = document.getElementById("mobile-nav-toggle");
    const sidebar = document.getElementById("sidebar");
    mobileToggle.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
        if (window.innerWidth <= 900 && !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
            sidebar.classList.remove("open");
        }
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    loadData();
});
