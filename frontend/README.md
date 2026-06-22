# Kakao Assignment 3 - Todo

Next.js App Router 프론트엔드와 FastAPI 백엔드를 분리한 Todo 앱입니다.

## 실행

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

## 구현 기능

- FastAPI + SQLite 기반 Todo CRUD
- Next.js App Router 페이지 라우팅
- Server Actions 기반 생성, 수정, 삭제, 완료 토글
- URL 파라미터 기반 상태 필터링과 검색
- 날짜별 Todo 조회와 주간 뷰

