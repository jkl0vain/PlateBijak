//dekat sini yang boleh kita tukar untuk ke SQLite/MySQL so on..boleh swap kat sini

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

const FILE = join(process.cwd(), 'audit.log.json');

export type AuditEntry = {
  id: string;
  ts: string;
  ip?: string;
  fingerprint?: string;
  payloadHash: string;
  findings: any[];
  riskScore: number;
  action: 'allow'|'review'|'block';
};

export function appendAudit(entry: Omit<AuditEntry,'id'|'ts'>) {
  const row: AuditEntry = { id: uuid(), ts: new Date().toISOString(), ...entry };
  const data = existsSync(FILE) ? JSON.parse(readFileSync(FILE,'utf-8')) : [];
  data.push(row);
  writeFileSync(FILE, JSON.stringify(data, null, 2));
  return row;
}

export function readAudits(limit = 100) {
  const data = existsSync(FILE) ? JSON.parse(readFileSync(FILE,'utf-8')) : [];
  return data.slice(-limit).reverse();
}
