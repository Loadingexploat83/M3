// src/hooks/useCatalog.jsx

import { useState, useEffect } from 'react';
import { obtenerLista } from '../services/api.jsx';
import { normalizarObjetos } from '../utils/logic.jsx';

/**
 * Custom Hook para gestionar la carga, almacenamiento en memoria y estado de red del catálogo.
 * Soluciona condiciones de carrera mediante AbortController y maneja de forma segura React StrictMode.
 */
export function useCatalog(categoriaActual) {
  // Estado local para almacenar en memoria las armas y armaduras cargadas
  const [catalogo, setCatalogo] = useState({ weapons: [], armors: [] });

  // Estado para controlar el indicador visual de carga (spinner)
  const [loading, setLoading] = useState(false);

  // Estado para capturar y mostrar mensajes de error de red o API
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si la categoría actual ya tiene datos guardados en memoria, evitamos una nueva petición
    if (catalogo[categoriaActual].length > 0) return;

    // Instanciamos AbortController para poder cancelar la petición HTTP en segundo plano
    // si el usuario cambia de pestaña rápidamente antes de que termine la descarga
    const controller = new AbortController();

    async function cargarDatos() {
      setLoading(true);
      setError(null);

      try {
        // Solicitamos los datos pasando la señal del controlador (controller.signal)
        const datos = await obtenerLista(categoriaActual, controller.signal);

        // Normalizamos y filtramos la lista para asegurar que los ítems coincidan con el tipo
        const limpios = normalizarObjetos(datos).filter(item => item.tipo === categoriaActual);

        // Solo actualizamos el estado si la petición NO ha sido cancelada
        if (!controller.signal.aborted) {
          setCatalogo(prev => ({ ...prev, [categoriaActual]: limpios }));
        }
      } catch (err) {
        // Ignoramos los errores provocados intencionadamente por la cancelación (AbortError)
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        // Ocultamos el estado de carga solo si la petición sigue activa
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    cargarDatos();

    // Función de limpieza (cleanup):
    // Se ejecuta automáticamente si el componente se desmonta o si 'categoriaActual' cambia
    return () => controller.abort();
  }, [categoriaActual, catalogo]);

  // Retornamos únicamente la lista de la categoría solicitada y los estados de carga/error
  return {
    lista: catalogo[categoriaActual],
    loading,
    error
  };
}