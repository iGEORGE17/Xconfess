export async function GET(request: Request) {
  // Read query parameters
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') ?? '1') || 1;

  // Example: mock data
  const confessionsPerPage = 5;
  const allConfessions = [
    { id: "1", content: "I love coding.", createdAt: new Date().toISOString(), reactions: { like: 5, love: 3 } },
    { id: "2", content: "I secretly watch cartoons.", createdAt: new Date().toISOString(), reactions: { like: 8, love: 12 } },
    { id: "3", content: "I talk to my plants.", createdAt: new Date().toISOString(), reactions: { like: 2, love: 7 } },
    { id: "4", content: "I enjoy midnight walks.", createdAt: new Date().toISOString(), reactions: { like: 10, love: 4 } },
    { id: "5", content: "I write poems no one reads.", createdAt: new Date().toISOString(), reactions: { like: 3, love: 6 } },
    { id: "6", content: "I skip breakfast sometimes.", createdAt: new Date().toISOString(), reactions: { like: 4, love: 2 } },
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
