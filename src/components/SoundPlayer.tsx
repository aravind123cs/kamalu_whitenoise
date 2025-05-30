"use client";

import type { Sound } from "@/lib/sounds";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Play, Pause, Repeat, Volume2, VolumeX, TimerIcon, StopCircle } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

interface SoundPlayerProps {
  sounds: Sound[];
}

const timerSchema = z.object({
  minutes: z.number().min(0).max(240), // Max 4 hours
});
type TimerFormData = z.infer<typeof timerSchema>;

export default function SoundPlayer({ sounds }: SoundPlayerProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const [currentSound, setCurrentSound] = React.useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isLooping, setIsLooping] = React.useState(false);
  const [volume, setVolume] = React.useState(0.75); // Default volume 75%
  const [isMuted, setIsMuted] = React.useState(false);
  const [previousVolume, setPreviousVolume] = React.useState(0.75);

  const [timerDuration, setTimerDuration] = React.useState(0); // in seconds
  const [timeLeft, setTimeLeft] = React.useState(0); // in seconds

  const { control, watch, setValue: setFormValue } = useForm<TimerFormData>({
    resolver: zodResolver(timerSchema),
    defaultValues: {
      minutes: 0,
    },
  });
  const formMinutes = watch("minutes");

  React.useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audioElement = audioRef.current;
    const handleAudioEnd = () => {
      if (!audioRef.current?.loop) {
        setIsPlaying(false);
        if (timerIntervalRef.current) { // If timer was active, it implies user wanted sound for that duration
          setTimeLeft(0);
          setTimerDuration(0);
          setFormValue("minutes", 0);
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
      }
    };
    audioElement.addEventListener('ended', handleAudioEnd);

    return () => {
      audioElement.removeEventListener('ended', handleAudioEnd);
      audioElement.pause();
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [setFormValue, volume]);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playAudio = React.useCallback(() => {
    if (audioRef.current && currentSound) {
      if (audioRef.current.src !== currentSound.src) {
        audioRef.current.src = currentSound.src;
        audioRef.current.load();
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (formMinutes > 0 && timeLeft <= 0) { // Start timer only if not already running & duration is set
          const newDuration = formMinutes * 60;
          setTimerDuration(newDuration);
          setTimeLeft(newDuration);
        }
      }).catch(error => console.error("Error playing audio:", error));
    }
  }, [currentSound, formMinutes, timeLeft]);

  const pauseAudio = React.useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  React.useEffect(() => {
    if (isPlaying && timeLeft > 0 && !timerIntervalRef.current) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerIntervalRef.current!);
            timerIntervalRef.current = null;
            pauseAudio();
            setTimerDuration(0);
            setFormValue("minutes", 0);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if ((!isPlaying || timeLeft <= 0) && timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying, timeLeft, pauseAudio, setFormValue]);


  const handleSoundSelect = (soundId: string) => {
    console.log('soundId: ', soundId);
    const selected = sounds.find(s => s.id === soundId);
    console.log('selected: ', selected);
    if (selected) {
      setCurrentSound(selected);
      if (isPlaying && audioRef.current) {
        audioRef.current.src = selected.src;
        audioRef.current.load();
        audioRef.current.play().catch(error => console.error("Error playing new sound:", error));
      } else if (audioRef.current) {
        audioRef.current.src = selected.src;
        audioRef.current.load();
      }
    }
  };

  const handlePlayPause = () => {
    if (!currentSound && sounds.length > 0) {
      console.log('sounds: ', sounds);
      // Auto-select first sound if none is selected
      handleSoundSelect(sounds[0].id);
      // Need a slight delay for state to update then play
      setTimeout(() => playAudio(), 50);
      return;
    }
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleStop = () => {
    pauseAudio();
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimeLeft(0);
    setTimerDuration(0);
    setFormValue("minutes", 0);
  };

  const toggleLoop = () => setIsLooping(prev => !prev);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    } else if (newVolume === 0 && !isMuted) {
      setIsMuted(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume > 0 ? previousVolume : 0.1); // Restore to previous or small volume
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full shadow-xl bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Image src="/kamalu.jpg" alt="Kamalu's White noise Player" width={150} height={150} className="rounded-full" data-ai-hint="moon stars" />
        </div>
        <CardTitle className="text-3xl font-semibold text-primary-foreground">Sound Controls</CardTitle>
        {currentSound && (
          <CardDescription className="text-lg text-muted-foreground">{isPlaying ? `Playing: ${currentSound.name}` : `Paused: ${currentSound.name}`}</CardDescription>
        )}
        {!currentSound && (
          <CardDescription className="text-lg text-muted-foreground">Select a sound to begin</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sound-select" className="text-md">Choose Sound</Label>
          <Select onValueChange={handleSoundSelect} value={currentSound?.id}>
            <SelectTrigger id="sound-select" className="w-full text-lg h-12">
              <SelectValue placeholder="Select a sound..." />
            </SelectTrigger>
            <SelectContent>
              {sounds.map(sound => (
                <SelectItem key={sound.id} value={sound.id} className="text-lg">
                  {sound.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-around space-x-2">
          <Button onClick={handlePlayPause} variant="ghost" size="lg" className="p-3 rounded-full hover:bg-primary/20" aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <Pause className="w-10 h-10 text-primary" /> : <Play className="w-10 h-10 text-primary" />}
          </Button>
          <Button onClick={handleStop} variant="ghost" size="lg" className="p-3 rounded-full hover:bg-destructive/20" aria-label="Stop">
            <StopCircle className="w-10 h-10 text-destructive" />
          </Button>
          <Button onClick={toggleLoop} variant={isLooping ? "secondary" : "ghost"} size="lg" className="p-3 rounded-full hover:bg-primary/20" aria-label={isLooping ? "Disable Loop" : "Enable Loop"}>
            <Repeat className={cn("w-8 h-8", isLooping ? "text-accent-foreground" : "text-primary/70")} />
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label htmlFor="volume-slider" className="text-md flex items-center justify-between">
            Volume
            <Button onClick={toggleMute} variant="ghost" size="icon" className="w-8 h-8" aria-label={isMuted ? "Unmute" : "Mute"}>
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-primary/70" /> : <Volume2 className="w-5 h-5 text-primary/70" />}
            </Button>
          </Label>
          <Slider
            id="volume-slider"
            min={0}
            max={1}
            step={0.01}
            value={[isMuted ? 0 : volume]}
            onValueChange={handleVolumeChange}
            className="w-full"
          />
        </div>

        <Separator />

        <div className="space-y-3">
          <Label htmlFor="timer-minutes" className="text-md flex items-center">
            <TimerIcon className="w-5 h-5 mr-2 text-primary/70" /> Set Timer (minutes)
          </Label>
          <Controller
            name="minutes"
            control={control}
            render={({ field }) => (
              <Input
                id="timer-minutes"
                type="number"
                min="0"
                max="240"
                value={field.value}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (timerIntervalRef.current) { // If timer is running, stop it before changing
                    clearInterval(timerIntervalRef.current);
                    timerIntervalRef.current = null;
                    setIsPlaying(false); // Also stop audio if timer is reset
                    if (audioRef.current) audioRef.current.pause();
                  }
                  setTimeLeft(0); // Reset current countdown
                  setTimerDuration(0);
                  field.onChange(isNaN(val) ? 0 : val);
                }}
                onBlur={(e) => { // Apply timer when focus is lost and play is pressed
                  const val = parseInt(e.target.value);
                  const newDuration = (isNaN(val) ? 0 : val) * 60;
                  if (isPlaying && newDuration > 0) {
                    setTimerDuration(newDuration);
                    setTimeLeft(newDuration);
                  } else if (newDuration === 0) {
                    setTimerDuration(0);
                    setTimeLeft(0);
                  }
                }}
                placeholder="0"
                className="w-full text-lg h-12"
                disabled={isPlaying && timeLeft > 0}
              />
            )}
          />

          {timerDuration > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-center text-lg text-foreground">
                Time Remaining: {formatTime(timeLeft)}
              </div>
              <Progress value={(timeLeft / timerDuration) * 100} className="w-full h-3" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
