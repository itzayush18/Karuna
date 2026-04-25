export const configuration = () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview',
    useVertexAi: process.env.GEMINI_USE_VERTEX_AI === 'true',
    vertexProject: process.env.GEMINI_VERTEX_PROJECT,
    vertexLocation: process.env.GEMINI_VERTEX_LOCATION ?? 'us-central1',
    googleCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
  uploads: {
    dir: process.env.UPLOAD_DIR ?? 'uploads',
    maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB ?? 20),
  },
  r2: {
    enabled: process.env.CLOUDFLARE_R2_ENABLED === 'true',
    accountId: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    bucket: process.env.CLOUDFLARE_R2_BUCKET,
    publicBaseUrl: process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL,
  },
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? 'http://localhost:3000',
});
