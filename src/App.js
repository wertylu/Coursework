import { Navigate, Route, Routes } from "react-router-dom"
import styles from './App.module.css'
import AVLPage from './pages/AVLPage';
import TopsortPage from './pages/TopsortPage';
import Header from './components/basics/Header';


export default function App() {
  return <div className={styles.app}>
    <Header />
    <div className={styles.app_content}>
      <Routes>
        <Route path="/" element={
          <Navigate to="/topological-sort" />
        } />
        <Route path="/topological-sort" element={
          <TopsortPage />
        } />
        <Route path="/avl-tree" element={
          <AVLPage />
        } />
      </Routes>
    </div>
  </div>
}
