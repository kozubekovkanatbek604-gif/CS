import { ref } from 'vue';

export const shelfSearchQuery = ref('');

export function filterShelfItems(items, type, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return items;
  }

  return items.filter((item) => {
    const parts = [item.title, item.description];

    if (type === 'books') {
      parts.push(item.author);
    } else if (item.order != null) {
      parts.push(String(item.order));
    }

    return parts
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalized);
  });
}
