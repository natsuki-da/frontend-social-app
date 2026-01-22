import {useEffect, useState} from "react";
import * as S from "./Login.styles"
import {useNavigate} from "react-router-dom";
import {Paths,} from "../../types/enum";
import {useAuth} from "../../context/useAuth";

const Login = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const {login, token} = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setError(null);

        try {
            await login(username, password)
        } catch (err) {
            console.error(err);
            setError("Login failed!");
        }
    };

    useEffect(() => {
        if (token) {
            navigate(Paths.FEED);
        }
    }, [token, navigate]);

    return (
        <S.Container>
            <S.Form onSubmit={handleLogin}>
                <S.Header>
                    <h1>Log in</h1>
                    <S.Line/>
                </S.Header>

                <S.Main>
                    <S.FormField>
                        <S.Label>Username:</S.Label>
                        <S.Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </S.FormField>

                    <S.FormField>
                        <S.Label>Password:</S.Label>
                        <S.Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </S.FormField>
                </S.Main>

                <S.Footer>
                    <S.LoginButton>Log in</S.LoginButton>
                    <p style={{marginTop: "1rem", textAlign: "center"}}>
                        Har du inget konto?{" "}
                        <button type="button" onClick={() => navigate(Paths.HOME)}>
                            Registrera dig här
                        </button>
                    </p>
                </S.Footer>

                {error && <p style={{color: "red"}}>{error}</p>}
            </S.Form>
        </S.Container>
    );
};

export default Login;