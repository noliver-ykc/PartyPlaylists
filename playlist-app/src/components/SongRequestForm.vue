<template>
  <form @submit.prevent>
    <!-- Loading Overlay -->
    <div v-if="submitting" class="loading-overlay">
      <div class="loading-dots">
        Loading<span class="dot">.</span><span class="dot">.</span><span class="dot">.</span>
      </div>
    </div>

    <!-- Your Name input -->
    <div class="search-input">
      <input
        v-model="requestedBy"
        placeholder=" Your Name"
        :class="{ 'input-error': showNameError }"
      />

      <!-- Search bar with clear icon -->
      <div class="search-bar-wrapper">
        <input
          v-model="searchQuery"
          placeholder="Search"
          @input="handleSearch"
        />
        <img
          v-if="searchQuery"
          src="/icons/delete-text.svg"
          class="delete-text-icon"
          alt="Clear"
          @click="clearSearch"
        />
      </div>
    </div>

    <p class="dj-note">
      <span>From the DJ:</span> {{ playlistDescription }}
    </p>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div
        v-for="track in searchResults"
        :key="track.id"
        class="search-result"
      >
        <img :src="track.album.images[2]?.url" class="search-result-art" alt="Album Art" />
        <div class="search-result-text">
          <p>{{ track.name }}</p>
          <small class="song-details-ui">{{ track.artists.map((a: Artist) => a.name).join(', ') }}</small>
        </div>
        <button @click="submitRequest(track)" class="add-song-btn">
          <img src="/icons/add-song-button.svg" alt="Add Song" />
        </button>
      </div>
    </div>
  </form>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { getSpotifyAccessToken } from '@/lib/spotify'

const emit = defineEmits(['request-submitted', 'request-started', 'request-ended'])

const requestedBy = ref('')
const showNameError = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])
type Artist = { name: string }



const props = defineProps<{
  playlistId: string
  playlistDescription: string
}>()

const handleSearch = async () => {
  if (searchQuery.value.trim().length < 2) {
    searchResults.value = []
    return
  }

  const token = await getSpotifyAccessToken()

  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery.value)}&type=track&limit=10`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  const data = await res.json()
  searchResults.value = data.tracks?.items || []
}

const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
}

const getAppleMusicUrl = async (spotifyUrl: string): Promise<string | null> => {
  try {
    const res = await fetch(`https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(spotifyUrl)}`)
    const data = await res.json()
    return data.linksByPlatform?.appleMusic?.url || null
  } catch (e) {
    console.error('Failed to fetch Apple Music link', e)
    return null
  }
}
const submitting = ref(false)
const submitRequest = async (track: any) => {
  if (!requestedBy.value.trim()) {
    showNameError.value = true
    alert('Please enter your name before submitting a song.')
    return
  }

  showNameError.value = false
  emit('request-started')
  submitting.value = true

  const appleMusicUrl = await getAppleMusicUrl(track.external_urls.spotify)

  const { error } = await supabase.from('playlist_requests').insert([
    {
      playlist_id: props.playlistId,
      title: track.name,
      artist: track.artists.map((a: any) => a.name).join(', '),
      spotify_url: track.external_urls.spotify,
      apple_url: appleMusicUrl,
      requested_by: requestedBy.value,
      album_cover_url: track.album.images?.[0]?.url || null,
      album_name: track.album.name,
      status: 'requested'
    }
  ])

  submitting.value = false
  emit('request-ended')

  if (error) {
    alert('Failed to submit request: ' + error.message)
  } else {
    emit('request-submitted')
    searchQuery.value = ''
    searchResults.value = []
  }
}

</script>

<style scoped>


.search-input {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap; /* 👈 prevent stacking */
}


.search-input input {
  width: 1.5fr;
  height: 28px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  color: #9a9a9a;
  padding-left: 15px; /* 👈 creates space for icon */

}

.song-details-ui {
  color: #7C7C7C;
  font-weight: 500;
  font-size: .75rem;
}

.search-bar-wrapper {
  position: relative;
  /* flex: 1; */
}

.search-bar-wrapper input {
  width: 1.5fr;
  height: 28px;
  background-color: #fff;
  font-weight: 500;
  font-size: 16px;
  padding-left: 30px; /* 👈 creates space for icon */
  border: 1px solid #ccc;
  border-radius: 6px;
  color: #333;
}

.search-bar-wrapper::before {
  content: '';
  background-image: url('/icons/search-icon.svg');
  background-repeat: no-repeat;
  background-size: 16px 16px;
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  pointer-events: none;
}


.search-results {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 1rem 0.5rem;
  margin-top: 1rem;
  max-height: 200px;
  overflow-y: auto;
}
.delete-text-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.search-result-text p {
  margin: 0;
  font-size: 13px;
  font-weight: bold;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
}

.search-result-art {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}
.search-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.3rem 0.5rem;
  gap: 0.5rem;
}

.search-result-text {
  flex: 1;
  margin-left: 0.5rem;
  overflow: hidden;
}

.add-song-btn {
  background: none;
  border: none;
  padding: 0;
  margin-left: 0.5rem;
  cursor: pointer;
}
.add-song-btn img {
  width: 14px;
  height: 14px;
}
/* Desktop */
@media (min-width: 769px) {
  .dj-note {
    display: none;
  }
}

/* Mobile */
@media (max-width: 768px) {
  .dj-note {
  font-size: 0.85rem;
  margin-top: 0.75rem;
  text-align: left;
  color: #888;
  padding: 0 0.5rem;
}

.dj-note span {
  font-weight: bold;
  color: #6c63ff;
}
}

</style>
