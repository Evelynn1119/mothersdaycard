import { useEffect, useRef, useState } from 'react'
import recordPlayerArt from '../../image/recordplayer.png'
import './VintageCdPlayer.css'

/** 33⅓ RPM → degrees per second. Used when audio is loaded. */
const TURNTABLE_DEG_PER_SEC = (33 + 1 / 3) * (360 / 60)

export type VintageCdPlayerProps = {
  /** Optional audio URL. Pass a voice memo to enable playback. */
  audioSrc?: string
}

export function VintageCdPlayer({ audioSrc }: VintageCdPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const vinylSpinRef = useRef<HTMLDivElement>(null)

  // Whether the user has clicked to start spinning
  const [isSpinning, setIsSpinning] = useState(false)
  // Whether audio is actually playing (only relevant when audioSrc is set)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)

  const hasAudio = Boolean(audioSrc)

  // ── audio event wiring ────────────────────────────────────────────────────

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onPlay  = () => setIsAudioPlaying(true)
    const onPause = () => setIsAudioPlaying(false)
    const onEnded = () => { setIsAudioPlaying(false); setIsSpinning(false) }
    el.addEventListener('play',  onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnded)
    return () => {
      el.removeEventListener('play',  onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnded)
    }
  }, [audioSrc])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    el.pause()
    setIsAudioPlaying(false)
    setIsSpinning(false)
    if (audioSrc) el.load()
  }, [audioSrc])

  // ── rAF loop: audio-synced rotation (only when audio is loaded & spinning) ─

  useEffect(() => {
    if (!audioSrc || !isSpinning) return
    const spinNode = vinylSpinRef.current
    let raf = 0
    const tick = () => {
      const t = audioRef.current?.currentTime ?? 0
      if (spinNode) spinNode.style.transform = `rotate(${t * TURNTABLE_DEG_PER_SEC}deg)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      if (spinNode) spinNode.style.removeProperty('transform')
    }
  }, [audioSrc, isSpinning])

  // ── click handler ─────────────────────────────────────────────────────────

  const handleClick = async () => {
    const el = audioRef.current

    if (!isSpinning) {
      // Start spinning
      setIsSpinning(true)
      if (hasAudio && el) {
        try { await el.play() } catch { /* ignore */ }
      }
    } else {
      // Stop / pause
      setIsSpinning(false)
      if (hasAudio && el) el.pause()
    }
  }

  // ── CSS class for the vinyl layer ─────────────────────────────────────────

  // • not spinning     → static (no class)
  // • spinning, no audio → ambient CSS animation
  // • spinning, audio  → rAF drives inline transform (CSS animation: none)
  const spinClass = [
    'vintage-record-player__vinyl-spin',
    isSpinning && !hasAudio  ? 'is-ambient'  : '',
    isSpinning &&  hasAudio  ? 'is-playing'  : '',
  ].filter(Boolean).join(' ')

  const btnLabel = isSpinning
    ? (isAudioPlaying ? 'Pause' : 'Stop')
    : (hasAudio ? 'Play' : 'Start')

  return (
    <div className="vintage-record-player">
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      <button
        type="button"
        className={`vintage-record-player__artboard${isSpinning ? ' is-spinning' : ''}`}
        onClick={() => void handleClick()}
        aria-label={btnLabel}
        aria-pressed={isSpinning}
      >
        {/* Static base illustration */}
        <img
          className="vintage-record-player__art vintage-record-player__art--base"
          src={recordPlayerArt}
          width={1080}
          height={1350}
          alt="Vintage suitcase record player"
          draggable={false}
        />

        {/* Spinning vinyl layer */}
        <div ref={vinylSpinRef} className={spinClass} aria-hidden>
          <img
            className="vintage-record-player__art vintage-record-player__art--clone"
            src={recordPlayerArt}
            width={1080}
            height={1350}
            alt=""
            draggable={false}
          />
        </div>

        {/* Play / pause icon overlay */}
        <div className={`vintage-record-player__overlay${isSpinning ? ' is-hidden' : ''}`} aria-hidden>
          <svg viewBox="0 0 24 24">
            <path d="M9 6.5v11l9-5.5-9-5.5z" />
          </svg>
        </div>
      </button>
    </div>
  )
}
