import { useState } from "react";
import * as S from "./Login.styles"
import api from "../../api/api";
import { DefaultUser, LoginFormProps } from "../../types/enum";

const Signup = ({ onSwitchToLogin }: LoginFormProps) => {
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setError(null);

        const userInfo: DefaultUser = {
            username,
            email,
            password,
            role: "USER",
            displayName: "Nybörjare",
            bio: "Hej! Jag är ny här :)",
            profileImagePath: ""
        };

        try {
            await api.post("/users", userInfo);
            // const resToken = await api.post("/request-token", {username, password});
            // const token = response.data.token;
            // localStorage.setItem("jwt", token);
            // const role = response.data.role;
            // localStorage.setItem("role", role);
        } catch (err: any) {
            console.error(err);
            if (!err?.response) {
                setError("No Server Response");
            } else if (err.response?.status === 400) {
                setError("Missing Username or Password")
            } else if (err.response?.status === 401) {
                setError("Unauthorized");
            } else {
                setError("Loging failed");
                console.log(error);
            }
        }
        // const handleSignup = async (e: { preventDefault: () => void; }) => {
        //     e.preventDefault();
        //     setError(null);
        //     try {
        //         const response = await axios.post(
        //             "http://localhost:8080/request-token", 
        //             {username, password},
        //             {headers: {"Content-Type": "application/json"}}
        //         );
        //         const token = response.data.token;
        //         localStorage.setItem("jwt", token);
        //         const role = response.data.role;
        //         localStorage.setItem("role", role);
        //     } catch (err: any){
        //         console.error(err);
        //         if (!err?.response){
        //             setError("No Server Response");
        //         } else if (err.response?.status === 400){
        //             setError("Missing Username or Password")
        //         } else if (err.response?.status === 401){
        //             setError("Unauthorized");
        //         } else {
        //             setError("Loging failed");
        //             console.log(error);
        //         }
        //     }
    }

    return (
        <S.Container>
            <S.Form onSubmit={(handleSignup)}>
                <S.Header>
                    <h1>Sign up</h1>
                    <S.Line />
                </S.Header>
                <S.Main>
                    <S.FormField>
                        <S.Label>Username:</S.Label>
                        <S.Input
                            type="text"
                            id="username"
                            placeholder="username"
                            autoComplete="off"
                            onChange={(e) => setUsername(e.target.value)}
                            value={username}
                        />
                    </S.FormField>
                    <S.FormField>
                        <S.Label>E-mail:</S.Label>
                        <S.Input
                            type="email"
                            id="email"
                            placeholder="e-mail"
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                        />
                    </S.FormField>
                    <S.FormField>
                        <S.Label>Password:</S.Label>
                        <S.Input
                            type="password"
                            id="password"
                            placeholder="password"
                            autoComplete="off"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                        />
                    </S.FormField>
                </S.Main>
                <S.Footer>
                    <S.SignupButton>Sign up</S.SignupButton>
                    <p style={{ marginTop: "1rem", textAlign: "center" }}>
                        Har du redan ett konto?{" "}
                        <button type="button" onClick={onSwitchToLogin}>
                            Logga in här
                        </button>
                        <br />
                        Eller vill du byta till signup?{" "}
                        <button type="button" onClick={onSwitchToLogin}>
                            Sign up här
                        </button>
                    </p>
                </S.Footer>
            </S.Form>
        </S.Container>
    )
}

export default Signup;