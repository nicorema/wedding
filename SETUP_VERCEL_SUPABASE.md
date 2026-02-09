# 🚀 Setup: Vercel Serverless + Supabase (100% Gratis, Sin Sleep)

Esta guía te ayudará a migrar tu aplicación a Vercel Serverless Functions + Supabase PostgreSQL.

## ✅ Ventajas

- ✅ **100% Gratis** (free tier suficiente para 300+ usuarios)
- ✅ **Sin Sleep** (serverless siempre activo)
- ✅ **Todo en un lugar** (frontend + backend en Vercel)
- ✅ **Base de datos PostgreSQL** (Supabase free tier)

---

## 📋 Paso 1: Crear cuenta en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta (puedes usar GitHub)
3. Crea un nuevo proyecto:

   - **Name**: `matrimonio-db`
   - **Database Password**: Guarda esta contraseña (la necesitarás)
   - **Region**: Elige la más cercana
   - **Plan**: Free

4. Espera a que se cree el proyecto (~2 minutos)

---

## 📋 Paso 2: Obtener credenciales de Supabase

1. En tu proyecto de Supabase, ve a **Settings** → **Database**
2. Busca la sección **Connection string** → **URI**
3. Copia la URI (ejemplo: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
4. También necesitarás:

   - **Host**: `db.xxxxx.supabase.co` (de la URI)
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: La que creaste
   - **Port**: `5432`

   postgresql://postgres:[YOUR-PASSWORD]@db.bbwfvxmpigugrdeachjs.supabase.co:5432/postgres

   postgresql://postgres:[YOUR-PASSWORD]@db.bbwfvxmpigugrdeachjs.supabase.co:5432/postgres
   host:
   db.bbwfvxmpigugrdeachjs.supabase.co

port:
5432

database:
postgres

user:
postgres

---

## 📋 Paso 3: Inicializar la base de datos

### Opción A: Desde tu máquina local

1. Instala psycopg2:

```bash
pip install psycopg2-binary
```

2. Crea un archivo `.env` temporal con las credenciales:

```bash
export SUPABASE_DB_HOST="db.xxxxx.supabase.co"
export SUPABASE_DB_NAME="postgres"
export SUPABASE_DB_USER="postgres"
export SUPABASE_DB_PASSWORD="tu_password"
export SUPABASE_DB_PORT="5432"
```

3. Ejecuta el script de inicialización:

```bash
cd api
python init_db.py
```

### Opción B: Desde Supabase SQL Editor (RECOMENDADO)

1. Ve a **SQL Editor** en Supabase (menú lateral izquierdo)
2. Haz clic en **New Query**
3. Copia y pega TODO el contenido del archivo `supabase_init.sql` que está en la raíz del proyecto
4. Haz clic en **Run** (o presiona Ctrl+Enter / Cmd+Enter)
5. Deberías ver un mensaje de éxito

**O copia este SQL directamente:**

```sql
-- Scores table
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    time INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scores_time ON scores(time ASC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- IMPORTANTE: Deshabilitar Row Level Security (RLS)
-- Como usas conexión directa desde el backend, no necesitas RLS
ALTER TABLE scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

---

## 📋 Paso 4: Deploy en Vercel

### 4.1 Instalar Vercel CLI

```bash
npm install -g vercel
```

### 4.2 Login en Vercel

```bash
vercel login
```

### 4.3 Configurar variables de entorno

**⚠️ IMPORTANTE**: Necesitas configurar las variables en Vercel Dashboard, no solo localmente.

**Para tu proyecto específico, las variables son:**

```env
SUPABASE_DB_HOST=db.bbwfvxmpigugrdeachjs.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=[TU_PASSWORD]  ← Reemplaza con tu password real
SUPABASE_DB_PORT=5432
```

**Ver instrucciones detalladas en:** `VARIABLES_ENTORNO.md`

### 4.4 Deploy

```bash
vercel
```

Sigue las instrucciones:

- **Link to existing project?** → No (primera vez)
- **Project name**: `matrimonio-website`
- **Directory**: `.` (raíz)
- **Override settings?** → No

### 4.5 Agregar variables de entorno en Vercel Dashboard

1. Ve a tu proyecto en [vercel.com/dashboard](https://vercel.com/dashboard)
2. Ve a **Settings** → **Environment Variables**
3. Agrega todas las variables de Supabase:

   - `SUPABASE_DB_HOST`
   - `SUPABASE_DB_NAME`
   - `SUPABASE_DB_USER`
   - `SUPABASE_DB_PASSWORD`
   - `SUPABASE_DB_PORT`

4. Haz clic en **Save**

### 4.6 Redeploy

Después de agregar las variables, haz un redeploy:

```bash
vercel --prod
```

O desde el dashboard de Vercel, haz clic en **Redeploy**

---

## 📋 Paso 5: Verificar que funciona

1. Visita tu sitio: `https://tu-proyecto.vercel.app`
2. Prueba:

   - Enviar un mensaje
   - Jugar el juego y enviar un score
   - Ver mensajes aprobados

3. Verifica en Supabase:
   - Ve a **Table Editor** en Supabase
   - Deberías ver las tablas `scores` y `messages`
   - Los datos deberían aparecer ahí

---

## 🔧 Desarrollo Local

Para desarrollar localmente:

1. Instala dependencias:

```bash
npm install
pip install -r requirements.txt
```

2. Configura variables de entorno en `.env.local`

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

4. Para probar las funciones serverless localmente:

```bash
vercel dev
```

Esto iniciará un servidor local que simula Vercel.

---

## 📊 Estructura del Proyecto

```
/
├── api/                    # Vercel Serverless Functions
│   ├── db.py              # Database connection y funciones
│   ├── scores/
│   │   ├── best.py        # GET /api/scores/best
│   │   └── index.py       # POST /api/scores
│   ├── messages/
│   │   └── index.py       # GET/POST /api/messages
│   ├── admin/
│   │   ├── scores.py      # GET /api/admin/scores
│   │   └── messages/
│   │       ├── pending.py # GET /api/admin/messages/pending
│   │       └── [id]/
│   │           ├── status.py # PUT /api/admin/messages/:id/status
│   │           └── index.py  # DELETE /api/admin/messages/:id
│   └── health.py          # GET /api/health
├── src/                    # Frontend React
├── vercel.json            # Configuración de Vercel
└── requirements.txt       # Dependencias Python
```

---

## 🐛 Troubleshooting

### Error: "No module named 'psycopg2'"

Asegúrate de que `psycopg2-binary` esté en `requirements.txt` y que Vercel lo haya instalado.

### Error de conexión a la base de datos

1. Verifica que las variables de entorno estén configuradas en Vercel
2. Verifica que la contraseña sea correcta
3. Verifica que el host sea correcto (debe incluir `db.` al inicio)

### Las funciones no se despliegan

1. Verifica que `vercel.json` esté en la raíz del proyecto
2. Verifica que los archivos en `api/` tengan la estructura correcta
3. Revisa los logs en Vercel Dashboard → Functions

---

## ✅ Checklist Final

- [ ] Cuenta de Supabase creada
- [ ] Proyecto de Supabase creado
- [ ] Tablas creadas en Supabase
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy completado en Vercel
- [ ] Prueba de envío de mensaje funciona
- [ ] Prueba de juego y score funciona
- [ ] Datos aparecen en Supabase Table Editor

---

## 🎉 ¡Listo!

Tu aplicación está completamente desplegada y funcionando **100% gratis** en Vercel + Supabase, **sin sleep**.

**URL de tu sitio:**

```
https://tu-proyecto.vercel.app
```

¡Que disfruten del evento! 🎊
