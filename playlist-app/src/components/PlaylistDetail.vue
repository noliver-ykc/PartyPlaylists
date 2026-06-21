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
        REQUESTS CLOSE <span>{{ formatDisplayDate(playlist.close_date) }}</span>
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
            REQUESTS CLOSE <span>{{ formatDisplayDate(playlist.close_date) }}</span>
          </p>
          <h1 class="playlist-title mobile-title">{{ playlist.title }}</h1>
        </div>
        <p class="description"><span>From the DJ:</span> {{ playlist.description }}</p>
        <SongRequestForm
          :playlistId="playlist.id"
          :playlistDescription="playlist.description ?? ''"
          @request-submitted="fetchSongs"
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
          >
            <!-- Song Info -->
            <div class="song-info">
              <img :src="song.album_cover_url ?? ''" class="thumb" alt="Album cover" />
              <div class="song-text">
                <small class="truncate song-title">{{ song.title }}</small>
                <small class="truncate artist song-details-ui "><i>{{ song.artist }}</i></small>
              </div>
            </div>
             <!-- Artist -->
            <span class="desktop-artist song-details-ui ">{{ song.artist }}</span>

            <!-- Added By + Menu -->
            <div class="added-by">
              <span class="song-details-ui" >{{ song.requested_by }}</span>
              <div class="action-menu-wrapper" :ref="el => setMenuRef(el, song.id)">
                <img
                  :src="openMenuId === song.id ? '/icons/active-select-buttons.svg' : '/icons/inactive-select-buttons.svg'"
                  class="action-icon"
                  @click="toggleMenu(song.id)"
                />
                <div v-if="openMenuId === song.id" class="popup-menu">
                  <a :href="song.spotify_url" target="_blank" rel="noopener noreferrer">Open in Spotify</a>
                  <a v-if="song.apple_url" :href="song.apple_url" target="_blank" rel="noopener noreferrer">Open in Apple Music</a>
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
import { onMounted, ref, onBeforeUnmount, type ComponentPublicInstance } from 'vue'
import { supabase } from '@/lib/supabase'
import { formatDisplayDate } from '@/lib/date'
import type { Playlist, SongRequest } from '@/types/models'
import { useRoute } from 'vue-router'
import SongRequestForm from './SongRequestForm.vue'

const route = useRoute()
const playlistId = route.params.id as string
const playlist = ref<Playlist | null>(null)
const loading = ref(true)
const songRequests = ref<SongRequest[]>([])
const openMenuId = ref<string | null>(null)

const menuRefs: Record<string, HTMLElement | null> = {}
const setMenuRef = (el: Element | ComponentPublicInstance | null, id: string) => {
  // Only assign if it's a real DOM element
  if (el instanceof HTMLElement) {
    menuRefs[id] = el
  } else {
    menuRefs[id] = null
  }
}


const handleClickOutside = (event: MouseEvent) => {
  if (
    openMenuId.value &&
    menuRefs[openMenuId.value] &&
    !menuRefs[openMenuId.value]?.contains(event.target as Node)
  ) {
    openMenuId.value = null
  }
}

const handleScroll = () => {
  openMenuId.value = null
}


const fetchSongs = async () => {
  const { data, error } = await supabase
    .from('playlist_requests')
    .select('*')
    .eq('playlist_id', playlistId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch playlist requests', error)
    songRequests.value = []
    return
  }

  songRequests.value = (data ?? []) as SongRequest[]
}

const toggleMenu = (id: string) => {
  openMenuId.value = openMenuId.value === id ? null : id
}

const deleteRequest = async (id: string) => {
  const { error } = await supabase.from('playlist_requests').delete().eq('id', id)
  if (!error) await fetchSongs()
  else alert('Failed to delete request: ' + error.message)
}

onMounted(async () => {
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)

  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single()

  if (error) {
    console.error('Failed to fetch playlist details', error)
  } else {
    playlist.value = data as Playlist
  }
  loading.value = false
  await fetchSongs()
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
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
  flex-grow: 2;
  padding: 0.5rem;
}
.song-title {
  font-weight: bold;
  font-size: 0.875rem;
  color: #333;
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

.song-details-ui {
  color: #7C7C7C;
  font-weight: 500;
  font-size: .75rem;
}
.action-menu-wrapper {
  position: relative;
  z-index: 1000;
}
.action-icon {
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-left: 8px;
}

.popup-menu {
  position: absolute;
  right: 0;
  background: purple; /* ensure it’s solid */
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.5rem;
  z-index: 999; /* higher than surrounding elements */
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 9.5rem;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.15); /* stronger shadow */
  backdrop-filter: blur(2px); /* optional subtle glass blur */
}

.popup-menu a,
.popup-menu button {
  font-size: 0.9rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  padding: .5rem;
}

.popup-menu a:hover, .popup-menu button:hover {
  color: #6c63ff;
  font-weight: bold;
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

  .added-by {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.875rem;
    z-index: 1;
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
  .request-table-header {
  font-weight: bold;
  font-size: 0.875rem;
  color: #666;
  }
}


/* Mobile */
@media (max-width: 768px) {
  .playlist-cover-id {
    width: 285px;
    height: 288px;
  }

  .added-by {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    width: 100%;
    position: relative;
    padding-right: 5rem;
  }


  .added-by span {
    flex-shrink: 0;
  }

  .action-menu-wrapper {
    position: absolute;
    right: 0.5rem; /* or 1rem if you want more space */
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
  }



  .request-table-header {
    display: none;
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
