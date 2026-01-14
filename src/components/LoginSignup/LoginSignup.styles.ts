import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgb(232, 204, 205, 0.5);
`;

// export const Main = styled.main`
//  overflow-y: hidden;
// `;

export const Form = styled.form`
  width: 30%;
  height: 50%;
  border-style: solid;
  border-color: rgb(0, 0, 0);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const Line = styled.hr`
  width: 100%;
  color: rgb(0, 0, 0);
`;

export const FormField = styled.div`
  width: 70%;
  background-color: rgb(255, 255, 255);
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
`;

export const Label = styled.label`
  margin-bottom: 0.5rem;
`;

export const Input = styled.input`
`;

export const LoginButton = styled.button`
`;

export const SignupButton = styled.button`
`;