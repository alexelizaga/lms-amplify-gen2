import { Schema } from "@/amplify/data/resource";

export type CourseValues = Pick<
  Schema["Course"],
  | "courseId"
  | "userId"
  | "title"
  | "description"
  | "image"
  | "imageUrl"
  | "categoryCoursesId"
  | "price"
  | "isPublished"
>;

export type CategoryValues = Pick<Schema["Category"], "id" | "icon" | "name">;
