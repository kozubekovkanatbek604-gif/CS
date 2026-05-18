<template>
  <div class="app-shell">
    <header class="site-header">
      <RouterLink class="brand" to="/">
        <span class="brand-mark">CB</span>
        <span>CyberSecurity</span>
      </RouterLink>

      <nav class="site-nav" aria-label="Главная навигация">
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
