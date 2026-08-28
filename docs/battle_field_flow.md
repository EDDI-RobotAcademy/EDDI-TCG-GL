# 배틀 필드 동작 흐름 (현재 구현 기준)

리팩토링에 앞서 **지금 실제로 어떻게 도는지** 정리한 문서다. 설계 의도가 아니라
`test/draw_field_energy_full_efr/draw_field_energy_full_efr.ts`(3,838줄) 한 파일에
누적된 현재 상태를 그대로 옮긴 것이다.

---

## 1. 초기화 순서

`main(container)` 안에서 위에서 아래로 한 번에 구성된다. 순서 자체가 렌더 순서이자
의존 순서다.

### 1-1. 단계별 구성물

| # | 줄 | 구성물 | 세부 |
|---|---|---|---|
| 1 | ~170 | 코어 3종 | `SceneManager` / `RendererManager` / `CameraManager`. `OrthographicCamera`가 화면을 1:1로 덮는다 |
| 2 | 185 | BGM | `window.click` 1회에 `audioController.playMusic()` (브라우저 자동재생 정책) |
| 3 | 200 | 배경 | `BackgroundRendererV2` |
| 4 | 206 | Your Field Area | `createDefaultYourFieldAreaFrame` + `YourFieldAreaRendererV2` |
| 5 | 212 | Opponent Field Area | `createDefaultOpponentFieldAreaFrame` + `OpponentFieldAreaRendererV2` |
| 6 | 223~242 | 네온 호스트 2개 | 필드 테두리 네온용 더미 그룹. `baseCardWidth/Height`를 userData로 위장해 `NeonBorderEffect`가 카드로 취급하게 한다 |
| 7 | 245~262 | 상대 본체 히트박스 | `opacity 0` 평면. 화면비 `0.4606~0.5410 × 0.0477~0.1920` |
| 8 | 266~292 | 상대 본체 HP 100 + 표기 | `setOpponentMasterHp()`가 유일한 변경 지점 |
| 9 | 293~310 | 내 본체 HP 100 + 표기 | `damageYourMaster()` — **호출부 없음** |
| 10 | 311~397 | 손패 6장 + 덱 35장 | `BattleFieldHandRendererV2`. 덱은 `deckRepo.seed([...])` |
| 11 | 398~417 | 상대 필드 유닛 7장 | 기본 시드 `31,32,32,26,27` + 네더 블레이드(19) 2장 추가 |
| 12 | 418~444 | 로스트 존 패널 2종 | 내/상대. 팝업 렌더러는 `YourLostZonePopupRendererV2` 공용 |
| 13 | 445~477 | 턴 종료 버튼 | 육각형. `mousemove`/`mouseleave`로 호버 네온 |
| 14 | 478~528 | 상대 덱 더미 시드 | 파일럿 전용 |
| 15 | 529~628 | 무덤 패널 2종 + 팝업 | 비석 모양 실제 내부 판정 |
| 16 | 725~760 | 손패 페이지 버튼, 액티브 패널 상태, 네온 3종 | 아군 선택 / 적 타겟 / 아군 타겟 |
| 17 | 798~900 | 턴 넘김 조정 상태 + 헬퍼 | `runResolving` / `withResolving` / `cancelPendingTargeting` / `passTurnOnExpiry` |
| 18 | 858~880 | 이펙트 인스턴스 13종 | 아래 표 |
| 19 | 882~893 | `AnimationLoop` 시작 | 커스텀 업데이트 등록 |
| 20 | 905~2110 | 마우스다운 리스너 5개 + contextmenu | 3장 참고 |
| 21 | 3163~3472 | `HandInteractionBridge` | 드래그·드롭 |
| 22 | 3492~3680 | 필드 에너지 HUD (DOM) + 클릭 존 | Race / Count prev·next |
| 23 | 3682~3698 | 가이드 배너 / 모래시계 / 턴 HUD (DOM) | |
| 24 | 3699~3798 | 턴 전환 함수 + `f` 키 + 만료 훅 | |
| 25 | 3799~ | `resize` | 모든 렌더러의 resize 호출 |

### 1-2. 이펙트 인스턴스

| 인스턴스 | 용도 | 줄 수 |
|---|---|---|
| `ScytheCutEffect` | 죽음의 낫 | 1,484 |
| `EnergyBurnEffect` | 에너지 번 | 1,025 |
| `DoomContractEffect` | 파멸의 계약 | 603 |
| `CorpseExplosionEffect` | 시체 폭발 | 799 |
| `DeadLandsEffect` | 죽음의 대지 | 970 |
| `LeonikSummonEffect` | 레오닉의 부름 | 862 |
| `NetherBladeEntranceEffect` | 네더 블레이드 출격 | **2,281** |
| `MoraleConvertEffect` | 사기 전환 | — |
| `OverflowMoraleEffect` | 넘쳐흐르는 사기 / 에너지 직접 부착 | 974 |
| `SwampEffect` | 망자의 늪 | — |
| `FrozenBurningOverlayEffect` | 빙결 + 암흑 화염 오버레이 | 636 |
| `ColdDarkTraitMarkEffect` | 보유 유닛의 마크 2개 | — |
| `NeonBorderEffect` × 3 | 선택 / 적 타겟 / 아군 타겟 | — |

패시브 이펙트 2종(`NetherBladeFirstPassiveEffect` 1,014줄 / `NetherBladeSecondPassiveEffect`
849줄)은 발동 시점에 `new` 한다.

### 1-3. 매 프레임 갱신

```ts
animationLoop.setCustomUpdate((delta, elapsed) => {
    TWEEN.update();
    neonEffect.updateAnimation();
    enemyNeonEffect.updateAnimation();
    allyTargetNeonEffect.updateAnimation();
    turnEndButtonRenderer.updateAnimation(turnEndButtonGroup, turnEndButtonFrame);
    frozenBurningEffect.updateAnimation(elapsed, delta);
    traitMarkEffect.updateAnimation(elapsed);
});
```

**문제**: 위 25단계가 전부 하나의 함수 스코프를 공유한다. 뒤쪽에서 선언된 값을
앞쪽 핸들러가 참조하는 구조(`guideRenderer`, `timerRenderer`, `currentTurn` 등)라
런타임 순서에 암묵적으로 의존한다. `currentTurn`은 이 이유로 선언 위치를 위로
옮긴 적이 있다.

---

## 2. 상태가 어디에 있는가

### 2-1. 시나리오 지역 변수 (`let` 37개)

| 상태 | 형태 | 초기값 | 의미 |
|---|---|---|---|
| `entries` | `HandEntry[]` | 손패 6장 | 원본. 제거되지 않는다 |
| `handOrder` | `HandEntry[]` | `[...entries]` | 손패에 남은 것 |
| `placedOrder` | `HandEntry[]` | `[]` | 필드에 놓인 아군 |
| `currentPage` | `number` | 1 | 손패 페이지 (4장/쪽) |
| `opponentHpState` | `Map<idx, hp>` | 카드 데이터 체력 | 상대 유닛 HP |
| `opponentEnergyState` | `Map<idx, n>` | idx1=1, idx3=2 | 에너지 번 테스트용 시드 |
| `opponentAliveOrder` | `number[]` | `[0..6]` | 생존 상대 유닛 배치 순서 |
| `opponentMasterHp` | `number` | **100** | 상대 본체 |
| `yourMasterHp` | `number` | **100** | 내 본체 |
| `availableEnergy` | `number` | **19** | 필드 에너지 총량 |
| `opponentAvailableEnergy` | `number` | — | 상대 필드 에너지 |
| `placedCardEnergy` | `Map<HandEntry, Map<CardRace, number>>` | 빈 맵 | 카드에 붙은 종족별 에너지 |
| `currentRaceId` | `number` | 1 | Race HUD 선택 (1 휴먼 / 2 언데드 / 3 트런트) |
| `fieldEnergyChargeCount` | `number` | 1 | Count HUD |
| `currentTurn` | `number` | 1 | 턴 수 |
| `deployedTurn` | `Map<HandEntry, number>` | 빈 맵 | 출격 멀미 판정 |
| `coldDarkEnergyHolders` | `Set<HandEntry>` | 빈 셋 | 암흑 화염 + 빙결 부여 가능 |
| `darkFlameTargets` | `Set<idx>` | 빈 셋 | 화상 지속 대상 |
| `frozenTargets` | `Set<idx>` | 빈 셋 | 이번 턴 빙결 |
| `freezeImmuneTargets` | `Set<idx>` | 빈 셋 | 재빙결 면역 |
| `interactionState` | union | `'idle'` | 4상태 |
| `selectedAttackerEntry` | `HandEntry \| null` | null | 선택된 아군 |
| `activePanelGroup` | `Group \| null` | null | 액티브 패널 |
| `lostZonePopupGroup` 외 3 | `Group \| null` | null | 팝업 4종 |
| `leonikPopupGroup` / `leonikPopupPage` / `leonikSelectedPopupIndices` | — | — | 레오닉 팝업 |
| `netherBladePassive2State` | `{deployedEntry, onResolve} \| null` | null | 단일 지정 모달 |
| `corpseExplosionState` | `{sourceEntry, sacrificed, picks} \| null` | null | 2체 지정 모달 |
| `resolvingDepth` | `number` | 0 | >0이면 비가역 동작 진행 중 |
| `turnPassDeferred` | `boolean` | false | 만료 보류 |
| `passiveChainAborted` | `boolean` | false | 패시브 체인 중단 |
| `pendingAttackDamage` / `pendingAttackType` | — | — | attackMode 중 보류된 공격 |
| `fieldEnergyActive` | `boolean` | false | 필드 에너지 부착 모드 |

### 2-2. 싱글톤 리포지토리

| 리포지토리 | 보유 |
|---|---|
| `TurnStateRepositoryImpl` | 턴 **소유권**만 (`'your'` / `'opponent'`) |
| `YourDeckRepositoryImpl` | 내 덱 35장 |
| `OpponentDeckRepositoryImpl` | 상대 덱 (더미 시드) |
| `BattleFieldHandMapRepositoryImpl` | 손패 카드 ID |
| `OpponentFieldMapRepositoryImpl` | 상대 필드 카드 ID |
| `YourLostZoneRepositoryImpl` / `OpponentLostZoneRepositoryImpl` | 로스트 존 |
| `YourTombRepositoryImpl` / `OpponentTombRepositoryImpl` | 무덤 |

**문제**: 같은 성격의 상태가 지역 변수와 싱글톤에 나뉜다. 턴 **소유권**은
리포지토리, 턴 **수**는 지역 변수. 손패 **ID 목록**은 리포지토리, 손패 **순서**는
지역 변수.

---

## 3. 입력 라우팅

마우스다운 리스너가 **5개** 등록되어 있고, DOM 등록 순서대로 실행된다.
서로 `stopImmediatePropagation()`으로 뒷 리스너를 끊는다.

| 순서 | 줄 | 버튼 | 담당 | 좌표 방식 |
|---|---|---|---|---|
| 1 | 905 | 좌 | 모달 타겟팅 → 턴 종료 → LZ/무덤 패널 → 팝업 소비 | 화면→월드 직접 변환 |
| 2 | 1231 | 좌 | 손패 페이지 prev/next | 레이캐스트 |
| 3 | 1514 | 좌 | 액티브 패널 버튼 → 공격 대상 | 레이캐스트 (`withResolving`) |
| 4 | 1767 | 우 | 액티브 패널 열기/닫기 | 레이캐스트 + 평면 교차 |
| 5 | 2092 | 좌 | 필드 에너지 → 카드 부착 | 레이캐스트 (`fieldEnergyActive`일 때만) |

그 외 리스너: `mousemove`/`mouseleave`(턴 종료 호버), `contextmenu`(기본 차단),
`keydown` 2개(`d` 드로우 / `f` 턴 넘김), DOM 클릭 존 다수(Race/Count prev·next,
필드 에너지 호버).

### 3-1. 리스너 1의 분기 순서

```
-0.5) corpseExplosionState !== null      → 클릭 흡수. 본체 먼저, 그다음 유닛
                                            2체 채우면 resolveCorpseExplosion
-0.4) netherBladePassive2State !== null  → 클릭 흡수. 픽 즉시 resolve
 0)   턴 종료 버튼    isPointInsideTurnEndButton (육각형 실내부)
 1)   Your Lost Zone  computeYourLostZonePanelBounds (사각)
 2)   Opp Lost Zone   computeOpponentLostZonePanelBounds (사각)
 2b)  Your Tomb       isPointInsideYourTomb (비석 모양)
 2c)  Opp Tomb        isPointInsideOpponentTomb (역비석)
 3)   팝업 열림 → 버튼 확인 → 바깥 클릭 시 닫기
```

`0)`~`2c)`는 팝업이 열려 있지 않을 때만 반응한다.

### 3-2. `interactionState` 전이

```
idle ──(카드 픽업)──> cardSelected ──(우클릭)──> panelVisible
  ▲                        ▲                          │
  │                        │              (general/skill 단일기)
  │                        │                          ↓
  │                clearActivePanel()             attackMode
  │                        │                          │
  └────── clearAllSelection() ◄──── (상대 유닛/본체 클릭) ┘
```

- `clearActivePanel()` — 패널 dispose + 적 네온 해제. `panelVisible`/`attackMode`면
  네온 보유 여부에 따라 `cardSelected` 또는 `idle`
- `clearAllSelection()` — 위 + 아군 네온 해제 + `selectedAttackerEntry = null` + `idle`

**문제**: 모달 상태가 `corpseExplosionState`, `netherBladePassive2State`,
`interactionState`, 팝업 그룹 4종으로 제각각이라 가드가 분기마다 중복된다.
타이머 만료 취소를 넣을 때 상태마다 따로 처리해야 했다.

---

## 4. 턴 사이클

### 4-1. 두 개의 진입점, 두 개의 함수

```
endYourTurn(reason)                     beginYourTurn(reason)
  ← 턴 종료 버튼 클릭                      ← 'f' 키
  ← 모래시계 만료                          ← 모래시계 만료
```

**`endYourTurn` (내 턴 → 상대 턴)** — 동기

| # | 동작 |
|---|---|
| 1 | `getOwner() !== 'your'`이면 즉시 반환 (멱등) |
| 2 | `setOwner('opponent')` |
| 3 | `timerRenderer.reset()` — 60초 재시작 |
| 4 | `상대방의 턴입니다.` 배너 3초 |
| 5 | `tickDarkFlameDamage()` — 화상 5 데미지 정산 |

**`beginYourTurn` (상대 턴 → 내 턴)** — 비동기

| # | 동작 |
|---|---|
| 1 | `getOwner() !== 'opponent'`이면 로그 후 반환 (멱등) |
| 2 | `setOwner('your')` + `당신의 턴입니다.` 배너 |
| 3 | `currentTurn += 1` → TURN HUD |
| 4 | `availableEnergy += 1` → 필드 에너지 HUD |
| 5 | `timerRenderer.reset()` |
| 6 | 턴 시작 드로우 1장 (덱이 비면 로그만) |
| 7 | `tickFreezeExpiry()` — 빙결 해제 + 면역 갱신 |
| 8 | `passiveChainAborted = false` 후 네더 블레이드 매턴 패시브 체인 |

8단계는 필드의 생존 네더 블레이드마다 **순차 await**. 각 체인은 광역기 →
(중단 아니면) 단일 지정 픽커 순이고, 픽커는 사용자 클릭을 기다린다.

### 4-2. 모래시계 만료

```ts
timerRenderer.setOnExpire(timerElement, () => {
    if (resolvingDepth > 0) {
        turnPassDeferred = true;
        return;                      // 타이머를 재시작하지 않는다
    }
    passTurnOnExpiry('timer expired');
});
```

| 상황 | 처리 |
|---|---|
| 동작 진행 중 (`resolvingDepth > 0`) | 보류. `runResolving`의 `finally`가 종료 직후 실행하고 그 시점부터 타이머가 새로 돈다 |
| 타겟팅 중 (선택 미완료) | `cancelPendingTargeting()`이 되돌린 뒤 넘어간다 |
| 그 외 | 즉시 넘김 |

`cancelPendingTargeting()`의 세부:

- 네더 블레이드 픽커 → `state.onResolve()` **필수 호출** (안 하면 await가 영구 정지)
  + `passiveChainAborted = true` (다음 블레이드로 넘어가지 않게)
- 시체 폭발 → 상태만 null. 희생 유닛은 필드에, 시전 카드는 손패에 그대로
- `clearAllSelection()` — 패널 / attackMode / 네온 정리

### 4-3. 상대 턴에 잠기는 것

| 대상 | 조건 |
|---|---|
| 손패 픽업 | `canPickup: getOwner() === 'your' && corpseExplosionState === null && netherBladePassive2State === null` |
| 우클릭 패널 | `deployedTurn.get(entry) === currentTurn`이면 열리지 않음 (출격 멀미) |

**타이머는 만료 시 소유권과 무관하게 동작한다** — 상대 턴에 만료되면 내 턴으로
돌아온다. 상대 행동 로직이 없어 무한 대기를 막기 위한 것이다.

---

## 5. 카드 플레이 흐름

`HandInteractionBridge`의 콜백 3개(`canPickup` / `onPickup` / `onDrop`)로 돈다.

### 5-1. `onPickup`

1. `clearActivePanel()`
2. `group.renderOrder = 100`, `position.z = 1` (다른 카드 위로)
3. 아군 선택 네온 부착, `interactionState = 'cardSelected'`
4. 카드 ID에 따라 타겟 하이라이트

| 하이라이트 | 대상 목록 |
|---|---|
| 상대 유닛 전체 적색 | `OPPONENT_TARGETING_ITEM_IDS` = 낫(8), 에너지 번(9) |
| 배치된 아군 녹색 | `ALLY_TARGETING_ITEM_IDS` = 사기 전환(35), 넘쳐흐르는 사기(2), 죽음의 에너지(93), 차갑게 불타는 암흑 에너지(151) |

### 5-2. `onDrop` 분기 (위에서부터 순서대로)

| 종류 / 카드 | 드롭 조건 | 절차 |
|---|---|---|
| **ITEM 낫 (8)** | 상대 유닛 위 | 등급 확인 → 신화면 30, 아니면 현재 HP 전량 → `scytheCutEffect.play` → 사망 정리 |
| **ITEM 에너지 번 (9)** | 상대 유닛 위 | 에너지 최대 2 흡수 → `damage = (2 - 흡수량) × 10` → 이펙트 병렬 재생 → 500ms 대기 |
| **ITEM 파멸의 계약 (25)** | 상대 **필드 영역** 안 | `doomContractEffect.play()` (boom 1,380ms) → 전체 15 데미지 + 본체 15 → 상대 덱 1장 로스트 존 |
| **ITEM 사기 전환 (35)** | 아군 유닛 위 | `floor(체력/5)` 계산 → 무덤 이동 → `placedOrder` 제거 → 리플로우 → 모트 도착마다 `availableEnergy += 1` |
| **ITEM 죽음의 대지 (36)** | 상대 **필드 에너지 HUD** 위 | `deadLandsEffect.play` → 셰터 정점(~1.3초)에서 상대 필드 에너지 2 감소 |
| **UNIT** | Your Field 안 | `handOrder` 제거 → `placedOrder` 추가 → `deployedTurn` 기록. 네더 블레이드(19)면 출격 연출 → 패시브 체인 |
| **SUPPORT 망자의 늪 (20)** | Your Field 안 | 덱에서 3장 뽑아 ID 수집 → `swampEffect.play` → 손패에 추가 |
| **SUPPORT 레오닉의 부름 (30)** | Your Field 안 | 팝업 오픈. **카드는 아직 소비하지 않는다** — 확인 버튼이 `consumeHandCard` 호출 |
| **SUPPORT 넘쳐흐르는 사기 (2)** | 아군 유닛 위 | 덱에서 죽음의 에너지 최대 2장 → 모트 도착마다 `addCardEnergy(target, 언데드, 1)` → 뽑은 카드는 무덤 |
| **ENERGY 죽음의 에너지 (93)** | 아군 유닛 위 | 카드 즉시 소비 → `playDirectAttach` 충격 콜백에서 종족 에너지 1 부착 |
| **ENERGY 차갑게 불타는 암흑 에너지 (151)** | 아군 유닛 위 | 위와 동일 + `coldDarkEnergyHolders.add()` + 마크 2개 부착 |
| 그 외 | — | 스냅백 (소비되지 않음) |

드롭 위치 판정은 **커서가 아니라 카드의 시각적 중심**(`group.position`)을 쓴다.

---

## 6. 공격 흐름

### 6-1. 우클릭 → 액티브 패널

| # | 가드 |
|---|---|
| 1 | `panelVisible` / `attackMode`면 `clearActivePanel()` 후 종료 (토글) |
| 2 | `interactionState !== 'cardSelected'`면 종료 |
| 3 | `selectedAttackerEntry`가 없으면 종료 |
| 4 | `placedOrder.includes()`가 아니면 종료 (손패 카드 제외) |
| 5 | **출격 멀미** — `deployedTurn.get() === currentTurn`이면 배너 + 종료 |

통과하면 클릭 위치에 패널 생성. 버튼 구성은 `일반 공격 → 스킬1 → 스킬2 → 상세보기`
(스킬은 `image-paths.json`에 텍스처가 있는 만큼).

### 6-2. 버튼 클릭

```
btnType이 general 또는 skill* 인가?
  ↓
skillType / damage 결정
  general → SkillType.Single, damage = 카드 공격력
  skill1  → getSkillType(cardData['스킬 1']), damage = cardData['스킬1 데미지']
  skill2  → 동일하게 스킬 2
  ↓
스킬이면 에너지 검사
  cost = { 언데드/휴먼/트런트 필요에너지 } 중 0이 아닌 것
  카드에 붙은 종족별 에너지와 하나씩 대조
  부족하면 → 배너 + clearActivePanel() + 종료
  ↓
SkillType 분기
```

| SkillType | 절차 |
|---|---|
| `EveryUnitField` / `EveryField` | `clearAllSelection()` → 네더 블레이드면 패널 이동만, 그 외 `playAoESkill` → 생존 상대 전체에 데미지 → 상태이상 부여 → 적색 플래시 200ms + 12단 진동 360ms → 450ms 후 사망 정리 + 리플로우. `EveryField`는 본체도 |
| `Single` | `interactionState = 'attackMode'`, `pendingAttackDamage/Type` 저장, 상대 유닛 + 본체에 적색 네온 |

### 6-3. attackMode 중 대상 클릭

| 대상 | 절차 |
|---|---|
| 본체 | `playAttack` → `setOpponentMasterHp()` → 0 이하면 300ms 뒤 `masterGroup.visible = false` |
| 유닛 | `playAttack` → HP 차감 → 상태이상 부여 → 플래시 + 진동 → 사망이면 450ms 뒤 정리 |

`interactionState = 'attackMode'` 대입 지점은 코드 전체에 **1곳뿐**이고 패널 버튼
핸들러 안에 있다. 광역기도 같은 핸들러에서만 발동하므로, 패널을 막으면 공격
경로가 전부 막힌다.

---

## 7. 상태이상 — 차갑게 불타는 암흑 에너지 (151)

### 7-1. 부여

보유 아군이 **명중**시켰을 때만. `newHp > 0`인 경우에만 건다(한 방에 죽으면 제외).

| # | 지점 | 공격자 |
|---|---|---|
| 1 | 패널 광역기 | `atkEntry` |
| 2 | 패널 단일 공격 | `attackerEntry` |
| 3 | 네더 블레이드 패시브 1 (광역) | `deployedEntry` |
| 4 | 네더 블레이드 패시브 2 (단일) | `state.deployedEntry` |

```ts
darkFlameTargets.add(targetIdx);                        // 화염은 항상 갱신
if (!freezeImmuneTargets.has(targetIdx))                // 빙결은 면역 아닐 때만
    frozenTargets.add(targetIdx);
frozenBurningEffect.setState(targetIdx, { flame: true, freeze: ... });
```

### 7-2. 한 사이클

```
내 턴  명중 → 대상에 암흑 화염 + 빙결
  ↓ endYourTurn
상대 턴 시작  화상 5 데미지 · 대상은 여전히 빙결(행동 불가)
  ↓ beginYourTurn
내 턴 시작  빙결 해제 → 이번 턴 재빙결 불가(면역)
```

`tickFreezeExpiry()`가 `freezeImmuneTargets`를 **먼저 비우고** 이번에 녹은 대상만
새로 넣으므로 면역이 정확히 1턴만 유지된다.

`tickDarkFlameDamage()`는 생존 대상에만 적용하고, 죽으면 무덤 → 생존목록 제거 →
숨김 → `clearColdDarkStatus()` → 리플로우까지 처리한다.

### 7-3. 시각 표현

| 대상 | 표현 |
|---|---|
| 보유 아군 | 에너지 아이콘 아래 마크 2개(암흑 화염 / 빙결). 셰이더 배지라 매 프레임 갱신 |
| 피격 상대 | `FrozenBurningOverlayEffect` — 한 평면이 `u_freeze` / `u_flame`을 독립 제어. 빙결은 카드 내접 타원, 화염은 그보다 안쪽 타원 |

**미구현**: `isOpponentFrozen()` 판정 함수는 있지만 **호출부가 없다.** 상대 행동
로직이 없어 "행동 불가"가 관측되지 않는다.

---

## 8. 피해 → 사망 → 정리

### 8-1. 피해 적용 지점

| 대상 | 지점 수 | 단일 진입점 |
|---|---|---|
| 상대 유닛 (`opponentHpState.set`) | **9곳** | ✗ 각 지점이 직접 호출 |
| 상대 본체 (`opponentMasterHp`) | 5곳 | ✓ `setOpponentMasterHp()` |
| 내 본체 (`yourMasterHp`) | 0곳 | ✓ `damageYourMaster()` (호출부 없음) |

상대 유닛 9곳: 패널 광역기 / 패널 단일 공격 / 네더 블레이드 패시브 1 / 패시브 2 /
낫 / 에너지 번 / 파멸의 계약 / 시체 폭발 / 암흑 화염 틱.

### 8-2. 사망 시 공통 절차

```ts
buryOpponentUnit(cardIndex)                    // 무덤 리포지토리에 cardId 추가
opponentAliveOrder.splice(aliveIdx, 1)         // 생존 목록에서 제거
entry.group.visible = false                    // 숨김
clearColdDarkStatus(cardIndex)                 // 상태이상 + 오버레이 정리
reflowOpponentField()                          // 남은 유닛 재배치
```

**문제**: 이 5줄이 지점마다 손으로 반복된다. 하나라도 빠뜨리면 무덤에 안 들어가거나,
죽은 카드가 여전히 레이캐스트에 걸린다(THREE r164의 레이캐스터는 `visible`을
걸러 주지 않아 코드에서 직접 검사한다).

### 8-3. 피격 시각 피드백

| 요소 | 값 |
|---|---|
| 적색 플래시 | `0xff4444`, 200ms 후 복원 |
| 진동 | 진폭 `cardWidth / 8`, 12단 감쇠, 30ms 간격 (총 360ms) |
| 사망 지연 | 450ms (진동 완료 대기) |

플래시는 `ShaderMaterial`을 건너뛴다 — `.color`가 없어 `TypeError`가 났던 지점이라
세 곳 모두 `if (!mat.color) return;` 가드가 있다.

---

## 9. 연출과 턴의 동기화

```ts
let resolvingDepth = 0;        // >0 이면 되돌릴 수 없는 동작 진행 중
let turnPassDeferred = false;  // 만료됐지만 동작 종료를 기다리는 중
let passiveChainAborted = false;
```

### 9-1. `runResolving` 적용 범위

| 구간 | 방식 | 이유 |
|---|---|---|
| 패널 버튼 → 공격/스킬 전체 | 리스너 전체를 `withResolving()`으로 래핑 | 개별 `await`만 감싸면 `finally`가 **데미지 적용 전에** 실행되어 턴이 먼저 넘어간다 |
| `resolveCorpseExplosion` | 개별 래핑 | fire-and-forget이라 리스너가 즉시 반환 |
| `resolveNetherBladePassive2` (2곳) | 개별 래핑 | 동일 |
| 네더 블레이드 AoE 패시브 | `triggerNetherBladePassive` 내부 | |
| 출격 연출 | 드롭 핸들러 | |

### 9-2. 보류 → 재개

```ts
finally {
    resolvingDepth -= 1;
    if (resolvingDepth === 0 && turnPassDeferred) {
        turnPassDeferred = false;
        passTurnOnExpiry('timer expired (deferred)');   // 여기서 타이머가 새로 시작
    }
}
```

타이머는 만료 시 재시작하지 않으므로 `rafHandle`이 `null`로 남아 있다.
`endYourTurn`/`beginYourTurn`이 `reset()`을 부르는 시점부터 60초가 다시 돈다.

### 9-3. 체인 중단

`passiveChainAborted`는 두 곳에서 해제된다 — `beginYourTurn`의 체인 루프 진입 시,
출격 체인 진입 시. `cancelPendingTargeting()`이 세우고,
`triggerNetherBladePassive`가 광역기 직후 확인한다.

---

## 10. 리팩토링 관점 요약

| 증상 | 근본 원인 | 대응 |
|---|---|---|
| 상대 유닛 피해 지점 9곳 | 피해 적용의 단일 진입점 없음 | `DamageService` |
| 사망 정리 5줄이 지점마다 반복 | 위와 같음 | `DamageService` |
| 상태이상 부여를 2곳 빠뜨림 | 위와 같음 | `DamageService` |
| 모달 가드가 분기마다 중복 | 타겟팅 세션 개념 없음 | `TargetingSession` |
| 카드 10종이 시나리오에 인라인 | 능력(Ability) 추상 없음 | `CardAbility` + 레지스트리 |
| 뒤에서 선언된 값을 앞 핸들러가 참조 | 애그리게이트 없음 | `BattleField` |
| 턴 소유권과 턴 수가 다른 곳에 | 위와 같음 | `BattleField` |
| 연출과 도메인이 상호 호출 | 프레젠터 포트 없음 | `BattlePresenter` |
| 이펙트 파일 최대 2,281줄 | 페이즈 머신과 그리기가 한 파일 | 분리 (`NetherBladeChargeVisual` 선례) |
