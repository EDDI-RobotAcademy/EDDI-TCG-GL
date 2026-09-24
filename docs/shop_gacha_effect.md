# 상점 카드 뽑기 연출

뽑기 단추를 누르면 확인 화면이 뜨고, [예] 를 누르면 책자가 펼쳐지는 영상이 돌고, 빛이 터진
뒤 카드 열 장이 뒷면으로 깔려 한 장씩 뒤집힌다.

**이 문서는 고치려는 사람을 위한 것이다.** 지금 무엇이 어떻게 그려지는지, 어느 값을
건드리면 무엇이 바뀌는지, 무엇이 아직 허술한지를 적는다.

관련 티켓: [R2-135](refactoring/R2-135-shop-draw.md) (뽑기 흐름), R2-136 (이 연출)

---

## 두 겹으로 나뉘어 있다

| 겹 | 무엇 | 왜 그 겹인가 |
|---|---|---|
| **그림판 (WebGL)** | 뽑기 단추 넷, 확인 화면(덮는 판·종족 그림·예/아니오) | 상점 화면의 일부다. 상점과 같은 방식이어야 한다 |
| **화면 위에 얹는 겹 (DOM)** | 영상, 흰 빛, 결과 판, 카드 열 장, 아래 단추 | 아래 이유 넷 |

DOM 을 고른 이유 넷이다.

| | |
|---|---|
| **카드 뒤집기를 CSS 가 진짜 3D 로 돌려 준다** | 직교 카메라에서는 가로를 줄여 흉내 내야 한다 |
| 등급 이름·카드 이름·비용이 글자다 | 그림판에 글자를 그리는 것보다 낫다 |
| 등급별 테두리와 발광이 CSS 한 줄이다 | 그림판에서는 테두리마다 물건을 만들어야 한다 |
| 영상이 DOM 것이다 | 그림판에 넣으려면 영상을 그림으로 바꿔 붙여야 한다 |

이 저장소가 DOM 겹을 쓰는 것이 이미 넷 있다 — 필드 에너지 표기, 모래시계, 턴 수, 안내 문구
(`DomFrameRenderer`).

> **한때 전부 셰이더로 그렸다.** 도서관과 책자를 프래그먼트 셰이더 하나로 그렸고(454줄),
> 쪽 넘기기도 그 안에서 했다. 지금은 영상이 그 자리를 대신하고 DOM 이 결과를 그린다.
> 지운 이유는 [지운 것] 에 적었다.

---

## 파일이 여섯이다

| 파일 | 하는 일 | 줄 |
|---|---|---|
| `shop/draw/CardDraw.ts` | 무엇이 뽑히는지 **묻는 창구**. 장수와 값도 여기 | 26 |
| `shop/draw/LocalCardDraw.ts` | 서버 없는 동안 이 안에서 굴린다. **서버가 붙으면 이 파일만 지운다** | 49 |
| `shop/frame/ShopDrawConfirmFrame.ts` | 확인 화면의 자리와 크기 | 63 |
| `shop/renderer/ShopDrawRenderer.ts` | 확인 화면을 그림판에 그린다 | 178 |
| `shop/control/ShopDrawControl.ts` | 확인 화면을 띄우고 예/아니오를 받는다 | 118 |
| `shop/frame/GachaOverlayFrame.ts` | 연출의 값 전부 — 영상 경로, 격자, 등급 다섯의 생김새 | 142 |
| `shop/renderer/GachaOverlayRenderer.ts` | **DOM 을 만드는 유일한 곳.** 모양(CSS)도 여기 | 389 |
| `shop/control/GachaOverlayControl.ts` | 순서를 정하고 누름을 받는다 | 224 |

---

## 순서와 걸리는 시간

| | 무엇 | 얼마 |
|---|---|---|
| 1 | 확인 화면 (그림판) | 사용자가 누를 때까지 |
| 2 | 영상이 돈다 | 8.3초 (또는 [건너뛰기]) |
| 3 | 흰 빛이 번쩍인다 | 0.12초 |
| 4 | 영상이 멈추고 결과 판이 뜬다 | 0.9초에 걸쳐 |
| 5 | 빛이 걷힌다 | 0.9초 |
| 6 | 카드가 한 장씩 뒤집힌다 | 0.4초 뒤부터 장당 0.12초 + 등급별 뜸 |

**좋은 등급은 늦게 뒤집힌다.** 이것이 뽑기의 재미다 — 다 똑같이 뒤집히면 좋은 것이
나왔는지 알 길이 없다.

| 등급 | 늦추는 시간 |
|---|---|
| 신화 | +0.55초 |
| 전설 | +0.35초 |
| 영웅·희귀·일반 | 없음 |

---

## 영상

```
resource/shop/gacha_effect.mp4        원본. 17.76MB. 저장소에 안 들어간다
resource/shop/video/gacha_effect.mp4  쓰는 것. 2.60MB
```

원본에서 무엇을 바꿨나.

| | 원본 | 쓰는 것 |
|---|---|---|
| 크기 | 17.76MB | **2.60MB** (85% 줄었다) |
| 화질 (원본과 닮은 정도) | — | SSIM 0.969 |
| 소리 | AAC 있음 | **없다.** 연출에 소리를 안 쓴다 |
| 크기·길이 | 768×1152, 10.14초 | 그대로 |

다시 만드는 명령이다.

```
ffmpeg -i resource/shop/gacha_effect.mp4 -an \
  -c:v libx264 -preset slow -crf 27 -profile:v high -pix_fmt yuv420p -movflags +faststart \
  resource/shop/video/gacha_effect.mp4
```

### WebM 을 안 쓴다

일반적으로 WebM/VP9 가 H.264 보다 30~40% 작다. **이 영상에서는 아니었다.** 재 봤다.

| | 크기 | 원본과 닮은 정도 |
|---|---|---|
| **H.264 crf 27** | **2.60MB** | **0.969** |
| VP9 crf 38 | 2.91MB | 0.916 |
| VP9 crf 42 | 2.09MB | 0.911 |

VP9 가 더 크고 화질도 낮다. 빛이 터지고 종이가 날리는 장면을 VP9 가 잘 못 다룬다.
**일반론을 믿지 말고 재고 정한다.** 영상이 바뀌면 다시 재야 한다.

### 빛이 터지는 순간을 어떻게 찾았나

프레임별 밝기를 재서 가장 밝은 때를 찾았다. **8.42초** 였다.

```
ffmpeg -i resource/shop/gacha_effect.mp4 -vf "scale=32:48,signalstats,metadata=print:file=-" \
  -f null - 2>/dev/null | ... | sort -k2 -rn | head
```

`flashAtSeconds` 는 **8.3** 으로 두었다. 조금 앞서 시작해야 우리 흰 빛과 영상의 빛이
겹친다. 영상을 바꾸면 이 값을 다시 재야 한다.

### 세로 영상이다

영상이 768×1152 로 세로가 길고 화면은 가로가 길다. `contain` 으로 **높이에 맞춘다.**

| | |
|---|---|
| `contain` (쓰는 것) | 양옆에 여백이 생긴다. 그 자리에 겹의 어두운 바탕이 보여 테두리처럼 읽힌다 |
| `cover` | 화면을 채우지만 위아래가 크게 잘려 책이 화면을 벗어난다 |

### 영상을 안 지난다 — webpack 이 아니라 정적 파일이다

이 프로젝트는 그림을 `import` 하지 않고 **경로 문자열로** 가리킨다. 영상도 같다.

```
카드 그림   `resource/battle_field_unit/card/${id}.png`     경로 문자열
소리        import lobbyMusic from '@resource/music/...'     import (그래서 mp3 규칙이 있다)
영상        'resource/shop/video/gacha_effect.mp4'          경로 문자열
```

그래서 **webpack 에 `mp4` 규칙이 필요 없다** (한 번 넣었다가 되돌렸다). 개발 서버가
`resource/` 를 그대로 내준다.

**대신 캐시는 웹 서버가 맡는다.** 실제 서비스에서 이게 비용을 정한다.

| | 만 명 × 하루 5뽑 × 30일 |
|---|---|
| 캐시 없음 | 1,500,000회 × 2.6MB = **3.9TB** |
| 캐시 있음 | 10,000회 × 2.6MB = **26GB** |

**150배 차이다.** 파일 이름에 내용 해시를 넣고 `Cache-Control: max-age=31536000, immutable`
을 주면 사용자당 한 번만 받는다.

---

## 영상이 없거나 못 읽을 때

**뽑기는 영상에 기대지 않는다.** 세 갈래 모두 결과로 간다.

| | |
|---|---|
| `videoSrc` 가 `null` | 곧바로 결과로 간다 |
| 재생이 막혔다 (브라우저가 거절) | 곧바로 결과로 간다 |
| 파일을 못 읽었다 (`error`) | 로그를 적고 결과로 간다 |

영상 때문에 뽑기가 멈추면 안 된다.

---

## 카드 자료를 어디서 읽나

`getCardById(cardId)` 하나다. 이름·등급·비용이 거기 있다.

**카드 자료의 열쇠는 카드 번호가 아니다.** 0 부터 세는 차례이고 카드 번호는 `카드번호` 칸에
따로 있다. 한 번 틀려서 없는 그림을 찾았다.

등급은 게임의 `CardGrade` 1~5 와 일대일이다.

| 등급 | 값 | 카드 수 | 테두리 |
|---|---|---|---|
| 신화 | 5 | 9 | 초록 `#45bd80` |
| 전설 | 4 | 14 | 보라 `#a86fe8` |
| 영웅 | 3 | 27 | 파랑 `#4d9bf5` |
| 희귀 | 2 | 23 | 금 `#d9a443` |
| 일반 | 1 | 26 | 붉은 `#a33e38` |

**등급이 안 적힌 카드가 한 장 있다** (자연 에너지). 없는 값으로 두면 화면이 비므로
`—` 로 보여 준다.

---

## 연출을 부르는 자리

`GachaOverlayControl.runOnce()` 와 `reveal()` 둘이다.

```ts
// 한 번 뽑는다
const cardIds = await this.deps.cardDraw.draw(this.race, DRAW_COUNT);
const cards = cardIds.map(toDrawnCardView).filter(...);

this.renderer.layCards(this.frame, root, cards);   // 카드를 먼저 깐다 (전부 뒷면)
this.renderer.setStage(root, 'video');             // 영상 겹을 보인다
await video.play().catch(() => { this.reveal(); }); // 막히면 곧바로 결과로

// 빛이 터지고 결과가 드러난다
this.renderer.setFlash(root, true, 120);           // 1. 세게 번쩍
this.after(220, () => {
    this.renderer.video(root)?.pause();            // 2. 영상을 멈춘다
    this.renderer.setStage(root, 'result');        //    결과 판을 띄운다
    this.renderer.setFlash(root, false, 900);      // 3. 빛이 걷힌다
    this.flipInOrder();                            // 4. 한 장씩 뒤집는다
});
```

**카드를 영상보다 먼저 깐다.** 영상이 도는 동안 뒤에서 그림이 받아지므로, 빛이 걷힐 때
이미 준비되어 있다.

**단계는 `data-stage` 하나로 바뀐다.** `video` / `result` 둘뿐이고, 무엇이 보이고 무엇이
숨는지는 CSS 가 정한다.

```css
.gacha-overlay[data-stage="result"] .gacha-video-wrap { opacity: 0; }
.gacha-overlay[data-stage="result"] .gacha-skip { display: none; }
.gacha-overlay[data-stage="result"] .gacha-result { opacity: 1; pointer-events: auto; }
```

---

## 카드 뒤집기

CSS 가 진짜 3D 로 돌린다.

```css
.gacha-card { perspective: 1000px; }
.gacha-card-inner { transform-style: preserve-3d; transition: transform 0.65s ...; }
.gacha-card.is-flipped .gacha-card-inner { transform: rotateY(180deg); }
.gacha-card-face { backface-visibility: hidden; }
.gacha-card-front { transform: rotateY(180deg); }
```

앞뒤 두 면을 겹쳐 두고 뒷면이 보이지 않게 한다. 안쪽을 180도 돌리면 앞면이 나온다.

**그림판에서는 이렇게 못 했다.** 직교 카메라라 Y 축으로 돌리면 두께가 없어 종이가 사라진
것처럼 보이고, 가로를 줄여 접히는 것처럼 흉내 내야 했다.

등급별 테두리와 빛은 값으로 넘긴다.

```
slot.style.setProperty('--grade-border', look.border);
slot.style.setProperty('--grade-glow', look.glow);
```

---

## 어느 값을 건드리면 무엇이 바뀌나

| 바꾸고 싶은 것 | 어디 | 값 |
|---|---|---|
| 영상을 바꾼다 | `GachaOverlayFrame` | `videoSrc`, `flashAtSeconds` |
| 빛이 터지는 때 | `GachaOverlayFrame` | `flashAtSeconds: 8.3` |
| 뒤집기가 너무 느리다 | `GachaOverlayFrame` | `flipStepMs: 120`, `flipStartMs: 400` |
| 좋은 등급을 더 늦게 | `GACHA` 등급 표의 `flipDelayMs` | 신화 550, 전설 350 |
| 등급 색 | 같은 표의 `border` `glow` `tagColor` | |
| 격자 모양 | `GachaOverlayFrame` | `columns: 5`, `rows: 2` |
| 좁은 화면 격자 | 같은 곳 | `narrowColumns: 2`, `narrowRows: 5`, `narrowMaxWidthPx: 768` |
| 한 번에 뽑는 장수 | `CardDraw` | `DRAW_COUNT = 10` |
| 한 번에 드는 재화 | `CardDraw` | `DRAW_COST = 200` (**아직 안 깎는다**) |
| 확인 화면 자리 | `ShopDrawConfirmFrame` | |

---

## 지금 허술한 것

### 알고 안 한 것

| | 왜 안 했나 |
|---|---|
| 재화 200 을 안 깎는다 | 재화를 클라이언트가 들면 아무나 고칠 수 있다. 서버가 깎는다 |
| 뽑힌 카드를 보유 목록에 안 넣는다 | 같은 이유. 저장도 서버 일이다 |
| 확률이 없다 | 그 종족에서 고르게 뽑는다. 등급별 확률은 서버가 정한다 |
| 소리가 없다 | 영상의 소리를 뺐고 따로 넣지 않았다 |

### 못 한 것 — 개선 대상

| | 무엇이 문제인가 |
|---|---|
| **영상 양옆이 비어 있다** | 세로 영상을 가로 화면에 넣어 여백이 크다. 가로 영상이 있으면 낫다 |
| **결과 판이 영상과 안 이어진다** | 영상은 책자인데 결과는 어두운 판이다. 영상의 마지막 화면이 결과 판 바탕으로 이어지면 한 장면처럼 보인다 |
| **뽑기 결과에 요약이 없다** | 신화가 몇 장 나왔는지 한눈에 안 보인다. 위쪽에 등급별 수를 보여 주면 좋다 |
| **새로 얻은 카드 표시가 없다** | 이미 가진 카드와 처음 얻은 카드가 같아 보인다. 보유 목록이 생기면 붙인다 |
| **신화가 나올 때 따로 알리지 않는다** | 늦게 뒤집히기만 한다. 화면이 흔들리거나 빛이 한 번 더 터지는 편이 낫다 |
| **[다시 소환] 이 재화를 안 본다** | 서버가 붙으면 모자랄 때 막아야 한다 |
| **영상을 매번 처음부터 본다** | 두 번째부터는 [건너뛰기] 를 눌러야 한다. 기억해 두고 자동으로 건너뛰는 설정이 있으면 좋다 |

**가장 크게 남은 것은 [영상과 결과가 안 이어진다] 다.** 지금은 책자 영상이 끝나고 전혀
다른 어두운 판이 뜬다. 한 장면으로 보이지 않는다.

---

## 지운 것 — 셰이더로 그렸던 도서관

한때 도서관과 책자를 프래그먼트 셰이더 하나로 그렸다 (`LibraryTomeEffect`, 454줄).
영상을 쓰기로 해서 지웠다. **왜 그렇게 만들었고 무엇을 배웠는지는 남겨 둔다.**

| | |
|---|---|
| 잘 됐던 것 | 쪽 넘기기. 말린 쪽 열네 장이 한 줄기로 쓸려 갔다. 앞선 뒤 그림자가 장수를 보이게 했다 |
| **처음에 틀렸던 것** | 얇은 판 일곱 장을 가로로 줄여 흉내 냈다. **판을 쌓는 방식으로는 종이의 말림과 그림자를 못 그린다** |
| 안 됐던 것 | 도서관이 평면적이었다. 책에 두께가 없었다. 찢기는 순간의 긴장이 없었다 |

**다시 셰이더로 만들 일이 생기면 이 둘을 기억한다** — 장면 전체를 셰이더 하나가 그려야
한다, 그리고 종이는 말림과 그림자로 종이가 된다.
