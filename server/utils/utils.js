const createMessage = (username, img, msgcontent) => {
  return {
    username,
    img,
    msgcontent,
    date: new Date().getTime(),
  };
};

module.exports = {
  createMessage,
};
