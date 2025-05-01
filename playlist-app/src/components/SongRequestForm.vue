<template>
  <form @submit.prevent="submitRequest">
    <h3>Request a Song</h3>
    <input v-model="title" placeholder="Song Title" required />
    <input v-model="artist" placeholder="Artist Name" required />
    <input v-model="spotifyUrl" placeholder="Spotify URL" />
    <input v-model="appleUrl" placeholder="Apple Music URL" />
    <input v-model="requestedBy" placeholder="Your Name" required />
    <button type="submit">Submit Request</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

const props = defineProps<{ playlistId: string }>()

const title = ref('')
const artist = ref('')
const spotifyUrl = ref('')
const appleUrl = ref('')
const requestedBy = ref('')

const submitRequest = async () => {
  const { error } = await supabase.from('playlist_requests').insert([
    {
      playlist_id: props.playlistId,
      title: title.value,
      artist: artist.value,
      spotify_url: spotifyUrl.value,
      apple_url: appleUrl.value,
      requested_by: requestedBy.value,
      status: 'requested'
    }
  ])

  if (error) {
    alert('Failed to submit request: ' + error.message)
  } else {
    alert('Song request submitted!')
    title.value = ''
    artist.value = ''
    spotifyUrl.value = ''
    appleUrl.value = ''
    requestedBy.value = ''
  }
}
</script>
