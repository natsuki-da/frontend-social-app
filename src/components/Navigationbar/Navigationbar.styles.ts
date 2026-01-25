import styled from "styled-components";

export const Container = styled.div`
  position: sticky;
  top: 0;
  z-index: 50;
  width: 100%;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(246, 247, 249, 0.75);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${({theme}) => theme.colors.border};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(1100px, 95%);
  height: 100%;
`;

  export const Title = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

  export const Button = styled.button`
  border: 1px solid ${({theme}) => theme.colors.border};
  border-radius: ${({theme}) => theme.radius.md};
  padding: 0.55rem 0.8rem;
  background: ${({theme}) => theme.colors.surface};
  &:hover { transform: translateY(-1px); }
`;

export const Image = styled.img`
  width: 2rem;
`;

export const HeaderLinks = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 1rem 30%;
`;

export const HeaderLink = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  cursor: pointer;
  margin: 0 1rem;
`;

export const Line = styled.div`
  width: 50%;
  margin: 0 25%;
  height: 1px;
`;

  export const Sidebar = styled.div`
    width: 4rem;
    overflow: hidden;
    transition: width 0.2s linear;
    &:hover {
      width: 10rem;
    }
  ul{
    padding-left: 1rem;
  }
  li {
    list-style: none;
  } 
  a {
    display: flex;
    flex-direction: row;
    align-items: center;  
  }
  span {
    font-size: 1rem;
  }
`;
