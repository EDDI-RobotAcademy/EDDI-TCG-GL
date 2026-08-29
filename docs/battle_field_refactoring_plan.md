# 배틀 필드 구조 리팩토링

## 개요

`test/draw_field_energy_full_efr/`(누적 E+F+R 파일럿)이 3,838라인 단일 `main()`으로
자라 유지보수가 어려운 상태다. 도메인 상태, 턴 로직, 카드 능력, 연출 호출이 전부
같은 클로저 안에 있어 경계가 없고, 새 기능은 항상 "이 클로저에 한 줄 더"가 된다.

DDD 계층은 유지하되, **도메인을 THREE로부터 분리해 `main()` 밖으로 꺼내는 것**이
이 리팩토링의 목적이다. 진행 중에도 파일럿은 항상 동작해야 한다.

전체 카드 100장 중 **97장이 개별 구현 대상이고 12장만 완료**된 상태다. 남은 85장을
현재 구조로 진행하면 시나리오가 16,000~28,000라인이 된다. 즉 이 리팩토링은
"언젠가 하면 좋은 것"이 아니라 **콘텐츠 확장의 선행조건**이다.

동작 흐름 현황은 [배틀 필드 동작 흐름](battle_field_flow.md) 참조.

대상 시나리오: `npm run draw-field-energy-full-efr`

**작업은 티켓 단위로 진행한다.**
[티켓 목록 (R2-3~9)](refactoring/INDEX.md), [백로그 작성 규칙](refactoring/RULES.md),
[회귀 체크리스트](refactoring/REGRESSION.md)

---

## 현황 측정 (2026-08-28 기준)

```
test/draw_field_energy_full_efr/draw_field_energy_full_efr.ts
  3,838 라인, main() 하나
  let 53, const 677, function 30, addEventListener 16, await 77
  도메인 저장소(Map/Set) 14개가 전부 main() 지역 변수

피해 적용 지점
  상대 유닛  9곳 (opponentHpState.set)
  상대 본체  5곳 → setOpponentMasterHp() 1곳으로 통합 완료
  내 본체    1곳

src/animation/  14파일 13,542라인 (최대 NetherBladeEntranceEffect 2,281)
Frame 파일 31개 — THREE import 0개 (순수성 유지 중)
```

### 카드 커버리지 — 남은 작업량

```
every_card_info.js  총 100장
  스킬 보유 48, 패시브 보유 71, 둘 다 22, 능력 없음 3
  → 개별 구현이 필요한 카드 97장
  → 현재 구현     12장 (#2 #8 #9 #19 #20 #25 #30 #33 #35 #36 #93 #151)
  → 남은 카드     85장
```

### 카드 1장당 시나리오 증가량 (커밋 이력 실측)

```
넘쳐흐르는 사기 (#2)         +63
죽음의 에너지 (#93)          +33
죽음의 대지 (#36)            +90
레오닉의 부름 (#30)         +493
시체 폭발 (#33)             +258
네더 블레이드 (#19)         +345   후속 fix 커밋 3개
차갑게 불타는 암흑 (#151)   +169   후속 fix 커밋 1개 (광역기 미적용)

시나리오 2,044 → 3,838 라인
```

초기 카드 30~90라인 → 최근 카드 170~500라인. **카드당 비용이 감소가 아니라 증가 중.**
남은 85장을 최근 평균(약 290)으로 외삽하면 28,000라인, 보수적으로 150라인을 잡아도
16,000라인이 된다. 어느 쪽이든 단일 `main()`으로는 성립하지 않는다.

---

## 진단

### 1. 스코프가 유일한 경계다

`main()` 하나에 730개 바인딩이 있어 모든 코드가 모든 상태에 접근 가능하다.
추상적 우려가 아니라 이미 사고로 이어졌다 — 암흑 화염/빙결 도입 시 피해 지점
9곳 중 **네더 블레이드 패시브 1, 2 두 곳을 놓쳐** 상태이상이 적용되지 않는
버그가 발생했다. 지점이 9개라서 생긴 사고다.

```
ETWGL-R-53  차갑게 불타는 암흑 에너지 구현      2026-08-23
ETWGL-R-53  광역기에 암흑화염/빙결 미적용 수정  2026-08-25   ← 이틀 뒤
```

비용이 선형이 아니라 **`카드 수 × 상태이상 수`의 곱셈**으로 자란다. 상태이상을
하나 더 추가하면 기존 피해 지점을 전부 다시 방문해야 한다. 네더 블레이드 역시
후속 fix 커밋이 3개 붙었다.

### 2. 엔티티 식별자가 두 종류다

| 대상 | 키 | 참조 |
|---|---|---|
| 상대 유닛 | `cardIndex` (number) | 59회 |
| 아군 유닛 | `HandEntry` (객체 참조) | 34회 |

두 체계가 호환되지 않아 상태이상을 아군에게 걸 수 없다. 상대 턴 행동 로직이
생기는 순간 막힌다.

### 3. Frame이 도메인 값을 담지 못한다

`TurnHudFrame` 등은 스타일 상수만 있고 `turn` 같은 값이 없다. 그래서 HUD 렌더러
3개가 값을 인스턴스 필드로 들고 있다 (`private turn` / `private count` /
`private energy`). Renderer가 상태를 가진 것은 설계 의도가 아니라 **값을 담을
자리가 없어서 생긴 결과**다.

> 참고: `userData`를 쓰는 렌더러 10개 이상 중 대부분은 씬 그래프 인덱스
> (`slotType` 태깅, `baseWidth` 원본 치수, 레이캐스트 `entityId`)이며 도메인
> 상태가 아니다. `MasterHpRendererV2.currentHp`는 텍스처 재로딩을 건너뛰기 위한
> dirty-check 캐시이고 hp는 매번 인자로 받으므로 위반이 아니다.

### 4. 카드 능력이 리스너 안에 인라인이다

카드를 추가할 때마다 mousedown 핸들러가 자란다. 카드 1장이 시나리오 3~4곳에
분기를 남긴다.

### 5. 데이터가 코드보다 앞서 있는데 코드가 쓰지 않는다

카드 데이터 스키마는 이미 선언적이다.

```
스킬1 데미지, 스킬2 데미지, 패시브1 데미지, 패시브2 데미지
스킬1 언데드필요에너지, 스킬1 휴먼필요에너지, 스킬1 트런트필요에너지
스킬2 언데드필요에너지, 스킬2 휴먼필요에너지, 스킬2 트런트필요에너지
```

종족별 에너지 비용까지 미리 설계되어 있다. 그런데 **시나리오 3,838줄에서 카드
데이터를 읽는 지점이 3곳뿐**이고, 나머지는 상수로 중복 정의되어 있다.

```ts
const NETHER_BLADE_PASSIVE_DAMAGE  = 10;   // 데이터: 패시브1 데미지 = 10
const NETHER_BLADE_PASSIVE2_DAMAGE = 20;   // 데이터: 패시브2 데미지 = 20
```

같은 값이 두 곳에 있다. 85장을 이 방식으로 진행하면 상수 170여 개가 데이터와
이중으로 존재하게 된다. **이 리팩토링의 진짜 목표는 카드당 비용을 "증가"에서
"상수"로 바꾸는 것**이며, 그 수단이 데이터 주도 능력 정의다 (5단계).

---

### 6. 서로 다른 책임이 전부 `repository`라는 한 이름 아래 있다

```
repository 폴더        179개
repository Impl        186개   ← 그중 THREE 객체를 담는 것 47개
getInstance 총 호출  1,559회
  ├ Repository를 constructor로 주입받는 곳     11
  └ RepositoryImpl.getInstance() 직접 호출    749      비율 68 : 1

영속성/네트워크 코드 사용 파일  3개
  texture_manager/TextureManager.ts, LegacyTextureManager.ts
  resouce_manager/ResourceManagerTest.ts
  → 전부 리소스(텍스처) 로딩. 도메인 상태를 저장하는 코드는 0개.
```

문제는 repository가 많다는 것 자체가 아니라, **책임이 다른 객체들이 모두
`repository`라는 이름 아래 묶여 있다**는 것이다. 지금 한 이름이 다음을 전부
가리킨다.

```
Persistence, Domain State, UI State, Runtime Resource, Cache, Singleton
```

그리고 **영속성 계층이 존재하지 않는다.** 186개 전부 in-memory Map이다.
"Repository = Aggregate의 영속성 접근을 추상화하는 인터페이스"라는 정의를
엄격히 적용하면 **현시점 이 코드베이스의 진짜 Repository는 0개**다.
추상화할 persistence가 아직 없기 때문이다.

폴더만 재배치하면 이 186개가 컨텍스트 아래로 그대로 따라간다. 책임을 분리하지
않으면 `Battle` 애그리게이트 도입이 상태 집을 줄이는 게 아니라 하나 더 늘린다.

### 7. 상태 전이가 연출과 뒤엉켜 재접속 복원이 불가능하다

시체 폭발은 투사체 5발이 날아가면서 **도착할 때마다** HP를 깎는다.

```ts
const onProjectileLand = (idx: number): void => {
    const prev = opponentHpState.get(pick.cardIndex) ?? 0;
    opponentHpState.set(pick.cardIndex, Math.max(0, prev - CORPSE_EXPLOSION_DAMAGE));
};
await corpseExplosionEffect.play(sacrificed.group, landingPos, projectileTargets,
                                 rendererManager.getDomElement(), onProjectileLand);
```

3발째에 사용자가 튕기면 **3발 적용, 2발 미적용, 연출 중단** 상태로 남는다.
재접속했을 때 나머지 2발을 다시 쏴야 하는지 이미 맞은 것인지 판정할 근거가 없다.

**연출 진행 중에 상태가 조금씩 바뀌는 구조는 재접속 복원과 근본적으로 양립하지
않는다.** 이 문제는 카드 능력 85장의 작성 방식을 규정하므로 구현 전에 확정해야 한다.

### 8. 도메인 식별자가 직렬화 불가능하다

```ts
const deployedTurn          = new Map<HandEntry, number>();               // :364
const placedCardEnergy      = new Map<HandEntry, Map<CardRace, number>>(); // :1827
const coldDarkEnergyHolders = new Set<HandEntry>();                        // :2147
```

객체 참조를 Domain Identity로 사용하는 현재 모델은 직렬화/복원에 부적합하다.
`EntityId` 승격은 단순한 serialization 대응이 아니라 **Domain Identity를 명시적으로
만드는 작업**이며, 그 결과로 직렬화 → 영속 → 재접속이 가능해진다.

### 9. 결정론이 우연히 성립하고 있다

```
시나리오 Math.random     4회 — 전부 피격 흔들림(연출)
animation/ Math.random 113회 — 전부 연출
도메인 계산 경로            0회
```

`resolve()` 경로가 현재 결정론적이지만 **우연이다.** 남은 85장에서 덱 셔플,
무작위 대상, 확률 발동이 등장하는 순간 조용히 깨지고, replay, 서버 검증,
재접속이 함께 무너지는데 증상이 보이지 않는다. 지금 규칙으로 못박아야 한다.

---

### 10. 의존 방향을 강제할 수단이 없다

eslint, dependency-cruiser 모두 미설치이고 `npm test`는 exit 1 스텁이다.
`tsc --noEmit`은 `battle/domain/`이 THREE를 import해도 통과시킨다. Frame 31개의
THREE import 0개가 지켜진 것은 순전히 규율 덕분인데, 폴더 재배치 중에는
규율만으로 부족하다.

---

## 목표 구조

### 최상위 — 5개 바운디드 컨텍스트 + 2개 지원 계층

```
src/
├── platform/          인프라. 도메인을 모른다
│   ├── core/          SceneManager, RendererManager, CameraManager, AnimationLoop
│   ├── three/         shape, mesh, neon*, lightning, clipping_mask_manager
│   ├── resource/      texture_manager, resouce_manager(오타 수정), audio
│   ├── input/         mouse, keyboard, drag_and_drop, *_click_detect 기반부
│   ├── layout/        window_size, window_scene, bound_manager, side_scroll*
│   └── app/           router, client, main
│
├── shared/
│   └── card_catalog/  ★ 불변 참조 데이터만. 모델 아님. THREE import 금지
│       ├── CardCatalog.ts    every_card_info.js 타입 안전 접근자
│       └── CardId.ts         식별자 타입
│
├── battle/            ★ 컨텍스트 1 — 전투
│   ├── domain/        Battle(애그리게이트 루트), EntityId, BattleUnit
│   │   ├── system/    DamageSystem, TurnSystem, StatusTickSystem
│   │   └── ability/   CardAbility + registry + 카드별 예외 규칙
│   │   ※ BattleRepository는 만들지 않는다 — 자리만 주석 표시
│   ├── field/ unit/ hand/ zone/ hud/ animation/ view/
│   └─ ※ 하위 feature는 store/, cache/ 만 가짐 (repository 금지)
│
├── deck/              ★ 컨텍스트 2 — 덱 편성 (현 122폴더)
│   ├── domain/        Deck (애그리게이트), DeckEntry (매수, 슬롯 제한)
│   └── list/ editor/ filter/ counter/ popup/
│
├── collection/        ★ 컨텍스트 3 — 내 카드 (현 19폴더)
│   ├── domain/        Collection (애그리게이트), OwnedCard (보유 수량)
│   └── grid/ detail/ filter/
│
├── shop/              ★ 컨텍스트 4
└── lobby/             ★ 컨텍스트 5

+ .dependency-cruiser.js    의존 방향 강제
```

### 바운디드 컨텍스트 분할의 근거

'카드'라는 단어가 컨텍스트마다 다른 것을 가리키며, 세 모델이 공유하는 필드가
사실상 없다.

```ts
// src/card/CardInitialInfoType.ts       — 렌더 정보
cardMesh: THREE.Mesh; initialPosition; textureId; width; height; cardIndex;
// src/my_deck_card/entity/MyDeckCard.ts — 덱 슬롯
id: number; mesh: THREE.Mesh; position: Vector2d;
// src/battle_field_unit/entity/BattleFieldUnit.ts — 전투 유닛
cardId; weaponId; hpId; energyId; raceId; harmfulEffectInfo; attachedEnergyInfo;
```

**`shared/card/`로 통합하지 않는다.** 세 컨텍스트를 모두 만족시키려는 공유 커널은
빈혈 모델이 되고, 위 두 모델이 이미 `THREE.Mesh`를 들고 있어 통합 시 모든
컨텍스트가 THREE에 묶인다. 공유하는 것은 **데이터(카탈로그)이지 모델이 아니다.**
각 컨텍스트는 `CardId`로 카탈로그를 조회해 자기 모델을 스스로 구성한다.

### 상태 5분류 — 무엇이 어디에 사는가

```
1. Reference Data     카드 정의 (공격력, 체력, 스킬 데미지, 필요 에너지)
                      └ 영속화 대상 아님 (배포 대상), 개발자 권위, 불변
                      └ shared/card_catalog/  — 읽기 전용, save() 없음

2. User State         덱 구성, 보유 카드 수량, 계정
                      └ 영속, 서버 권위
                      └ deck/domain/Deck, collection/domain/Collection + Repository

3. Battle State       HP, Energy, Turn, Unit, Status, Zone, 필드 배치
                      └ 재접속 복원 필요, 서버 권위
                      └ battle/domain/Battle (Aggregate) + BattleRepository

4. Runtime State      TargetingSession, interactionState, 선택 중인 카드, 팝업 페이지
                      └ 휘발, 재접속 시 초기화
                      └ <feature>/store/

5. Runtime Resource   Mesh, Texture, Material, Geometry
                      └ 재생성 가능, 저장 안 함
                      └ <feature>/cache/, 전역 공유는 platform/resource/
```

> **"Session State"라는 이름을 쓰지 않는다.** 웹에서 session은 연결 수명을 뜻해
> "접속이 끊기면 사라지는 상태"로 오독된다. 실제로는 사용자가 연결을 끊어도
> Battle은 계속 존재한다. **Network Session ≠ Battle Session**.

한 줄 정의:

```
Repository  Aggregate의 영속성 접근을 추상화하는 도메인 인터페이스
Store       애플리케이션 / 화면 / 런타임 상태를 보관하는 객체
Cache       다시 생성할 수 있는 런타임 자원을 재사용하기 위한 저장소
```

#### 판정 기준

```
Q0. 사용자 행동과 무관하게 고정된 게임 규칙인가?
        → 예: Reference Data (shared/card_catalog/)

Q1. 이것이 Domain의 진실인가?
      어떤 Aggregate의 상태이고, 그 Aggregate가 불변조건을 책임지는가?
      튕겼다가 다시 들어왔을 때 복원되어야 하는가?
        → 예: Aggregate의 상태로 둔다. Repository를 통해 영속화한다.

Q2. 실행 중인 애플리케이션 상태인가?  (영속 아님, 재생성도 불가)
      재접속 시 초기화해도 무방한가?
        → 예: Store

Q3. 삭제해도 다시 만들 수 있는 Runtime Resource인가?
        → 예: Cache
```

#### 적용 예

| 값 | 분류 | 위치 | 재접속 시 |
|---|---|---|---|
| 공격력, 체력, 스킬 데미지, 필요 에너지 | **Reference Data** | `shared/card_catalog/` | 재로딩 |
| 카드 보유 수량, 덱 구성 | **User State** | `collection/`, `deck/domain/` | 서버에서 복원 |
| HP 73, 턴 소유자, 빙결, 암흑 화염, 종족별 에너지, 필드 배치 | **Battle State** | `battle/domain/Battle.ts` | **복원** |
| `selectedAttackerEntry`, `interactionState`, 팝업 페이지 번호 | **Runtime State** | `battle/hud/targeting/store/` | **초기화(idle)** |
| `THREE.Mesh`, `Texture`, `Material`, `Geometry` | **Runtime Resource** | feature의 `cache/` | 재생성 |
| 전역 공유 텍스처, 오디오 | **Runtime Resource (전역)** | `platform/resource/` | 재생성 |

#### 배치 규칙 — 최상위 `stores/`, `cache/`를 두지 않는다

3분류는 **이름과 규칙으로** 구분하는 것이지 최상위 폴더로 가르는 것이 아니다.
최상위 `stores/`를 두면 배틀의 `TargetingSession`과 덱 편집의 `SelectionState`가
아무 관련 없이 같은 폴더에 놓여, **레이어 우선 배치로 회귀**한다. 지금 240개
flat 구조를 만든 힘과 같다.

```
battle/hud/targeting/store/          컨텍스트에 귀속
deck/editor/<feature>/cache/         그 feature의 메시만 담음
platform/resource/                   ★ 전역 공유 Cache만 최상위 (TextureManager)
```

#### Repository ≠ Singleton

`repository`라는 이름이 전역 싱글톤을 정당화해서는 안 된다. Repository도 일반적인
DI 대상이다.

```ts
class BattleService {
    constructor(private readonly battleRepository: BattleRepository) {}
}
```

단, 기존 749개 `getInstance` 호출을 전면 전환하지는 않는다 ([하지 않을 것] 참조).

#### 이름을 바꾸는 것이 아니라 책임을 이동시키는 것

```
현재                              개선 후
Repository                        Domain      └ Aggregate ─ (Repository) ─ Persistence
 ├ Battle State                   Application └ Store
 ├ UI State                       Runtime     └ Cache
 ├ Rendering Resource
 ├ Cache / Temporary State
 └ Singleton
```

`TurnStateRepository` → `TurnStateStore`로 개명하는 것만으로는 부족하다.
턴 소유자는 유닛 HP, 빙결과 같은 불변조건을 공유하므로 **`Battle` 애그리게이트의
필드로 흡수**되어야 한다. 전투 규칙도 함께 애그리게이트가 책임진다.

```ts
battle.startTurn();
battle.applyDamage(...);
battle.endTurn();
```

#### Repository 개수는 목표가 아니다

이 작업의 성공은 파일 개수로 판단하지 않는다. Aggregate마다 필요한 Repository를
둘 뿐이며, **개수 감소는 올바른 경계 설정의 결과**다. 개수를 목표로 삼으면 애매한
것을 전부 Store에 몰아넣어 숫자만 맞추게 된다.

### `frame/`, `input/` 흡수 규칙

| 현재 | 이동처 |
|---|---|
| `*_position/` 34개 | 소유 feature의 `frame/` (CLAUDE.md에 이미 명시된 방향) |
| `*_click_detect/` `*_hover_detect/` 38개 | 소유 feature의 `input/` |

feature 하나의 최종 형태:

```
<context>/<group>/<feature>/
├── entity/     순수 도메인
├── frame/      LayoutSpec(상수) + buildXFrame(state, layout)   ← *_position 흡수
├── renderer/   THREE 구성의 유일 지점
├── input/      클릭, 호버 감지                                 ← *_detect 흡수
├── store/      렌더 자원 캐시 (repository 아님)
└── service/    오케스트레이션
```

폴더 240개 → 약 90개. CLAUDE.md의 feature-per-directory는 유지되며, flat 배치가
컨텍스트 아래로 들어가고 부속 폴더가 본체로 접힐 뿐이다.

### 핵심 불변 규칙 — 상태 전이 파이프라인

> **Domain state transition은 presentation effect와 독립적이어야 한다.**

이 프로젝트의 최우선 불변 규칙이다. 모든 카드 능력, 공격, 스킬이 예외 없이
아래 순서를 따른다.

```
Command
   ↓
resolve      상태를 읽어 결과를 계산한다 (변경하지 않음)
   ↓
Events / Result
   ↓
apply        원자적으로 반영한다 — 상태 변경의 유일한 지점
   ↓
Persist / Synchronize
   ↓
Effect       이미 확정된 결과를 재생할 뿐. 중단돼도 상태와 무관
```

어느 시점에 크래시가 나도 **[명령 전] 아니면 [명령 후]** 두 상태만 존재한다.

#### 이 규칙이 여는 것

영속성만을 위한 것이 아니다. 아래가 전부 이 규칙 위에 성립한다.

```
재접속 복원, 서버 authoritative simulation, replay, undo/redo
deterministic simulation, spectator, event log, battle history, 테스트
```

특히 **테스트** — 브라우저 없이 카드 능력을 검증할 수 있는 유일한 경로다
(현재 `npm test`는 exit 1 스텁).

#### 타입으로 강제한다

규약만으로는 새어나간다. 피해 지점 9곳 중 2곳을 놓친 전력이 이미 있다
(진단 1). `resolve`에 읽기 전용 뷰를 넘겨 **컴파일 단계에서 막는다.**

```ts
// 읽기만 가능 — 카드가 상태를 바꾸려 하면 컴파일 실패
resolve(battle: ReadonlyBattle, cmd: Command): BattleEvent[];

// 변경은 여기 하나뿐
apply(events: readonly BattleEvent[]): void;
```

#### 결정론 규칙

```
battle/domain/** 에서 Math.random() 금지.
무작위가 필요하면 Command에 seed를 실어 보내고 도메인은 그 seed만 사용한다.
```

`dependency-cruiser` 규칙 4로 자동 검증한다 (0-1 참조). 현재 도메인 경로의
무작위성은 0회이므로 지금 못박으면 비용이 없다.

### 권한(Authority) 경계

Repository 인터페이스의 모양보다 중요한 질문은 **누가 Battle State를 변경할
권한을 갖는가**이다. 서버 authoritative 구조에서 클라이언트는 `save()`를
호출하지 않는다.

```
Client ─ Command ─→ Server ─ resolve → apply → persist ─ snapshot/event ─→ Client
```

`save()`를 클라이언트가 직접 호출하는지는 **지금 확정하지 않는다** — 서버
authoritative인지 local-first인지에 따라 Infrastructure에서 갈리는 부분이다.

**지금 확정하는 계약은 하나다:**

> Battle Aggregate의 확정된 상태를 Persistence / Synchronization 경계 밖으로
> 내보낼 수 있어야 한다.

### 스냅샷 명세

Domain 모델과 Persistence DTO를 분리한다. 애그리게이트의 내부 형태가 저장
포맷에 의해 동결되지 않도록 한다.

```ts
interface BattleSnapshot {
    schemaVersion: number;      // 스냅샷 구조 버전 — 마이그레이션용
    cardDataVersion: string;    // ★ Reference Data 버전 (아래 참조)
    battleId: BattleId;
    turn: { number: number; owner: TurnOwner };
    masters: { your: number; opponent: number };
    units: Array<{ id: EntityId; cardId: CardId; hp: number;
                   energyByRace: Record<CardRace, number>; deployedTurn: number }>;
    statuses: { darkFlame: EntityId[]; frozen: EntityId[]; freezeImmune: EntityId[];
                coldDarkCarrier: EntityId[] };
    field: { placedOrder: EntityId[]; hand: EntityId[]; deck: CardId[] };
    zones: { tomb: CardId[]; lostZone: CardId[] };
}
```

**저장하지 않는 것**

```
THREE.Mesh, Texture, Group        Runtime Resource — 재생성
진행 중이던 연출                     재접속 시 재생하지 않는다. 결과 상태만 그린다
interactionState, 선택 중인 카드     Runtime State — idle로 초기화
                                    (타이머 만료 시 "타겟팅 중이면 취소" 규칙과 동일 처리)
```

#### `cardDataVersion`이 필요한 이유

스냅샷은 `cardId`만 저장하고 카드 스펙은 Reference Data에서 읽는다. 그런데
Reference Data는 밸런스 패치로 변한다.

```
9/01  전투 시작.   네더 블레이드 패시브2 데미지 = 20
9/02  밸런스 패치.  패시브2 데미지 = 15
9/03  재접속 → 복원 → 어느 값으로 계속하는가?
```

| | 방식 | 대가 |
|---|---|---|
| (a) | 전투 시작 시점 스펙을 **pin** | 서버가 과거 카드 데이터 버전을 보관 |
| (b) | 패치 시 **진행 중 전투 무효화** | 구현 단순. 다수 모바일 TCG 방식 |

**지금 고르지 않는다. 다만 필드 자리는 지금 넣는다** — 나중에 추가하면 이미
저장된 v1 스냅샷에 그 정보가 없어 (a)를 선택할 수 없게 된다. 필드 하나 비용으로
선택지를 보존한다.

### EFR / ECS 적용 범위

| 요소 | 위치 | 채택 |
|---|---|---|
| EFR: Entity → Frame → Renderer | `<feature>/entity, frame, renderer` | **전면 채택** |
| ECS: Entity = 단일 ID | `battle/domain/EntityId.ts` | 채택 |
| ECS: Component = SoA 저장소 | `battle/domain/BattleState.ts` | 채택 |
| ECS: System = 로직 | `battle/domain/system/` | **이벤트 구동으로** 채택 |
| ECS: 매 틱 시스템 루프 | — | **미채택** |

TCG는 매 프레임 시뮬레이션이 없다 — 피해는 클릭 시점에 발생한다. 시스템을 60fps
루프로 돌 이유가 없으므로 이벤트 구동 함수로 둔다. `animationLoop.setCustomUpdate`는
연출 갱신 전용으로 유지한다.

---

## Success Criteria

### 0. 구조 신설 — 자리를 먼저 만든다

`BattleState.ts`가 갈 자리가 없으면 임시 위치에 놓이고 나중에 import 경로를
두 번 고치게 된다. **1단계보다 먼저 수행한다.**

#### 0-1. 의존 방향 강제 (폴더 이동 전)
- [x] `dependency-cruiser` 도입 + `npm run depcruise` 스크립트 → [R2-3](refactoring/R2-3-dependency-rules.md)
- [x] 규칙 1 — `battle/domain/**` → `three` 금지
- [x] 규칙 2 — `platform/**` → `battle|deck|collection|shop|lobby` 금지
- [x] 규칙 3 — 컨텍스트 간 직접 import 금지 (`battle/**` → `deck/**` 등)
- [x] 규칙 4 — `Math.random()`, `Date.now()` 금지 (결정론).
      **dependency-cruiser로는 구현 불가**하여 `scripts/check-domain-purity.js`로 분리
- [x] 규칙을 추가할 때는 **위반 프로브로 발화를 확인한다** —
      경로 미생성으로 인한 "통과"와 규칙 동작으로 인한 "통과"는 구분되지 않는다
      (R2-3에서 `domain-no-three`가 조용히 통과하던 결함을 이 방법으로 발견)
- [x] 테스트가 없는 상태에서 구조 위반을 잡을 **유일한 자동 수단**이므로
      폴더를 옮기기 전에 먼저 넣는다

#### 0-2. `battle/` 컨텍스트 신설
- [ ] `src/battle/` + `domain/`, `domain/system/`, `domain/ability/` 빈 자리 확보
- [ ] `battle_field_*`, `opponent_*`, `your_*` 31개 폴더를
      `field/ unit/ hand/ zone/ hud/ animation/ view/` 로 이동
- [ ] `first_skill/`, `second_skill/`, `general_attack/` → `domain/ability/` 흡수 대상 표시

#### 0-3. 책임 분류 적용 (battle 범위)

이름만 바꾸는 작업이 아니라 **책임을 올바른 경계로 이동**시키는 작업이다.
아래 a~f는 순서대로 수행한다.

- [ ] **0-3-a. 현재 `battle/` 구조 분석** — 하위 `repository/` 전수 목록화,
      각각이 담는 것을 Q1/Q2/Q3로 판정
- [ ] **0-3-b. `Battle` 애그리게이트 경계 확정** — 어떤 값들이 실제로 같은
      불변조건을 공유하는지 검증한다. "전투니까 하나"로 전제하지 않는다.
      예) `placedOrder`와 `opponentHpState`가 같은 경계인지 근거를 남긴다
- [ ] **0-3-c. 도메인 상태를 애그리게이트로 통합** — `TurnStateRepository`,
      상대 HP, 에너지, 상태이상을 `Battle`의 필드로 흡수 (1단계와 합류)
- [ ] **0-3-d. 가짜 repository를 Store / Cache로 분류** —
      `THREE.Mesh`, `Texture` 보관 → `cache/`, UI, 선택 상태 → `store/`
- [ ] **0-3-e. 신규 코드에만 DI 적용** — `Battle`은 생성자 주입으로 받는다.
      기존 `getInstance` 749곳은 건드리지 않는다
- [ ] **0-3-f. 권한 경계 표시** — `BattleRepository` 인터페이스는 3-3에서 정의한다.
      0단계에서는 `battle/domain/` 안에 persistence boundary 위치만 표시
- [ ] `opponent_field_crad_position`(오타) → `opponent_field_card_position`
- [ ] `resouce_manager`(오타) → `platform/resource/`

#### 0-4. 나머지 205개는 건드리지 않는다
- [ ] `platform/`, `shared/card_catalog/`는 **빈 껍데기 + 규칙 문서만** 생성
- [ ] `deck/`, `collection/`, `shop/`, `lobby/`는 해당 화면을 만질 때 이주
- [ ] `*_position` / `*_detect` 흡수도 그 feature를 만질 때 (touch-migrate)
- [ ] **새로 쓰는 코드는 예외 없이 새 구조에 넣는다** — 이게 깨지면
      구 구조 + 신 구조 + 예외로 세 번째 구조가 생긴다
      (`src/game/`에 `battle/`, `my_deck/` 컨트롤러가 있다가 멈춘 전례가 있음)

---

### 1. `Battle` 애그리게이트 추출 — 가장 큰 레버

#### 1-1. 저장소 이관
- [ ] 14개 Map/Set 중 도메인 저장소를 `src/battle/domain/Battle.ts`로 이동
      (`opponentHpState`, `opponentEnergyState`, `placedCardEnergy`, `deployedTurn`,
      `darkFlameTargets`, `frozenTargets`, `freezeImmuneTargets`, `coldDarkEnergyHolders`)
- [ ] 스칼라 도메인 값도 필드로 승격 (`opponentMasterHp`, `yourMasterHp`,
      `currentTurn`, 턴 소유권)
- [ ] `main()`은 `const state = new BattleState()` 한 줄로 대체

#### 1-2. 남길 것과 옮길 것의 구분
- [ ] **연출 상태는 이동하지 않는다** — 팝업 `THREE.Group` 핸들, 페이지 번호
      (`lostZonePage`, `tombPage`, `leonikPopupPage`), 텍스처 핸들,
      `leonikPulseRunning` 등은 시나리오에 남긴다
- [ ] `cardEnergyMeshes`(HandEntry → Mesh)는 렌더 자원이므로 제외
- [ ] `resolvingDepth` / `turnPassDeferred` / `passiveChainAborted`는 4단계에서 이동

#### 1-3. 순수성
- [ ] `Battle.ts`가 THREE를 import하지 않음 — `depcruise` 규칙 1로 자동 검증
- [ ] 브라우저 없이 import 가능해야 함 (도메인 테스트의 전제)

---

### 2. 엔티티 식별자 통합 — 영속성의 전제조건

객체 참조를 Domain Identity로 쓰는 현재 모델은 직렬화/복원이 불가능하다(진단 8).
**재접속 복원 요구로 인해 "나중에"가 아니라 1단계 직후로 승격된다.**

- [ ] `export type EntityId = number` — 아군/상대 공통 식별자
- [ ] `EntityRegistry`가 `HandEntry` / `cardIndex` → `EntityId` 매핑과
      `sideOf(id)`를 소유
- [ ] 덱 내 중복 `cardId`(8×3, 93×4 등) 때문에 `cardId` 키잉은 불가 —
      사본별 고유 ID를 발급해야 한다
- [ ] `Battle`의 모든 저장소 키를 `EntityId`로 통일 —
      `Map<HandEntry, …>` 3곳, `Set<HandEntry>` 1곳 제거
- [ ] 상태이상 저장소가 아군 유닛도 키잉 가능해짐 (상대 턴 로직의 선행 조건)
- [ ] `Battle`이 `JSON.stringify` 가능해지는 것을 검증 — 스냅샷의 전제

---

### 3. 상태 전이 파이프라인 — 피해 지점 9곳을 `apply` 1곳으로

핵심 불변 규칙(목표 구조 참조)을 실제 코드로 확정하는 단계. 카드 85장의 작성
방식이 여기서 결정되므로 5단계보다 먼저 확정한다.

#### 3-1. resolve → apply → effect 3분리

- [ ] `resolve(battle: ReadonlyBattle, cmd: Command): BattleEvent[]` — 계산만
- [ ] `apply(events: readonly BattleEvent[]): void` — **상태 변경의 유일한 지점**
- [ ] `effect.play(events)` — 확정된 결과 재생. 중단돼도 상태와 무관
- [ ] `ReadonlyBattle` 타입으로 카드가 상태를 못 바꾸게 **컴파일 단계에서 강제**
- [ ] `BattleEvent`에 `prevHp` / `newHp` / `lethal` / `appliedStatuses` 포함 —
      연출은 이 값을 보고 무엇을 재생할지 고른다

#### 3-2. 이관 대상

- [ ] 유닛 피해 9곳 전부 — 네더 블레이드 패시브 1, 2, 광역기, 단일 공격,
      파멸의 계약, 시체 폭발 포함
- [ ] **시체 폭발의 `onProjectileLand` 콜백 제거** — 5발분을 `resolve`에서 한 번에
      계산해 `apply` 후 연출에 넘긴다 (진단 7의 직접 원인)
- [ ] 상태이상 부여(`applyColdDarkTraits` 4곳)를 `resolve` 내부로 흡수
- [ ] 사망 판정과 정리 절차를 이벤트 기반으로 일원화
- [ ] 이관 후 `opponentHpState.set` 직접 호출이 0곳임을 grep으로 검증

#### 3-3. 경계 계약

- [ ] `apply()` 직후가 스냅샷 저장 지점임을 코드로 표시 (구현은 유예)
- [ ] `BattleRepository` 인터페이스 정의 — `findById`는 재접속 복원에 필수.
      `save` 호출 주체는 확정하지 않는다 (권한 경계 참조)

---

### 4. `TurnSystem`

- [ ] `endYourTurn` / `beginYourTurn` / `runResolving` / `withResolving`을 한 클래스로
- [ ] `resolvingDepth` / `turnPassDeferred` / `passiveChainAborted` 소유권 이전
- [ ] 타이머 만료 처리(`onExpire` → 즉시 패스 / 지연 패스 분기)를 포함
- [ ] 화상 정산(상대 턴 시작)과 빙결 해제(내 턴 시작) 순서를 시스템 내부에 고정
- [ ] 턴 흐름을 한 파일에서 읽을 수 있어야 함 — 지금은 3,838줄에 흩어져 있음

---

### 5. 카드 능력 — 데이터 주도 레지스트리

남은 85장을 감당하려면 카드당 비용이 **상수**여야 한다. 카드마다 코드를 쓰는
구조가 아니라, **데이터로 되는 것은 데이터로** 두고 코드는 데이터가 표현할 수
없는 것만 담당한다.

#### 5-1. 책임 분리

- [ ] **데이터에서 오는 것 — 카드별 코드 불필요**
      `스킬1/2 데미지`, `패시브1/2 데미지`, 종족별 필요 에너지,
      `공격력`, `체력`, `스킬 개수`
- [ ] **코드가 제공하는 것 — 카드별로 이것만 작성**
      ```ts
      interface CardAbility {
          targeting: TargetingKind;   // none | singleEnemy | allEnemy | ally | deckPick
          effect: EffectId;           // 재생할 연출
          special?: (ctx: AbilityContext) => Promise<void>;  // 예외 규칙만
      }
      ```
- [ ] 능력 없는 카드 = **코드 0줄**, 평범한 스킬 카드 = **3줄**,
      예외 규칙 보유 카드(레오닉 소환 / 시체 폭발 희생)만 별도 파일

#### 5-2. 상수 제거

- [ ] `NETHER_BLADE_PASSIVE_DAMAGE` / `NETHER_BLADE_PASSIVE2_DAMAGE` 등
      **데이터에 이미 있는 값의 하드코딩 상수를 전부 제거**하고 데이터를 읽는다
- [ ] 데이터에 없는 값(`SCYTHE_MYTHIC_DAMAGE` 30, `DOOM_CONTRACT_DAMAGE` 15,
      `CORPSE_EXPLOSION_DAMAGE` 10, `DARK_FLAME_TURN_DAMAGE` 5)은
      **데이터로 승격할지 코드에 남길지 카드별로 판정** — 진실의 원천은 하나여야 한다
- [ ] `every_card_info.js`의 한글 키를 타입 안전하게 읽는 접근자 정비
      (현재 `cardAny['스킬1 데미지']` 형태로 `any` 캐스팅 중)

#### 5-3. 배선

- [ ] `ABILITIES: Map<number, CardAbility>` 레지스트리
- [ ] mousedown 핸들러는 `ABILITIES.get(cardId)` 조회 + 실행으로 축소
- [ ] 에너지 비용 검사는 데이터의 종족별 필요 에너지에서 자동 유도
- [ ] `TargetingKind` / `EffectId`가 남은 85장을 덮는지 12장 기준으로 역검증

---

### 6. Frame 스냅샷화 + HUD 렌더러 무상태화

- [ ] `createDefault*Frame()` → `createDefault*Layout()` 개명 (26개 팩토리)
- [ ] `buildTurnHudFrame(state, layout)` 등 **엔티티/상태를 인자로 받는**
      순수 변환 함수 신설
- [ ] `TurnHudRendererV2.turn` / `FieldEnergyCountHudRendererV2.count` /
      `FieldEnergyHudRendererV2.energy` 인스턴스 필드 및 `setX()` 제거
- [ ] `build(frame)` 하나로 통일 — 상태는 전부 frame 경유
- [ ] 1단계의 `state`가 전제이므로 **마지막에 수행**

---

### 7. 검증

- [ ] 각 단계마다 `npx tsc --noEmit` 통과
- [ ] 각 단계마다 `npm run draw-field-energy-full-efr` 수동 체크리스트 —
      턴 넘김 / 드래그 배치 / 단일 공격 / 광역기 / 단일기 / 상태이상 / 본체 HP /
      타이머 만료 / 로스트존, 무덤 팝업
- [ ] 1, 3단계 완료 후 `BattleState`, `DamageSystem`에 대한 순수 도메인 테스트 추가
      (현재 `npm test`는 exit 1 스텁이며 브라우저 실행이 유일한 검증 수단)

#### 구조 판정 기준 — 파일 개수가 아니라 아래 6개 질문에 답할 수 있는가

- [ ] **1. Domain State** — 이 값은 어떤 Aggregate의 상태인가?
- [ ] **2. Invariant** — 이 값은 어떤 불변조건을 유지하기 위해 함께 변경되어야 하는가?
- [ ] **3. Persistence** — 이 값은 애플리케이션 종료 후에도 보존되어야 하는가?
- [ ] **4. Runtime Resource** — 이 객체는 삭제해도 다시 생성할 수 있는가?
- [ ] **5. Ownership** — 이 상태/자원의 lifecycle은 누가 책임지는가?
- [ ] **6. Network Boundary** — 서버와 동기화해야 할 Domain State의 경계는 어디인가?

---

## 하지 않을 것

- **`src/animation/` 13,542라인 분할** — 리프 노드이고 상호 의존이 없어 복잡도의
  원인이 아니다. `NetherBladeChargeVisual` 추출처럼 **중복이 실제로 발생했을 때만**
  쪼갠다.
- **ECS 전면 도입** — 1, 2, 3단계가 Component + System의 실질을 이미 가져온다.
  그 이상은 TCG에서 손해다. 카드 능력이 곧 도메인이라 "왜 존재하는가"가 흐려지면
  안 되며, 5단계의 `CardAbility`가 ECS의 System보다 이 도메인에 맞는다.
- **본편(`BattleFieldView`) 동시 이식** — 턴 상태 자체가 없는 상태
  (`handleTurnEndClick`이 빈 스텁)라, 파일럿에서 구조가 안정된 뒤 옮긴다.
- **`src/*/deprecated_*/` 정리** — 이 리팩토링 범위 밖.
- **`BattleRepository` 구현체 작성** — 인터페이스는 3-3에서 정의한다(재접속 복원에
  `findById`가 필수이므로 실재하는 추상화다). 다만 **구현은 유예**한다. 서버
  authoritative인지 local-first인지에 따라 Infrastructure가 갈리며, 그 결정은
  지금 필요하지 않다.
- **`save()` 호출 주체 확정** — 서버 authoritative면 클라이언트는 호출하지 않는다.
  지금 확정하는 계약은 **"확정된 상태를 Persistence/Synchronization 경계 밖으로
  내보낼 수 있어야 한다"** 하나뿐이다.
- **`cardDataVersion` 정책(pin vs 무효화) 결정** — 필드 자리만 지금 넣고 정책은
  서버 연동 시 결정한다.
- **기존 `getInstance` 749곳 전면 DI 전환** — 기능적 이득 0에 가장 큰 diff이며,
  검증 수단이 수동 실행뿐인 상태에서 위험이 이득을 넘는다. CLAUDE.md도
  *"Do not add new singletons"*이지 기존 제거를 요구하지 않는다.
  **신규 코드에만 DI 적용**, 기존은 touch-migrate.
- **최상위 `stores/`, `cache/` 폴더 신설** — Store, Cache를 컨텍스트에서 떼어내면
  레이어 우선 배치로 회귀한다. 전역 공유 Cache(`platform/resource/`)만 예외.

---

## 예상 결과

| | 현재 | 6단계 후 |
|---|---|---|
| 시나리오 라인 | 3,838 | 400 내외 (조립 + 리스너 배선) |
| `main()` 도메인 `let` | 53 중 다수 | 0 |
| 피해 적용 지점 | 9 | 1 |
| 엔티티 식별자 | 2종 | 1종 |
| 새 카드 추가 비용 | 리스너 수정 + 상수 정의 (170~500라인, 증가 추세) | 데이터 + 3줄 (상수) |
| 남은 85장 반영 시 예상 라인 | 16,000~28,000 | 증가 거의 없음 |
| 브라우저 없는 테스트 | 불가 | 도메인 전체 |
| 재접속 복원 | 불가 (객체 참조 키, 연출 중 상태 변경) | 스냅샷 복원 |
| 크래시 시점의 상태 | 연출 진행도에 따라 부분 적용 | 명령 전 / 명령 후 둘 중 하나 |
| 서버 authoritative 이관 | 전투 로직 이중 구현 | `resolve`만 교체 |

1→2→3까지만으로 체감 개선의 대부분이 확보된다. 4, 5, 6은 다음 기능이 요구할 때
수행해도 늦지 않다.

---

## Todo

1. **0단계 — 구조 신설** (최우선, 나머지 전부의 전제)
   - [ ] `dependency-cruiser` + 의존 방향 4개 규칙(결정론 포함)을 **폴더 이동 전에** 도입
   - [ ] `src/battle/` 신설, 31개 폴더 이동, `domain/` 빈 자리 확보
   - [ ] `battle/` 하위 `repository/`를 Q0~Q3로 판정해 `store/`, `cache/`로 분류

2. **1→2단계 — `Battle` 애그리게이트 + `EntityId`** (연속 수행)
   - [ ] `let` 53개를 5분류(Reference / User / Battle / Runtime State / Resource)로 판정
   - [ ] `battle/domain/Battle.ts`에 Battle State 이관 —
         0-3-b에서 확정한 불변조건 경계를 근거로
   - [ ] `Map<HandEntry,…>` 3곳, `Set<HandEntry>` 1곳 제거 후
         `JSON.stringify(battle)` 가능함을 검증 — 스냅샷의 전제

3. **3단계 — `resolve → apply → effect`** (85장 착수 전 필수)
   - [ ] `ReadonlyBattle` 타입으로 카드의 상태 변경을 컴파일 단계에서 차단
   - [ ] 시체 폭발 `onProjectileLand` 콜백 제거 — 5발분 일괄 계산 후 `apply`
   - [ ] 피해 지점 9곳 이관, `opponentHpState.set` 직접 호출 0곳 검증
   - [ ] `BattleRepository` 인터페이스 정의 (구현은 유예), 스냅샷 저장 지점 표시

4. **5단계 — 데이터 주도 능력 정의** (카드당 비용을 상수로)
   - [ ] 구현된 12장을 `targeting` / `effect` / `special` 3필드로 역분해
   - [ ] 하드코딩 데미지 상수를 데이터 존재 여부로 분류 — 진실의 원천 단일화
   - [ ] `shared/card_catalog/` 타입 안전 접근자 구축 (`any` 캐스팅 제거)

5. **후속 — 4, 6단계 및 잔여 컨텍스트**
   - [ ] `collection/domain/Collection` 통합 — 보유 수량 3곳
         (`NumberOfOwnedCards`, `MyDeckOwnedCards`, `MyDeckTotalOwnedCards`)
   - [ ] 4단계 `TurnSystem`, 6단계 Frame 스냅샷은 해당 영역을 만질 때
   - [ ] `deck/` 122개, `collection/` 19개는 그 화면 작업 시 이주
   - [ ] `npm test` exit 1 스텁 — 순수 도메인 테스트 러너 도입 여부 결정
