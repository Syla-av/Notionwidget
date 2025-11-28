import fetch from "node-fetch";

export const handler = async (event) => {
  // --- CABECERAS CORS PARA NOTION / IFRAMES ---
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // --- RESPUESTA AL PREFLIGHT ---
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "OK"
    };
  }

  // --- ASEGURAR QUE SEA POST ---
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Método no permitido, usa POST"
      })
    };
  }

  // --- VALIDAR BODY ---
  if (!event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "No se envió ningún body"
      })
    };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "JSON inválido enviado al servidor"
      })
    };
  }

  const { fecha, activado } = data;

  if (!fecha || activado === undefined) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Faltan datos: se requiere { fecha, activado }"
      })
    };
  }

  // --- TU DATABASE DE NOTION ---
  const NOTION_DATABASE = "TU_DATABASE_ID";
  const NOTION_TOKEN = "TU_TOKEN_SECRETO";

  // --- INSERTAR EN NOTION ---
  try {
    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE },
        properties: {
          Fecha: {
            date: { start: fecha }
          },
          Activado: {
            checkbox: activado
          }
        }
      })
    });

    const notionData = await notionResponse.json();

    if (!notionResponse.ok) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          ok: false,
          error: "Error en Notion",
          detail: notionData
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        enviado: data,
        notion: notionData
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        ok: false,
        error: "Error conectando con Notion",
        detail: err.message
      })
    };
  }
};
