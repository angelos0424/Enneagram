import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  if (source === process.env && cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = envSchema.parse({
    DATABASE_URL: source.DATABASE_URL,
    NODE_ENV: source.NODE_ENV,
  });

  if (source === process.env) {
    cachedEnv = parsedEnv;
  }

  return parsedEnv;
}
