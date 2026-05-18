<template>
  <section class="hero section">
    <div class="hero-content">
      <p class="eyebrow">Библиотека</p>
      <h1>Полка знаний для будущих специалистов по защите информации.</h1>
      <p>
        Книги, видеоуроки и полезные ссылки по кибербезопасности собраны на полке.
        Откройте её, чтобы выбрать материалы.
      </p>
      <div class="hero-actions">
        <RouterLink class="button primary" to="/shelf">Перейти на полку</RouterLink>
      </div>
    </div>

    <div class="hero-panel">
      <span class="terminal-dot"></span>
      <span class="terminal-dot"></span>
      <span class="terminal-dot"></span>
      <pre>scan --library cyber
status: protected
route: /shelf
action: open shelf</pre>
    </div>
  </section>
</template>
