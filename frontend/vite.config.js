const { defineConfig } = require('vite')

// Dynamically import ESM-only plugins to be compatible with CJS Vite builds.
module.exports = async function(){
  const reactPlugin = (await import('@vitejs/plugin-react')).default
  return defineConfig({
    plugins: [reactPlugin()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
          secure: false,
          // keep the /api prefix when forwarding
          rewrite: (path) => path.replace(/^\/api/, '/api')
        }
      }
    }
  })
}
