import { useState } from "react";
import * as S from "./LoginSignup.styles"
import Login from "./Login";
import Signup from "./Signup";

const LoginSignup = () => {
    const [mode, setMode] = useState<"login" | "signup">("login");
    return (
        <S.Container>
            <h1>{mode === "login" ? "login" : "signup"}</h1>

            {mode === "login" ? (
                <Login onSwitchToSignup={() => setMode("signup")} />
            ) : (
                <Signup onSwitchToLogin={() => setMode("login")} />
            )}
        </S.Container >
    )
}

export default LoginSignup;