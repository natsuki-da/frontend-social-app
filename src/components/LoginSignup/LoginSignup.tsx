import * as S from "./LoginSignup.styles"
import Login from "./Login";
import Signup from "./Signup";
import {useState} from "react";

const LoginSignup = () => {
    const [mode] = useState<"login" | "signup">("login");
    return (
        <S.Container>
            <h1>{mode === "login" ? "login" : "signup"}</h1>

            {mode === "login" ? (
                <Login/>
            ) : (
                <Signup/>
            )}
        </S.Container>
    )
}

export default LoginSignup;