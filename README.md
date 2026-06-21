# Junsgram

[![CI](https://github.com/byeonsejun/Junsgram/actions/workflows/ci.yml/badge.svg)](https://github.com/byeonsejun/Junsgram/actions/workflows/ci.yml)
&nbsp;![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
&nbsp;![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
&nbsp;![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)

> 인스타그램 스타일 사진 공유 앱이자, **레거시 Next.js 13 코드베이스를 Next.js 16 / React 19 / Auth.js v5로
> 전면 현대화**한 프로젝트입니다. 보안을 강화한 API 레이어, 옵티미스틱 UX, 그리고 CI에서 돌아가는
> 단위 + E2E 테스트까지 갖췄습니다.

**🔗 라이브 데모:** https://junsgram.vercel.app — Google로 로그인 후 `qustpwns93`을 팔로우하면 피드에 게시물이 보입니다.

**기능:** 무한 스크롤 피드 · 게시물 상세 · 좋아요 · 댓글 · 북마크 · 팔로우 · 유저 검색 · 다중 이미지 업로드 · 관리자 권한.

## 스크린샷

![Feed](docs/feed.png)

| 로그인 | 프로필 |
| :---: | :---: |
| ![Sign in](docs/signin.png) | ![Profile](docs/profile.png) |

---

## 이 프로젝트에 대하여

튜토리얼 시절의 Next.js 13 앱에서 시작해, 이를 **브라운필드(legacy) 현대화** 과제로 삼았습니다 — 실무에서는
신규 개발보다 훨씬 자주 마주치는 작업입니다. 프레임워크를 올리고, 보안 구멍을 막고, 타입이 보장되는 API 계약을
도입하고, 테스트 + CI를 붙여, Vercel 프로덕션까지 배포했습니다. 모든 변경은 브랜치에서 진행하고
`lint · typecheck · test · build`로 검증한 뒤 **green 파이프라인을 통과해 머지**했습니다.

작은 앱이지만 **그 주변을 프로덕션 수준의 엔지니어링으로 감쌌습니다.**

## 핵심 요약 (Highlights)

- **🔐 보안 우선 데이터 레이어** — 모든 GROQ 쿼리를 파라미터화(인젝션 차단)하고, 모든 mutation에 서버측 권한 검증을
  추가했으며, 모든 API 경계에서 `zod`로 검증합니다. Sanity patch 셀렉터는 바인딩 파라미터를 지원하지 않기에,
  `sanityId` 정규식으로 셀렉터 인젝션까지 막았습니다.
- **🔄 프레임워크 현대화** — Next.js 13.5 → **16**(App Router, Turbopack, async Request API, `middleware → proxy`),
  React 18 → **19**, NextAuth v4 → **Auth.js v5**(edge/Node 분리 설정).
- **⚡ 옵티미스틱 UX** — 좋아요·댓글·팔로우·삭제가 SWR로 즉시 반영되며 **에러 시 롤백**됩니다. 피드는
  `useSWRInfinite` + ranged GROQ로 커서 없이 무한 스크롤을 구현했습니다.
- **🧪 테스트 자동화** — **Vitest 단위 테스트 20개** + **Playwright E2E 5개**가 **GitHub Actions**에서 모든 PR을
  게이팅합니다. E2E는 실제 Auth.js 세션 쿠키를 발급해 **Google·Sanity를 건드리지 않고** 인증 플로우를 검증합니다.
- **☁️ 실전 배포 노하우** — 프리뷰 배포의 OAuth 문제를 진단하고 Auth.js의 **redirect-proxy**로 해결해, 매번 바뀌는
  Vercel 프리뷰 URL을 일일이 등록하지 않고도 OAuth가 동작하도록 만들었습니다.
- **♿ 견고함 & 접근성** — App Router `loading` / `error` / `global-error` 바운더리, 포커스를 관리하는 모달
  (dialog role, Escape, 스크롤 잠금), 아이콘 버튼 `aria-label`.

## 기술 스택

| 영역 | 선택 |
| --- | --- |
| 프레임워크 | Next.js 16 (App Router, Server Components, Turbopack) · React 19 |
| 언어 | TypeScript (`es2022`, CI에서 `tsc --noEmit`) |
| 인증 | Auth.js v5 — Google OAuth, JWT 세션, edge-safe 분리 설정 |
| 데이터 | Sanity (콘텐츠 저장소 + 이미지 CDN) · GROQ |
| 클라이언트 상태 | SWR (옵티미스틱 mutation, `useSWRInfinite`) |
| 검증 | zod |
| 스타일 | Tailwind CSS (다크 테마) |
| 테스트 | Vitest (단위) · Playwright (E2E) |
| CI/CD | GitHub Actions · Vercel |

## 엔지니어링 상세

### 보안 — 클라이언트 입력은 전부 신뢰하지 않는다
- **GROQ 인젝션:** 모든 read 쿼리를 파라미터화(`$username`, `$id`, …) — 문자열 보간이 쿼리 엔진에 닿지 않습니다.
- **Patch 셀렉터 인젝션:** Sanity의 `patch().unset()` 셀렉터는 바인딩 파라미터를 못 쓰기에, 보간되기 전에
  라우트 진입 지점에서 엄격한 `sanityId` 정규식으로 모든 id/key를 검증합니다.
- **서버측 권한 검증:** 행위 주체는 항상 세션에서 도출하며 요청 본문을 신뢰하지 않습니다. 게시물/댓글 삭제는
  작성자 또는 관리자만 가능(403/404)하고, 관리자 권한은 클라이언트 UI 플래그와 분리된 **서버 전용** 환경변수로 둡니다.
- **입력 검증:** 모든 mutation payload를 `zod` 스키마로 검증합니다 (`src/lib/validation.ts`).

### Auth.js v5 마이그레이션 — 그리고 그 과정에서 드러난 실제 버그
NextAuth v4 → Auth.js v5로, 설정을 분리해(`auth.config.ts` edge-safe 베이스 + `auth.ts` Sanity 기반 `signIn`)
마이그레이션했습니다. 그 과정에서 미묘한 데이터 버그를 잡았습니다 — 앱이 Sanity 유저 문서의 키를 Auth.js의
`user.id`로 썼는데, 이 값은 **매 로그인마다 새로 생성되는 랜덤 UUID**라 로그인할 때마다 조용히 유저가 중복
생성됐습니다. 안정적인 Google `providerAccountId`(`sub`)로 바꿔 해결했습니다.

### 타입이 보장되는 예측 가능한 API 계약
- 공통 `fetcher`가 non-2xx에서 throw하므로, 에러 본문을 캐싱하는 대신 SWR이 에러를 표면화하고
  옵티미스틱 롤백이 정상 동작합니다.
- 표준화된 에러 응답(`src/lib/http.ts`)이 모든 걸 불투명한 500으로 뭉개지 않고 **업스트림 status를 보존**합니다.
- API 경로 상수화 + 서비스 레이어 반환 타입 명시.

### 테스트 전략
- **단위 (Vitest):** 검증/인젝션 정규식, `fetcher`의 non-2xx 동작, 에러 status 전달, 페이지네이션 계산.
- **E2E (Playwright):** 미인증 리다이렉트, 인증 피드 렌더, **옵티미스틱 좋아요**, **무한 스크롤** — 프로덕션 빌드
  대상으로 실행. `@auth/core/jwt`로 유효한 Auth.js JWT 쿠키를 발급해 로그인을 시뮬레이션하고, 모든 `/api/*`
  호출을 픽스처로 가로채 **결정론적이며 Google·Sanity를 전혀 건드리지 않습니다**.

### 배포 & 프리뷰 환경
Vercel 프리뷰 URL은 브랜치마다 바뀌지만 Google OAuth는 redirect URI 사전 등록이 필요합니다. Auth.js의
`AUTH_REDIRECT_PROXY_URL`을 설정해, 프리뷰 로그인이 등록된 단일 프로덕션 콜백을 경유한 뒤 프리뷰로 돌아오도록
만들었습니다. 덕분에 브랜치별 설정 없이 모든 프리뷰 배포에서 OAuth가 동작하며, 호스트 감지는 `trustHost`에 맡깁니다.

## 아키텍처

```
src/
  app/            라우트 + API 라우트 핸들러 (App Router)
  components/     UI (+ ui/, ui/icons/)
  context/        Auth / SWR 프로바이더, 캐시 키 컨텍스트
  hooks/          SWR 데이터 훅 (posts, 무한 스크롤, me)
  lib/            공통 유틸: http 에러, zod 검증, fetcher, pagination
  model/          도메인 타입
  service/        Sanity 데이터 접근 (파라미터화 GROQ)
  util/           세션 헬퍼 (서버 권한), 날짜 포맷
  auth.ts         Auth.js v5 — Node 설정 (Sanity 기반 signIn)
  auth.config.ts  Auth.js v5 — edge-safe 베이스 설정
  proxy.ts        라우트 보호 (Next 16 proxy 컨벤션)
tests/e2e/        Playwright 스펙 + Auth.js 쿠키 픽스처
```

## 시작하기

### 사전 준비
- Node.js **20+**
- **Editor** API 토큰(읽기 **및** 쓰기)이 있는 [Sanity](https://www.sanity.io/) 프로젝트
- Google OAuth 자격 증명 (Google Cloud Console)

### 환경변수
```bash
cp .env.example .env.local   # 실제 값으로 채우기
```

| 변수 | 설명 |
| --- | --- |
| `GOOGLE_OAUTH_ID` / `GOOGLE_OAUTH_SECRET` | Google OAuth 클라이언트 자격 증명 |
| `AUTH_SECRET` | 랜덤 시크릿 (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | 로컬 base URL (예: `http://localhost:3000`); Vercel에선 생략(`trustHost` 사용) |
| `AUTH_REDIRECT_PROXY_URL` | *(배포 전용)* 프리뷰 OAuth를 프로덕션 콜백으로 경유 |
| `SANITY_STUDIO_SANITY_PROJECT_ID` / `SANITY_STUDIO_SANITY_DATASET` | Sanity 프로젝트 + 데이터셋 |
| `SANITY_SECRET_TOKEN` | Sanity **Editor** 토큰(읽기 **및** 쓰기) |
| `ADMIN_ID` / `NEXT_PUBLIC_ADMIN_ID` | 서버 전용 관리자 아이디 / 클라이언트 UI 플래그 |

> Sanity 토큰은 반드시 **Editor**(쓰기) 권한이어야 합니다. 아니면 좋아요/댓글/팔로우/게시물 생성이 403으로 실패합니다.

### 설치 & 실행
```bash
npm install
npm run dev          # http://localhost:3000
npm run seed         # 선택: 더미 게시물 시드 (Scripts 참고)
```

## 스크립트

| 스크립트 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 (Turbopack) |
| `npm run build` / `start` | 프로덕션 빌드 / 서빙 |
| `npm run lint` / `typecheck` | ESLint(flat config) / `tsc --noEmit` |
| `npm test` / `test:watch` | Vitest 단위 테스트 |
| `npm run test:e2e` | Playwright E2E (빌드 + 서빙 후 실행) |
| `npm run seed` | Sanity에 더미 게시물 시드 (`-- --count=N`, `--user=<name>`, `--clean`) |

## 로드맵

다음 작업: 모달 포커스 트랩 전면 적용, 태그 기반 Sanity 캐싱 전략(토큰 인증 read의 CDN 동작을 신중히 검증),
의존성 최신화.
