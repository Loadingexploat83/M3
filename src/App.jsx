import { useState, useEffect } from 'react';
import { obtenerLista } from './services/api.jsx';
import { normalizarObjetos } from './utils/logic.jsx';
import Catalog from './componentes/Catalog.jsx';
import Builder from './componentes/Builder.jsx';

const DEFAULT_ATTRIBUTES = {Str: 10, Dex: 10, Int: 10, Fai: 10, Arc: 10}
function App() {

  /* la pestaña que tienes seleccionada */
  const [categoriaActual, setCategoriaActual] = useState('weapons');

  /* donde guardamos los objetos para no pedirle varias veces a la API */
  const [catalogo, setCatalogo] = useState({weapons: [], armors: []});


  /* ou shii soy yo */
  /* control de carga y errores */
  const [loading, setLoading] = useEffect(false);
  const [error, setError] = useState(null);

  /* La build del usuario */
  const [build, setBuild] = useState({
    nombre:'',
    equipamiento: { weapon: null, head: null, chest: null, arms: null, legs: null},
    atributos: {...DEFAULT_ATTRIBUTES}
  });


  /* useEffect: cuando cambiamos la categoria actual */
  useEffect(() => {
    if(catalogo[categoriaActual].length > 0) return;

    async function cargarDatos(){
      setLoading(true);
      setError(null); // limpiamos errores anteriores

      try{
        //pedimos los datos de API.jsxx
        const datos = await obtenerLista(categoriaActual);

        /* Limpiamos los datos con normalizarObjetos */
        const limpios = normalizarObjetos(datos)
          .filter(item => item.tipo === categoriaActual);
        
        // guardamos la lista en el estado manteniendo la otra categoria intacta
        setCatalogo(prev => ({ ...prev, [categoriaActual]: limpios}));
      } catch (err){
        setError(err.message);
      } finally {
        setLoading(false)
      }
    }

    cargarDatos();
  }, [categoriaActual]); // se ejecuta cada vez que cambia 'categoriaActual'

  const equiparObjeto = (item) => {
    setBuild(prev => {
      // si es un arma, va a la ranura de arma
      if (item.tipo === 'weapons' || categoriaActual === 'weapons'){
        return {...prev, equipamiento: { ...prev.equipamiento, arma: item}};
      }

      // si es una armadura, analizamos su categoria para detectar su sitio
      const cat = (item.categoria || '').toLowerCase();
      let slot = 'chest'; // por defecto es el pecho
      if (cat.includes('head') || cat.includes('helm')) slot = 'head';
      else if (cat.includes('leg') || cat.inlcudes ('pants')) slot = 'legs';
      else if (cat.includes('gauntley') || cat.includes('glove')) slot = 'arms';

      return {
        ...prev, equipamiento: {...prev.equipamiento, [slot]: item}
      };
    });
  };

  const desequiparObjeto = (slot) => {
    setBuild(prev => ({
      ...prev, 
      equipamiento: { ...prev.equipamiento, [slot]: null} // pasamos la ranura especifica a null
    }))
  }
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
            lista={catalogo[categoriaActual]}
            loading={loading}
            error={error}
            onEquipar={equiparObjeto}
          />

          {/* Pasa el estado del personaje y la funcion de desequipar al Builder*/}
          <Builder
            build={build}
            setBuild={setBuild}
            onDesequipar={desequiparObjeto}
          />
        </main>

        <footer>
          <p>Fan project no oficial. Elden Ring y sus recursos pertenecen a sus respectivos propietarios</p>
        </footer>
      </div>
  );
}

export default App
