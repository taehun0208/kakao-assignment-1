# ✏️ React + TypeScript로 Todo 앱 마이그레이션하기

## 과제 목표

- 1차에서 VanillaJS로 구현한 Todo 앱을 React + TypeScript + Tailwind CSS로 마이그레이션하기
- 컴포넌트 단위 사고 방식 익히기
- 상태 관리와 이벤트 흐름을 React 방식으로 재설계하기
- 커스텀 훅, 순수 함수 등 React 생태계의 설계 원칙 직접 경험하기

---

## 과제 위치

- 브랜치명 : `week-02-곽태훈`
- 주요 파일 : `src/components/` / `src/hooks/` / `src/utils/`

---

## 구현한 기능

- [x] Todo CRUD 구현하기
- [x] 상태별 필터링 구현하기 (전체 / 진행 중 / 완료)
- [x] Todo 주간 뷰 구현하기
- [x] 로컬스토리지 연동하기

---

## AI 활용 내역

### 1. React 마이그레이션 초기 세팅

**AI 활용 내용**

1차 과제의 기능 명세와 아키텍처를 그대로 전달하고, React + TypeScript + Tailwind 기반으로 전환하도록 요청했습니다. 컴포넌트 분리 기준을 명시해서 각 컴포넌트가 단일 책임을 갖도록 유도했습니다.

```
1차 과제의 Todo 앱을 React + TypeScript + Tailwind로 마이그레이션해줘.
컴포넌트는 App / WeekView / FilterTabs / TodoInput / TodoItem / TodoList로 나눠줘.
상태는 App에서 관리하고 props로 내려주는 방식으로 구현해줘.
```

**직접 수정한 부분**

AI가 생성한 초기 코드에서 아래 문제들을 발견하고 직접 수정했습니다.

**문제 1 — App.tsx에 모든 로직이 집중**

초기 생성 코드에서 상태, 비즈니스 로직, localStorage 접근, 필터링이 모두 `App.tsx`에 섞여 있었습니다. 1차 과제에서 `app.js`가 Controller 역할까지 겸해 비대해질 위험을 스스로 단점으로 지적했는데, React 전환 후에도 같은 문제가 반복됐습니다.

`src/hooks/useTodos.ts`로 상태·핸들러·필터링 로직을 추출하고, `src/utils/storage.ts`로 localStorage 읽기/쓰기를 분리했습니다.

```ts
// 분리 전 — App.tsx에 섞여 있던 localStorage 로직
function loadWeekOffset(): number {
  const saved = localStorage.getItem('weekOffset');
  return saved ? Number(saved) : 0;  // 예외 처리 없음
}

// 분리 후 — storage.ts에서 예외 처리까지 명시적으로 처리
export function loadWeekOffset(): number {
  try {
    const saved = localStorage.getItem('weekOffset');
    return saved ? Number(saved) : 0;
  } catch {
    return 0;
  }
}
```

`loadWeekOffset`에 예외 처리가 없어서 `Number(null)` → `0`으로 우연히 동작하는 부분도 이 과정에서 발견해 수정했습니다.

**문제 2 — id 생성에 `Date.now()` 사용**

`Date.now()`는 밀리초 단위라 빠른 연속 입력 시 같은 id가 발급될 수 있습니다. `crypto.randomUUID()`로 교체하고 `id` 타입도 `number`에서 `string`으로 변경했습니다.

```ts
// 수정 전
{ id: Date.now(), text, completed: false, date: selectedDate }

// 수정 후
{ id: crypto.randomUUID(), text, completed: false, date: selectedDate }
```

**문제 3 — WeekView에서 O(7n) 반복 순회**

날짜 7개를 렌더링하면서 각 날짜마다 `todos.filter`를 호출해 전체 배열을 순회했습니다. `useMemo`로 날짜별 카운트 Map을 한 번만 계산하도록 바꿨습니다.

```ts
// 수정 전 — 날짜마다 filter 호출
const count = todos.filter(t => t.date === dateStr).length;

// 수정 후 — Map 한 번만 계산 후 O(1) 조회
const countByDate = useMemo(
  () => todos.reduce<Record<string, number>>((acc, t) => {
    acc[t.date] = (acc[t.date] ?? 0) + 1;
    return acc;
  }, {}),
  [todos],
);
const count = countByDate[dateStr] ?? 0;
```

**문제 4 — TodoItem 빈 값 수정 시 피드백 없음**

빈 값으로 수정을 확인하면 `onCancelEdit()`이 조용히 호출됐습니다. 사용자는 왜 취소됐는지 알 수 없는 상태였습니다. `TodoInput`과 동일하게 인라인 에러 메시지와 빨간 테두리로 처리했습니다.

**문제 5 — `getWeekDates`가 순수 함수가 아님**

함수 내부에서 `new Date()`를 직접 호출해 기준 날짜를 주입할 수 없었습니다. 테스트 시 "지금"에 따라 결과가 달라지는 구조였습니다. `baseDate` 매개변수를 추가해 순수 함수로 만들었습니다.

```ts
// 수정 전
export function getWeekDates(weekOffset: number): Date[] {
  const monday = getMondayOfWeek(new Date()); // 항상 현재 시각 기준
  ...
}

// 수정 후
export function getWeekDates(weekOffset: number, baseDate: Date = new Date()): Date[] {
  const monday = getMondayOfWeek(baseDate); // 기준 날짜 주입 가능
  ...
}
```

---

### 2. 단위 테스트 작성

**AI 활용 내용**

순수 함수로 정리된 `date.ts`와 `storage.ts`를 대상으로 vitest 기반 단위 테스트를 작성하도록 요청했습니다.

**직접 확인한 부분**

테스트 케이스가 실제로 의미 있는 경계값을 커버하는지 검토했습니다.

- `getMondayOfWeek`: 월요일 입력(그대로 반환), 일요일 입력(이전 주 월요일), 평일 입력 세 케이스
- `getWeekDates`: offset 0/-1/+1 각각의 기준 날짜 검증
- `loadTodos`: 정상 케이스, 빈 케이스, JSON 손상 케이스
- `loadWeekOffset`: 음수 offset 저장/복원 케이스

```
$ npm test
 Test Files  2 passed (2)
      Tests  17 passed (17)
```

---

### 3. UI 개선

**직접 수정한 부분**

초기 생성 코드의 텍스트 버튼 UI를 사용하면서 항목이 늘어날수록 버튼 3개(완료 / 수정 / 삭제)가 시각적으로 복잡하다고 느꼈습니다. `lucide-react`를 추가해 아이콘 기반으로 교체하고 전체 UI를 다듬었습니다.

**문제 6 — TodoItem 버튼 3개가 항상 노출되어 복잡함**

텍스트 버튼(완료 / 수정 / 삭제)이 항목마다 나란히 표시돼 목록이 많아질수록 시각적 밀도가 높아졌습니다. 왼쪽에 원형 체크 버튼을 두고, 수정·삭제는 hover 시에만 아이콘으로 표시되도록 변경했습니다.

```tsx
// 수정 전 — 텍스트 버튼 3개 항상 노출
<button>완료</button>
<button>수정</button>
<button>삭제</button>

// 수정 후 — 원형 체크 + hover 시 아이콘 버튼
<button aria-label="완료">  {/* 원형, 왼쪽 고정 */}
  {todo.completed && <Check size={10} />}
</button>
<div className="opacity-0 group-hover:opacity-100">  {/* hover 시만 표시 */}
  <button aria-label="수정"><Pencil size={14} /></button>
  <button aria-label="삭제"><Trash2 size={14} /></button>
</div>
```

**문제 7 — WeekView 날짜 셀의 숫자 카운트가 시각적으로 무거움**

날짜마다 Todo 개수 숫자를 표시했는데, 숫자가 생기면 오히려 셀이 복잡해 보였습니다. 작은 dot 인디케이터로 대체해 "있다/없다"만 표현하도록 변경했습니다. 토요일·일요일 색상 구분과 `aria-label`도 함께 추가했습니다.

---

## 구현하면서 고민한 점

**고민한 점: 어디까지를 커스텀 훅으로 분리해야 할까?**

React로 전환하면서 상태 관리를 어느 단위로 묶을지 고민했습니다. `todos`와 `weekOffset`은 성격이 다르지만 둘 다 localStorage와 연결되고 `editingId`와도 묶여 있어서, 하나의 `useTodos`로 모으는 것이 오히려 App.tsx를 깔끔하게 만드는 선택이었습니다.

반면 `useTodos`가 너무 많은 것을 반환한다는 느낌이 있어서, 나중에 앱이 커지면 `useWeekNavigation`, `useTodoFilter` 같이 더 잘게 나눠볼 수도 있겠다고 생각했습니다.

**고민한 점: 편집 취소를 어떻게 처리할까?**

빈 값으로 수정을 확인했을 때 "그냥 취소"시킬지, "에러 표시"를 할지 선택해야 했습니다. 사용자가 실수로 내용을 다 지웠을 때 조용히 취소되면 당황스러울 수 있다고 판단해서 에러 메시지를 보여주는 방향을 선택했습니다.

---

## 과제를 통해 익힌 것

- **커스텀 훅의 역할**: 상태와 로직을 UI에서 분리하는 React의 방식. VanillaJS에서 `app.js`가 Controller를 겸했던 구조의 문제를 React에서는 커스텀 훅으로 해결할 수 있다는 것을 직접 경험했습니다.
- **순수 함수와 테스트 가능성**: 함수가 외부 상태(`new Date()`)에 의존하면 테스트를 작성하기 어려워집니다. 기준값을 매개변수로 받도록 바꾸는 것만으로 테스트 가능한 구조가 됐습니다.
- **`useMemo`의 적절한 사용 시점**: 렌더링마다 반복되는 연산이 있을 때 `useMemo`로 캐싱하는 패턴. WeekView에서 날짜별 카운트를 매번 `filter`로 구하던 것을 한 번의 `reduce`로 정리했습니다.
- **vitest + jsdom 기반 테스트**: localStorage가 필요한 유틸 함수도 jsdom 환경에서 테스트할 수 있습니다. `beforeEach`로 상태를 초기화해서 테스트 간 격리를 보장하는 것이 중요합니다.

---

## 과제 회고

**잘한 점**

1차 과제에서 "app.js가 비대해질 위험"을 단점으로 스스로 지적했는데, 2차에서 같은 문제가 발생한 것을 인식하고 커스텀 훅으로 해결했습니다. 코드를 넘겨받아 바로 사용하지 않고, 실제로 읽으면서 문제를 직접 발굴해 수정한 부분이 이번 과제에서 가장 의미 있었습니다.

**아쉬운 점**

테스트를 구현 이후에 추가했습니다. 1차 수상작의 핵심은 error_case.md → 테스트 코드 → 구현 순서였는데, 이번에도 구현을 먼저 하고 테스트를 나중에 붙이는 흐름이 됐습니다. 테스트를 먼저 작성했다면 `getWeekDates`의 순수 함수 문제나 `loadWeekOffset`의 예외 처리 누락을 코드를 작성하는 시점에 발견할 수 있었을 것입니다.

**다음에 시도해볼 것**

- 컴포넌트 단위 테스트(`@testing-library/react`)까지 확장해보기. 현재는 순수 함수만 테스트하고 있는데, 실제 사용자 인터랙션을 시뮬레이션하는 테스트를 작성해보고 싶습니다.
- 런타임 타입 검증 추가하기. 현재 `loadTodos`는 `JSON.parse(saved) as Todo[]`로 TypeScript 캐스팅만 하고 있어서, localStorage 데이터가 오염됐을 때 탐지하지 못합니다. 필수 필드 존재 여부를 체크하는 가드 함수를 추가하면 더 견고해질 것입니다.
- 기능 단위로 테스트를 먼저 작성하고 구현을 맞추는 순서를 의식적으로 연습해보기.
