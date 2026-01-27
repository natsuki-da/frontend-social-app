import {HashRouter, Route, Routes} from "react-router-dom";
import {lazy, Suspense} from "react";
import {Paths} from "./types/enum";

const Signup = lazy(() => import("./components/LoginSignup/Signup"));
const Login = lazy(() => import("./components/LoginSignup/Login"));
const Feed = lazy(() => import("./components/Feed/Feed"));
const WallView = lazy(() => import("./components/Wall/WallView"));

function App() {
    return (
        <HashRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path={Paths.HOME} element={<Login/>}/>
                    <Route path={Paths.SIGNUP} element={<Signup/>}/>
                    <Route path={Paths.LOGIN} element={<Login/>}/>
                    <Route path={Paths.FEED} element={<Feed/>}/>

                    <Route path="/wall" element={<WallView/>}/>
                    <Route path="/wall/:userId" element={<WallView/>}/>
                </Routes>
            </Suspense>
        </HashRouter>
    );
}

export default App;
