import { useEffect, useState } from "react";
import { useAuth } from "../../context/useAuth";
import api from "../../api/api";

const Wall = () => {
    const {token, userId} = useAuth();
    const [posts, setPosts] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState("");

    const getSpecificUserPosts = async () => {
        if (!token || !userId) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("/posts/${userId}")
                //`${API_BASE_URL}/users/${userId}/with-posts`,

            // if (!res.ok) {
            //     throw new Error("Failed to fetch posts");
            // }

            const data = await res.json();
            setPosts(data.posts);
            setUser(data.user);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getSpecificUserPosts();
    }, [token, userId]);

    const handleCreatePost = async () => {
        if (!newPostText.trim()) {
            return;
        }

        try {
            const res = await fetch(
                `${API_BASE_URL}/users/${userId}/posts`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        text: newPostText,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to create post");
            }

            setNewPostText("");
            await fetchPosts(); // hämta om listan efter lyckat POST
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || !user) {
        return <p>Laddar inlägg...</p>;
    }

    return (
        <div className="feed-container">
            <h1 className="center">{user.displayName}</h1>

            <div className="about-me">
                <p>
                    <b>Om mig:</b> {user.bio}
                </p>
            </div>

            {/* Skapa nytt inlägg */}
            <div className="create-post">
                <textarea
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Skriv ett nytt inlägg..."
                />
                <button onClick={handleCreatePost}>
                    Publicera
                </button>
            </div>

            {posts.length === 0 && <p>Inga inlägg hittades</p>}

            <ul className="post-list">
                {posts.map((post) => (
                    <li key={post.id} className="post-card">
                        <p className="post-text">{post.text}</p>
                        <hr/>
                        <small className="post-date">
                            {new Date(post.createdAt).toLocaleString()} av {user.displayName}
                        </small>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Wall;