import { useState } from "react";
import * as S from "./Login.styles"
// import axios from "axios";
import api from "../../api/api"
import { useNavigate } from "react-router-dom";
import { Paths } from "../../types/enum";

const Login = () => {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: { preventDefault: () => void }) => {
      e.preventDefault();
      setError(null);
      try{
        const response = await api.post("/request-token", {username, password});
        const token : string = response.data.token;
        localStorage.setItem("jwt", token);
        const userMe = await api.get("/users/me");
        console.log("Logged in user: ", userMe.data);
        navigate(Paths.DASHBOARD, {replace: true});
      } catch (err){
        console.error("Logging failed!", err);
      }
    }
    // const handleLogin = async (e: { preventDefault: () => void }) => {
    //   e.preventDefault();
    //   setError(null);
    //   try{
    //     let token: string | null = localStorage.getItem("jwt");
    //     if (!token){
    //       const response = await api.post("/request-token", {username, password});
    //       var jwt : string = response.data.token;
    //       localStorage.setItem("jwt", jwt);
    //       token = jwt;
    //     }
    //     const userMe = await api.get("/users/me");
    //     console.log("Logged in user: ", userMe.data);
    //   } catch (err){
    //     console.error("Logging failed!", err);
    //   }
    //   navigate(Paths.DASHBOARD);
    // }
    return (
      <S.Container>
        <S.Form onSubmit={handleLogin}>
          <S.Header>
            <h1>Log in</h1>
            <S.Line />
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
          </S.Footer>
  
          {error && <p style={{ color: "red" }}>{error}</p>}
        </S.Form>
      </S.Container>
    );
  };
  
  export default Login;