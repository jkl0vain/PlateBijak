import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';

import { runRules, VehicleData } from './risk/rules';
import { computeRiskScore } from './risk/score';
import { appendAudit, readAudits } from './storage/audit';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('tiny'));

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,  // 10 minutes
  max: 100,                  // 100 requests per IP/10min
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// naive in-memory counters (swap to Redis later)
const ipAttempts: Record<string, number> = {};
const deviceAttempts: Record<string, number> = {};

app.post('/api/validate', (req, res) => {
  const body: VehicleData & { fingerprint?: string } = req.body;
  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown';
  const fp = body.fingerprint || 'unknown';

  ipAttempts[ip] = (ipAttempts[ip] || 0) + 1;
  deviceAttempts[fp] = (deviceAttempts[fp] || 0) + 1;

  const findings = runRules(body, {
    ip, 
    attemptsFromIp: ipAttempts[ip],
    recentFromFingerprint: deviceAttempts[fp]
  });

  const { score, action } = computeRiskScore(findings);

  const payloadHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
  appendAudit({
    ip, fingerprint: fp, payloadHash,
    findings, riskScore: score, action
  });

  return res.json({ results: findings, riskScore: score, action });
});

app.get('/api/audit/latest', (_req, res) => {
  res.json({ entries: readAudits(200) });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
