<template>
  <section class="section shelf-hero">
    <p class="eyebrow">Полка знаний</p>
    <h1>{{ activeType === 'books' ? 'Книги по кибербезопасности' : 'Видеоуроки по кибербезопасности' }}</h1>
    <p>
      Выберите тип материалов и нажмите на карточку, чтобы открыть книгу или видео.
    </p>

    <div class="shelf-toggle" aria-label="Выбор типа материалов">
      <button :class="{ active: activeType === 'books' }" type="button" @click="activeType = 'books'">
        Книги
      </button>
      <button :class="{ active: activeType === 'videos' }" type="button" @click="activeType = 'videos'">
        Видео
      </button>
    </div>
  </section>

  <section class="section shelf-wrap">
    <ShelfRow v-for="(row, index) in rows" :key="index" :items="row" :type="activeType" />
    <p v-if="!filteredItems.length" class="empty-state">{{ emptyMessage }}</p>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { api } from '../api/client.js';
import ShelfRow from '../components/ShelfRow.vue';
import { filterShelfItems, shelfSearchQuery } from '../composables/useShelfSearch.js';

const activeType = ref('videos');
const books = ref([]);
const lessons = ref([]);

const activeItems = computed(() => (activeType.value === 'books' ? books.value : lessons.value));
const filteredItems = computed(() => filterShelfItems(
  activeItems.value,
  activeType.value,
  shelfSearchQuery.value
));
const emptyMessage = computed(() => {
  if (shelfSearchQuery.value.trim()) {
    return activeType.value === 'books'
      ? 'Книги по запросу не найдены.'
      : 'Видео по запросу не найдены.';
  }

  return activeType.value === 'books'
    ? 'На полке пока нет книг.'
    : 'На полке пока нет уроков.';
});

const rows = computed(() => {
  const result = [];

  for (let index = 0; index < filteredItems.value.length; index += 4) {
    result.push(filteredItems.value.slice(index, index + 4));
  }

  return result;
});

onMounted(async () => {
  const [bookData, lessonData] = await Promise.all([
    api.getBooks(),
    api.getYoutube()
  ]);

  books.value = bookData;
  lessons.value = lessonData;
});
</script>
