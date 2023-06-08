export default class Queue {

    constructor() {
        this.head = null
        this.tail = null
        this.bufferedHead = null
        this.length = 0
        this.bufferedLength = 0

        this.maxBufferLength = 100
    }

    enqueue(...elements) {
        for(let element of elements) {
            this.tail = new Node(this.tail, element)

            if(!this.head) {
                this.head = this.tail
            }

            this.length++
        }
    }

    dequeue() {
        if(this.length === 0) return undefined

        const item = this.head
        this.head = this.head.next

        this.length--

        this.bufferedLength++
        if(!this.bufferedHead) {
            this.bufferedHead = item
        }

        if(this.bufferedLength > -1) {
            while (this.bufferedLength > this.maxBufferLength) {
                this.bufferedHead = this.bufferedHead === this.head ? null : this.bufferedHead.next

                if(this.bufferedHead) {
                    this.bufferedHead.previous = null
                }

                this.bufferedLength--
            }
        }

        return item.element;
    }

    revert() {
        if(this.bufferedLength < 2) return undefined

        if( this.length > 0) {
            this.head = this.head.previous
        } else {
            this.head = this.tail
        }

        this.length++
        this.bufferedLength--

        return this.head.previous.element;
    }

    clear() {
        this.head = null;
        this.tail = null;
        this.bufferedHead = null;
        this.length = 0;
        this.bufferedLength = 0;
    }

    set elements(value) {
        this.clear()
        for(let element of value) {
            this.enqueue(element)
        }
    }

    get elements() {
        let elements = []

        let current = this.bufferedHead
        let i = 0
        while(current && i < this.bufferedLength) {
            elements.push(current.element)
            current = current.next
            i++
        }

        return elements
    }
}

class Node {
    constructor(previous, element) {
        this.previous = previous
        this.next = null

        if(this.previous) {
            this.previous.next = this
        }

        this.element = element
    }
}