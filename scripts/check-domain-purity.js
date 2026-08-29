#!/usr/bin/env node
/**
 * 도메인 순수성 검사 — [ETWGL-R2-3] 규칙 4
 *
 * dependency-cruiser는 "모듈 간 의존"만 검사한다. Math.random() 은 import가 아니라
 * 전역 호출이라 depcruise로는 잡을 수 없다. 그래서 별도 검사를 둔다.
 *
 * 왜 필요한가:
 *   resolve() 경로가 결정론적이어야 replay, 서버 검증, 재접속이 성립한다.
 *   현재 도메인 경로의 무작위성은 0회지만 이는 우연이다. 남은 카드 85장에서
 *   덱 셔플, 무작위 대상, 확률 발동이 등장하면 조용히 깨지고 증상이 보이지 않는다.
 *   무작위가 필요하면 Command에 seed를 실어 보내고 도메인은 그 seed만 쓴다.
 *
 * 검사 대상 경로는 R2-7 이후에 생긴다. 없으면 통과한다(규칙을 미리 넣는 것이
 * 코드를 쓴 뒤에 만드는 것보다 낫다 — 후자는 규칙이 사후 승인이 된다).
 */
const fs = require('fs');
const path = require('path');

const CHECKS = [
    {
        name: '규칙 4, 결정론',
        roots: ['src/battle/domain'],
        pattern: /\bMath\.random\s*\(/,
        message: 'Math.random() 금지 — Command에 seed를 실어 보내고 도메인은 그 seed만 쓴다',
    },
    {
        name: '규칙 1 보강, 도메인 순수성',
        roots: ['src/battle/domain', 'src/shared/card_catalog'],
        pattern: /\bnew\s+THREE\.|from\s+['"]three['"]/,
        message: 'THREE 사용 금지 — 직렬화 가능해야 한다 (스냅샷, 재접속 복원)',
    },
    {
        name: '규칙 4 보강, 시각 비결정성',
        roots: ['src/battle/domain'],
        pattern: /\bDate\.now\s*\(|\bnew\s+Date\s*\(/,
        message: '현재 시각 직접 조회 금지 — 시각이 필요하면 Command로 주입한다',
    },
];

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, out);
        else if (/\.tsx?$/.test(e.name)) out.push(p);
    }
    return out;
}

let violations = 0;
let scanned = 0;

for (const check of CHECKS) {
    for (const root of check.roots) {
        for (const file of walk(root)) {
            scanned += 1;
            const lines = fs.readFileSync(file, 'utf8').split('\n');
            lines.forEach((line, i) => {
                if (line.trimStart().startsWith('//')) return;
                if (check.pattern.test(line)) {
                    violations += 1;
                    console.error(`  error ${check.name}: ${file}:${i + 1}`);
                    console.error(`      ${line.trim()}`);
                    console.error(`      → ${check.message}`);
                }
            });
        }
    }
}

if (violations > 0) {
    console.error(`\nx ${violations} domain purity violations.`);
    process.exit(1);
}

const roots = [...new Set(CHECKS.flatMap((c) => c.roots))];
const existing = roots.filter((r) => fs.existsSync(r));
if (existing.length === 0) {
    console.log(`✔ no domain purity violations (검사 대상 경로 미생성 — R2-7 이후 활성화)`);
    console.log(`  대상: ${roots.join(', ')}`);
} else {
    console.log(`✔ no domain purity violations (${scanned} files scanned)`);
}
