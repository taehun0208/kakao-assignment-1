let todos = [];
let activeFilter = 'all';
let selectedDate = new Date();
let weekOffset = 0;

const todoInput    = document.getElementById('todoInput');
const btnAdd       = document.getElementById('btnAdd');
const todoList     = document.getElementById('todoList');
const inputError   = document.getElementById('inputError');
const emptyMessage = document.getElementById('emptyMessage');
const weekRangeEl  = document.getElementById('weekRange');
const weekDaysEl   = document.getElementById('weekDays');
const btnPrevWeek  = document.getElementById('btnPrevWeek');
const btnNextWeek  = document.getElementById('btnNextWeek');

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
  const stored = localStorage.getItem('todos');
  todos = stored ? JSON.parse(stored) : [];
}

function addTodo() {
  const text = todoInput.value.trim();
  if (!text) {
    showInputError();
    return;
  }
  hideInputError();
  todos.push({ id: Date.now(), text, completed: false, date: getSelectedDate() });
  saveTodos();
  todoInput.value = '';
  renderTodos();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  renderTodos();
}

function saveTodoEdit(id, newText) {
  const trimmed = newText.trim();
  if (!trimmed) return;
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  todo.text = trimmed;
  saveTodos();
  renderTodos();
}

function getFilteredTodos() {
  const date = getSelectedDate();
  return todos.filter(todo => {
    if (todo.date !== date) return false;
    if (activeFilter === 'active')    return !todo.completed;
    if (activeFilter === 'completed') return todo.completed;
    return true;
  });
}

function renderTodos() {
  const filtered = getFilteredTodos();
  todoList.innerHTML = '';
  if (filtered.length === 0) {
    emptyMessage.classList.remove('hidden');
  } else {
    emptyMessage.classList.add('hidden');
    filtered.forEach(todo => todoList.appendChild(createTodoElement(todo)));
  }
  renderWeekView();
}

function createTodoElement(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  const span = document.createElement('span');
  span.className = 'todo-text';
  span.textContent = todo.text;

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.className = 'edit-input';
  editInput.value = todo.text;
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter')  confirmEdit(li, todo.id, editInput.value);
    if (e.key === 'Escape') cancelEdit(li);
  });
  editInput.addEventListener('blur', () => confirmEdit(li, todo.id, editInput.value));

  const actions = document.createElement('div');
  actions.className = 'item-actions';
  actions.append(
    makeItemButton(todo.completed ? '취소' : '완료', 'btn-complete', () => toggleTodo(todo.id)),
    makeItemButton('수정', 'btn-edit', () => startEdit(li, editInput)),
    makeItemButton('삭제', 'btn-delete', () => deleteTodo(todo.id))
  );

  li.append(span, editInput, actions);
  return li;
}

function makeItemButton(label, className, onClick) {
  const btn = document.createElement('button');
  btn.className = `btn-item ${className}`;
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function startEdit(li, editInput) {
  li.classList.add('editing');
  editInput.focus();
  editInput.select();
}

function confirmEdit(li, id, value) {
  li.classList.remove('editing');
  saveTodoEdit(id, value);
}

function cancelEdit(li) {
  li.classList.remove('editing');
  renderTodos();
}

function showInputError() {
  inputError.classList.remove('hidden');
  todoInput.classList.add('error');
}

function hideInputError() {
  inputError.classList.add('hidden');
  todoInput.classList.remove('error');
}

// toISOString은 UTC 기준이라 한국 시간대에서 날짜가 밀릴 수 있음
function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getSelectedDate() {
  return toDateString(selectedDate);
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDates() {
  const monday = getMondayOfWeek(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function selectDate(date) {
  selectedDate = new Date(date);
  renderWeekView();
  renderTodos();
}

function moveWeek(delta) {
  weekOffset += delta;
  renderWeekView();
  renderTodos();
}

function renderWeekView() {
  const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];
  const weekDates = getWeekDates();
  const today    = toDateString(new Date());
  const selected = getSelectedDate();

  const first = weekDates[0];
  const last  = weekDates[6];
  weekRangeEl.textContent =
    `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일 — ` +
    `${last.getMonth() + 1}월 ${last.getDate()}일`;

  weekDaysEl.innerHTML = '';
  weekDates.forEach((date, i) => {
    const dateStr    = toDateString(date);
    const count      = todos.filter(t => t.date === dateStr).length;
    const isToday    = dateStr === today;
    const isSelected = dateStr === selected;
    const isWeekend  = i >= 5;

    const dayEl = document.createElement('div');
    dayEl.className = ['week-day', isToday && 'today', isSelected && 'selected', isWeekend && 'weekend']
      .filter(Boolean).join(' ');

    const nameSpan = document.createElement('span');
    nameSpan.className = 'day-name';
    nameSpan.textContent = DAY_NAMES[i];

    const dateSpan = document.createElement('span');
    dateSpan.className = 'day-date';
    dateSpan.textContent = date.getDate();

    const countSpan = document.createElement('span');
    countSpan.className = count > 0 ? 'day-count' : 'day-count empty';
    countSpan.textContent = count > 0 ? count : '0';

    dayEl.append(nameSpan, dateSpan, countSpan);
    dayEl.addEventListener('click', () => selectDate(date));
    weekDaysEl.appendChild(dayEl);
  });
}

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.filter === filter);
  });
  renderTodos();
}

function getActiveFilter() {
  return activeFilter;
}

btnAdd.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', e => {
  // 한글 조합 중 Enter 시 이중 등록 방지
  if (e.key === 'Enter' && !e.isComposing) addTodo();
});
todoInput.addEventListener('input', () => {
  if (todoInput.value.trim()) hideInputError();
});
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => setFilter(tab.dataset.filter));
});
btnPrevWeek.addEventListener('click', () => moveWeek(-1));
btnNextWeek.addEventListener('click', () => moveWeek(1));

loadTodos();
renderTodos();
