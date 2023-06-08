import { useEffect, useRef } from "react"
import useStateRef from "react-usestateref"


export default function Table({ getInterface, ...props }) {
    let tableRef = useRef()
    let table = useRef([[1, 0],])
    let [update, setUpdate] = useStateRef(false)
    let focus = useRef({
        entry: null,
        item: null
    })

    /* eslint-disable*/
    useEffect(() => {
        getInterface?.({
            getData: () => table.current
        })
    }, [])
    /* eslint-enable*/


    return <table ref={tableRef} {...props}>
        <tbody>
        {table.current.map((item, index) =>
            <TableItem
                key={index}
                yIndex={index}
                data={{ source: item[0], target: item[1] }}
                focus={focus}
                modifyTableEntry={modifyTableEntry}
                addEntry={addEntry}
            />)}
        </tbody>
    </table>


    function modifyTableEntry(event, key, data) {
        if (!data) return

        focus.current.entry = null
        focus.current.item = null

        let source = parseInt(data.source.value);
        if (isNaN(source)) {
            source = null
        }

        let target = parseInt(data.target.value)
        if (isNaN(target)) {
            target = null
        }

        table.current[key] = [
            source,
            target
        ]

        setUpdate(!update)
    }

    function addEntry(event, key) {
        if (event.key === "Enter") {
            table.current.splice(key+1, 0, [null, null]);
            focus.current.entry = key + 1
            setUpdate(!update)
        }

    }
}


export function TableItem({ data, yIndex, modifyTableEntry, addEntry, focus}) {
    const sourceInput = useRef()
    const targetInput = useRef()
    const dataInputs = useRef()

    useEffect(() => {
        sourceInput.current.value = data.source
        targetInput.current.value = data.target
        if (focus.current.entry === yIndex) {
            if (focus.current.item === 0) {
                sourceInput.current.focus()
            } else {
                targetInput.current.focus()
            }
            focus.current.entry = null
        }
        dataInputs.current = {
            source: sourceInput.current,
            target: targetInput.current
        }
    })

    return <tr key={yIndex}>
        <th>
            <input ref={sourceInput} type="text"
                   onChange={event => modifyTableEntry(event, yIndex, dataInputs.current)}
                   onKeyDown={event => addEntry(event, yIndex, dataInputs.current)}
            />
        </th>
        <th >
            <input ref={targetInput} type="text"
                   onChange={event => modifyTableEntry(event, yIndex, dataInputs.current)}
                   onKeyDown={event => addEntry(event, yIndex, dataInputs.current)}
            />
        </th>
    </tr>
}