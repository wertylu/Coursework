import HistoryQueue from "./HistoryQueue";

export default class EventHandler {
    #eventQueue = new HistoryQueue();
    #currentResolveCallback = null;
    #closed = false;
    #paused = false
    #reverseExecutionOrder = false

    constructor(eventHandlerCallback) {
        this.eventHandlerCallback = eventHandlerCallback
    }

    async start() {
        this.#closed = false

        while(!this.#closed) {
            await this.#waitForData()

            if(this.#reverseExecutionOrder) {
                if(this.#eventQueue.bufferedLength < 2) continue;

                await this.eventHandlerCallback(this.#eventQueue.revert())
            } else {
                if(this.#eventQueue.length === 0) continue;

                await this.eventHandlerCallback(this.#eventQueue.dequeue())
            }
        }
    }

    get closed() { return this.#closed }
    get paused() { return this.#paused }
    get isReverse() { return this.#reverseExecutionOrder }

    addEvents(actions) {
        this.#eventQueue.enqueue(...actions)

        if(!this.paused) {
            this.#currentResolveCallback?.()
        }
    }

    pause() {
        this.#paused = true
    }

    back() {
        this.pause()
        this.#reverseExecutionOrder = true
        this.#currentResolveCallback?.()
    }

    forward() {
        this.pause()
        this.#reverseExecutionOrder = false
        this.#currentResolveCallback?.()
    }

    resume() {
        this.#paused = false
        this.#reverseExecutionOrder = false
        this.#currentResolveCallback?.()
    }

    dropBufferedEvents() {
        this.#paused = false
        this.#reverseExecutionOrder = false
        this.#eventQueue.clear()
    }

    stop() {
        this.#eventQueue.clear()
        this.#closed = true
        this.#currentResolveCallback?.()
    }

    #waitForData() {
        return new Promise((resolve) => {
            this.#currentResolveCallback = resolve;

            if(!this.#paused) {
                if( (!this.#reverseExecutionOrder && this.#eventQueue.length > 0) ||
                    (this.#reverseExecutionOrder && this.#eventQueue.bufferedLength > 0)) {
                    resolve()
                }
            }
        })
    }
}