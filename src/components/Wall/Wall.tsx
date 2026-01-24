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
    const [commentPageByPost, setCommentPageByPost] = useState<
        Record<string, number>
    >({});
    const [commentTotalPagesByPost, setCommentTotalPagesByPost] = useState<
        Record<string, number>
    >({});

    useEffect(() => {
        setPage(0);
    }, [targetUserId]);

    useEffect(() => {
        if (!token || !targetUserId) return;

        const load = async () => {
            setLoading(true);

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
            setLoading(false);
            setProfileLoading(false);
        };

        load();
    }, [token, targetUserId, page, isOwnWall]);

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
            const otherName = senderIsTarget ? f.receiverDisplayName : f.senderDisplayName;

            return {...f, otherId, otherName};
        });
    }, [friendsAccepted, targetUserId]);

    const canModeratePost = (post: any) =>
        isAdmin || String(post.userId) === effectiveUserId;

    const acceptRequest = async (friendshipId: number) => {
        await api.put(`/friendship/${friendshipId}/accept`);
        location.reload();
    };

    const rejectRequest = async (friendshipId: number) => {
        await api.put(`/friendship/${friendshipId}/reject`);
        location.reload();
    };

    const toggleComments = async (postId: number) => {
        const key = String(postId);
        if (!openComments[key]) {
            const res = await api.get<PageResponse<CommentResponseDTO>>(
                `/comments/post/${postId}?page=0&size=10`
            );
            setCommentsByPost((p) => ({...p, [key]: res.data.content}));
            setCommentPageByPost((p) => ({...p, [key]: 0}));
            setCommentTotalPagesByPost((p) => ({...p, [key]: res.data.totalPages}));
        }
        setOpenComments((p) => ({...p, [key]: !p[key]}));
    };

    if (!token) return <p>Du måste vara inloggad.</p>;
    if (loading || profileLoading) return <p>Laddar...</p>;
    if (!user) return <p>Kunde inte ladda profilen.</p>;

    return (
        <div className="feed-container">
            <button onClick={() => navigate("/feed")}>Tillbaka</button>

            <h1>{user.displayName}</h1>

            {isOwnWall && (
                <div>
          <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
          />
                    <button
                        onClick={async () => {
                            await api.post("/users/posts", {text: newPostText});
                            location.reload();
                        }}
                    >
                        Publicera
                    </button>
                </div>
            )}

            {isOwnWall && pendingIncoming.length > 0 && (
                <>
                    <h3>Vänförfrågningar</h3>
                    <ul>
                        {pendingIncoming.map((f) => (
                            <li key={f.id}>
                                <Link to={`/wall/${f.sender}`}>
                                    {f.senderDisplayName ?? `User ${f.sender}`}
                                </Link>
                                <button onClick={() => acceptRequest(f.id)}>Acceptera</button>
                                <button onClick={() => rejectRequest(f.id)}>Avvisa</button>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            {acceptedForViewedWall.length > 0 && (
                <>
                    <h3>Vänner</h3>
                    <ul>
                        {acceptedForViewedWall.map((f) => (
                            <li key={f.id}>
                                <Link to={`/wall/${f.otherId}`}>
                                    {f.otherName ?? `User ${f.otherId}`}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <ul>
                {posts.map((post) => {
                    const pid = String(post.id);
                    return (
                        <li key={post.id}>
                            <p>{post.text}</p>
                            <small>{new Date(post.created).toLocaleString()}</small>

                            <button onClick={() => toggleComments(post.id)}>
                                {openComments[pid] ? "Dölj kommentarer" : "Visa kommentarer"}
                            </button>

                            {openComments[pid] &&
                                commentsByPost[pid]?.map((c) => (
                                    <div key={c.id}>
                                        <strong>{c.username}</strong>: {c.text}
                                    </div>
                                ))}

                            {canModeratePost(post) && (
                                <>
                                    <button
                                        onClick={() =>
                                            api.delete(`/posts/${post.id}`).then(() => location.reload())
                                        }
                                    >
                                        Ta bort
                                    </button>
                                </>
                            )}
                        </li>
                    );
                })}
            </ul>

            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
                Föregående
            </button>
            <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
            >
                Nästa
            </button>
        </div>
    );
};

export default Wall;
