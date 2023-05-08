import { useRef } from "react"
import cytoscape from "cytoscape"
import fcose from "cytoscape-fcose"
import GraphView from "./GraphView"
import { toCytoscapeElements, assignClassesToElements, clearAllClasses, delay } from "./helpers/HelperFunctions"
import {topologicalSort} from "./helpers/funcExecutions";


cytoscape.use(fcose)


export default function TopoSortGraph(props) {

    const graphViewInterface = useRef()
    const thisInterface = useRef()
    const data = useRef({ nodes: [], edges: [] })


    let style = props.style || {
        width: "100%",
        height: "100%"
    }

    let layout = {
        name: "fcose",
        animate: true
    }
    //розмальовка
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
                'line-color': "yellow",
                'target-arrow-color': 'black',
                'target-arrow-shape': 'chevron',
                'curve-style': 'bezier'
            }
        },
        {
            selector: '.selected_edge',
            style: {
                'line-color': "black",
            }
        },
        {
            selector: '.traversed',
            style: {
                'background-color': "yellow",
            }
        },
        {
            selector: '.path',
            style: {
                'border-color': "purple",
                'border-width': 3,
            }
        },
        {
            selector: '.selected',
            style: {
                'border-color': "black",
                'border-style': 'double',
                'background-color': "black",
                'color': "white",
                'border-width': 4,
            }
        },
        {
            selector: '.finished',
            style: {
                'background-color': "green",
                'border-width': 2,
            }
        },
        {
            selector: '.cycle',
            style: {
                'color': 'white',
                'background-color': "red",
            }
        }]


    return <GraphView
        stylesheet={stylesheet}
        style={style}
        layout={layout}
        getInterface={(interfaceObj) => {
            graphViewInterface.current = interfaceObj
            initializeInterfaceObject()
        }}
        visualizationDuration={props.visualizationDuration}
        actionHandler={actionHandler}
        actionHandlerArgs={{ onMessage: props.onMessage }} />


    function initializeInterfaceObject() {
        thisInterface.current = {
            pause: graphViewInterface.current.pauseHandler,
            resume: graphViewInterface.current.resumeHandler,
            stepBack: graphViewInterface.current.stepBack,
            stepForward: graphViewInterface.current.stepForward,
            isPaused: () => graphViewInterface.current.getHandler().paused,
            clear: () => {
                graphViewInterface.current.reset()
                data.current = { nodes: [], edges: [] }
                graphViewInterface.current.addActions([{ type: "set", graph: data.current }])
            },
            getGraph: () => data.current,
            setGraph: (edges) => {
                let nodes = []
                for (let edge of edges) {
                    for (let edgeNode of edge) {
                        if (!nodes.includes(edgeNode)) {
                            nodes.push(edgeNode)
                        }
                    }
                }

                data.current = { nodes, edges }

                graphViewInterface.current.addActions([{ type: "set", graph: data.current }])
            },

            topsort: (startNode) => { doTopologicalSort(data.current, startNode, graphViewInterface) }
        }

        graphViewInterface.current.addActions([{ type: "set", graph: { nodes: [], edges: [] } }])
        props.getInterfaceObject(thisInterface.current)

        return thisInterface.current
    }

    async function doTopologicalSort(graph, startNode, controlObj) {
        let data = await topologicalSort(startNode, graph.edges)
        // тут евейт бо івент хендлер ациклічний
        controlObj.current?.addActions(data)
    }
}


async function actionHandler({ getCy, setGraph, getVisualizationDuration, action, ...props }) {
    let actionType = action.type
    let visualizationDuration = getVisualizationDuration()
    let cy = getCy()


    if (actionType === "set") {
        clearAllClasses(cy)
        setGraph(toCytoscapeElements(action.graph, true))
    }

    if (actionType === "step") {
        clearAllClasses(cy)

        assignClassesToElements([action.selected], "selected", cy)
        assignClassesToElements([`${action.selected_edge[0]} ${action.selected_edge[1]}`], "selected_edge", cy)
        assignClassesToElements(action.traversed, "traversed", cy)

        if (action.path) {
            assignClassesToElements(action.path.filter((element) => element !== action.selected), "path", cy)
        }

        props.onMessage?.(JSON.stringify(action.traversed))

        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "final_array") {
        clearAllClasses(cy)
        for (let cyNode of cy.elements()) {
            cyNode.addClass("finished")
        }
        if (!action.handled && visualizationDuration)
            await delay(visualizationDuration * 1000)
    }

    if (actionType === "found_cycle") {
        clearAllClasses(cy)
        assignClassesToElements(action.traverse_stack, "cycle", cy)
        props.onMessage?.(`Graph is not acyclic. Cycle [${action.traverse_stack}] was found`)
    }


    action.handled = true
}
