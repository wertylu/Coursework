import { useEffect, useRef } from "react";
import useStateRef from "react-usestateref"
import cytoscape from "cytoscape";
import EventHandler from "./rewinder/EventHandler";
import CytoscapeComponent from "react-cytoscapejs";
import fcose from "cytoscape-fcose"


cytoscape.use(fcose);


export default function GraphView({ getInterface, visualizationDuration, actionHandler, actionHandlerArgs, ...props }) {

    const thisInterface = useRef()
    const eventHandler = useRef()
    const animationStepDuration = useRef()

    const [graph, setGraph, graphRef] = useStateRef()
    const [cy, setCy, cyRef] = useStateRef()

    animationStepDuration.current = visualizationDuration

    /* eslint-disable */
    useEffect(() => {
        eventHandler.current = new EventHandler(handleAction)

        eventHandler.current.start()

        thisInterface.current = {
            addActions: eventHandler.current.addEvents.bind(eventHandler.current),
            pauseHandler: eventHandler.current.pause.bind(eventHandler.current),
            resumeHandler: eventHandler.current.resume.bind(eventHandler.current),
            stepBack: eventHandler.current.back.bind(eventHandler.current),
            stepForward: eventHandler.current.forward.bind(eventHandler.current),
            reset: eventHandler.current.dropBufferedEvents.bind(eventHandler.current),
            getCy: () => cyRef.current,
            getHandler: () => eventHandler.current,
            setGraph: setGraph,
            getGraph: () => graphRef.current
        }

        getInterface(thisInterface.current)
        return () => eventHandler.current.stop()
    }, [])
    /* eslint-enable */


    const graphStringified = JSON.stringify(graph)
    //перезбірка графу при зміні
    useEffect(() => {
        if (!props.layout) return;
        let layoutObject = cy?.elements().makeLayout(props.layout);
        layoutObject?.run()
    }, [graphStringified, cy, props.layout])

    //віконечко з графом
    return <CytoscapeComponent
        elements={graph}
        stylesheet={props.stylesheet}
        style={props.style}
        layout={props.layout}
        maxZoom={2}
        minZoom={0.25}
        cy={setCy}
    />;

    //прототип того що ми будемо запихати в івент хендлер
    function handleAction(action) {
        return actionHandler(
            {
                getVisualizationDuration: () => { return animationStepDuration.current },
                action: action,
                getCy: thisInterface.current.getCy,
                setGraph: thisInterface.current.setGraph,
                getGraph: thisInterface.current.getGraph,
                ...actionHandlerArgs
            })
    }
}