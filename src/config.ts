// src/config.ts
// Runtime configuration loader matching client-bitezo architecture
export interface AppConfig {
  apiBaseUrl: string;
}

let config: AppConfig | null = null;

export const loadConfig = async (): Promise<AppConfig> => {
  if (config) return config;

  try {
    // Cache busting with a timestamp so browser doesn't cache an old config
    const response = await fetch(`/config.json?t=${new Date().getTime()}`);
    if (!response.ok) {
      throw new Error("Failed to load runtime config");
    }
    config = await response.json();
    return config!;
  } catch (error) {
    console.warn("[Config] Could not load config.json, falling back to env:", error);
    // Fallback to build-time env if config.json is missing or broken
    config = {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://192.168.1.34:8076",
    };
    return config;
  }
};

export const getConfig = (): AppConfig => {
  // Allow localStorage override for testing team quick port switching
  const override = typeof window !== "undefined" ? localStorage.getItem("bitezo_api_base_url") : null;
  if (override) {
    return { apiBaseUrl: override };
  }

  if (!config) {
    return {
      apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://192.168.1.34:8076",
    };
  }
  return config;
};

export const setApiBaseUrl = (url: string) => {
  const sanitized = url.trim().replace(/\/+$/, "");
  if (config) {
    config.apiBaseUrl = sanitized;
  }
  if (typeof window !== "undefined") {
    localStorage.setItem("bitezo_api_base_url", sanitized);
  }
};

export const resetApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("bitezo_api_base_url");
  }
};
