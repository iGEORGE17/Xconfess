import { ReactionButton } from "./ReactionButtons";

interface Props {
  confession: {
    id: string;
    content: string;
    createdAt: string;
    reactions: { like: number; love: number };
    author?: {
      id: string;
      username?: string;
      avatar?: string;
    };
    commentCount?: number;
    viewCount?: number;
  };
}

export const ConfessionCard = ({ confession }: Props) => {
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return new Date(date).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    });
  };

  return (
    <div className="bg-zinc-900 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      {/* Header: Author and Timestamp */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          {confession.author?.avatar && (
            <img
              src={confession.author.avatar}
              alt={confession.author?.username || "Anonymous"}
              className="w-8 h-8 rounded-full bg-zinc-700"
            />
          )}
          <p className="text-sm font-medium text-gray-300">
            {confession.author?.username || "Anonymous"}
          </p>
        </div>
        <p className="text-xs text-gray-500">{timeAgo(confession.createdAt)}</p>
      </div>

      {/* Content */}
      <p className="text-white text-lg mb-4 leading-relaxed wrap-break-word">
        {confession.content}
      </p>

      {/* Metadata and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {confession.viewCount !== undefined && (
            <span className="flex items-center gap-1 hover:text-gray-300 transition-colors cursor-pointer">
              👁️ {confession.viewCount}
            </span>
          )}
          {confession.commentCount !== undefined && (
            <span className="flex items-center gap-1 hover:text-gray-300 transition-colors cursor-pointer">
              💬 {confession.commentCount}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <ReactionButton
            type="like"
            count={confession.reactions.like}
            confessionId={confession.id}
          />
          <ReactionButton
            type="love"
            count={confession.reactions.love}
            confessionId={confession.id}
          />
        </div>
      </div>
    </div>
  );
};