let lightboxItems = []; // array de URLs del grupo actual
let currentIndex = 0;

function openLightbox(url, group = []) {
lightboxItems = group.length > 0 ? group : [url];
currentIndex = lightboxItems.indexOf(url);
loadLightboxItem(currentIndex);
document.getElementById("lightbox").style.display = "flex";
}

function loadLightboxItem(index) {
if (!lightboxItems[index]) return;
const url = lightboxItems[index];
const ext = url.split('.').pop().toLowerCase();
const container = document.getElementById("lightbox-content");
container.innerHTML = "";

let el;
if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    el = document.createElement("img");
    el.src = url;
    el.style = "max-width:100%; max-height:80vh; border-radius:10px; object-fit:contain;";
} else if (["mp4", "webm", "ogg"].includes(ext)) {
    el = document.createElement("video");
    el.src = url;
    el.controls = true;
    el.autoplay = true;
    el.style = "max-width:100%; max-height:80vh; border-radius:10px; object-fit:contain;";
} else if (["pdf"].includes(ext)) {
    el = document.createElement("iframe");
    el.src = url;
    el.style = "width:80vw; height:80vh; border:none; border-radius:10px;object-fit:contain;";
} else {
    el = document.createElement("p");
    el.textContent = "Tipo de archivo no compatible para vista previa.";
    el.style = "color:white";
}

container.appendChild(el);

// Mostrar/ocultar navegación
const leftNav = document.querySelector(".nav-left");
const rightNav = document.querySelector(".nav-right");

if (currentIndex > 0) {
    leftNav.style.display = "block";
} else {
    leftNav.style.display = "none";
}

if (currentIndex < lightboxItems.length - 1) {
    rightNav.style.display = "block";
} else {
    rightNav.style.display = "none";
}
}

function showNext() {
if (currentIndex < lightboxItems.length - 1) {
    currentIndex++;
    loadLightboxItem(currentIndex);
}
}

function showPrev() {
if (currentIndex > 0) {
    currentIndex--;
    loadLightboxItem(currentIndex);
}
}

function closeLightbox() {
const content = document.getElementById("lightbox-content");
const video = content.querySelector("video");
if (video) {
    video.pause();
    video.src = "";
    video.load();
}
content.innerHTML = "";
document.getElementById("lightbox").style.display = "none";
lightboxItems = [];
currentIndex = 0;
}

const categoryDefinitions = [
    { key: "montaje", label: "Montaje", terms: ["(montaje)"] },
    { key: "soldadura", label: "Soldadura", terms: ["soldadura"] },
    { key: "curso", label: "Curso", terms: ["curso"] },
    { key: "videojuego", label: "Videojuego", terms: ["videojuego", "ai flappy", "ai cars", "ai snake"] },
    { key: "social", label: "Social", terms: ["gm de", "clan de jugadores", "red social"] },
    { key: "web", label: "Página Web", terms: ["página", "escuela de videojuegos"] },
    { key: "modulo", label: "Módulo", terms: ["module", "módulo", "librería", "biblioteca"] },
    { key: "apuntes", label: "Apuntes", terms: ["apuntes", "artículos"] },
    { key: "proyecto", label: "Proyecto", terms: [] }
];

const technologyLabels = {
    "module": "Módulo",
    "web": "Web",
    "docs": "Docs",
    "gm:s": "GameMaker",
    "youtube": "YouTube",
    "lua": "Lua",
    "js": "JavaScript"
};

function cleanTitlePrefix(text, categoryKey) {
    let cleanText = text;
    let previousText;

    do {
        previousText = cleanText;
        cleanText = cleanText.replace(/^\s*\((?:curso|montaje)\)\s*/i, "");
        cleanText = cleanText.replace(/^\s*curso\s+/i, "");
        cleanText = cleanText.replace(/^\s*experimento\s+soldadura:\s*/i, "");
        if (["curso", "videojuego"].includes(categoryKey)) {
            cleanText = cleanText.replace(/^\s*videojuegos?\s+/i, "");
        }
        if (categoryKey === "web") {
            cleanText = cleanText.replace(/^\s*página(?:\s+para)?\s+/i, "");
        }
        if (categoryKey === "apuntes") {
            cleanText = cleanText.replace(/^\s*(?:apuntes|artículos)(?:\s+sobre)?\s+/i, "");
        }
    } while (cleanText !== previousText);

    return cleanText;
}

function technologyTag(name) {
    const label = technologyLabels[name.trim().toLocaleLowerCase("es")] || name.trim();
    const tag = document.createElement("span");
    tag.className = "technology-tag";
    tag.textContent = label;
    tag.setAttribute("aria-label", `Tecnología: ${label}`);
    return tag;
}

function formatTimelineText(item, categoryKey) {
    const walker = document.createTreeWalker(item, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
        if (!node.parentElement.closest("a, .category-tag, .technology-tag")) textNodes.push(node);
    }

    let titleStarted = false;
    textNodes.forEach((textNode) => {
        let text = textNode.textContent;
        if (!titleStarted && text.trim()) {
            text = cleanTitlePrefix(text, categoryKey);
            titleStarted = true;
        }

        const parts = text.split(/\[([^\]]+)\]/g);
        if (parts.length === 1) {
            textNode.textContent = text;
            return;
        }

        const fragment = document.createDocumentFragment();
        parts.forEach((part, index) => {
            if (!part) return;
            if (index % 2 === 0) {
                fragment.appendChild(document.createTextNode(part));
            } else {
                part.split(",").forEach((technology) => {
                    if (technology.trim()) fragment.appendChild(technologyTag(technology));
                });
            }
        });
        textNode.replaceWith(fragment);
    });
}

function setupTimelineFilters() {
    const selectedCategories = new Set();
    const filterButtons = document.querySelectorAll(".timeline-filter-list [data-category]");
    const resetButton = document.querySelector(".timeline-filter-reset");

    function applyFilters() {
        document.querySelectorAll(".year-section").forEach((section) => {
            let visibleItems = 0;
            section.querySelectorAll(":scope > ul > li").forEach((item) => {
                const visible = selectedCategories.size === 0 || selectedCategories.has(
                    [...item.classList].find((className) => className.startsWith("timeline-item--"))?.replace("timeline-item--", "")
                );
                item.hidden = !visible;
                if (visible) visibleItems++;
            });
            section.hidden = visibleItems === 0;
        });

        filterButtons.forEach((button) => {
            button.setAttribute("aria-pressed", selectedCategories.has(button.dataset.category));
        });
        resetButton.disabled = selectedCategories.size === 0;
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const category = button.dataset.category;
            if (selectedCategories.has(category)) selectedCategories.delete(category);
            else selectedCategories.add(category);
            applyFilters();
        });
    });

    resetButton.addEventListener("click", () => {
        selectedCategories.clear();
        applyFilters();
    });

    applyFilters();
}

function getActionIcon(link) {
    const label = link.textContent.trim().toLocaleLowerCase("es");
    const href = link.getAttribute("href") || "";

    if (href.includes("github.com")) return ["github", "Repositorio en GitHub"];
    if (href.includes("youtube.com") || label.includes("video")) return ["youtube", "Vídeo"];
    if (label.includes("demo") || label.includes("gif")) return ["play", "Demo"];
    if (label.includes("wiki") || label.includes("docs")) return ["book-open", "Documentación"];
    if (label.includes("pdf")) return ["file-text", "PDF"];
    if (label.includes("img") || label.includes("logo")) return ["image", "Imagen"];
    if (label.includes("apk")) return ["smartphone", "Aplicación Android"];
    if (label.includes("zip")) return ["archive", "Archivo ZIP"];
    if (label.includes("repo")) return ["github", "Repositorio"];
    if (label.includes("link") || label.includes("archive")) return ["external-link", "Enlace externo"];
    return ["external-link", "Abrir enlace"];
}

function decorateActionLinks() {
    document.querySelectorAll(".year-section > ul > li").forEach((item) => {
        [...item.childNodes].forEach((node) => {
            if (node.nodeType !== Node.TEXT_NODE || !node.previousSibling?.matches?.("a") || !node.nextSibling?.matches?.("a")) return;
            node.textContent = node.textContent.replace(/,\s*$/, "");
        });
    });

    document.querySelectorAll(".year-section > ul > li > a").forEach((link) => {
        const [icon, accessibleLabel] = getActionIcon(link);
        link.classList.add("timeline-action");
        link.title = accessibleLabel;
        link.setAttribute("aria-label", accessibleLabel);
        link.innerHTML = `<i data-lucide="${icon}" aria-hidden="true"></i><span class="visually-hidden">${accessibleLabel}</span>`;
    });

    if (window.lucide) window.lucide.createIcons();
}

function decorateTimeline() {
    document.querySelectorAll(".year-section > ul > li").forEach((item) => {
        const text = item.textContent.trim().toLocaleLowerCase("es");
        const category = categoryDefinitions.find((definition) =>
            definition.terms.some((term) => text.includes(term))
        ) || categoryDefinitions[categoryDefinitions.length - 1];

        item.classList.add(`timeline-item--${category.key}`);
        formatTimelineText(item, category.key);
        const tag = document.createElement("span");
        tag.className = `category-tag category-${category.key}`;
        tag.textContent = category.label;
        tag.setAttribute("aria-hidden", "true");
        item.insertBefore(tag, item.firstChild);
    });
    decorateActionLinks();
    setupTimelineFilters();
}

// Escape para cerrar
document.addEventListener("keydown", function(e) {
if (e.key === "Escape") closeLightbox();
if (e.key === "ArrowRight") showNext();
if (e.key === "ArrowLeft") showPrev();
});

// Detecta clics fuera del contenido
document.getElementById("lightbox").addEventListener("click", function(e) {
if (e.target === this) closeLightbox();
});

// Detectar grupos por <li>
document.addEventListener("DOMContentLoaded", function() {
const links = document.querySelectorAll('a[href]');
const mediaExts = ['jpg','jpeg','png','gif','webp','mp4','webm','ogg','pdf'];

links.forEach(link => {
    link.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href) return;

    // Detectar si es medio (imagen, video, pdf)
    const extMatch = href.match(/\.(\w{3,4})$/i);
    const isMedia = extMatch && mediaExts.includes(extMatch[1].toLowerCase());

    if (isMedia) {
        e.preventDefault();

        // Agrupar por <li>
        const li = this.closest("li");
        if (!li) return;

        const group = [...li.querySelectorAll("a[href]")]
        .map(a => a.getAttribute('href'))
        .filter(h => {
            if (!h) return false;
            const hExt = h.split('.').pop().toLowerCase();
            return mediaExts.includes(hExt);
        });

        openLightbox(href, group);
        return;
    }

    // Detectar si es un enlace externo (otro dominio)
    const isExternal = href.startsWith("http://") || href.startsWith("https://");

    if (isExternal) {
        e.preventDefault();
        window.open(href, "_blank");
        return;
    }

    // Si no es externo ni medio, dejarlo pasar como está
    });
});
});

window.addEventListener('DOMContentLoaded', () => {
    decorateTimeline();

    const params = new URLSearchParams(window.location.search);
    const mark = params.get('mark'); // e.g., "Videojuego"
  
    if (mark) {
      const regex = new RegExp(`\\b(${mark})\\b`, 'i');
  
            document.querySelectorAll('.year-section > ul > li').forEach(li => {
                const textNodes = [];
                const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
                let node;
                while ((node = walker.nextNode())) textNodes.push(node);

                textNodes.forEach(textNode => {
                    if (!regex.test(textNode.textContent)) return;
                    const fragment = document.createDocumentFragment();
                    const parts = textNode.textContent.split(regex);
                    parts.forEach((part, index) => {
                        if (part) {
                            const content = index % 2 === 1 ? document.createElement('span') : document.createTextNode(part);
                            if (index % 2 === 1) {
                                content.className = 'marked';
                                content.textContent = part;
                            }
                            fragment.appendChild(content);
                        }
                    });
                    textNode.replaceWith(fragment);
                });
            });
    }
  });