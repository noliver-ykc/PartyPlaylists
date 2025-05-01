<template>
  <div v-if="loading">Loading playlist...</div>
  <div v-else-if="playlist">
    <h2>{{ playlist.title }}</h2>
    <img :src="playlist.cover_image_url" v-if="playlist.cover_image_url" />
    <p>{{ playlist.description }}</p>

    <SongRequestForm v-if="playlist?.id" :playlistId="playlist.id" />
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

onMounted(async () => {
  console.log('Attempting to fetch playlist with ID:', playlistId)

  const { data, error } = await supabase
    .from('playlists')
    .select('*')

  console.log('ALL playlists returned:', data)

  // Try filtering manually just to verify
  const found = data?.find((p: any) => p.id === playlistId)
  console.log('Manually matched playlist:', found)

  if (found) {
    playlist.value = found
  }

  loading.value = false
})


</script>
