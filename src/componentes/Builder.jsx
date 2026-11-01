import { resumirEquipamiento, comprobarRequisitos } from "../utils/logic.jsx";
import SavedBuilds from "./SavedBuilds.jsx";

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

// Sub-componente para representar una fila de ranura de equipamiento
function SlotRow({slotId, label, item, onDesequipar}) {
    return (
        <div className="equipment-slot">
            <div className="slot-info">
                <span className="slot-label">{label}</span>
                <strong>{item ? item.nombre : "Vacío"}</strong>
                {item && <small>Peso: {item.peso ?? 0}</small>}
            </div>
            {item && (
                <button
                    type="button"
                    className="button button-small"
                    onClick={() => onDesequipar(slotId)}
                >
                    Quitar
                </button>
            )}
        </div>
    );
}

// input de atributos
function AttributeField({attrKey, label, value, onAtributoChange}) {
    return (
        <label className="field attribute-field">
            <span>{label}</span>
            <input
                type="number"
                min="1"
                max="99"
                value={value}
                onChange={(e) => onAtributoChange(attrKey, e.target.value)}
            />
        </label>
    );
}

function WeaponRequirements({arma, requisitos}) {
    if (!arma) 
        return <p className="status">Equipa un arma para comprobar sus requisitos</p>;
    if (requisitos.valido) 
        return <p className="status status-success">Cumples los requisitos de atributos del arma</p>;
    return (
        <p className="status status-warning">
            Te faltan atributos: {requisitos.faltantes.map(f => `${f.nombre} ${f.actual}/${f.requerido}`).join(', ')}.
        </p>
    );
}


export default function Builder({build, onNombreChange, onAtributoChange, onDesequipar, onCargarBuild}) {
    /* calculamos las estadisticas acumuladas en cada render */
    const resumen = resumirEquipamiento(build.equipamiento);
    const requisitos = comprobarRequisitos(build.equipamiento.arma, build.atributos);

    return (
        <aside className="builder-column">
            {/* panel de config y equipamiento */}
            <section className="panel">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow"> CONFIGURACIÓN</p>
                        <h2>Mi build</h2>
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
                        onChange={(e) => onNombreChange(e.target.value)}
                        />
                </label>

                {/* Mapeo dinamico de las 5 ranuras del equipamiento */}
                <div className ="equipment-slots">
                    {SLOTS_CONFIG.map(({id, label}) => (
                        <SlotRow
                            key={id}
                            slotId={id}
                            label={label}
                            item={build.equipamiento[id]}
                            onDesequipar={onDesequipar}
                        />
                    ))}
                </div>

                {/* Resumen del peso total y cantidad de piezas puestas */}
                <div className="stats-summary">
                    <div className="stat-tile">
                        <span>Peso equipado</span>
                        <strong>{resumen.peso.toFixed(1)}</strong>
                    </div>
                    <div className="stat-tile">
                        <span>Piezas equipadas</span>
                        <strong>{resumen.piezas} / 5</strong>
                    </div>
                </div>

                {/* Menu desplegable para mostrar defensas acumuladas */}
                <details className="details-panel">
                    <summary>Defensa y resistencias del conjunto</summary>
                    <div className="combined-stats">
                        <GroupStats titulo = "Negación de daño" stats={resumen.negacionDanio}/>
                        <GroupStats titulo="Resistencias" stats={resumen.resistencia}/>
                    </div>
                </details>
            </section>

            {/* Panel 2: Atributos numericos del pesonaje */}
            <section className="panel">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow"> ATRIBUTOS DEL PERSONAJE</p>
                        <h2> Requisitos del arma</h2>
                    </div>
                </div>
            
            {/* Generacion dinamica de los 5 inputs de atributos */}
            <div className="attribute-grid">
                {ATTRIBUTES.map(([key, label]) => (
                    <AttributeField
                        key={key}
                        attrKey={key}
                        label={label}
                        value={build.atributos[key]}
                        onAtributoChange={onAtributoChange}
                    />
                ))}
            </div>

            {/* Mensaje condicional sore el cumplimiento de requisitos de arma*/}
            <WeaponRequirements arma={build.equipamiento.arma} requisitos={requisitos}/>

            </section>

            <SavedBuilds build={build} onCargarBuild={onCargarBuild}/>
        </aside>
    );
}

// Sub-componente dinámico para pintar la lista de estadísticas (clave -> valor)
function GroupStats({ titulo, stats }) {
  const entries = Object.entries(stats || {});

  return (
    <div className="combined-group">
      <h3>{titulo}</h3>
      {entries.length === 0 ? (
        <p className="muted">Sin estadísticas disponibles.</p>
      ) : (
        <dl className="stats-list">
          {entries.map(([name, amount]) => (
            <div key={name} style={{ display: 'contents' }}>
              <dt>{name}</dt>
              <dd>{amount.toFixed(1)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}