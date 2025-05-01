<template>
  <div>
    <h2>Available Playlists</h2>
    <div v-if="loading">Loading playlists...</div>
    <div v-else-if="playlists.length === 0">No playlists yet.</div>
    <div v-else class="playlist-grid">
      <div v-for="playlist in playlists" :key="playlist.id" class="playlist-card">
        <img :src="playlist.cover_image_url" alt="Cover" v-if="playlist.cover_image_url" />
        <h3>{{ playlist.title }}</h3>
        <p>{{ playlist.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'

const playlists = ref<any[]>([])
const loading = ref(true)
const errorMessage = ref<string | null>(null)

const fetchPlaylists = async () => {
  const { data, error } = await supabase.from('playlists').select('*').order('created_at', { ascending: false })
  if (error) {
    errorMessage.value = 'Error fetching playlists: ' + error.message
  } else {
    playlists.value = data
  }
  loading.value = false
}

onMounted(fetchPlaylists)
</script>

<style scoped>
.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.playlist-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.playlist-card img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}
</style>
