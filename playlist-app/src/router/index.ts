import { createRouter, createWebHistory } from 'vue-router'
import PlaylistList from '@/components/PlaylistList.vue'
import PlaylistDetail from '@/components/PlaylistDetail.vue'

const routes = [
  { path: '/', component: PlaylistList },
  { path: '/playlist/:id', component: PlaylistDetail, props: true }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
