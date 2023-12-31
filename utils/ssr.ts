export const goHome = () => {
  return {
    redirect: {
      destination: "/",
      permanent: false,
    },
  };
};
