// Stable Next.js App Router handler signature.
// params is typed directly as { id: string } — no Promise wrapper needed.
// The Promise wrapper was non-idiomatic and required an unnecessary await on params.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Destructure id directly — no await required since params is not a Promise
    const { id } = params;
    const { type } = await request.json();

    if (!type || !["like", "love"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid reaction type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // TODO: Update database with reaction
    return new Response(
      JSON.stringify({
        success: true,
        message: `Reacted with ${type} to confession ${id}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to process reaction" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}