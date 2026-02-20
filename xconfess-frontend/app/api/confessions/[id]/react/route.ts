// Stable Next.js App Router handler signature.
// params is typed directly as { id: string } — no Promise wrapper needed.
// The Promise wrapper was non-idiomatic and required an unnecessary await on params.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Destructure id directly — no await required since params is not a Promise
    const { id } = params;
    const { type } = await request.json();

    if (!type || !["like", "love"].includes(type)) {
      return new Response(JSON.stringify({ error: "Invalid reaction type" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const BASE_API_URL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    // Map frontend reaction type to backend emoji representation
    const emojiMap: Record<string, string> = {
      like: "👍",
      love: "❤️",
    };

    const emoji = emojiMap[type];

    // Send reaction to backend /reactions endpoint
    const reactionRes = await fetch(`${BASE_API_URL}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confessionId: id, emoji }),
    });

    if (!reactionRes.ok) {
      const isDemoMode =
        process.env.NODE_ENV === "development" ||
        process.env.DEMO_MODE === "true";

      if (isDemoMode) {
        console.warn(
          "Failed to post reaction, returning demo response for testing",
        );
        // Return demo success with incremented count
        const demoReactions = {
          like: Math.floor(Math.random() * 30) + 1,
          love: Math.floor(Math.random() * 20) + 1,
        };
        return new Response(
          JSON.stringify({
            success: true,
            reactions: demoReactions,
            _demo: true,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "X-Demo-Mode": "true",
            },
          },
        );
      }

      const err = await reactionRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({
          message: err.message || "Failed to persist reaction",
        }),
        {
          status: reactionRes.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Fetch updated confession to return fresh reaction counts
    const confessionRes = await fetch(`${BASE_API_URL}/confessions/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 5 },
    });

    if (!confessionRes.ok) {
      // Reaction persisted but fetching updated counts failed — still return success
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await confessionRes.json();
    // Normalize reaction counts (backend often returns an array of reaction records)
    let reactions = { like: 0, love: 0 };
    if (Array.isArray(data.reactions)) {
      reactions = {
        like: data.reactions.filter((r: unknown) => {
          const emoji = String(
            (r as Record<string, unknown>).emoji ?? "",
          ).toLowerCase();
          return emoji.includes("👍") || emoji.includes("like");
        }).length,
        love: data.reactions.filter((r: unknown) => {
          const emoji = String(
            (r as Record<string, unknown>).emoji ?? "",
          ).toLowerCase();
          return emoji.includes("❤️") || emoji.includes("love");
        }).length,
      };
    } else if (data.reactions && typeof data.reactions === "object") {
      // if backend provides aggregated counts
      reactions = {
        like: Number(data.reactions.like ?? 0),
        love: Number(data.reactions.love ?? 0),
      };
    }

    return new Response(JSON.stringify({ success: true, reactions }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const isDemoMode =
      process.env.NODE_ENV === "development" ||
      process.env.DEMO_MODE === "true";

    if (isDemoMode) {
      console.warn("Backend unreachable, returning demo reaction for testing");

      const demoReactions = {
        like: Math.floor(Math.random() * 30) + 1,
        love: Math.floor(Math.random() * 20) + 1,
      };

      return new Response(
        JSON.stringify({
          success: true,
          reactions: demoReactions,
          _demo: true,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Demo-Mode": "true",
          },
        },
      );
    }

    console.error("Error processing reaction proxy:", err);
    return new Response(
      JSON.stringify({ error: "Failed to process reaction" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
