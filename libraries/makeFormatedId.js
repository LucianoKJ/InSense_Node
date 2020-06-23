//製作userId
const makeFormatedId = (digit, formatHead, formatTail) => {
  let formatedId = `${formatHead}`;
  const zeroCount =
    digit - formatHead.toString().length - formatTail.toString().length;
  for (let i = 0; i < zeroCount; i++) {
    formatedId += "0";
  }
  formatedId += formatTail;
  return formatedId;
};

module.exports = makeFormatedId;

