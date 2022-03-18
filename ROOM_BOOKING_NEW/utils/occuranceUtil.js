const defaultOccurance = () => [...Array(96)].map(() => '0').join('');

const getStatus = (occurance, startDt, endDt) => {
  if (!occurance || !startDt || !endDt) {
    return;
  }

  const { startIndex, endIndex } = getStartEndIndexes(
    startDt,
    endDt,
    occurance
  );
  const current = occurance.split('');

  let match = false;
  for (let x = startIndex; x < endIndex; x++) {
    if (current[x] === '1') {
      match = true;
    }
  }

  return match ? 'busy' : 'available';
};

/**
 * function to update/set occurance for user
 * @param {String} startDt
 * @param {String} endDt
 * @param {String} occurance
 * @returns binary digits - 96 bit
 */
const setOccurance = (startDt, endDt, occurance) => {
  const _start = new Date(startDt);
  const _end = new Date(endDt);

  const rangeInMin = (_end - _start) / (60 * 1000);
  const startHour = _start.getHours();

  const startIndex = (startHour - 1) * 4;
  const endIndex = startIndex + Math.ceil(rangeInMin / 15);

  return occurance
    .split('')
    .map((ele, i) => {
      if (i >= startIndex && i < endIndex) {
        return '1';
      } else {
        return ele;
      }
    })
    .join('');
};

const getStartEndIndexes = (startDt, endDt, occurance) => {
  const _start = new Date(startDt);
  const _end = new Date(endDt);

  const rangeInMin = (_end - _start) / (60 * 1000);
  const startHour = _start.getHours();

  const startIndex = (startHour - 1) * 4;
  const endIndex = startIndex + Math.ceil(rangeInMin / 15);

  return { startIndex, endIndex };
};

module.exports = {
  defaultOccurance,
  getStatus,
  setOccurance,
  getStartEndIndexes,
};
