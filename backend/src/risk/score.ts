import type { Finding } from './rules';

export function computeRiskScore(findings: Finding[]) {
  // Sum weights (errors heavier than warnings)
  let score = 0;
  for (const f of findings) {
    if (!f.weight) continue;
    const base = f.weight;
    const multiplier =
      f.type === 'error' ? 1.4 :
      f.type === 'warning' ? 1.0 : 0.5;
    score += base * multiplier;
  }
  // Clamp 0..100
  score = Math.max(0, Math.min(100, Math.round(score)));
  let action: 'allow'|'review'|'block' = 'allow';
  if (score >= 60) action = 'block';
  else if (score >= 30) action = 'review';
  return { score, action };
}
