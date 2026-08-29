/**
 * 의존 방향 검사 규칙 — [ETWGL-R2-3]
 *
 * 배경: 이 저장소에는 의존 방향을 검사할 수단이 없었다. tsc --noEmit은 도메인
 * 코드가 THREE를 import해도 통과시킨다. Frame 파일 31개가 THREE를 한 번도
 * import하지 않은 것은 순전히 사람의 규율 덕분이었는데, 240개 폴더를 재배치하는
 * 동안에는 규율만으로 지킬 수 없다.
 *
 * 목표 의존 방향 (왼쪽으로만 흐른다):
 *   platform/  ←  shared/  ←  <context>/domain/  ←  <context>/ (view, frame, renderer)
 *
 * 참고 문서:
 *   docs/refactoring/R2-3-dependency-rules.md
 *   docs/battle_field_refactoring_plan.md
 *
 * 주의: 규칙 1, 4가 가리키는 src/battle/domain/ 은 R2-5, R2-7에서 생긴다.
 * dependency-cruiser는 매칭되는 모듈이 없으면 통과하므로 미리 넣어도 안전하며,
 * 코드를 쓰기 시작한 뒤에 규칙을 만들면 규칙이 사후 승인이 되므로 먼저 넣는다.
 */
module.exports = {
    forbidden: [
        {
            name: 'domain-no-three',
            comment:
                '규칙 1, 도메인 순수성. battle/domain/ 은 렌더링 라이브러리를 알아서는 안 된다. ' +
                'Battle 애그리게이트는 직렬화 가능해야 하고(스냅샷, 재접속 복원), ' +
                'THREE 객체가 섞이면 JSON으로 나가지 않는다. R2-7, R2-8가 이 규칙에 의존한다.',
            severity: 'error',
            from: { path: '^src/battle/domain' },
            to: { path: '(^|/)node_modules/three($|/)|^three$' },
        },
        {
            name: 'platform-no-context',
            comment:
                '규칙 2, 인프라 무지. platform/ 은 게임 도메인(카드, 턴, 덱)을 몰라야 한다. ' +
                '입력 처리기가 배틀 로직을 알게 되어 재사용 불가해진 전례가 있다 ' +
                '(LeftClickDetect, DragMove, MouseDrop). 그 재발을 막는다.',
            severity: 'error',
            from: { path: '^src/platform' },
            to: { path: '^src/(battle|deck|collection|shop|lobby)' },
        },
        {
            name: 'context-isolation',
            comment:
                '규칙 3, 컨텍스트 격리. 바운디드 컨텍스트끼리 직접 import 하지 않는다. ' +
                "'카드'라는 단어가 컨텍스트마다 다른 것을 가리키므로(전투 유닛 / 덱 슬롯 / 보유 카드) " +
                '모델을 직접 가져다 쓰면 오염된다. 공유는 shared/ 를 통한다.',
            severity: 'error',
            from: { path: '^src/(battle|deck|collection|shop|lobby)/' },
            to: {
                path: '^src/(battle|deck|collection|shop|lobby)/',
                // 자기 컨텍스트 내부 import는 허용
                pathNot: '^src/$1/',
            },
        },
        {
            name: 'battle-no-circular',
            comment:
                '규칙 4, 신규 코드 순환 금지. 애그리게이트 추출(R2-7)과 상태 전이 ' +
                '파이프라인(R2-9) 모두 단방향 의존을 전제한다. 새로 만드는 battle/ 에는 ' +
                '처음부터 순환이 없어야 하므로 error 로 막는다.',
            severity: 'error',
            from: { path: '^src/battle/' },
            to: { circular: true },
        },
        {
            name: 'no-circular-legacy',
            comment:
                '기존 코드 순환 — 관측용(warn). 현재 6건이 있으며 전부 R2-3 이전부터 존재한다. ' +
                'R2-3은 소스를 수정하지 않으므로 여기서 고치지 않는다. ' +
                '목록과 담당 티켓은 docs/refactoring/R2-3-dependency-rules.md 참조. ' +
                '전부 해소되면 severity 를 error 로 올린다.',
            severity: 'warn',
            from: {},
            to: { circular: true },
        },
    ],

    options: {
        // doNotFollow: node_modules 모듈은 그래프에 남기되 그 내부로 들어가지 않는다.
        // exclude 로 막으면 의존 간선 자체가 사라져 domain-no-three 가 조용히 통과한다.
        // (R2-3 프로브 검증에서 실제로 발생한 문제)
        doNotFollow: { path: 'node_modules' },
        tsConfig: { fileName: 'tsconfig.json' },
        tsPreCompilationDeps: true,
        exclude: {
            path: '^resource/',
        },
        reporterOptions: {
            text: { highlightFocused: true },
        },
    },
};
