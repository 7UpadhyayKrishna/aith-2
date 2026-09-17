/**
 * Dev-only: proxy /api → FastAPI so admin session cookies stay same-origin.
 * Requires backend on REACT_APP_PROXY_TARGET (default http://127.0.0.1:8000).
 * Restart `npm start` after changing this file.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
    const target = (process.env.REACT_APP_PROXY_TARGET || 'http://127.0.0.1:8000').replace(/\/$/, '');

    app.use(
        '/api',
        createProxyMiddleware({
            target,
            changeOrigin: true,
            secure: false,
            logLevel: 'warn',
            onError(err, req, res) {
                // Surface a clear JSON error instead of CRA HTML 404
                if (!res.headersSent) {
                    res.writeHead(502, { 'Content-Type': 'application/json' });
                    res.end(
                        JSON.stringify({
                            detail:
                                'API unreachable. Start the backend (uvicorn on port 8000) or set REACT_APP_PROXY_TARGET.',
                        })
                    );
                }
            },
        })
    );
};
