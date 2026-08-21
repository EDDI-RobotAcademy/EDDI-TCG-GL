# 이번 턴에 출격한 유닛으로 공격 불가

## 개요

핸드에서 배틀 필드로 막 내보낸 유닛은 그 턴에 공격도 스킬도 사용할 수 없다
(출격 멀미 / summoning sickness). 사용자가 출격 직후 우클릭으로 액티브 패널을
열려고 하면 `이번 턴에 출격한 유닛으로 공격할 수 없습니다.` 배너로 이유를 알린다.

배너는 [현재 사용자의 턴을 표시](current_turn_owner_display.md)에서 쓰는
`GuideMessageHudRendererV2`를 그대로 재사용한다.

대상 시나리오: `test/draw_field_energy_full_efr/` (누적 E+F+R 파일럿)

---

## Success Criteria

### 1. 출격 턴 기록

#### 1-1. 저장 구조
- [x] `deployedTurn: Map<HandEntry, number>` — 유닛이 필드에 나온 턴 번호를 보관
- [x] **`HandEntry` 참조로 키잉** — 40장 덱에 중복 `cardId`(8×3, 93×4 등)가 있어
      `cardId` 키로는 사본끼리 상태가 뒤섞임. `placedCardEnergy`와 동일한 이유
- [x] `placedOrder` 선언 바로 옆에 위치 — 필드 배치 상태와 같은 자리에서 읽힘

#### 1-2. 기록 시점
- [x] `onDrop`의 `inside && isUnit` 분기 — 유닛이 실제로 `placedOrder`에 들어가는
      **유일한 경로**에서만 스탬프
- [x] `placedOrder.push(droppedEntry)` 직후 `deployedTurn.set(droppedEntry, currentTurn)`
- [x] 필드 밖 드롭 / SUPPORT / ENERGY / TRAP 등 스냅백 경로에서는 기록되지 않음

#### 1-3. 턴 번호 기준
- [x] `currentTurn`이 유일한 기준 — `f` 키(상대 턴 → 내 턴)마다 +1
- [x] 선언을 `turnStateRepo` 옆으로 상향 이동 — 드롭 핸들러(`:3005`)와
      우클릭 핸들러(`:1583`)가 모두 파일 앞쪽에서 읽으므로 TDZ 위험 제거
- [x] 값·증가 시점·TURN HUD 표시는 이동 전과 동일

---

### 2. 공격 / 스킬 차단

#### 2-1. 차단 지점
- [x] 우클릭(`mousedown`, `e.button === 2`) 핸들러에서 액티브 패널 생성 **이전**에 판정
- [x] `deployedTurn.get(selectedEntry) === currentTurn`이면 패널을 열지 않고 조기 반환
- [x] 기존 가드(`interactionState === 'cardSelected'`, `selectedAttackerEntry` 존재,
      `placedOrder.includes`) 통과 후에 검사 — 손패 카드나 미선택 상태에는 영향 없음

#### 2-2. 차단 범위의 완전성
- [x] `interactionState = 'attackMode'` 대입 지점이 코드 전체에 **1곳뿐**이며
      액티브 패널 버튼 핸들러 내부에 있음 → 패널을 막으면 단일 타겟 공격 경로가 전부 막힘
- [x] 광역 스킬(`SkillType.EveryUnitField` / `EveryField`) 역시 같은 패널 버튼
      핸들러(`btnType === 'general' || btnType.startsWith('skill')`)에서만 발동 →
      패널을 막으면 광역기도 발동 불가
- [x] 즉 패널 차단만으로 공격·단일기·광역기 모든 경로가 커버됨 (우회 경로 없음)

#### 2-3. 사용자 피드백
- [x] `guideRenderer.show(guideElement, '이번 턴에 출격한 유닛으로 공격할 수 없습니다.', 3000)`
- [x] 배너 없이 조기 반환하면 무반응처럼 보이므로 반드시 이유를 표시
- [x] `[summoning-sickness] cardId=… deployed on TURN … — panel blocked` 콘솔 로그
- [x] 배너가 이미 떠 있어도 `clearTimeout` 기반 교체로 겹치지 않음

---

### 3. 해제 조건

- [x] 턴 종료 → `f`로 내 턴 복귀 시 `currentTurn`이 +1 되어
      `deployedTurn`에 저장된 값과 달라짐 → 자동으로 공격 가능
- [x] 별도의 해제 코드나 순회 없음 — 값 비교만으로 성립
- [x] 같은 턴에 여러 유닛을 출격시켜도 각각 독립적으로 판정
- [x] 이전 턴에 출격한 유닛은 이번 턴에 정상적으로 패널이 열림

---

### 4. 검증

- [x] `tsc --noEmit` 타입체크 통과
- [x] `attackMode` 진입점과 광역기 발동점을 grep으로 전수 확인해 우회 경로 부재를 검증

---

## Todo (남은 개선 사항)

1. **차단 범위 조정 — 상세보기 버튼까지 함께 막힘**
   - [ ] 액티브 패널을 통째로 열지 않으므로 출격 턴에는 카드 상세를 볼 수 없음.
         패널은 열되 general/skill 버튼 클릭 시점(`:1448` 부근)에서만 배너를 띄우는
         방식으로 옮길지 결정 필요
   - [ ] 네더 블레이드 출격 패시브는 그대로 발동 — 사용자의 공격 행동이 아니라
         자동 발동이라 의도적으로 제외했으나 룰상 맞는지 확인 필요

2. **출격 멀미 상태의 상시 시각 표현**
   - [ ] 현재는 우클릭해야만 알 수 있음. 해당 유닛 카드에 디밍 / 회색조 / 전용 아이콘으로
         "이번 턴 행동 불가"를 상시 표시
   - [ ] 다음 턴 시작 시 멀미가 풀리는 "깨어남" 연출 검토

3. **규칙 확장 — 예외 카드 + 상대 유닛**
   - [ ] 신속(haste) 류 예외 카드 미지원. 카드 데이터에 플래그를 두고 `deployedTurn`
         검사를 우회하도록 확장
   - [ ] 상대 유닛에는 미적용 — 상대 턴 행동 로직이 생기면 동일 규칙을 대칭 적용

4. **판정 로직 단일화**
   - [ ] `canAct(entry): boolean` 헬퍼로 추출 — 스턴·결박 등 "행동 불가" 사유가 늘어날 때
         분기 지점을 한 곳으로 유지
   - [ ] `placedOrder`에서 제거될 때(시체 폭발 희생 등) `deployedTurn.delete()` 정리 누락
   - [ ] `currentTurn`을 `TurnStateRepository`로 승격 (턴 표시 백로그와 공통 항목)

5. **메인 앱 반영**
   - [ ] `src/ui/screens/battle_field/BattleFieldView.ts`에는 미반영 — 턴 상태 자체가
         없어(`handleTurnEndClick`이 빈 스텁) 선행 작업 필요
