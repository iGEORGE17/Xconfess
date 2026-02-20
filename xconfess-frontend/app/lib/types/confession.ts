export interface Confession {
  id: string;
  content: string;
  createdAt: string;
  reactions: {
    like: number;
    love: number;
  };
  author?: {
    id: string;
    username?: string;
    avatar?: string | null;
  };
  commentCount?: number;
  viewCount?: number;
  isAnchored?: boolean;
  stellarTxHash?: string | null;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: string;
  confessionId?: string;
  parentId?: number | null;
}
