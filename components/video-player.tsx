import React from "react";
import ReactPlayer from "react-player/lazy";
import { OnProgressProps } from "react-player/base";
import screenfull from "screenfull";
import { Lock, Play } from "lucide-react";
import qs from "query-string";
import { Loader } from "@aws-amplify/ui-react";

import { cn } from "@/utils";

import { VideoControls } from "./video-controls";

interface VideoPlayerProps {
  isLoading?: boolean;
  url: string;
  start: number;
  end: number;
  controls?: boolean;
  playing?: boolean;
  loop?: boolean;
  isLocked?: boolean;
  isMini?: boolean;
  onEnded?: () => void;
}

export const VideoPlayer = ({
  isLoading = false,
  url,
  start,
  end,
  controls = false,
  playing = false,
  loop = false,
  isLocked = false,
  isMini = false,
  onEnded,
}: VideoPlayerProps) => {
  const videoRef = React.useRef<ReactPlayer>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [isStarted, setIsStarted] = React.useState(false);

  const [isPlaying, setIsPlaying] = React.useState(playing);
  const [volume, setVolume] = React.useState(0);
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
    if (isStarted) {
      setPlayed(playedSeconds);
    }

    if (isStarted && playedSeconds > end) {
      setIsPlaying(false);
      videoRef.current?.seekTo(end);
      onEnded && onEnded();
    }
  };

  React.useEffect(() => {
    if (!isReady) return;
    setPlayed(start);
    videoRef.current?.seekTo(start);
  }, [isReady, start]);

  return (
    <div className="relative react-player rounded-md overflow-hidden">
      <div className="aspect-video flex justify-center items-center">
        {isLoading && (
          <div className="flex flex-col justify-center items-center gap-3">
            <Loader size="large" />
            <p className="text-white">Loading</p>
          </div>
        )}
        {!isLoading && isLocked && (
          <div className="flex flex-col justify-center items-center gap-3 text-white">
            <Lock className="h-9 w-9" />
            <p>This chapter is locked</p>
          </div>
        )}
        {!isLoading && !isLocked && (
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
            onReady={() => setIsReady(true)}
            onStart={() => {
              setIsStarted(true);
              videoRef.current?.seekTo(start);
              setVolume(1);
            }}
          />
        )}
      </div>
      <button
        className={cn(
          "opacity-0 transition ease-in delay-100 duration-1000 bg-black absolute top-0 left-0 right-0 aspect-video",
          !isStarted && "delay-500",
          !isPlaying && "opacity-100 ease-out delay-0 duration-0"
        )}
        onClick={onPlaying}
      >
        <div className="flex flex-col justify-center items-center gap-3 text-white">
          <Play className="h-9 w-9" />
        </div>
      </button>
      <VideoControls
        isMini={isMini}
        isLoading={isLoading || !isStarted}
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
  );
};
