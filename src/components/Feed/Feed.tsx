import {useEffect, useMemo, useState} from "react";
import {useAuth} from "../../context/useAuth";
import Navigationbar from "../Navigationbar/Navigationbar";
import * as S from "./Feed.styles";
import {Link} from "react-router-dom";
import api from "../../api/api";
import {PostContent, PostResponse} from "../../types/enum";

type FriendshipStatus = "PENDING" | "ACCEPTED" | "DECLINED";
type FriendshipRespondDTO = { id: number; sender: number; receiver: number; status: FriendshipStatus };

const normalizeRole = (raw: unknown): "ADMIN" | "USER" | null => {
    let v: unknown = raw;

    if (Array.isArray(v)) v = v[0];
    if (typeof v === "object" && v !== null) {
        const anyObj = v as any;
        v = anyObj.authority ?? anyObj.role ?? anyObj.name ?? anyObj.value ?? String(v);
    }

    if (typeof v !== "string") return null;

    const s = v.trim().toUpperCase();

    if (s === "ADMIN" || s === "ROLE_ADMIN") return "ADMIN";
    if (s === "USER" || s === "ROLE_USER") return "USER";

    return null;
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

const Feed = () => {
    const {token, userId, role} = useAuth();

    const effectiveRole = useMemo(() => {
        const fromCtx = normalizeRole(role);
        if (fromCtx) return fromCtx;

        const fromLs = normalizeRole(localStorage.getItem("userRole"));
        if (fromLs) return fromLs;

        return null;
    }, [role]);

    const isAdmin = effectiveRole === "ADMIN";

    const [posts, setPosts] = useState<PostContent[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const [pendingIncomingCount, setPendingIncomingCount] = useState(0);

    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editingText, setEditingText] = useState("");

    const getAllPosts = async (pageToLoad: number) => {
        if (!token || !userId) {
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
        if (!token || !userId) return;

        try {
            const res = await api.get<FriendshipRespondDTO[]>(`/friendship/users/${userId}`);
            const count = (res.data || []).filter(
                (f) => f.status === "PENDING" && String(f.receiver) === String(userId)
            ).length;
            setPendingIncomingCount(count);
        } catch (e) {
            console.error(e);
            setPendingIncomingCount(0);
        }
    };

    useEffect(() => {
        getAllPosts(page);
    }, [token, userId, page]);

    useEffect(() => {
        fetchPendingIncomingCount();
    }, [token, userId]);

    const canEditOrDeletePost = (post: any) => {
        if (!userId) return false;
        const ownerId = getPostOwnerId(post);
        const isOwner = ownerId !== null && ownerId === String(userId);
        return isOwner || isAdmin;
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

    if (loading) return <p>Laddar inlägg...</p>;

    return (
        <S.Container>
            <Navigationbar/>

            <div className="feed-container">
                <Link to="/wall">
                    Till min sida{pendingIncomingCount > 0 ? ` (${pendingIncomingCount})` : ""}
                </Link>

                <h1>Inlägg</h1>

                <div style={{fontSize: 12, opacity: 0.8, marginBottom: 8}}>
                    role(ctx): {String(role)} | role(eff): {String(effectiveRole)} | isAdmin: {String(isAdmin)} |
                    ls:{" "}
                    {String(localStorage.getItem("userRole"))}
                </div>

                {posts.length === 0 && <p>Inga inlägg hittades</p>}

                <ul className="post-list">
                    {posts.map((post) => {
                        const canModerate = canEditOrDeletePost(post);
                        const ownerId = getPostOwnerId(post);
                        const ownerName = getPostOwnerName(post);

                        return (
                            <li key={post.id} className="post-card">
                                <Link to={ownerId ? `/wall/${ownerId}` : "/wall"}>{ownerName}</Link>

                                <div style={{fontSize: 12, opacity: 0.7, marginTop: 6}}>
                                    ownerId: {String(ownerId)} | canModerate: {String(canModerate)}
                                </div>

                                {editingPostId === post.id ? (
                                    <>
                                        <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)}/>
                                        <div className="post-actions">
                                            <button onClick={() => handleEditPost(post.id)}>Spara</button>
                                            <button
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
                                        <hr/>
                                        <small className="post-date">{new Date(post.created).toLocaleString()}</small>

                                        {canModerate && (
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
        </S.Container>
    );
};

export default Feed;
