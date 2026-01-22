// app/api/confessions/route.js

export async function GET(request: Request) {
  // Read query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1') || 1;

  // Example: mock data
  const confessionsPerPage = 5;
  const allConfessions = [
    { id: 1, text: "I love coding." },
    { id: 2, text: "I secretly watch cartoons." },
    { id: 3, text: "I talk to my plants." },
    { id: 4, text: "I enjoy midnight walks." },
    { id: 5, text: "I write poems no one reads." },
    { id: 6, text: "I skip breakfast sometimes." },
  ];

  const start = (page - 1) * confessionsPerPage;
  const pagedConfessions = allConfessions.slice(start, start + confessionsPerPage);

  return new Response(JSON.stringify({
    page,
    confessions: pagedConfessions
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
