# 현재 사용자의 턴을 표시

## 개요

턴 소유권이 바뀌는 순간을 가이드 배너로 알린다. 배틀 화면 진입 시 뜨는
`카드를 드래그하여 이동하세요!`와 동일한 컴포넌트(`GuideMessageHudRendererV2`)를
재사용해, 스타일·위치·표시 시간이 기존 안내와 완전히 일치하도록 한다.

대상 시나리오: `test/draw_field_energy_full_efr/` (누적 E+F+R 파일럿)

---

## Success Criteria

### 1. 턴 소유권 상태

#### 1-1. 단일 권위 저장소
- [x] `TurnStateRepositoryImpl` 싱글톤이 `'your' | 'opponent'` 소유권의 유일한 in-memory 권위
- [x] 초기값 `'your'` — 로컬 플레이어가 게임을 여는 규약과 일치
- [x] `setOwner`가 동일 값 재설정 시 조기 반환 — 중복 로그/중복 전환 없음
- [x] 전환 시 `[turn-state] owner: {prev} → {next}` 콘솔 로그로 추적 가능
- [x] 엔티티(`TurnOwner`)는 `THREE.*` 비의존 순수 타입 — E+F+R 계층 규칙 준수

#### 1-2. 전환 지점
- [x] 내 턴 → 상대 턴: 턴 종료 버튼(육각형) 클릭 (`draw_field_energy_full_efr.ts:903`)
- [x] 상대 턴 → 내 턴: `f` 키 (`draw_field_energy_full_efr.ts:3290`)
- [x] 두 지점 외에 소유권을 변경하는 코드 없음 — 상태 변경 경로가 2개로 한정

---

### 2. 내 턴 → 상대 턴 (턴 종료 버튼)

#### 2-1. 발동 조건
- [x] 팝업(Lost Zone / Opponent Lost Zone)이 열려 있지 않을 때만 반응
- [x] `isPointInsideTurnEndButton` — 바운딩 박스가 아닌 **실제 육각형 내부 판정**.
      모서리 바깥 클릭은 등록되지 않음
- [x] `turnStateRepo.getOwner() === 'your'`일 때만 실행 — 멱등(idempotent)
- [x] 시체 폭발 / 네더 블레이드 패시브 2 타겟팅 모드 중에는 상위 분기에서 클릭이
      흡수되어 도달하지 않음

#### 2-2. 전환 처리
- [x] `turnStateRepo.setOwner('opponent')`
- [x] `timerRenderer.reset(timerElement)` — 60초 모래시계가 처음부터 재시작,
      새 턴 소유자가 온전한 시간 예산을 받음
- [x] `guideRenderer.show(guideElement, '상대방의 턴입니다.', 3000)`

#### 2-3. 상대 턴 동안의 잠금
- [x] `HandInteractionBridge.canPickup`이 `getOwner() === 'your'`를 요구 —
      상대 턴에는 손패 카드를 집을 수 없음
- [x] 픽업 자체가 취소되므로 카드가 시각적으로 "들리지" 않음

---

### 3. 상대 턴 → 내 턴 (`f` 키)

#### 3-1. 발동 조건
- [x] `document` 레벨 `keydown`, `e.key`가 `'f'` 또는 `'F'`
- [x] `getOwner() !== 'opponent'`이면 `[turn-state] 'f' ignored — already your turn`
      로그 후 조기 반환 — 멱등

#### 3-2. 전환 처리 (순서 고정)
- [x] `turnStateRepo.setOwner('your')`
- [x] `guideRenderer.show(guideElement, '당신의 턴입니다.', 3000)`
- [x] TURN 카운터 +1 → `turnRenderer.setTurn` + `update`
      (상대→내 턴 사이클 1회 = 1턴)
- [x] 필드 에너지 총량 +1 → `energyRenderer.setEnergy` + `update`
      (Race 마커 위 소형 충전 카운터와는 별개)
- [x] `timerRenderer.reset(timerElement)`
- [x] 턴 시작 드로우 — `deckRepo.drawCard()` 1장, 덱이 비면 로그만 남기고 통과
- [x] 필드의 생존 네더 블레이드마다 매턴 패시브 풀체인 순차 발동

#### 3-3. 가드 순서
- [x] 배너 호출이 `setOwner` **직후**에 위치 — 조기 반환 경로에서는 배너가 뜨지 않음
- [x] 턴 종료 버튼 쪽과 동일한 가드 동작으로 양방향 대칭

---

### 4. 배너 렌더링 (E+F+R)

#### 4-1. 계층 분리
- [x] `GuideMessageHudFrame` — 순수 값(위치·색·폰트·테두리·zIndex). `THREE.*` 비의존
- [x] `GuideMessageHudRendererV2 implements DomFrameRenderer<GuideMessageHudFrame>` —
      DOM 생성 / 표시 / 제거를 렌더러가 단독 소유
- [x] 렌더러 무상태 규칙 준수 — `getInstance` 없이 `new`로 생성
- [x] 시나리오는 `build()` → `appendChild` → `show()` 오케스트레이션만 담당

#### 4-2. 표시 동작
- [x] `build()`가 `display: none` 상태로 생성 — 최초 렌더에 빈 배너가 깜빡이지 않음
- [x] `show(element, message, durationMs)`가 `innerText` 교체 + `display: block`
- [x] `currentTimeout`을 `clearTimeout`으로 관리 — 이전 배너가 떠 있는 동안 새 메시지가
      오면 **겹치지 않고 교체**되고 타이머도 새로 시작
- [x] 진입 직후 드래그 안내(3초)가 뜬 상태에서 턴 종료를 눌러도 정상 교체
- [x] `pointerEvents: 'none'` — 배너가 화면 중앙 전체 폭을 덮지만 캔버스 클릭을 막지 않음
- [x] `zIndex: 1000` — 필드 에너지 / 모래시계 / 턴 HUD 위에 표시

#### 4-3. 스타일 일관성
- [x] 기존 `showGuideMessage()`와 동일한 값: 반투명 검정 배경 `rgba(40,40,40,0.9)`,
      청록 상하 테두리 `#00ffd0`, 글로우 `0 0 10px rgba(0,255,208,0.6)`,
      36px / weight 500, 화면 세로 중앙(`top:50%` + `translateY(-50%)`)
- [x] 전체 가로 폭 + 텍스트 중앙 정렬
- [x] 리사이즈 시 `guideRenderer.update()` 호출 경로 연결 (CSS 퍼센트로 자동 대응)

---

### 5. 검증

- [x] `tsc --noEmit`으로 타입체크 통과
- [x] `--listFiles`로 해당 파일이 실제 컴파일 대상에 포함됨을 확인
- [x] 실기기 동작 확인 — 턴 종료 클릭 시 `상대방의 턴입니다.`,
      `f` 키 입력 시 `당신의 턴입니다.` 정상 표시

---

## Todo (남은 개선 사항)

### 상시 턴 표시
- [ ] **배너는 전환 순간만 알린다** — 3초 후 사라지므로 "지금 누구 턴인지"를
      상시 확인할 방법이 없음. 화면에 항상 떠 있는 턴 소유자 인디케이터 필요
      (턴 HUD에 `YOUR / OPPONENT` 뱃지 추가 검토)
- [ ] 상대 턴 동안 턴 종료 버튼을 시각적으로 비활성 상태(디밍/채도 저하)로 표현 —
      현재는 눌러도 무반응일 뿐 눌러도 되는 것처럼 보임
- [ ] 상대 턴 동안 손패 영역에 잠금 표현 추가 — `canPickup`이 false를 반환해
      카드가 들리지 않지만 이유가 화면에 드러나지 않음

### 메인 앱 반영
- [ ] **`src/ui/screens/battle_field/BattleFieldView.ts`에는 미반영.**
      `LeftClickDetectServiceImpl.handleTurnEndClick()`이 빈 스텁(`// 아무런 내용 없이
      기본 폼만 제공`)이라 턴 상태 전환 자체가 없음. 턴 상태 연결이 선행되어야 함
- [ ] `BattleFieldView`가 아직 구버전 전역 함수 `showGuideMessage()`를 사용 —
      `GuideMessageHudRendererV2`로 교체 (마이그레이션 백로그)

### 턴 전환 트리거
- [ ] **`f` 키는 임시 디버그 조작** — 실제 상대 턴 로직(AI 또는 네트워크 동기화)으로
      대체되어야 함. 현재는 상대가 아무 행동도 하지 않고 키 입력만 기다림
- [ ] 모래시계 60초 만료 시 자동 턴 넘김 없음 — `startLoop`가 0에서 rAF를 멈추기만 하고
      만료 콜백이 없음. `onExpire` 훅 추가 후 턴 종료와 연결 검토
- [ ] 키 판정을 `e.key` → `e.code`(`'KeyF'`, `'KeyD'`)로 변경 검토 —
      한글 IME 상태에서는 `e.key`가 `'ㄹ'`로 들어와 핸들러가 통과되지 않음

### 연출 / 타이밍
- [ ] `f` 키 처리에서 배너가 카드 드로우 애니메이션보다 먼저 떠 서로 겹침 —
      드로우 완료 후 표시하거나, 배너 지속시간을 드로우 길이에 맞추는 방안 검토
- [ ] 턴 전환 배너에 페이드 인/아웃 트랜지션 부재 — 현재 `display` 토글로 즉시 나타났다
      즉시 사라짐
- [ ] 내 턴 / 상대 턴 배너의 색상 구분 검토 (현재 둘 다 청록 `#00ffd0`)

### 사운드
- [ ] 턴 전환 효과음 (내 턴 시작 / 상대 턴 시작 구분)

### 코드 구조
- [ ] 문구 `'상대방의 턴입니다.'` / `'당신의 턴입니다.'`가 시나리오에 하드코딩 —
      메시지 상수 또는 i18n 레이어로 분리
- [ ] 턴 전환 부수효과(배너·타이머 리셋·TURN 증가·에너지 증가·드로우)가 클릭 핸들러와
      키 핸들러에 흩어져 있음 — `TurnTransitionHandler`로 묶어 두 진입점이 같은 함수를
      호출하도록 정리 검토
- [ ] `currentTurn`이 시나리오 지역 변수 — `TurnStateRepository`가 소유권과 함께
      턴 수까지 보유하도록 승격 검토
