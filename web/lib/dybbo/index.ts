import { PREVIEW } from "../config";
import { LiveClient } from "./live";
import { PreviewClient } from "./preview";
import type { DybboClient } from "./types";

export * from "./types";

export const dybbo: DybboClient & { wallet?: unknown } = PREVIEW ? new PreviewClient() : new LiveClient();
