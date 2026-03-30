import { z } from "zod";

const envSchema = z
  .object({
    APP_ORIGIN: z.url().optional(),
    DATABASE_URL: z.string().min(1),
    NODE_ENV: z.enum(["development", "test", "production"]),
    ADMIN_PASSWORD: z.string().min(8),
    ADMIN_SESSION_SECRET: z.string().min(32),
  })
  .superRefine((env, context) => {
    if (env.NODE_ENV === "production" && !env.APP_ORIGIN) {
      context.addIssue({
        code: "custom",
        message: "APP_ORIGIN is required in production.",
        path: ["APP_ORIGIN"],
      });
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  if (source === process.env && cachedEnv) {
    return cachedEnv;
  }

  const parsedEnv = envSchema.parse({
    APP_ORIGIN: source.APP_ORIGIN,
    DATABASE_URL: source.DATABASE_URL,
    NODE_ENV: source.NODE_ENV,
    ADMIN_PASSWORD: source.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: source.ADMIN_SESSION_SECRET,
  });

  if (source === process.env) {
    cachedEnv = parsedEnv;
  }

  return parsedEnv;
}
