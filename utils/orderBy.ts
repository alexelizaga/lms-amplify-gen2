// Example: sort array of objects with .sort(orderByTitle)

export function orderByTitle(a: { title: string }, b: { title: string }) {
  if (a.title < b.title) {
    return -1;
  }
  if (a.title > b.title) {
    return 1;
  }
  return 0;
}

export function orderByName(a: { name: string }, b: { name: string }) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

export function orderByPosition(
  a: { position: number },
  b: { position: number }
) {
  return a.position - b.position;
}
