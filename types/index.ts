import { Schema } from "@/amplify/data/resource";

export type CourseValues = Pick<
  Schema["Course"],
  | "id"
  | "category"
  | "userId"
  | "title"
  | "description"
  | "image"
  | "imageUrl"
  | "categoryCoursesId"
  | "price"
  | "isPublished"
  | "chapters"
  | "owner"
>;

export type CourseWithProgress = CourseValues & {
  userProgress: number;
  numberOfChapters: number;
  categoryLabel: string;
};

export type CategoryValues = Pick<Schema["Category"], "id" | "icon" | "name">;

export type ChapterValues = Pick<
  Schema["Chapter"],
  | "id"
  | "position"
  | "title"
  | "description"
  | "video"
  | "streamUrl"
  | "streamStartTime"
  | "streamEndTime"
  | "isPublished"
  | "isFree"
  | "courseChaptersId"
  | "course"
  | "owner"
>;

export type PhotoValues = {
  alt: string;
  avg_color: string;
  height: number;
  id: number;
  liked: boolean;
  photographer: string;
  photographer_id: number;
  photographer_url: string;
  src: {
    landscape: string;
    large: string;
    large2x: string;
    medium: string;
    original: string;
    portrait: string;
    small: string;
    tiny: string;
  };
  url: string;
  width: number;
};

export type UserProgressValues = Pick<
  Schema["UserProgress"],
  "chapterId" | "isCompleted" | "owner" | "courseId" | "userId"
>;

export type UserValues = {
  userId: string;
  username: string;
};
