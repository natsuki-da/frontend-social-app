import { useState } from "react";
import * as S from "./Login.styles"
import axios from "axios";

const Signup = () => {

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    const [error, setError] = useState<string | null>(null);
    
    const handleSignup = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await axios.post(
                "http://localhost:8080/request-token", 
                {username, password},
                {headers: {"Content-Type": "application/json"}}
            );
            const token = response.data.token;
            localStorage.setItem("jwt", token);
            const role = response.data.role;
            localStorage.setItem("role", role);
        } catch (err: any){
            console.error(err);
            if (!err?.response){
                setError("No Server Response");
            } else if (err.response?.status === 400){
                setError("Missing Username or Password")
            } else if (err.response?.status === 401){
                setError("Unauthorized");
            } else {
                setError("Loging failed");
                console.log(error);
            }
        }
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
                </S.Footer>
            </S.Form>
        </S.Container>
    )
}

export default Signup;