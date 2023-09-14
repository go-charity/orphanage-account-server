"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = require("dotenv");
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const utils_1 = require("./utils/utils");
const db_config_1 = __importDefault(require("./models/db-config"));
const get_orphanage_details_1 = __importDefault(require("./routes/get-orphanage-details"));
const edit_orphanage_details_1 = __importDefault(require("./routes/edit-orphanage-details"));
(0, dotenv_1.config)();
(0, db_config_1.default)();
const allowedOrigins = [
    process.env.CLIENT_DOMAIN,
    process.env.CLIENT_AUTH_SUB_DOMAIN,
];
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (allowedOrigins.includes(origin) || !origin)
            cb(null, true);
        else
            throw new Error(`Origin '${origin}' not allowed`);
    },
    credentials: true,
}));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Validate the API key being passed into the request
app.use(utils_1.validateApiKey);
// Validate the access token passed into the request
app.use(utils_1.validateToken);
app.use("/v1/", get_orphanage_details_1.default);
app.use("/v1/edit", edit_orphanage_details_1.default);
// Error handler middleware
app.use((err, req, res, next) => {
    console.error(err.message || err);
    res.status(err.status || 500).send(err.message || "Something went wrong");
});
exports.default = app;
