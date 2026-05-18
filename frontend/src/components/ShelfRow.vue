<template>
  <section class="shelf-row">
    <div class="shelf-items">
      <a
        v-for="item in items"
        :key="item.id"
        class="lesson-book"
        :class="{ 'book-resource': type === 'books' }"
        :href="item.url"
        target="_blank"
        rel="noreferrer"
      >
        <span class="lesson-order">{{ badge(item) }}</span>
        <strong>{{ item.title }}</strong>
        <small>{{ item.description || fallbackDescription }}</small>
      </a>
    </div>
    <div class="shelf-board"></div>
  </section>
</template>

<script setup>
const props = defineProps({
  items: { type: Array, required: true },
  type: { type: String, default: 'videos' }
});

const fallbackDescription = props.type === 'books'
  ? 'Книга или материал по кибербезопасности'
  : 'YouTube урок по кибербезопасности';

function badge(item) {
  if (props.type === 'books') {
    return item.author || 'Книга';
  }

  return `#${item.order || 0}`;
}
</script>
