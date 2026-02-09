# Sitio Web de Boda

Una aplicación web React elegante y minimalista para compartir información sobre tu boda, con sistema de mensajes y juego interactivo.

## Características

- ✨ Diseño elegante y minimalista con paleta de colores naturales
- 📱 Diseño responsive (desktop y mobile)
- 🧭 Navegación fácil con React Router
- 📄 Múltiples secciones: Inicio, Nuestra Historia, ¿Cuándo?, Juegos, Mensajes
- 💬 Sistema de mensajes con moderación
- 🎮 Juego interactivo con ranking de mejores tiempos
- 🎨 Estilos con CSS Modules para mejor organización
- 🔧 Estructura escalable para agregar más páginas fácilmente

## Tecnologías

### Frontend

- React 18
- React Router DOM
- Vite
- CSS Modules / SCSS
- TanStack Query

### Backend

- Flask (Python)
- SQLite
- Flask-CORS
- Gunicorn (producción)

## Instalación

### Frontend

1. Instala las dependencias:

```bash
npm install
```

### Backend

1. Ve a la carpeta `backend`:

```bash
cd backend
```

2. Crea un entorno virtual (recomendado):

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instala las dependencias:

```bash
pip install -r requirements.txt
```

## Desarrollo

### Frontend

Para iniciar el servidor de desarrollo del frontend:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Backend

Para iniciar el servidor de desarrollo del backend:

```bash
cd backend
python app.py
```

El backend estará disponible en `http://localhost:5001`

**Nota**: El frontend está configurado para hacer proxy de las peticiones `/api` al backend automáticamente.

## Construcción

### Frontend

Para crear una versión de producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

### Backend

El backend está listo para producción. Asegúrate de tener `gunicorn` instalado (incluido en `requirements.txt`).

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.jsx
│   ├── Navbar.jsx
│   └── PageContainer.jsx
├── pages/              # Páginas de la aplicación
│   ├── Home.jsx
│   ├── NuestraHistoria.jsx
│   └── Cuando.jsx
├── App.jsx            # Componente principal con rutas
├── main.jsx           # Punto de entrada
└── index.css          # Estilos globales
```

## Agregar Nuevas Páginas

Para agregar una nueva página:

1. Crea un nuevo componente en `src/pages/`
2. Agrega la ruta en `src/App.jsx`
3. Agrega el enlace en `src/components/Navbar.jsx`
4. Crea los estilos correspondientes con CSS Modules

## Deploy

Para hacer deploy gratuito de la aplicación completa (frontend + backend), consulta la guía detallada en **[DEPLOY.md](./DEPLOY.md)**.

**Resumen rápido:**

- ✅ **Gratis** en Render.com (backend + frontend)
- ✅ Soporta hasta 150 usuarios concurrentes
- ✅ SQLite incluido (sin necesidad de base de datos externa)
- ⚠️ El servicio free puede "dormirse" después de 15 min de inactividad

## Ver Datos

### Ver mensajes y scores en la base de datos

```bash
cd backend
python view_db.py
```

### Ver solo mensajes pendientes (para moderación)

Usa el panel de administración en `/manager` o consulta directamente la base de datos.

## Personalización

- Los colores están definidos como variables CSS en `src/index.css`
- Puedes modificar los textos directamente en los componentes de las páginas
- Para cambiar la imagen de "Save the Date", reemplaza el placeholder en `src/pages/Cuando.jsx`
- La configuración de la API está en `src/services/api.js`
