import {useState, useEffect} from 'react';
import { normalizarObjetos } from '../utils/logic';

const STORAGE_KEY = 'eldenring-saved-builds-v1';

export default function SavedBuilds({build, onCargarBuild}) {

    const [savedBuilds, setSavedBuilds] = useState([]);
    const [saveState, setSaveState] = useState('');
   
    // cargar las builds guardadas del localStorage al montar el componente:
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw){
                const parsed = JSON.parse(raw);
                if(Array.isArray(parsed)){
                    setSavedBuilds(parsed);
                }
            }
        } catch (error){
            console.warn ('Error al leer las builds guardadas: ', error);
        }
    }, []);


    // Auxiliar para actualizar estado local y sincronizarlo en localStorage
    const persistBuilds = (newList) => {
        setSavedBuilds(newList);
        try{
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
        } catch (error){
            setSaveState('No se pudo guardar en el localStorage')
        }
    };

    const handleSave =() => {
        const nombre = build.nombre.trim() || `Build ${new Date().toLocaleDateString()}`
        const nuevaBuild = {
            // globalthis: padre global, crypto: funciones de criptografia, randomUUID: generador de texto para claves 
            id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,nombre,
            actualizada: new Date().toISOString(),
            equipamiento: build.equipamiento,
            atributos: build.atributos

        };

        //añadimos la nueva build al inicio, y limitamos la cantidad de builds a 30
        const actualizadas = [nuevaBuild, ...savedBuilds].slice(0,30);
        persistBuilds(actualizadas);
        setSaveState('Build guardada en este navegador.');

    };

    const handleLoad = (item) => {
    onCargarBuild({
      nombre: item.nombre || '',
      equipamiento: item.equipamiento || { arma: null, head: null, chest: null, arms: null, legs: null },
      atributos: item.atributos || { Str: 10, Dex: 10, Int: 10, Fai: 10, Arc: 10 }
    });
  }


    const handleDelete = (id) =>{
        const filtradas = savedBuilds.filter(b => b.id !== id);
        persistBuilds(filtradas);
        setSaveState('Build Eliminada');
    }

    const handleExport = () =>{
        const data = {
            formato: 'elden-ring-kit-builder',
            version: 1,
            exportado: new Date().toISOString(),
            build: {
                nombre: build.nombre.trim() || 'Build sin nombre',
                equipamiento: build.equipamiento,
                atributos: build.atributos
            }
        };

        // creamos un enlace invisible
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${(data.build.nombre || 'build').replace(/[^a-z0-9-_]+/gi, '_')}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
        setSaveState('Build exportada a archivo JSON');
    };

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        if(!file)
            return;
        try {
            const text = await file.text();
            const parsed= JSON.parse(text);

            const incoming = parsed.build ?? parsed;

            if(!incoming || typeof incoming !== 'object' || !incoming.equipamiento){
                throw new Error('El archivo JSON no tiene una estructura build valida');
            }

            onCargarBuild({
                nombre: incoming.nombre || 'Build importada',
                equipamiento: incoming.equipamiento,
                atributos: incoming.atributos || {
                    Str: 10, Dex: 10, Int: 10, Fai: 10, Arc: 10
                }
            });

            setSaveState('Build importada correctamente');
        } catch (error){
            setSaveState('No se pudo importar: ${error.message}')
        } finally {
            //limpiamos el input para permitir subir el mismo archivo otra vez si se quisiese
            e.target.value ='';
        }
    };

    return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TUS CONFIGURACIONES</p>
          <h2>Builds guardadas</h2>
        </div>
      </div>

      {/* Botones de acción principales */}
      <div className="save-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={handleSave}
        >
          Guardar build
        </button>

        <button
          type="button"
          className="button"
          onClick={handleExport}
        >
          Exportar JSON
        </button>

        <label className="button file-button">
          Importar JSON
          <input
            type="file"
            accept="application/json,.json"
            onChange={handleImport}
          />
        </label>
      </div>

      {/* Mensaje de estado/notificación */}
      {saveState && <p className="status">{saveState}</p>}

      {/* Listado de builds guardadas */}
      <div className="saved-builds">
        {savedBuilds.length === 0 ? (
          <p className="muted">Todavía no has guardado ninguna build.</p>
        ) : (
          savedBuilds.map((item) => (
            <div key={item.id} className="saved-build">
              <div className="saved-build-info">
                <strong>{item.nombre}</strong>
                <small>
                  {new Date(item.actualizada).toLocaleString()}
                </small>
              </div>

              <div className="saved-build-actions">
                <button
                  type="button"
                  className="button button-small"
                  onClick={() => handleLoad(item)}
                >
                  Cargar
                </button>
                <button
                  type="button"
                  className="button button-small button-danger"
                  onClick={() => handleDelete(item.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}