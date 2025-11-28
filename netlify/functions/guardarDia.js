// netlify/functions/guardarDia.js

exports.handler = async (event, context) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "No se envió ningún body" })
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (err) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "JSON inválido en el body" })
      };
    }

    const { fecha, activado } = body;

    if (!fecha) {
      return {
        statusCode: 400,
        body: JSON.stringify({ ok: false, error: "Falta la propiedad 'fecha'" })
      };
    }

    const NOTION_KEY = process.env.NOTION_KEY;
    const DATABASE_ID = process.env.DATABASE_ID;

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_KEY}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Fecha: { date: { start: fecha } },
          Activado: { checkbox: activado === true }
        }
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error.message })
    };
  }
};
