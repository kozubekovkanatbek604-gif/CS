import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '../views/AdminView.vue';
import HomeView from '../views/HomeView.vue';
import ShelfView from '../views/ShelfView.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/shelf', name: 'shelf', component: ShelfView },
    { path: '/admin', name: 'admin', component: AdminView }
  ]
});

export default router;
