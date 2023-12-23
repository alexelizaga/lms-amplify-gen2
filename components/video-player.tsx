import React from "react";
import ReactPlayer from "react-player/lazy";
import { OnProgressProps } from "react-player/base";
import screenfull from "screenfull";
import { Lock } from "lucide-react";
import qs from "query-string";

import { cn } from "@/utils";

import { VideoControls } from "./video-controls";

interface VideoPlayerProps {
  url: string;
  start: number;
  end: number;
  controls?: boolean;
  playing?: boolean;
  loop?: boolean;
  isLocked?: boolean;
  onEnded?: () => void;
}

export const VideoPlayer = ({
  url,
  start,
  end,
  controls = false,
  playing = false,
  loop = false,
  isLocked = false,
  onEnded,
}: VideoPlayerProps) => {
  const videoRef = React.useRef<ReactPlayer>(null);

  const [isPlaying, setIsPlaying] = React.useState(playing);
  const [volume, setVolume] = React.useState(1);
  const [playbackRate, setPlaybackRate] = React.useState("1");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [played, setPlayed] = React.useState(start);

  const videoUrl = React.useMemo(() => {
    const saveUrl = qs.parseUrl(url);
    if (url.includes("youtube")) {
      return `${saveUrl.url}?v=${saveUrl.query.v}`;
    }
    if (url.includes("vimeo")) {
      return `${saveUrl.url}`;
    }
  }, [url]);

  const onPlaying = () => {
    setIsPlaying((current) => !current);
  };

  const onVolumeChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setVolume(parseFloat(e.target.value));
  };

  const onPlaybackRateChange: React.ChangeEventHandler<HTMLSelectElement> = (
    e
  ) => {
    setPlaybackRate(e.target.value);
  };

  const onFullscreen = () => {
    setIsFullscreen((current) => !current);
    if (!isFullscreen) {
      screenfull.request(document.querySelector(".react-player") || undefined);
    } else {
      screenfull.exit();
    }
  };

  const onSeekChange = (seek: number) => {
    setPlayed(seek);
  };

  const onSeekMouseUp: React.MouseEventHandler<HTMLInputElement> = () => {
    videoRef.current?.seekTo(played);
  };

  const onProgress = ({ playedSeconds }: OnProgressProps) => {
    setPlayed(playedSeconds);
    if (playedSeconds > end) {
      setIsPlaying(false);
      videoRef.current?.seekTo(end);
      setPlayed(end);
      onEnded && onEnded();
    }
  };

  React.useEffect(() => {
    if (!videoRef.current) return;
    setPlayed(start);
    videoRef.current?.seekTo(start);
  }, [start]);

  return (
    <>
      {isLocked && (
        <div className="aspect-video flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-white/80">
          <Lock className="h-8 w-8" />
          <p className="text-sm">This chapter is locked</p>
        </div>
      )}
      {!isLocked && (
        <div className="relative react-player rounded-md overflow-hidden">
          <div className="aspect-video">
            <ReactPlayer
              ref={videoRef}
              url={videoUrl}
              controls={controls}
              playing={isPlaying}
              volume={volume}
              loop={loop}
              onProgress={onProgress}
              onEnded={onEnded}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              playbackRate={parseFloat(playbackRate)}
              width={"100%"}
              height={"100%"}
              onStart={() => {
                setPlayed(start);
                videoRef.current?.seekTo(start);
              }}
            />
          </div>
          <button
            className={cn(
              "opacity-0 transition ease-in delay-100 duration-1000 bg-black absolute top-0 left-0 right-0 aspect-video",
              !isPlaying && "opacity-100 ease-out delay-0 duration-0"
            )}
            onClick={onPlaying}
          ></button>
          <VideoControls
            isPlaying={isPlaying}
            onPlaying={onPlaying}
            volume={volume}
            onVolumeChange={onVolumeChange}
            playbackRate={playbackRate}
            onPlaybackRateChange={onPlaybackRateChange}
            isFullscreen={isFullscreen}
            onFullscreen={onFullscreen}
            start={start}
            end={end}
            onSeekChange={onSeekChange}
            onSeekMouseUp={onSeekMouseUp}
            played={played}
          />
        </div>
      )}
    </>
  );
};
