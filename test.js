var p1 = Promise.resolve(3);
var p2 = 1337;
var p3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, "foo");
});

let scrape = (i) => {
  "use strict";
  return i;
}

var p4 = (i) => {
  //return i;
  return scrape(i, (err, obj) => {
    "use strict";
    return obj;
  });
};

var p = [p4(1), p4(2), p4(3)];
console.log(p);
Promise.all(p).then(values => {
  console.log(values); // [3, 1337, "foo"]
});
