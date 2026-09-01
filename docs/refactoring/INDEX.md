# R2 리팩토링 작업 목록

> 언제 여는가: 다음에 무엇을 할지 정할 때. 남은 작업과 순서를 본다.

배틀 필드 구조 리팩토링(`ETWGL-R2-*`)의 번호 할당표다.
번호는 **계획 시점에 예약하며 재번호하지 않는다** (규칙 7).

- 작성 규칙, [RULES.md](RULES.md)
- 템플릿, [_TEMPLATE.md](_TEMPLATE.md)
- 동작 확인 목록, [BEHAVIOR_CHECK.md](BEHAVIOR_CHECK.md)
- 배경 및 근거, [리팩토링 계획서](../battle_field_refactoring_plan.md)

---

## 왜 이 작업을 하는가 (한 문단 요약)

카드 데이터 100장 중 개별 구현이 필요한 것이 97장인데 **12장만 완료**되었다.
남은 85장을 현재 구조로 진행하면 시나리오 파일이 16,000~28,000라인이 된다
(현재 3,838라인, 카드 1장당 170~500라인이며 증가 추세).
**카드당 비용을 "증가"에서 "상수"로 바꾸는 것**이 이 리팩토링의 목표다.

---

## 작업 목록

| 번호 | Type | Domain | 제목 | 선행 | 상태 |
|---|---|---|---|---|---|
| **R2-1** | Strategy | Battle | [리팩토링을 왜 어떻게 할지 판단할 수 있도록 현황 분석과 계획 문서화](R2-1-refactoring-plan.md) | — | **완료** |
| **R2-2** | Documentation | — | [작업의 목적과 범위를 나중에도 확인할 수 있도록 백로그 규칙과 템플릿 수립](R2-2-backlog-rules.md) | R2-1 | **완료** |
| **R2-3** | Tooling | — | [폴더 구조를 바꿔도 잘못된 의존이 자동으로 발견되도록 의존성 검사 도입](R2-3-dependency-rules.md) | R2-2 | **완료** |
| **R2-4** | Documentation | — | [새 작업을 시작하고 끝낼 때 무엇을 보고 판단할지 정하는 프로세스 구축](R2-4-backlog-process.md) | R2-2 | 예정 |
| **R2-5** | Strategy | Battle | [battle 폴더와 하위 카테고리를 만들어 리팩토링 시 이동할 장소 결정 전략 수립](R2-5-battle-migration-map.md) | R2-3 | **완료** |
| **R2-6** | Structure | Battle Tomb, LostZone | [무덤과 로스트존 네 폴더를 옮겨 리팩토링 효과가 존재하는지 검증](R2-6-move-zone-folders.md) | R2-5 | **완료** |
| **R2-7** | Strategy | Battle | [비슷해 보이는 코드를 합칠지 나눌지 판단하는 기준 수립](R2-7-merge-or-split.md) | R2-6 | **완료** |
| **R2-8** | Structure | Battle Tomb, LostZone | [무덤과 로스트존 화면을 바꿀 때 한 곳만 고치도록 두 개의 그리는 작업을 하나로 통합한다](R2-8-merge-zone-renderers.md) | R2-7 | **폐기** |
| **R2-9** | Structure | Battle 공용 | [Popup 노출 시 카드 배치 격자의 사용 용도를 파악할 수 있도록 재배치](R2-9-card-grid-popup.md) | R2-7 | **완료** |
| **R2-10** | Structure | Battle Deck | [Your / Opponent Deck 패키지 조정](R2-10-move-deck-folders.md) | R2-9 | **완료** |
| **R2-11** | Structure | Battle Active Panel | [액티브 패널의 공격 / 스킬1 / 스킬2 버튼 동작 패키지 조정](R2-11-move-card-actions.md) | R2-10 | **완료** |
| **R2-12** | Structure | Battle Active Panel | [스킬 슬롯이 어느 효과를 부를지 고르는 배선 패키지 조정](R2-12-move-skill-effect-dispatch.md) | R2-11 | **완료** |
| **R2-13** | Structure | Battle Animation | [쓰지 않는 스킬 애니메이션 세 개를 옮길지 지울지 판단](R2-13-discarded-dead-animations.md) | R2-11 | **폐기** |
| **R2-14** | Structure | Battle Active Panel | [액티브 패널 영역과 패널 움직임 패키지 조정](R2-14-move-active-panel.md) | R2-12 | **완료** |
| **R2-15** | Structure | Battle Animation | [스킬 연출 패키지 조정](R2-15-move-skill-playback.md) | R2-14 | **완료** |
| **R2-16** | Structure | Battle Turn | [턴 소유, 턴 표시, 턴 종료 버튼 패키지 조정](R2-16-move-turn.md) | R2-15 | **완료** |
| **R2-17** | Structure | Battle Field Energy | [내 필드 에너지, 상대 필드 에너지 패키지 조정](R2-17-move-field-energy.md) | R2-16 | **완료** |
| **R2-18** | Structure | Battle Animation | [일반 공격 연출 패키지 조정 (검, 지팡이)](R2-18-move-general-attack.md) | R2-30 | **완료** |
| **R2-19** | Structure | Battle | [전투 화면 중 사용되지 않는 파일 삭제](R2-19-delete-unused-battle-view.md) | R2-18 | **완료** |
| **R2-20** | Structure | Battle Hand | [손패 패키지 조정 (두 폴더, 20파일)](R2-20-move-hand.md) | R2-19 | **완료** |
| **R2-21** | Structure | Battle | 유닛과 상태 표시 패키지 조정 (여덟 폴더, 35파일) | R2-20 | 예정 |
| **R2-22** | Structure | Battle | 카드를 놓는 자리와 좌표 패키지 조정 (열 폴더, 41파일) | R2-21 | 예정 |
| **R2-23** | Structure | Battle | 새 데이터를 어디에 둘지 일관되게 판단할 수 있도록 저장소 책임 분류 | R2-22 | 예정 |
| **R2-24** | Rule | Battle | 전투 상태를 하나의 일관된 단위로 관리하도록 Battle 애그리게이트 추출 | R2-23 | 예정 |
| **R2-25** | Rule | Battle | 재접속 시 어떤 유닛의 상태를 복원할지 식별할 수 있도록 식별자 통합 | R2-24 | 예정 |
| **R2-26** | Rule | Battle | 연출 도중 종료되어도 전투 상태가 일관되도록 처리 순서 분리 | R2-25 | 예정 |
| **R2-27** | Rule | Battle | 카드를 추가할 때 코드 수정 없이 데이터로 정의할 수 있도록 능력 정의 구조 도입 | R2-26 | 예정 |
| **R2-28** | Rule | Battle | 턴 진행 규칙을 한 곳에서 읽을 수 있도록 TurnSystem 추출 | R2-24 | 예정 |
| **R2-29** | Rendering | Battle | 화면이 상태를 직접 관리하지 않고 표시만 하도록 HUD 렌더러 정리 | R2-24 | 예정 |
| **R2-30** | Structure | Battle Animation | [스킬 자리 좌표를 한 곳에서 읽게 한다](R2-30-share-skill-slot.md) | R2-17 | **완료** |
| **R2-31** | Structure | Battle Animation | 유닛 카드 등장 연출 패키지 조정 (19 네더 블레이드) | R2-18 | 예정 |
| **R2-32** | Structure | Battle Animation | 유닛 카드 스킬 연출 패키지 조정 (19 네더 블레이드, 27 벨른) | R2-31 | 예정 |
| **R2-33** | Structure | Battle Animation | 아이템 카드 연출 패키지 조정 (죽음의 낫 외 다섯 장) | R2-32 | 예정 |
| **R2-34** | Structure | Battle Animation | 서포트, 에너지 카드 연출 패키지 조정 (넘쳐흐르는 사기 외 세 장) | R2-33 | 예정 |
| **R2-35** | Rendering | Battle Animation | 카드를 스킬 자리로 옮기는 네 벌의 코드를 한 벌로 모은다 | R2-34 | 예정 |
| **R2-36** | Rule | Battle Animation | 덱 편성 화면이 전투 연출을 만들지 않도록 AnimationHandler 정리 | R2-35 | 예정 |
| **R2-37** | Structure | Battle | 전투 화면 조립 패키지 조정 (실제로 도는 두 화면) | R2-19 | 예정 |
| **R2-38** | Structure | Battle | 전투 배경 패키지 조정 (배경 다섯 파일) | R2-37 | 예정 |
| **R2-39** | Rule | Lobby | 로비의 게임 입장 버튼이 눌리도록 등록되지 않은 경로 정리 | — | 예정 |
| **R2-40** | Structure | Battle | 필드 카드 자리와 장면 패키지 조정 | R2-22 | 예정 |
| **R2-41** | Structure | Battle | 손패와 필드 정렬을 갈라 각자 자리로 보낸다 | R2-40 | 예정 |
| **R2-42** | Strategy | Battle | 이름만 deprecated 인 저장소 세 개의 처지 결정 | — | 예정 |

### Type — 무엇을 바꾸는 작업인가

| Type | 무엇을 바꾼다 | 코드 변경 | 동작 확인 |
|---|---|---|---|
| Strategy | 무엇을 어떤 순서로 할지의 판단. 계획과 기준 | 없음 | 필요 없음 |
| Documentation | 문서와 일하는 방식. 백로그 형식, 작업 절차 | 없음 | 필요 없음 |
| Tooling | 개발 도구와 그 의존성. 검사, 스크립트 | 도구만 | 필요 없음 |
| Structure | 폴더와 모듈의 배치. 위치와 이름 | 위치와 경로 | 관련 항목만 |
| Rule | 전투 규칙과 상태. 계산과 판정 | 로직 | 전 항목 |
| Rendering | 화면에 무엇을 어떻게 그리는가 | 표시 방식 | 전 항목 |

### Domain — 무엇을 건드리는 작업인가

**Domain 은 규칙이 다른 단위다.** 무엇이 다른 이유로 바뀌는가로 나눈다.

| Domain | 무엇 |
|---|---|
| Battle Deck | 전투 중 뽑는 더미. 순서가 있고 내가 순서를 못 정한다 |
| Battle Tomb | 쌓이는 곳. **부활할 수 있다** |
| Battle LostZone | 쌓이는 곳. **부활할 수 없다.** 특수 수단으로만 회수 |
| Battle 〈나머지〉 | field, unit, hand, hud, ability, animation, view 안의 도메인은 그 카테고리를 옮길 때 정한다 |
| Battle 공용 | 여러 도메인이 함께 쓰는 것 |
| Deck | 덱을 짜는 화면. 전투 중의 덱과 제어 방식이 정반대다 |
| Collection | 보유 카드 |
| Shop, Lobby | |
| — | 특정 도메인에 속하지 않는다. 문서, 도구, 작업 방식 |

> **카테고리와 도메인은 다르다.** 카테고리는 `battle/` 아래 폴더로 찾기 위한 묶음이고,
> 도메인은 규칙이 다른 단위다. 한 카테고리 안에 도메인이 여럿일 수 있다.
> `zone/` 안에 Deck, Tomb, LostZone 셋이 있다.

> 과거에는 폴더 240개가 각각 도메인처럼 최상위에 나란히 있었다.
> 지금 하는 일은 그것들을 카테고리로 묶는 것이다.

> Battle 의 도메인 객체는 R2-24 에서 처음 만들어진다. 지금 `entity/` 190개 중
> 대부분이 화면 객체와 좌표를 담고 있다.

> Type 과 Domain 을 한 칸에 두면 설계가 흐려진다.
> [무엇을 바꾸는 작업인가] 와 [어느 영역인가] 는 서로 다른 질문이다.

> Strategy 와 Structure 는 짝을 이룬다. Strategy 에서 정하고 Structure 에서 실행한다.
> R2-5 가 어디로 옮길지 정하면 R2-8 이 옮기고, R2-7 이 합칠지 나눌지 정하면 그 결과가 R2-8 에 반영된다.

> Tooling 은 지금 한 건이지만, 셰이더 검사기(R2-3 To-do)와
> 순수 도메인 테스트 러너(R2-1 To-do)가 같은 갈래로 들어온다.

> **R2-6 은 R2-5 보다 먼저 끝났다.** 목적지가 목표 구조에서 이미 정해져 있어
> 계획 문서 없이도 진행할 수 있었다. R2-5 는 나머지 34개 폴더를 위해 여전히 필요하다.

> **R2-10 의 묶음 수는 아직 정하지 않는다.** R2-6 에서 폴더 이동만으로는 고칠 곳이
> 줄지 않는다는 결과가 나왔고, R2-7 에서 합칠 것도 없다는 결론이 나올 예정이다.
> 둘을 합쳐 판단한 뒤에 나눈다.

---

## 의존 순서

```
R2-1  현황 분석, 계획          무엇을 왜 고칠지 확정
  ▼
R2-2  백로그 규칙, 템플릿      작업을 추적 가능하게
  │
  ├──▶ R2-3  의존성 자동 검사   ★ 코드 작업의 검증 수단. 폴더를 옮기기 전에
  │      ▼
  └──▶ R2-4  작업 프로세스      시작과 완료 판단 기준. 독립 진행 가능
         ▼
R2-5  battle 컨텍스트 분리
  ▼
R2-6  저장소 책임 분류
  ▼
R2-7  Battle 애그리관문
  │
  ├──▶ R2-8  식별자 통합 ──▶ R2-9  처리 순서 분리 ──▶ R2-10  카드 능력 정의
  │        (영속성 전제)        (85장 계약 확정)          (85장 착수 가능)
  │
  ├──▶ R2-11  TurnSystem          독립. 필요할 때
  └──▶ R2-12  HUD 렌더러 정리     독립. 필요할 때
```

**R2-3 → R2-10 이 가장 오래 걸리는 경로다.** R2-11, R2-12 는 R2-7 이후 언제든 가능하며,
해당 영역을 손볼 때 수행한다.

---

## 중단해도 되는 지점

리팩토링을 도중에 멈춰야 한다면 아래가 안전한 정지점이다.

| 정지점 | 상태 |
|---|---|
| R2-6 완료 후 | 구조는 정리됨. 카드 추가 비용은 그대로 |
| **R2-9 완료 후** | **체감 개선의 대부분 확보.** 85장을 시작해도 됨 |
| R2-10 완료 후 | 카드당 비용이 상수로 수렴 |

---

## 범위 밖 (R2에서 하지 않음)

| 대상 | 사유 |
|---|---|
| `deck/` 122폴더, `collection/` 19폴더 | 덱/컬렉션 화면을 손볼 때 touch-migrate |
| `src/animation/` 14파일 13,542라인 | 다른 곳이 참조하지 않는 끝단이고 상호 의존이 없어 복잡도의 원인이 아님 |
| 기존 `getInstance` 749곳 | 기능적 이득 0에 최대 diff. 신규 코드만 DI |
| `BattleRepository` 구현체 | 서버 authoritative / local-first 결정 전. 인터페이스만 |
| `src/*/deprecated_*/` | 이 리팩토링 범위 밖 |
