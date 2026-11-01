// src/hooks/useCatalog.jsx

import { useState, useEffect } from 'react';
import { obtenerLista } from '../services/api.jsx';
import { normalizarObjetos } from '../utils/logic.jsx';

/**
 * Custom Hook para gestionar la carga, almacenamiento en memoria y estado de red del catálogo.
 * Soluciona condiciones de carrera mediante AbortController y evita peticiones duplicadas.
 */
export function useCatalog(categoriaActual) {
  const [catalogo, setCatalogo] = useState({ weapons: [], armors: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificamos si los datos de la categoría actual ya están en memoria
  const yaCargado = catalogo[categoriaActual].length > 0;

  useEffect(() => {
    // Si ya tenemos los datos cargados, no hacemos la petición HTTP
    if (yaCargado) return;

    const controller = new AbortController();

    async function cargarDatos() {
      setLoading(true);
      setError(null);

      try {
        const datos = await obtenerLista(categoriaActual, controller.signal);
        const limpios = normalizarObjetos(datos).filter(item => item.tipo === categoriaActual);

        if (!controller.signal.aborted) {
          setCatalogo(prev => ({ ...prev, [categoriaActual]: limpios }));
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    cargarDatos();

    return () => controller.abort();
  }, [categoriaActual, yaCargado]); // Dependencias limpias sin incluir todo el objeto catalogo

  return {
    lista: catalogo[categoriaActual] || [],
    loading,
    error
  };
}