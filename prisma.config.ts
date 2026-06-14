<<<<<<< HEAD
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });
=======
import "dotenv/config";
>>>>>>> 8eeab98 (Fix Prisma)
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
<<<<<<< HEAD
    url: process.env["DATABASE_URL"] as string,
=======
    url: databaseUrl,
>>>>>>> 8eeab98 (Fix Prisma)
  },
});
