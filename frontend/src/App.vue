<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">CB</span>
        <span>CyberSecurity</span>
      </RouterLink>

      <nav class="site-nav" aria-label="Главная навигация">
        <input
          v-if="isShelfPage"
          v-model="shelfSearchQuery"
          type="search"
          class="shelf-search-input"
          placeholder="Поиск на полке…"
          aria-label="Поиск книг и видео на полке"
        />
        <RouterLink to="/">Главная</RouterLink>
        <RouterLink to="/shelf">Полка</RouterLink>
        <RouterLink to="/admin">Админ</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>

    <footer class="site-footer">
      <span>Материалы по кибербезопасности: книги, уроки и полезные ссылки.</span>
    </footer>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { shelfSearchQuery } from './composables/useShelfSearch.js';

const route = useRoute();
const isShelfPage = computed(() => route.path === '/shelf');

watch(isShelfPage, (onShelf) => {
  if (!onShelf) {
    shelfSearchQuery.value = '';
  }
});
</script>
