// Use the Web adapter to avoid native binaries on serverless (Netlify)
import { createClient } from "@libsql/client/web";

let client: ReturnType<typeof createClient> | null = null;

export function getDb() {
	if (client) return client;
	const url = process.env.TURSO_DATABASE_URL;
	const authToken = process.env.TURSO_AUTH_TOKEN;
	if (!url) throw new Error("Missing TURSO_DATABASE_URL");
	if (!authToken) throw new Error("Missing TURSO_AUTH_TOKEN");
	client = createClient({ url, authToken });
	return client;
}
