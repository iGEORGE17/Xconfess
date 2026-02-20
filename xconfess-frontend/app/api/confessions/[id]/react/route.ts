export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
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