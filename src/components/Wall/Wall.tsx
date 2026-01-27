import {useCallback, useEffect, useMemo, useState} from "react";
import {useAuth} from "../../context/useAuth";
import api from "../../api/api";
import {WallPost, WallProps} from "../../types/enum";
import {Link, useNavigate} from "react-router-dom";
import * as S from "./Wall.styles";
import Navigationbar from "../Navigationbar/Navigationbar";

type UserResponseDTO = {
    id: number;
    username: string;
    email: string;
    role: string;
    displayName: string;
    bio: string;
};

type PageResponse<T> = {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
};

type CommentResponseDTO = {
    id: number | string;
    username?: string;
    text?: string;
    created?: string;
    createdAt?: string;
};

type FriendshipStatus = "PENDING" | "ACCEPTED" | "DECLINED";

type FriendshipRespondDTO = {
    id: number | string;
    sender: number;
    receiver: number;
    status: FriendshipStatus;
    senderDisplayName?: string | null;
    receiverDisplayName?: string | null;
};

type FriendForWall = FriendshipRespondDTO & {
    otherId: number;
    otherName?: string | null;
};

const initialsFromName = (name: string) => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "?";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
};

const toLocalDateTimeString = (s?: string) => {
    if (!s) return "";
    const hasTZ = /[zZ]|[+-]\d{2}:\d{2}$/.test(s);
    const d = new Date(hasTZ ? s : s + "Z");
    return d.toLocaleString("sv-SE");
};

const Wall = ({viewedUserId}: WallProps) => {
    const {token, userId, role} = useAuth();
    const navigate = useNavigate();

    const isAdmin = role === "ADMIN";
    const effectiveUserId = userId != null ? String(userId) : "";

    const isOwnWall = !viewedUserId || String(viewedUserId) === effectiveUserId;
    const targetUserId = viewedUserId ?? (effectiveUserId ? effectiveUserId : null);

    const [user, setUser] = useState<UserResponseDTO | null>(null);
    const [posts, setPosts] = useState<WallPost[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);

    const [friendshipsAll, setFriendshipsAll] = useState<FriendshipRespondDTO[]>([]);
    const [friendsAccepted, setFriendsAccepted] = useState<FriendshipRespondDTO[]>([]);

    const [newPostText, setNewPostText] = useState("");

    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentResponseDTO[]>>({});

    useEffect(() => {
        setPage(0);
        setProfileLoading(true);
        setLoading(true);
        setUser(null);
        setPosts([]);
        setFriendsAccepted([]);
        setFriendshipsAll([]);
        setOpenComments({});
        setCommentsByPost({});
    }, [targetUserId]);

    const loadWall = useCallback(async () => {
        if (!token) return;

        if (!targetUserId) {
            setLoading(false);
            setProfileLoading(false);
            return;
        }

        setLoading(true);
        setProfileLoading(true);

        try {
            const shouldFetchMyFriendships =
                !isOwnWall && !!effectiveUserId && String(targetUserId) !== effectiveUserId;

            const requests: Promise<any>[] = [
                api.get(`/users/${targetUserId}`),
                isOwnWall
                    ? api.get("/posts/me", {params: {page, size: 10}})
                    : api.get("/posts/get", {params: {userId: targetUserId, page, size: 10}}),
                api.get(`/friendship/users/${targetUserId}/friends`),
                isOwnWall
                    ? api.get(`/friendship/users/${targetUserId}`)
                    : shouldFetchMyFriendships
                        ? api.get(`/friendship/users/${effectiveUserId}`)
                        : Promise.resolve({data: []}),
            ];

            const [profile, postsRes, friends, myOrAll] = await Promise.all(requests);

            setUser(profile.data ?? null);
            setPosts(postsRes.data?.content ?? []);
            setTotalPages(postsRes.data?.totalPages ?? 1);

            setFriendsAccepted((friends.data ?? []) as FriendshipRespondDTO[]);
            setFriendshipsAll((myOrAll.data ?? []) as FriendshipRespondDTO[]);
        } catch (err: any) {
            console.log("WALL ERROR", {
                url: err?.config?.url,
                baseURL: err?.config?.baseURL,
                method: err?.config?.method,
                params: err?.config?.params,
                status: err?.response?.status,
                data: err?.response?.data,
            });

            setUser(null);
            setPosts([]);
            setTotalPages(1);
            setFriendsAccepted([]);
            setFriendshipsAll([]);
        } finally {
            setProfileLoading(false);
            setLoading(false);
        }
    }, [token, targetUserId, page, isOwnWall, effectiveUserId]);

    useEffect(() => {
        loadWall();
    }, [loadWall]);

    const pendingIncoming = useMemo(() => {
        if (!effectiveUserId) return [];
        return friendshipsAll.filter(
            (f) => f.status === "PENDING" && String(f.receiver) === effectiveUserId
        );
    }, [friendshipsAll, effectiveUserId]);

    const acceptedForViewedWall = useMemo<FriendForWall[]>(() => {
        if (!targetUserId) return [];
        const target = String(targetUserId);

        return friendsAccepted.map((f) => {
            const senderIsTarget = String(f.sender) === target;
            return {
                ...f,
                otherId: senderIsTarget ? f.receiver : f.sender,
                otherName: senderIsTarget ? f.receiverDisplayName : f.senderDisplayName,
            };
        });
    }, [friendsAccepted, targetUserId]);

    const relationshipToViewedUser = useMemo(() => {
        if (isOwnWall) return null;
        if (!effectiveUserId) return null;
        if (!targetUserId) return null;

        const me = Number(effectiveUserId);
        const other = Number(targetUserId);

        return (
            friendshipsAll.find(
                (f) =>
                    (f.sender === me && f.receiver === other) ||
                    (f.sender === other && f.receiver === me)
            ) ?? null
        );
    }, [friendshipsAll, isOwnWall, effectiveUserId, targetUserId]);

    const canSendFriendRequest =
        !isOwnWall &&
        !!effectiveUserId &&
        !!targetUserId &&
        String(targetUserId) !== effectiveUserId &&
        !relationshipToViewedUser;

    const canModeratePost = (post: WallPost) =>
        isAdmin || String((post as any).userId) === effectiveUserId;

    const acceptRequest = async (friendshipId: number | string) => {
        await api.put(`/friendship/${friendshipId}/accept`);
        await loadWall();
    };

    const rejectRequest = async (friendshipId: number | string) => {
        await api.put(`/friendship/${friendshipId}/reject`);
        await loadWall();
    };

    const sendFriendRequest = async () => {
        if (!effectiveUserId || !targetUserId) return;

        await api.put(`/friendship/users/${effectiveUserId}/add-friend`, null, {
            params: {receiverId: Number(targetUserId)},
        });

        await loadWall();
    };

    const toggleComments = async (postId: number) => {
        const key = String(postId);
        if (!openComments[key]) {
            const res = await api.get<PageResponse<CommentResponseDTO>>(
                `/comments/post/${postId}?page=0&size=10`
            );
            setCommentsByPost((p) => ({...p, [key]: res.data.content ?? []}));
        }
        setOpenComments((p) => ({...p, [key]: !p[key]}));
    };

    if (!token) return <p>Du måste vara inloggad.</p>;
    if (!targetUserId) return <p>Kunde inte avgöra vilken användare som ska visas.</p>;
    if (loading || profileLoading) return <p>Laddar...</p>;
    if (!user) return <p>Kunde inte ladda profilen.</p>;

    const relationshipLabel = (() => {
        if (isOwnWall) return null;
        if (!relationshipToViewedUser) return null;
        if (relationshipToViewedUser.status === "ACCEPTED") return "Vänner";
        if (relationshipToViewedUser.status === "PENDING") {
            const incoming = String(relationshipToViewedUser.receiver) === effectiveUserId;
            return incoming ? "Förfrågan från användaren" : "Väntar på svar";
        }
        if (relationshipToViewedUser.status === "DECLINED") return "Avvisad";
        return null;
    })();

    const showAcceptRejectForViewed =
        !isOwnWall &&
        relationshipToViewedUser?.status === "PENDING" &&
        String(relationshipToViewedUser.receiver) === effectiveUserId;

    return (
        <S.Container>
            <Navigationbar/>
            <S.Top>
                <S.TopContent>
                    <div className="feed-container">
                        <div className="wall-layout">
                            <aside className="wall-sidebar">
                                {isOwnWall && pendingIncoming.length > 0 && (
                                    <div className="wall-box">
                                        <h3 className="section-title">Vänförfrågningar</h3>
                                        <ul className="list-clean">
                                            {pendingIncoming.map((f) => (
                                                <li key={String(f.id)} className="row-card friend-card">
                                                    <Link className="link" to={`/wall/${f.sender}`}>
                                                        {f.senderDisplayName ?? `User ${f.sender}`}
                                                    </Link>
                                                    <div className="row-actions">
                                                        <button className="btn btn-primary"
                                                                onClick={() => acceptRequest(f.id)}>
                                                            Acceptera
                                                        </button>
                                                        <button className="btn btn-secondary"
                                                                onClick={() => rejectRequest(f.id)}>
                                                            Avvisa
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {acceptedForViewedWall.length > 0 && (
                                    <div className="wall-box">
                                        <h3 className="section-title">Vänner</h3>
                                        <ul className="list-clean list-inline">
                                            {acceptedForViewedWall.map((f) => (
                                                <li key={String(f.id) + "-" + String(f.otherId)}
                                                    className="pill friend-pill">
                                                    <Link className="link" to={`/wall/${f.otherId}`}>
                                                        {f.otherName ?? `User ${f.otherId}`}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </aside>

                            <main className="wall-main">
                                <div className="stack">
                                    <div className="toolbar">
                                        <button className="btn" onClick={() => navigate("/feed")}>
                                            Tillbaka
                                        </button>
                                        <Link className="btn" to="/feed">
                                            Flödet
                                        </Link>
                                    </div>

                                    <div className="card card-subtle">
                                        <div className="post-header" style={{marginBottom: 0}}>
                                            <div className="post-header-left">
                                                <div className="avatar" aria-hidden>
                                                    {initialsFromName(user.displayName)}
                                                </div>
                                                <div className="post-author">
                                                    <div className="post-author-name" style={{fontSize: "1.25rem"}}>
                                                        {user.displayName}
                                                    </div>
                                                    <div className="post-author-hint">
                                                        @{user.username}
                                                        {user.email ? ` · ${user.email}` : ""}
                                                    </div>
                                                </div>
                                            </div>

                                            {!isOwnWall ? (
                                                <div style={{display: "flex", gap: 8, alignItems: "center"}}>
                                                    {relationshipLabel &&
                                                        <span className="pill">{relationshipLabel}</span>}

                                                    {showAcceptRejectForViewed && relationshipToViewedUser && (
                                                        <>
                                                            <button
                                                                className="btn btn-primary"
                                                                onClick={() => acceptRequest(relationshipToViewedUser.id)}
                                                            >
                                                                Acceptera
                                                            </button>
                                                            <button
                                                                className="btn btn-secondary"
                                                                onClick={() => rejectRequest(relationshipToViewedUser.id)}
                                                            >
                                                                Avvisa
                                                            </button>
                                                        </>
                                                    )}

                                                    {canSendFriendRequest && (
                                                        <button className="btn btn-primary" onClick={sendFriendRequest}>
                                                            Lägg till vän
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="pill" title="Visar din vägg">
                          Min vägg
                        </span>
                                            )}
                                        </div>

                                        {user.bio ? (
                                            <div style={{marginTop: 10, color: "#334155", whiteSpace: "pre-wrap"}}>
                                                {user.bio}
                                            </div>
                                        ) : (
                                            <div style={{marginTop: 10}} className="muted">
                                                Ingen bio ännu.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isOwnWall && (
                                    <div className="composer">
                    <textarea
                        className="composer-textarea"
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="Skriv ett inlägg…"
                    />
                                        <div className="composer-actions">
                                            <button
                                                className="btn btn-primary"
                                                onClick={async () => {
                                                    const text = newPostText.trim();
                                                    if (!text) return;
                                                    await api.post("/users/posts", {
                                                        text,
                                                    });


                                                    setNewPostText("");
                                                    await loadWall();
                                                }}
                                            >
                                                Publicera
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="section">
                                    <ul className="list-clean">
                                        {posts.map((post) => {
                                            const pid = String(post.id);
                                            return (
                                                <li key={post.id} className="post-card">
                                                    <div className="post-header">
                                                        <div className="post-header-left">
                                                            <div className="avatar" aria-hidden>
                                                                {initialsFromName(user.displayName)}
                                                            </div>
                                                            <div className="post-author">
                                                                <div
                                                                    className="post-author-name">{user.displayName}</div>
                                                                <div className="post-author-hint">
                                                                    {toLocalDateTimeString(post.created)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <p className="post-text">{post.text}</p>

                                                    <div className="post-footer">
                            <span className="post-meta">
                              {openComments[pid] ? "Kommentarer öppna" : ""}
                            </span>

                                                        <div className="post-actions">
                                                            <button className="btn btn-small"
                                                                    onClick={() => toggleComments(post.id)}>
                                                                {openComments[pid] ? "Dölj kommentarer" : "Visa kommentarer"}
                                                            </button>

                                                            {canModeratePost(post) && (
                                                                <button
                                                                    className="btn btn-small btn-danger"
                                                                    onClick={async () => {
                                                                        await api.delete(`/posts/${post.id}`);
                                                                        await loadWall();
                                                                    }}
                                                                >
                                                                    Ta bort
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {openComments[pid] && (
                                                        <div className="comments">
                                                            {commentsByPost[pid]?.map((c) => (
                                                                <div key={String(c.id)} className="comment">
                                                                    <span className="comment-author">{c.username}</span>
                                                                    <span className="comment-text">{c.text}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div className="pagination">
                                    <button className="btn" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                                        Föregående
                                    </button>
                                    <button
                                        className="btn"
                                        disabled={page + 1 >= totalPages}
                                        onClick={() => setPage((p) => p + 1)}
                                    >
                                        Nästa
                                    </button>
                                </div>
                            </main>
                        </div>
                    </div>
                </S.TopContent>
            </S.Top>
        </S.Container>
    );
};

export default Wall;
