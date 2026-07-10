// vite.config.js
export default {
  server: {
    proxy: {
      '/api': process.env.REACT_APP_API_URL || 'http://localhost:5000'
    }
  }
}
