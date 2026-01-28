// Toast Notifications
function showToast(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  // Max 3 toasts — remove oldest if needed
  while (container.children.length >= 3) {
    container.removeChild(container.firstChild);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    ${message}
    <button class="toast-close" onclick="this.parentElement.classList.add('removing'); setTimeout(() => this.parentElement.remove(), 300);">&times;</button>
    <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Preloader
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    setTimeout(() => {
      preloader.classList.add("preloader-hidden");
    }, 2000);
    preloader.addEventListener("transitionend", () => {
      preloader.remove();
    });
  }
});

// Smooth scroll para navegación
document.querySelectorAll(".scroll-link").forEach((link) => {
  link.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // Cerrar menú móvil si está abierto
    document.querySelector(".nav-links").classList.remove("active");
  });
});

// Hamburger menu
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Cargar eventos desde Firebase
async function cargarEventos() {
  const container = document.getElementById("eventosContainer");
  container.innerHTML = ""; // Limpiar contenedor

  try {
    // Obtener eventos activos desde Firestore
    const eventosSnapshot = await db
      .collection("eventos")
      .where("activo", "==", true)
      .orderBy("fecha", "asc")
      .get();

    if (eventosSnapshot.empty) {
      container.innerHTML =
        '<p style="text-align:center; color:#999;">No hay eventos próximos</p>';
      return;
    }

    eventosSnapshot.forEach((doc) => {
      const evento = doc.data();
      const eventoId = doc.id;

      const card = document.createElement("div");
      card.className = "evento-card";

      card.innerHTML = `
                <div class="evento-img-wrapper">
                  <img src="${evento.imagen}" alt="${evento.titulo}" class="evento-img" onerror="this.src='https://via.placeholder.com/400x280?text=Evento'">
                </div>
                <div class="evento-info">
                    <h3>${evento.titulo}</h3>
                    <p><strong>Fecha:</strong> ${formatearFecha(evento.fecha)}</p>
                    <p><strong>Hora:</strong> ${evento.hora}</p>
                    <p><strong>Lugar:</strong> ${evento.lugar}</p>
                    <p class="evento-precio">$${evento.precio.toLocaleString("es-AR")}</p>
                    <p class="evento-disponibles">${evento.disponibles} entradas disponibles</p>
                    <div class="evento-botones">
                        <a href="#" class="btn-comprar" onclick="comprarEntrada(${eventoId}); return false;">Comprar Entrada</a>
                        <button class="btn-mapa" onclick="abrirMapa('${evento.lugar}'); return false;" title="Ver ubicación" aria-label="Ver ubicación en mapa">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                      </button>
                    </div>
                </div>
            `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando eventos:", error);
    container.innerHTML =
      '<p style="text-align:center; color:red;">Error cargando eventos</p>';
  }
}

// Cargar galerías de eventos pasados
async function cargarGaleria() {
  const container = document.getElementById("galeriaContainer");
  const verMasBtn = document.getElementById("galeriaVerMas");
  const verMenosBtn = document.getElementById("galeriaVerMenos");
  container.innerHTML = "";

  try {
    const galeriasSnapshot = await db
      .collection("galerias")
      .orderBy("fecha", "desc")
      .get();

    if (galeriasSnapshot.empty) {
      container.innerHTML =
        '<p style="text-align:center; color:#999;">No hay galerías aún</p>';
      return;
    }

    let galeriaCount = 0;

    galeriasSnapshot.forEach((doc) => {
      const galeria = doc.data();

      // Solo mostrar si tiene fotos
      if (!galeria.fotos || galeria.fotos.length === 0) return;

      galeriaCount++;

      // Crear contenedor por evento
      const eventoDiv = document.createElement("div");
      eventoDiv.className = "galeria-evento";

      // Ocultar a partir de la 3ra galería
      if (galeriaCount > 2) {
        eventoDiv.classList.add("galeria-oculta");
      }

      // Contenedor con imagen principal y botón expandir
      const preview = document.createElement("div");
      preview.className = "galeria-preview";
      preview.style.cssText =
        "cursor: pointer; position: relative; display: inline-block; width: 100%;";

      const imgPrincipal = document.createElement("img");
      imgPrincipal.src = galeria.fotos[0];
      imgPrincipal.alt = galeria.titulo;
      imgPrincipal.className = "galeria-img-principal";
      imgPrincipal.style.cssText =
        "width: 100%; height: 250px; object-fit: cover; border-radius: 5px;";
      // Overlay con info del evento
      const infoOverlay = document.createElement("div");
      infoOverlay.style.cssText =
        "position: absolute; top: 20px; left: 20px; background: rgba(0,0,0,0.8); color: white; padding: 15px 20px; border-radius: 5px;";
      infoOverlay.innerHTML = `
                <h4 style="margin: 0 0 5px 0; font-size: 1.3rem;">${galeria.titulo}</h4>
                <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">${formatearFecha(galeria.fecha)}</p>
            `;

      // Overlay "Ver galería"
      const overlay = document.createElement("div");
      overlay.className = "galeria-overlay";
      overlay.style.cssText =
        "position: absolute; bottom: 20px; left: 20px; background: rgba(255,107,0,0.9); color: white; padding: 10px 20px; border-radius: 5px; font-size: 1rem; font-weight: bold; transition: all 0.3s ease;";
      overlay.textContent = `Ver galería (${galeria.fotos.length} fotos)`;

      preview.appendChild(imgPrincipal);
      preview.appendChild(infoOverlay);
      preview.appendChild(overlay);

      // Grid oculto con todas las fotos
      const gridId = "grid-" + doc.id;
      const grid = document.createElement("div");
      grid.id = gridId;
      grid.className = "galeria-grid";
      grid.style.display = "none";
      grid.style.overflow = "hidden";

      galeria.fotos.forEach((fotoUrl, index) => {
        const img = document.createElement("img");
        img.src = fotoUrl;
        img.alt = `${galeria.titulo} - Foto ${index + 1}`;
        img.className = "galeria-img";
        img.dataset.index = index;
        img.dataset.galeriaId = doc.id;
        img.onclick = () => abrirLightbox(doc.id, index);
        img.onerror = function () {
          this.src = "https://via.placeholder.com/250?text=Foto";
        };
        grid.appendChild(img); // Agregar IMAGEN al grid
      });

      // Click en preview para expandir
      preview.onclick = () => {
        const gridElement = document.getElementById(gridId);

        if (
          gridElement.style.display === "none" ||
          gridElement.classList.contains("closing")
        ) {
          gridElement.style.display = "grid";
          gridElement.classList.remove("closing");
          gridElement.classList.add("opening");
          overlay.textContent = "Ocultar galería";
        } else {
          gridElement.classList.remove("opening");
          gridElement.classList.add("closing");
          overlay.textContent = `Ver galería (${galeria.fotos.length} fotos)`;
          setTimeout(() => {
            gridElement.style.display = "none";
          }, 700);
        }
      };

      eventoDiv.appendChild(preview); // Agregar preview al evento
      eventoDiv.appendChild(grid); // Agregar grid al evento
      container.appendChild(eventoDiv); // Agregar evento al container
    });

    // Mostrar botón "Ver más..." si hay más de 2 galerías
    if (galeriaCount > 2) {
      verMasBtn.style.display = "block";

      verMasBtn.onclick = () => {
        const ocultas = document.querySelectorAll(".galeria-oculta");
        ocultas.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add("galeria-mostrar");
          }, i * 150); // Stagger animation
        });
        verMasBtn.style.display = "none";
        verMenosBtn.style.display = "block";
      };

      verMenosBtn.onclick = () => {
        const mostradas = Array.from(document.querySelectorAll(".galeria-mostrar"));
        const total = mostradas.length;
        const reversed = [...mostradas].reverse();
        reversed.forEach((el, i) => {
          setTimeout(() => {
            el.classList.add("galeria-ocultando");
            if (i === total - 1) {
              setTimeout(() => {
                mostradas.forEach((el) => {
                  el.classList.remove("galeria-mostrar", "galeria-ocultando");
                });
                verMenosBtn.style.display = "none";
                verMasBtn.style.display = "block";
              }, 500);
            }
          }, i * 150);
        });
      };
    }
  } catch (error) {
    console.error("Error cargando galerías:", error);
    container.innerHTML =
      '<p style="text-align:center; color:red;">Error cargando galerías</p>';
  }
}

// Formatear fecha
function formatearFecha(fecha) {
  const opciones = { year: "numeric", month: "long", day: "numeric" };
  return new Date(fecha).toLocaleDateString("es-AR", opciones);
}

// Función para comprar entrada (placeholder)
function comprarEntrada(eventoId) {
  // Verificar si el usuario está logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (!usuario) {
    showToast("Debes iniciar sesión para comprar entradas", "error");
    document.getElementById("loginBtn").click();
    return;
  }

  // Aquí irá la integración con MercadoPago
  showToast("Próximamente: compra de entradas online", "info");
  // Redirigir a página de pago de MercadoPago
}

// Navbar scroll + Hero parallax
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;

  // Navbar background
  const navbar = document.querySelector(".navbar");
  if (scrollY > 100) {
    navbar.style.background = "rgba(26, 26, 26, 0.95)";
  } else {
    navbar.style.background = "var(--color-secondary)";
  }

  // Hero parallax (desktop only)
  if (window.innerWidth > 768 && scrollY < window.innerHeight) {
    const hero = document.querySelector(".hero");
    const heroContent = document.querySelector(".hero-content");
    hero.style.backgroundPositionY = `${scrollY * 0.4}px`;
    heroContent.style.transform = `translateY(${-scrollY * 0.15}px)`;
    heroContent.style.opacity = Math.max(0.4, 1 - (scrollY / window.innerHeight) * 0.6);
  }
});

// Inicializar cuando cargue la página
document.addEventListener("DOMContentLoaded", async () => {
  await cargarEventos();
  await cargarGaleria();
  initScrollReveal();
  initActiveNav();

  // Actualizar UI si hay usuario logueado
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (usuario) {
    actualizarUIUsuario(usuario);
  }
});

// Actualizar UI cuando el usuario está logueado
function actualizarUIUsuario(usuario) {
  const loginBtn = document.getElementById("loginBtn");
  loginBtn.textContent = usuario.nombre;

  // Remover el evento del modal y agregar link al perfil
  loginBtn.onclick = null;
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "pages/perfil.html";
  });

  loginBtn.classList.add("user-logged");
}
// Lightbox para galería
let galeriaActual = [];
let indexActual = 0;

function abrirLightbox(galeriaId, index) {
  // Obtener fotos de la galería
  db.collection("galerias")
    .doc(galeriaId)
    .get()
    .then((doc) => {
      if (!doc.exists) return;

      galeriaActual = doc.data().fotos;
      indexActual = index;
      mostrarLightbox();
    });
}

function mostrarLightbox() {
  // Crear lightbox si no existe
  let lightbox = document.getElementById("lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.id = "lightbox";
    lightbox.style.cssText =
      "display: none; position: fixed; z-index: 9999; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); align-items: center; justify-content: center;";

    lightbox.innerHTML = `
            <span style="position: absolute; top: 20px; right: 40px; color: white; font-size: 3rem; cursor: pointer;" onclick="cerrarLightbox()">&times;</span>
            <span style="position: absolute; left: 40px; top: 50%; transform: translateY(-50%); color: white; font-size: 3rem; cursor: pointer; user-select: none;" onclick="navegarLightbox(-1)">&#10094;</span>
            <img id="lightbox-img" style="max-width: 90%; max-height: 90%; object-fit: contain;">
            <span style="position: absolute; right: 40px; top: 50%; transform: translateY(-50%); color: white; font-size: 3rem; cursor: pointer; user-select: none;" onclick="navegarLightbox(1)">&#10095;</span>
            <div style="position: absolute; bottom: 20px; color: white; font-size: 1.2rem;" id="lightbox-counter"></div>
        `;

    document.body.appendChild(lightbox);

    // Cerrar con ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cerrarLightbox();
      if (e.key === "ArrowLeft") navegarLightbox(-1);
      if (e.key === "ArrowRight") navegarLightbox(1);
    });
  }

  // Mostrar imagen actual
  document.getElementById("lightbox-img").src = galeriaActual[indexActual];
  document.getElementById("lightbox-counter").textContent =
    `${indexActual + 1} / ${galeriaActual.length}`;
  lightbox.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function cerrarLightbox() {
  document.getElementById("lightbox").style.display = "none";
  document.body.style.overflow = "auto";
}

function navegarLightbox(direccion) {
  indexActual += direccion;
  if (indexActual < 0) indexActual = galeriaActual.length - 1;
  if (indexActual >= galeriaActual.length) indexActual = 0;

  document.getElementById("lightbox-img").src = galeriaActual[indexActual];
  document.getElementById("lightbox-counter").textContent =
    `${indexActual + 1} / ${galeriaActual.length}`;
}
// Abrir ubicación en Google Maps
function abrirMapa(lugar) {
  const query = encodeURIComponent(lugar + ", Mar del Plata, Argentina");
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${query}`,
    "_blank",
  );
}
// Cargar productos de un sponsor desde Firestore
async function cargarProductos(sponsorId) {
  const container = document.getElementById("tiendaProductos");
  container.innerHTML =
    '<p style="text-align: center; color: #999;">Cargando productos...</p>';
  try {
    const productosSnapshot = await db
      .collection("productos")
      .where("sponsorId", "==", sponsorId)
      .get();

    container.innerHTML = "";

    if (productosSnapshot.empty) {
      container.innerHTML =
        '<p style="text-align: center; color: #999;">No hay productos disponibles para este sponsor</p>';
      return;
    }

    productosSnapshot.forEach((doc) => {
      const producto = doc.data();

      const card = document.createElement("div");
      card.className = "producto-card";

      card.innerHTML = `
        ${producto.nuevo ? '<span class="producto-badge">NEW</span>' : ''}
        <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img" onclick="abrirLightboxProducto('${producto.imagen}', '${producto.nombre}')">
        <div class="producto-info">
          <p class="producto-nombre">${producto.nombre}</p>
          <div class="producto-meta">
            <span class="producto-precio">$${producto.precio.toLocaleString("es-AR")}</span>
            <span class="producto-stock ${producto.stock > 0 ? '' : 'sin-stock'}">${producto.stock > 0 ? `Stock: ${producto.stock}` : 'Agotado'}</span>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (error) {
    console.error("Error cargando productos:", error);
    container.innerHTML =
      '<p style="text-align: center; color: red;">Error cargando productos</p>';
  }
}

// Cargar tabs de sponsors y productos
async function inicializarTienda() {
  try {
    const sponsorsSnapshot = await db.collection("sponsors").get();

    if (sponsorsSnapshot.empty) {
      document.getElementById("tiendaProductos").innerHTML =
        '<p style="text-align: center; color: #999;">No hay sponsors disponibles</p>';
      return;
    }

    const tabsContainer = document.querySelector(".tienda-tabs");
    tabsContainer.innerHTML = "";

    // Recopilar sponsors en un array
    const sponsors = [];
    sponsorsSnapshot.forEach((doc) => {
      sponsors.push({ id: doc.id, ...doc.data() });
    });

    // Buscar "mardelrap" como sponsor por defecto, o usar el último
    const defaultSponsor = sponsors.find(s =>
      s.nombre.toLowerCase().replace(/\s+/g, '') === 'mardelrap'
    ) || sponsors[sponsors.length - 1];

    sponsors.forEach((sponsor) => {
      const tab = document.createElement("button");
      tab.className = "tienda-tab" + (sponsor.id === defaultSponsor.id ? " active" : "");
      tab.setAttribute("data-sponsor", sponsor.id);
      tab.textContent = sponsor.nombre.toUpperCase();
      tabsContainer.appendChild(tab);
    });

    tabsContainer.querySelectorAll(".tienda-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.classList.contains("active")) return;

        const sponsorId = tab.getAttribute("data-sponsor");
        const productosContainer = document.getElementById("tiendaProductos");

        document
          .querySelectorAll(".tienda-tab")
          .forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Fade out productos y cambiar fondo simultáneamente
        productosContainer.classList.add("fade-out");
        cambiarFondoTienda(sponsorId);

        // Después del fade out, cargar nuevos productos y fade in
        setTimeout(async () => {
          await cargarProductos(sponsorId);
          productosContainer.classList.remove("fade-out");
        }, 350);
      });
    });

    // Cargar productos del sponsor por defecto
    cambiarFondoTienda(defaultSponsor.id);
    cargarProductos(defaultSponsor.id);
  } catch (error) {
    console.error("Error inicializando tienda:", error);
  }
}

// Cambiar fondo de tienda según sponsor con crossfade
async function cambiarFondoTienda(sponsorId) {
  const tienda = document.querySelector(".tienda");
  const fondoOverlay = document.querySelector(".tienda-fondo");

  try {
    let fondoURL = "assets/images/ADD/fondoTienda.png"; // Fondo por defecto

    if (sponsorId) {
      const sponsorDoc = await db.collection("sponsors").doc(sponsorId).get();
      if (sponsorDoc.exists && sponsorDoc.data().fondo) {
        fondoURL = sponsorDoc.data().fondo;
      }
    }

    // Crossfade: poner nueva imagen en overlay y hacer fade in
    fondoOverlay.style.backgroundImage = `url('${fondoURL}')`;
    fondoOverlay.classList.add("active");

    // Después de la transición, mover la imagen al fondo base y resetear overlay
    const onTransitionEnd = () => {
      tienda.style.backgroundImage = `url('${fondoURL}')`;
      fondoOverlay.classList.remove("active");
      fondoOverlay.removeEventListener("transitionend", onTransitionEnd);
    };

    fondoOverlay.addEventListener("transitionend", onTransitionEnd);
  } catch (error) {
    console.error("Error cargando fondo:", error);
  }
}

// Llamar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarTienda);
} else {
  inicializarTienda();
}
// Lightbox para productos
function abrirLightboxProducto(imagenURL, nombreProducto) {
    // Crear lightbox si no existe
    let lightbox = document.getElementById('lightbox-producto');
    
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'lightbox-producto';
        lightbox.style.cssText = `
            display: none;
            position: fixed;
            z-index: 9999;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            align-items: center;
            justify-content: center;
            cursor: zoom-out;
        `;

        lightbox.innerHTML = `
            <span style="position: absolute; top: 20px; right: 40px; color: white; font-size: 3rem; cursor: pointer; z-index: 10000;" onclick="cerrarLightboxProducto()">&times;</span>
            <img id="lightbox-producto-img" style="max-width: 90%; max-height: 90%; object-fit: contain; cursor: default;">
        `;

        document.body.appendChild(lightbox);

        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cerrarLightboxProducto();
        });

        // Cerrar al hacer click en el fondo
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) cerrarLightboxProducto();
        });
    }

    // Mostrar imagen
    document.getElementById('lightbox-producto-img').src = imagenURL;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function cerrarLightboxProducto() {
    const lightbox = document.getElementById('lightbox-producto');
    if (lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Scroll Reveal Animations
function initScrollReveal() {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  // Section titles
  document.querySelectorAll('.section-title, .section-title-small').forEach(el => {
    el.classList.add('scroll-reveal');
    revealObserver.observe(el);
  });

  // Evento cards (stagger)
  document.querySelectorAll('.evento-card').forEach((el, i) => {
    el.classList.add('scroll-reveal');
    el.style.transitionDelay = `${i * 100}ms`;
    revealObserver.observe(el);
  });

  // Galeria eventos (stagger)
  document.querySelectorAll('.galeria-evento').forEach((el, i) => {
    el.classList.add('scroll-reveal');
    el.style.transitionDelay = `${i * 150}ms`;
    revealObserver.observe(el);
  });

  // Nosotros
  const nosotrosTexto = document.querySelector('.nosotros-texto');
  if (nosotrosTexto) {
    nosotrosTexto.classList.add('scroll-reveal-left');
    revealObserver.observe(nosotrosTexto);
  }

  const nosotrosSponsors = document.querySelector('.nosotros-sponsors');
  if (nosotrosSponsors) {
    nosotrosSponsors.classList.add('scroll-reveal-right');
    revealObserver.observe(nosotrosSponsors);
  }

  // Tienda header
  const tiendaHeader = document.querySelector('.tienda-header');
  if (tiendaHeader) {
    tiendaHeader.classList.add('scroll-reveal');
    revealObserver.observe(tiendaHeader);
  }
}

// Active Section Navbar Indicator
function initActiveNav() {
  const sections = document.querySelectorAll('#eventos, #tienda, #galeria, #nosotros');
  const navLinksAll = document.querySelectorAll('.nav-links a.scroll-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksAll.forEach(link => {
          link.classList.remove('active-link');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active-link');
          }
        });
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: '-80px 0px 0px 0px'
  });

  sections.forEach(section => navObserver.observe(section));
}