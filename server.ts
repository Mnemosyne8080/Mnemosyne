import { createApp } from "./src/server/app";

export { createApp };

const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = await createApp();
  app.listen(PORT, "0.0.0.0" as any, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
