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
- [ ] **잔여: patch `.unset()` 셀렉터** — `dislikePost`, `deleteComment`, `removeBookmark`,
  `follow`/`unfollow`가 클라이언트가 보낸 ID를 GROQ 필터 셀렉터에 보간함
  (예: `likes[_ref=="${userId}"]`). Sanity patch 셀렉터는 `$param` 플레이스홀더를 지원하지 **않으므로**,
  사용 전에 **ID 형식 검증**이 필요함 — Phase 5의 zod 검증 패스에 포함.
- [x] **쿼리 로직 / 연산자 우선순위 버그** — `searchUsers`가 기존에
  `*[_type == "user" && (name match ...) || (username match ...)]` 를 만들었는데, 괄호 없는 `&&`/`||`
  혼용으로 타입 필터가 깨졌음. 이제 `&& (name match $match || username match $match)`. Phase 1에서 완료.
- [ ] **모든 mutation API의 서버 기반 행위자 식별** — like, bookmark, comment, follow, delete는 행위
  주체를 **서버 세션**에서 도출해야 하며, 클라이언트가 보낸 `userId`를 신뢰하면 **안 됨**. 이는 행위자
  스푸핑(다른 유저 명의로 동작)을 방지함. 현재 일부 핸들러는 요청 바디/클라이언트를 신뢰함. 또한
  `DELETE /api/posts` 핸들러는 서버측에서 소유자/관리자 검증을 **전혀** 하지 않음 — 소유자 확인이
  `PostDetail.tsx`의 클라이언트에서만 이뤄짐.
  *세션 API에 의존하므로, Auth.js v5 마이그레이션과 함께/직후에 구현(Phase 3) — v4에서 먼저 짜면 두 번 작성하게 됨.*
- [ ] **시크릿 교체 (조건부 / 필수)** — `.env.local`(gitignore됨, 현재 커밋 안 됨)에 실제 Google OAuth
  secret, Sanity write 토큰, NextAuth secret이 들어있음. **git history를 스캔**해서 한 번이라도 커밋된
  적이 있으면 교체(rotation)는 **필수**(Sanity 토큰 + OAuth secret + NextAuth secret). 필요한 환경변수는
  `.env.example`에 문서화.
- [ ] **public 환경변수로 관리자 노출** — `NEXT_PUBLIC_ADMIN_ID`가 클라이언트로 전달됨. 관리자 판별을
  서버측으로 이동(위의 서버 기반 행위자 식별 작업에 포함).
- [ ] **파일 업로드 검증 (보안 교차참조, §3 참고)** — UX뿐 아니라 악성/대용량 업로드 차단을 위해 서버에서
  타입/크기/개수를 검증.

## 2. 의존성 & 프레임워크 업그레이드 (P1)

- [ ] **Next.js 13.5.6 → 16.2.x** — 곧장 16으로. Next 15 LTS는 2026년 10월 지원 종료이므로 건너뜀. 새
  캐싱 모델 검토(§6과 함께 처리).
- [ ] **async Request API (Next 15+ breaking change)** — `cookies()`, `headers()`, route handler의
  `params`가 이제 async. `src/util/session.ts`와 인증 관련 코드 전반에 영향 → 모든 사용처를 점검.
  *마이그레이션 최대 함정이므로 별도로 추적.*
- [ ] **React 18 → 19** — React 19는 Next 16의 **필수** 의존성(선택 아님).
- [ ] **NextAuth v4 → Auth.js v5** — 새 설정 방식. v5 마이그레이션은 `route.ts`에서 `authOptions`를
  export하던 안티패턴도 완전히 제거함(v5엔 `authOptions` export 자체가 없음). 따라서 별도 추출 작업
  불필요(§4 참고).
- [ ] **tsconfig `target: es5` → `es2022`** — Node 20+ / 모던 브라우저 앱에 es5는 구식.
- [ ] **`next.config.js`의 `images.domains` deprecated** → `images.remotePatterns`로 마이그레이션.
- [ ] **Turbopack**은 Next 16의 **기본 번들러**(따로 "도입"할 대상 아님) — 빌드가 정상 동작하는지 검증.
- [ ] 나머지 의존성(`react-multi-carousel`, `react-spinners`, `timeago.js`) 최신 버전 점검.

## 3. 버그 & 정확성 (별도 표기 없으면 P1)

- [ ] **`PostDetail.tsx` alt 텍스트** — `alt={`photo by ${data.username[index]}`}`: `username`은 문자열
  이라 인덱싱하면 글자 하나가 나옴. `data.username`으로 수정.
- [ ] **`deleteTargetPost` 에러 처리** (`hooks/posts.ts`) — `.catch((err) => err.json())`는 Error 객체에
  `.json()`을 호출하는 잘못된 폴백. 에러 전파 방식 수정.
- [ ] **`NewPost` 업로드 검증** — 파일 타입/크기/개수에 대한 클라이언트 검증 없음; 서버 루프가 `length`
  필드를 무조건 신뢰함. 양쪽에서 검증(보안 교차참조, §1).
- [ ] **(P2/P3) 슬라이드 루프의 `key={index}`** (`PostDetail`) — 영향 작음; 해당 컴포넌트 수정 시 안정적인
  키로 교체.

## 4. 아키텍처 & 구조 (P2)

- [ ] **입력 검증 레이어** — 모든 API 요청 바디/폼(posts, comments, likes, bookmarks, follow)에 `zod`
  스키마 추가. 임시방편식 `if (!id || x == null)` 검사 대체.
- [ ] **API 에러 응답 표준화** — 핸들러마다 형식 불일치: 어떤 곳은 `new Response(JSON.stringify(error),
  {500})`, 어떤 곳은 `NextResponse`. 에러 헬퍼 + 응답 형태를 도입.
- [ ] **fetcher / 에러 처리 통합** — `SWRConfigContext`의 fetcher가 non-2xx 응답을 무시함(에러 페이지에
  `res.json()` 호출 시 불투명하게 throw). `res.ok`를 체크하는 fetcher 추가.
  > **위 세 항목을 하나의 "API contract cleanup" 패스로 묶어서 처리(Phase 5)** — zod 검증 + 에러 응답
  > 표준화 + `res.ok` 인지 fetcher는 함께 가는 게 자연스러움.
- [ ] **서비스 레이어 타입** — 다수 서비스 함수가 `client.fetch`에서 `any`를 반환. 명시적 반환 타입과
  공통 매퍼 추가.
- [ ] **중복 버튼 컴포넌트 통합** — `components/ColorButton.tsx` vs `components/ui/ColorButton.tsx`,
  거기에 `ui/Button`, `ui/CommonButton`, `ui/LoginButton`, `ui/ToggleButton`까지. 설정 가능한 단일
  `Button`으로 통합.
- [ ] **오타 이름 수정** — `src/context/CacheKeysConttext.tsx`(파일명)와 `CaacheKeysContext`(export)
  → `CacheKeysContext`. import 경로 갱신.
- [ ] **폴더 규칙** — 횡단 관심사용 `src/lib` 도입; `service` vs `util` 역할 명확화.
- [x] ~~`authOptions`를 `route.ts` 밖으로 이동~~ — **Auth.js v5 마이그레이션(§2)에 흡수**. v5엔
  `authOptions` export가 없어 거기서 자연히 해소됨. 별도 작업 없음.

## 5. 코드 품질 & 정리 (P2)

- [ ] **죽은/주석 처리된 코드 및 디버그 로그 제거** — `service/posts.ts`, `hooks/*`,
  `components/NewPost.tsx`, auth route 등에 주석 처리된 블록과 `// console.log(...)` 다수.
- [ ] **주석 정리/통일** — 인라인 한글 주석이 광범위함. 유용한 것만 간결한 영어로 정리하고, 코드를 그대로
  서술하는 설명성 주석은 제거.
- [ ] **ESLint/Prettier** — 더 엄격한 공통 설정 도입; 레포 전체 포맷 패스; `eslint-plugin-tailwindcss` 검토.
- [ ] **매직 스트링 추출** — API 경로(`/api/posts`, `/api/me`, …)를 상수 모듈로 분리.

## 6. 성능 & UX (P3)

- [ ] **캐싱 전략** — `sanity.ts`가 전역으로 `useCdn: false` + `cache: 'no-store'` 사용 → 읽기마다 전체
  레이턴시 발생. 읽기 쿼리는 CDN + 태그 기반 재검증 사용.
  *§2의 Next 16 캐싱 모델 마이그레이션과 함께 처리.*
- [ ] **페이지네이션 / 무한 스크롤** — 피드와 프로필 그리드 (현재 모든 게시물을 한 번에 가져옴).
- [ ] **로딩 & 에러 상태** — 에러 바운더리와 스켈레톤 추가; 스피너 사용 통일(`GridSpinner` vs
  `react-spinners`).
- [ ] **접근성** — alt 텍스트, 아이콘 전용 버튼의 `aria-label`, 모달 포커스 상태.
- [ ] **이미지 최적화** — `sizes` prop과 `urlFor`의 반응형 너비 검토(현재 800px 고정).

## 7. 테스트 & 도구 (P2)

> P3에서 상향: 전면 리뉴얼 포트폴리오 레포에서 테스트 + CI는 핵심 어필 포인트.

- [ ] **테스트 전무** — 서비스/훅 단위 테스트(Vitest)와 핵심 플로우(로그인, 게시물 생성, 좋아요, 댓글,
  팔로우) 컴포넌트/E2E 테스트(Playwright) 추가.
- [ ] **CI** — PR마다 lint + 타입체크 + 테스트.
- [ ] **`.env.example`** + README 설치/실행 가이드.

---

## 단계별 계획 (Phased Plan)

섹션 번호가 아니라 의존성 순서로 정렬. 각 단계 = 별도 브랜치 + 머지 전 스모크 테스트.

### Phase 1 — GROQ 파라미터화 & 쿼리 수정 (P0, 프레임워크 독립)
- `service/posts.ts`, `service/user.ts`의 모든 GROQ 쿼리 파라미터화.
- `searchUsers` 연산자 우선순위 버그 수정.
- 프레임워크 변경 없음 — 가장 먼저 안전하게 착수 가능.

### Phase 2 — 시크릿 감사 & 교체 (P0, 프레임워크 독립)
- git history에서 커밋된 시크릿 스캔; 발견 시 교체(필수).
- 필요한 환경변수를 문서화한 `.env.example` 추가.

### Phase 3 — Auth.js v5 마이그레이션 + 서버 기반 행위자 식별 (P0/P1)
- NextAuth v4 → Auth.js v5 마이그레이션 (이 과정에서 `route.ts`의 `authOptions` 안티패턴 제거됨).
- `util/session.ts`와 모든 인증 코드를 **async Request API**에 맞게 수정.
- 새 세션 API를 기반으로 **모든** mutation API(like, bookmark, comment, follow, delete)에서 서버 기반
  행위자 식별 + 소유자/관리자 검증 강제. 관리자 판별을 public 환경변수에서 분리.
- 식별 작업을 (더 일찍이 아니라) 여기서 함으로써 v4 API 기준으로 두 번 작성하는 것을 방지.

### Phase 4 — Next.js 16 / React 19 업그레이드 + 캐싱 모델
- Next 16.2.x + React 19로 업그레이드; Turbopack 기본 빌드 검증.
- `images.domains` → `images.remotePatterns` 마이그레이션; tsconfig `target`을 es2022로 상향.
- 새 캐싱 모델에 맞춰 Sanity 캐싱 전략(CDN + 태그 기반 재검증) 재작업(§6).

### Phase 5 — API 계약 정리 (한 패스)
- zod 입력 검증 + 에러 응답 표준화 + `res.ok` 인지 fetcher를 함께.
- 서비스 함수의 명시적 반환 타입 / 공통 매퍼 추가.

### Phase 6 — 아키텍처 & 코드 품질 정리
- 버튼 컴포넌트 통합; `CacheKeysContext` 오타 수정; `src/lib` 도입.
- 죽은 코드 / 디버그 로그 제거; 주석 정리; ESLint/Prettier 패스; 매직 스트링 추출.
- 남은 정확성 항목 수정(alt 텍스트, `deleteTargetPost`, 업로드 검증, 슬라이드 키).

### Phase 7 — 성능, UX, 테스트 & CI
- 페이지네이션/무한 스크롤, 로딩/에러 바운더리, 접근성, 이미지 최적화.
- Vitest + Playwright 테스트 스위트; CI(PR마다 lint + 타입체크 + 테스트); README.
