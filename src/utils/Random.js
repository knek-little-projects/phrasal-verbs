class Random {
  constructor(seed) {
    this.seed = seed;
    this.m = 0x80000000; // 2^31
    this.a = 1103515245;
    this.c = 12345;
    this.state = (this.seed ^ this.a) % this.m;
  }

  next() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state / this.m;
  }
}

export default Random; 