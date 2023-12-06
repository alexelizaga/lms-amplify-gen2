import React from "react";
import ReactPlayer from "react-player";
import screenfull from "screenfull";

import { VideoControls } from "./video-controls";
import { OnProgressProps } from "react-player/base";

interface VideoPlayerProps {
  url: string;
  start: number;
  end: number;

  controls?: boolean;
  playing?: boolean;
  loop?: boolean;
}

export const VideoPlayer = ({
  url,
  start,
  end,
  controls = false,
  playing = true,
  loop = false,
}: VideoPlayerProps) => {
  const videoRef = React.useRef<ReactPlayer>(null);

  const [isPlaying, setIsPlaying] = React.useState(playing);
  const [volume, setVolume] = React.useState(1);
  const [playbackRate, setPlaybackRate] = React.useState("1");
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [played, setPlayed] = React.useState(start);

  const videoUrl = React.useMemo(() => {
    if (url.includes("youtube")) return `${url}&t=${start}`;
    if (url.includes("vimeo")) return `${url}#t=${start}s`;
  }, [start, url]);

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
    }
  };

  return (
    <div className="react-player rounded-md overflow-hidden">
      <div className="aspect-video">
        <ReactPlayer
          ref={videoRef}
          url={videoUrl}
          controls={controls}
          playing={isPlaying}
          volume={volume}
          loop={loop}
          onProgress={onProgress}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          playbackRate={parseFloat(playbackRate)}
          width={"100%"}
          height={"100%"}
        />
      </div>
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
  );
};
