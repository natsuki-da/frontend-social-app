import {useState} from "react";
import * as S from "./Login.styles";
import api from "../../api/api";
import {DefaultUser, Paths} from "../../types/enum";
import {useNavigate} from "react-router-dom";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [displayName, setDisplayName] = useState("");
    const [bio, setBio] = useState("");
    const [profileImagePath, setProfileImagePath] = useState("");

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSignup = async (e: { preventDefault: () => void }) => {
        e.preventDefault();
        setError(null);

        const userInfo: DefaultUser = {
            username: username.trim(),
            email: email.trim(),
            password,
            role: "USER",
            displayName: displayName.trim(),
            bio: bio.trim(),
            profileImagePath: profileImagePath.trim(),
        };

        try {
            const response = await api.post("/users", userInfo);
            if (response.data.username && response.data.email) {
                navigate(Paths.LOGIN, {state: {username}});
            }
        } catch (err: any) {
            if (!err?.response) setError("No Server Response");
            else if (err.response?.status === 400) setError("Felaktiga eller saknade fält");
            else if (err.response?.status === 401) setError("Unauthorized");
            else setError("Kunde inte skapa kontot");
        }
    };

    return (
        <S.Container>
            <S.Form onSubmit={handleSignup}>
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
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </S.FormField>

                    <S.FormField>
                        <S.Label>E-post</S.Label>
                        <S.Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </S.FormField>

                    <S.FormField>
                        <S.Label>Lösenord</S.Label>
                        <S.Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </S.FormField>

                    <S.FormField>
                        <S.Label>Visningsnamn</S.Label>
                        <S.Input
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </S.FormField>

                    <S.FormField>
                        <S.Label>Bio</S.Label>
                        <S.Input
                            type="text"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                        />
                    </S.FormField>

                    <S.FormField>
                        <S.Label>Profilbild (URL)</S.Label>
                        <S.Input
                            type="text"
                            value={profileImagePath}
                            onChange={(e) => setProfileImagePath(e.target.value)}
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
    );
};

export default Signup;
