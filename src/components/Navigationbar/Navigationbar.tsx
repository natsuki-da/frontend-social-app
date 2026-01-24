import * as S from "./Navigationbar.styles";
import {Paths} from "../../types/enum";
import {useAuth} from "../../context/useAuth";
import {Link, useNavigate} from "react-router-dom";

const Navigationbar = () => {
    const {logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login", {replace: true});
    };

    return (
        <S.Container>
            <S.Header>
                <Link to={Paths.FEED}>
                    <S.Title>Social Site</S.Title>
                </Link>

                <S.Button onClick={handleLogout}>
                    Logga ut
                </S.Button>
            </S.Header>
        </S.Container>
    );
};

export default Navigationbar;
