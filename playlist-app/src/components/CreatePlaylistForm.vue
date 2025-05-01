<template>
  <form @submit.prevent="createPlaylist">
    <h2>Create Playlist</h2>
    <input v-model="title" placeholder="Playlist Title" />
    <textarea v-model="description" placeholder="Description"></textarea>
    <input v-model="coverImageUrl" placeholder="Cover Image URL" />
    <button type="submit">Create</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const title = ref('')
const description = ref('')
const coverImageUrl = ref('') // optional for now

const createPlaylist = async () => {
  const { error } = await supabase.from('playlists').insert([
    {
      title: title.value,
      description: description.value,
      cover_image_url: coverImageUrl.value
    }
  ])
  if (error) {
    alert('Failed to create playlist: ' + error.message)
  } else {
    alert('Playlist created!')
    title.value = ''
    description.value = ''
    coverImageUrl.value = ''
  }
}
</script>
