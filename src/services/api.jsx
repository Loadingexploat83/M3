const API_URL = 'https://eldenring.fanapis.com/api';
const CACHE_PREFIX = 'eldenring-cache';
const CACHE_TIME = 1000*60*60; {/* 1h */}

function cacheValida(cache){
    return Boolean(
        cache&&
        typeof cache === 'object' &&
        Array.isArray(cache.datos) &&
        Number.isFinite(cache.timestamp) &&
        Date.now() - cache.timestamp < CACHE_TIME
    );
}

export async function obtenerLista(categoria){
    const cacheKey = `${CACHE_PREFIX}${categoria}`;


    /* Intentamos en la cache */
    try{
        const raw = localStorage.getItem(cacheKey);
        if (raw){
            const cache = JSON.parse(raw);
            if(cacheValida(cache))
                return cache.datos;
        }
    } catch (error){
            console.warn('error al leer cache: ', error);
    }

    /* Si no hay cache valida se lo pedimos a la API*/

    /* 
        todos: todos los datos
        limit: cuantos objetos pillamos de una tirada
        page: la pagina actual de la api
        hasMore: booleano para saber si tenemos que avanzar a la siguiente pagina de datos
        */
    const todos = [];
    const limit = 100;
    let page = 0;
    let hasMore = true;

    while(hasMore) {
        const response = await fetch(
            /* encodeURIComponent se asegura que el string tenga un formato correcto */
            `${API_URL}/${encodeURIComponent(categoria)}?limit=${limit}&page=${page}`
        );

        if (!response.ok){
            throw new Error(`Error HTTP ${response.status} al cargar ${categoria}`);
        }

        const result = await response.json();

        if (!result || !Array.isArray(result.data)){
            throw new Error(`Respuesta de la API no es valida`);
        }

        todos.push(...result.data);
        hasMore = result.data.length === limit;
        page +=1;
    }

    /* Guardamos los datos en la cache con la llave creada anteriormente */
    try{
        localStorage.setItem(
            cacheKey,
            JSON.stringify({timestamp: Date.now(), datos: todos})
        );

    } catch (error){
        console.warn('Error al guardar cache', error);
    }

    return todos;
}