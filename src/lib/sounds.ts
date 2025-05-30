export interface Sound {
  id: string;
  name: string;
  src: string;
}

// Note: These are example URLs. For a production app, host your own audio files or use reliable CDN links.
// Ensure you have the rights to use any audio files.
export const sounds: Sound[] = [
  { id: 'white-noise-1', name: 'White Noise 1', src: './noise_1.mp3' }, // Static TV sound, 28s
  { id: 'white-noise-2', name: 'White Noise 2', src: './noise_2.mp3' }, // Rain sound, 2min
  { id: 'white-noise-3', name: 'White Noise 3', src: './noise_3.mp3' }, // Rain sound, 2min
  { id: 'white-noise-4', name: 'White Noise 4', src: './noise_4.mp3' }, // Rain sound, 2min
];
