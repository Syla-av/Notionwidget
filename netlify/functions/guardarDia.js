exports.handler = async (event, context) => {
    // Aceptamos solo POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: "Método no permitido. Usa POST." })
        };
    }

    try {
        // Parsear el body que envía el widget
        const { ultimaActivacion, rachaActual, diasInactivos } = JSON.parse(event.body);

        // Fecha actual en ISO (AAAA-MM-DD)
        const hoy = new Date().toISOString().split("T")[0];

        // Si es la primera vez que se activa
        let nuevaRacha = rachaActual;
        let nuevosInactivos = diasInactivos;

        // Calcular días de diferencia entre hoy y la última activación
        if (ultimaActivacion) {
            const ultima = new Date(ultimaActivacion);
            const actual = new Date(hoy);
            const diff = Math.floor((actual - ultima) / (1000 * 60 * 60 * 24));

            if (diff === 1) {
                // Activación consecutiva → sumar 1 a la racha
                nuevaRacha = rachaActual + 1;
            } else if (diff > 1) {
                // No se activa desde hace varios días → sumar días inactivos
                nuevosInactivos = diasInactivos + (diff - 1);
                nuevaRacha = rachaActual + 1; // La racha continúa, no se rompe
            }
        } else {
            // Primera activación en la historia
            nuevaRacha = 1;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Día registrado correctamente",
                ultimaActivacion: hoy,
                rachaActual: nuevaRacha,
                diasInactivos: nuevosInactivos
            })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error procesando datos", detalles: error.message })
        };
    }
};
