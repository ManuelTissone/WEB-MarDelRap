// Datos de ejemplo - Después conectarán Firebase
const eventosEjemplo = [

];


// Smooth scroll para navegación
document.querySelectorAll('.scroll-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // Cerrar menú móvil si está abierto
        document.querySelector('.nav-links').classList.remove('active');
    });
});

// Hamburger menu
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Cargar eventos desde Firebase
async function cargarEventos() {
    const container = document.getElementById('eventosContainer');
    container.innerHTML = ''; // Limpiar contenedor
    
    try {
        // Obtener eventos activos desde Firestore
        const eventosSnapshot = await db.collection('eventos')
            .where('activo', '==', true)
            .orderBy('fecha', 'asc')
            .get();
        
        if (eventosSnapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:#999;">No hay eventos próximos</p>';
            return;
        }
        
        eventosSnapshot.forEach(doc => {
            const evento = doc.data();
            const eventoId = doc.id;
            
            const card = document.createElement('div');
            card.className = 'evento-card';
            
            card.innerHTML = `
                <img src="${evento.imagen}" alt="${evento.titulo}" class="evento-img" onerror="this.src='https://via.placeholder.com/400x250?text=Evento'">
                <div class="evento-info">
                    <h3>${evento.titulo}</h3>
                    <p><strong>Fecha:</strong> ${formatearFecha(evento.fecha)}</p>
                    <p><strong>Hora:</strong> ${evento.hora}</p>
                    <p><strong>Lugar:</strong> ${evento.lugar}</p>
                    <p class="evento-precio">$${evento.precio.toLocaleString('es-AR')}</p>
                    <p><strong>Disponibles:</strong> ${evento.disponibles} entradas</p>
                    <a href="#" class="btn-comprar" onclick="comprarEntrada('${eventoId}'); return false;">Comprar Entrada</a>
                </div>
            `;
            
            container.appendChild(card);
        });
        
    } catch (error) {
        console.error('Error cargando eventos:', error);
        container.innerHTML = '<p style="text-align:center; color:red;">Error cargando eventos</p>';
    }
}

// Cargar galería desde Firebase
// Cargar galerías de eventos pasados
async function cargarGaleria() {
    const container = document.getElementById('galeriaContainer');
    container.innerHTML = '';
    
    try {
        const galeriasSnapshot = await db.collection('galerias')
            .orderBy('fecha', 'desc')
            .get();
        
        if (galeriasSnapshot.empty) {
            container.innerHTML = '<p style="text-align:center; color:#999;">No hay galerías aún</p>';
            return;
        }
        
        galeriasSnapshot.forEach(doc => {
            const galeria = doc.data();
            
            // Solo mostrar si tiene fotos
            if (!galeria.fotos || galeria.fotos.length === 0) return;
            
            // Crear contenedor por evento
            const eventoDiv = document.createElement('div');
            eventoDiv.className = 'galeria-evento';

            const titulo = document.createElement('h3');
            titulo.textContent = galeria.titulo;
            eventoDiv.appendChild(titulo);
            
            // Grid de fotos
            const grid = document.createElement('div');
            grid.className = 'galeria-grid';
            
            galeria.fotos.forEach((fotoUrl, index) => {
                const img = document.createElement('img');
                img.src = fotoUrl;
                img.alt = `${galeria.titulo} - Foto ${index + 1}`;
                img.className = 'galeria-img';
                img.onerror = function() {
                    this.src = 'https://via.placeholder.com/250?text=Foto';
                };
                grid.appendChild(img);
            });
            
            eventoDiv.appendChild(grid);
            container.appendChild(eventoDiv);
        });
        
    } catch (error) {
        console.error('Error cargando galerías:', error);
        container.innerHTML = '<p style="text-align:center; color:red;">Error cargando galerías</p>';
    }
}



// Formatear fecha
function formatearFecha(fecha) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fecha).toLocaleDateString('es-AR', opciones);
}

// Función para comprar entrada (placeholder)
function comprarEntrada(eventoId) {
    // Verificar si el usuario está logueado
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        alert('Debes iniciar sesión para comprar entradas');
        document.getElementById('loginBtn').click();
        return;
    }
    
    // Aquí irá la integración con MercadoPago
    alert(`Próximamente: Compra de entrada para evento ${eventoId}`);
    // Redirigir a página de pago de MercadoPago
}

// Navbar transparente/sólido al hacer scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(26, 26, 26, 0.95)';
    } else {
        navbar.style.background = 'var(--color-secondary)';
    }
});

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    cargarEventos();
    cargarGaleria();
    
    // Actualizar UI si hay usuario logueado
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario) {
        actualizarUIUsuario(usuario);
    }
});

// Actualizar UI cuando el usuario está logueado
function actualizarUIUsuario(usuario) {
    const loginBtn = document.getElementById('loginBtn');
    loginBtn.textContent = usuario.nombre;
    
    // Remover el evento del modal y agregar link al perfil
    loginBtn.onclick = null;
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'pages/perfil.html';
    });
    
    loginBtn.classList.add('user-logged');
}
