let audio: HTMLAudioElement | null = null;

export function playAmbientSound(sound: string, volume: number): void {
  stopAmbientSound();
  if (sound === "none") return;
  audio = new Audio(`/sounds/${sound}.mp3`);
  audio.loop = true;
  audio.volume = Math.max(0, Math.min(1, volume / 100));
  audio.play().catch(console.warn);
}

export function stopAmbientSound(): void {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
    audio = null;
  }
}

export function setAmbientVolume(volume: number): void {
  if (audio) {
    audio.volume = Math.max(0, Math.min(1, volume / 100));
  }
}
