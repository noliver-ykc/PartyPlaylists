import { createRouter, createWebHistory } from 'vue-router'
import PlaylistList from '@/components/PlaylistList.vue'
import PlaylistDetail from '@/components/PlaylistDetail.vue'
import CreatePlaylistForm from '@/components/CreatePlaylistForm.vue'
import { useAdmin } from '@/composables/useAdmin'

const routes = [
  { path: '/', component: PlaylistList },
  { path: '/playlist/:id', component: PlaylistDetail, props: true },
  {
    path: '/create-playlist',
    component: CreatePlaylistForm,
    beforeEnter: () => {
      const { isAdmin } = useAdmin()
      if (!isAdmin.value) return '/'
    },
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
