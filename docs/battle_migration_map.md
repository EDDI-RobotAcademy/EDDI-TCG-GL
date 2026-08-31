# 전투 폴더 이동 계획표

> 언제 여는가: 전투 폴더를 옮기기 전에. 무엇이 남았고 어디로 가는지 본다.
> 만든 작업: [ETWGL-R2-5](refactoring/R2-5-battle-migration-map.md)

## 지금까지 옮긴 것

| 폴더 | 옮긴 곳 | 작업 |
|---|---|---|
| your_tomb, opponent_tomb, your_lost_zone, opponent_lost_zone | `battle/zone/` | R2-6 |
| YourLostZonePopupRenderer, YourLostZonePopupFrame (파일) | `battle/card_grid_popup/` | R2-9 |

## 남은 전투 폴더 37개

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


### field — 카드를 놓는 자리와 좌표 (10개)

```
your_field                          opponent_field
your_field_area                     opponent_field_area
your_field_map                      opponent_field_map
your_field_card_position            opponent_field_crad_position   ← 오타. card 로 고친다
your_field_card_scene               opponent_field_card_scene
```

### unit — 필드 위 유닛과 그 상태 표시 (8개)

```
battle_field_unit
master_hp
battle_field_card_attribute_mark          opponent_field_card_attribute_mark
battle_field_card_attribute_mark_position opponent_field_card_attribute_mark_position
battle_field_card_attribute_mark_scene    opponent_field_card_attribute_mark_scene
```

속성 마크를 손패가 아니라 유닛에 넣은 이유는, 필드에 나온 카드의 상태를 표시하는 것이기
때문이다. 손패 카드에는 속성 마크가 붙지 않는다.

### hand — 손패 (5개)

```
battle_field_hand
battle_field_hand_page
battle_field_card_alignment
battle_field_card_position
battle_field_card_scene
```

### zone — 카드가 필드와 손패 밖에 머무는 곳 (2개)

```
your_deck
opponent_deck
```

무덤과 로스트존은 R2-6 에서 이미 옮겼다. 덱도 카드가 머무는 곳이므로 같은 자리다.
R2-6 에서 덱을 빼놓은 이유는 화면이 없어 이관 위험이 다르기 때문이었지, 자리가
달라서가 아니다.

### hud — 화면 위에 겹쳐 보이는 정보와 조작 (5개)

```
turn_end_button
turn_state
active_panel_area
skill_panel_animator
opponent_field_energy
```

### ability — 카드가 무엇을 하는가 (3개)

```
first_skill
second_skill
general_attack
```

R2-15(카드 능력 정의 구조)에서 `battle/domain/ability/` 로 다시 옮겨진다.
지금은 `battle/ability/` 에 두고, 그때 흡수한다.

### animation — 카드 연출 (1개)

```
animation
```

### view — 화면 조립 (3개)

```
battle_field
battle_field_render
simulation_battle_field
```

---

## 어떤 순서로 옮기는가

밖에서 참조하는 파일이 적은 묶음부터 옮긴다. 한 묶음이 깨져도 영향이 작고,
뒤로 갈수록 앞에서 정리된 경로 위에 올라간다.

| 순서 | 묶음 | 폴더 | 밖에서 참조하는 파일 |
|---|---|---|---|
| 1 | zone (덱) | 2 | 2 |
| 2 | ability | 3 | 6 |
| 3 | hud | 5 | 14 |
| 4 | animation | 1 | 16 |
| 5 | view | 3 | 22 |
| 6 | hand | 5 | 55 |
| 7 | unit | 8 | 74 |
| 8 | field | 10 | 75 |

### 묶음 크기의 근거

R2-6 에서 실제로 재본 값이다.

```
폴더 4개, 파일 25개, 고친 참조 24회, 타입 검사 오류 0, 브라우저 정상
```

이 정도가 한 번에 감당 가능한 크기였다. 위 표에서 6, 7, 8번은 그보다 크므로
실제로 옮겨보고 나서 쪼갤지 정한다. field 는 your 와 opponent 로,
unit 은 유닛과 속성 마크로 나눌 수 있다.

### 첫 묶음

zone(덱) 2개다. 밖에서 참조하는 파일이 2개뿐이고, 무덤과 로스트존이 이미 그 자리에
있어 목적지가 확실하다.

---

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
