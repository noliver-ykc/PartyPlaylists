<template>
  <div class="home-page">
    <h1>Playlists</h1>
    <div class="playlist-scroll-container">
      <div class="playlist-grid">
        <div
          class="playlist-card"
          v-for="playlist in playlists"
          :key="playlist.id"
          @click="goToPlaylist(playlist.id)"
        >
          <p class="updated-by">
            RECENTLY UPDATED BY <span>{{ playlist.updated_by }}</span>
          </p>
          <h2>{{ playlist.title }}</h2>
          <p class="close-date">
            Requests Close {{ formatDate(playlist.close_date) }}
          </p>
          <img
            :src="playlist.cover_image_url"
            alt="Cover"
            class="playlist-cover"
            v-if="playlist.cover_image_url"
          />
        </div>
      </div>
    </div>

    <RecentlyAddedJams />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import RecentlyAddedJams from '@/components/RecentlyAddedJams.vue'


const playlists = ref<any[]>([])
const router = useRouter()

const fetchPlaylists = async () => {
  const { data, error } = await supabase
    .from('playlist_with_updated_by')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error) {
    playlists.value = data
  }
}

const formatDate = (isoString: string): string => {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const goToPlaylist = (id: string) => {
  router.push(`/playlist/${id}`)
}

onMounted(() => {
  fetchPlaylists()
})
</script>

<style scoped>
.home-page {
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2.7rem;
  text-align: left;
}

.playlist-scroll-container {
  overflow-x: auto;
  padding-bottom: 1rem;
}

.playlist-grid {
  display: flex;
  gap: 2rem;
  flex-wrap: nowrap;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
}

.playlist-card {
  scroll-snap-align: start;
  flex: 0 0 auto;
  width: 340px;
  border-radius: 10px;
  transition: transform 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 45vw; /* Makes 2 full cards and 1 partial on wider screens */
  max-width: 500px;
  min-width: 350px;
}

.playlist-cover {
  width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 0.5rem;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  transition: filter 0.2s ease;
}

.playlist-card:hover .playlist-cover {
  filter: brightness(80%);
}

.updated-by {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #666;
}

.updated-by span {
  color: #6c63ff;
  font-weight: bold;
}

.playlist-card h2 {
  font-size: 1.1rem;
  margin: 0 0;
  text-align: left;
}
.playlist-card p {
  margin: 0;
  padding: 0;
  text-align: left;
  line-height: 1;
}

.close-date {
  font-size: 0.9rem;
  color: #999;
}

/* Mobile adjustments */
@media (max-width: 768px) {
  .playlist-card {
    width: 75vw;
  }
  .home-page {
  padding: 0;
  }
  .playlist-card {
    width: 45vw; /* Makes 2 full cards and 1 partial on wider screens */
    max-width: 310px;
    min-width: 280px;
  }
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    text-align: left;
  }

}

</style>
