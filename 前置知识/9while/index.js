
let index = 0
siblings: while (index<10) {
  index++;
  console.log(1);
  while (index < 10) {
    console.log(2);
    index++;
    continue siblings;
  }
}

// let a = 1, b = 1;
// while (a < 10) {
//   a++;
//   console.log(a, 'a');
//   while (b < 5) {
//     b++;
//     console.log(b, 'b');
//     if (b === 4) {
//       return
//     };
//   }
// }