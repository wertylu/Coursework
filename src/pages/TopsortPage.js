import styles from "./TopsortPage.module.css"
import {useRef} from "react";
import TopoSortGraph from "../components/TopoSortGraph";
import ControlPanel from "../components/basics/controlPanel";
import Table from "../components/basics/Table"


export default function TopsortPage() {
    const graphInterface = useRef()
    const flowControlInterface = useRef()
    const messageLabel = useRef()
    const intervalBetweenAnimations = 0.7


    return <div className={styles.page}>
        <div>
            <div className={styles.message_area}>
                <b>Output array:</b>
                <div ref={messageLabel} style={{overflowX: "auto"}}>Waiting</div>
            </div>

            <div className={styles.view}>
                <TopoSortGraph
                    getInterfaceObject={(object) => graphInterface.current = object}
                    visualizationDuration={intervalBetweenAnimations}
                    onMessage={(message) => messageLabel.current.innerHTML = message}
                />
            </div>
        </div>
        <div className={styles.buttons}>
            <ControlPanel
                pause={() => graphInterface.current.pause()}
                resume={() => graphInterface.current.resume()}
                isPaused={() => graphInterface.current.isPaused()}
                stepBack={() => graphInterface.current.stepBack()}
                stepForward={() => graphInterface.current.stepForward()}
                getInterface={(interfaceObj) => flowControlInterface.current = interfaceObj}
            />

            <DataModificationPanel
                flowControlInterface={flowControlInterface}
                graphInterface={graphInterface}/>
        </div>
    </div>
}


function DataModificationPanel({flowControlInterface, graphInterface}) {
    const tableInterface = useRef()
    const startNodeInput = useRef()
    const errorMessage = useRef()


    return <div>
        <div className={styles.slicer}>
            <div className={styles.data_input}>
                <button className={styles.data_button}
                        onClick={() => graphInterface.current.setGraph(tableInterface.current.getData())}>
                    submit
                </button>
                <button className={styles.data_button} onClick={startTopsort}>
                    start
                </button>
                <button className={styles.data_button} onClick={() => {
                    flowControlInterface.current?.setPaused(false)
                    graphInterface.current.clear()
                }}>clear
                </button>
            </div>
            <div>
                <div className={styles.modal_container}>
                    <div className={styles.error_message} ref={errorMessage}/>
                    <input className={styles.number_input} type="number" ref={startNodeInput}/>

                </div>
            </div>
        </div>
        <center>Input your data:</center>

        <Table
            className={styles.input_table}
            getInterface={(interfaceObj) => tableInterface.current = interfaceObj}/>
    </div>


    function startTopsort() {
        let startNode = parseInt(startNodeInput.current.value)

        if (isNaN(startNode)) {
            errorMessage.current.innerHTML = "Invalid - Invalid format, should be a whole number"
            return
        }

        if (!graphInterface.current.getGraph()?.nodes.includes(startNode)) {
            errorMessage.current.innerHTML = "Invalid - specified node is not in the node list"
            return
        }

        errorMessage.current.innerHTML = ''

        graphInterface.current.topsort(startNode)
    }
}




