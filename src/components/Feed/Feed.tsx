import {useEffect, useMemo, useState} from "react";
import {useAuth} from "../../context/useAuth";
import Navigationbar from "../Navigationbar/Navigationbar";
import * as S from "./Feed.styles";
import {Link} from "react-router-dom";
import api from "../../api/api";
import {PostContent, PostResponse} from "../../types/enum";

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
type FriendshipRespondDTO = { id: number; sender: number; receiver: number; status: FriendshipStatus };

const normalizeRole = (raw: unknown): "ADMIN" | "USER" | null => {
    if (!raw) return null;
    if (Array.isArray(raw)) raw = raw[0];
    if (typeof raw === "object" && raw !== null) {
        const o = raw as any;
        raw = o.authority ?? o.role ?? o.name ?? o.value;
    }
    if (typeof raw !== "string") return null;
    const s = raw.trim().toUpperCase();
    if (s === "ADMIN" || s === "ROLE_ADMIN") return "ADMIN";
    if (s === "USER" || s === "ROLE_USER") return "USER";
    return null;
};

const normalizeUserId = (raw: unknown): string | null => {
    if (raw === undefined || raw === null) return null;
    const s = String(raw).trim();
    if (!s) return null;
    const n = Number(s);
    if (Number.isNaN(n)) return null;
    return String(n);
};

const getPostOwnerId = (post: any): string | null => {
    const id =
        post?.userId ??
        post?.authorId ??
        post?.ownerId ??
        post?.user?.id ??
        post?.author?.id ??
        post?.owner?.id ??
        post?.createdBy?.id;

    return id === undefined || id === null ? null : String(id);
};

const getPostOwnerName = (post: any): string => {
    return (
        post?.username ??
        post?.user?.username ??
        post?.author?.username ??
        post?.owner?.username ??
        post?.displayName ??
        post?.user?.displayName ??
        "Okänd"
    );
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

const Feed = () => {
    const {token, userId, role} = useAuth();

    const effectiveRole = useMemo(() => {
        const fromCtx = normalizeRole(role);
        if (fromCtx) return fromCtx;
        const fromLs = normalizeRole(localStorage.getItem("userRole"));
        if (fromLs) return fromLs;
        return null;
    }, [role]);

    const effectiveUserId = useMemo(() => {
        const fromCtx = normalizeUserId(userId);
        if (fromCtx) return fromCtx;
        const fromLs = normalizeUserId(localStorage.getItem("userId"));
        if (fromLs) return fromLs;
        return null;
    }, [userId]);

    const isAdmin = effectiveRole === "ADMIN";

    const [posts, setPosts] = useState<PostContent[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [pendingIncomingCount, setPendingIncomingCount] = useState(0);

    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentResponseDTO[]>>({});
    const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
    const [commentsError, setCommentsError] = useState<Record<string, string | null>>({});
    const [commentPageByPost, setCommentPageByPost] = useState<Record<string, number>>({});
    const [commentTotalPagesByPost, setCommentTotalPagesByPost] = useState<Record<string, number>>({});
    const [commentTotalElementsByPost, setCommentTotalElementsByPost] = useState<Record<string, number>>({});
    const [newCommentByPost, setNewCommentByPost] = useState<Record<string, string>>({});
    const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

    const getAllPosts = async (pageToLoad: number) => {
        if (!token || !effectiveUserId) {
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            const response = await api.get<PostResponse>(`/posts/get?page=${pageToLoad}&size=10`);
            setPosts(response.data.content ?? []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error(error);
            setPosts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingIncomingCount = async () => {
        if (!token || !effectiveUserId) return;

        try {
            const res = await api.get<FriendshipRespondDTO[]>(`/friendship/users/${effectiveUserId}`);
            const count = (res.data || []).filter(
                (f) => f.status === "PENDING" && String(f.receiver) === String(effectiveUserId)
            ).length;
            setPendingIncomingCount(count);
        } catch (e) {
            console.error(e);
            setPendingIncomingCount(0);
        }
    };

    useEffect(() => {
        getAllPosts(page);
    }, [token, effectiveUserId, page]);

    useEffect(() => {
        fetchPendingIncomingCount();
    }, [token, effectiveUserId]);

    const canEditOrDeletePost = (post: any) => {
        const ownerId = getPostOwnerId(post);
        const isOwner = ownerId !== null && effectiveUserId !== null && String(ownerId) === String(effectiveUserId);
        return isOwner || isAdmin;
    };

    const handleEditPost = async (postId: number) => {
        if (!editingText.trim()) return;

        try {
            await api.put(`/posts/${postId}`, {
                text: editingText,
            });
            setEditingPostId(null);
            setEditingText("");
            await getAllPosts(page);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm("Vill du ta bort det här inlägget?")) return;

        try {
            await api.delete(`/posts/${postId}`);
            await getAllPosts(page);
        } catch (error) {
            console.error(error);
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

    if (loading) return <p>Laddar inlägg...</p>;

    return (
        <S.Container>
            <Navigationbar/>

            <S.Top>
                <S.TopContent>
                    <div className="feed-container">
                        <div className="toolbar">
                            <Link className="btn" to="/wall">
                                Min sida{pendingIncomingCount > 0 ? ` (${pendingIncomingCount})` : ""}
                            </Link>
                        </div>

                        <h1 className="page-title">Inlägg</h1>
                        <p className="page-subtitle">Senaste inläggen – öppna en profil för att skriva själv.</p>

                        {posts.length === 0 && <p>Inga inlägg hittades</p>}

                        <div className="post-list" role="list">
                            {posts.map((post) => {
                                const postId = String(post.id);

                                const canModerate = canEditOrDeletePost(post);
                                const ownerId = getPostOwnerId(post);
                                const ownerName = getPostOwnerName(post);

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
                                    <article key={post.id} className="post-card" role="listitem">
                                        <div className="post-header">
                                            <div className="post-header-left">
                                                <div className="avatar" aria-hidden>
                                                    {initialsFromName(ownerName)}
                                                </div>
                                                <div className="post-author">
                                                    <Link className="post-author-name"
                                                          to={ownerId ? `/wall/${ownerId}` : "/wall"}>
                                                        {ownerName}
                                                    </Link>
                                                    <span
                                                        className="post-author-hint">{ownerId ? `Profil · #${ownerId}` : "Profil"}</span>
                                                </div>
                                            </div>

                                            <span className="post-meta">{toLocalDateTimeString(post.created)}</span>
                                        </div>

                                        {editingPostId === post.id ? (
                                            <>
                                        <textarea value={editingText}
                                                  onChange={(e) => setEditingText(e.target.value)}
                                                  placeholder="Redigera inlägg…"/>
                                                <div className="post-actions">
                                                    <button className="btn btn-small btn-primary"
                                                            onClick={() => handleEditPost(post.id)}>Spara
                                                    </button>
                                                    <button
                                                        className="btn btn-small"
                                                        onClick={() => {
                                                            setEditingPostId(null);
                                                            setEditingText("");
                                                        }}
                                                    >
                                                        Avbryt
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="post-text">{post.text}</p>
                                                <div className="divider"/>

                                                <div style={{marginTop: 8}}>
                                                    <button className="btn btn-small"
                                                            onClick={() => toggleComments(post.id)}>
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
                                                            <div className="comment-composer">
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
                                                                <button className="btn btn-primary"
                                                                        onClick={() => submitComment(post.id)}
                                                                        disabled={isSubmitting || !draft.trim()}>
                                                                    {isSubmitting ? "Skickar..." : "Skicka"}
                                                                </button>
                                                            </div>

                                                            {isCommentsLoading && comments.length === 0 &&
                                                                <p>Laddar kommentarer...</p>}
                                                            {err &&
                                                                <p style={{color: "crimson", marginTop: 0}}>{err}</p>}

                                                            {comments.length === 0 && !isCommentsLoading && !err &&
                                                                <p>Inga kommentarer ännu.</p>}

                                                            {comments.length > 0 && (
                                                                <ul className="list-clean" style={{paddingLeft: 0}}>
                                                                    {comments.map((c) => {
                                                                        const created = getCommentCreated(c);
                                                                        return (
                                                                            <li key={c.id} className="comment"
                                                                                style={{marginBottom: 8}}>
                                                                                <span
                                                                                    className="comment-author">{getCommentUsername(c)}</span>
                                                                                <span
                                                                                    className="comment-text">{getCommentText(c)}</span>
                                                                                {created ? (
                                                                                    <span className="post-meta"
                                                                                          style={{marginLeft: "auto"}}>
                                                                              {toLocalDateTimeString(created)}
                                                                            </span>
                                                                                ) : null}
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            )}

                                                            {canLoadMore && (
                                                                <button className="btn"
                                                                        onClick={() => loadMoreComments(post.id)}
                                                                        disabled={isCommentsLoading}>
                                                                    {isCommentsLoading ? "Laddar..." : "Visa fler"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {canModerate && (
                                                    <div className="post-actions">
                                                        <button
                                                            className="btn btn-small"
                                                            onClick={() => {
                                                                setEditingPostId(post.id);
                                                                setEditingText(post.text);
                                                            }}
                                                        >
                                                            Redigera
                                                        </button>
                                                        <button className="btn btn-small btn-danger"
                                                                onClick={() => handleDeletePost(post.id)}>Ta bort
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </article>
                                );
                            })}
                        </div>

                        <div className="pagination">
                            <button className="btn" disabled={page === 0} onClick={() => setPage(page - 1)}>
                                Föregående
                            </button>
                            <span>
            Sida {page + 1} av {totalPages}
          </span>
                            <button className="btn" disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>
                                Nästa
                            </button>
                        </div>
                    </div>
                </S.TopContent>
            </S.Top>
        </S.Container>
    );
};

export default Feed;
