import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-image: url("../../images/bg_white.JPG");
  background-repeat: no-repeat repeat;
  background-size: cover;
  padding-bottom: 5rem;
  .icon {
  padding: 0 0.25rem;
  height: 1rem;
  vertical-align: middle;
  }
`;

export const Top = styled.div`
 width: 100%;
 height: 100%;
 display: flex;
 flex-direction: column;
 align-items: center;
 padding-bottom: 5rem;
 @media screen and (900px > width){
  height: 100%;
  }
`;

export const TopContent = styled.div`
  width: 30%;
  height: 100%;
  padding: 2rem 5rem;
  font-size: 1rem;
  line-height: 2rem;
  .dashed_line {
    border-bottom: 1px dashed;
    width: 100%;
  }
  @media screen and (900px > width){
  width: 70%;
  padding: 2rem;
  }
`;