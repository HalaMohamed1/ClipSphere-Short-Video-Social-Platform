"use client";

import React, { useRef, useState, useEffect } from "react";

interface VideoPlayerProps {
  src: string;
  thumbnail?: string;
  onViewIncrement?: () => void;
}

/** Platform max clip is 5m; clips under 3s never reached old "3s watch" rule — qualify at min(3s, ~half clip). */
function viewWatchThresholdSec(durationSec: number): number {
  if (!durationSec || !Number.isFinite(durationSec) || durationSec <= 0) {
    return 3;
  }
  if (durationSec < 3) {
    return Math.max(0.2, durationSec * 0.45);
  }
  return 3;
}

export default function VideoPlayer({ src, thumbnail, onViewIncrement }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);
  const incrementRef = useRef(onViewIncrement);
  incrementRef.current = onViewIncrement;

  useEffect(() => {
    setViewCounted(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  useEffect(() => {
    if (!isPlaying || viewCounted || !incrementRef.current) return;
    const d =
      duration ||
      (Number.isFinite(videoRef.current?.duration) ? videoRef.current!.duration : 0);
    const need = viewWatchThresholdSec(d);
    if (currentTime >= need) {
      incrementRef.current();
      setViewCounted(true);
    }
  }, [isPlaying, currentTime, duration, viewCounted]);

  const togglePlay = async () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      el.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden border border-zinc-800 aspect-video">
      <video
        ref={videoRef}
        src={src}
        poster={thumbnail}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-full cursor-pointer"
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors" onClick={togglePlay}>
          <div className="w-16 h-16 rounded-full bg-zinc-100/90 border border-zinc-300 flex items-center justify-center hover:bg-white transition-colors">
            <svg className="w-8 h-8 text-zinc-900 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-zinc-800 p-3 translate-y-full group-hover:translate-y-0 hover:translate-y-0 transition-transform duration-200">
        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressBarChange}
            className="w-full h-1 bg-zinc-800 rounded-full cursor-pointer appearance-none accent-zinc-400"
            style={{
              background: `linear-gradient(to right, rgb(161, 161, 170) 0%, rgb(161, 161, 170) ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgb(39 39 42) ${duration ? (currentTime / duration) * 100 : 0}%, rgb(39 39 42) 100%)`,
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between gap-2 text-white text-sm">
          <div className="flex items-center gap-3">
            <button onClick={togglePlay} className="hover:opacity-80 transition-opacity" title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.5 3a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm0 7a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1 group/volume">
              <button className="hover:opacity-80 transition-opacity" title="Volume">
                {volume === 0 ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 2h4a1 1 0 01.82 1.573l-7 10.5A1 1 0 018 14.5v2.975a1 1 0 01-1.707.707l-5.586-5.586A1 1 0 010 10V4a1 1 0 011.707-.707l7.676 7.676z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.383 3.076A1 1 0 0110 2h4a1 1 0 01.82 1.573l-7 10.5A1 1 0 018 14.5v2.975a1 1 0 01-1.707.707l-5.586-5.586A1 1 0 010 10V4a1 1 0 011.707-.707l7.676 7.676z" />
                  </svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setVolume(newVolume);
                  if (videoRef.current) videoRef.current.volume = newVolume;
                }}
                className="w-0 group-hover/volume:w-16 h-1 bg-zinc-800 rounded-full opacity-0 group-hover/volume:opacity-100 transition-all appearance-none accent-zinc-400"
              />
            </div>

            <span className="ml-auto font-medium">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button onClick={toggleFullscreen} className="hover:opacity-80 transition-opacity" title="Fullscreen">
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm12 0a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12a1 1 0 110-2h4zM3 16a1 1 0 001 1h4a1 1 0 110-2H6.414l2.293-2.293a1 1 0 10-1.414-1.414L5 13.586V12a1 1 0 10-2 0v4zm12 0a1 1 0 001-1v-4a1 1 0 10-2 0v1.586l-2.293-2.293a1 1 0 10-1.414 1.414L13.586 15H12a1 1 0 110 2h4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm12 0a1 1 0 011 1v4a1 1 0 11-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12a1 1 0 110-2h4zM3 16a1 1 0 001 1h4a1 1 0 110-2H6.414l2.293-2.293a1 1 0 10-1.414-1.414L5 13.586V12a1 1 0 10-2 0v4zm12 0a1 1 0 001-1v-4a1 1 0 10-2 0v1.586l-2.293-2.293a1 1 0 10-1.414 1.414L13.586 15H12a1 1 0 110 2h4z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Hover to show controls */}
      <style>{`
        div:has(> video):hover > div:last-child {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
