// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCa1nQnyhSq5iqP9KDcmzlYwuaz5ysry7Q",
  authDomain: "mardelrap-dc9b5.firebaseapp.com",
  projectId: "mardelrap-dc9b5",
  storageBucket: "mardelrap-dc9b5.firebasestorage.app",
  messagingSenderId: "26004320228",
  appId: "1:26004320228:web:02aa2d14132830c37ae1f1"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Servicios de Firebase
const auth = firebase.auth();
const db = firebase.firestore();