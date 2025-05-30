export interface Sound {
  id: string;
  name: string;
  src: string;
}

// Note: These are example URLs. For a production app, host your own audio files or use reliable CDN links.
// Ensure you have the rights to use any audio files.
export const sounds: Sound[] = [
  { id: 'white-noise', name: 'White Noise', src: './noise_1.mp3' }, // Static TV sound, 28s
  { id: 'gentle-rain', name: 'Gentle Rain', src: './noise_2.mp3' }, // Rain sound, 2min
  { id: 'ocean-waves', name: 'Ocean Waves', src: 'https://cdn.pixabay.com/download/audio/2022/02/03/audio_169050561f.mp3' }, // Ocean waves, 1min
  { id: 'fan-hum', name: 'Fan Hum', src: 'https://cdn.pixabay.com/download/audio/2021/10/10/audio_b950b8ff9c.mp3' }, // Fan noise, 30s
  { id: 'heartbeat', name: 'Heartbeat', src: 'https://cdn.pixabay.com/download/audio/2021/10/09/audio_2021f53616.mp3' }, // Heartbeat, 30s
  { id: 'lullaby', name: 'Soft Lullaby', src: 'https://cdn.pixabay.com/download/audio/2022/11/21/audio_a088729355.mp3' }, // Instrumental Lullaby, 2min
];
