<template>
  <section class="section admin-page">
    <div class="section-heading">
      <p class="eyebrow">Админ-панель</p>
      <h1>CRUD для книг и YouTube-уроков</h1>
    </div>

    <form v-if="!user" class="admin-card login-form" @submit.prevent="handleLogin">
      <label>
        Логин
        <input v-model="loginForm.username" autocomplete="username" placeholder="admin" />
      </label>
      <label>
        Пароль
        <input
          v-model="loginForm.password"
          type="password"
          autocomplete="current-password"
          placeholder=" "
        />
      </label>
      <button class="button primary" type="submit">Войти</button>
      <p v-if="message" class="form-message error">{{ message }}</p>
    </form>

    <div v-else class="admin-layout">
      <div class="admin-toolbar">
        <p>Вы вошли как <strong>{{ user.username }}</strong></p>
        <button class="button secondary" type="button" @click="handleLogout">Выйти</button>
      </div>

      <div class="tabs">
        <button :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">Книги</button>
        <button :class="{ active: activeTab === 'youtube' }" @click="activeTab = 'youtube'">YouTube</button>
      </div>

      <div v-if="activeTab === 'books'" class="admin-grid">
        <form class="admin-card" @submit.prevent="saveBook">
          <h2>{{ editingBookId ? 'Редактировать книгу' : 'Добавить книгу' }}</h2>
          <label>Название <input v-model="bookForm.title" required /></label>
          <label>Автор <input v-model="bookForm.author" /></label>
          <label>Ссылка <input v-model="bookForm.url" required type="url" /></label>
          <label>Обложка URL <input v-model="bookForm.coverUrl" type="url" /></label>
          <label>Описание <textarea v-model="bookForm.description" rows="4"></textarea></label>
          <div class="form-actions">
            <button class="button primary" type="submit">Сохранить</button>
            <button v-if="editingBookId" class="button secondary" type="button" @click="resetBookForm">
              Отмена
            </button>
          </div>
        </form>

        <div class="admin-card list-card">
          <h2>Список книг</h2>
          <article v-for="book in books" :key="book.id" class="admin-item">
            <div>
              <strong>{{ book.title }}</strong>
              <span>{{ book.author || 'Автор не указан' }}</span>
            </div>
            <div class="item-actions">
              <button type="button" @click="editBook(book)">Изменить</button>
              <button type="button" @click="removeBook(book.id)">Удалить</button>
            </div>
          </article>
          <p v-if="!books.length" class="empty-state">Книг пока нет.</p>
        </div>
      </div>

      <div v-else class="admin-grid">
        <form class="admin-card" @submit.prevent="saveLesson">
          <h2>{{ editingLessonId ? 'Редактировать урок' : 'Добавить урок' }}</h2>
          <label>Название <input v-model="lessonForm.title" required /></label>
          <label>YouTube ссылка <input v-model="lessonForm.url" required type="url" /></label>
          <label>Превью URL <input v-model="lessonForm.thumbnail" type="url" /></label>
          <label>Порядок <input v-model.number="lessonForm.order" type="number" /></label>
          <label>Описание <textarea v-model="lessonForm.description" rows="4"></textarea></label>
          <div class="form-actions">
            <button class="button primary" type="submit">Сохранить</button>
            <button v-if="editingLessonId" class="button secondary" type="button" @click="resetLessonForm">
              Отмена
            </button>
          </div>
        </form>

        <div class="admin-card list-card">
          <h2>Список уроков</h2>
          <article v-for="lesson in lessons" :key="lesson.id" class="admin-item">
            <div>
              <strong>{{ lesson.title }}</strong>
              <span>Порядок: {{ lesson.order || 0 }}</span>
            </div>
            <div class="item-actions">
              <button type="button" @click="editLesson(lesson)">Изменить</button>
              <button type="button" @click="removeLesson(lesson.id)">Удалить</button>
            </div>
          </article>
          <p v-if="!lessons.length" class="empty-state">Уроков пока нет.</p>
        </div>
      </div>

      <p v-if="message" class="form-message">{{ message }}</p>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { api } from '../api/client.js';

const user = ref(null);
const activeTab = ref('books');
const message = ref('');
const books = ref([]);
const lessons = ref([]);
const editingBookId = ref('');
const editingLessonId = ref('');

const loginForm = reactive({ username: 'admin', password: '' });
const bookForm = reactive({ title: '', author: '', url: '', description: '', coverUrl: '' });
const lessonForm = reactive({ title: '', url: '', description: '', thumbnail: '', order: 0 });

async function loadContent() {
  const [bookData, lessonData] = await Promise.all([api.getBooks(), api.getYoutube()]);
  books.value = bookData;
  lessons.value = lessonData;
}

async function handleLogin() {
  message.value = '';

  try {
    user.value = await api.login(loginForm);
    await loadContent();
  } catch (error) {
    message.value = error.message;
  }
}

async function handleLogout() {
  await api.logout();
  user.value = null;
}

function resetBookForm() {
  editingBookId.value = '';
  Object.assign(bookForm, { title: '', author: '', url: '', description: '', coverUrl: '' });
}

function resetLessonForm() {
  editingLessonId.value = '';
  Object.assign(lessonForm, { title: '', url: '', description: '', thumbnail: '', order: 0 });
}

function editBook(book) {
  editingBookId.value = book.id;
  Object.assign(bookForm, {
    title: book.title,
    author: book.author,
    url: book.url,
    description: book.description,
    coverUrl: book.coverUrl
  });
}

function editLesson(lesson) {
  editingLessonId.value = lesson.id;
  Object.assign(lessonForm, {
    title: lesson.title,
    url: lesson.url,
    description: lesson.description,
    thumbnail: lesson.thumbnail,
    order: lesson.order
  });
}

async function saveBook() {
  message.value = '';

  try {
    if (editingBookId.value) {
      await api.updateBook(editingBookId.value, bookForm);
      message.value = 'Книга обновлена';
    } else {
      await api.createBook(bookForm);
      message.value = 'Книга добавлена';
    }

    resetBookForm();
    await loadContent();
  } catch (error) {
    message.value = error.message;
  }
}

async function saveLesson() {
  message.value = '';

  try {
    if (editingLessonId.value) {
      await api.updateYoutube(editingLessonId.value, lessonForm);
      message.value = 'Урок обновлён';
    } else {
      await api.createYoutube(lessonForm);
      message.value = 'Урок добавлен';
    }

    resetLessonForm();
    await loadContent();
  } catch (error) {
    message.value = error.message;
  }
}

async function removeBook(id) {
  await api.deleteBook(id);
  await loadContent();
}

async function removeLesson(id) {
  await api.deleteYoutube(id);
  await loadContent();
}

onMounted(async () => {
  await loadContent();

  try {
    user.value = await api.me();
  } catch {
    user.value = null;
  }
});
</script>
