<template>
  <div class="recently-added-jams">
    <h3>Recently Added Jams</h3>
    <ul class="song-list">
      <li v-for="song in songRequests" :key="song.id" class="song-entry">
        <div
          class="song-row"
          @mouseenter="hoveredId = song.id"
          @mouseleave="hoveredId = null"
        >
          <img :src="song.album_cover_url" class="thumb" alt="Album cover" />
          <div class="meta">
            <strong>{{ song.title }}</strong><br />
            <small>{{ song.artist }}</small>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/lib/supabase'

const songRequests = ref<any[]>([])
const hoveredId = ref<string | null>(null)
const limit = ref(12)

const fetchSongs = async () => {
  const { data, error } = await supabase
    .from('playlist_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit.value)

  if (!error) {
    songRequests.value = data
  }
}

const updateLimit = () => {
  limit.value = window.innerWidth < 768 ? 6 : 12
  fetchSongs()
}

onMounted(() => {
  updateLimit()
  window.addEventListener('resize', updateLimit)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateLimit)
})
</script>

<style scoped>
.recently-added-jams {
  width: 100%;
  margin-top: 2rem;
}

h3 {
  text-align: left;
  margin-bottom: 1rem;
}

.meta{
  text-align: left;
  line-height: 1;
}

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 1.5rem;
}

.song-entry {
  border-top: 1px solid #ddd;
  padding: 0.75rem 0;
}

.song-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.meta small {
  color: #666;
}

/* Mobile: single column, 6 items */
@media (max-width: 768px) {
  .song-list {
    grid-template-columns: 1fr;
  }
  .song-entry {
    border-top: 1px solid #ddd;
  }
}
</style>
