export class Aftermarket {
  constructor() {
    this.queuePairs = [];
    this.total = {
      inSelling: 0,
      inBuying: 0
    };
  }
}

export class QueuePair {
  constructor(percentage) {
    this.percentage = percentage;
    this.sellingQueue = {};
    this.buyingQueue = {};
  }
}

export class Queue {
  constructor(head, tail, total) {
    this.head = head;
    this.tail = tail;
    this.total = total;
    this.orders = [];
  }
}

export class Order {
  constructor(address, quantity) {
    this.address = address;
    this.quantity = quantity;
  }
}