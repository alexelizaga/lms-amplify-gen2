import React from "react";
import Image from "next/image";
import axios from "axios";
import { Button, Input } from "@aws-amplify/ui-react";
import { MdOutlineSearch } from "react-icons/md";

import { PhotoValues } from "@/types";

interface SearchImageProps {
  onSelectedPhoto: ({ imageUrl }: { imageUrl: string }) => void;
}

export const SearchImage = ({ onSelectedPhoto }: SearchImageProps) => {
  const [query, setQuery] = React.useState<string>("");
  const [photos, setPhotos] = React.useState<PhotoValues[]>([]);

  const getPhotos = async (query: string) => {
    if (!query) return;
    const { data } = await axios.get<PhotoValues[]>(
      `/api/pexel?query=${query}`
    );
    setPhotos(data);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      getPhotos(query);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        <Input
          id="photo"
          placeholder="Search photo"
          value={query}
          onChange={({ target }) => setQuery(target.value)}
          onKeyDown={handleKeyPress}
        />
        <Button size="small" onClick={() => getPhotos(query)}>
          <MdOutlineSearch />
        </Button>
      </div>

      <div className="grid grid-cols-3">
        {photos?.map((photo) => (
          <button
            key={photo.id}
            className="relative aspect-video overflow-hidden hover:opacity-75 cursor-pointer"
            onClick={() => onSelectedPhoto({ imageUrl: photo.src.landscape })}
          >
            <Image
              alt={photo.alt}
              src={photo.src.landscape}
              width={photo.width}
              height={photo.height}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
