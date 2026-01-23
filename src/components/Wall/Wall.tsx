import {useEffect, useState} from "react";
import {useAuth} from "../../context/useAuth";
import api from "../../api/api";
import {WallPost, WallProps} from "../../types/enum";

type UserResponseDTO = {
    id: number;
    username: string;
    email: string;
    role: string;
    displayName: string;
    bio: string;
    profileImagePath?: string | null;
};

const Wall = ({viewedUserId}: WallProps) => {
    const {token, userId: loggedInUserId} = useAuth();

    const [posts, setPosts] = useState<WallPost[]>([]);
    const [user, setUser] = useState<UserResponseDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);

    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const isOwnWall = !viewedUserId || String(viewedUserId) === String(loggedInUserId);
    const targetUserId = viewedUserId ?? loggedInUserId;

    useEffect(() => {
        setPage(0);
    }, [targetUserId]);

    const fetchProfile = async () => {
        if (!token || !targetUserId) return;

        setProfileLoading(true);
        try {
            const res = await api.get<UserResponseDTO>(`/users/${targetUserId}`);
            setUser(res.data);
        } catch (e) {
            console.error(e);
            setUser(null);
        } finally {
            setProfileLoading(false);
        }
    };

    const fetchPosts = async () => {
        if (!token) return;

        try {
            const response = isOwnWall
                ? await api.get("/posts/me", {params: {page, size: 10}})
                : await api.get("/posts/get", {
                    params: {userId: Number(targetUserId), page, size: 10},
                });

            const data = response.data;
            const content: WallPost[] = data.content || [];

            setPosts(content);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error(error);
            setPosts([]);
            setTotalPages(1);
        }
    };

    useEffect(() => {
        if (!token || !targetUserId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        Promise.all([fetchProfile(), fetchPosts()])
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token, targetUserId, page]);

    const handleCreatePost = async () => {
        if (!newPostText.trim()) return;

        try {
            await api.post("/users/posts", {
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
            await api.put(`/posts/${postId}`, {
                text: editingText,
                created: new Date().toISOString(),
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

    if (loading || profileLoading) return <p>Laddar inlägg...</p>;
    if (!user) return <p>Kunde inte ladda profilen.</p>;

    const profileImageUrl = user.profileImagePath?.trim() ? user.profileImagePath : null;

    return (
        <div className="feed-container">
            <div className="profile-header" style={{marginBottom: 16}}>
                <div style={{display: "flex", gap: 12, alignItems: "center"}}>
                    {profileImageUrl ? (
                        <img
                            src={profileImageUrl}
                            alt={user.displayName}
                            style={{width: 72, height: 72, borderRadius: "50%", objectFit: "cover"}}
                        />
                    ) : (
                        <div
                            style={{
                                width: 72,
                                height: 72,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 24,
                                fontWeight: 700,
                                background: "#eee",
                            }}
                        >
                            {user.displayName?.slice(0, 1)?.toUpperCase()}
                        </div>
                    )}

                    <div>
                        <h1 className="center" style={{margin: 0}}>
                            {user.displayName}
                        </h1>
                        <div style={{opacity: 0.8}}>@{user.username}</div>
                    </div>
                </div>

                <div className="about-me" style={{marginTop: 12}}>
                    <p style={{margin: 0}}>
                        <b>Om mig:</b> {user.bio}
                    </p>
                </div>
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
                                <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)}/>
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

            <div className="pagination">
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>
                    Föregående
                </button>
                <span>
          Sida {page + 1} av {totalPages}
        </span>
                <button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
                    Nästa
                </button>
            </div>
        </div>
    );
};

export default Wall;
