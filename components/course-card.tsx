import Image from "next/image";
import Link from "next/link";
import { Button } from "@aws-amplify/ui-react";
import { BookOpen } from "lucide-react";

import { IconBadge, CourseProgress } from "@/components";
import { formatPrice } from "@/utils";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
}

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
}: CourseCardProps) => {
  return (
    <Link href={`/courses/${id}`}>
      <div className="group hover:shadow-md transition overflow-hidden border rounded-lg p-3 h-full flex flex-col justify-between">
        <div className="flex flex-col">
          <div className="relative w-full aspect-video rounded-md overflow-hidden">
            <Image
              fill
              className="object-cover transition opacity-80 group-hover:opacity-100"
              alt={title}
              src={imageUrl}
            />
          </div>
          <div className="flex flex-col justify-between pt-2">
            <div className="text-lg md:text-base font-medium line-clamp-2">
              {title}
            </div>
            <p className="text-xs text-muted-foreground">{category}</p>
            <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
              <div className="flex items-center gap-x-1 text-slate-500">
                <IconBadge size="sm" icon={BookOpen} />
                <span className="ml-1">
                  {chaptersLength}{" "}
                  {chaptersLength === 1 ? "Chapter" : "Chapters"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="h-[50px] overflow-hidden flex flex-col gap-1 justify-center items-center">
          {progress ? (
            <CourseProgress
              variant={progress === 100 ? "success" : "default"}
              size="sm"
              value={progress}
            />
          ) : (
            <Button size="small" isFullWidth>
              {price === 0 ? "Free" : formatPrice(price)}
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
};
