import { createStart } from "@tanstack/react-start";

// Local FastAPI calls are made directly by src/api/localClient.js.
export const startInstance = createStart(() => ({ }));
