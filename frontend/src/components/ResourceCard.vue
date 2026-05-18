<template>
  <article class="resource-card">
    <div class="resource-media" :class="{ 'media-empty': !image }">
      <img v-if="image" :src="image" :alt="title" />
      <span v-else>{{ fallback }}</span>
    </div>

    <div class="resource-body">
      <p v-if="eyebrow" class="eyebrow">{{ eyebrow }}</p>
      <h3>{{ title }}</h3>
      <p>{{ description || 'Описание пока не добавлено.' }}</p>
      <a class="text-link" :href="url" target="_blank" rel="noreferrer">Открыть ссылку</a>
    </div>
  </article>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  url: { type: String, required: true },
  image: { type: String, default: '' },
  eyebrow: { type: String, default: '' },
  fallback: { type: String, default: 'CYBER' }
});
</script>
