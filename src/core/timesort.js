export default function sort(array, compare, lo, hi) {
  if (!lo) {
    lo = 0;
  }
  if (!hi) {
    hi = array.length;
  }

  var remaining = hi - lo;

  if (remaining < 2) {
    return;
  }
}