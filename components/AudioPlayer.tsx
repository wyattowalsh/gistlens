import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Music, Download, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GistFile } from '@/types';

interface AudioPlayerProps {
  file: GistFile;
  className?: string;
}

/**
 * AudioPlayer Component
 * HTML5 audio player with custom controls and waveform visualization
 */
export function AudioPlayer({ file, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const audioUrl = file.raw_url || file.content;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => setError('Failed to load audio');

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(duration, audio.currentTime + 10);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = file.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-muted/20 rounded-lg">
        <div className="text-center space-y-2">
          <Music className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative bg-gradient-to-br from-card via-card to-muted/20 rounded-2xl border p-8", className)}>
      <audio ref={audioRef} src={audioUrl} />

      {/* Visual Representation */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative p-8 bg-gradient-to-tr from-primary/10 to-purple-500/10 rounded-full border border-primary/20">
            <Music className={cn(
              "w-16 h-16 text-primary transition-all duration-300",
              isPlaying && "animate-pulse scale-110"
            )} />
          </div>
        </div>
      </div>

      {/* Track Info */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold mb-1">{file.filename}</h3>
        <p className="text-sm text-muted-foreground">
          {formatTime(currentTime)} / {formatTime(duration)}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(currentTime / duration) * 100}%, hsl(var(--muted)) ${(currentTime / duration) * 100}%, hsl(var(--muted)) 100%)`
          }}
        />
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={skipBackward}
          className="hover:bg-primary/10"
          title="Skip Backward 10s"
        >
          <SkipBack className="w-5 h-5" />
        </Button>

        <Button
          variant="default"
          size="icon"
          onClick={togglePlay}
          className="w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={skipForward}
          className="hover:bg-primary/10"
          title="Skip Forward 10s"
        >
          <SkipForward className="w-5 h-5" />
        </Button>
      </div>

      {/* Volume and Download Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="hover:bg-primary/10"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="hover:bg-primary/10"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
}
