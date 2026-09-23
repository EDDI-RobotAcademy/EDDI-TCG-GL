/**
 * 의존 방향 검사 규칙 — [ETWGL-R2-3]
 *
 * 배경: 이 저장소에는 의존 방향을 검사할 수단이 없었다. tsc --noEmit은 도메인
 * 코드가 THREE를 import해도 통과시킨다. Frame 파일이 THREE를 한 번도
 * import하지 않은 것은 순전히 사람의 규율 덕분이었는데, 240개 폴더를 재배치하는
 * 동안에는 규율만으로 지킬 수 없다. 그 규율을 R2-110 에서 frame-no-three 로 옮겼다.
 *
 * 목표 의존 방향 (왼쪽으로만 흐른다):
 *   platform/  ←  shared/  ←  <context>/domain/  ←  <context>/ (view, frame, renderer)
 *
 * [R2-107] 이후 battle 은 셋으로 갈렸다. 그 사이의 경계를 R2-110 에서 걸었다:
 *   battle/domain/   규칙과 상태        — ui 와 session 을 모른다
 *   battle/session/  진행 중인 판 하나
 *   battle/ui/       그리는 것          — 판은 domain/read 를 지나서 본다
 *   battle/simulation/ 확인용 시작 판    — 여기만 규칙 물건을 직접 만든다 (규칙 25 의 예외)
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
            name: 'domain-no-ui',
            comment:
                '[R2-110] 규칙 쪽은 그리는 쪽을 몰라야 한다. 지침의 표에 [domain → ui ✗] 로 ' +
                '적혀 있다. R2-107 로 폴더가 갈리기 전에는 이것을 걸 자리가 없었다. ' +
                '지금 넘는 것은 없다. 새로 생기면 여기서 잡힌다.',
            severity: 'error',
            from: { path: '^src/battle/domain/' },
            to: { path: '^src/battle/(ui|session|simulation)/' },
        },
        {
            name: 'ui-no-domain-object',
            comment:
                '[R2-110] 그리는 쪽은 규칙 쪽의 물건(유닛, 손패 카드, 필드 카드)을 직접 받지 ' +
                '않는다. 주고받는 말(domain/flow)과 카드에 적힌 것(domain/ability)만 쓴다. ' +
                '판을 읽을 때는 읽기 창구(domain/read)를 지난다. ' +
                '[R2-113] 마지막으로 넘던 곳이 없어져 예외가 비었다. 다시 채우지 않는다.',
            severity: 'error',
            from: { path: '^src/battle/ui/' },
            to: { path: '^src/battle/domain/battle/' },
        },
        {
            name: 'no-rules-engine-outside-session',
            comment:
                '[R2-127] 규칙을 구동하는 것은 판을 든 쪽뿐이다. 그리는 쪽도, 확인용 판도 ' +
                '규칙 기계를 만들지 않고 handle 을 부르지 않는다. 부르면 셈하는 권한이 ' +
                '그쪽으로 옮겨 가고, 서버가 셈하기 시작하는 날 두 쪽 답이 갈린다 (규칙 25). ' +
                '경계 표에서 [화면·연출이 전투 상태를 고치면 안 된다] 가 비어 있던 자리다.',
            severity: 'error',
            from: { path: '^src/battle/(ui|simulation)/' },
            to: { path: '^src/battle/domain/flow/BattleCommandHandler' },
        },
        {
            name: 'simulation-writes-values-only',
            comment:
                '[R2-127] 확인용 판은 시작 상태를 값으로 적는다. 판을 만지지 않는다. ' +
                '전에는 판을 넘겨받아 열 군데를 직접 고쳤고, 그 길로 전투 화면이 판 전체를 ' +
                '손에 들었다 (R2-126). 적어 둔 것과 그 안에 담기는 것, 그리고 첫 턴 번호를 ' +
                '읽는 Battle 만 들인다.',
            severity: 'error',
            from: { path: '^src/battle/simulation/' },
            to: {
                path: '^src/battle/domain/battle/',
                pathNot: '^src/battle/domain/battle/(Battle|Master|BattleSnapshot|FieldCardSnapshot|HandCardSnapshot)\\.ts$',
            },
        },
        {
            name: 'frame-no-three',
            comment:
                '[R2-110] Frame 은 [지금 이게 어떻게 보이는가] 만 든다. THREE 를 알면 그 값이 ' +
                '렌더러 밖으로 새어 나간다. 지금 frame 파일 63개가 전부 안 쓴다. ' +
                '규율로만 지켜지던 것을 검사로 옮긴다.',
            severity: 'error',
            from: { path: '/frame/' },
            to: { path: '(^|/)node_modules/three($|/)|^three$' },
        },
        {
            name: 'no-circular',
            comment:
                '[R2-134] 돌아가는 고리를 만들지 않는다. **0건이 된 지금 잠근다.** ' +
                'R2-3 에서 여섯 건으로 시작해 관측용(warn) 으로 두었고, [전부 해소되면 error 로 ' +
                '올린다] 고 적어 두었다. 마지막 넷이 [화면 → 길 안내 → 길 목록 → 화면] 이었고 ' +
                'R2-134 에서 끊었다 — 그 고리가 화면별로 쪼개는 것을 막고 있었다. ' +
                '고리는 보기 싫은 경고가 아니라 나중에 받아 오는 것을 못 하게 만드는 벽이다. ' +
                '다시 생기면 여기서 막힌다.',
            severity: 'error',
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
