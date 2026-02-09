# 🔐 Variables de Entorno - Configuración

## 📋 Variables que necesitas configurar

Basado en tu proyecto de Supabase, estas son las variables:

```
SUPABASE_DB_HOST=db.bbwfvxmpigugrdeachjs.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=[TU_PASSWORD_AQUI]
SUPABASE_DB_PORT=5432
```

**⚠️ IMPORTANTE**: Reemplaza `[TU_PASSWORD_AQUI]` con la contraseña que creaste al crear el proyecto de Supabase.

---

## 🚀 Paso 1: Configurar en Vercel Dashboard

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto (o créalo si aún no lo has hecho)
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable una por una:

### Variable 1:

- **Key**: `SUPABASE_DB_HOST`
- **Value**: `db.bbwfvxmpigugrdeachjs.supabase.co`
- **Environment**: Production, Preview, Development (selecciona todos)
- Haz clic en **Save**

### Variable 2:

- **Key**: `SUPABASE_DB_NAME`
- **Value**: `postgres`
- **Environment**: Production, Preview, Development (selecciona todos)
- Haz clic en **Save**

### Variable 3:

- **Key**: `SUPABASE_DB_USER`
- **Value**: `postgres`
- **Environment**: Production, Preview, Development (selecciona todos)
- Haz clic en **Save**

### Variable 4:

- **Key**: `SUPABASE_DB_PASSWORD`
- **Value**: `[TU_PASSWORD_AQUI]` ← **Reemplaza con tu password real**
- **Environment**: Production, Preview, Development (selecciona todos)
- Haz clic en **Save**

### Variable 5:

- **Key**: `SUPABASE_DB_PORT`
- **Value**: `5432`
- **Environment**: Production, Preview, Development (selecciona todos)
- Haz clic en **Save**

---

## 💻 Paso 2: Configurar localmente (para desarrollo)

1. Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# En la raíz del proyecto
touch .env.local
```

2. Agrega este contenido (reemplaza `[TU_PASSWORD_AQUI]` con tu password):

```env
SUPABASE_DB_HOST=db.bbwfvxmpigugrdeachjs.supabase.co
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=[TU_PASSWORD_AQUI]
SUPABASE_DB_PORT=5432
```

3. **⚠️ IMPORTANTE**: Agrega `.env.local` a `.gitignore` para que no se suba a GitHub:

```bash
echo ".env.local" >> .gitignore
```

---

## ✅ Verificación

Después de configurar las variables:

1. **En Vercel**: Haz un redeploy para que las variables surtan efecto
2. **Localmente**: Reinicia el servidor de desarrollo si está corriendo

---

## 🔍 ¿Dónde encontrar tu password?

Si no recuerdas tu password de Supabase:

1. Ve a Supabase Dashboard
2. Ve a **Settings** → **Database**
3. Busca **"Reset database password"** o **"Database password"**
4. Puedes resetearla y crear una nueva
5. **Guarda la nueva password** y úsala en las variables de entorno

---

## 📝 Resumen de Variables

| Variable               | Valor                                 |
| ---------------------- | ------------------------------------- |
| `SUPABASE_DB_HOST`     | `db.bbwfvxmpigugrdeachjs.supabase.co` |
| `SUPABASE_DB_NAME`     | `postgres`                            |
| `SUPABASE_DB_USER`     | `postgres`                            |
| `SUPABASE_DB_PASSWORD` | `[TU_PASSWORD]` ← **Reemplazar**      |
| `SUPABASE_DB_PORT`     | `5432`                                |

---

## 🎯 Checklist

- [ ] Variables agregadas en Vercel Dashboard
- [ ] Password reemplazada con la real
- [ ] Variables configuradas para Production, Preview y Development
- [ ] `.env.local` creado localmente (si vas a desarrollar)
- [ ] `.env.local` agregado a `.gitignore`
- [ ] Redeploy hecho en Vercel después de agregar variables
