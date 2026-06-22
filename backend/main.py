from datetime import date as Date
from pathlib import Path
from typing import Literal

import os
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import Boolean, Column, Integer, String, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker


def load_env_file(path: str = ".env.local") -> None:
    env_path = Path(path)
    if not env_path.exists():
        return

    for line in env_path.read_text().splitlines():
        if not line or line.strip().startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


load_env_file()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./todos.db")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Todo(Base):
    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    date = Column(String, index=True, nullable=False)


class TodoCreate(BaseModel):
    text: str = Field(..., min_length=1)
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    completed: bool = False

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Todo text cannot be blank")
        return normalized

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: str) -> str:
        try:
            Date.fromisoformat(value)
        except ValueError as error:
            raise ValueError("Date must be a valid YYYY-MM-DD value") from error
        return value


class TodoUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1)
    completed: bool | None = None
    date: str | None = Field(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$")

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str | None) -> str | None:
        if value is None:
            return value
        normalized = value.strip()
        if not normalized:
            raise ValueError("Todo text cannot be blank")
        return normalized

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: str | None) -> str | None:
        if value is None:
            return value
        try:
            Date.fromisoformat(value)
        except ValueError as error:
            raise ValueError("Date must be a valid YYYY-MM-DD value") from error
        return value


class TodoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    text: str
    completed: bool
    date: str


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Todo API is running"}


@app.get("/todos", response_model=list[TodoRead])
def read_todos(
    filter: Literal["all", "active", "completed"] = "all",
    search: str | None = Query(default=None),
    date: str | None = Query(default=None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    db: Session = Depends(get_db),
):
    query = db.query(Todo)

    if date:
        query = query.filter(Todo.date == date)
    if filter == "active":
        query = query.filter(Todo.completed.is_(False))
    elif filter == "completed":
        query = query.filter(Todo.completed.is_(True))
    if search:
        query = query.filter(Todo.text.ilike(f"%{search.strip()}%"))

    return query.order_by(Todo.id.desc()).all()


@app.get("/todos/{todo_id}", response_model=TodoRead)
def read_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.get(Todo, todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo


@app.post("/todos", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
def create_todo(todo: TodoCreate, db: Session = Depends(get_db)):
    db_todo = Todo(text=todo.text, completed=todo.completed, date=todo.date)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@app.put("/todos/{todo_id}", response_model=TodoRead)
def update_todo(todo_id: int, todo: TodoUpdate, db: Session = Depends(get_db)):
    db_todo = db.get(Todo, todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    if todo.text is not None:
        db_todo.text = todo.text
    if todo.completed is not None:
        db_todo.completed = todo.completed
    if todo.date is not None:
        db_todo.date = todo.date

    db.commit()
    db.refresh(db_todo)
    return db_todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    db_todo = db.get(Todo, todo_id)
    if db_todo is None:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(db_todo)
    db.commit()
    return None
