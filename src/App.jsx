import { useState, useEffect } from 'react'
import './App.css'

const DEFAULT_ATTRIBUTES = {Str: 10, Dex: 10, Int: 10, Fai: 10, Arc: 10}
function App() {

  {/* la pestaña que tienes seleccionada */}
  const [categoriaActual, setCategoriaActual] = useState('weapons');

  {/* donde guardamos los objetos para no pedirle varias veces a la API */}
  const [catalogo, setCatalogo] = useState({weapons: [], armors: []});


  {/* ou shii soy yo */}
  {/* control de carga y errores */}
  const [loading, setLoading] = useEffect(false);
  const [error, setError] = useState(null);

  {/* La build del usuario */}
  const [build, setBuild] = useState({
    nombre:'',
    equipamiento: { weapon: null, head: null, chest: null, arms: null, legs: null},
    atributos: {...DEFAULT_ATTRIBUTES}
  });


  {/* 
    useEffect: cuando cambiamos la categoria actual
    */}
  useEffect(() => {
    if(catalogo[categoriaActual].length > 0) return;

    async function cargarDatos(){
      setLoading(true);
      setError(null);

      try{
        const datos = await obtenerLista(categoriaActual);

        {/* Limpiamos los datos con normalizarObjetos */}
        const limpios

      }
    }
  })
  return (
    <>

    </>
  )
}

export default App
