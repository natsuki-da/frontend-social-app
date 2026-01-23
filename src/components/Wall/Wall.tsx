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

type PageResponse<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
};

type CommentResponseDTO = {
    id: number | string;
    postId?: number | string;
    userId?: number | string;
    username?: string;
    text?: string;
    created?: string;
    createdAt?: string;
};

type FriendshipStatus = "PENDING" | "ACCEPTED" | "DECLINED";

type FriendshipRespondDTO = {
    id: number;
    sender: number;
    receiver: number;
    status: FriendshipStatus;
};

const Wall = ({viewedUserId}: WallProps) => {
    const {token, userId: loggedInUserId} = useAuth();
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

    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentResponseDTO[]>>({});
    const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
    const [commentsError, setCommentsError] = useState<Record<string, string | null>>({});
    const [commentPageByPost, setCommentPageByPost] = useState<Record<string, number>>({});
    const [commentTotalPagesByPost, setCommentTotalPagesByPost] = useState<Record<string, number>>({});
    const [commentTotalElementsByPost, setCommentTotalElementsByPost] = useState<Record<string, number>>({});
    const [newCommentByPost, setNewCommentByPost] = useState<Record<string, string>>({});
    const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

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
                const allRes = await api.get<FriendshipRespondDTO[]>(`/friendship/users/${targetUserId}`);
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

    const fetchCommentsForPost = async (postId: string, pageToLoad: number) => {
        setCommentsLoading((prev) => ({...prev, [postId]: true}));
        setCommentsError((prev) => ({...prev, [postId]: null}));

        try {
            const res = await api.get<PageResponse<CommentResponseDTO>>(
                `/comments/post/${postId}?page=${pageToLoad}&size=10`
            );

            const incoming = res.data.content ?? [];

            setCommentsByPost((prev) => {
                const existing = prev[postId] ?? [];
                const merged = pageToLoad === 0 ? incoming : [...existing, ...incoming];
                return {...prev, [postId]: merged};
            });

            setCommentPageByPost((prev) => ({...prev, [postId]: res.data.number}));
            setCommentTotalPagesByPost((prev) => ({...prev, [postId]: res.data.totalPages ?? 1}));
            setCommentTotalElementsByPost((prev) => ({...prev, [postId]: res.data.totalElements ?? 0}));
        } catch (e: any) {
            console.error(e);
            setCommentsError((prev) => ({
                ...prev,
                [postId]: e?.message ?? "Kunde inte hämta kommentarer",
            }));
        } finally {
            setCommentsLoading((prev) => ({...prev, [postId]: false}));
        }
    };

    const toggleComments = async (postIdRaw: number | string) => {
        const postId = String(postIdRaw);
        const isOpen = !!openComments[postId];

        if (!isOpen) {
            const alreadyLoaded = !!commentsByPost[postId];
            if (!alreadyLoaded) {
                await fetchCommentsForPost(postId, 0);
            }
        }

        setOpenComments((prev) => ({...prev, [postId]: !isOpen}));
    };

    const loadMoreComments = async (postIdRaw: number | string) => {
        const postId = String(postIdRaw);
        const currentPage = commentPageByPost[postId] ?? 0;
        const total = commentTotalPagesByPost[postId] ?? 1;
        const nextPage = currentPage + 1;

        if (nextPage >= total) return;
        await fetchCommentsForPost(postId, nextPage);
    };

    const submitComment = async (postIdRaw: number | string) => {
        const postId = String(postIdRaw);
        const text = (newCommentByPost[postId] ?? "").trim();
        if (!text) return;

        setCommentSubmitting((prev) => ({...prev, [postId]: true}));
        setCommentsError((prev) => ({...prev, [postId]: null}));

        try {
            const res = await api.post<CommentResponseDTO>(`/comments?postId=${postId}`, {text});
            setNewCommentByPost((prev) => ({...prev, [postId]: ""}));

            setCommentsByPost((prev) => {
                const existing = prev[postId] ?? [];
                return {...prev, [postId]: [res.data, ...existing]};
            });

            setCommentTotalElementsByPost((prev) => ({
                ...prev,
                [postId]: (prev[postId] ?? 0) + 1,
            }));
        } catch (e: any) {
            console.error(e);
            setCommentsError((prev) => ({
                ...prev,
                [postId]: e?.message ?? "Kunde inte skapa kommentar",
            }));
        } finally {
            setCommentSubmitting((prev) => ({...prev, [postId]: false}));
        }
    };

    const getCommentText = (c: CommentResponseDTO) => c.text ?? "";
    const getCommentUsername = (c: CommentResponseDTO) => c.username ?? "Okänd";
    const getCommentCreated = (c: CommentResponseDTO) => c.created ?? c.createdAt ?? "";

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
                            disabled={
                                relationshipWithViewedUser === "PENDING" || relationshipWithViewedUser === "ACCEPTED"
                            }
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
                            return (
                                <li key={f.id}>
                                    <Link to={`/wall/${otherId}`}>User {otherId}</Link>
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
                                        return (
                                            <li key={f.id} style={{marginBottom: 8}}>
                                                <Link to={`/wall/${otherId}`}>User {otherId}</Link>{" "}
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
                                        return (
                                            <li key={f.id}>
                                                <Link to={`/wall/${otherId}`}>User {otherId}</Link> (väntar)
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
                                        return (
                                            <li key={f.id}>
                                                <Link to={`/wall/${otherId}`}>User {otherId}</Link>
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
                    const postId = String(post.id);
                    const isOpen = !!openComments[postId];
                    const comments = commentsByPost[postId] ?? [];
                    const isCommentsLoading = !!commentsLoading[postId];
                    const err = commentsError[postId];

                    const totalElements = commentTotalElementsByPost[postId];
                    const countLabel =
                        typeof totalElements === "number"
                            ? totalElements
                            : commentsByPost[postId]
                                ? comments.length
                                : undefined;

                    const totalCommentPages = commentTotalPagesByPost[postId] ?? 1;
                    const currentCommentPage = commentPageByPost[postId] ?? 0;
                    const canLoadMore = currentCommentPage + 1 < totalCommentPages;

                    const draft = newCommentByPost[postId] ?? "";
                    const isSubmitting = !!commentSubmitting[postId];

                    return (
                        <li key={post.id}>
                            {editingPostId === post.id ? (
                                <>
                                    <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)}/>
                                    <button onClick={() => handleEditPost(post.id)}>Spara</button>
                                    <button onClick={() => setEditingPostId(null)}>Avbryt</button>
                                </>
                            ) : (
                                <>
                                    <p>{post.text}</p>
                                    <small>
                                        {new Date(post.created).toLocaleString()} av {user.displayName}
                                    </small>

                                    <div style={{marginTop: 8}}>
                                        <button onClick={() => toggleComments(post.id)}>
                                            {isOpen
                                                ? "Dölj kommentarer"
                                                : countLabel === undefined
                                                    ? "Visa kommentarer"
                                                    : countLabel === 0
                                                        ? "Inga kommentarer"
                                                        : `Visa kommentarer (${countLabel})`}
                                        </button>

                                        {isOpen && (
                                            <div style={{marginTop: 8}}>
                                                <div style={{display: "flex", gap: 8, marginBottom: 8}}>
                                                    <input
                                                        value={draft}
                                                        onChange={(e) =>
                                                            setNewCommentByPost((prev) => ({
                                                                ...prev,
                                                                [postId]: e.target.value,
                                                            }))
                                                        }
                                                        placeholder="Skriv en kommentar..."
                                                        style={{flex: 1}}
                                                    />
                                                    <button
                                                        onClick={() => submitComment(post.id)}
                                                        disabled={isSubmitting || !draft.trim()}
                                                    >
                                                        {isSubmitting ? "Skickar..." : "Skicka"}
                                                    </button>
                                                </div>

                                                {isCommentsLoading && comments.length === 0 &&
                                                    <p>Laddar kommentarer...</p>}
                                                {err && <p style={{color: "crimson"}}>{err}</p>}

                                                {comments.length === 0 && !isCommentsLoading && !err && (
                                                    <p>Inga kommentarer ännu.</p>
                                                )}

                                                {comments.length > 0 && (
                                                    <ul style={{paddingLeft: 16}}>
                                                        {comments.map((c) => {
                                                            const created = getCommentCreated(c);
                                                            return (
                                                                <li key={c.id} style={{marginBottom: 8}}>
                                                                    <strong>{getCommentUsername(c)}</strong>:{" "}
                                                                    {getCommentText(c)}
                                                                    {created ? (
                                                                        <>
                                                                            <br/>
                                                                            <small>{new Date(created).toLocaleString()}</small>
                                                                        </>
                                                                    ) : null}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                )}

                                                {canLoadMore && (
                                                    <button
                                                        onClick={() => loadMoreComments(post.id)}
                                                        disabled={isCommentsLoading}
                                                    >
                                                        {isCommentsLoading ? "Laddar..." : "Visa fler"}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {isOwnWall && (
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
