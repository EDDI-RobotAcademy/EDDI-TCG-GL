# 전투 폴더 이동 계획표

> 언제 여는가: 전투 폴더를 옮기기 전에. 무엇이 남았고 어디로 가는지 본다.
> 만든 작업: [ETWGL-R2-5](refactoring/R2-5-battle-migration-map.md)

## 지금까지 옮긴 것

| 폴더 | 옮긴 곳 | 작업 |
|---|---|---|
| your_tomb, opponent_tomb, your_lost_zone, opponent_lost_zone | `battle/zone/` | R2-6 |
| YourLostZonePopupRenderer, YourLostZonePopupFrame (파일) | `battle/card_grid_popup/` | R2-9 |

## 남은 전투 폴더 26개

src 최상위 237개를 훑어 전투에 속하는 것을 가려냈다.

```
전투           38개   그중 battle 은 목적지 자신이므로 옮길 것은 37개
다른 화면      159개   덱 편성, 내 카드, 상점, 로비
공용 기반       39개   core, common, shape, texture_manager, 입력, 라우터
```

### 전투가 아닌 것 중 헷갈리는 하나

`card_selection_blocker` 는 이름에 카드가 들어가지만 덱 편성 화면 것이다.
쓰는 곳이 전부 덱 카드 추가, 삭제, 검색, 필터다. 전투는 하나도 쓰지 않는다.

---

## 어디로 가는가

### 카테고리와 도메인은 다르다

과거에는 폴더 240개가 각각 도메인처럼 취급됐다. `your_tomb`, `opponent_tomb`,
`your_deck` 이 전부 최상위에 나란히 있었다. 지금 하는 일은 그것들을 **카테고리로
묶는 것**이다. 새로 만드는 것이 아니다.

```
카테고리   battle/ 아래 폴더.  찾기 위한 묶음.  zone, field, unit, hand, hud, ability, animation, view
도메인     규칙이 다른 단위.   무엇이 다른 이유로 바뀌는가
```

**한 카테고리 안에 도메인이 여럿일 수 있다.** `zone/` 이 그렇다.

| 카테고리 | 그 안의 도메인 | 왜 다른 도메인인가 |
|---|---|---|
| `zone/` | Battle Deck | 뽑는다. 순서가 있다. 내가 순서를 못 정한다 |
| | Battle Tomb | 쌓인다. **부활할 수 있다.** 언데드 사령덱, 휴먼 소생덱, 천사 부활덱의 대상 |
| | Battle LostZone | 쌓인다. **부활할 수 없다.** 특수한 수단으로만 회수 |

지금 이 셋의 저장소가 `addCard / getCards / clear` 로 똑같이 생긴 것은
부활이 아직 구현되지 않았기 때문이다. [merge_or_split.md](merge_or_split.md) 참조.

나머지 일곱 카테고리 안의 도메인은 **그 카테고리를 옮길 때 정한다.**
zone 은 R2-8 에서 부활 덱 때문에 이미 들여다봐서 셋인 것을 안다.
다른 카테고리는 아직 그만큼 보지 않았다.

### 여덟 카테고리


### field — 카드를 놓는 자리와 좌표 (폴더 10개, 파일 41개, 1,845줄)

```
your_field                          opponent_field
your_field_area                     opponent_field_area
your_field_map                      opponent_field_map
your_field_card_position            opponent_field_crad_position   ← 오타. card 로 고친다
your_field_card_scene               opponent_field_card_scene
```

### unit — 필드 위 유닛과 그 상태 표시 (폴더 8개, 파일 35개, 1,376줄)

```
battle_field_unit
master_hp
battle_field_card_attribute_mark          opponent_field_card_attribute_mark
battle_field_card_attribute_mark_position opponent_field_card_attribute_mark_position
battle_field_card_attribute_mark_scene    opponent_field_card_attribute_mark_scene
```

속성 마크를 손패가 아니라 유닛에 넣은 이유는, 필드에 나온 카드의 상태를 표시하는 것이기
때문이다. 손패 카드에는 속성 마크가 붙지 않는다.

### hand — 손패 (폴더 5개, 파일 30개, 2,425줄)

```
battle_field_hand
battle_field_hand_page
battle_field_card_alignment
battle_field_card_position
battle_field_card_scene
```

### zone — 카드가 필드와 손패 밖에 머무는 곳 (다 옮겼다, R2-10)

```
your_deck
opponent_deck
```

무덤과 로스트존은 R2-6 에서 이미 옮겼다. 덱도 카드가 머무는 곳이므로 같은 자리다.
R2-6 에서 덱을 빼놓은 이유는 화면이 없어 이관 위험이 다르기 때문이었지, 자리가
달라서가 아니다.

### hud — 화면 위에 겹쳐 보이는 정보와 조작 (다 옮겼다, R2-14, R2-16, R2-17)

```
turn_end_button
turn_state
active_panel_area
skill_panel_animator
opponent_field_energy
```

### ability — 카드가 무엇을 하는가 (다 옮겼다, R2-11, R2-12, R2-18)

```
first_skill
second_skill
general_attack
```

R2-15(카드 능력 정의 구조)에서 `battle/domain/ability/` 로 다시 옮겨진다.
지금은 `battle/ability/` 에 두고, 그때 흡수한다.

### animation — 연출 (폴더 1개, 파일 20개, 13,333줄)

```
animation
```

이 한 폴더 안에 성격이 다른 것이 섞여 있어 아래에서 따로 다룬다.

---

## 연출은 갈리는 축이 둘이다

`src/animation/` 을 한 덩어리로 옮기면 안 된다. 안에 든 것이 서로 다른 이유로 늘어난다.

```
일반 공격 연출     무기가 늘면 늘어난다        검, 지팡이, 그 다음 무기
카드 연출         카드가 늘면 늘어난다        88장이 더 들어온다
```

무기는 정해진 목록이고 카드는 계속 는다. 한 폴더에 두면 무기를 하나 추가할 때
카드 연출 88개가 함께 눈에 들어온다.

```
src/battle/animation/
    attack/                무기로 갈린다
        weapon/            무기가 늘면 여기 하나 더한다
    card/                  카드번호로 갈린다
    motion/                카드를 옮기는 움직임. 아무것도 그리지 않는다
    skill/                 스킬 한 번을 화면에 재생하는 순서와 자리 값
```

### 카드 연출은 종류를 서랍으로, 카드를 묶음으로 둔다

함께 바뀌는 단위는 **카드 한 장**이다. 죽음의 낫 연출과 시체 폭발 연출은 서로
무관하고 같이 바뀌지 않는다. 반면 네더 블레이드의 등장 연출과 패시브 연출은
그 카드를 손볼 때 같이 본다.

종류(유닛, 아이템, 서포트, 에너지)는 함께 바뀌게 하는 이유가 아니라 **서랍**이다.
88장이 더 들어와도 찾을 수 있게 하고, 폴더를 여는 순간 그 카드가 어떻게 쓰이는지를
먼저 알려준다. 아이템은 상대 유닛에 떨어뜨려 쓰고 소모되고, 서포트는 필드에 놓이고,
유닛은 출격했다가 매 턴 돈다. 연출 코드를 열기 전에 그 전제를 아는 것과 모르는 것이
다르다.

```
src/battle/animation/card/
    unit/
        019_nether_blade/
            entrance/     출격할 때 한 번 돈다. 다시 돌지 않는다
            skill/        매 턴 돈다
        027_beln/
            skill/
    item/
        008_scythe/  009_energy_burn/  025_doom_contract/
        033_corpse_explosion/  035_morale_convert/  036_dead_lands/
    support/
        002_overflow_morale/  020_swamp/  030_leonik_summon/
    energy/
        151_cold_dark_energy/
```

### 폴더 이름에 카드번호를 넣는 이유

배선이 카드번호로 갈린다. `FirstSkillAnimation` 은 `NETHER_BLADE_CARD_ID = 19` 로,
시나리오는 `SCYTHE_CARD_ID = 8` 로 어느 연출을 돌릴지 고른다.

번호를 폴더 이름에 넣으면 그 번호로 찾을 때 배선과 연출이 함께 나온다.
규칙 17 의 [같은 값은 값으로 센다] 가 여기 걸린다. 세 자리로 맞춰 두면 번호순으로
정렬된다.

### 종류는 코드에 있는 값을 그대로 쓴다

`src/card/kind.ts` 의 이름을 따른다.

```
UNIT = 1  ITEM = 2  TRAP = 3  SUPPORT = 4  TOOL = 5  ENERGY = 6  ENVIRONMENT = 7  TOKEN = 8
```

`every_card_info.js` 의 종류 칸은 이 숫자다. 숫자만 보고 뜻을 짐작하지 않는다.
실제로 짐작해서 세 장(넘쳐흐르는 사기, 망자의 늪, 레오닉의 부름)을 에너지로 잘못
분류한 적이 있다. 넷 다 서포트다.

TRAP, TOOL, ENVIRONMENT, TOKEN 서랍은 지금 만들지 않는다. 해당 연출이 생길 때 만든다.

### view — 화면 조립 (폴더 2개, 파일 7개, 325줄)

```
battle_field                 배경 6파일. 화면 조립은 아니다
simulation_battle_field      라우터가 쓰는 유일한 전투 화면
```

`battle_field_render` 는 파일 하나뿐이었고 그 하나가 전체 주석이라 R2-19 에서 지웠다.

---

## 어떤 순서로 옮기는가

### 세어본 결과 — 2026년 9월 1일 기준

계획을 세울 때 적었던 숫자가 실제와 달랐다. 착수 직전에 세어보니 세 카테고리 모두
파일 수가 적힌 것의 절반쯤이었다. 아래가 지금 세어본 값이다.

| 카테고리 | 폴더 | 파일 | 줄 | 처음에 적었던 값 |
| --- | --- | --- | --- | --- |
| field | 10 | 41 | 1,845 | 75개 |
| unit | 8 | 35 | 1,376 | 74개 |
| hand | 5 | 30 | 2,425 | 55개 |
| animation | 1 | 20 | 13,333 | 1개 |
| view | 2 | 7 | 325 | 22개 |
| **합계** | **26** | **133** | **19,304** | |

**착수 직전에 다시 센다.** 계획 때의 숫자는 무엇을 셌는지 알 수 없다. 폴더를 센 것도,
파일을 센 것도, 클래스를 센 것도 섞여 있다. 숫자를 쓸 때는 무엇의 숫자인지 함께 적는다.

### 폴더 수가 크기를 말해주지 않는다

`animation` 은 폴더 하나인데 13,333줄로 남은 것의 일곱 할이다. `hand` 는 폴더 다섯에
2,425줄이다. 폴더 수로 작업을 나누면 크기가 맞지 않는다.

`animation` 20파일은 성격이 갈린다.

```
카드 연출        15파일     카드가 늘면 는다
그 외             5파일     카드를 옮기는 움직임, 스킬 재생, 자리 값, 연출 처리, 연출 종류
```

카드 연출 15파일은 카드 종류별로 나눠 R2-31 부터 R2-34 로 옮긴다.

### 한 폴더가 한 곳에 속하지 않는 경우가 있다

세어보니 카테고리에 넣어둔 것 중 셋이 그 카테고리 것이 아니었다.

```
battle_field_card_scene       손패로 넣었는데 드래그, 마우스 놓기, 좌우 클릭, 키보드도 쓴다
battle_field_card_position    손패로 넣었는데 마우스 놓기, 옛 카드 서비스도 쓴다
battle_field_card_alignment   손패로 넣었는데 손패와 필드 양쪽을 정렬한다. 저장소 열두 개를 쓴다
```

이런 것은 **양쪽이 다 자리를 잡은 뒤에** 옮긴다. 먼저 옮기면 어느 쪽으로 보내도 절반이
틀리고, 나중에 다시 만지게 된다.

### 순서

```
1. 손패        R2-20    손패와 손패 페이지 넘김 두 폴더
2. 유닛        R2-21    유닛과 속성 표시 여덟 폴더
3. 필드        R2-22    카드를 놓는 자리와 좌표 열 폴더
4. 화면 조립    R2-37    실제로 도는 두 화면
5. 배경        R2-38    battle_field 안의 배경 여섯 파일
6. 걸쳐 있는 것 R2-40, R2-41   위가 다 끝난 뒤
```

연출(R2-31 부터 R2-34)은 다른 폴더라 위 순서와 부딪히지 않는다. 사이에 아무 때나 넣을 수 있다.

## 옮길 때 함께 하지 않는 것

| | 왜 |
|---|---|
| `*_position` 5개를 소유 폴더의 `frame/` 으로 흡수 | 옮기기와 흡수를 섞으면 동작이 달라졌을 때 무엇 때문인지 가릴 수 없다 |
| `*_scene` 5개를 소유 폴더의 `renderer/` 로 흡수 | 위와 같다 |
| 비슷한 코드를 통합할지 판정 | [merge_or_split.md](merge_or_split.md) 를 따로 본다 |
| `repository` 를 `store` 나 `cache` 로 나누기 | R2-11 에서 한다 |

### 흡수 대상

옮길 때는 그대로 따라가고, 나중에 소유 폴더 안으로 들어간다.

```
position 5개
  battle_field_card_attribute_mark_position    battle_field_card_position
  opponent_field_card_attribute_mark_position  opponent_field_crad_position
  your_field_card_position

scene 5개
  battle_field_card_attribute_mark_scene       battle_field_card_scene
  opponent_field_card_attribute_mark_scene     opponent_field_card_scene
  your_field_card_scene
```

### 옮기면서 고칠 이름

```
opponent_field_crad_position  →  opponent_field_card_position    crad 오타
```

이름 변경은 이동과 같은 작업에서 해도 된다. 코드 내용을 바꾸는 것이 아니라
경로만 바뀌므로 동작이 달라질 여지가 없다.

---

## 표와 실제가 다를 때

**표를 고친다.** 옮기다 보면 폴더 안이 예상과 다를 수 있다.
R2-9 에서 로스트존 폴더 안의 파일 하나가 여러 화면이 쓰는 부품인 것이 드러났고,
그것은 폴더 단위 계획으로는 알 수 없는 것이었다.

```
폴더가 갈 자리는 이 표가 정한다
폴더 안의 파일 하나가 다른 데로 가야 하면 그때 판단한다
```

판단이 바뀌면 이 표에 사유와 함께 적는다.
