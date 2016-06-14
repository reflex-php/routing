export default class Queue {
    /**
     * Construct a Queue instance
     * @param  {Boolean} autorun Autorun
     * @param  {Array}   queue   Queue
     * @return {Queue}          
     */
    constructor(autorun = true, queue) {
        this.running = false;
        this.autorun = autorun;
        this.queue = queue || new Array;
        this.previousValue = undefined;
    }
    
    /**
     * Add callback 
     * @param {callable} callable Callable
     * @return {Queue} 
     */
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
    
    /**
     * Dequeue the next callable
     * @param  {mixed} value Value to passin
     * @return {callable}       
     */
    dequeue(value) {
        this.running = this.queue.shift();

        if (this.running) {
            this.running(value);
        }

        return this.running;
    }
    
    /**
     * Getter for 'next'
     * @return {Function} 
     */
    get next() {
        return this.dequeue;
    }
}