import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 7rem 0;
  background-color: rgb(232, 204, 205, 0.5);;
  opacity: 70%;
  position: sticky;
  top: 0;
`;

export const Header = styled.div`
  display: flex;
  height: 3rem;
  width: 95%;
  justify-content: space-between;
  a {
  text-decoration: none;
  }
  `;

  export const Title = styled.div`
  font-size: 2.5rem;
  line-height: 3rem;
  padding: 0 2rem;
`;

  export const Button = styled.button`
  border: none;
  cursor: pointer;
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
