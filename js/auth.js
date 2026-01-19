// Sistema de autenticación con Firebase

const modal = document.getElementById('authModal');
const loginBtn = document.getElementById('loginBtn');
const closeBtn = document.querySelector('.close');

const tabBtns = document.querySelectorAll('.tab-btn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Abrir modal o ir a perfil
loginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (auth.currentUser) {
        window.location.href = 'pages/perfil.html';
    } else {
        modal.classList.add('active');
    }
});

// Cerrar modal
closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Cambiar entre tabs
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        btn.classList.add('active');
        if (tab === 'login') {
            loginForm.classList.add('active');
        } else {
            registerForm.classList.add('active');
        }
    });
});

// LOGIN con Firebase
loginForm.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorMsg = document.getElementById('loginError');
    
    try {
        // Iniciar sesión con Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Cerrar modal
        modal.classList.remove('active');
        e.target.reset();
        errorMsg.textContent = '';
        
        alert('¡Bienvenido de nuevo!');
        
    } catch (error) {
        console.error('Error login:', error);
        
        if (error.code === 'auth/user-not-found') {
            errorMsg.textContent = 'No existe una cuenta con este email';
        } else if (error.code === 'auth/wrong-password') {
            errorMsg.textContent = 'Contraseña incorrecta';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg.textContent = 'Email inválido';
        } else {
            errorMsg.textContent = 'Error al iniciar sesión';
        }
    }
});

// REGISTRO con Firebase
registerForm.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nombre = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const errorMsg = document.getElementById('registerError');
    
    if (password.length < 6) {
        errorMsg.textContent = 'La contraseña debe tener al menos 6 caracteres';
        return;
    }
    
    try {
        // Crear usuario en Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Guardar datos adicionales en Firestore
        await db.collection('usuarios').doc(user.uid).set({
            nombre: nombre,
            email: email,
            fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
            entradas: []
        });
        
        // Actualizar nombre en el perfil
        await user.updateProfile({
            displayName: nombre
        });
        
        // Cerrar modal
        modal.classList.remove('active');
        e.target.reset();
        errorMsg.textContent = '';
        
        alert('¡Cuenta creada exitosamente!');
        
    } catch (error) {
        console.error('Error registro:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            errorMsg.textContent = 'Este email ya está registrado';
        } else if (error.code === 'auth/invalid-email') {
            errorMsg.textContent = 'Email inválido';
        } else if (error.code === 'auth/weak-password') {
            errorMsg.textContent = 'La contraseña es muy débil';
        } else {
            errorMsg.textContent = 'Error al crear la cuenta';
        }
    }
});

// Observador de estado de autenticación
// Observador de estado de autenticación
auth.onAuthStateChanged(async (user) => {
    const loginBtn = document.getElementById('loginBtn');
    
    if (user) {
        // Verificar si es admin
        const adminDoc = await db.collection('admins').doc(user.email).get();
        if (adminDoc.exists && adminDoc.data().role === 'admin') {
            // Agregar botón admin si no existe
            if (!document.getElementById('adminBtn')) {
                const adminBtn = document.createElement('li');
                adminBtn.innerHTML = '<a href="pages/admin/index.html" id="adminBtn">Admin</a>';
                document.querySelector('.nav-links').appendChild(adminBtn);
            }
        }
        // Usuario logueado
        const userData = await db.collection('usuarios').doc(user.uid).get();
        const nombre = userData.exists ? userData.data().nombre : user.displayName || user.email;
        
        loginBtn.textContent = nombre;
        loginBtn.classList.add('user-logged');
    
    } else {
        // Usuario no logueado
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.textContent = 'Ingresar';
        loginBtn.href = '#';
        loginBtn.classList.remove('user-logged');
    }
});

// Cerrar sesión
function cerrarSesion() {
    auth.signOut().then(() => {
        window.location.href = '/';
    });
}