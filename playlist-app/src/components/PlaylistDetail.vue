<template>
  <div v-if="loading">Loading playlist...</div>
  <div v-else-if="playlist">
    <h2>{{ playlist.title }}</h2>
    <img :src="playlist.cover_image_url" v-if="playlist.cover_image_url" />
    <p>{{ playlist.description }}</p>
  </div>
  <div v-else>
    <p>Playlist not found.</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRoute } from 'vue-router'

const route = useRoute()
const playlistId = route.params.id as string
const playlist = ref<any>(null)
const loading = ref(true)

onMounted(async () => {
  const { data, error } = await supabase.from('playlists').select('*').eq('id', playlistId).single()
  if (!error) playlist.value = data
  loading.value = false
})
</script>
