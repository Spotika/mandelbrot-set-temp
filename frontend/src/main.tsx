import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'

import styles from "./index.module.scss"
import axios from 'axios';
import { MandelbrotPage } from './pages/Mandelbrot';


axios.defaults.baseURL = process.env.NODE_ENV === "local" ? "http://localhost:8080" : "https://spotika4.difhel.dev";

const App = () => {
  const [page, setPage] = useState<"curve" | "mandelbrot" | "hello">("hello");

  useEffect(() => {
  });

  return <>
    {page === "mandelbrot" && <MandelbrotPage />}
    {page === "hello" && <div className={styles.container}>
        <div className={styles.controls}>
          <button onClick={() => setPage("curve")}>
            Curve
          </button>
          <button onClick={() => setPage("mandelbrot")}>
            Mandelbrot
          </button>
        </div>
    </div>}
  </>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* <App /> */}
    {/* <HelloPage /> */}
    <MandelbrotPage />
  </StrictMode>
)
