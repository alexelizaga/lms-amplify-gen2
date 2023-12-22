import React from "react";
import { BsPauseFill, BsFillPlayFill } from "react-icons/bs";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";

import { formatTime } from "@/utils";

interface VideoControlsProps {
  isPlaying: boolean;
  onPlaying: () => void;
  volume: number;
  onVolumeChange: React.ChangeEventHandler<HTMLInputElement>;
  playbackRate: string;
  onPlaybackRateChange: React.ChangeEventHandler<HTMLSelectElement>;
  isFullscreen: boolean;
  onFullscreen: () => void;
  start: number;
  end: number;
  onSeekChange: (seek: number) => void;
  onSeekMouseUp: React.MouseEventHandler<HTMLInputElement>;
  played: number;
}

export const VideoControls = ({
  isPlaying,
  onPlaying,
  volume,
  onVolumeChange,
  playbackRate,
  onPlaybackRateChange,
  isFullscreen,
  onFullscreen,
  start,
  end,
  onSeekChange,
  onSeekMouseUp,
  played,
}: VideoControlsProps) => {
  const [max, setMax] = React.useState(60);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (!start) {
      setProgress(Math.trunc(played));
      setMax(end);
    } else {
      setProgress(Math.trunc(played) - start);
      setMax(end - start);
    }
  }, [start, end, played]);

  const PlayIcon = isPlaying ? BsPauseFill : BsFillPlayFill;
  const FullscreenIcon = isFullscreen ? MdFullscreenExit : MdFullscreen;

  return (
    <div className="left-0 w-full py-1 px-2 flex items-center bg-black">
      <div className="flex items-center justify-between gap-5 w-full">
        <button className="text-white focus:outline-none" onClick={onPlaying}>
          <PlayIcon size={24} />
        </button>
        <div className="flex items-center w-full">
          <span className="text-white mr-2">
            {formatTime(progress < 0 ? 0 : progress)}
          </span>
          <div className="relative w-full h-1.5 bg-gray-600 rounded-full mr-3">
            <input
              type="range"
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              min={0}
              max={max}
              step={1}
              value={progress}
              onChange={({ target }) => {
                if (!start) {
                  onSeekChange(parseFloat(target.value));
                } else {
                  onSeekChange(parseFloat(target.value) + start);
                }
              }}
              onMouseUp={onSeekMouseUp}
            />
            <div
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
              style={{ width: `${(progress / max) * 100}%` }}
            ></div>
          </div>
          <span className="text-white mr-3">{formatTime(max)}</span>
        </div>
        <div className="flex items-center">
          <input
            type="range"
            className="w-16 h-1.5 bg-gray-600 rounded-full mr-2"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={onVolumeChange}
          />
          <select
            className="bg-black text-white px-2 py-1 rounded-md focus:outline-none"
            value={playbackRate}
            onChange={onPlaybackRateChange}
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="1.5">1.5x</option>
            <option value="2">2x</option>
          </select>
        </div>
        <button
          className="text-white focus:outline-none"
          onClick={onFullscreen}
        >
          <FullscreenIcon size={24} />
        </button>
      </div>
    </div>
  );
};
