import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Course: a
    .model({
      category: a.belongsTo("Category"),
      chapters: a.hasMany("Chapter"),
      description: a.string(),
      image: a.string(),
      imageUrl: a.string(),
      isPublished: a.boolean().default(false),
      price: a.float(),
      title: a.string().required(),
      userId: a.id(),
    })
    .authorization([a.allow.owner(), a.allow.private().to(["read"])]),
  Category: a
    .model({
      courses: a.hasMany("Course"),
      icon: a.string(),
      name: a.string().required(),
    })
    .authorization([a.allow.owner(), a.allow.private().to(["read"])]),
  Chapter: a
    .model({
      course: a.belongsTo("Course"),
      description: a.string(),
      isFree: a.boolean().default(false),
      isPublished: a.boolean().default(false),
      position: a.integer().required(),
      streamEndTime: a.string(),
      streamStartTime: a.string(),
      streamUrl: a.string(),
      title: a.string().required(),
      video: a.string(),
      userId: a.id(),
    })
    .authorization([a.allow.owner(), a.allow.private().to(["read"])]),
  UserProgress: a
    .model({
      chapterId: a.id().required(),
      courseId: a.id().required(),
      isCompleted: a.boolean().default(false),
      userId: a.id().required(),
    })
    .authorization([a.allow.owner(), a.allow.private().to(["read"])]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});
