export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { type } = await request.json();

    if (!type || !["like", "love"].includes(type)) {
      return new Response(
        JSON.stringify({ error: "Invalid reaction type" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // TODO: Update database with reaction
    // For now, return success with mock data
    return new Response(
      JSON.stringify({
        success: true,
        message: `Reacted with ${type} to confession ${params.id}`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Reaction error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process reaction" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
