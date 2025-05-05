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
    const params = new URLSearchParams(window.location.search);
    const mark = params.get('mark'); // e.g., "Videojuego"
  
    if (mark) {
      const regex = new RegExp(`\\b(${mark})\\b`, 'i');
  
      document.querySelectorAll('li').forEach(li => {
        const firstNode = li.firstChild;
  
        if (firstNode && firstNode.nodeType === Node.TEXT_NODE) {
          const match = firstNode.textContent.match(regex);
          if (match) {
            const highlightedText = firstNode.textContent.replace(
              regex,
              `<span class="marked">$1</span>`
            );
            const spanWrapper = document.createElement('span');
            spanWrapper.innerHTML = highlightedText;
            li.replaceChild(spanWrapper, firstNode);
          }
        }
      });
    }
  });