<template>
  <form @submit.prevent>
    <!-- Your Name input -->
    <input
      v-model="requestedBy"
      placeholder="Your Name"
      :class="{ 'input-error': showNameError }"
    />

    <!-- Search bar with clear icon -->
    <div class="search-bar-wrapper">
      <input
        v-model="searchQuery"
        placeholder="Search For a Song or Artist"
        @input="handleSearch"
      />
      <img
        v-if="searchQuery"
        src="/icons/delete-text.svg"
        class="delete-text-icon"
        alt="Clear"
        @click="searchQuery = ''"
      />
    </div>

    <!-- Search Results -->
    <div v-if="searchResults.length > 0" class="search-results">
      <div
        v-for="track in searchResults"
        :key="track.id"
        class="search-result"
      >
        <img :src="track.album.images[2]?.url" alt="Album Art" />
        <div>
          <p>{{ track.name }}</p>
          <small>{{ track.artists.map(a => a.name).join(', ') }}</small>
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

const props = defineProps<{ playlistId: string }>()
const emit = defineEmits(['request-submitted'])

const requestedBy = ref('')
const showNameError = ref(false)
const searchQuery = ref('')
const searchResults = ref<any[]>([])

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

const submitRequest = async (track: any) => {
  if (!requestedBy.value.trim()) {
    showNameError.value = true
    alert('Please enter your name before submitting a song.')
    return
  }

  showNameError.value = false

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

  if (error) {
    alert('Failed to submit request: ' + error.message)
  } else {
    alert('Song request submitted!')
    emit('request-submitted')
    searchQuery.value = ''
    searchResults.value = []
  }
}
</script>

<style scoped>
.input-error {
  border-color: red;
}

.search-bar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.delete-text-icon {
  position: absolute;
  right: 10px;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.search-result {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.search-result img {
  width: 40px;
  height: 40px;
  border-radius: 4px;
}

.add-song-btn {
  margin-left: auto;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.add-song-btn img {
  width: 20px;
  height: 20px;
}
</style>
