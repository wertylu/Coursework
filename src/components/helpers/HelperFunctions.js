export function toCytoscapeElements(graph, idsForEdges = false) {
    let elements = []
    if (!graph) {
        return {}
    }

    if (graph.nodes) {
        for (const node of graph.nodes) {
            elements.push({ data: { id: node, label: `${node}` } })
        }
    }

    if (graph.edges) {
        for (const edge of graph.edges) {
            let newEdge = { data: { source: edge[0], target: edge[1] } }
            if (idsForEdges)
                newEdge.data.id = `${edge[0]} ${edge[1]}`
            elements.push(newEdge)
        }
    }
    return elements
}


export function assignClassesToElements(nodes, classes, cy) {
    for (const node of nodes) {
        const cyNode = cy.getElementById(node)
        cyNode.addClass(classes)
    }
}


export function clearAllClasses(cy) {
    for (const node of cy.elements()) {
        node.removeClass(node.classes())
    }
}


export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}