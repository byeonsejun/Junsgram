# 작업 인수인계 (Handoff)

> 컨텍스트 클리어 후 작업 재개용 메모. 상세 리팩토링 계획/체크리스트는 [`REFACTORING.md`](./REFACTORING.md) 참고.
> 최종 갱신: 2026-06-21

## 현재 상태 (한눈에)

- **프로젝트**: Junsgram — 인스타그램 클론 (Next.js 16 / React 19 / Auth.js v5 / Sanity / SWR / Tailwind).
- **전면 리뉴얼 PR #7 머지 완료** → `release` 브랜치에 반영됨 (merge commit `4a87fc5`).
- 현재 체크아웃 브랜치: **`release`** (origin과 동기화됨).
- CI(GitHub Actions: lint·typecheck·test·build) + Vercel 프리뷰 **둘 다 green**.
- 통합 작업 브랜치 `refactor/full-renewal`은 머지됨 (로컬/원격에 남아있음, 삭제해도 무방).

## 꼭 알아야 할 것 (재발 방지 / 함정)

1. **Sanity 토큰은 Editor(쓰기) 권한 필요** — `.env.local`의 `SANITY_SECRET_TOKEN`. Viewer(읽기전용)면
   좋아요/댓글/팔로우/글쓰기가 전부 403→500. (현재는 Editor 토큰으로 교체되어 정상.)
2. **Auth.js v5의 `user.id`는 매 로그인 랜덤 UUID** — 절대 이걸 Sanity 문서 id로 쓰면 안 됨.
   `account.providerAccountId`(Google `sub`)를 써야 함. (`auth.ts`/`auth.config.ts`에 반영됨.
   과거 이 버그로 유저 중복 5개 생겼다가 정리함.)
3. **v4→v5 마이그레이션 후 기존 세션 쿠키는 복호화 불가** — 코드 바꾼 뒤엔 **로그아웃/재로그인**(또는
   쿠키 삭제) 해야 세션 id가 올바르게 갱신됨.
4. **`.npmrc`에 `legacy-peer-deps=true`** — swr/react-multi-carousel 등이 React 19 peer 범위를 안 올려서
   필요. 지우면 Vercel `npm install`이 ERESOLVE로 깨짐.
5. **환경변수**: `ADMIN_ID`(서버 전용 권한 판별) + `NEXT_PUBLIC_ADMIN_ID`(클라 UI용) 둘 다 필요.
   전체 목록은 `.env.example` 참고.

## 검증 방법 (작업 후 항상)

```bash
npm run lint        # eslint .
npm run typecheck   # tsc --noEmit
npm test            # vitest (현재 14개)
npm run build       # next build (Turbopack)
```
실제 동작(로그인/게시/좋아요/댓글/팔로우)은 라이브 Google OAuth + Sanity가 필요 → 브라우저에서 수동 확인.

## 완료된 작업 (Phase 1~7d, 모두 release에 머지됨)

- **보안**: GROQ 파라미터화, `searchUsers` 우선순위 버그, 모든 mutation API 서버측 행위자/권한 검증,
  zod 입력 검증(+`sanityId` 정규식으로 patch 셀렉터 인젝션 차단), 시크릿 감사, `.env.example`.
- **프레임워크**: Next 13→16.2.9, React 18→19, async Request API, `images.remotePatterns`, es2022,
  `middleware.ts→proxy.ts`. NextAuth v4→Auth.js v5(split config). 유저 id를 Google sub로 고정.
- **API 계약**: 표준 에러(`lib/http.ts`, 업스트림 status 보존), `res.ok` fetcher(`lib/fetcher.ts`),
  API 경로 상수(`lib/routes.ts`), 서버측 업로드 검증.
- **코드 품질**: 버튼 통합, `CacheKeysContext` 오타, 서비스 반환 타입, 죽은 코드/console.log 제거.
  버그: PostDetail alt 텍스트, 안정적 React key, UserSearch 중복 key.
- **테스트/도구/UX**: Vitest 14개, GitHub Actions CI, README, ESLint flat config(ESLint 9),
  클라 업로드 검증, error/loading/global-error 바운더리, 모달 a11y(dialog/Escape/스크롤 잠금),
  아이콘 버튼 aria-label, 그리드 이미지 sizes.

## 남은 작업 (다음 진행)

### ▶ 바로 다음: #2 — 시드 데이터 → 페이지네이션 / 캐싱
- **페이지네이션/무한 스크롤**: 현재 실데이터가 적어(게시물 ~3개) 효과 확인이 어려움.
  → 먼저 **더미 게시물 시드 스크립트**가 필요. 그 뒤 GROQ ranged 쿼리 + `useSWRInfinite` +
  IntersectionObserver. **브라우저 검증 필수.**
- **캐싱 전략**: `service/sanity.ts`가 `useCdn:false` + `cache:'no-store'`. CDN + 태그 재검증 도입 시
  **토큰 인증 read의 CDN 동작을 신중히 검증**해야 함(잘못 켜면 read 실패 가능). mutation마다 무효화 배선 필요.

### 그 외 남은 항목 (REFACTORING.md에 추적)
- 스켈레톤/스피너 전면 통일, 모달 포커스 트랩, 피드 이미지 sizes 추가 튜닝.
- Playwright E2E (OAuth 모킹 필요), Prettier 도입.
- 한글 주석 전면 영어화(보류 — 변경폭 대비 가치 낮음), 서비스 mutation 결과 타입.
- (데이터) 같은 이메일의 유저 문서가 일부 중복 존재할 수 있음 — 필요 시 Sanity에서 정리.

## 재개 시 첫 단계 제안
1. `git checkout release && git pull` 로 최신 확인.
2. 새 작업 브랜치 생성 (예: `feat/seed-and-pagination`).
3. 시드 스크립트로 더미 게시물 생성 → 페이지네이션 구현 → 브라우저 검증.
