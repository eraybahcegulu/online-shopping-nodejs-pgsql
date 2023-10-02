"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_js_1 = __importDefault(require("./config/db.js"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`server started http://localhost:${PORT}`);
    db_js_1.default.connect((err) => {
        if (err) {
            console.log('Connection error', err.stack);
        }
        else {
            console.log('DB connection successful');
        }
    });
});
