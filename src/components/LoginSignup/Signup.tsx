import {useState} from "react";
import * as S from "./Login.styles"
import api from "../../api/api";
import {DefaultUser, Paths} from "../../types/enum";
import {useNavigate} from "react-router-dom";

const Signup = () => {
    const [username, setUsername] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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
            const response = await api.post("/users", userInfo);
            if (response.data.username && response.data.email) {
                navigate(Paths.LOGIN, {state: {username}});
            }
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
                setError("Kunde inte skapa kontot");
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
                    <S.Title>Skapa konto</S.Title>
                    <S.Subtitle>Tar mindre än en minut.</S.Subtitle>
                </S.Header>

                {error && <S.ErrorBox role="alert">{error}</S.ErrorBox>}
                <S.Main>
                    <S.FormField>
                    <S.Label>Användarnamn</S.Label>
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
                    <S.Label>E-post</S.Label>
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
                    <S.Label>Lösenord</S.Label>
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
                    <S.LoginButton type="submit">Skapa konto</S.LoginButton>
                    <S.Hint>
                        Har du redan ett konto?{" "}
                        <S.InlineButton type="button" onClick={() => navigate(Paths.LOGIN)}>
                            Logga in
                        </S.InlineButton>
                    </S.Hint>
                </S.Footer>
            </S.Form>
        </S.Container>
    )
}

export default Signup;