"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const crypto_1 = __importDefault(require("crypto"));
const rules_1 = require("./risk/rules");
const score_1 = require("./risk/score");
const audit_1 = require("./storage/audit");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('tiny'));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, // 100 requests per IP/10min
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// naive in-memory counters (swap to Redis later)
const ipAttempts = {};
const deviceAttempts = {};
app.post('/api/validate', (req, res) => {
    const body = req.body;
    const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown';
    const fp = body.fingerprint || 'unknown';
    ipAttempts[ip] = (ipAttempts[ip] || 0) + 1;
    deviceAttempts[fp] = (deviceAttempts[fp] || 0) + 1;
    const findings = (0, rules_1.runRules)(body, {
        ip,
        attemptsFromIp: ipAttempts[ip],
        recentFromFingerprint: deviceAttempts[fp]
    });
    const { score, action } = (0, score_1.computeRiskScore)(findings);
    const payloadHash = crypto_1.default.createHash('sha256').update(JSON.stringify(body)).digest('hex');
    (0, audit_1.appendAudit)({
        ip, fingerprint: fp, payloadHash,
        findings, riskScore: score, action
    });
    return res.json({ results: findings, riskScore: score, action });
});
app.get('/api/audit/latest', (_req, res) => {
    res.json({ entries: (0, audit_1.readAudits)(200) });
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
