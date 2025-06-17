// vite.config.js
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000' // Adjust to your backend port
    }
  }
}
