// netlify/functions/guardarDia.js

import fetch from "node-fetch";

export const handler = async (event) => {
  try {
    const { habitId, today } = JSON.parse(event.body);

    // Esto es un ejemplo — pon aquí tu Notion token y database
    const NOTION_TOKEN = process.env.NOTION_TOKEN;
    const DATABASE_ID = process.env.NOTION_DAYS_DB;

    if (!NOTION_TOKEN || !DATABASE_ID) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Faltan variables de entorno" })
      };
    }

    // Crear página en la base de datos
    const notionResponse = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28"
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          "Hábito": {
            relation: [{ id: habitId }]
          },
          "Fecha": {
            date: { start: today }
          }
        }
      })
    });

    const data = await notionResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, data })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
