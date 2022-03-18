const defaultOccurance = () => [...Array(96)].map(() => '0').join('');

const getStatus = (occurance, startDt, endDt) => {
  if (!occurance || !startDt || !endDt) {
    return;
  }

  const defaultO = setOccurance(startDt, endDt, occurance).split('');
  const current = occurance.split('');

  let match = false;
  current.forEach((ele, i) => {
    if (ele === '1' && ele === defaultO[i]) {
      match = true;
    }
  });

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

module.exports = {
  defaultOccurance,
  getStatus,
  setOccurance,
};