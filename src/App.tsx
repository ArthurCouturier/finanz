import { RouterProvider } from 'react-router-dom'
import router from './routes'
import './App.css'
import { ModeToggle } from './components/mode-toggle'

function App() {
  return (
    <div>
      <div className="fixed top-2 right-2">
        <ModeToggle />
      </div>
      <RouterProvider router={router} />
    </div>
  )
}

export default App
