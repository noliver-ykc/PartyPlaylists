<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-dots">
      Loading<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
    </div>
  </div>
  <div v-else>
    <div class="home-page">
      <div class="header-row">
        <h1>Playlists</h1>
        <button class="new-playlist-btn" @click="handleNewPlaylist">+ New Playlist</button>
      </div>
      <div class="playlist-scroll-container">
        <div class="playlist-grid">
          <div
            class="playlist-card"
            v-for="playlist in playlists"
            :key="playlist.id"
            @click="goToPlaylist(playlist.id)"
          >
            <p class="updated-by">
              RECENTLY UPDATED BY <span>{{ playlist.updated_by }}</span>
            </p>
            <h2>{{ playlist.title }}</h2>
            <p class="close-date">
              Requests Close {{ formatDisplayDate(playlist.close_date) }}
            </p>
            <img
              :src="playlist.cover_image_url"
              alt="Cover"
              class="playlist-cover"
              v-if="playlist.cover_image_url"
            />
          </div>
        </div>
      </div>
      <RecentlyAddedJams />
    </div>
  </div>

  <AdminLoginModal
    v-if="showLoginModal"
    @close="showLoginModal = false"
    @success="onAdminSuccess"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { formatDisplayDate } from '@/lib/date'
import RecentlyAddedJams from '@/components/RecentlyAddedJams.vue'
import AdminLoginModal from '@/components/AdminLoginModal.vue'
import { useAdmin } from '@/composables/useAdmin'
import type { PlaylistSummary } from '@/types/models'

const playlists = ref<PlaylistSummary[]>([])
const router = useRouter()
const loading = ref(true)
const showLoginModal = ref(false)
const { isAdmin } = useAdmin()

const fetchPlaylists = async () => {
  const { data, error } = await supabase
    .from('playlist_with_updated_by')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch playlists', error)
    playlists.value = []
    return
  }

  playlists.value = (data ?? []) as PlaylistSummary[]
}

const goToPlaylist = (id: string) => {
  router.push(`/playlist/${id}`)
}

const handleNewPlaylist = () => {
  if (isAdmin.value) {
    router.push('/create-playlist')
  } else {
    showLoginModal.value = true
  }
}

const onAdminSuccess = () => {
  showLoginModal.value = false
  router.push('/create-playlist')
}

onMounted(async () => {
  await fetchPlaylists()
  loading.value = false
})
</script>

<style scoped>
.home-page {
  padding: 2rem;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 1rem 0;
}

h1 {
  text-align: left;
  margin: 0;
}

.new-playlist-btn {
  background: #6c63ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.new-playlist-btn:hover {
  background: #5a52d5;
}

.playlist-scroll-container {
  overflow-x: auto;
  padding-bottom: 1rem;
}

.playlist-grid {
  display: flex;
  gap: 2rem;
  flex-wrap: nowrap;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.playlist-card {
  scroll-snap-align: start;
  flex: 0 0 auto;
  border-radius: 10px;
  transition: transform 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 45vw;
  max-width: 500px;
  min-width: 350px;
}

.playlist-cover {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 0.5rem;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  transition: filter 0.2s ease;
}

.playlist-card:hover .playlist-cover {
  filter: brightness(80%);
}

.updated-by {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #666;
}

.updated-by span {
  color: #6c63ff;
  font-weight: bold;
}

.playlist-card h2 {
  font-size: 1.1rem;
  margin: 0;
  text-align: left;
}

.playlist-card p {
  margin: 0;
  padding: 0;
  text-align: left;
  line-height: 1;
}

.close-date {
  font-size: 0.9rem;
  color: #999;
}

@media (max-width: 768px) {
  .home-page {
    padding: 0;
  }

  .header-row {
    padding: 1rem 1rem 0;
  }

  .playlist-card {
    width: 45vw;
    max-width: 310px;
    min-width: 280px;
  }

  h1 {
    font-size: 2.5rem;
    margin: 0;
  }
}
</style>
