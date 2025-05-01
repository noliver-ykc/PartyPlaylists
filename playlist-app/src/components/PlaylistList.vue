<template>
  <div class="home-page">
    <h1>Playlists</h1>
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
          Requests Close {{ formatDate(playlist.close_date) }}
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const playlists = ref<any[]>([])
const router = useRouter()

const fetchPlaylists = async () => {
  const { data, error } = await supabase
    .from('playlist_with_updated_by')
    .select('*')
    .order('created_at', { ascending: false })


if (!error) {
  playlists.value = data
}


  if (!error) {
    playlists.value = data
  }
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goToPlaylist = (id: string) => {
  router.push(`/playlist/${id}`)
}

onMounted(() => {
  fetchPlaylists()
})
</script>

<style scoped>
.home-page {
  padding: 2rem;
}

.playlist-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.playlist-card {
  cursor: pointer;
  width: 300px;
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.playlist-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.playlist-cover {
  width: 100%;
  height: auto;
  border-radius: 6px;
  margin-top: 0.5rem;
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

.close-date {
  font-size: 0.9rem;
  color: #999;
}
</style>
