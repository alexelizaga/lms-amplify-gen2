export const timeDuration = (time?: string): number => {
  if (!time) return 0;
  const timeComponents = time.toString().split(":");

  const hours = parseInt(timeComponents[0], 10);
  const minutes = parseInt(timeComponents[1], 10);
  const seconds = parseInt(timeComponents[2], 10);

  return hours * 3600 + minutes * 60 + seconds;
};
