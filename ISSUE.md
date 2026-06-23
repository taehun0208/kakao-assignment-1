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

AI가 생성한 초기 구조에서 컴포넌트 위치가 `src/components/`로 잡혀 있었습니다. App Router에서는 `app/` 안에 컴포넌트를 두는 것이 서버/클라이언트 경계를 명확히 하는 데 유리해서 직접 옮겼습니다.

---

### 2. FastAPI CRUD API 구현

**AI 활용 내용**

Todo 모델(`id`, `text`, `completed`, `date`)을 정의하고, SQLite 연동과 4개 엔드포인트(`GET /todos`, `POST /todos`, `PUT /todos/{id}`, `DELETE /todos/{id}`)를 구현하도록 요청했습니다.

**직접 수정한 부분**

**문제 1 — Pydantic 검증 없이 잘못된 데이터가 DB에 저장될 수 있음**

AI 초기 코드에는 `TodoCreate`에 필드 정의만 있고 유효성 검증이 없었습니다. 공백만 있는 text나 `2026-02-31` 같이 달력에 존재하지 않는 날짜가 그대로 저장될 수 있었습니다.

`field_validator`로 text 공백 처리와 날짜 실존 여부를 검증하도록 추가했습니다. 프론트엔드 검증은 UX를 위한 것이고, 백엔드 검증은 API 계약을 지키기 위한 최종 방어선이라는 걸 이 과정에서 확인했습니다.

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

**문제 2 — CORS 설정에 origin 하드코딩**

`allow_origins=["http://localhost:3000"]`이 코드에 직접 박혀 있었습니다. `FRONTEND_ORIGIN` 환경변수로 분리해서 `.env.local`에서 관리하도록 변경했습니다.

---

### 3. Next.js 페이지와 Server Actions 연동

**AI 활용 내용**

목록 페이지(Server Component)에서 데이터를 조회하고, 생성·수정·삭제는 Server Actions(`actions.ts`)에서 FastAPI를 직접 호출하도록 구현했습니다.

**직접 수정한 부분**

**문제 3 — `fetchTodos` 데이터 조회 함수가 뮤테이션 파일에 섞임**

`actions.ts`에 `"use server"` 선언이 있고, 초기 코드에서는 데이터 조회용 `fetchTodos`를 여기에 넣었습니다. Server Component에서 `"use server"` 함수를 굳이 거치는 건 불필요한 서버 액션 경계를 하나 더 만드는 것과 같습니다. `fetchTodos` 래퍼를 제거하고, 목록 페이지에서 `lib/api.ts`의 `getTodos`를 직접 호출하도록 바꿨습니다.

```ts
// 수정 전 — actions.ts에 데이터 조회 래퍼
export async function fetchTodos(query: TodoQuery) {
  return getTodos(query);
}

// 수정 후 — 목록 페이지에서 직접 호출
import { getTodos } from "../lib/api";
const todos = await getTodos({ filter, search, date });
```

2차 과제 피드백에서 "useTodos가 setWeekOffset을 그대로 노출해서 비즈니스 로직이 App.tsx로 흘러나갔다"는 지적이 있었습니다. 3차에서 같은 문제가 다른 형태로 나타난 것입니다. 데이터 조회는 Server Component의 책임이고, `actions.ts`는 뮤테이션(생성·수정·삭제·리다이렉트)만 담당해야 합니다.

**문제 4 — Route Handler가 임의의 URL 파라미터를 FastAPI로 그대로 전달**

`api/todos/route.ts`에서 `Object.fromEntries(searchParams.entries())`로 URL 파라미터 전체를 `getTodos`에 넘겼습니다. 알 수 없는 파라미터가 FastAPI로 그대로 전달되고, 에러가 발생해도 처리되지 않았습니다.

알려진 파라미터만 추출하고, try/catch로 에러를 정규화해서 HTTP 응답으로 변환하도록 수정했습니다.

```ts
// 수정 전 — 파라미터 전체를 그대로 전달
const params = Object.fromEntries(request.nextUrl.searchParams.entries());
const todos = await getTodos(params);

// 수정 후 — 타입이 확정된 파라미터만 전달 + 에러 처리
try {
  const sp = request.nextUrl.searchParams;
  const todos = await getTodos({
    filter: (sp.get("filter") ?? undefined) as FilterType | undefined,
    search: sp.get("search") ?? undefined,
    date: sp.get("date") ?? undefined,
  });
  return NextResponse.json(todos);
} catch (error) {
  const message = error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
  return NextResponse.json({ error: message }, { status: 500 });
}
```

**문제 5 — axios 에러가 그대로 노출됨**

`getTodos`가 실패하면 `AxiosError`가 그대로 던져졌습니다. FastAPI의 `detail` 필드 구조나 내부 스택 정보가 UI에 노출될 수 있었습니다. `normalizeError` 함수를 추가해서 상황별로 사람이 읽을 수 있는 메시지로 정규화했습니다.

```ts
// 수정 전 — AxiosError 그대로 전파
const response = await api.get<unknown>("/todos", { params: query });

// 수정 후 — 에러 정규화
function normalizeError(error: unknown): Error {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return new Error(detail);
    if (error.response?.status === 404) return new Error("Todo를 찾을 수 없습니다.");
    if (error.code === "ECONNREFUSED") return new Error("서버에 연결할 수 없습니다.");
    return new Error("API 요청에 실패했습니다.");
  }
  ...
}
```

2차 과제 피드백에서 "loadTodos의 `as Todo[]` 캐스팅이 외부 입력 검증 없이 빠져나간다"는 지적이 있었습니다. `parseTodo`/`parseTodos`로 런타임 타입 검증은 이미 처리했지만, 에러 자체가 AxiosError 그대로 노출되는 부분은 이번에 함께 정리했습니다.

**문제 6 — 수정 폼 빈 값 제출 시 목록으로 튕겨남**

`updateTodo` Action에서 빈 text를 제출하면 목록 페이지로 리다이렉트됐습니다. 사용자 입장에서는 저장을 눌렀는데 수정 화면이 사라지는 상황이라 왜 취소됐는지 알 수 없습니다.

`buildTodoDetailPath`에 `error` 파라미터를 추가하고, 빈 값 제출 시 수정 페이지로 돌아오면서 인라인 에러를 표시하도록 변경했습니다.

```ts
// 수정 전
if (!id || !text) {
  redirect(buildTodoListPath(query, "empty")); // 목록으로 튕김
}

// 수정 후
if (!id) redirect(buildTodoListPath(query));
if (!text) redirect(buildTodoDetailPath(id, query, "empty")); // 수정 페이지로 돌아옴
```

---

### 4. URL 상태와 외부 API 데이터 안정성 개선

**발견한 문제**

목록 페이지, 필터 탭, 주간 뷰, 수정 링크, Server Action이 각각 URL 파라미터를 직접 조립하고 있었습니다. `filter`, `search`, `date`, `week` 네 개의 상태를 여러 곳에서 다루다 보면, 링크 하나가 검색 조건을 잃는 식의 회귀가 생기기 쉽습니다.

**개선한 부분**

`app/lib/todo-query.ts`에 URL 파라미터 해석과 목록/수정 URL 생성을 모았습니다. 잘못된 필터, 존재하지 않는 날짜, 소수점 week offset은 안전한 기본값으로 정규화합니다. 순수 함수이므로 Vitest 단위 테스트로 경계값을 검증했습니다.

---

### 5. WeekView 날짜 이동 버그 수정

**발견한 문제**

이전/다음 주 버튼을 클릭하면 날짜가 항상 해당 주의 월요일로 초기화됐습니다. 수요일을 보고 있다가 이전 주로 이동하면 지난주 수요일이 아닌 지난주 월요일로 이동하는 문제입니다.

```ts
// 수정 전 — 항상 월요일로 이동
href={buildTodoListPath({ ..., date: toDateString(getWeekDates(week - 1)[0]), week: week - 1 })}
```

`date.ts`에 `offsetDateString`을 추가해 선택된 날짜에서 정확히 ±7일을 계산하도록 변경했습니다.

```ts
// 수정 후 — 요일을 유지하며 이동
const prevDate = offsetDateString(selectedDate, -7);
const nextDate = offsetDateString(selectedDate, 7);

href={buildTodoListPath({ filter, search, date: prevDate, week: week - 1 })}
```

**WeekView 전체 Todo 과다 조회 문제도 함께 수정**

기존 코드에서 `getTodos({})`로 DB의 모든 Todo를 불러와 WeekView에 전달했습니다. 백엔드에 `date_from` / `date_to` 파라미터를 추가하고, 현재 주간 범위만 조회하도록 변경했습니다.

```ts
// 수정 전 — 전체 조회
fetchTodos({})

// 수정 후 — 주간 범위만 조회
const weekDates = getWeekDates(query.week);
getTodos({ date_from: toDateString(weekDates[0]), date_to: toDateString(weekDates[6]) })
```

```python
# backend/main.py에 date_from, date_to 추가
if date_from:
    query = query.filter(Todo.date >= date_from)
if date_to:
    query = query.filter(Todo.date <= date_to)
```

---

## 테스트

```
$ npm test

 Test Files  2 passed (2)
      Tests  16 passed (16)
```

`date.test.ts` 추가: `toDateString`, `getMondayOfWeek`, `getWeekDates`, `offsetDateString` 경계값 테스트

`todo-query.test.ts` 보완: `buildTodoDetailPath` error 파라미터 케이스 추가

---

## 구현하면서 고민한 점

**고민한 점: Server Action과 Route Handler가 모두 필요한가?**

목록 페이지의 Server Component와 Server Action은 서버에서 FastAPI를 직접 호출합니다. 폼 제출에는 `revalidatePath`와 `redirect`가 자연스럽게 따라옵니다. 반면 `app/api/todos/route.ts`는 브라우저 JavaScript나 외부 클라이언트가 HTTP 엔드포인트로 접근할 때 FastAPI를 숨기는 프록시 역할입니다. 같은 서버 코드라도 호출 주체가 달라 역할을 분리했습니다.

**고민한 점: 프론트에서 이미 검증하는데 백엔드 검증이 필요한가?**

필요합니다. 브라우저에서 직접 API를 호출하거나 Swagger에서 요청하는 경우 프론트엔드 검증을 우회할 수 있습니다. 공백 text와 유효하지 않은 날짜를 Pydantic `field_validator`로 막아 DB가 잘못된 상태가 되는 것을 방지했습니다.

---

## 과제를 통해 익힌 것

- **역할 분리의 실제 적용**: 2차 과제 피드백에서 "useTodos가 raw setter를 노출해 비즈니스 로직이 App.tsx로 흘렀다"는 지적을 받았는데, 3차에서도 같은 패턴이 다른 형태로 나타났습니다. `fetchTodos`를 `actions.ts`에 넣은 것이 그 예입니다. 뮤테이션과 조회를 같은 파일에 두면 책임 경계가 흐려진다는 걸 직접 경험했습니다.
- **외부 API 경계의 방어**: 타입 검증(`parseTodo`), 에러 정규화(`normalizeError`), Route Handler의 파라미터 필터링을 함께 적용하면서 외부 입력이 그대로 UI에 닿지 않도록 각 레이어에서 막는 패턴을 익혔습니다.
- **URL을 상태로 다루는 방법**: 필터, 검색, 날짜, 주차를 URL에 저장하면 새로고침과 공유 링크에서도 화면 상태가 유지됩니다. 2차에서 `useState`로 관리하던 것과 비교하면 차이가 명확합니다.
- **순수 함수와 회귀 방지**: `todo-query.ts`와 `date.ts`처럼 외부 상태가 없는 코드는 테스트를 작성하기 쉽고, 여러 컴포넌트의 중복을 줄일 수 있습니다.

---

## 과제 회고

**잘한 점**

2차 과제 피드백("useTodos raw setter 노출", "as Todo[] 검증 없는 캐스팅")을 3차 과제에 의식적으로 반영하려 했습니다. 데이터 조회와 뮤테이션 분리, 런타임 타입 검증, 에러 정규화 모두 같은 맥락의 문제를 Next.js + FastAPI 구조에서 다시 풀어본 것입니다. WeekView 날짜 이동 버그처럼 코드를 직접 읽으면서 발견한 문제를 스스로 정리한 부분도 의미 있었습니다.

**아쉬운 점**

이번에도 구현 후 테스트를 추가하는 순서가 됐습니다. `offsetDateString`을 추가할 때 테스트를 먼저 작성했다면, 월 경계(6월 → 7월)나 연 경계(12월 → 1월) 케이스를 구현 전에 확인할 수 있었을 것입니다.

**다음에 시도해볼 것**

- FastAPI CRUD 통합 테스트 — pytest + `TestClient`로 실제 DB 경유 테스트 추가
- `useActionState`로 Server Action 성공/실패 상태를 연결해 제출 중 UI 개선
- `date.ts`의 `toDateString`이 서버의 로컬 시각 기준으로 동작하는 점 — 한국 사용자가 자정 부근에 접속하면 UTC 서버와 날짜가 어긋날 수 있음. 클라이언트에서 로컬 날짜를 파라미터로 넘기는 방식 검토

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
