class Queue {
    static THREAD_LIMIT = 15;
    static THREAD_WAIT = 1;

    constructor(limit=Queue.THREAD_LIMIT, wait=Queue.THREAD_WAIT) {
        this._limit = Number(limit);
        this._wait = Number(wait);
        this._waitList = [];
        this._threads = [];
        this._watchers = [];
        this._nbWaiting = 0;
        this._nbRunning = 0;
    }

    run(process) {
        if(typeof process !== 'function') return;
        if(
            this._nbRunning < this._limit &&
            !this._nbWaiting
        ) {
            this.__runProcess(process);
        } else {
            this._nbWaiting++;
            this._waitList.push(process);
        }
    }

    __runProcess(process) {
        this._nbRunning++;
        this._threads.push(process);
        setTimeout(() => {
            process(() => this.__endProcess(process));
            // this.__endProcess(process);
        }, this._nbWaiting ? this._wait : 1);
    }

    __endProcess(process) {
        const finder = this._threads.indexOf(process);
        if(finder < 0) return;
        this._threads.splice(finder, 1);
        this._nbRunning--;
        /* Next */
        if(this._nbWaiting) {
            this._nbWaiting--;
            this.__runProcess(this._waitList.shift());
        } else if(!this._nbRunning) {
            let watcher;
            while(watcher=this._watchers.shift(), watcher) watcher();
        }
    }

    watch() {
        return new Promise(resolve => {
            if(this._nbWaiting + this._nbRunning) {
                this._watchers.push(resolve);
            } else resolve();
        });
    }

    stop() {
        this._waitList = [];
        this._nbWaiting = 0;
        return this;
    }
}

export default Queue;