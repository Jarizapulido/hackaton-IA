const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let path = url.pathname;

    if (path === '/') {
      path = '/index.html';
    }

    const filePath = './public' + path;
    
    const file = Bun.file(filePath);
    const exists = await file.exists();
    
    if (!exists) {
      return new Response('Not Found', { status: 404 });
    }

    const ext = path.split('.').pop();
    const contentTypes = {
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'svg': 'image/svg+xml',
      'woff': 'font/woff',
      'woff2': 'font/woff2'
    };

    return new Response(file, {
      headers: {
        'Content-Type': contentTypes[ext] || 'text/plain'
      }
    });
  }
});

console.log(`Server running at http://localhost:${server.port}`);
