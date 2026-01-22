import {useEffect, useState} from "react";
import {useAuth} from "../../context/useAuth";
import Navigationbar from "../Navigationbar/Navigationbar";
import * as S from "./Feed.styles"
import {Link} from "react-router-dom";
import api from "../../api/api";
import {PostContent, PostResponse} from "../../types/enum";

const Feed = () => {
    const {token, userId} = useAuth();
    const [posts, setPosts] = useState<PostContent[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        console.log("Feed mounted");
        console.log("token:", token);
        console.log("userId:", userId);

        const getAllPosts = async () => {
            if (!token || !userId) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get<PostResponse>("/posts");
                const postData = response.data.content;
                setPosts(postData);

                // if (!res.ok) {
                //   throw new Error("Failed to fetch posts");
                // }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getAllPosts();
    }, [token, userId]);

    if (loading) {
        return <p>Laddar inlägg...</p>;
    }

    return (
        <S.Container>
            <Navigationbar/>

            <div className="feed-container">
                <Link to="/wall">Till min sida</Link>
                <h1>Inlägg</h1>

                {posts?.length === 0 && <p>Inga inlägg hittades</p>}

                <ul className="post-list">
                    {posts.map((post) => (
                        <li key={post.id} className="post-card">
                            <Link to={`/wall/${post.userId}`}>
                                {post.username}
                            </Link>
                            <p>{post.username}</p>
                            <p className="post-text">{post.text}</p>
                            <hr/>
                            <small className="post-date">
                                {new Date(post.created).toLocaleString()}
                            </small>

                            {String(post.userId) === String(userId) && (
                                <div className="post-actions">
                                    <button>Redigera</button>
                                    <button>Ta bort</button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

        </S.Container>
    )
}

export default Feed;
