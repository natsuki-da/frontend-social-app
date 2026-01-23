import {useEffect, useState} from "react";
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

const Feed = () => {
    const {token, userId} = useAuth();
    const [posts, setPosts] = useState<PostContent[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentResponseDTO[]>>({});
    const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
    const [commentsError, setCommentsError] = useState<Record<string, string | null>>({});

    const [commentPageByPost, setCommentPageByPost] = useState<Record<string, number>>({});
    const [commentTotalPagesByPost, setCommentTotalPagesByPost] = useState<Record<string, number>>({});
    const [commentTotalElementsByPost, setCommentTotalElementsByPost] = useState<Record<string, number>>({});

    const [newCommentByPost, setNewCommentByPost] = useState<Record<string, string>>({});
    const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

    const getAllPosts = async (page: number) => {
        if (!token || !userId) {
            setLoading(false);
            return;
        }
        setLoading(true);

        try {
            const response = await api.get<PostResponse>(`/posts/get?page=${page}&size=10`);
            setPosts(response.data.content);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        getAllPosts(page);
    }, [token, userId, page]);

    if (loading) return <p>Laddar inlägg...</p>;

    return (
        <S.Container>
            <Navigationbar/>

            <div className="feed-container">
                <Link to="/wall">Till min sida</Link>
                <h1>Inlägg</h1>

                {posts?.length === 0 && <p>Inga inlägg hittades</p>}

                <ul className="post-list">
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
                            <li key={post.id} className="post-card">
                                <Link to={`/wall/${post.userId}`}>{post.username}</Link>
                                <p className="post-text">{post.text}</p>
                                <hr/>
                                <small className="post-date">
                                    {new Date(post.created).toLocaleString()}
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

                                            {isCommentsLoading && comments.length === 0 && <p>Laddar kommentarer...</p>}
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
                                                                <strong>{getCommentUsername(c)}</strong>: {getCommentText(c)}
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
                                                <button onClick={() => loadMoreComments(post.id)}
                                                        disabled={isCommentsLoading}>
                                                    {isCommentsLoading ? "Laddar..." : "Visa fler"}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {String(post.userId) === String(userId) && (
                                    <div className="post-actions">
                                        <button>Redigera</button>
                                        <button>Ta bort</button>
                                    </div>
                                )}
                            </li>
                        );
                    })}
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
        </S.Container>
    );
};

export default Feed;
