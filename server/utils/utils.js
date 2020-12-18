const createMessage = (sender, receiver, content) => {
  return {
    sender,
    receiver,
    content,
    timestamp: new Date().getTime(),
  };
};

module.exports = {
  createMessage,
};
