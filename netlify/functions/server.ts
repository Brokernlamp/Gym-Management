import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

let cachedHandler: any;

async function getHandler() {
	if (cachedHandler) return cachedHandler;

	const app = express();
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));

	// Register routes (creates an httpServer internally, but we don't listen here)
	await registerRoutes(app);

	cachedHandler = serverless(app);
	return cachedHandler;
}

export const handler = async (event: any, context: any) => {
	const h = await getHandler();
	return h(event, context);
};
