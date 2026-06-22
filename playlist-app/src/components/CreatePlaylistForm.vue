<template>
  <div class="create-page">
    <button class="back-btn" @click="router.push('/')">← Back</button>
    <h1>New Playlist</h1>
    <form @submit.prevent="createPlaylist" class="create-form">
      <label>Title
        <input v-model="title" placeholder="Playlist title" required />
      </label>
      <label>Description (from the DJ)
        <textarea v-model="description" placeholder="Vibe, theme, notes for guests..." rows="3" />
      </label>
      <label>Cover Image URL
        <input v-model="coverImageUrl" placeholder="https://..." />
      </label>
      <label>Requests Close
        <input v-model="closeDate" type="datetime-local" required />
      </label>
      <button type="submit" :disabled="submitting" class="submit-btn">
        {{ submitting ? 'Creating...' : 'Create Playlist' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const title = ref('')
const description = ref('')
const coverImageUrl = ref('')
const closeDate = ref('')
const submitting = ref(false)

const createPlaylist = async () => {
  submitting.value = true
  const { error } = await supabase.from('playlists').insert([{
    title: title.value,
    description: description.value || null,
    cover_image_url: coverImageUrl.value || null,
    close_date: closeDate.value ? new Date(closeDate.value).toISOString() : null,
  }])
  submitting.value = false

  if (error) {
    alert('Failed to create playlist: ' + error.message)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.create-page {
  padding: 2rem;
  max-width: 560px;
}

.back-btn {
  background: none;
  border: none;
  color: #6c63ff;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0;
  margin-bottom: 1rem;
  font-weight: 500;
}

h1 {
  margin: 0 0 1.5rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

input, textarea {
  width: 100%;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.6rem 0.75rem;
  box-sizing: border-box;
  font-family: inherit;
}

textarea {
  resize: vertical;
}

.submit-btn {
  background: #6c63ff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  background: #5a52d5;
}

@media (max-width: 768px) {
  .create-page {
    padding: 1.5rem 1rem;
  }
}
</style>
