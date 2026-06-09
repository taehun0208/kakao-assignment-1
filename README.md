# Todo App — React + TypeScript

1차 과제(VanillaJS)로 구현한 Todo 앱을 React + TypeScript + Tailwind CSS로 마이그레이션한 프로젝트입니다.

## 구현 기능

### 필수 기능
- **Todo CRUD** — 생성 / 수정 / 삭제 / 완료 토글
- **상태별 필터링** — 전체 / 진행 중 / 완료
- **주간 뷰** — 이전·다음 주 이동, 날짜별 Todo 개수 표시
- **로컬스토리지 연동** — 새로고침 후에도 데이터 유지

### 예외 처리
- 빈 값 입력 시 인라인 에러 메시지 표시 (추가 / 수정 모두)
- localStorage 파싱 실패 시 빈 배열로 초기화
- 데이터 없는 상태 화면 처리

## 기술 스택

- React 19 + TypeScript
- Tailwind CSS v4
- Vite
- Vitest (단위 테스트)

## 프로젝트 구조

```
src/
├── components/     # UI 컴포넌트
│   ├── App.tsx
│   ├── WeekView.tsx
│   ├── FilterTabs.tsx
│   ├── TodoInput.tsx
│   ├── TodoItem.tsx
│   └── TodoList.tsx
├── hooks/
│   └── useTodos.ts # 상태 및 비즈니스 로직
├── utils/
│   ├── date.ts     # 날짜 계산 유틸
│   ├── storage.ts  # localStorage 읽기/쓰기
│   ├── date.test.ts
│   └── storage.test.ts
└── types.ts
```

## 실행 방법

```bash
npm install
npm run dev     # 개발 서버
npm test        # 단위 테스트
npm run build   # 프로덕션 빌드
```
