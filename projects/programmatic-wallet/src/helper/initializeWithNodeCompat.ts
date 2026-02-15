import { Config, initialize } from "@coinbase/cdp-core";
import { isNode } from "./env";

export const initializeWithNodeCompat = async (config: Config) => {
  if (!isNode) {
    return initialize(config);
  }
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const msg = args.map(String).join(" ");
    if (
      msg.includes("Failed to refresh access token") &&
      msg.includes("OAuth is not supported")
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
  try {
    return await initialize(config);
  } finally {
    console.warn = originalWarn;
  }
};
