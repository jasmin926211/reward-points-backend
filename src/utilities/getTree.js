/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const getTree = (
  allData,
  currentid,
  parentfound = false,
  result = [],
) => {
  allData.forEach((res) => {
    if (res.systemID) {
      if (
        (!parentfound && res.systemID === currentid) ||
        res.parentID === currentid
      ) {
        result = result.concat([{ ...res._doc }]);
        if (res.parentID === currentid) {
          result = result.concat(
            getTree(allData, res.systemID, true),
          );
        }
      }
    }
  });
  return result;
};
module.exports = { getTree };
