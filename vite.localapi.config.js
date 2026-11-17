import { defineConfig, mergeConfig } from 'vite'
import base from './vite.config.js'
export default mergeConfig(base, defineConfig({ server: { port: 5174, proxy: { '/api': { target: 'http://127.0.0.1:3002' } } } }))
