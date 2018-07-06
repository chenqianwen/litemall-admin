export function deleteOne(array, one) {
  if (array && one) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === one) {
        array.splice(i, 1);
      }
    }
  }
}
