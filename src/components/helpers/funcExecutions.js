import { topsort } from "../app_logic/topsort";
import AVLTree from "../app_logic/tree"

let tree = null;


export function getTree() {
    try {
        createTreeIfNotPresent();
        return tree.logger.readAll();
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }
}

export function getTreeItem(value) {
    try {
        createTreeIfNotPresent();
        try {
            tree.find(value);
        } catch {
            console.log("Key not found");
        }

        return tree.logger.readAll();
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export function insert(data) {
    try {
        let key = data;

        if (typeof key !== "number" || !Number.isInteger(key)) {
            console.log("only int");
            return;
        }
        if (key < 0) {
            console.log("only bigger than 0");
            return;
        }

        createTreeIfNotPresent();

        try {
            tree.insert(key);
        }
        catch {
            console.log("Key already exists");
        }

        return tree.logger.readAll();
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export function clearTree() {
    tree = null;
}

export function deleteItem(key) {
        try {
            tree.remove(key);
        } catch {
            console.log("Key not found");
        }
        return tree.logger.readAll();
}



export function createTreeIfNotPresent() {
    if (tree === null) {
        tree = new AVLTree();
    }
}


export function topologicalSort(start, edges) {
    try {
        const  logger = topsort(edges, start);
        return logger.readAll();
    } catch (e) {
        console.log(e);
        throw e;
    }
}


