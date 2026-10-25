# FGO 랜덤 파티

FGO 서번트를 도감 번호(실장순)로 중복 없이 6명 뽑아 앞 3 / 뒤 3으로 보여주는 정적 웹페이지입니다.
빌드 없이 `index.html`을 열면 동작합니다. (인터넷 연결 필요)

## 사용법

- **파티 뽑기** 버튼 또는 `Space` — 6명 전체를 다시 뽑기
- 카드 클릭 — 그 자리만 다시 뽑기 (현재 파티와 겹치지 않게)

## 이미지

이미지는 레포에 들어 있지 않고, 페이지가 [Atlas Academy](https://atlasacademy.io)의 이미지 서버에서 직접 불러옵니다.
다음에 뽑을 12명을 뒤에서 미리 받아두기 때문에 버튼을 눌렀을 때 바로 표시됩니다.
(한 번에 받는 용량은 약 1MB, 서번트 한 명당 약 94KB입니다.)

## 새 서번트가 추가되면

```powershell
powershell -ExecutionPolicy Bypass -File tools/build-list.ps1
```

Atlas Academy에서 목록을 다시 받아 `data/servants.js`를 갱신합니다. 갱신한 파일을 커밋하면 됩니다.

## 구조

| 경로 | 역할 |
|---|---|
| `index.html`, `css/style.css`, `js/main.js` | 페이지 |
| `data/servants.js` | 도감 번호와 서번트 ID 목록 (`build-list.ps1`이 생성) |
| `tools/build-list.ps1` | 목록 갱신 스크립트 |

## 출처와 저작권

- 서번트 데이터와 이미지는 Atlas Academy에서 불러옵니다. Atlas Academy는 자신이 수집한 데이터를 ODC-BY 1.0(출처 표기 조건)으로 공개한다고 밝히고 있습니다.
- Fate/Grand Order의 캐릭터와 이미지의 저작권은 TYPE-MOON / DELiGHT WORKS / Aniplex 등 각 권리자에게 있습니다. 이 페이지는 비공식 팬 제작물입니다.
