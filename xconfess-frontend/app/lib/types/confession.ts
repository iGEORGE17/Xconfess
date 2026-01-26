export interface Confession {
  id: string;
  content: string;
  createdAt: string;
  reactions: {
    like: number;
    love: number;
  };
}
