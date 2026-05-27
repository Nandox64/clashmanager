import { createConnection } from "net";

const HOST = "localhost";
const PORT = 3000;
const URL = `http://${HOST}:${PORT}/api/firebase/load?use_cache=1`;
const TIMEOUT_MS = 120_000;
const RETRY_INTERVAL = 2000;

console.log("🔥 Iniciando script de warmup para Clash Manager...");
console.log(`📡 URL objetivo: ${URL}`);
console.log(`⏳ Esperando a que el servidor esté disponible en ${HOST}:${PORT}...`);

async function waitForPort() {
  const start = Date.now();
  while (Date.now() - start < TIMEOUT_MS) {
    try {
      await new Promise((resolve, reject) => {
        const socket = createConnection(PORT, HOST, () => {
          socket.destroy();
          resolve();
        });
        socket.on("error", reject);
        socket.setTimeout(1000, () => {
          socket.destroy();
          reject(new Error("timeout"));
        });
      });
      return;
    } catch {
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL));
    }
  }
  throw new Error(`Servidor no disponible después de ${TIMEOUT_MS / 1000}s`);
}

async function warmup() {
  try {
    await waitForPort();
    console.log("✅ Servidor detectado. Ejecutando warmup...");

    const res = await fetch(URL, {
      headers: { "User-Agent": "ClashManager-Warmup" },
    });

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const name = data?.clan?.name || "Desconocido";
      console.log(`✅ Warmup completado — ${name} listo (${data?.cached ? "cache" : "sync directo"})`);
    } else {
      console.log(`⚠️ Warmup respondió con estado ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ Warmup falló: ${err.message}`);
  }
}

warmup();
