// app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import url from "node:url";
import { Sequelize, DataTypes, Op } from "sequelize";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { climateData } from "./data.js";
import { initModels } from "./models.js";

const JWT_SECRET = process.env.JWT_TOKEN;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

import registerRoutes from "./routes.js";

const sequelize = new Sequelize("database", process.env.DB_USER, process.env.DB_PASS, {
	host: "0.0.0.0",
	dialect: "sqlite",
	pool: { max: 5, min: 0, idle: 10000 },
	storage: ".data/database.sqlite",
});

const models = initModels(sequelize);
await sequelize.sync({ force: false });

sequelize.authenticate()
	.then(() => {
		console.log("Database connected.");
		init();
	})
	.catch((err) => console.error("DB connection failed:", err));

const logRequest = (req) => {
	const parsedUrl = url.parse(req.url, true); // Parse the URL
	const logDetails = {
		method: req.method,
		url: req.url,
		path: parsedUrl.pathname,
		query: parsedUrl.query,
		headers: req.headers,
	};

	console.log(JSON.stringify(logDetails, null, 2)); // Pretty-print the log
	return JSON.stringify(logDetails, null, 2);
};

async function init() {
	const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PW, 10);

	//await climateData(models);
	//await Admin.create({ name: process.env.DEFAULT_ADMIN_USER, username: process.env.DEFAULT_ADMIN_USERNAME, password: hashedPassword, active: 1 });

	registerRoutes({
		app,
		models,
		JWT_SECRET,
		sequelize,
		Op,
		logRequest
	});
}

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});