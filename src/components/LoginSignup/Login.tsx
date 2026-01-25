import {useEffect, useState} from "react";
import * as S from "./Login.styles"
import {useLocation, useNavigate} from "react-router-dom";
import {Paths,} from "../../types/enum";
import {useAuth} from "../../context/useAuth";

const Login = () => {
    const location = useLocation();
    const prefilledUsername = (location.state as any)?.username as string | undefined;
    const [username, setUsername] = useState<string>(prefilledUsername ?? "");
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
                    <S.Title>Logga in</S.Title>
                    <S.Subtitle>Välkommen tillbaka — fortsätt där du slutade.</S.Subtitle>
                </S.Header>

                {error && <S.ErrorBox role="alert">{error}</S.ErrorBox>}

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
                    <S.LoginButton type="submit">Logga in</S.LoginButton>
                    <S.Hint>
                        Har du inget konto?{" "}
                        <S.InlineButton type="button" onClick={() => navigate(Paths.HOME)}>
                            Skapa ett här
                        </S.InlineButton>
                    </S.Hint>
                </S.Footer>
            </S.Form>
        </S.Container>
    );
};

export default Login;