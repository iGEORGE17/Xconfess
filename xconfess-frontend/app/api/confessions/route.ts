import { normalizeConfession } from "../../lib/utils/normalizeConfession";

const BASE_API_URL = process.env.BACKEND_API_URL;

export async function POST(request: Request) {
  // Fail fast if backend URL is not configured
  if (!BASE_API_URL) {
    return new Response(
      JSON.stringify({
        message:
          "Server misconfiguration: BACKEND_API_URL is not set. Contact the system administrator.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await request.json();
    const { title, message, body: bodyContent, gender, stellarTxHash } = body;

    if (!message && !bodyContent) {
      return new Response(
        JSON.stringify({ message: "Confession content is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const confessionContent = bodyContent || message;
    const backendUrl = `${BASE_API_URL}/confessions`;

    const backendBody: any = {
      message: confessionContent,
      body: confessionContent,
    };

    if (title) backendBody.title = title;
    if (gender) backendBody.gender = gender;
    if (stellarTxHash) backendBody.stellarTxHash = stellarTxHash;

    try {
      const response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(backendBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return new Response(
          JSON.stringify({
            message:
              errorData.message ||
              `Failed to create confession: ${response.statusText}`,
          }),
          {
            status: response.status,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const data = await response.json();
      const normalized = normalizeConfession(data);

      return new Response(JSON.stringify(normalized), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (fetchError: any) {
      console.error("Failed to reach backend:", fetchError);
      return new Response(
        JSON.stringify({
          message: "Backend service unavailable. Please try again later.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("Error creating confession:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function GET(request: Request) {
  // Fail fast if backend URL is not configured
  if (!BASE_API_URL) {
    return new Response(
      JSON.stringify({
        message:
          "Server misconfiguration: BACKEND_API_URL is not set. Contact the system administrator.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1") || 1);
  const limit = Math.max(1, parseInt(searchParams.get("limit") ?? "10") || 10);
  const sort = searchParams.get("sort") ?? "newest";
  const gender = searchParams.get("gender");

  const backendParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort: sort,
  });

  if (gender) {
    backendParams.append("gender", gender);
  }

  try {
    const backendUrl = `${BASE_API_URL}/confessions?${backendParams}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 30, // Cache for 30 seconds
      },
    });

    if (!response.ok) {
      console.error(
        `Backend returned ${response.status}: ${response.statusText}`,
      );
      return new Response(
        JSON.stringify({
          message: `Failed to fetch confessions: ${response.statusText}`,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const data = await response.json();
    const rawConfessions = data.data || data.confessions || [];
    const confessions = rawConfessions.map(normalizeConfession);

    // ✅ Compute pagination metadata properly
    const total = data.total ?? confessions.length;
    const totalPages = data.totalPages ?? Math.ceil(total / limit);

    const hasMore =
      page < totalPages || (totalPages === undefined && confessions.length > 0);

    return new Response(
      JSON.stringify({
        confessions,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasMore,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error fetching confessions:", error);
    return new Response(
      JSON.stringify({
        message: "Backend service unavailable. Please try again later.",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
