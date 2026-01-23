import {useEffect, useState} from "react";
import {useAuth} from "../../context/useAuth";
import api from "../../api/api";
import {User, WallPost, WallProps} from "../../types/enum";

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

const Wall = ({viewedUserId}: WallProps) => {
    const {token, userId: loggedInUserId} = useAuth();

    const [posts, setPosts] = useState<WallPost[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [newPostText, setNewPostText] = useState("");
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const isOwnWall = !viewedUserId || String(viewedUserId) === String(loggedInUserId);
    const targetUserId = viewedUserId ?? loggedInUserId;

    const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
    const [commentsByPost, setCommentsByPost] = useState<Record<string, CommentResponseDTO[]>>({});
    const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
    const [commentsError, setCommentsError] = useState<Record<string, string | null>>({});
    const [commentPageByPost, setCommentPageByPost] = useState<Record<string, number>>({});
    const [commentTotalPagesByPost, setCommentTotalPagesByPost] = useState<Record<string, number>>({});
    const [commentTotalElementsByPost, setCommentTotalElementsByPost] = useState<Record<string, number>>({});

    const [newCommentByPost, setNewCommentByPost] = useState<Record<string, string>>({});
    const [commentSubmitting, setCommentSubmitting] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setPage(0);
    }, [targetUserId]);

    const fetchPosts = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);

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

            setUser({
                id: Number(targetUserId),
                displayName: content[0]?.displayName || "",
                bio: "",
            });
        } catch (error) {
            console.error(error);
            setUser({id: Number(targetUserId), displayName: "", bio: ""});
            setPosts([]);
            setTotalPages(1);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
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

    if (loading || !user) return <p>Laddar inlägg...</p>;

    return (
        <div className="feed-container">
            <h1 className="center">{user.displayName}</h1>

            <div className="about-me">
                <p>
                    <b>Om mig:</b> {user.bio}
                </p>
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
    );
};

export default Wall;
