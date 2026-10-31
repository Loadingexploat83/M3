
/* convierte el valor de entrada a un numero seguro o null */
export function convertirNumero(valor){
    if(valor === null || valor === undefined || valor === '')
        return null;
    const numero = Number(valor);
    /* si el numero es valido, devuelve el numero, sino, devuelve null */
    return Number.isFinite(numero) ? numero : null;
}

/* limpia los stats que devolvio la API */
function normalizarStats(stats){

    /* comprobamos que stats es un array, si no es un array, devuelve un array vacio */
    if(!Array.isArray(stats))
        return [];
    return stats
        
        .filter(stat => stat && typeof stat.name === 'string')
        .map(stat => ({
            name: stat.name,
            amount: convertirNumero(stat.amount) ?? 0
        }))
}

export function normalizarObjetos(datos){
    if(!Array.isArray(datos))
        return [];

    return datos
        .filter(item => item && typeof item === 'object' && !Array.isArray(item))
        .map(item => ({
            id: item.id ?? item.name,
            nombre: typeof item.name === 'string' ? item.name.trim() : '',
            imagen: typeof item.image === 'string' ? item.image : '',
            descripcion: typeof item.description === 'string' ? item.description : 'sin descripcion',
            peso: convertirNumero(item.weight),
            categoria: typeof item.category === 'string' ? item.category : 'sin categoria',
            ataque: normalizarStats(item.attack),
            negacionDanio: normalizarStats(item.dmgNegation),
            resistencia: normalizarStats(item.resistance),
            requisitos: normalizarStats(item.requiredAttributes),
            tipo: Array.isArray(item.attack) ? 'weapons' : 'armors'
        }))
        .filter(item => item.nombre);
}

export function filtrarObjetos(objetos, busqueda = ''){
    /* nos aseguramos de lo que haya escrito el usuario este en minuscula y sin espacios adicionales */
    const query =  String(busqueda).trim().toLocaleLowerCase('es');

    if(!query)
        return objetos;

    /* devolvemos los objetos que incluyan la query del usuario */
    return objetos.filter(item =>
        item.nombre.toLocaleLowerCase('es').includes(query)
    );
}

/* Ordenar por nombre o peso, por default vamos por orden alfabetico */
export function ordenarObjetos(objetos, orden ='name'){
    return [...objetos].sort((a, b) => {
        if(orden === 'weight-asc')
            return (a.peso ?? Infinity) - (b.peso ?? Infinity);
        if(orden === 'weight-desc')
            return (b.peso ?? -Infinity) - (a.peso ?? -Infinity);
        return a.nombre.localeCompare(b.nombre, 'es');

    });
}

/* calculamos el peso total y suma las estadisticas de las piezas equipadas */
export function resumirEquipamiento(equipamiento){
    const piezas = Object.values(equipamiento).filter(Boolean);
    const peso = piezas.reduce ((sum, item) => sum + (convertirNumero(item.peso) ?? 0), 0);

    const sumarStats = clave => piezas.reduce((total, item) => {
        const stats = Array.isArray(item[clave]) ? item[clave] : [];
        return stats.reduce((sumas, stat) => {
            if(!stat || typeof stat.name !== 'string')
                return sumas;
            const cantidad = convertirNumero(stat.amount);
            if(cantidad === null) 
                return sumas;

            return {
                ...sumas,
                [stat.name]: (sumas[stat.name] ?? 0) + cantidad
            };
        }, total) ;
    }, {});

    return {
        peso,
        piezas: piezas.length,
        negacionDanio: sumarStats('negacionDanio'),
        resistencia: sumarStats('resistencia')
    };
}

export function comprobarRequisitos(arma, atributos){
    if(!arma) return {valido: null, faltantes: []};
    const nombres = {
    Str: 'Fuerza',
    Dex: 'Destreza',
    Int: 'Inteligencia',
    Fai: 'Fe',
    Arc: 'Arcano'
    };

    const faltantes = (Array.isArray(arma.requisitos) ? arma.requisitos: [])
        .filter(req => req && typeof req.name === 'string')
        .map(req => ({
            nombre: nombres[req.name] ?? req.name,
            requerido: convertirNumero(req.amount),
            actual: convertirNumero(atributos?.[req.name]) ?? 0
        }))
        .filter(req => req.requerido !== null && req.actual < req.requerido);

        return {valido: faltantes.length === 0, faltantes};
}