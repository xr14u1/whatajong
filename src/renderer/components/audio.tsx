// Whatajong — Audio Engine & Sound Effects
// Created by Snuff (https://snuffdied.xyz)

import { getSoundSrc } from "@/assets/assets"
import musicSprite from "@/assets/music/sprite.mp3"
import { useGlobalState } from "@/state/globalState"
import { Howl, Howler } from "howler"
import { fromEntries } from "remeda"
import { onMount } from "solid-js"

// Unmute & unlock Web Audio on first user interaction (iOS WebKit / Telegram Mini App requirement)
if (typeof window !== "undefined") {
  const unlockAudioContext = () => {
    try {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume().catch(() => {});
      }
    } catch (_) {}

    window.removeEventListener("touchstart", unlockAudioContext);
    window.removeEventListener("touchend", unlockAudioContext);
    window.removeEventListener("pointerdown", unlockAudioContext);
    window.removeEventListener("click", unlockAudioContext);
  };

  window.addEventListener("touchstart", unlockAudioContext, { passive: true });
  window.addEventListener("touchend", unlockAudioContext, { passive: true });
  window.addEventListener("pointerdown", unlockAudioContext, { passive: true });
  window.addEventListener("click", unlockAudioContext, { passive: true });
}

// biome-ignore format:
const SoundFiles = [
  "click", "click2", "clack", "ding", "coin", "coin2", "dragon", "gong", "wind", "shake", "earthquake", "great", "grunt", "screech", "nice",
  "super", "awesome", "amazing", "unreal", "fantastic", "legendary", "alarm1", "alarm2", "alarm3", "phoenix", "mutation", 'thunder',
  "freeze", "joker", "dice", "gemstone", "end_phoenix", "end_dragon", "tiles", "reward", "won", "lost", "frog", "lotus", "gong2", "sparrow",
] as const
type Track = (typeof SoundFiles)[number]

const SOUNDS = fromEntries(
  SoundFiles.map((sound) => [
    sound,
    new Howl({ src: [getSoundSrc(sound)], preload: true }),
  ]),
)

const SONGS = { music: "music", game: "game" } as const
const music = new Howl({
  src: [musicSprite],
  preload: true,
  volume: 0.8,
  sprite: {
    music: [0, 352052.2448979592, true],
    game: [354000, 352052.2448979591, true],
  },
})
let MUSIC_IDS: Record<keyof typeof SONGS, number> | undefined
let currentId: number | undefined

export function play(track: Track) {
  if (process.env.NODE_ENV === "test") return;
  try {
    if (Howler.ctx && Howler.ctx.state === "suspended") {
      Howler.ctx.resume().catch(() => {});
    }
    const audio = SOUNDS[track];
    if (audio) {
      audio.seek(0);
      audio.play();
    }
  } catch (e) {
    console.warn("Sound play error:", e);
  }
}

export function useMusic(track: keyof typeof SONGS) {
  const globalState = useGlobalState();

  onMount(() => {
    try {
      if (Howler.ctx && Howler.ctx.state === "suspended") {
        Howler.ctx.resume().catch(() => {});
      }

      if (!MUSIC_IDS) {
        const gameId = music.play(SONGS.game);
        const musicId = music.play(SONGS.music);

        MUSIC_IDS = { game: gameId, music: musicId };
        currentId = MUSIC_IDS[track];

        const setVolume = () => {
          const vol = globalState.musicVolume;
          music.volume(vol);
          if (currentId) {
            music.fade(0, vol, 2000, currentId);
          }
        };

        if (music.state() === "loaded") {
          setVolume();
        } else {
          music.once("load", setVolume);
        }
      } else {
        const newId = MUSIC_IDS[track];
        if (currentId !== newId) {
          music.fade(globalState.musicVolume, 0, 1000, currentId);
          music.fade(0, globalState.musicVolume, 1000, newId);
          currentId = newId;
        }
      }
    } catch (e) {
      console.warn("Music play error:", e);
    }
  });
}

export function musicVolume(volume: number) {
  try {
    music.volume(volume);
  } catch (_) {}
}
