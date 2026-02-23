const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") ?? "10", 10) || 10));
  const sort = searchParams.get("sort") ?? "newest";
  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;
  const minReactions = searchParams.get("minReactions") ?? undefined;
  const gender = searchParams.get("gender") ?? undefined;

  const backendParams = new URLSearchParams();
  backendParams.set("page", String(page));
  backendParams.set("limit", String(limit));
  backendParams.set("sort", sort);
  if (q) backendParams.set("q", q);
  if (dateFrom) backendParams.set("dateFrom", dateFrom);
  if (dateTo) backendParams.set("dateTo", dateTo);
  if (minReactions != null && minReactions !== "")
    backendParams.set("minReactions", minReactions);
  if (gender) backendParams.set("gender", gender);

  const searchUrl = `${BASE_API_URL}/confessions/search?${backendParams}`;

  try {
    const res = await fetch(searchUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 15 },
    });

    if (!res.ok) {
      const text = await res.text();
      let body: { message?: string } = {};
      try {
        body = JSON.parse(text) as { message?: string };
      } catch {
        /* ignore */
      }
      return Response.json(
        { message: body.message ?? `Search failed: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = (await res.json()) as {
      data?: unknown[];
      confessions?: unknown[];
      hasMore?: boolean;
      total?: number;
      page?: number;
    };

    return Response.json({
      confessions: data.data ?? data.confessions ?? [],
      hasMore: data.hasMore !== false,
      total: data.total ?? 0,
      page: data.page ?? page,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Search service unavailable";
    return Response.json(
      { message },
      { status: 503 }
    );
  }
}
