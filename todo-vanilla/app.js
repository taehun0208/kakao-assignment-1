/* ================================================
   기능 1: Todo CRUD
   기능 2: 상태별 필터링
   기능 3: 일간 뷰
   ================================================ */

// ===== 상태 =====
/** @type {Array<{id: number, text: string, completed: boolean, date: string}>} */
let todos = [];

/** 현재 선택된 필터: 'all' | 'active' | 'completed' */
let activeFilter = 'all';

// ===== DOM 참조 =====
const todoInput   = document.getElementById('todoInput');
const btnAdd      = document.getElementById('btnAdd');
const todoList    = document.getElementById('todoList');
const inputError  = document.getElementById('inputError');
const emptyMessage = document.getElementById('emptyMessage');

// ===== 로컬스토리지 =====

/** 로컬스토리지에 todos 저장 */
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

/** 로컬스토리지에서 todos 불러오기 */
function loadTodos() {
  const stored = localStorage.getItem('todos');
  todos = stored ? JSON.parse(stored) : [];
}

// ===== CRUD =====

/** 새 Todo 추가 */
function addTodo() {
  const text = todoInput.value.trim();

  // 빈 입력 차단
  if (!text) {
    showInputError();
    return;
  }

  hideInputError();

  const newTodo = {
    id: Date.now(),
    text,
    completed: false,
    date: getSelectedDate(),
  };

  todos.push(newTodo);
  saveTodos();
  todoInput.value = '';
  renderTodos();
}

/** Todo 완료 상태 토글 */
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
}

/** Todo 삭제 */
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

/** Todo 수정 저장 */
function saveTodoEdit(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.text = trimmed;
  saveTodos();
  renderTodos();
}

// ===== 렌더링 =====

/** 현재 필터·날짜 조건에 맞는 Todo 목록 반환 */
function getFilteredTodos() {
  const date   = getSelectedDate();
  const filter = getActiveFilter();

  return todos.filter(todo => {
    if (todo.date !== date) return false;
    if (filter === 'active')    return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
}

/** Todo 목록 전체 렌더링 */
function renderTodos() {
  const filtered = getFilteredTodos();
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    emptyMessage.classList.remove('hidden');
    return;
  }

  emptyMessage.classList.add('hidden');
  filtered.forEach(todo => todoList.appendChild(createTodoElement(todo)));
}

/** Todo 단일 아이템 DOM 생성 */
function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  // 텍스트
  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;

  // 인라인 수정 입력창
  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = todo.text;

  // 수정 확정: Enter 또는 포커스 아웃
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')  confirmEdit(li, todo.id, editInput.value);
    if (e.key === 'Escape') cancelEdit(li);
  });
  editInput.addEventListener('blur', () => confirmEdit(li, todo.id, editInput.value));

  // 버튼 그룹
  const actions = document.createElement('div');
  actions.className = 'item-actions';

  const btnComplete = makeItemButton(
    todo.completed ? '취소' : '완료',
    'btn-complete',
    () => toggleTodo(todo.id)
  );

  const btnEdit = makeItemButton('수정', 'btn-edit', () => startEdit(li, editInput));
  const btnDelete = makeItemButton('삭제', 'btn-delete', () => deleteTodo(todo.id));

  actions.append(btnComplete, btnEdit, btnDelete);
  li.append(span, editInput, actions);
  return li;
}

/** 아이템 버튼 생성 헬퍼 */
function makeItemButton(label, className, onClick) {
  const btn = document.createElement('button');
  btn.className = `btn-item ${className}`;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

/** 수정 모드 진입 */
function startEdit(li, editInput) {
  li.classList.add('editing');
  editInput.focus();
  editInput.select();
}

/** 수정 확정 */
function confirmEdit(li, id, value) {
  li.classList.remove('editing');
  saveTodoEdit(id, value);
}

/** 수정 취소 */
function cancelEdit(li) {
  li.classList.remove('editing');
  renderTodos();
}

// ===== 입력 오류 =====

function showInputError() {
  inputError.classList.remove('hidden');
  todoInput.classList.add('error');
}

function hideInputError() {
  inputError.classList.add('hidden');
  todoInput.classList.remove('error');
}

// ===== 스텁 (기능 3에서 교체됨) =====

/** 현재 선택된 날짜 반환 (기능 3에서 구현) */
function getSelectedDate() {
  return new Date().toISOString().split('T')[0];
}

// ===== 기능 2: 필터 탭 =====

/** 현재 활성 필터 반환 */
function getActiveFilter() {
  return activeFilter;
}

/** 탭 클릭 시 필터 변경 및 UI 갱신 */
function setFilter(filter) {
  activeFilter = filter;

  // 탭 active 스타일 갱신
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });

  renderTodos();
}

// 필터 탭 이벤트 바인딩
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => setFilter(tab.dataset.filter));
});

// ===== 이벤트 바인딩 =====
btnAdd.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});
todoInput.addEventListener('input', () => {
  if (todoInput.value.trim()) hideInputError();
});

// ===== 초기화 =====
loadTodos();
renderTodos();
