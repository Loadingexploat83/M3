import { useState } from "react";

import { filtrarObjetos, ordenarObjetos } from "../utils/logic";

/*
    definimos y exportamos por defecto el componente funcional'Catalog'
    recibe como propiedades:
        categoriaActual: string con la pestaña activa ('weapons' o 'armors')
        setCategoriaActual: funcion para cambiar la pestaña activa en App.jsx
        lista: array de objetos cargados para la categoria actual
        loading: booleano que indica si la API esta descargando datos
        error: string con el mensaje de errorsi falla la peticion
        onEquipar: funcion callback que se ejecuta al hacer click en 'equipar'
 */

export default function Catalog({
    categoriaActual,
    setCategoriaActual,
    lista,
    loading,
    error,
    onEquipar
}) {
    // estado local para almacenar el texto que el usuario escribe en el campo de busqueda
    const [busqueda, setBusqueda] = useState('');

    // estado local para almacenar el orden seleccionado
    const [orden, setOrden] = useState('name');

    // pasamos la lista original y el texto de busqueda a la funcion de logic.jsx
    const listaFiltrada = filtrarObjetos(lista, busqueda);

    // Tomamos la lista filtrada y la ordenamos
    const listaProcesada = ordenarObjetos(listaFiltrada, orden);

    return (
        <section className="panel catalog-panel">
            {/* Cabecera del catalogo*/}
            <div className="section-heading">
                <div>
                    <p className="eyebrow">CATÁLOGO</p>
                    <h2>Equipamiento</h2>
                </div>
                {/* Cantidad de objetos despues de filtrar y ordenar */}
                <span className="muted">
                    {listaProcesada.length} objetos disponibles
                </span>
            </div>

            {/* barra de navegacion para cambiar entre armas y armaduras*/}
            <nav className="tabs" aria-label="Categorías de objetos">
                <button
                    type="button"
                    /* Aplicamos clase active si la categoria actual es weapons*/
                    className={`tab ${categoriaActual === 'weapons' ? 'active' : ''}`}
                    onClick={() => setCategoriaActual('weapons')}
                >
                    Armas
                </button>
                <button
                    type="button"
                    className={`tab ${categoriaActual === 'armors' ?'active' : ''}`}
                    onClick={() => setCategoriaActual('armors')}
                >
                    Armaduras
                </button>
            </nav>

            {/* Controles para buscar y ordenar elementos */}
            <div className="filters">
                {/* Campo de busqueda controlado por React*/}
                <label className="field field-grow">
                    <span>Buscar</span>
                    <input
                        type="search"
                        placeholder="Nombre del objeto..."
                        // Conecta el valor del input con el estado de busqueda
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </label>

                {/* Desplegable de seleccion para ordenar*/}
                <label className="field">
                    <span>Ordenar</span>
                    {/* Conecta la opcion seleccoinada con el estado de orden*/}
                    <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                        {/* Tipos de orden */}
                        <option value="name">Nombre</option>
                        <option value="weight-asc">Menor peso</option>
                        <option value="weight-desc">Mayor peso</option>

                    </select>
                </label>
            </div>
        </section>
    )
}