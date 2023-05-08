import styles from "./AVLPage.module.css"
import {useRef} from "react";
import AVLTree from "../components/AVLTree";
import ControlPanel from "../components/basics/controlPanel";


export default function AVLPage() {
    const intervalBetweenAnimations = 0.7
    const treeInterface = useRef()
    const flowControlInterface = useRef()
    const messageLabel = useRef()

    return <div className={styles.page}>
        <div>
            <div>
                <b>Status: </b>
                <div ref={messageLabel}>Waiting</div>
            </div>
            <div className={styles.view}>
                <AVLTree
                    getInterface={(interfaceObj) => {
                        treeInterface.current = interfaceObj
                    }}
                    onMessage={(message) => messageLabel.current.innerHTML = message}
                    visualizationDuration={intervalBetweenAnimations}
                />
            </div>
        </div>
        <div className={styles.buttons}>
            <ControlPanel
                pause={() => treeInterface.current.pause()}
                resume={() => treeInterface.current.resume()}
                isPaused={() => treeInterface.current.isPaused()}
                stepBack={() => treeInterface.current.stepBack()}
                stepForward={() => treeInterface.current.stepForward()}
                getInterface={(interfaceObj) => flowControlInterface.current = interfaceObj}
            />

            <ActionPanel treeInterface={treeInterface}/>
            <button className={styles.clear_button} onClick={clearViewport}>
                clear
            </button>

        </div>

    </div>

    function clearViewport() {
        flowControlInterface.current?.setPaused(false)
        treeInterface.current.clear()
    }
}


function ActionPanel({treeInterface,}) {

    const newValueInput = useRef()
    const errorMessage = useRef()

    return <div className={styles.modification_panel} >
        <div className={styles.modification_buttons}>
            <div className={styles.modification_input}>
                <input className={styles.modification_input_field} ref={newValueInput}/>
            </div>
            <div className={styles.error_message} ref={errorMessage}/>
            <button className={styles.button} onClick={find}>
                find
            </button>

            <button className={styles.button} onClick={insert}>
                insert
            </button>

            <button className={styles.button} onClick={remove}>
                remove
            </button>
        </div>
    </div>


    function find() {
        let node = parseInt(newValueInput.current.value)
        if (isNaN(node)) {
            errorMessage.current.innerHTML ="Invalid, should be a whole number"
            return
        }
        errorMessage.current.innerHTML = ""

        treeInterface.current.find(node)
    }

    function insert() {
        let node = parseInt(newValueInput.current.value)
        if (isNaN(node)) {
            errorMessage.current.innerHTML = "Invalid, should be a whole number"
            return
        }
        errorMessage.current.innerHTML = ""

        treeInterface.current.insert(parseInt(node))
    }

    function remove() {
        let node = parseInt(newValueInput.current.value)
        if (isNaN(node)) {
            errorMessage.current.innerHTML = "Invalid, should be a whole number"
            return
        }
        errorMessage.current.innerHTML = ""

        treeInterface.current.remove(parseInt(node))
    }
}

