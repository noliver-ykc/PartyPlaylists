<template>
  <div v-if="loading">Loading playlist...</div>
  <div v-else-if="playlist">
    <h2>{{ playlist.title }}</h2>
    <img
      :src="playlist.cover_image_url"
      class="playlist-cover-id"
      v-if="playlist.cover_image_url"
    />
    <p>{{ playlist.description }}</p>

    <SongRequestForm
      :playlistId="playlist.id"
      @request-submitted="fetchSongs"
      @request-started="isSubmitting = true"
      @request-ended="isSubmitting = false"
    />

  </div>
  <div v-else>
    <p>Playlist not found.</p>
  </div>

  <div class="left-column">
    <h3>Recently Added Jams</h3>
    <ul>
      <li v-for="song in songRequests" :key="song.id">
        <div
          class="song-row"
          @mouseenter="hoveredSongId = song.id"
          @mouseleave="hoveredSongId = null"
        >
          <img :src="song.album_cover_url" class="thumb" alt="Album cover" />
          <div class="meta">
            <strong>{{ song.title }}</strong>
            <small>{{ song.artist }}</small><br />
            <small><i>{{ song.album_name }}</i></small><br />
            <small><i>Requested by {{ song.requested_by }}</i></small>
          </div>

          <div class="action-menu-wrapper">
            <img
              src="/icons/inactive-select-buttons.svg"
              class="action-icon"
              @click="toggleMenu(song.id)"
            />
            <div v-if="openMenuId === song.id" class="popup-menu">
              <a :href="song.spotify_url" target="_blank">Open in Spotify</a>
              <a v-if="song.apple_url" :href="song.apple_url" target="_blank">
                Open in Apple Music
              </a>
              <button @click="deleteRequest(song.id)">Delete</button>
            </div>
          </div>
        </div>
      </li>
    </ul>
  </div>
  <div v-if="isSubmitting" class="loading-overlay">
  <div class="loading-dots">
    Loading<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
  </div>
</div>

</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRoute } from 'vue-router'
import SongRequestForm from './SongRequestForm.vue'

const route = useRoute()
const playlistId = route.params.id as string
const playlist = ref<any>(null)
const loading = ref(true)
const songRequests = ref<any[]>([])
const openMenuId = ref<string | null>(null)
const hoveredSongId = ref<string | null>(null)

const fetchSongs = async () => {
  const { data, error } = await supabase
    .from('playlist_requests')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('created_at', { ascending: false })

  if (!error) {
    songRequests.value = data
  }
}

const toggleMenu = (id: string) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const getMenuIcon = (id: string): string => {
  const isActive = openMenuId.value === id || hoveredSongId.value === id
  return isActive
    ? '/icons/active-select-buttons.png'
    : '/icons/inactive-select-buttons.png'
}

const deleteRequest = async (id: string) => {
  const confirmed = confirm('Are you sure you want to delete this request?')
  if (!confirmed) return

  const { error } = await supabase.from('playlist_requests').delete().eq('id', id)
  if (!error) {
    await fetchSongs()
  } else {
    alert('Failed to delete request: ' + error.message)
  }
}

onMounted(async () => {
  const { data, error } = await supabase.from('playlists').select('*').eq('id', playlistId).single()
  if (error) {
    console.error('Error fetching playlist:', error.message)
  } else {
    playlist.value = data
  }
  loading.value = false
  await fetchSongs()
})

const isSubmitting = ref(false)

</script>

<style scoped>
.playlist-cover-id {
  object-fit: cover;
  width: 510px;
  height: 271px;
  border-radius: 7px;
}

.left-column {
  width: 300px;
}

.song-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
  position: relative;
}

.thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .playlist-cover-id {
    object-fit: cover;
    width: 285px;
    height: 288px;
    border-radius: 7px;
  }

}


</style>
