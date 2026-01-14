import * as S from "./LoginSignup.styles"

const LoginSignup = () => {
    return (
        <S.Container>
            <S.Form>
                <h1>Login</h1>
                <S.Line />
                <S.FormField>
                    <S.Label>Username</S.Label>
                    <S.Input type="text" placeholder="username" />
                </S.FormField>
                <S.FormField>
                    <S.Label>E-mail</S.Label>
                    <S.Input type="mail" placeholder="e-mail" />
                </S.FormField>
                <S.FormField>
                    <S.Label>Password</S.Label>
                    <S.Input type="password" placeholder="password" />
                </S.FormField>
                <S.LoginButton>Login</S.LoginButton>
                <S.SignupButton>Signup</S.SignupButton>
            </S.Form>
        </S.Container>
    )
}

export default LoginSignup;