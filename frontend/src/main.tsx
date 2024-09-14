import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// import styles from "./index.module.scss"
import axios from 'axios';
import { MandelbrotPage } from './pages/Mandelbrot';


axios.defaults.baseURL = process.env.NODE_ENV === "local" ? "http://localhost:8080" : "https://spotika4.difhel.dev";

createRoot(document.getElementById('root')!).render(
  <StrictMode >
    {/* <App /> */}
    {/* <HelloPage /> */}
    <h1></h1>
    <MandelbrotPage />
  </StrictMode>
)
