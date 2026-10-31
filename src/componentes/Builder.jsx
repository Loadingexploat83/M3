import { resumirEquipamiento, comprobarRequisitos } from "../utils/logic";

const SLOTS_CONFIG = [
  { id: 'arma', label: 'Arma' },
  { id: 'head', label: 'Casco' },
  { id: 'chest', label: 'Torso' },
  { id: 'arms', label: 'Guantes' },
  { id: 'legs', label: 'Grebas' }
];

const ATTRIBUTES = [
  ['Str', 'Fuerza'],
  ['Dex', 'Destreza'],
  ['Int', 'Inteligencia'],
  ['Fai', 'Fe'],
  ['Arc', 'Arcano']
];

export default function Builder({build, setBuild, onDesequipar}) {
    /* calculamos las estadisticas acumuladas en cada render */
    const resumen = resumirEqupamiento(build.equipamiento);
    const requisitos = comprobarRequisitos(build.equipamiento.arma, build.atributos);

    /* manejador para cambiar atributos numericos */
    const handleAttributeChange = (key, rawValue) => {
        //Number(rawValue) -> convierte el texto en <input> a un numero
        const value = Math.min(99, Math.max(1, Math.trunc(Number(rawValue) || 1)));
        
        /* usamos una funcion callback para recibir el estado anterior */
        setBuild(prev => ({
            ...prev,
            atributos: { /* reemplazamos solo atributos, y de atributos remplazamos solo la calve modificada*/
                ...prev.atributos,
                [key]: value
            }
        }));
    };

    return (
        <aside classNme="builder-column">
            {/* panel de config y equipamiento */}
            <section className = "panel">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow"> CONFIGURACIÓN</p>
                        <h2> Mi build</h2>
                    </div>
                </div>

                {/* input para modificar el nombre de la build */}
                
                <label className="field">
                    <span>Nombre de la build</span>
                    <input
                        type="text"
                        maxLength={60}
                        placeholder="Ej. Caballero de Leyndell"
                        value = {build.nombre}
                        onChange={(e) => setBuild(prev => ({ ...prev, nombre: e.target.value}))}
                        />
                </label>

                {/* Mapeo dinamico de las 5 ranuras del equipamiento */}
                <div className ="equipment-slots">
                    {SLOTS_CONFIG.map(({id, label}) => {
                        const item = build.equipamiento[id];

                        return (
                            <div key = {id} className="equipment-slot">
                                <div className="slot-info">
                                    <span className="slot-label"> {label}</span>
                                    {/* si hay un item, muestra su nombre, sino, muestra "vacio" */}
                                    <strong> {iten ? item.nombre : "Vacío"}</strong>
                                    {item && <small> Peso: {item.peso ?? 0}</small>}
                                </div>

                                {/* el boton de desequipar: */}
                                {item && (
                                    <button
                                        type="button"
                                        className="button button-small"
                                        onClick ={() => onDesequipar(id)}
                                        >
                                            Quitar
                                        </button>
                                )}
                                </div>
                        );
                    })}
                </div>

                {/* Resumen del peso total y cantidad de piezas puestas */}
                <div className="stats-summary">
                    <div className="stat-tile">
                        <span>Peso equipado</span>
                        <strong>{resumen.piezas} / 5</strong>
                    </div>
                </div>

                {/* Menu desplegable para mostrar defensas acumuladas */}
                <details className="details.panel">
                    <summary>Defensa y resistencias del conjunto</summary>
                    <div className="combined-stats">
                        <GroupStats titulo = "Negación de daño" stats={resumen.negacionDanio}/>
                        <GroupStats titulo="Resistencias" stats={resumen.resistencias}/>
                    </div>
                </details>
            </section>

            {/* Panel 2: Atributos numericos del pesonaje */}
        </aside>
    )
}