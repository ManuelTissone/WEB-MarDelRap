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
                <img src="${evento.imagen}" alt="${evento.titulo}" class="evento-img" onerror="this.src='https://via.placeholder.com/400x250?text=Evento'">
                <div class="evento-info">
                    <h3>${evento.titulo}</h3>
                    <p><strong>Fecha:</strong> ${formatearFecha(evento.fecha)}</p>
                    <p><strong>Hora:</strong> ${evento.hora}</p>
                    <p><strong>Lugar:</strong> ${evento.lugar}</p>
                    <p class="evento-precio">$${evento.precio.toLocaleString("es-AR")}</p>
                    <p><strong>Disponibles:</strong> ${evento.disponibles} entradas</p>
                    <div style="display: flex; gap: 10px; margin-top: 15px;">
                        <a href="#" class="btn-comprar" onclick="comprarEntrada(${eventoId}); return false;">Comprar Entrada</a>
                        <button class="btn-mapa" onclick="abrirMapa('${evento.lugar}'); return false;" title="Ver ubicación" aria-label="Ver ubicación en mapa">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
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

// Cargar galería desde Firebase
// Cargar galerías de eventos pasados
async function cargarGaleria() {
  const container = document.getElementById("galeriaContainer");
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

    galeriasSnapshot.forEach((doc) => {
      const galeria = doc.data();

      // Solo mostrar si tiene fotos
      if (!galeria.fotos || galeria.fotos.length === 0) return;

      // Crear contenedor por evento
      const eventoDiv = document.createElement("div");
      eventoDiv.className = "galeria-evento";

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
    alert("Debes iniciar sesión para comprar entradas");
    document.getElementById("loginBtn").click();
    return;
  }

  // Aquí irá la integración con MercadoPago
  alert(`Próximamente: Compra de entrada para evento ${eventoId}`);
  // Redirigir a página de pago de MercadoPago
}

// Navbar transparente/sólido al hacer scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 100) {
    navbar.style.background = "rgba(26, 26, 26, 0.95)";
  } else {
    navbar.style.background = "var(--color-secondary)";
  }
});

// Inicializar cuando cargue la página
document.addEventListener("DOMContentLoaded", () => {
  cargarEventos();
  cargarGaleria();

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
        ${producto.nuevo ? '<div class="producto-badge">NEW</div>' : ''}
        <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-img" onclick="abrirLightboxProducto('${producto.imagen}', '${producto.nombre}')">
                <div class="producto-info">
                    <p class="producto-nombre">${producto.nombre}</p>
                    <p class="producto-precio">$${producto.precio.toLocaleString("es-AR")}</p>
                    ${producto.stock > 0 ? `<p style="color: #666; font-size: 0.85rem; margin-top: 5px;">Stock: ${producto.stock}</p>` : '<p style="color: red; font-size: 0.85rem; margin-top: 5px;">Sin stock</p>'}
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