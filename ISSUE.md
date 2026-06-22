# Next.js + FastAPI로 Todo 앱 만들기

## 과제 목표

- React(Vite) 기반 Todo 앱을 Next.js App Router 구조로 다시 구현하기
- 로컬스토리지 기반 상태 관리를 FastAPI + SQLite 서버 API 흐름으로 전환하기
- Server Component, Client Component, Server Actions, Route Handler 역할 구분하기
- 환경변수로 프론트엔드와 백엔드 URL 및 DB 설정 분리하기

---

## 과제 위치

- 프로젝트 폴더: `kakao-assignment-3/`
- 프론트엔드: `frontend/`
- 백엔드: `backend/`

---

## 2차 과제 기능 분리 정리

| 기능 | 2차 과제 위치 | 3차 과제 위치 |
| --- | --- | --- |
| Todo 저장 | localStorage | FastAPI + SQLite |
| Todo CRUD | React hook 내부 상태 변경 | FastAPI CRUD API + Server Actions |
| 상태 필터링 | 클라이언트 배열 필터링 | URL query 전달 후 FastAPI에서 필터링 |
| 검색 | 새로 추가 | URL query 전달 후 FastAPI에서 검색 |
| 날짜 선택/주간 뷰 | React 컴포넌트 상태 | Next.js URL query 기반 화면 상태 |
| 화면 렌더링 | Vite SPA | Next.js App Router 페이지 |

---

## 구현한 기능

- [x] 프론트엔드와 백엔드 디렉토리 분리
- [x] Next.js App Router 기본 구조 구성
- [x] FastAPI CRUD API 구현
- [x] SQLite DB 모델과 Pydantic 스키마 구현
- [x] `route.ts` 기반 백엔드 프록시 작성
- [x] `actions.ts` 기반 Server Actions 작성
- [x] Todo 목록, 생성, 수정 페이지 구현
- [x] `loading.tsx`, `error.tsx` 구현
- [x] 환경변수 분리
- [x] 서버 기반 필터링 구현
- [x] 서버 기반 검색 구현
- [x] URL 상태 해석 및 링크 조립 순수 함수 분리
- [x] FastAPI 응답 런타임 타입 검증
- [x] URL 상태 순수 함수 단위 테스트

---

## AI 활용 내역

### 1. 프로젝트 구조 설계

**AI 활용 내용**

2차 과제의 Vite Todo 구조를 확인한 뒤, 어떤 기능이 프론트엔드에 남고 어떤 기능이 백엔드로 넘어가야 하는지 분류했습니다.

**직접 확인할 부분**

- `app/` 디렉토리가 URL 라우팅의 기준이 되는지 확인
- `frontend/`와 `backend/`가 명확히 분리되어 있는지 확인
- `ISSUE.md`에 기능 분리 기준이 기록되어 있는지 확인

### 2. FastAPI CRUD API 구현

**AI 활용 내용**

Todo 모델을 `id`, `text`, `completed`, `date`로 정의하고, `GET /todos`, `POST /todos`, `PUT /todos/{id}`, `DELETE /todos/{id}`를 구현했습니다. 필터링과 검색은 쿼리 파라미터로 처리하도록 확장했습니다.

**직접 확인할 부분**

- `localhost:8000/docs`에서 API 문서 확인
- Todo 생성 후 `todos.db`에 데이터가 저장되는지 확인
- `filter`, `search`, `date` 쿼리 조합이 정상 동작하는지 확인

### 3. Next.js 페이지와 서버 연동

**AI 활용 내용**

목록 페이지는 Server Component로 데이터를 불러오고, 생성/수정/삭제는 Server Actions에서 FastAPI를 호출하도록 구현했습니다. 외부 HTTP 프록시 역할을 위해 `app/api/todos/route.ts`와 동적 API Route도 추가했습니다.

**직접 확인할 부분**

- `localhost:3000/todos`에서 목록 확인
- 생성, 완료 토글, 수정, 삭제 후 화면 갱신 확인
- 검색어와 필터가 URL에 남는지 확인

### 4. URL 상태와 외부 API 데이터의 안정성 개선

**발견한 문제**

처음에는 목록 페이지, 필터 탭, 주간 뷰, 수정 링크, Server Action이 각각 `URLSearchParams`를 직접 조립했습니다. 같은 상태(`filter`, `search`, `date`, `week`)를 여러 곳에서 다루면 한 화면의 링크만 검색 조건을 잃는 식의 회귀가 생길 수 있습니다.

또한 Axios의 `get<Todo[]>()` 제네릭은 TypeScript 컴파일 시점에만 동작합니다. FastAPI 응답이 변경되거나 잘못된 데이터가 들어와도 런타임에서는 그대로 UI로 전달될 수 있었습니다.

**개선한 부분**

`app/lib/todo-query.ts`에 URL 파라미터 해석과 목록/수정 URL 생성을 모았습니다. 잘못된 필터, 존재하지 않는 날짜, 비정수 주차 offset은 안전한 기본값으로 정규화합니다. 이 모듈은 입력과 출력만 다루는 순수 함수이므로 Vitest 단위 테스트로 정상/비정상 URL을 검증했습니다.

```ts
const query = parseTodoPageQuery(params, toDateString(new Date()));
const href = buildTodoListPath(query);
```

`app/lib/api.ts`에는 `isTodo`, `parseTodo`, `parseTodos`를 추가했습니다. FastAPI에서 받은 값이 `id`, `text`, `completed`, `date` 형식을 만족하지 않으면 즉시 예외를 던지고 `error.tsx`가 오류 화면을 담당합니다.

백엔드에서는 Pydantic `field_validator`로 공백만 있는 Todo와 실제 달력에 존재하지 않는 날짜를 거절했습니다. 프론트의 빈 값 검증은 사용자 경험을 위한 것이고, 백엔드 검증은 API 계약을 지키기 위한 최종 방어선이라는 점을 확인했습니다.

**직접 확인할 부분**

- `npm test`에서 URL 상태 테스트 통과 확인
- `/todos?filter=unknown&date=2026-02-31&week=1.5`로 접근해 기본값 처리 확인
- Swagger에서 공백 `text` 또는 `2026-02-31` 날짜 요청 시 `422` 확인
- 존재하지 않는 Todo 수정 URL에서 목록으로 안전하게 돌아오는지 확인

---

## 구현하면서 고민한 점

**고민한 점: Server Action과 Route Handler는 모두 필요한가?**

목록 페이지의 Server Component와 Server Action은 서버에서 FastAPI를 직접 호출합니다. 이 경로는 페이지 렌더링과 폼 제출에 적합하고, `revalidatePath` 및 `redirect`와 자연스럽게 결합됩니다. 반면 `app/api/todos/route.ts`는 브라우저 JavaScript나 외부 클라이언트가 HTTP 엔드포인트를 통해 접근해야 할 때 FastAPI를 숨기는 프록시 역할을 합니다. 같은 서버 코드라도 호출 주체가 다르므로 둘의 책임을 분리했습니다.

**고민한 점: 프론트에서 이미 검증하는데 백엔드 검증이 필요한가?**

필요합니다. UI 입력값은 브라우저에서 우회할 수 있고, Swagger나 다른 클라이언트도 API를 호출할 수 있습니다. 공백 문자열과 유효하지 않은 날짜를 Pydantic 검증으로 막아 DB가 잘못된 상태가 되는 것을 방지했습니다.

---

## 과제를 통해 익힌 것

- **App Router의 데이터 흐름**: 페이지는 기본 Server Component로 데이터를 조회하고, 사용자 명령은 Server Action으로 처리할 수 있습니다.
- **URL을 상태로 다루는 방법**: 필터, 검색, 선택 날짜, 주차를 URL에 저장하면 새로고침과 공유 링크에서도 화면 상태가 유지됩니다.
- **순수 함수와 회귀 방지**: URL 해석과 URL 생성처럼 외부 상태가 없는 코드는 분리하면 테스트가 쉬워지고, 여러 컴포넌트의 중복을 줄일 수 있습니다.
- **정적 타입과 런타임 검증의 차이**: TypeScript 타입은 네트워크 응답을 실제로 검증하지 않습니다. 외부 API 경계에서는 런타임 검증이 필요합니다.
- **서버 검증의 역할**: 클라이언트 검증은 UX, FastAPI/Pydantic 검증은 데이터 무결성을 담당합니다.

---

## 과제 회고

**잘한 점**

2차 과제에서 localStorage를 다루던 `useTodos`의 책임을 그대로 옮기지 않고, 데이터 소유권을 FastAPI로 이동시켰습니다. 그 결과 목록 조회는 Server Component, 변경 요청은 Server Action, HTTP 프록시는 Route Handler라는 역할 구분이 생겼습니다. 또한 단순히 기능을 구현하는 데서 끝내지 않고 URL 상태와 외부 API 응답처럼 오류가 들어오기 쉬운 경계를 명시적으로 검증했습니다.

**보완한 점**

멘토 피드백에서 배운 "컴포넌트가 상태 변경의 세부 구현을 직접 알지 않도록 만들기"를 URL 상태에도 적용했습니다. 각 컴포넌트가 `URLSearchParams`를 직접 다루지 않고 `todo-query.ts`의 동작 단위 API를 사용하도록 바꿨습니다. 이 변경으로 필터, 검색, 날짜, 주차가 포함된 링크의 규칙이 한 곳에 모였고, 테스트로 회귀를 막을 수 있게 됐습니다.

**다음에 시도해볼 것**

- FastAPI 테스트 전용 DB를 사용하는 CRUD 통합 테스트 추가
- Server Action의 성공/실패 상태를 `useActionState`로 연결해 제출 중 UI와 API 오류 메시지 개선
- Todo `date` 컬럼을 문자열 대신 DB 날짜 타입으로 전환하고 날짜 범위 조회 최적화

---

## 실행 방법

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

```bash
cd frontend
npm install
npm run dev
```

---

## 제출 전 체크리스트

- [ ] `localhost:8000/docs`에서 API 문서 확인
- [ ] `localhost:3000/todos`에서 전체 CRUD 확인
- [ ] 빈 입력 제출 시 에러 메시지 확인
- [ ] 필터와 검색 URL 파라미터 유지 확인
- [ ] `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- [ ] 불필요한 로그와 주석 제거 확인
