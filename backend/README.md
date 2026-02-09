# Backend API - Matrimonio Website

Backend en Python con Flask para manejar scores y mensajes.

## Requisitos

- Python 3.8 o superior
- pip (gestor de paquetes de Python)

## Instalación

1. Instala las dependencias:
```bash
pip install -r requirements.txt
```

O si usas Python 3 específicamente:
```bash
pip3 install -r requirements.txt
```

## Ejecutar el servidor

### Opción 1: Script automático (recomendado para macOS)

```bash
cd backend
./start.sh
```

Este script automáticamente:
- Verifica que Python 3 esté instalado
- Crea un entorno virtual si no existe
- Instala las dependencias si es necesario
- Inicia el servidor en `http://localhost:5000`

### Opción 2: Manual

Desde la carpeta `backend/`:

```bash
# Instalar dependencias (solo la primera vez)
pip install -r requirements.txt

# Ejecutar el servidor
python app.py
```

O con Python 3:
```bash
pip3 install -r requirements.txt
python3 app.py
```

El servidor se ejecutará en `http://localhost:5000`

### Opción 3: Con entorno virtual (recomendado para producción)

```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
python3 app.py
```

## Endpoints

### Scores (Puntajes)

#### GET `/api/scores/best`
Obtiene el mejor tiempo (score más bajo).

**Respuesta exitosa:**
```json
{
  "bestTime": 120,
  "name": "Juan"
}
```

**Si no hay scores:**
```json
{
  "bestTime": null
}
```

#### POST `/api/scores`
Crea un nuevo score.

**Body:**
```json
{
  "name": "Juan",
  "time": 120
}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Juan",
  "time": 120,
  "created_at": "2024-01-15 10:30:00"
}
```

### Messages (Mensajes)

#### GET `/api/messages`
Obtiene solo los mensajes con estado `Approved`.

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "María",
    "message": "¡Felicitaciones!",
    "status": "Approved",
    "created_at": "2024-01-15 10:30:00"
  }
]
```

#### POST `/api/messages`
Crea un nuevo mensaje con estado `Pending`.

**Body:**
```json
{
  "name": "María",
  "message": "¡Felicitaciones!"
}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "María",
  "message": "¡Felicitaciones!",
  "status": "Pending",
  "created_at": "2024-01-15 10:30:00"
}
```

### Health Check

#### GET `/api/health`
Verifica que el servidor está funcionando.

**Respuesta:**
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

## Base de Datos

Se usa SQLite (`matrimonio.db`) que se crea automáticamente al ejecutar el servidor por primera vez.

### Ver las tablas

```bash
cd backend
python3 view_db.py
```

### Vaciar la base de datos (Flush)

⚠️ **ADVERTENCIA**: Esto eliminará TODOS los datos de todas las tablas.

```bash
cd backend
python3 flush_db.py
```

El script pedirá confirmación antes de proceder. Solo vacía los datos, mantiene la estructura de las tablas.

### Tablas

#### `scores`
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `time` (INTEGER, NOT NULL)
- `created_at` (TIMESTAMP)

#### `messages`
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `status` (TEXT, DEFAULT 'Pending') - Valores: 'Pending', 'Approved', 'Denied'
- `created_at` (TIMESTAMP)

## Notas

- El archivo `matrimonio.db` se crea automáticamente en la carpeta `backend/`
- Los mensajes se crean con estado `Pending` y solo se muestran los `Approved`
- Para cambiar el estado de un mensaje, puedes usar las funciones auxiliares en `database.py` o crear un endpoint de administración
