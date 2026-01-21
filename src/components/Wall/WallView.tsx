import { useParams } from "react-router-dom";
import Wall from "./Wall";

const WallView = () => {
  const { userId } = useParams<{ userId: string }>();

  const viewedUserId = userId ? Number(userId) : undefined;

  return <Wall viewedUserId={viewedUserId} />;
};

export default WallView;