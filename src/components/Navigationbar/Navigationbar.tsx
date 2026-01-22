import {useState} from "react";
import * as S from "./Navigationbar.styles"
import {Paths} from "../../types/enum";
import {useAuth} from "../../context/useAuth";
import {useNavigate} from "react-router-dom";

const Navigationbar = () => {
    const {logout} = useAuth();
    const [isClickedMenu] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", {replace: true});
    };
    return (
        <>
            {!isClickedMenu && (
                <S.Container>
                    <S.Header>
                        <a href={Paths.HOME}><S.Title>Social Site</S.Title></a>
                        <S.Button onClick={handleLogout}>
                            {/* <S.Image src="../../icons/hamburger.svg" alt="menu icon" /> */}
                            <button
                                onClick={handleLogout}
                            >
                                Logga ut
                            </button>
                        </S.Button>
                    </S.Header>
                </S.Container>
            )}
            {/* {isClickedMenu && (
                <Menu isClickedMenu={isClickedMenu} setClickedMenu={setClickedMenu} />
            )} */}
        </>
    )
}

export default Navigationbar;