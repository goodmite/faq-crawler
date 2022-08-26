async function main() {
  let index_1 = 0;
  let index_2 = 0;

  // a promise that resolves after ms*1000 seconds
  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  // await within recursive function's while loop
  async function recursion() {
    ++index_1;
    while (index_1 < 10) {
      console.log('from recursion: ' + index_1); // LINE A: logs immediately
      await sleep(5000);
      await recursion();
    }
  }
  
  // await within non-recursive function's while loop
  async function notRecursion() {
    while (index_2 < 10) {
      console.log("from non-recursion: " + index_2); // LINE B: logs after 5 seconds each
      await sleep(5000);
      index_2++;
    }
  }

  recursion();
  notRecursion();
}

main();
