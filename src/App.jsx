import { useState } from 'react';
import { useCatalog } from './hooks/useCatalog.jsx';
import Builder from './componentes/Builder.jsx';
import Catalog from './componentes/Catalogo.jsx';

const DEFAULT_ATTRIBUTES = {Str: 10, Dex: 10, Int: 10, Fai: 10, Arc: 10}
function App() {

  /* la pestaña que tienes seleccionada */
  const [categoriaActual, setCategoriaActual] = useState('weapons');

  /* ou shii soy yo */
  /* control de carga y errores */
    const {lista, loading, error} = useCatalog(categoriaActual);

  /* La build del usuario */
  const [build, setBuild] = useState({
    nombre:'',
    equipamiento: { weapon: null, head: null, chest: null, arms: null, legs: null},
    atributos: {...DEFAULT_ATTRIBUTES}
  });


  const handleNombreChange = (nuevoNombre) => {
    setBuild(prev => ({ ...prev, nombre: nuevoNombre }));
  };

  const handleAtributoChange = (key, rawValue) => {
    const value = Math.min(99, Math.max(1, Math.trunc(Number(rawValue) || 1))); // aseguramos que sea un número entre 1 y 99
    setBuild(prev => ({ ...prev, atributos: { ...prev.atributos, [key]: value } }));
  };

  const handleEquipar = (item) => {
    setBuild(prev => {
      if (item.tipo === 'weapons') {
        return { ...prev, equipamiento: { ...prev.equipamiento, arma: item } };
      }

      const cat = (item.categoria || '').toLowerCase();
      let slot = 'chest';
      if (cat.includes('head') || cat.includes('helm')) slot = 'head';
      else if (cat.includes('leg') || cat.includes('pants')) slot = 'legs';
      else if (cat.includes('gauntlet') || cat.includes('glove')) slot = 'arms';
      return {
        ...prev,
        equipamiento: { ...prev.equipamiento, [slot]: item }
      };
    });
  };

  const handleDesequipar = (slot) => {
    setBuild(prev => ({
      ...prev,
      equipamiento: { ...prev.equipamiento, [slot]: null }
    }));
  };
  
  return (
      <div id="app">
        <header className='site-header'>
          <p className='eyebrow'>THE LANDS BETWEEN</p>
          <h1>Elden Ring <span>Kit Builder</span></h1>
          <p className='intro'>Diseña tu equipamiento, revisa tus estadisticas y guarda tus builds.</p>
        </header>
        <main>
          {/* Pasa la lista filtrada de la categoria actual y las funciones del catalogo */}
          <Catalog
            categoriaActual={categoriaActual}
            setCategoriaActual={setCategoriaActual}
            lista={lista}
            loading={loading}
            error={error}
            onEquipar={handleEquipar}
          />

          {/* Pasa el estado del personaje y la funcion de desequipar al Builder*/}
          <Builder
            build={build}
            onNombreChange={handleNombreChange}
            onAtributoChange={handleAtributoChange}
            onDesequipar={handleDesequipar}
            onCargarBuild={setBuild}
          />
        </main>

        <footer>
          <p>Fan project no oficial. Elden Ring y sus recursos pertenecen a sus respectivos propietarios</p>
        </footer>
      </div>
  );
}

export default App
