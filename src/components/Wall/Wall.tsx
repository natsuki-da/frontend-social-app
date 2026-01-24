import {useEffect, useMemo, useState} from "react";
import {useAuth} from "../../context/useAuth";
import api from "../../api/api";
import {WallPost, WallProps} from "../../types/enum";
import {Link, useNavigate} from "react-router-dom";

type UserResponseDTO = {
    id: number;
    username: string;
    email: string;
    role: string;
    displayName: string;
    bio: string;
    profileImagePath?: string | null;
};

type FriendshipStatus = "PENDING" | "ACCEPTED" | "DECLINED";

type FriendshipRespondDTO = {
    id: number;
    sender: number;
    receiver: number;
    status: FriendshipStatus;
    senderDisplayName?: string | null;
    receiverDisplayName?: string | null;
};

const Wall = ({viewedUserId}: WallProps) => {
    const {token, userId: loggedInUserId, role} = useAuth();
    const navigate = useNavigate();

    const [posts, setPosts] = useState<WallPost[]>([]);
    const [user, setUser] = useState<UserResponseDTO | null>(null);

    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);

    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [friendshipsAll, setFriendshipsAll] = useState<FriendshipRespondDTO[]>([]);
    const [friendsAccepted, setFriendsAccepted] = useState<FriendshipRespondDTO[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(false);
    const [friendsError, setFriendsError] = useState<string | null>(null);

    const isOwnWall = !viewedUserId || String(viewedUserId) === String(loggedInUserId);
    const targetUserId = viewedUserId ?? loggedInUserId;

    const isAdmin = role === "ADMIN";

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

            setPosts(response.data.content || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (e) {
            console.error(e);
            setPosts([]);
            setTotalPages(1);
        }
    };

    const fetchFriendships = async () => {
        if (!token || !targetUserId) return;

        setFriendsLoading(true);
        setFriendsError(null);

        let acceptedOk = false;

        try {
            const acceptedRes = await api.get<FriendshipRespondDTO[]>(
                `/friendship/users/${targetUserId}/friends`
            );
            setFriendsAccepted(acceptedRes.data || []);
            acceptedOk = true;
        } catch (e: any) {
            console.error(e);
            setFriendsAccepted([]);
            setFriendsError(e?.message ?? "Kunde inte ladda vänner");
        }

        if (isOwnWall) {
            try {
                const allRes = await api.get<FriendshipRespondDTO[]>(
                    `/friendship/users/${targetUserId}`
                );
                setFriendshipsAll(allRes.data || []);
            } catch (e: any) {
                console.error(e);
                setFriendshipsAll([]);
                if (acceptedOk) {
                    setFriendsError(null);
                } else {
                    setFriendsError((prev) => prev ?? (e?.message ?? "Kunde inte ladda vänskaper"));
                }
            }
        } else {
            setFriendshipsAll([]);
        }

        setFriendsLoading(false);
    };

    useEffect(() => {
        if (!token || !targetUserId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        Promise.all([fetchProfile(), fetchPosts(), fetchFriendships()])
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token, targetUserId, page, isOwnWall]);

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

    const getOtherUserIdFromFriendship = (f: FriendshipRespondDTO) => {
        const wallUserId = Number(targetUserId);
        return f.sender === wallUserId ? f.receiver : f.sender;
    };

    const getOtherUserDisplayNameFromFriendship = (f: FriendshipRespondDTO) => {
        const wallUserId = Number(targetUserId);
        const name = f.sender === wallUserId ? f.receiverDisplayName ?? null : f.senderDisplayName ?? null;
        return name && name.trim().length > 0 ? name : `User ${getOtherUserIdFromFriendship(f)}`;
    };

    const pendingIncoming = useMemo(() => {
        if (!isOwnWall || !loggedInUserId) return [];
        return friendshipsAll.filter(
            (f) => f.status === "PENDING" && String(f.receiver) === String(loggedInUserId)
        );
    }, [friendshipsAll, isOwnWall, loggedInUserId]);

    const pendingOutgoing = useMemo(() => {
        if (!isOwnWall || !loggedInUserId) return [];
        return friendshipsAll.filter(
            (f) => f.status === "PENDING" && String(f.sender) === String(loggedInUserId)
        );
    }, [friendshipsAll, isOwnWall, loggedInUserId]);

    const declined = useMemo(() => {
        if (!isOwnWall) return [];
        return friendshipsAll.filter((f) => f.status === "DECLINED");
    }, [friendshipsAll, isOwnWall]);

    const accepted = useMemo(() => friendsAccepted, [friendsAccepted]);

    const relationshipWithViewedUser = useMemo(() => {
        if (!loggedInUserId || !targetUserId) return null;
        if (isOwnWall) return null;

        const match = friendsAccepted.find((f) => {
            const a = String(f.sender) === String(loggedInUserId) && String(f.receiver) === String(targetUserId);
            const b = String(f.receiver) === String(loggedInUserId) && String(f.sender) === String(targetUserId);
            return a || b;
        });

        return match?.status ?? null;
    }, [loggedInUserId, targetUserId, isOwnWall, friendsAccepted]);

    const sendFriendRequest = async () => {
        if (!loggedInUserId || !targetUserId) return;
        if (isOwnWall) return;

        try {
            await api.put(`/friendship/users/${loggedInUserId}/add-friend`, null, {
                params: {receiverId: Number(targetUserId)},
            });
            await fetchFriendships();
        } catch (e) {
            console.error(e);
        }
    };

    const acceptRequest = async (friendshipId: number) => {
        try {
            await api.put(`/friendship/${friendshipId}/accept`);
            await fetchFriendships();
        } catch (e) {
            console.error(e);
        }
    };

    const rejectRequest = async (friendshipId: number) => {
        try {
            await api.put(`/friendship/${friendshipId}/reject`);
            await fetchFriendships();
        } catch (e) {
            console.error(e);
        }
    };

    const canEditOrDeletePost = (post: WallPost) => {
        if (!loggedInUserId) return false;
        const isOwner = String(post.userId) === String(loggedInUserId);
        return isOwner || isAdmin;
    };

    if (!token) return <p>Du måste vara inloggad.</p>;
    if (!targetUserId) return <p>Laddar profil...</p>;
    if (loading || profileLoading) return <p>Laddar inlägg...</p>;
    if (!user) return <p>Kunde inte ladda profilen.</p>;

    return (
        <div className="feed-container">
            <button onClick={() => navigate("/feed")}>Tillbaka till flödet</button>

            <div style={{marginBottom: 16}}>
                <h1>{user.displayName}</h1>
                <div>@{user.username}</div>
                <p>
                    <b>Om mig:</b> {user.bio}
                </p>

                {!isOwnWall && (
                    <div style={{marginTop: 8}}>
                        <button
                            onClick={sendFriendRequest}
                            disabled={relationshipWithViewedUser === "PENDING" || relationshipWithViewedUser === "ACCEPTED"}
                        >
                            {relationshipWithViewedUser === "ACCEPTED"
                                ? "Ni är vänner"
                                : relationshipWithViewedUser === "PENDING"
                                    ? "Förfrågan skickad"
                                    : "Lägg till vän"}
                        </button>
                    </div>
                )}
            </div>

            <div style={{marginBottom: 16}}>
                <h2>Vänner</h2>

                {friendsLoading && <p>Laddar vänner...</p>}
                {friendsError && <p>{friendsError}</p>}

                {!friendsLoading && accepted.length === 0 && <p>Inga vänner hittades</p>}

                {!friendsLoading && accepted.length > 0 && (
                    <ul style={{listStyle: "none", paddingLeft: 0}}>
                        {accepted.map((f) => {
                            const otherId = getOtherUserIdFromFriendship(f);
                            const otherName = getOtherUserDisplayNameFromFriendship(f);
                            return (
                                <li key={f.id}>
                                    <Link to={`/wall/${otherId}`}>{otherName}</Link>
                                </li>
                            );
                        })}
                    </ul>
                )}

                {isOwnWall && (
                    <>
                        <h3>Vänförfrågningar</h3>

                        {pendingIncoming.length === 0 && pendingOutgoing.length === 0 &&
                            <p>Inga väntande förfrågningar</p>}

                        {pendingIncoming.length > 0 && (
                            <div style={{marginBottom: 12}}>
                                <div style={{fontWeight: 700, marginBottom: 6}}>Inkommande</div>
                                <ul style={{listStyle: "none", paddingLeft: 0}}>
                                    {pendingIncoming.map((f) => {
                                        const otherId = getOtherUserIdFromFriendship(f);
                                        const otherName = getOtherUserDisplayNameFromFriendship(f);
                                        return (
                                            <li key={f.id} style={{marginBottom: 8}}>
                                                <Link to={`/wall/${otherId}`}>{otherName}</Link>{" "}
                                                <button onClick={() => acceptRequest(f.id)}>Acceptera</button>
                                                {" "}
                                                <button onClick={() => rejectRequest(f.id)}>Avvisa</button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {pendingOutgoing.length > 0 && (
                            <div style={{marginBottom: 12}}>
                                <div style={{fontWeight: 700, marginBottom: 6}}>Skickade</div>
                                <ul style={{listStyle: "none", paddingLeft: 0}}>
                                    {pendingOutgoing.map((f) => {
                                        const otherId = getOtherUserIdFromFriendship(f);
                                        const otherName = getOtherUserDisplayNameFromFriendship(f);
                                        return (
                                            <li key={f.id}>
                                                <Link to={`/wall/${otherId}`}>{otherName}</Link> (väntar)
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {declined.length > 0 && (
                            <div style={{marginBottom: 12}}>
                                <div style={{fontWeight: 700, marginBottom: 6}}>Avvisade</div>
                                <ul style={{listStyle: "none", paddingLeft: 0}}>
                                    {declined.map((f) => {
                                        const otherId = getOtherUserIdFromFriendship(f);
                                        const otherName = getOtherUserDisplayNameFromFriendship(f);
                                        return (
                                            <li key={f.id}>
                                                <Link to={`/wall/${otherId}`}>{otherName}</Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>

            {isOwnWall && (
                <div>
          <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder="Skriv ett nytt inlägg..."
          />
                    <button onClick={handleCreatePost}>Publicera</button>
                </div>
            )}

            {posts.length === 0 && <p>Inga inlägg hittades</p>}

            <ul style={{listStyle: "none", paddingLeft: 0}}>
                {posts.map((post) => {
                    const canModerate = canEditOrDeletePost(post);

                    return (
                        <li key={post.id}>
                            {editingPostId === post.id ? (
                                <>
                                    <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)}/>
                                    <button onClick={() => handleEditPost(post.id)}>Spara</button>
                                    <button
                                        onClick={() => {
                                            setEditingPostId(null);
                                            setEditingText("");
                                        }}
                                    >
                                        Avbryt
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p>{post.text}</p>
                                    <small>{new Date(post.created).toLocaleString()} av {post.username ?? user.displayName}</small>

                                    {canModerate && (
                                        <div>
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
                    );
                })}
            </ul>

            <div>
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
