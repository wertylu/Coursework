

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed");
    }
}

function assertTrue(condition) {
    assert(condition, "Assertion failed");
}


function assertThrows(func, message, handle_failed) {
    try {
        func();
    } catch (e) {
        return;
    }

    handle_failed(message);
    throw new Error(message || "Assertion failed");
}


class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.parent = null;
        this.height = 1;
    }

    refreshHeight() {
        this.height = Math.max(this.left ? this.left.height : 0, this.right ? this.right.height : 0) + 1;
    }
}

export default class AvlTree {
    constructor() {
        this.logger = new ActionLogger();
        this.root = null;
        this.size = 0;
    }

    get height() {
        return this.root ? this.root.height : 0;
    }

    find(value) {
        let foundNode = this.findNodeOrReturnParent(value);

        if (foundNode) {
            if (foundNode.value === value) {
                return foundNode.value;
            }
        }

        this.logger.error(`Node with the key ${value} was not found.`)
        throw new Error("Value not found");
    }

    insert(value) {
        let parent = this.findNodeOrReturnParent(value);

        let newNode = null;

        if (parent) {
            if (parent.value !== value) {
                newNode = new Node(value);
                newNode.parent = parent;

                if (value < parent.value) {
                    parent.left = newNode;
                } else {
                    parent.right = newNode;
                }
            } else {
                this.logger.error(`Node with the key ${value} already exists.`)
                throw new Error("Value already exists");
            }
        } else {
            newNode = new Node(value);
            this.root = newNode;
        }

        this.logger.refreshState(this);
        this.logger.markNodes([value, ], "new_node", `Node ${value} was created!`)

        this.size++;

        this.fixup(newNode.parent);
    }

    remove(value) {
        let node = this.findNodeOrReturnParent(value);

        if (!node || node.value !== value) {
            this.logger.error(`Node with the key ${value} was not found.`)
            throw new Error("Value not found");
        }

        let replacement = this.findReplacement(node);
        replacement = replacement || node;
        let fixup_node = replacement.parent;

        if(node.value !== replacement.value) {
            this.logger.markNodes([ node.value, replacement.value ], "replacement",  `Node ${node.value} is replaced by ${replacement.value}...`)
        }


        let temp =  node.value;
        node.value = replacement.value;
        replacement.value = temp;

        this.logger.refreshState(this);

        this.prune(replacement);

        this.size--;

        this.logger.markNodes([ value, ], "removal",  `Node ${value} was removed!`)
        this.logger.refreshState(this);

        this.fixup(fixup_node);
    }


    findNodeOrReturnParent(value) {
        let currentNode = this.root;
        let parent = null;

        while (currentNode) {

            this.logger.markNodes([ currentNode.value, ], "search",  `Searching for node ${value} at ${currentNode.value}...`)

            if (value < currentNode.value) {
                parent = currentNode;
                currentNode = currentNode.left;
            } else if (value > currentNode.value) {
                parent = currentNode;
                currentNode = currentNode.right;
            } else {
                this.logger.markNodes([ currentNode.value, ], "found",  `Node ${value} was found!`)

                return currentNode;
            }
        }

        return parent;
    }

    fixup(node) {
        let currentNode = node;

        while (currentNode) {
            currentNode.refreshHeight();
            let balance = this.getBalance(currentNode);

            if(Math.abs(balance) > 1) {
                this.logger.markNodes([ currentNode.value, ], "fixup",  `Fixing up node ${currentNode.value}...`)
            } else {
                this.logger.markNodes([ currentNode.value, ], "fixup_traversal",  `Node ${currentNode.value} is balanced!`)
            }

            if (balance > 1) {
                if (this.getBalance(currentNode.left) < 0) {
                    this.rotateLeft(currentNode.left);
                }

                currentNode = this.rotateRight(currentNode);
            } else if (balance < -1) {
                if (this.getBalance(currentNode.right) > 0) {
                    this.rotateRight(currentNode.right);
                }

                currentNode = this.rotateLeft(currentNode);
            } else {
                currentNode = currentNode.parent;
            }
        }
    }

    rotateLeft(node) {


        let node_parent = node.parent;
        let node_right = node.right;
        let node_right_left = node_right.left;

        if (node_parent) {
            if (node_parent.left === node) {
                node_parent.left = node_right;
            }
            else {
                node_parent.right = node_right;
            }
        } else {
            this.root = node_right;
        }

        node_right.parent = node_parent;
        node.parent = node_right;
        node_right.left = node;

        node.right = node_right_left;
        if (node_right_left) {
            node_right_left.parent = node;
        }

        node.refreshHeight();
        node_right.refreshHeight();

        this.logger.markNodes([node.value, node_right.value, ], "rotation",  `Rotating left at ${node.value}...`)
        this.logger.refreshState(this);

        return node_right;
    }

    rotateRight(node) {
        let node_parent = node.parent;
        let node_left = node.left;
        let node_left_right = node_left.right;

        if (node_parent) {
            if (node_parent.left === node) {
                node_parent.left = node_left;
            }
            else {
                node_parent.right = node_left;
            }
        } else {
            this.root = node_left;
        }

        node_left.parent = node_parent;
        node.parent = node_left;
        node_left.right = node;

        node.left = node_left_right;
        if (node_left_right) {
            node_left_right.parent = node;
        }

        node.refreshHeight();
        node_left.refreshHeight();

        this.logger.markNodes([node.value, node_left.value, ], "rotation",  `Rotating right at ${node.value}...`)
        this.logger.refreshState(this);

        return node_left;
    }

    findReplacement(node) {
        if (node.right) {
            let currentNode = node.right;
            while (currentNode.left) {
                this.logger.markNodes([ currentNode.value, ], "search",  `Searching for replacement for ${node.value} at ${currentNode.value}...`)
                currentNode = currentNode.left;
            }

            this.logger.markNodes([ currentNode.value, ], "found",  `Found replacement for ${node.value}!`)
            return currentNode;
        } else if (node.left) {
            let currentNode = node.left;
            while (currentNode.right) {
                this.logger.markNodes([ currentNode.value, ], "search",  `Searching for replacement for ${node.value} at ${currentNode.value}...`)
                currentNode = currentNode.right;
            }

            this.logger.markNodes([ currentNode.value, ], "found",  `Found replacement for ${node.value}!`)
            return currentNode;
        }

        return null;
    }

    prune(node) {
        let node_child = node.left ? node.left : node.right;

        if (node_child)
            node_child.parent = node.parent;

        if (node.parent) {
            if (node.parent.left === node) {
                node.parent.left = node_child;
            } else {
                node.parent.right = node_child;
            }
        } else {
            this.root = node_child;
        }
    }

    getBalance(node) {
        return (node.left ? node.left.height : 0) - (node.right ? node.right.height : 0);
    }


    toJson() {

        let edges = [];
        let nodes = [];
        let traversalQueue = [this.root,];

        while (this.root && traversalQueue.length > 0) {
            let currentNode = traversalQueue.shift();
            nodes.push(currentNode.value);

            if (currentNode.left) {
                edges.push([currentNode.value, currentNode.left.value]);
                traversalQueue.push(currentNode.left);
            }

            if (currentNode.right) {
                edges.push([currentNode.value, currentNode.right.value]);
                traversalQueue.push(currentNode.right);
            }
        }

        return { nodes, edges };
    }
}

class ActionLogger {
    constructor() {
        this.actionList = [];
    }

    add(action) {
        this.actionList.push(action);
    }

    finalTree() {
        this.add({ "type": "final_tree", "message": "Done!" });
    }

    markNodes(nodes, reason, message = null) {
        this.add({
            type: "mark_nodes",
            nodes: nodes,
            reason: reason,
            message: message
        });
    }

    refreshState(tree) {
        this.add({
            type: "refresh_state",
            tree: tree.toJson()
        });
    }

    error(errorMessage) {
        this.add({ type: "error", message: errorMessage });
    }

    readAll() {
        this.finalTree();
        const returnList = this.actionList;
        this.actionList = [];
        return returnList;
    }


}


export function testTree() {
    console.log("Testing tree...");

    let tree = new AvlTree();


    let testArrayLength = Math.floor(10 + Math.random() * 10);


    let testArray = []
    for (let i = 0; i < testArrayLength; i++) {
        testArray.push(i);
    }

    testArray = testArray.sort((a, b) => 0.5 - Math.random());


    for (let i = 0; i < testArray.length; i++) {
        let testValue = testArray[i];

        tree.insert(testValue);
        assertTrue(tree.size === i + 1);
    }


    let node1 = new Node(5);
    let node2 = new Node(7);
    let node3 = new Node(1);
    let node4 = null;


    // set our global parent as node1, and it's child as node 2
    node1.left = node2;
    node2.parent = node1;

    // set our right child as node3
    node2.right = node3;
    node3.parent = node2;

    // set our right left child as node4
    node3.left = node4;
    if (node4) node4.parent = node3;

    tree.rotateLeft(node2);

    assertTrue(node1.left === node3);   // our target is now right child
    assertTrue(node3.parent === node1); // it's parent is still node1
    assertTrue(node2.parent === node3);  // but old target's parent is now node3
    assertTrue(node3.left === node2);  // and old target is now right child of node3
    assertTrue(!node4 || node4.parent === node2);
    assertTrue(node2.right === node4);

    tree.rotateRight(node3);

    assertTrue(node1.left === node2);   // our target is now right child
    assertTrue(node2.parent === node1); // it's parent is still node1
    assertTrue(node2.right === node3);  // but old target's parent is now node3
    assertTrue(node3.parent === node2);  // and old target is now right child of node3
    assertTrue(node3.left === node4);
    assertTrue(!node4 || node4.parent === node3);

    console.log(tree.toJson());
    console.log(tree);
    console.log(1.44 * Math.log2(tree.size + 2) - .328);
    assertTrue(tree.height < 1.44 * Math.log2(tree.size + 2) - .328);


    let deleteArray = []
    for (let i = 0; i < testArrayLength / 2; i++) {
        deleteArray.push(testArray[i]);
    }

    for (let testValue of deleteArray) {
        tree.remove(testValue);
        assertThrows(() => tree.find(testValue), "", () => console.log({ testValue, tree }));
    }

    assertTrue(tree.height < 1.44 * Math.log2(tree.size + 2) - .3277);


    console.log("Test passed!");
}