/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SOCKET_SERVER_URL: string;
    readonly VITE_ALERT_SERVER_URL: string;
    // Add more VITE_ variables here as needed
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }