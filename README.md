# M3

M3 · Reactor Core

## Cómo probarlo
    para probarlo primero debes iniciar el servidor con el comando: npm run dev
    una vez inicias el servidor puedes:
    Abrir el catálogo de armas o armaduras.
    Buscar un elemento y seleccionarlo para equiparlo.
    Comprobar cómo cambian el peso y las estadísticas del personaje.
    Introducir atributos y comprobar los requisitos del arma equipada.
    Guardar las builds que te gusten
    Exportar la configuración e importarla de nuevo para poder compartir tus builds con tus amigos


## Uso de IA
   Se ha utilizado Gemini como herramienta colaborativa de apoyo durante la refactorización arquitectónica de la M3. La IA se empleó para auditar la rúbrica de evaluación, identificar bugs de estado y tipografía, implementar patrones de React avanzadas y optimizar la modularización del código.

    Prompts clave utilizados:
        - "Tengo estos errores en mi componente App/Builder/Catalog..."
        - "¿Cómo implementamos un custom hook con AbortController para evitar race conditions?"
        - "¿Cómo gestionamos la exportación e importación de JSON mediante Blob y crypto.randomUUID()?"
        - "Pasa este Hook/Componente a un archivo .jsx limpio y refactorizado."

    Validación de propuestas:
    Todas las soluciones propuestas por la IA fueron analizadas, integradas de forma modular y probadas en el entorno local de desarrollo con Vite. Se verificaron manualmente casos límite (edge cases), como el cambio rápido entre pestañas durante la carga, la subida de JSONs mal formados o con datos nulos, y la coherencia en la actualización del estado global.


## Autopsia

1. Refactorización hacia Custom Hooks (`useCatalog`) y cancelación de peticiones (`AbortController`)

Tras analizar la rúbrica de la M2, identifiqué que el manejo de peticiones asíncronas dentro del componente principal era propenso a carreras de peticiones (*race conditions*) si el usuario cambiaba rápidamente de pestaña. 

Decisión: Extraer la lógica de red a un custom hook desacoplado (`useCatalog.jsx`) e incorporar `AbortController` para cancelar peticiones en segundo plano pendientes si cambia la categoría.

Pros/Contras: Aumenta significativamente la robustez del código, evita que peticiones antiguas sobreescriban el estado visual y resuelve advertencias en React StrictMode. A cambio, requiere gestionar cuidadosamente el array de dependencias de `useEffect` para evitar loops infinitos.

2. Encapsulamiento del estado mediante callbacks específicos (`onNombreChange`, `onAtributoChange`)

En versiones anteriores se pasaba la función `setBuild` entera a los componentes hijos (`Builder`), lo que rompía la encapsulación exponiendo todo el objeto de estado y permitiendo mutaciones no controladas.

Decisión: Eliminar el paso directo de setters y sustituirlo por controladores de eventos explícitos (`handlers`) que encapsulan la lógica de actualización en `App.jsx`.

Pros/Contras: El flujo de datos es unidireccional y predecible (*top-down*). Los componentes hijos actúan estrictamente como interfaces de presentación, lo que mejora la mantenibilidad a largo plazo, aunque requiere escribir más funciones intermedias.

3. Atomización de subcomponentes y resolución de inconsistencias de nombrado

El JSX incluía elementos iterativos en línea dentro de los componentes contenedores (`Catalog` y `Builder`), y existían discrepancias de claves (`weapon` vs `arma`, `description` vs `descripcion`) así como rutas sensibles a mayúsculas/minúsculas.

Decisión: Atomizar la interfaz en componentes especializados (`ItemCard`, `SlotRow`, `AttributeField`, `TabButton`) y unificar las claves del modelo de dominio al español en todos los módulos (`utils/logic.jsx`, `services/api.jsx`, `App.jsx`).

Pros/Contras: El código es legible, fácil de testear y modular. Previene fallos críticos de despliegue en entornos basados en Linux (como Vercel o pipelines de CI) provocados por la sensibilidad a mayúsculas en las rutas de importación.