const requiredEnvVars = [
  'VITE_API_BASE',
  'VITE_WS_URL',
  'VITE_APP_NAME',
  'VITE_APP_VERSION',
  'VITE_APP_ENV',
];

export const checkEnvVariables = () => {
  const missingVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }

  return true;
};

export const getEnvConfig = () => {
  return {
    apiUrl: import.meta.env.VITE_API_BASE,
    wsUrl: import.meta.env.VITE_WS_URL,
    appName: import.meta.env.VITE_APP_NAME,
    appVersion: import.meta.env.VITE_APP_VERSION,
    appEnv: import.meta.env.VITE_APP_ENV,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
  };
};
