import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  retries: 2,
  use: {
    baseURL: "http://localhost",
  },
} as PlaywrightTestConfig;
export default config;
