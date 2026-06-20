# Junsgram — 리팩토링 계획

Junsgram 프로젝트(인스타그램 스타일 사진 공유 앱)의 전면 리뉴얼 문서입니다.
무엇을, 왜 리팩토링해야 하는지와 진행 상황을 추적합니다.

- **목표 스택(Target Stack):** Next.js 16.2.x / React 19 (필수) / Auth.js v5 / TypeScript (es2022) / Node 20+ / Sanity.
- **작업 규칙(Working Rules):** 각 단계(Phase)는 별도 브랜치에서 진행하며, 단계 종료마다 스모크 테스트(login / create post / like / comment / follow)로 앱이 깨지지 않았는지 확인한 뒤 머지한다.

## 프로젝트 개요

- **종류:** 인스타그램 클론 — 피드, 게시물 상세, 좋아요, 댓글, 북마크, 팔로우, 유저 검색, 사진 업로드.
- **현재 스택:** Next.js 13.5.6 (App Router), React 18, TypeScript, Tailwind CSS, SWR, NextAuth v4 (Google OAuth), Sanity (CMS / 데이터 저장 + 이미지 호스팅).
- **구조:**
  - `src/app` — 라우트 + API route handler
  - `src/components` (+ `components/ui`, `components/ui/icons`) — UI
  - `src/service` — Sanity 데이터 접근 (`posts.ts`, `user.ts`, `sanity.ts`)
  - `src/hooks` — SWR 데이터 훅 (`posts.ts`, `post.ts`, `me.ts`, `debounce.ts`)
  - `src/model` — 도메인 타입
  - `src/context` — Auth / SWR 프로바이더, 캐시 키 컨텍스트
  - `src/util` — `session.ts`, `date.ts`
  - `sanity-studio/` — 별도 Sanity Studio 프로젝트

범례: `[ ]` 할일 · `[~]` 진행중 · `[x]` 완료 · **P0** 치명적 · **P1** 높음 · **P2** 중간 · **P3** 낮음

---

## 1. 보안 (P0)

- [x] **GROQ 인젝션 (읽기 쿼리)** — `src/service/posts.ts`와 `src/service/user.ts`의 모든 `client.fetch`
  읽기 쿼리를 파라미터화함 (`$username` / `$id` / `$postId` / `$match`). 기존 문자열 보간
  (`username == "${username}"`, `match "*${keyword}*"`, `_id == "${id}"`) 제거. Phase 1에서 완료.
- [x] **잔여: patch `.unset()` 셀렉터** — `dislikePost`, `deleteComment`, `removeBookmark`,
  `follow`/`unfollow`가 클라이언트가 보낸 ID를 GROQ 필터 셀렉터에 보간함
  (예: `likes[_ref=="${userId}"]`). Sanity patch 셀렉터는 `$param`을 지원하지 않아, 대신 zod의 `sanityId`
  정규식(`^[a-zA-Z0-9._-]+$`)으로 모든 id/key를 라우트 진입 시 검증해 인젝션 문자를 차단함. Phase 5에서 완료.
- [x] **쿼리 로직 / 연산자 우선순위 버그** — `searchUsers`가 기존에
  `*[_type == "user" && (name match ...) || (username match ...)]` 를 만들었는데, 괄호 없는 `&&`/`||`
  혼용으로 타입 필터가 깨졌음. 이제 `&& (name match $match || username match $match)`. Phase 1에서 완료.
- [x] **모든 mutation API의 서버 기반 행위자 식별** — 행위 주체는 모두 `auth()` 세션에서 도출됨
  (like/bookmark/comment 생성/follow/post 생성은 기존부터). **DELETE 게시물**에 작성자/관리자 검증
  (403/404), **댓글 삭제**에 첫 댓글 보호 + 관리자/게시물 작성자/댓글 작성자 검증을 서버에 추가함.
  Phase 4에서 완료.
- [x] **시크릿 교체 (조건부)** — git history 전체를 스캔(파일명 + 실제 시크릿 값 literal)한 결과,
  Google OAuth secret / Sanity write 토큰 / NextAuth secret의 **실제 값은 한 번도 커밋된 적 없음**.
  히트는 전부 `process.env.X` 변수 이름 참조뿐. `.env.local`은 gitignore 확인됨. 따라서 조건부 규칙상
  **교체(rotation)는 필수 아님**(노출 정황 없음 — 일반 위생 차원의 권장만). 필요한 환경변수는
  `.env.example`에 문서화 완료. Phase 2에서 완료.
- [x] **public 환경변수로 관리자 노출** — 서버 전용 `ADMIN_ID` env + `isAdmin()` 헬퍼로 권한 판별을
  서버측으로 이동. `NEXT_PUBLIC_ADMIN_ID`는 UI 표시(삭제 버튼 노출) 용도로만 남김. Phase 4에서 완료.
- [ ] **파일 업로드 검증 (보안 교차참조, §3 참고)** — UX뿐 아니라 악성/대용량 업로드 차단을 위해 서버에서
  타입/크기/개수를 검증.

## 2. 의존성 & 프레임워크 업그레이드 (P1)

- [x] **Next.js 13.5.6 → 16.2.9** — 16 직행. Phase 3에서 완료.
- [x] **async Request API (Next 15+ breaking change)** — 모든 동적 라우트/페이지 `params`,
  로그인 페이지 `searchParams`를 await로 전환. Phase 3에서 완료.
- [x] **React 18 → 19** — React 19.2로 업그레이드. Phase 3에서 완료.
- [x] **NextAuth v4 → Auth.js v5** — split config로 마이그레이션, `authOptions` 안티패턴 제거됨.
  Phase 4에서 완료.
- [x] **tsconfig `target: es5` → `es2022`** — Phase 3에서 완료.
- [x] **`next.config.js`의 `images.domains` → `images.remotePatterns`** — Phase 3에서 완료.
- [x] **Turbopack** Next 16 기본 번들러로 빌드 green 확인. Phase 3에서 완료.
- [ ] 나머지 의존성 점검 — `react-spinners`(react-dom ^18 peer 경고, React 19에서 동작은 함),
  `react-multi-carousel`, `timeago.js` 최신 버전 점검 **남음**.

## 3. 버그 & 정확성 (별도 표기 없으면 P1)

- [x] **`PostDetail.tsx` alt 텍스트** — `data.username[index]`(문자열 인덱싱 버그) → `data.username`.
  Phase 6에서 완료.
- [x] **`deleteTargetPost` 에러 처리** (`hooks/posts.ts`) — 잘못된 `.catch((err) => err.json())` 제거.
  이제 공통 `fetcher`가 non-2xx에서 throw하므로 SWR `rollbackOnError`가 정상 동작함. Phase 5에서 완료.
- [x] **`NewPost` 업로드 검증** — 서버측(Phase 5) + **클라이언트측(Phase 7)**: 공통 `selectFiles` 헬퍼로
  타입(`image/*`)·크기(≤10MB)·개수(≤10) 검증, 위반 시 에러 메시지 표시.
- [x] **(P2/P3) 슬라이드 루프의 `key={index}`** (`PostDetail`) — `key={img}`(이미지 URL)로 교체.
  Phase 6에서 완료.

## 4. 아키텍처 & 구조 (P2)

- [x] **입력 검증 레이어** — `src/lib/validation.ts`에 zod 스키마 추가(likes/bookmarks/follow/comments
  추가·삭제/post 삭제). 모든 mutation 라우트가 `safeParse`로 검증, 임시방편 `if (!id ...)` 제거. Phase 5에서 완료.
- [x] **API 에러 응답 표준화** — `src/lib/http.ts`에 `jsonError`/`badRequest`/`forbidden`/`notFound`/
  `serverError` 도입. `{ error: string }` 형태 통일, Sanity 업스트림 에러는 실제 status로 전달(이전엔
  전부 불투명 500). Phase 5에서 완료.
- [x] **fetcher / 에러 처리 통합** — `src/lib/fetcher.ts` 추가(non-2xx에서 throw). `SWRConfigContext`와
  모든 mutation 훅(me/posts/post)이 사용. Phase 5에서 완료.
- [x] **서비스 레이어 타입** — read 함수에 명시 반환 타입 추가(`getUserByUsername→HomeUser`,
  `searchUsers→SearchUser[]`, `getUserForProfile→ProfileUser`, posts getter들→`SimplePost[]`/`GetFullPost`).
  Phase 6에서 완료. (mutation 커밋 결과 타입은 추후.)
- [x] **중복 버튼 컴포넌트 통합** — 죽은 `components/ColorButton.tsx` 삭제,
  `ui/CommonButton`을 `ui/Button`으로 통합(FollowButton 전환, red hover 반영). `ui/ColorButton`/
  `LoginButton`/`ToggleButton`은 용도 구별돼 유지. Phase 6에서 완료.
- [x] **오타 이름 수정** — 파일 `CacheKeysConttext.tsx`→`CacheKeysContext.tsx`, export
  `CaacheKeysContext`→`CacheKeysContext`, import 3곳 갱신. Phase 6에서 완료.
- [x] **폴더 규칙** — `src/lib`(http/validation/fetcher) Phase 5에서 도입됨.
- [x] ~~`authOptions`를 `route.ts` 밖으로 이동~~ — **Auth.js v5 마이그레이션(§2)에 흡수**. v5엔
  `authOptions` export가 없어 거기서 자연히 해소됨. 별도 작업 없음.

## 5. 코드 품질 & 정리 (P2)

- [x] **죽은/주석 처리된 코드 및 디버그 로그 제거** — `// console.log(...)` 4곳 제거(NewPost, hooks/post,
  service/posts). Phase 6에서 완료.
- [~] **주석 정리/통일** — 명백한 디버그/죽은 주석은 제거함. 광범위한 한글 설명 주석의 전면 영어화는
  변경 폭이 크고 위험 대비 가치가 낮아 **보류**(필요 시 별도 패스).
- [x] **ESLint** — 레거시 `.eslintrc.json` → `eslint.config.mjs`(flat config, ESLint 9 +
  eslint-config-next 16의 `core-web-vitals`). `lint` 스크립트를 `eslint .`로 변경, CI에 lint 추가.
  95개 파일 0 경고 통과. Phase 7c에서 완료. (Prettier 도입은 별도.)
- [x] **매직 스트링 추출** — `src/lib/routes.ts`의 `API` 상수로 API 경로 통합, hooks/context/pages/NewPost
  적용. Phase 7b에서 완료.

## 6. 성능 & UX (P3)

- [ ] **캐싱 전략** — `sanity.ts`가 전역으로 `useCdn: false` + `cache: 'no-store'` 사용 → 읽기마다 전체
  레이턴시 발생. 읽기 쿼리는 CDN + 태그 기반 재검증 사용.
  *§2의 Next 16 캐싱 모델 마이그레이션과 함께 처리.*
- [ ] **페이지네이션 / 무한 스크롤** — 피드와 프로필 그리드 (현재 모든 게시물을 한 번에 가져옴).
- [~] **로딩 & 에러 상태** — App Router `loading.tsx`(SSR-safe CSS 스피너) + `error.tsx` +
  `global-error.tsx` 추가(Phase 7b). 스켈레톤·스피너 전면 통일은 남음.
- [~] **접근성** — 아이콘 전용 버튼 `aria-label`(PostDetail 옵션/댓글삭제, PostModal 닫기), 로딩 `role=status`,
  모달 `role=dialog`+`aria-modal`+Escape 닫기+배경 스크롤 잠금(Phase 7d). 포커스 트랩 전면 sweep은 남음.
- [~] **이미지 최적화** — 그리드 카드 `sizes`를 `(max-width:768px) 33vw, 280px`로 조정(과대 요청 완화).
  `urlFor` 800px 고정 + 피드 `sizes` 추가 튜닝은 남음.

## 7. 테스트 & 도구 (P2)

> P3에서 상향: 전면 리뉴얼 포트폴리오 레포에서 테스트 + CI는 핵심 어필 포인트.

- [~] **테스트** — Vitest 도입 + `lib`(validation/fetcher/http) 단위 테스트 14개(인젝션 차단 정규식,
  fetcher의 non-2xx throw, serverError의 업스트림 status 전달 검증). Phase 7에서 완료.
  핵심 플로우 Playwright E2E는 OAuth 모킹이 필요해 **남김**.
- [x] **CI** — `.github/workflows/ci.yml`: PR/푸시마다 typecheck + test + build. lint(flat config)는 추후.
- [x] **`.env.example` + README** — env 문서화(Phase 2) + README 설치/실행/스크립트 가이드 작성(Phase 7).

---

## 단계별 계획 (Phased Plan)

섹션 번호가 아니라 의존성 순서로 정렬. 각 단계 = 별도 브랜치 + 머지 전 스모크 테스트.

### Phase 1 — GROQ 파라미터화 & 쿼리 수정 (P0, 프레임워크 독립)
- `service/posts.ts`, `service/user.ts`의 모든 GROQ 쿼리 파라미터화.
- `searchUsers` 연산자 우선순위 버그 수정.
- 프레임워크 변경 없음 — 가장 먼저 안전하게 착수 가능.

### Phase 2 — 시크릿 감사 & 교체 (P0, 프레임워크 독립) ✅ 완료
- git history 스캔 완료 — 실제 시크릿 값 커밋 흔적 없음 → 교체 불필요.
- 필요한 환경변수를 문서화한 `.env.example` 추가 완료.

> **순서 변경 + 결합 (의존성 발견):** Auth.js v5(beta.31)는 **Next.js 14+ 를 peer dependency로 요구**하고,
> 반대로 **next-auth v4는 Next 16 / React 19를 미지원**(`next: ^12/13/14`, `react: ^17/18`)함.
> 즉 Next 16으로 올리면 next-auth v4가 깨져 **빌드 가능한 중간 상태가 없음** → 기존 Phase 3(Auth)과
> Phase 4(Next16)를 맞바꾸는 동시에 **한 브랜치에서 함께 진행**(`refactor/phase-3-4-next16-authjs-v5`).
> 작업 순서는 "Next 16 업그레이드 → Auth.js v5"로 진행.

### Phase 3 — Next.js 16 / React 19 업그레이드 + 캐싱 모델 (구 Phase 4) ✅ 대부분 완료
- [x] Next 16.2.9 + React 19로 업그레이드; Turbopack 기본 빌드 green. eslint ^9 + eslint-config-next 16.
- [x] `images.domains` → `images.remotePatterns`; tsconfig `target` es5→es2022.
- [x] async Request API 대응: 모든 동적 라우트/페이지의 `params`, 로그인 페이지의 `searchParams` await.
- [x] `middleware.ts` → `proxy.ts` (Next 16 컨벤션, deprecation 경고 해소).
- [ ] 새 캐싱 모델에 맞춰 Sanity 캐싱 전략(CDN + 태그 기반 재검증) 재작업 — §6과 함께 **남김**.

### Phase 4 — Auth.js v5 마이그레이션 + 서버 기반 행위자 식별 (구 Phase 3, P0/P1) ✅ 완료
- [x] NextAuth v4 → Auth.js v5. split config: `auth.config.ts`(edge-safe) + `auth.ts`(Sanity `signIn`).
  `authOptions`-from-`route.ts` 안티패턴 제거됨. `route.ts`는 `handlers` 재export.
- [x] `util/session.ts` + 모든 서버 컴포넌트를 `auth()` API로 전환.
- [x] mutation API 행위자는 모두 세션에서 도출됨(like/bookmark/comment/follow/post 생성은 기존부터 ✓).
  **DELETE 게시물**: 작성자 또는 관리자만(403/404) — 서버 검증 추가. **댓글 삭제**: 첫 댓글 삭제 불가 +
  관리자/게시물 작성자/댓글 작성자만 — 서버 검증 추가.
- [x] 관리자 판별을 서버 전용 `ADMIN_ID` env로 분리(`isAdmin()`). `NEXT_PUBLIC_ADMIN_ID`는 UI 용도만.

### Phase 5 — API 계약 정리 (한 패스) ✅ 완료
- [x] zod 입력 검증(`lib/validation.ts`) + 에러 응답 표준화(`lib/http.ts`) + `res.ok` 인지
  fetcher(`lib/fetcher.ts`)를 함께. patch `.unset()` 셀렉터 ID 인젝션 잔여(§1)도 `sanityId` 정규식으로 차단.
- [x] 서버측 업로드 검증(타입/크기/개수) 추가. `src/lib` 디렉터리 도입.
- [~] 서비스 반환 타입: 신규 함수만 명시. 기존 `client.fetch` 전반 타이핑은 Phase 6으로.

### Phase 6 — 아키텍처 & 코드 품질 정리 ✅ 완료
- [x] 버튼 통합(죽은 ColorButton 삭제, CommonButton→Button), `CacheKeysContext` 오타 수정.
- [x] 죽은 console.log 주석 제거, 서비스 read 함수 반환 타입 명시.
- [x] 정확성: PostDetail alt 텍스트, 슬라이드 key 수정.
- 이관: 주석 전면 영어화·매직 스트링 상수화는 보류, ESLint flat config는 Phase 7(CI와 함께).
  클라이언트측 업로드 검증은 Phase 7(UX).

### Phase 7 — 테스트 & 도구 (완료) / 성능·UX (일부 완료)
- [x] (7a) Vitest + `lib` 단위 테스트 14개; CI(typecheck+test+build); README; 클라이언트측 업로드 검증.
- [x] (7b) App Router `loading`/`error`/`global-error` 바운더리; 아이콘 버튼 aria-label; API 경로 상수화(`lib/routes.ts`).
- [x] (7c) ESLint flat config(`eslint.config.mjs`) 전환 + `lint` 스크립트(`eslint .`) + CI에 lint 추가.
- [x] (7d) 모달 a11y(dialog/aria-modal/Escape/스크롤 잠금/닫기 aria-label); 그리드 안정적 key +
  미사용 import 제거; 그리드 이미지 `sizes` 최적화.
- [ ] **남은 성능/UX (별도 작업 — 설계 결정/브라우저 검증 필요):**
  - **캐싱 전략** — 토큰 인증 read의 CDN 동작이 미묘(잘못 켜면 read 실패 가능) → 신중한 검증 필요.
  - **페이지네이션/무한 스크롤** — 실제 데이터 3건뿐이라 효과 없음 + GROQ/SWR Infinite/스크롤 브라우저 검증 필요.
  - 스켈레톤·스피너 전면 통일, 모달 포커스 트랩, 피드 이미지 `sizes` 추가 튜닝.
  - Playwright E2E(OAuth 모킹), Prettier 도입.
