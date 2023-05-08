import styles from "./Header.module.css"
import {Link} from "react-router-dom";

export default function Header() {
    return <div className={styles.header}>
        <div className={styles.navigation}>
            <div>
                <Link to="/topological-sort" className={styles.pageswitch}>
                    Topological Sorting
                </Link >
            </div>
            <div>
                <Link to="/avl-tree" className={styles.pageswitch}>
                    AVL Tree
                </Link >
            </div>
        </div>
    </div>
}