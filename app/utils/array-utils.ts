interface WithTitle {
  title: string;
}

export const sortObjectsByTitle = (a: WithTitle, b: WithTitle) => {
  if (!a?.title || !b?.title) {
    return a?.title ? -1 : 1;
  }
  return a?.title.localeCompare(b?.title, undefined, { numeric: true });
};
