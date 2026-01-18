import { HashRouter, Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Paths } from "./types/enum"
const Signup = lazy(() => import("./components/LoginSignup/Signup"))
const Login = lazy(() => import("./components/LoginSignup/Login"))
const Dashboard = lazy(() => import("./components/Dashboard/Dashboard"))

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path={Paths.HOME} element={<Signup />} />
          <Route path={Paths.SIGNUP} element={<Signup />} />
          <Route path={Paths.LOGIN} element={<Login />} />
          <Route path={Paths.DASHBOARD} element={<Dashboard />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App;