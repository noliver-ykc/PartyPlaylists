<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-dots">
      Loading<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
    </div>
  </div>

  <div v-else-if="playlist">
    <!-- Desktop Heading -->
    <div class="heading desktop-title-group">
      <h1 class="playlist-title">{{ playlist.title }}</h1>
      <p class="close-date">
        REQUESTS CLOSE <span>{{ formatDate(playlist.close_date) }}</span>
      </p>
    </div>

    <div class="playlist-detail-container">
      <!-- Left Column (Image & Inputs) -->
      <div class="main-column">
        <img
          :src="playlist.cover_image_url"
          class="playlist-cover-id"
          v-if="playlist.cover_image_url"
        />

        <!-- Mobile Title & Close Date -->
        <div class="mobile-only mobile-title-group">
          <p class="close-date">
            REQUESTS CLOSE <span>{{ formatDate(playlist.close_date) }}</span>
          </p>
          <h1 class="playlist-title mobile-title">{{ playlist.title }}</h1>
        </div>
        <p class="description"><span>From the DJ:</span> {{ playlist.description }}</p>
        <SongRequestForm
          :playlistId="playlist.id"
          :playlistDescription="playlist.description"
          @request-submitted="fetchSongs"
          @request-started="isSubmitting = true"
          @request-ended="isSubmitting = false"
        />


      </div>

      <!-- Right Column (Requests List) -->
      <div class="right-column">
        <div class="request-table">
          <div class="request-table-header">
            <span>Song</span>
            <span>Artist</span>
            <span>Added By</span>
          </div>

          <div
            v-for="(song, index) in songRequests"
            :key="song.id"
            class="request-row"
            :class="{ 'alt-row': index % 2 === 1 }"
            @mouseenter="hoveredSongId = song.id"
            @mouseleave="hoveredSongId = null"
          >
            <!-- Song Info -->
            <div class="song-info">
              <img :src="song.album_cover_url" class="thumb" alt="Album cover" />
              <div class="song-text">
                <small class="truncate song-title">{{ song.title }}</small>
                <small class="truncate artist"><i>{{ song.artist }}</i></small>
              </div>
            </div>
             <!-- Artist -->
            <span class="desktop-artist">{{ song.artist }}</span>

            <!-- Added By + Menu -->
            <div class="added-by">
              <span>{{ song.requested_by }}</span>
              <div class="action-menu-wrapper">
                <img
                  src="/icons/inactive-select-buttons.svg"
                  class="action-icon"
                  @click="toggleMenu(song.id)"
                />
                <div v-if="openMenuId === song.id" class="popup-menu">
                  <a :href="song.spotify_url" target="_blank">Open in Spotify</a>
                  <a v-if="song.apple_url" :href="song.apple_url" target="_blank">Open in Apple Music</a>
                  <a @click="deleteRequest(song.id)">Delete</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Playlist not found.</p>
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
const isSubmitting = ref(false)

const fetchSongs = async () => {
  const { data, error } = await supabase
    .from('playlist_requests')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('created_at', { ascending: false })

  if (!error) songRequests.value = data
}

const toggleMenu = (id: string) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const deleteRequest = async (id: string) => {
  if (!confirm('Are you sure you want to delete this request?')) return
  const { error } = await supabase.from('playlist_requests').delete().eq('id', id)
  if (!error) await fetchSongs()
  else alert('Failed to delete request: ' + error.message)
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  const { data, error } = await supabase.from('playlists').select('*').eq('id', playlistId).single()
  if (!error) playlist.value = data
  loading.value = false
  await fetchSongs()
})
</script>

<style scoped>
.heading {
  display: flex;
  justify-content: space-between;
  margin: 2rem 0;
}
.playlist-title {
  margin: 0;
  text-align: left;
}

.playlist-detail-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.description span {
  color: #f3f3f3;
  font-weight: bold;
}

.right-column {
  flex: 2;
  width: 100%;
}

.playlist-cover-id {
  object-fit: cover;
  width: 510px;
  height: 271px;
  border-radius: 7px;
}

.close-date {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 1rem;
}

.request-table {
  width: 100%;
  display: flex;
  flex-direction: column;
}
.request-table-header,
.request-row {
  display: grid;
  grid-template-columns: 60% 20% 20%;
  align-items: center;
  /* gap: 1rem; */
  flex-grow: 2;
  /* justify-content: space-around; */
  padding: 0.5rem;
}
.song-title {
  font-weight: bold;
  font-size: 0.875rem;
  color: #333;
}
.request-table-header {
  font-weight: bold;
  font-size: 0.875rem;
  color: #666;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}
.artist {
  font-size: 0.875rem;
}
.added-by {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.875rem;
}

.action-menu-wrapper {
  position: relative;
}
.action-icon {
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-left: 8px;
}
.popup-menu {
  position: absolute;
  top: 100%;
  /* right: 0; */
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  width: 7rem;
}
.popup-menu a,
.popup-menu button {
  font-size: 0.9rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
}

.popup-menu a:hover, .popup-menu button:hover {
  color: #6c63ff;
  background-color: #f3f3f3;
}

.song-text {
  text-align: left;
  max-width: 80%;
}
.truncate {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}

/* Desktop */
@media (min-width: 769px) {
  .playlist-detail-container {
    flex-direction: row;
    align-items: flex-start;
  }

  .request-row {
    background-color: #ffffff;
  }
  .request-row.alt-row {
    background-color: #f3f3f3;
  }
  .description {
  font-size: 0.875rem;
  margin-bottom: 1rem;
  text-align: left;
  }
  .description span {
    color: #6c63ff;
    font-weight: bold;
  }
  .main-column {
    flex: 0 0 40%;
    max-width: 40%;
  }

  .right-column {
    flex: 0 0 60%;
    max-width: 60%;
  }
  .mobile-title-group {
    display: none;
  }
  .close-date span {
  color: #6c63ff;
  font-weight: bold;
}
}


/* Mobile */
@media (max-width: 768px) {
  .playlist-cover-id {
    width: 285px;
    height: 288px;
  }

  .desktop-artist {
    display: none;
  }

  .main-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

  .close-date span, .close-date {
    color: #9A9A9A;
    font-weight: bold;
}
  .playlist-detail-container {
    flex-direction: column;
  }
  .request-table-header,
  .request-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .request-row{
        border-top: 1px solid #ddd;

  }
  .description {
    display: none;
  }
  .desktop-title-group {
    display: none;
  }
  .playlist-detail-container {
    flex-direction: column;
    align-items: center;
  }

  .playlist-cover-id {
    width: 285px;
    height: 288px;
    object-fit: cover;
    border-radius: 7px;
    margin-top: 3em;
  }

  .close-date {
    text-align: center;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .playlist-title {
    text-align: center;
  }

  .description {
    text-align: left;
    width: 100%;
    padding-left: 15px;
  }

  .-input {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    width: 100%;
  }
  .search-bar-wrapper::before {
    left: 12px;
  }
  .mobile-title {
    font-size: 1.5rem;
    font-weight: 500;
    margin: 1rem;
  }
}


</style>
