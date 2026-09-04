# [ETWGL-R2-24] 전투 재접속 / 재시작 시 유지할 파트 판정

선행: R2-22 │ 후행: R2-49 │ 산출물: 이 문서 (판정표) │ Type: Strategy │ Domain: Battle

# Success criteria

1. 왜 하는지와 어디까지 할지를 정한다
    - 문제
        - 이름이 전부 Repository 인데 담는 것이 제각각이다. 전투 범위만 43개다
        - 어떤 것은 재접속해도 남아야 하고, 어떤 것은 화면을 다시 그리면 되고, 어떤 것은 지워도 다시 만들 수 있다
        - 그래서 새 카드의 상태가 생겼을 때 어디에 둘지 매번 다르게 판단하게 된다
    - 목적
        - 43개가 각각 재접속과 재시작 때 어떻게 되어야 하는지 정한다
    - 기대 결과
        - 새 카드를 만들 때 그 카드의 상태를 어디에 둘지 이 판정을 보고 정한다
    - 이번에 하는 것
        - 판정만 한다. 코드는 한 줄도 바꾸지 않는다
    - 건드리지 않는 것
        - 개명 - 판정이 끝난 뒤 따로 한다. 흐름 8 에 시점을 적었다
        - 덱 편성, 보유 카드, 상점 화면의 저장소 334개 - 전투가 아니다. 전투가 끝난 뒤 같은 기준으로 본다

2. 무엇을 담는지 확인한다
    - 이름이 아니라 담는 값을 본다. 저장소가 가리키는 엔티티까지 열어 본다
    - THREE 객체를 담으면 화면 자원이다. 엔티티 안에 있어도 화면 자원이다
    - 담는 것이 없고 판정만 하는 것은 저장소가 아니다

3. 가르는 기준을 정한다
    - 계획서의 기준을 그대로 쓴다
    - 재접속했을 때 복원되어야 하는가 - 애그리게이트의 상태다. 전투가 통째로 복원한다
    - 재시작하면 초기화해도 되는가 - Store 다
    - 지워도 다시 만들 수 있는 화면 자원인가 - Cache 다

4. 애그리게이트로 흡수 (14개)
    - 재접속하면 복원되어야 하는 값이다. 개명하지 않는다. R2-49 에서 전투 안으로 들어간다
    - 덱이 특히 그렇다. shuffle 과 drawCard 가 있어서, 섞인 순서가 복원되지 않으면 재접속 뒤 다른 카드가 뽑힌다

| 저장소 | 담는 것 | 도메인 |
| --- | --- | --- |
| TurnStateRepository | 누구 턴인가 | Battle Turn |
| YourDeckRepository | 덱에 남은 카드와 그 순서 | Battle Deck |
| OpponentDeckRepository | 상대 덱에 남은 카드 | Battle Deck |
| YourTombRepository | 무덤에 간 카드 | Battle Tomb |
| OpponentTombRepository | 상대 무덤에 간 카드 | Battle Tomb |
| YourLostZoneRepository | 로스트 존에 간 카드 | Battle LostZone |
| OpponentLostZoneRepository | 상대 로스트 존에 간 카드 | Battle LostZone |
| BattleFieldHandRepository (battle/hand) | 손패에 든 카드 | Battle Hand |
| BattleFieldHandMapRepository | 손패 카드 번호 목록 | Battle Hand |
| BattleFieldUnitRepository | 필드에 나온 유닛 | Battle Unit |
| YourFieldRepository | 내 필드에 놓인 카드 | Battle Field |
| OpponentFieldRepository | 상대 필드에 놓인 카드 | Battle Field |
| YourFieldMapRepository | 몇 번 칸에 몇 번 카드인가 | Battle Field |
| OpponentFieldMapRepository | 상대 쪽 칸 배치 | Battle Field |

5. Cache — 지워도 다시 만들 수 있는 화면 자원 (11개)
    - THREE 객체를 담는다. 재접속하면 다시 만들면 된다
    - 개명 대상이다

| 저장소 | 담는 것 | 도메인 |
| --- | --- | --- |
| ActivePanelAreaRepository | 버튼 메시, 장면, 카메라 | Battle Active Panel |
| BattleFieldHandPageRepository | 페이지 넘김 버튼 메시 | Battle Hand |
| YourFieldAreaRepository | 카드를 놓는 구역 메시 | Battle Field |
| OpponentFieldAreaRepository | 상대 구역 메시 | Battle Field |
| YourFieldCardSceneRepository | 필드 카드의 화면 덩어리 | Battle Field |
| OpponentFieldCardSceneRepository | 상대 필드 카드의 화면 덩어리 | Battle Field |
| BattleFieldCardSceneRepository | 카드의 화면 덩어리 (손패와 필드 공용) | Battle 공용 |
| BattleFieldCardAttributeMarkSceneRepository | 속성 표시의 화면 덩어리 | Battle 공용 |
| OpponentFieldCardAttributeMarkSceneRepository | 상대 속성 표시의 화면 덩어리 | Battle Field |
| NeonBorderLineSceneRepository | 테두리 선의 화면 덩어리 | Battle 공용 |
| BattleFieldBackgroundRepository | 배경 | Battle |

6. Store — 실행 중 화면 상태 (14개)
    - 재접속 시 초기화해도 무방하다
    - 개명 대상이다
    - 클릭 판정 셋은 저장소가 아니라 판정 함수다. isOpponentMasterClicked 하나뿐이고 담는 것이 없다. 개명할 때 저장소에서 빼낸다

| 저장소 | 담는 것 | 도메인 |
| --- | --- | --- |
| YourFieldCardPositionRepository | 필드 카드가 화면 어디에 있나 | Battle Field |
| OpponentFieldCardPositionRepository | 상대 필드 카드 자리 | Battle Field |
| BattleFieldHandCardPositionRepository | 손패 카드 자리 | Battle 공용 |
| BattleFieldCardAttributeMarkPositionRepository | 속성 표시 자리 | Battle 공용 |
| OpponentFieldCardAttributeMarkPositionRepository | 상대 속성 표시 자리 | Battle Field |
| NeonBorderLinePositionRepository | 테두리 선 자리 | Battle 공용 |
| BattleFieldCardAttributeMarkRepository | 어느 카드에 어떤 표시가 붙었나 | Battle 공용 |
| OpponentFieldCardAttributeMarkRepository | 상대 쪽 같은 것 | Battle Field |
| NeonBorderRepository | 어느 카드에 테두리가 켜졌나 | Battle 공용 |
| DragMoveRepository | 지금 끌고 있는 것 | Battle 공용 |
| MouseDropRepository | 놓은 자리가 필드 안인지 판정 | Battle 공용 |
| LeftClickHandDetectRepository | 손패 클릭 판정 | Battle Hand |
| LeftClickYourFieldDetectRepository | 내 필드 클릭 판정 | Battle Field |
| LeftClickOpponentMasterDetectRepository | 상대 본체 클릭 판정 | Battle 공용 |

7. 폐기 대상 (4개)
    - 이름이 죽었다고 되어 있는데 실제로는 쓰이고 있다
    - 처지를 정한 뒤에 본다

| 저장소 | 사정 |
| --- | --- |
| battle_field_hand/deprecated_repository/BattleFieldHandRepository | 이름은 죽었는데 본편과 시나리오가 쓴다. R2-38 |
| battle_field_hand/deprecated_repository/BattleFieldHandPositionRepository | 같음 |
| battle_field_hand/deprecated_repository/BattleFieldHandSceneRepository | 같음 |
| deprecated_battle_field_card/BattleFieldCardRepository | CLAUDE.md 가 확장 금지로 지정 |

8. 개명을 언제 할지 정한다
    - 애그리게이트로 흡수될 14개는 개명하지 않는다. R2-49 에서 사라지므로 두 번 일하게 된다
    - Cache 11개와 Store 14개는 개명한다. 흡수와 무관해서 판정 직후에 해도 된다
    - 폐기 대상 4개는 R2-38 에서 처지를 정한 뒤에 본다
    - 손패와 필드가 함께 쓰는 11개는 자리가 아직 안 정해졌다. R2-34, R2-35 뒤로 미룬다. 먼저 개명하면 부르는 곳을 두 번 고친다
    - 개명 티켓은 표의 도메인 칸을 그대로 써서 도메인별로 나눈다

9. 게임 동작이 달라지지 않는다
    - 코드를 한 줄도 바꾸지 않았으므로 달라질 수 없다
    - 실제로 바뀌는 것은 개명 티켓과 R2-45 부터다

# To-do

1. 왜 하는지와 범위를 적는다
    - [x] 문제, 목적, 기대 결과 작성
    - [x] 전투 밖 저장소 334개를 범위 밖으로 명시

2. 무엇을 담는지 확인한다
    - [x] 43개의 메서드와 담는 형 확인
    - [x] 엔티티까지 열어 THREE 객체를 담는지 확인
    - [x] 담는 것 없이 판정만 하는 것 가려내기

3. 세 갈래로 가른다
    - [x] 애그리게이트로 흡수할 14개
    - [x] Cache 11개
    - [x] Store 14개
    - [x] 폐기 대상 4개

4. 개명 시점을 정한다
    - [x] 흡수될 것은 개명하지 않는다고 명시
    - [x] 손패와 필드가 함께 쓰는 11개를 뒤로 미루는 사유 작성

5. 다음 작업이 쓸 수 있게 한다
    - [x] 개명 티켓을 도메인별로 등록 (R2-25 부터 R2-45)
    - [x] 코드를 바꾸지 않았으므로 동작 확인이 필요 없음

# Issue

1. 클릭 판정 셋은 저장소가 아니었다
    - 증상
        - LeftClickOpponentMasterDetectRepository 에 메서드가 하나뿐이고 담는 것이 없다. `isOpponentMasterClicked(point): boolean`
    - 원인
        - 이 저장소에서는 [무엇이든 담는 것] 에 Repository 를 붙여 왔다. 담지 않는 것에도 붙었다
    - 처리
        - Store 로 분류하되 개명할 때 저장소에서 빼낸다고 적었다
        - **담는 것이 없으면 저장소가 아니다.** 메서드가 판정 하나뿐이면 함수다

2. 이름이 같은 저장소가 두 개다
    - 증상
        - BattleFieldHandRepository 가 battle/hand/repository 와 battle_field_hand/deprecated_repository 양쪽에 있다
    - 원인
        - 새것으로 갈아타면서 옛것을 지우지 않고 폴더 이름만 바꿨다
    - 처리
        - 표에 폴더까지 적어 구분했다
        - **이름만으로 가리키지 않는다.** 같은 이름이 두 곳에 있다

# Review

| 항목 | 값 | 판단 |
| --- | --- | --- |
| 판정한 저장소 | 43개 | 전투 범위만이다 |
| 애그리게이트로 흡수 | 14개 | 재접속 복원 대상 |
| Cache | 11개 | THREE 객체를 담는다 |
| Store | 14개 | 자리, 표시 상태, 입력 판정 |
| 폐기 대상 | 4개 | |
| 코드 변경 | 없음 | 판정만 했다 |

| 구분 | 내용 |
| --- | --- |
| **잘 맞은 것** | 개명과 판정을 갈랐다. 흡수될 14개를 먼저 개명했으면 R2-49 에서 지우면서 두 번 일했을 것이다. |
| **잘 맞은 것** | 이름이 아니라 담는 값으로 판정했다. 이름은 43개가 전부 Repository 다. |
| **미흡한 것** | [Battle 공용] 8개는 자리가 아직 안 정해졌다. 개명 시점을 R2-34, R2-35 뒤로 미뤄야 한다. |
| **다음 작업에 넘길 것** | 개명은 R2-25 에서 약속을 정한 뒤 도메인별로 한다. R2-26 부터 R2-36. |
| **다음 작업에 넘길 것** | 만든 약속을 실제로 부르는 것은 R2-45 다. 지금 부르면 아직 쓰고 있는 것을 버릴 수 있다. |
| **다음 작업에 넘길 것** | 덱 편성, 보유 카드, 상점의 저장소 334개. 전투가 끝난 뒤 같은 기준으로 본다. |
