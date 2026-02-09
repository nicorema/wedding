-- ============================================
-- Script de Inicialización de Base de Datos
-- Para ejecutar en Supabase SQL Editor
-- ============================================

-- Crear tabla de scores (puntajes del juego)
CREATE TABLE IF NOT EXISTS scores (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    time INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de messages (mensajes de invitados)
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_scores_time ON scores(time ASC);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- IMPORTANTE: Deshabilitar Row Level Security (RLS)
-- Esto permite que tu backend se conecte directamente sin problemas
ALTER TABLE scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Verificar que las tablas se crearon correctamente
SELECT 'Tablas creadas exitosamente!' as mensaje;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('scores', 'messages');
