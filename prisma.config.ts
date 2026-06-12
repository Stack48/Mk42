import { config } from "dotenv";
<<<<<<< HEAD
config({ path: ".env.local" });
=======
config({ path: ".env" });
config({ path: ".env.local", override: true });
>>>>>>> 8e30293 (refactor: migration majeure next16/react19/prisma7, integration clerk et module apporteur)
import { defineConfig } from "prisma/config";

const databaseUrl = process.env["DATABASE_URL"];
if (!databaseUrl) {
  throw new Error("DATABASE_URL must be set");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
