import { useEffect, useState } from "react"
import styles from "./controlPanel.module.css"



export default function ControlPanel({pause, resume, isPaused, stepBack, stepForward, getInterface, ...props }) {

    let [paused, setPaused] = useState(false)

    /* eslint-disable  */
    useEffect(() => {
        getInterface?.({
            setPaused: setPaused
        })}, [])
    /* eslint-enable  */


    return <div className={styles.control_panel} {...props}>
        <button className={styles.back_button} type="button" onClick={
            () => {
                stepBack()
                setPaused(true)
            }} />
        <div
            className={[styles.pause_resume_button, paused ? styles.resume_button : styles.pause_button].join(' ')}
            onClick={() => {
                if (isPaused()) {
                    resume()
                    setPaused(false)
                } else {
                    pause()
                    setPaused(true)
                }
            }} />
        <button className={styles.forward_button} type="button" onClick={
            () => {
                stepForward()
                setPaused(true)
            }
        } />
    </div>
}