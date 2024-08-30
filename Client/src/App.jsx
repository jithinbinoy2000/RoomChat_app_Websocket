
import { Route, Routes } from 'react-router-dom'
import './App.css'
import DashBoard from './Pages/DashBoard'
import Login from './Pages/Login'

function App() {
 

  return (
    <>
    <Routes>
      <Route path='/' element={<Login/>}/>
      <Route path='/dashboard' element={<DashBoard/>}/>
    </Routes>
  
     {/*  */}
    </>
  )
}

export default App
