// src/services/api.jsx

const API_URL = 'https://eldenring.fanapis.com/api';
const CACHE_PREFIX = 'eldenring-cache';
const CACHE_TIME = 1000 * 60 * 60; // 1 hora de validez en caché

/**
 * Comprueba si el objeto recuperado de localStorage tiene un formato válido
 * y si aún no ha expirado su tiempo de vida (TTL).
 */
function cacheValida(cache) {
  return Boolean(
    cache &&
    typeof cache === 'object' &&
    Array.isArray(cache.datos) &&
    Number.isFinite(cache.timestamp) &&
    Date.now() - cache.timestamp < CACHE_TIME
  );
}

/**
 * Pide la lista de objetos a la API con paginación, caché local y soporte para cancelación HTTP.
 * 
 * @param {string} categoria - 'weapons' o 'armors'
 * @param {AbortSignal} [signal] - Señal del AbortController para cancelar peticiones pendientes
 */
export async function obtenerLista(categoria, signal) {
  const cacheKey = `${CACHE_PREFIX}-${categoria}`;

  /* 1. Intentamos leer los datos de la caché local */
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw) {
      const cache = JSON.parse(raw);
      if (cacheValida(cache)) {
        return cache.datos;
      }
    }
  } catch (error) {
    console.warn('Error al leer caché: ', error);
  }

  /* 2. Si no hay caché válida, realizamos las peticiones paginadas a la API */
  const todos = [];
  const limit = 100;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(categoria)}?limit=${limit}&page=${page}`,
      { signal } // Pasamos el signal para soportar AbortController
    );

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status} al cargar ${categoria}`);
    }

    const result = await response.json();

    if (!result || !Array.isArray(result.data)) {
      throw new Error('Respuesta de la API no es válida');
    }

    todos.push(...result.data);

    // Si recibimos menos elementos que el límite, hemos llegado a la última página
    hasMore = result.data.length === limit;
    page += 1;
  }

  /* 3. Guardamos los datos completos en localStorage con el timestamp actual */
  try {
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ timestamp: Date.now(), datos: todos })
    );
  } catch (error) {
    console.warn('Error al guardar en caché: ', error);
  }

  return todos;
}