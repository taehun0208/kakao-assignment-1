# Next.js + FastAPI로 Todo 앱 만들기

## 과제 목표

- 2차 과제의 React Todo 앱을 Next.js App Router 구조로 옮기기
- Server Component와 Client Component를 역할에 맞게 구분해서 적용하기
- FastAPI로 Todo CRUD API를 직접 구현하고, Next.js에서 연동하는 풀스택 흐름 경험하기
- 로컬스토리지 기반 상태 관리에서 서버 API 기반 데이터 흐름으로 전환하기

---

## 과제 위치

- 브랜치명 : `week-03-곽태훈`
- 주요 파일 : `frontend/app/` / `backend/main.py`

---

## 2차 과제 기능 분리 정리

| 기능 | 2차 과제 위치 | 3차 과제 위치 |
| --- | --- | --- |
| Todo 저장 | localStorage | FastAPI + SQLite |
| Todo CRUD | useTodos 커스텀 훅 | FastAPI CRUD API + Server Actions |
| 상태 필터링 | 클라이언트 배열 filter | URL query → FastAPI 서버 필터링 |
| 검색 | 없음 | URL query → FastAPI 서버 검색 |
| 날짜/주간 뷰 | React 컴포넌트 상태 | URL query 기반 화면 상태 |
| 화면 렌더링 | Vite SPA | Next.js App Router 페이지 |

---

## 구현한 기능

- [x] Todo CRUD 구현하기 (FastAPI + SQLite)
- [x] 상태별 필터링 구현하기 (전체 / 진행 중 / 완료, URL query 기반)
- [x] 검색 기능 구현하기 (URL query → 서버 필터링)
- [x] Todo 주간 뷰 구현하기
- [x] Server Component / Client Component 구분
- [x] 환경변수 분리

---

## AI 활용 내역

### 1. 프로젝트 초기 구조 설계

**AI 활용 내용**

2차 과제의 기능 목록을 전달하고, 어떤 기능이 프론트엔드에 남고 어떤 기능이 FastAPI로 넘어가야 하는지 분류를 요청했습니다. App Router 기반 디렉토리 구조도 함께 잡았습니다.

```
2차 과제의 Todo 앱을 Next.js App Router + FastAPI로 전환해줘.
프론트는 frontend/, 백엔드는 backend/로 분리하고,
Server Component / Client Component / Server Actions / Route Handler 역할을 구분해서 구조를 잡아줘.
```

**직접 수정한 부분**

AI가 생성한 초기 구조에서 컴포넌트 위치가 `app/components/`가 아닌 `src/components/`로 잡혀 있었습니다. App Router에서는 `app/` 안에 컴포넌트를 두는 것이 라우팅과 서버 컴포넌트 경계를 명확히 하는 데 유리해서 직접 옮겼습니다.

---

### 2. FastAPI CRUD API 구현

**AI 활용 내용**

Todo 모델(`id`, `text`, `completed`, `date`)을 정의하고, SQLite 연동과 4개 엔드포인트(`GET /todos`, `POST /todos`, `PUT /todos/{id}`, `DELETE /todos/{id}`)를 구현하도록 요청했습니다.

**직접 수정한 부분**

**문제 1 — Pydantic 검증이 없어서 DB에 잘못된 데이터가 들어올 수 있음**

AI 초기 코드에서는 `TodoCreate`에 필드 정의만 있었고 유효성 검증이 없었습니다. 공백만 있는 text나 `2026-02-31` 같은 달력에 존재하지 않는 날짜가 그대로 저장될 수 있는 구조였습니다.

`field_validator`로 text 공백 처리와 날짜 실존 여부 검증을 추가했습니다. 프론트엔드 입력값 검증은 UX를 위한 것이고, 백엔드 검증은 API 계약을 지키기 위한 최종 방어선이라는 걸 이 과정에서 확인했습니다.

```python
# 수정 전 — 검증 없음
class TodoCreate(BaseModel):
    text: str
    date: str

# 수정 후 — 실존 날짜 검증 추가
@field_validator("date")
@classmethod
def validate_date(cls, value: str) -> str:
    try:
        Date.fromisoformat(value)
    except ValueError as error:
        raise ValueError("Date must be a valid YYYY-MM-DD value") from error
    return value
```

**문제 2 — CORS 설정에 origin이 하드코딩되어 있음**

`allow_origins=["http://localhost:3000"]`이 코드에 직접 박혀 있었습니다. `FRONTEND_ORIGIN` 환경변수로 분리해서 `.env.local`에서 관리하도록 변경했습니다.

---

### 3. Next.js 페이지와 Server Actions 연동

**AI 활용 내용**

목록 페이지(Server Component)에서 데이터를 조회하고, 생성·수정·삭제는 Server Actions(`actions.ts`)에서 FastAPI를 직접 호출하도록 구현했습니다.

**직접 수정한 부분**

**문제 3 — 수정 폼 빈 값 제출 시 피드백 없음**

`updateTodo` Action에서 빈 text를 제출하면 `buildTodoListPath(query, "empty")`로 목록 페이지로 리다이렉트됐습니다. 사용자는 수정 화면에서 저장을 눌렀는데 목록으로 튕겨나가는 상황이 됩니다.

`buildTodoDetailPath`에 `error` 파라미터를 추가하고, `updateTodo` Action이 빈 값일 때 수정 페이지로 돌아오도록 변경했습니다. 수정 페이지에서는 `searchParams.error`를 읽어 인라인 에러 메시지와 빨간 테두리를 표시합니다.

```ts
// 수정 전 — 빈 값이면 목록으로 리다이렉트
if (!id || !text) {
  redirect(buildTodoListPath(query, "empty"));
}

// 수정 후 — id 없으면 목록, text 없으면 수정 페이지로 돌아옴
if (!id) {
  redirect(buildTodoListPath(query));
}
if (!text) {
  redirect(buildTodoDetailPath(id, query, "empty"));
}
```

**문제 4 — `new/page.tsx`에 `firstValue` 헬퍼 함수 중복**

`/todos/new` 페이지에서 URL 파라미터를 파싱하기 위해 `firstValue` 함수를 별도로 정의하고 있었습니다. 이미 `todo-query.ts`에 `parseTodoPageQuery`가 있는데 사용하지 않고 같은 로직을 다시 구현한 것입니다.

`parseTodoPageQuery`를 직접 사용하도록 변경해 중복을 제거했습니다.

```ts
// 수정 전 — firstValue 함수를 별도 정의
function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
const filter = (firstValue(params.filter) || "all") as FilterType;
const search = firstValue(params.search) || "";
const date = firstValue(params.date) || toDateString(new Date());

// 수정 후 — parseTodoPageQuery 재사용
const query = parseTodoPageQuery(params, toDateString(new Date()));
```

---

### 4. URL 상태와 외부 API 데이터 안정성 개선

**발견한 문제**

목록 페이지, 필터 탭, 주간 뷰, 수정 링크, Server Action이 각각 URL 파라미터를 직접 조립하고 있었습니다. `filter`, `search`, `date`, `week` 네 개의 상태를 여러 곳에서 다루다 보면, 링크 하나가 검색 조건을 잃는 식의 회귀가 발생하기 쉽습니다.

Axios의 `get<Todo[]>()` 제네릭도 TypeScript 컴파일 시점에만 동작합니다. FastAPI 응답 형태가 바뀌어도 런타임에서는 그대로 UI로 전달되는 구조였습니다.

**개선한 부분**

`app/lib/todo-query.ts`에 URL 파라미터 해석과 목록/수정 URL 생성을 모았습니다. 잘못된 필터, 존재하지 않는 날짜, 소수점 week offset은 안전한 기본값으로 정규화합니다. 순수 함수이므로 Vitest 단위 테스트로 경계값을 검증했습니다.

```ts
const query = parseTodoPageQuery(params, toDateString(new Date()));
const href = buildTodoListPath(query);
```

`app/lib/api.ts`의 `isTodo`, `parseTodo`, `parseTodos`는 FastAPI 응답이 `id`, `text`, `completed`, `date` 형식을 만족하지 않으면 즉시 예외를 던집니다. 오류 화면은 `error.tsx`가 담당합니다.

```
$ npm test
 Test Files  1 passed (1)
      Tests  3 passed (3)
```

---

## 구현하면서 고민한 점

**고민한 점: Server Action과 Route Handler가 모두 필요한가?**

목록 페이지의 Server Component와 Server Action은 서버에서 FastAPI를 직접 호출합니다. 폼 제출에는 `revalidatePath`와 `redirect`가 자연스럽게 따라옵니다. 반면 `app/api/todos/route.ts`는 브라우저 JavaScript나 외부 클라이언트가 HTTP 엔드포인트로 접근할 때 FastAPI를 숨기는 프록시 역할입니다. 같은 서버 코드라도 호출 주체가 달라 역할을 분리했습니다.

**고민한 점: 주간 뷰에서 전체 Todo를 가져오는 게 맞는가?**

목록 페이지에서 `fetchTodos({})`로 전체 Todo를 불러와 주간 뷰의 dot 인디케이터를 그립니다. 데이터가 많아지면 불필요한 항목까지 다 받아오는 문제가 있습니다. FastAPI에 주차 날짜 범위 파라미터(`date_from`, `date_to`)를 추가하면 해결되는데, 지금은 과제 범위가 커질 것 같아 남겨뒀습니다.

---

## 과제를 통해 익힌 것

- **App Router 데이터 흐름**: 목록 조회는 Server Component, 사용자 명령은 Server Action으로 처리하는 패턴이 명확해졌습니다.
- **URL을 상태로 다루는 방법**: 필터, 검색, 날짜, 주차를 URL에 저장하면 새로고침과 공유 링크에서도 화면 상태가 유지됩니다. 2차에서 `useState`로 관리하던 것과 비교하면 차이가 확실합니다.
- **정적 타입과 런타임 검증의 차이**: TypeScript 타입이 네트워크 응답을 실제로 검증하지 않는다는 걸 이번 과제에서 직접 확인했습니다. 외부 API 경계에서는 런타임 검증이 별도로 필요합니다.
- **서버 검증의 역할**: 클라이언트 검증은 UX, FastAPI/Pydantic 검증은 데이터 무결성을 담당합니다. 둘은 목적이 달라 둘 다 있어야 합니다.

---

## 과제 회고

**잘한 점**

단순히 기능을 구현하는 데서 끝내지 않고, URL 상태와 외부 API 응답처럼 오류가 들어오기 쉬운 경계를 명시적으로 검증했습니다. `parseTodoPageQuery`와 `buildTodoListPath`를 한 곳에 모은 덕분에 여러 컴포넌트에서 URL을 조립할 때 조건을 빠뜨리는 실수를 줄일 수 있었습니다.

**아쉬운 점**

2차 과제 회고에서 "테스트를 먼저 작성했다면 문제를 구현 시점에 발견할 수 있었을 것"이라고 썼는데, 이번에도 같은 순서가 됐습니다. `todo-query.ts` 단위 테스트는 구현 후에 추가했습니다. 특히 `buildTodoDetailPath`에 `error` 파라미터를 추가한 것도 수정 폼 에러 처리를 구현하다가 필요성을 느낀 것인데, 미리 테스트를 통해 API를 설계했다면 더 자연스러웠을 것 같습니다.

**다음에 시도해볼 것**

- FastAPI CRUD 통합 테스트 — 테스트 전용 DB를 사용하는 pytest 기반 테스트 추가
- `useActionState`로 Server Action 성공/실패 상태를 연결해 제출 중 UI와 API 오류 메시지 개선
- 주간 뷰에서 전체 Todo 대신 날짜 범위만 요청하도록 FastAPI에 `date_from` / `date_to` 파라미터 추가

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
