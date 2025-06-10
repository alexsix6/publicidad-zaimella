// API Proxy para descargas - Soluciona problemas de CORS
export default async function handler(req, res) {
  // Configuración CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
    });
  }

  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }

    // Validar que sea una URL válida
    let targetUrl;
    try {
      targetUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    // Restricciones de seguridad - solo permitir dominios confiables
    const allowedDomains = [
      'replicate.delivery',
      'pbxt.replicate.delivery', 
      'cdn.replicate.com',
      'fal.media',
      'storage.googleapis.com'
    ];

    const isAllowedDomain = allowedDomains.some(domain => 
      targetUrl.hostname.endsWith(domain)
    );

    if (!isAllowedDomain) {
      return res.status(403).json({
        success: false,
        error: 'Domain not allowed for download'
      });
    }

    console.log(`🔄 Proxying download for: ${url}`);

    // Hacer la petición al archivo original
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PublicidadZaimella/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
    }

    // Obtener el tipo de contenido
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    console.log(`📦 Content-Type: ${contentType}, Size: ${contentLength} bytes`);

    // Configurar headers de respuesta
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    // Pipe del contenido
    const buffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    return res.status(200).send(Buffer.from(uint8Array));

  } catch (error) {
    console.error('❌ Error in download-proxy:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to proxy download',
      details: error.message
    });
  }
} 