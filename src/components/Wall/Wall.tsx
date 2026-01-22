import {useEffect, useState} from "react";
import {useAuth} from "../../context/useAuth";
import api from "../../api/api";
import {User, WallPost, WallProps} from "../../types/enum";

const Wall = ({viewedUserId}: WallProps) => {
    const {token, userId: loggedInUserId} = useAuth();

    const [posts, setPosts] = useState<WallPost[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    const isOwnWall = !viewedUserId || viewedUserId === loggedInUserId;
    const targetUserId = viewedUserId || loggedInUserId;


    const fetchPosts = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get("/posts");
            const data = response.data;

            const filteredPosts = data.content.filter(
                (post: any) => post.userId === targetUserId
            );

            const sortedPosts = filteredPosts.sort(
                (a: any, b: any) => new Date(b.created).getTime() - new Date(a.created).getTime()
            );

            setPosts(sortedPosts);

            if (sortedPosts.length > 0) {
                setUser({
                    id: sortedPosts[0].userId,
                    displayName: sortedPosts[0].displayName,
                    bio: "",
                });
            } else if (isOwnWall) {
                setUser({
                    id: Number(loggedInUserId),
                    displayName: "",
                    bio: "",
                });
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, [token, targetUserId]);

    const handleCreatePost = async () => {
        if (!newPostText.trim()) return;

        try {
            await api.post(`/users/posts`, {
                text: newPostText,
                created: new Date().toISOString(),
            });
            setNewPostText("");
            await fetchPosts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditPost = async (postId: number) => {
        if (!editingText.trim()) return;

        try {
            await api.put(`/posts/${postId}`,
                {
                    text: editingText,
                    created: new Date().toISOString()
                });
            setEditingPostId(null);
            setEditingText("");
            await fetchPosts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm("Vill du ta bort det här inlägget?")) return;

        try {
            await api.delete(`/posts/${postId}`);
            await fetchPosts();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading || !user) return <p>Laddar inlägg...</p>;

    return (
        <div className="feed-container">
            <h1 className="center">{user.displayName}</h1>

            <div className="about-me">
                <p><b>Om mig:</b> {user.bio}</p>
            </div>

            {isOwnWall && (
                <div className="create-post">
                    <textarea
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Skriv ett nytt inlägg..."
                    />
                    <button onClick={handleCreatePost}>Publicera</button>
                </div>
            )}

            {posts.length === 0 && <p>Inga inlägg hittades</p>}

            <ul className="post-list">
                {posts.map((post) => (
                    <li key={post.id} className="post-card">
                        {editingPostId === post.id ? (
                            <div>
                                <textarea
                                    value={editingText}
                                    onChange={(e) => setEditingText(e.target.value)}
                                />
                                <button onClick={() => handleEditPost(post.id)}>Spara</button>
                                <button onClick={() => setEditingPostId(null)}>Avbryt</button>
                            </div>
                        ) : (
                            <>
                                <p className="post-text">{post.text}</p>
                                <hr/>
                                <small className="post-date">
                                    {new Date(post.created).toLocaleString()} av {user.displayName}
                                </small>

                                {isOwnWall && (
                                    <div className="post-actions">
                                        <button
                                            onClick={() => {
                                                setEditingPostId(post.id);
                                                setEditingText(post.text);
                                            }}
                                        >
                                            Redigera
                                        </button>
                                        <button onClick={() => handleDeletePost(post.id)}>Ta bort</button>
                                    </div>
                                )}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Wall;