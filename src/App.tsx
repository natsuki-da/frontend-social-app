import { HashRouter, Routes, Route } from "react-router-dom"
import { Suspense, lazy } from "react"
import { Paths } from "./types/enum"
const Signup = lazy(() => import("./components/LoginSignup/Signup"))
const Login = lazy(() => import("./components/LoginSignup/Login"))
const Feed = lazy(() => import("./components/Feed/Feed"))
const WallView = lazy(() => import("./components/Wall/WallView"))

function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path={Paths.HOME} element={<Signup onSwitchToLogin={function (): void {
            throw new Error("Function not implemented.")
          }} />} />
          <Route path={Paths.HOME} element={<Signup onSwitchToLogin={function (): void {
            throw new Error("Function not implemented.")
          }} />} />
          <Route path={Paths.LOGIN} element={<Login onSwitchToSignup={function (): void {
            throw new Error("Function not implemented.")
          }} />} />
          <Route path={Paths.FEED} element={<Feed />} />
          <Route path="/wall/:userId" element={<WallView />} />
          <Route path="/wall" element={<WallView />} />
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App;