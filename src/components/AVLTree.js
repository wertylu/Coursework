import {useRef} from "react";
import cytoscape from "cytoscape";
import dagre from 'cytoscape-dagre';
import GraphView from "./GraphView";
import {toCytoscapeElements, assignClassesToElements, clearAllClasses, delay} from "./helpers/HelperFunctions"
import {clearTree, deleteItem, getTree, getTreeItem, insert} from "./helpers/funcExecutions";


cytoscape.use(dagre);

export default function AVLTree({style, visualizationDuration, getInterface, ...props}) {

    const graphViewInterface = useRef()
    const thisInterface = useRef()


    let viewportStyle = style || {
        width: "100%",
        height: "100%"
    }

    let layout = {
        name: "dagre",
        animate: true,
        animationDuration: visualizationDuration * 750
    }

    let stylesheet = [
        {
            selector: 'node',
            style: {
                content: 'data(id)',
                "background-color": "white",
                "border-color": "black",
                'border-width': 2,
                "text-valign": "center",
                "text-halign": "center"
            }
        },
        {
            selector: 'edge',
            style: {
                'line-color': "lightblue",
            }
        },
        {
            selector: '.new_node',
            style: {
                'background-color': "green",
            }
        },
        {
            selector: '.removal',
            style: {
                'color': 'white',
                'background-color': "red",
            }
        },
        {
            selector: '.search',
            style: {
                'border-color': "black",
                'background-color': "black",
                'color': "white",
                'border-width': 3,
            }
        },
        {
            selector: '.found',
            style: {
                'background-color': "green",
                'border-width': 2,
            }
        },
        {
            selector: '.rotation',
            style: {
                'border-color': "orange",
                'border-width': 2,
            }
        },
        {
            selector: '.replacement',
            style: {
                'border-color': "orange",
                'border-width': 3,
            }
        },
        {
            selector: '.fixup_traversal',
            style: {
                'border-color': "black",
                'border-style': 'double',
                'background-color': "black",
                'color': "white",
                'border-width': 4,
            }
        },
        {
            selector: '.fixup',
            style: {
                'border-color': "orange",
                'border-style': 'double',
                'background-color': "black",
                'color': "white",
                'border-width': 4,
            }
        }]


    return <GraphView
        stylesheet={stylesheet}
        style={viewportStyle}
        layout={layout}
        getInterface={(interfaceObj) => {
            graphViewInterface.current = interfaceObj;
            initializeInterfaceObject()
        }}
        visualizationDuration={visualizationDuration}
        actionHandler={actionHandler}
        actionHandlerArgs={{onMessage: props.onMessage}}/>;


    function initializeInterfaceObject() {
        thisInterface.current = {
            pause: graphViewInterface.current.pauseHandler,
            resume: graphViewInterface.current.resumeHandler,
            stepBack: graphViewInterface.current.stepBack,
            stepForward: graphViewInterface.current.stepForward,
            isPaused: () => graphViewInterface.current.getHandler().paused,
            insert: (node) => {
                console.log(node);
                let data = insert(node);
                graphViewInterface.current.addActions(data);
                console.log(data);

            },
            remove: (node) => {
                let data = deleteItem(node)
                graphViewInterface.current.addActions(data)
            },
            find: (node) => {
                let data = getTreeItem(node);
                graphViewInterface.current.addActions(data)
            },
            clear: () => {
                clearTree();
                graphViewInterface.current.reset()
                graphViewInterface.current.addActions([{type: "set", tree: []}])
            },
        }
        getInterface(thisInterface.current)

        graphViewInterface.current.addActions([{type: "set", tree: getTree()}])

        graphViewInterface.current.getCy().nodes().ungrabify()

        return thisInterface.current
    }
}


async function actionHandler({getCy, setGraph, getGraph, action, ...props}) {
    let actionType = action.type
    let visualizationDuration = props.getVisualizationDuration?.()
    let cy = getCy()


    if (action.old_tree) {
        setGraph(action.old_tree)
    }
    action.old_tree = getGraph()

    if (action.message) {
        props.onMessage?.(action.message)
    }


    if (actionType === "mark_nodes") {
        clearAllClasses(cy)
        assignClassesToElements(action.nodes, action.reason, cy)
        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "refresh_state") {
        setGraph(toCytoscapeElements(action.tree))
        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "final_tree") {
        clearAllClasses(cy)
        if (action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "set") {
        setGraph(toCytoscapeElements(action.tree))
    }


    action.handled = true
}