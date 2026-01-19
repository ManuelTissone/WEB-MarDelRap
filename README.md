# Mar del Rap - Plataforma de Eventos

## 📋 Descripción
Plataforma web para venta de entradas y gestión de eventos de hip hop en Mar del Plata.

## 🚀 Versión Beta 1.0

### Funcionalidades Implementadas
- ✅ Landing page one-page con smooth scroll
- ✅ Sistema de registro/login (localStorage temporal)
- ✅ Catálogo de eventos
- ✅ Galería de fotos
- ✅ Perfil de usuario básico
- ✅ Diseño responsive

### Próximas Funcionalidades (v2.0)
- ⏳ Integración con Firebase
- ⏳ Integración MercadoPago
- ⏳ Sistema de puntos/fichas
- ⏳ Tienda de merchandising
- ⏳ Encuestas y votaciones

## 📁 Estructura del Proyecto

```
mardelrap-web/
├── index.html              # Página principal
├── css/
│   └── style.css          # Estilos principales
├── js/
│   ├── app.js             # Lógica principal
│   ├── auth.js            # Sistema de autenticación
│   └── firebase-config.js # (Próximamente)
├── pages/
│   └── perfil.html        # Perfil de usuario
└── assets/
    └── images/            # Imágenes (logos, eventos, galería)
```

## 🎨 Personalización

### Cambiar Colores de la Marca
Editar las variables en `css/style.css`:

```css
:root {
    --color-primary: #FF6B00;    /* Color principal */
    --color-secondary: #1a1a1a;  /* Color secundario */
    --color-accent: #FFD700;     /* Color de acento */
}
```

### Agregar Logos
1. Colocar logos en `assets/images/`
2. Actualizar referencias en el código

## 🔧 Configuración Inicial

### 1. Abrir el Proyecto
- Abrir la carpeta `mardelrap-web` en VS Code
- Usar extensión Live Server para ver el sitio

### 2. Personalizar Contenido
- Reemplazar eventos de ejemplo en `js/app.js`
- Agregar imágenes reales en `assets/images/`
- Actualizar información en sección "Nosotros"

## 📦 Próximos Pasos

### Paso 1: Firebase Setup
1. Crear proyecto en Firebase Console
2. Habilitar Authentication (Email/Password)
3. Crear Firestore Database
4. Copiar configuración a `firebase-config.js`

### Paso 2: MercadoPago
1. Crear cuenta en MercadoPago Developers
2. Obtener credenciales de prueba
3. Implementar checkout API

### Paso 3: Testing
1. Probar registro/login
2. Simular compras
3. Verificar responsive en móviles

## 💰 Costos Estimados

- **Dominio:** $3,000-8,000 ARS/año
- **Hosting:** Gratis (Firebase)
- **MercadoPago:** 3.99% + IVA por transacción
- **Total mensual:** ~$600 ARS

## 🔒 Seguridad

### Actual (localStorage)
- Solo para desarrollo/demo
- NO usar en producción
- Contraseñas sin encriptar

### Después con Firebase
- Autenticación segura
- Contraseñas encriptadas
- Protección de datos

## 📱 Responsive
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (< 768px)

## 🐛 Debug
- Abrir DevTools (F12)
- Revisar Console para errores
- Verificar Network para requests

## 📞 Soporte
Para dudas técnicas, consultar con el desarrollador.

## 📝 Notas Importantes

1. **Imágenes placeholder**: Las imágenes usan placeholders. Reemplazar con fotos reales.
2. **Datos de ejemplo**: Los eventos son de prueba. Conectar con base de datos real.
3. **Sistema de pago**: No funcional hasta integrar MercadoPago.
4. **Usuarios**: Se guardan en localStorage (temporal).

## 🎯 Roadmap

**Semana 1-2:** Estructura base ✅
**Semana 2-3:** Firebase Authentication
**Semana 3-4:** Catálogo dinámico de eventos
**Semana 4-5:** Integración MercadoPago
**Semana 5-6:** Testing y ajustes
**Semana 6-8:** Beta cerrada y lanzamiento

---

**Versión:** 1.0.0-beta
**Última actualización:** Enero 2025
