export default class Queue {  
    constructor(autorun = true) {
        this.running = false;
        this.autorun = autorun;
        this.queue = [];
        this.previousValue = undefined;
    }
  
    add(callable) {
        this.queue.push((value) => {
            const finished = new Promise((resolve, reject) => {
                const callbackResponse = callable.apply({}, value || {});

                if (value && value.concat) {
                    var callableArguments = value.concat(callbackResponse);
                } else {
                    var callableArguments = [value].concat(callbackResponse);
                }

                if (callbackResponse !== false) {
                    resolve(callbackResponse);
                } else {
                    reject(callbackResponse);
                }
            });
          
            finished.then(this.dequeue.bind(this, value), (() => {}));
        });
        
        if (this.autorun && !this.running) {
            this.dequeue();
        }
        
        return this;
    }
  
    dequeue(value) {
        this.running = this.queue.shift();

        if (this.running) {
            this.running(value);
        }

        return this.running;
    }
  
    get next() {
        return this.dequeue;
    }
}