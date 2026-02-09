# 🔒 Configuración de Seguridad en Supabase

## ⚠️ Importante: Deshabilitar Row Level Security (RLS)

Para tu aplicación, necesitas **deshabilitar RLS** porque:

- Tu backend se conecta directamente con credenciales de servicio (no usuarios autenticados)
- No necesitas seguridad a nivel de fila (todos los datos son públicos para tu app)
- Simplifica la configuración

---

## 📋 Opción 1: Desde SQL Editor (Recomendado)

1. Ve a **SQL Editor** en Supabase
2. Ejecuta este SQL después de crear las tablas:

```sql
-- Deshabilitar RLS para las tablas
ALTER TABLE scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
```

---

## 📋 Opción 2: Desde el Dashboard

1. Ve a **Table Editor** en Supabase
2. Selecciona la tabla `scores`
3. Ve a la pestaña **Policies**
4. Verás un toggle de **RLS** → Apágalo (OFF)
5. Repite para la tabla `messages`

---

## ✅ Verificación

Después de deshabilitar RLS, deberías poder:

- ✅ Insertar datos desde tu backend
- ✅ Leer datos desde tu backend
- ✅ Actualizar datos desde tu backend
- ✅ Eliminar datos desde tu backend

---

## 🔐 Seguridad Alternativa (Si prefieres mantener RLS)

Si quieres mantener RLS habilitado, necesitarías crear políticas que permitan todo:

```sql
-- Habilitar RLS
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Crear políticas que permitan todo (solo para desarrollo/testing)
CREATE POLICY "Allow all operations on scores" ON scores
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on messages" ON messages
    FOR ALL
    USING (true)
    WITH CHECK (true);
```

**Pero para tu caso, es más simple deshabilitar RLS** ya que:

- Tu backend tiene credenciales de servicio (seguro)
- No hay usuarios autenticados
- Los datos son públicos para tu aplicación de boda

---

## 🎯 Resumen

**Para tu aplicación de boda:**

- ✅ **Deshabilita RLS** en ambas tablas (`scores` y `messages`)
- ✅ Esto permite que tu backend funcione sin problemas
- ✅ La seguridad viene de las credenciales de conexión (que solo tu backend tiene)
