// 🎯 SOLUCIÓN ROBUSTA: Handler dinámico inteligente para todas las sub-rutas
export default async function handler(req, res) {
  console.log('🔍 Robust dynamic handler called');
  
  // Import del handler principal
  const { default: mainHandler } = await import('../index.js');
  
  // Parsear URL completa para extraer todas las partes
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathParts = url.pathname.split('/').filter(Boolean);
  
  // Reconstruir URL completa preservando estructura original
  // pathParts: ['api', 'context-profiles', id, sub-ruta?]
  const reconstructedPath = '/' + pathParts.join('/');
  
  // Preservar query string si existe
  const fullUrl = reconstructedPath + url.search;
  
  console.log('🔍 Original URL:', req.url);
  console.log('🔍 Reconstructed URL:', fullUrl);
  
  // Pasar URL completa al handler principal
  req.url = fullUrl;
  
  return await mainHandler(req, res);
}
