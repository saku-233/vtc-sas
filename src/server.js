// Standard TanStack Start / Cloudflare Worker entry point.
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";

const handler = createStartHandler(defaultStreamHandler);

export default { fetch: handler };
