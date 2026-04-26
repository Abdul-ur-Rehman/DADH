const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api", // This is the endpoint you want to proxy
    createProxyMiddleware({
      target: "http://localhost:5001/api", // Replace with your backend URL
      changeOrigin: true, // Needed for virtual hosted sites
    })
  );
};
