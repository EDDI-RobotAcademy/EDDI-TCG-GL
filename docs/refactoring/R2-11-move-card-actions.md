# [ETWGL-R2-11] 액티브 패널의 공격 / 스킬1 / 스킬2 버튼 동작 패키지 조정

선행: R2-10 │ 후행: R2-12 │ 산출물: src/battle/active_panel/, src/battle/ability/ │ Type: Structure │ Domain: Battle Active Panel

# Success criteria

1. 왜 하는지와 어디까지 할지를 정한다
    - 문제
        - 카드가 무엇을 하는지를 다루는 코드가 src 최상위에 세 폴더로 흩어져 있다
        - general_attack, first_skill, second_skill 이며 카드 데이터의 [공격력], [스킬 1], [스킬 2] 에 대응한다
        - 세 폴더 안에 규칙과 연출이 섞여 있다. 핸들러와 대상 종류는 카드가 무엇을 하는지를 다루고, 애니메이션 네 개 2,840줄은 그것을 어떻게 보여줄지를 다룬다
    - 목적
        - 카드가 무엇을 하는지 다루는 부분만 battle/ability/ 로 옮긴다
    - 기대 결과
        - 카드가 공격하거나 스킬을 쓸 때의 처리를 한 폴더에서 본다
        - R2-22(카드 능력 정의 구조)에서 이 폴더가 통째로 domain/ability/ 로 흡수된다
    - 옮기는 것
        - FirstSkillHandler, SecondSkillHandler, GeneralAttackHandler (665줄)
        - FirstSkillType, SecondSkillType, GeneralAttackType (13줄)
    - 건드리지 않는 것
        - AttackAnimationV2 (2,301줄) - 연출이다. 나머지 이펙트 14개가 있는 곳으로 가야 한다. **R2-12 로 뺀다**
        - FirstSkillAnimation, SecondSkillAnimation, GeneralAttackAnimation (539줄) - 각자의 핸들러가 쓰지만 연출이다. 규칙과 연출은 다른 이유로 바뀐다. **R2-12 로 뺀다**
        - 핸들러 안의 코드 - 위치와 경로만 바꾼다
        - 대상 종류 세 개를 하나로 통합하는 일 - FirstSkillType 과 GeneralAttackType 이 완전히 같지만 통합하지 않는다. R2-22 에서 CardAbility 의 targeting 으로 흡수될 때 함께 판단한다

2. 옮길 것만 옮기고 나머지는 남긴다
    - 핸들러 셋과 대상 종류 셋만 옮긴다
    - 연출 네 개는 그대로 둔다. R2-12 에서 다룬다
    - 폴더가 비지 않는다. general_attack 안에 연출이 남는다

3. 끊어진 참조를 잇는다
    - 핸들러 셋을 쓰는 곳은 ActivePanelButtonHandler 하나다
    - 그 파일은 아직 옮기지 않은 active_panel_area 안에 있고 R2-12 에서 옮겨진다. 경로를 두 번 고치게 된다
    - 대상 종류를 쓰는 곳을 함께 고친다

4. 이관이 성립하는지 확인한다
    - 타입 검사와 의존 검사가 통과한다
    - 옮긴 자리가 R2-3 의 의존 규칙을 어기지 않는다

5. 게임 동작이 달라지지 않았는지 확인하고 다음 작업에 넘긴다
    - 개발 서버를 다시 켜고 확인한다
    - 시나리오는 핸들러를 쓰지 않으므로 화면 동작에 영향이 없어야 한다
    - 스킬 폴더에 연출만 남는다. R2-12 에서 비운다

# To-do

1. 왜 하는지와 범위를 적는다
    - [x] 문제, 목적, 기대 결과 작성
    - [x] 연출 네 개를 범위 밖으로 명시하고 R2-12 로 넘김을 지정

2. 핸들러와 대상 종류를 옮긴다
    - [x] battle/active_panel/ 과 battle/ability/ 아래 자리 만들기
    - [x] 핸들러 세 개 이동
    - [x] 대상 종류 세 개 이동
    - [x] 폴더 안의 상대 경로 수정

3. 참조를 잇는다
    - [x] ActivePanelButtonHandler 의 경로 수정
    - [x] 대상 종류를 쓰는 곳 수정
    - [x] 남은 폴더에서 옮긴 것을 참조하는 곳이 있으면 수정

4. 이관이 성립하는지 확인한다
    - [x] npx tsc --noEmit 통과
    - [x] npm run depcruise 통과

5. 동작 확인과 넘기기
    - [ ] 개발 서버 재시작 후 확인
    - [x] 스킬 폴더에 연출만 남은 것을 R2-12 로 넘김
    - [x] 고친 참조 수를 Review 에 기록

# Issue

1. 사용처를 셀 때 쓰는 쪽 폴더를 제외했다
    - 증상
        - 스킬 애니메이션 세 개가 아무 데서도 쓰이지 않는다고 판단해 별도 작업(R2-13)으로 뺐다
        - 확인해보니 각자의 핸들러가 쓰고 있었다
    - 원인
        - 사용처를 셀 때 first_skill, second_skill, general_attack 폴더를 통째로 제외했다
        - 그 폴더 밖에서 쓰는 곳을 찾으려던 것인데, 정작 쓰는 것이 같은 폴더 안의 핸들러였다
    - 처리
        - 자기 파일만 제외하고 다시 셌다
        - R2-13 을 폐기하고 세 파일을 R2-12 범위로 옮겼다
        - **사용처를 셀 때는 자기 파일만 제외한다.** 폴더를 제외하면 같은 폴더 안의 사용을 놓친다

2. 핸들러 안을 보지 않고 Domain 을 배정했다
    - 증상
        - 폴더 이름이 first_skill, second_skill, general_attack 이라 Domain 을 Battle Ability 로 배정했다
        - 핸들러 안을 보니 카드 능력이 아니라 화면 조작이었다
    - 원인
        - 폴더 이름으로 판단했다
        - 핸들러는 THREE.Camera 와 THREE.Scene 을 생성자로 받고, 카드 메시를 옮기고 무기를 씬 루트로 풀어주고 속성 마크를 붙인다
        - 데미지 계산도 대상 판정도 없다. 카드가 무엇을 하는지가 아니라 화면에서 무엇이 어떻게 움직이는지다
    - 처리
        - Domain 을 Battle Active Panel 로 고쳤다
        - 핸들러 셋을 battle/active_panel/handler/ 로 옮겼다
        - 액티브 패널 버튼 다섯 중 셋에 하나씩 붙어 있다. 패널이 없으면 불릴 일이 없다
        - 대상 종류 세 개는 battle/ability/entity/ 에 남겼다. 이건 카드 능력이 맞다

3. 옮긴 뒤에 자리를 한 번 더 옮겼다
    - 증상
        - battle/ability/handler/ 로 옮겼다가 battle/active_panel/handler/ 로 다시 옮겼다
    - 원인
        - 2번과 같다. 옮기기 전에 파일 안을 봤어야 했다
    - 처리
        - 두 번째 이동으로 자리를 바로잡았다
        - **옮기기 전에 파일이 무엇을 하는지 확인한다.** R2-9 에서 팝업 렌더러를 옮길 때는 그렇게 했는데 이번에는 하지 않았다

4. 파일을 옮긴 뒤 빈 폴더가 남았다
    - 증상
        - 핸들러와 대상 종류를 옮긴 뒤 first_skill/handler, first_skill/entity 등이 빈 채로 남았다
        - git 은 빈 폴더를 추적하지 않아 git status 에 보이지 않았다
        - R2-12 에서 폴더를 지우려 했을 때 rmdir 이 실패했다
    - 원인
        - 파일만 옮기고 폴더를 확인하지 않았다
        - git status 만 보고 끝난 줄 알았다. 빈 폴더는 거기 안 나온다
    - 처리
        - find src -type d -empty 로 찾아 지웠다
        - **파일을 옮긴 뒤에는 빈 폴더가 남았는지 따로 본다.** git status 로는 안 보인다

# Review

| 항목 | 값 | 판단 |
| --- | --- | --- |
| 옮긴 파일 | 6개 | 핸들러 3개, 대상 종류 3개 |
| 간 곳 | 두 군데 | 핸들러는 active_panel, 대상 종류는 ability |
| 고친 참조 | 3파일 | ActivePanelButtonHandler, CardDetailsHandler, LeftClickDetectServiceImpl |
| 타입 검사 | 오류 0 | |
| 의존 검사 | error 0, warn 6 | 기존 순환 그대로 |
| 잘못된 배정 | 1건 | Battle Ability 로 배정했다가 Battle Active Panel 로 정정 |
| 틀린 측정 | 1건 | 죽은 코드로 잘못 세어 작업 하나를 만들었다가 폐기 |
| 스킬 폴더에 남은 것 | 연출 4개 2,840줄 | R2-12 에서 비운다 |

| 구분 | 내용 |
| --- | --- |
| **잘 맞은 것** | 옮기기 전에 세 폴더 안을 열어봤다. 규칙과 연출이 섞여 있는 것을 보고 범위를 한정했다. 그대로 세 폴더를 옮겼다면 2,840줄짜리 연출이 ability 아래로 들어갔을 것이다. |
| **미흡한 것** | 폴더 이름으로 Domain 을 배정했다. 핸들러 안이 화면 조작인 것을 옮기고 나서 알았고 자리를 두 번 옮기게 됐다. R2-9 에서는 파일이 무엇을 하는지 먼저 확인했는데 이번에는 하지 않았다. |
| **미흡한 것** | 사용처를 셀 때 제외 조건을 잘못 넣어 죽은 코드로 오판했고, 그 오판이 작업 하나(R2-13)를 만들어냈다가 폐기했다. |
| **다음 작업에 넘길 것** | 연출 네 개(R2-12). 그리고 active_panel_area 를 옮길 때(R2-14) 이 핸들러들과 같은 자리로 모을지 판단한다. |
