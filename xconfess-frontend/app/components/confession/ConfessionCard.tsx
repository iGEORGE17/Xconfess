import { Confession } from "@/app/lib/types/confession";
import { ReactionButton } from "./ReactionButtons";

export const ConfessionCard = ({ confession }: { confession: Confession }) => {
  return (
    <div className="rounded-xl bg-zinc-900 p-4 shadow-md">
      <p className="text-gray-100 leading-relaxed">
        {confession.content}
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {new Date(confession.createdAt).toLocaleString()}
        </span>

        <div className="flex gap-3">
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
