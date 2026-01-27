import styled from "styled-components";

export const Container = styled.div`
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
`;

// export const Main = styled.main`
//  overflow-y: hidden;
// `;

export const Form = styled.form`
    width: 100%;
    max-width: 420px;
    background: ${({theme}) => theme.colors.surface};
    border: 1px solid ${({theme}) => theme.colors.border};
    border-radius: ${({theme}) => theme.radius.lg};
    box-shadow: ${({theme}) => theme.shadow.md};
    overflow: hidden;
`;

export const Header = styled.div`
    padding: 1.25rem 1.25rem 0.75rem 1.25rem;
    display: flex;
    flex-direction: column;
`;

export const Title = styled.h1`
    margin: 0;
    font-size: 1.35rem;
    letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
    margin: 0.35rem 0 0;
    color: ${({theme}) => theme.colors.mutedText};
    font-size: 0.95rem;
`;

export const Line = styled.hr`
    width: 100%;
`;

export const Main = styled.div`
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.9rem;
`;

export const FormField = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
`;

export const Label = styled.label`
    font-size: 0.9rem;
    color: ${({theme}) => theme.colors.mutedText};
`;

export const Input = styled.input`
    /* Base input styles come from GlobalStyle */
`;

export const Footer = styled.div`
    padding: 1rem 1.25rem 1.25rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
`;

export const ErrorBox = styled.div`
    margin: 0 1.25rem 1.1rem;
    padding: 0.75rem 0.85rem;
    border-radius: ${({theme}) => theme.radius.md};
    border: 1px solid rgba(185, 28, 28, 0.25);
    background: rgba(185, 28, 28, 0.06);
    color: ${({theme}) => theme.colors.danger};
    font-size: 0.9rem;
`;

export const Hint = styled.p`
    margin: 0;
    text-align: center;
    color: ${({theme}) => theme.colors.mutedText};
    font-size: 0.95rem;
`;
export const HelperText = styled.small`
    display: block;
    margin: 0.25rem 0 0.75rem;
    font-size: 0.8rem;
    opacity: 0.75;
`;

export const InlineButton = styled.button`
    appearance: none;
    border: none;
    background: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    color: #2563eb;
    font-weight: 600;

    &:hover {
        text-decoration: underline;
    }
`;

export const LoginButton = styled.button`
    width: 100%;
    border: none;
    background: ${({theme}) => theme.colors.primary};
    color: white;
    padding: 0.75rem 0.95rem;
    border-radius: ${({theme}) => theme.radius.md};

    &:hover {
        background: ${({theme}) => theme.colors.primaryHover};
    }
`;

export const SignupButton = styled.button`
    width: 100%;
`;