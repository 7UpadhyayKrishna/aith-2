import { defineRailway, preserve, project, service } from "railway/iac";

export default defineRailway(() => {
  const AITH = service("AITH", {
    replicas: { sfo: 1 },
    networking: { privateNetworkEndpoint: "aith" },
    start: "uvicorn server:app --host 0.0.0.0 --port $PORT",
    healthcheck: "/api/health",
    env: {
      ADMIN_COOKIE_SAMESITE: preserve(),
      ADMIN_COOKIE_SECURE: preserve(),
      ADMIN_MFA_ENABLED: preserve(),
      ADMIN_MFA_REQUIRED: preserve(),
      ADMIN_SESSION_SECRET: preserve(),
      APP_ENV: preserve(),
      CORS_ORIGINS: preserve(),
      DATABASE_POOLER_HOST: preserve(),
      DATABASE_SSL: preserve(),
      DATABASE_URL: preserve(),
      SUPABASE_PROJECT_REF: preserve(),
      MEDIA_PROVIDER: preserve(),
      SITE_ORIGIN: preserve(),
      TRUST_PROXY_HEADERS: preserve(),
    },
  });

  return project("AITH", {
    resources: [AITH],
  });
});
