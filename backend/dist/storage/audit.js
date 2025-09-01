"use strict";
//dekat sini yang boleh kita tukar untuk ke SQLite/MySQL so on..boleh swap kat sini
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendAudit = appendAudit;
exports.readAudits = readAudits;
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
const FILE = (0, path_1.join)(process.cwd(), 'audit.log.json');
function appendAudit(entry) {
    const row = { id: (0, uuid_1.v4)(), ts: new Date().toISOString(), ...entry };
    const data = (0, fs_1.existsSync)(FILE) ? JSON.parse((0, fs_1.readFileSync)(FILE, 'utf-8')) : [];
    data.push(row);
    (0, fs_1.writeFileSync)(FILE, JSON.stringify(data, null, 2));
    return row;
}
function readAudits(limit = 100) {
    const data = (0, fs_1.existsSync)(FILE) ? JSON.parse((0, fs_1.readFileSync)(FILE, 'utf-8')) : [];
    return data.slice(-limit).reverse();
}
