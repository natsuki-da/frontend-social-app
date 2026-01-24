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
    id: number;
    sender: number;
    receiver: number;
    status: FriendshipStatus;
    senderDisplayName?: string | null;
    receiverDisplayName?: string | null;
};

const initialsFromName = (name: string) => {
    const parts = (name || "").trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "?";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (first + last).toUpperCase();
};

const Wall = ({viewedUserId}: WallProps) => {
    const {token, userId, role} = useAuth();
    const navigate = useNavigate();

    const isAdmin = role === "ADMIN";
    const effectiveUserId = userId ? String(userId) : null;

    const isOwnWall =
        !viewedUserId || String(viewedUserId) === String(effectiveUserId);

    const targetUserId = viewedUserId ?? effectiveUserId;

    const [user, setUser] = useState<UserResponseDTO | null>(null);
    const [posts, setPosts] = useState<WallPost[]>([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);

    const [friendshipsAll, setFriendshipsAll] = useState<FriendshipRespondDTO[]>(
        []
    );
    const [friendsAccepted, setFriendsAccepted] = useState<
        FriendshipRespondDTO[]
    >([]);

    const [newPostText, setNewPostText] = useState("");

    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [commentsByPost, setCommentsByPost] = useState<
        Record<string, CommentResponseDTO[]>
    >({});

    useEffect(() => {
        setPage(0);
    }, [targetUserId]);

    const loadWall = useCallback(async () => {
        if (!token || !targetUserId) return;

        setLoading(true);

        try {
            const [profile, postsRes, friends, all] = await Promise.all([
                api.get(`/users/${targetUserId}`),
                isOwnWall
                    ? api.get("/posts/me", {params: {page, size: 10}})
                    : api.get("/posts/get", {
                        params: {userId: targetUserId, page, size: 10},
                    }),
                api.get(`/friendship/users/${targetUserId}/friends`),
                isOwnWall
                    ? api.get(`/friendship/users/${targetUserId}`)
                    : Promise.resolve({data: []}),
            ]);

            setUser(profile.data);
            setPosts(postsRes.data.content ?? []);
            setTotalPages(postsRes.data.totalPages ?? 1);
            setFriendsAccepted(friends.data ?? []);
            setFriendshipsAll(all.data ?? []);
            setProfileLoading(false);
        } finally {
            setLoading(false);
        }
    }, [token, targetUserId, page, isOwnWall]);

    useEffect(() => {
        loadWall();
    }, [loadWall]);

    const pendingIncoming = useMemo(
        () =>
            friendshipsAll.filter(
                (f) => f.status === "PENDING" && String(f.receiver) === effectiveUserId
            ),
        [friendshipsAll, effectiveUserId]
    );

    const acceptedForViewedWall = useMemo(() => {
        if (!targetUserId) return [];
        const target = String(targetUserId);

        return friendsAccepted.map((f) => {
            const senderIsTarget = String(f.sender) === target;
            const otherId = senderIsTarget ? f.receiver : f.sender;
            const otherName = senderIsTarget
                ? f.receiverDisplayName
                : f.senderDisplayName;

            return {...f, otherId, otherName};
        });
    }, [friendsAccepted, targetUserId]);

    const canModeratePost = (post: any) =>
        isAdmin || String(post.userId) === effectiveUserId;

    const acceptRequest = async (friendshipId: number) => {
        await api.put(`/friendship/${friendshipId}/accept`);
        await loadWall();
    };

    const rejectRequest = async (friendshipId: number) => {
        await api.put(`/friendship/${friendshipId}/reject`);
        await loadWall();
    };

    const toggleComments = async (postId: number) => {
        const key = String(postId);
        if (!openComments[key]) {
            const res = await api.get<PageResponse<CommentResponseDTO>>(
                `/comments/post/${postId}?page=0&size=10`
            );
            setCommentsByPost((p) => ({...p, [key]: res.data.content}));
        }
        setOpenComments((p) => ({...p, [key]: !p[key]}));
    };

    if (!token) return <p>Du måste vara inloggad.</p>;
    if (loading || profileLoading) return <p>Laddar...</p>;
    if (!user) return <p>Kunde inte ladda profilen.</p>;

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
                                                <li key={f.id} className="row-card friend-card">
                                                    <Link className="link" to={`/wall/${f.sender}`}>
                                                        {f.senderDisplayName ?? `User ${f.sender}`}
                                                    </Link>
                                                    <div className="row-actions">
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => acceptRequest(f.id)}
                                                        >
                                                            Acceptera
                                                        </button>
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => rejectRequest(f.id)}
                                                        >
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
                                                <li key={f.id} className="pill friend-pill">
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
                                                    <div
                                                        className="post-author-name"
                                                        style={{fontSize: "1.25rem"}}
                                                    >
                                                        {user.displayName}
                                                    </div>
                                                    <div className="post-author-hint">
                                                        @{user.username}
                                                        {user.email ? ` · ${user.email}` : ""}
                                                    </div>
                                                </div>
                                            </div>

                                            {!isOwnWall && (
                                                <span
                                                    className="pill"
                                                    title="Visar användarens vägg"
                                                >
                          Besöker
                        </span>
                                            )}
                                        </div>

                                        {user.bio ? (
                                            <div
                                                style={{
                                                    marginTop: 10,
                                                    color: "#334155",
                                                    whiteSpace: "pre-wrap",
                                                }}
                                            >
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
                                                    await api.post("/users/posts", {text});
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
                                                                <div className="post-author-name">
                                                                    {user.displayName}
                                                                </div>
                                                                <div className="post-author-hint">
                                                                    {new Date(post.created).toLocaleString()}
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
                                                            <button
                                                                className="btn btn-small"
                                                                onClick={() => toggleComments(post.id)}
                                                            >
                                                                {openComments[pid]
                                                                    ? "Dölj kommentarer"
                                                                    : "Visa kommentarer"}
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
                                                                <div key={c.id} className="comment">
                                  <span className="comment-author">
                                    {c.username}
                                  </span>
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
                                    <button
                                        className="btn"
                                        disabled={page === 0}
                                        onClick={() => setPage((p) => p - 1)}
                                    >
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
