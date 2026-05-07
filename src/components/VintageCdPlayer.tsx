import { useEffect, useRef, useState } from 'react'
import recordPlayerArt from '../../image/crosley-player.jpeg'
import vinylArt from '../../image/vinyl.png'
import './VintageCdPlayer.css'

export type VintageCdPlayerProps = {
  /** Optional audio URL. Pass a voice memo to enable playback. */
  audioSrc?: string
}

export function VintageCdPlayer({ audioSrc }: VintageCdPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  /** True once the user has clicked the player to start the record. */
  const [isSpinning, setIsSpinning] = useState(false)

  const hasAudio = Boolean(audioSrc)

  // ── audio event wiring ────────────────────────────────────────────────────

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onEnded = () => setIsSpinning(false)
    el.addEventListener('ended', onEnded)
    return () => el.removeEventListener('ended', onEnded)
  }, [audioSrc])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    setIsSpinning(false)
    if (audioSrc) el.load()
  }, [audioSrc])

  // ── click handler ─────────────────────────────────────────────────────────

  const handleClick = async () => {
    const el = audioRef.current

    if (!isSpinning) {
      setIsSpinning(true)
      if (hasAudio && el) {
        try { await el.play() } catch { /* ignore */ }
      }
    } else {
      setIsSpinning(false)
      if (hasAudio && el) el.pause()
    }
  }

  return (
    <div className="vintage-record-player">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      <button
        type="button"
        className={`vintage-record-player__artboard${isSpinning ? ' is-spinning' : ''}`}
        onClick={() => void handleClick()}
        aria-label={isSpinning ? 'Stop' : 'Play'}
        aria-pressed={isSpinning}
      >
        {/* Static base illustration */}
        <img
          className="vintage-record-player__art vintage-record-player__art--base"
          src={recordPlayerArt}
          width={867}
          height={1024}
          alt="Vintage Crosley suitcase record player"
          draggable={false}
        />

        {/*
         * Red disk overlay.
         *
         *   .vinyl-window  → fixed circular mask anchored at the spindle
         *                    (no rotation here, never moves)
         *   .vinyl-disk    → the rotating image (animation toggled by .is-spinning)
         */}
        <div className="vintage-record-player__vinyl-window" aria-hidden>
          <div
            className={`vintage-record-player__vinyl-rotator${isSpinning ? ' is-spinning' : ''}`}
          >
            <img
              className="vintage-record-player__vinyl-disk"
              src={vinylArt}
              alt=""
              draggable={false}
            />
          </div>
        </div>

        {/* Play icon overlay — fades out once the record starts */}
        <div className={`vintage-record-player__overlay${isSpinning ? ' is-hidden' : ''}`} aria-hidden>
          <svg viewBox="0 0 24 24">
            <path d="M9 6.5v11l9-5.5-9-5.5z" />
          </svg>
        </div>
      </button>
    </div>
  )
}
