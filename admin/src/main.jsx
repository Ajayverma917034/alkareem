import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ Override image error globally
const originalSrc = Object.getOwnPropertyDescriptor(
  HTMLImageElement.prototype,
  "src"
);

Object.defineProperty(HTMLImageElement.prototype, "src", {
  set(value) {
    this.onerror = () => {
      this.onerror = null;
      this.src = "/default.jpg";
    };
    originalSrc.set.call(this, value);
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);