export interface PlaylistSummary {
  id: string
  title: string
  close_date: string
  cover_image_url: string | null
  updated_by: string | null
}

export interface Playlist {
  id: string
  title: string
  description: string | null
  close_date: string
  cover_image_url: string | null
}

export interface SongRequest {
  id: string
  title: string
  artist: string
  requested_by: string
  spotify_url: string
  apple_url: string | null
  album_cover_url: string | null
  album_name: string | null
}

export interface SpotifyArtist {
  name: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: SpotifyArtist[]
  external_urls: {
    spotify: string
  }
  album: {
    name: string
    images: Array<{ url: string }>
  }
}
