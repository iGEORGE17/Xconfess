import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '7d';

  // In a real app, you would fetch this from the backend
  // For now, we return mock data that matches the requirements
  
  const metrics = {
    totalConfessions: 1284,
    totalUsers: 856,
    totalReactions: 5432,
    activeUsers: 142,
    confessionsChange: +12.5,
    usersChange: +5.2,
    reactionsChange: +18.7,
    activeChange: -2.4,
  };

  const trendingConfessions = [
    {
      id: "1",
      message: "I once accidentally sent a recipe for cookies to my boss instead of the project report. He actually made them and said they were great!",
      category: "Work",
      reactions: { like: 142, love: 85, funny: 120, sad: 2 },
      viewCount: 1205,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: "2",
      message: "I've been using my neighbor's Netflix for 3 years. I don't even know their name.",
      category: "Life",
      reactions: { like: 98, love: 12, funny: 240, sad: 5 },
      viewCount: 3402,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: "3",
      message: "I secretly love pineapple on pizza and I'm tired of pretending I don't.",
      category: "Food",
      reactions: { like: 45, love: 30, funny: 12, sad: 156 },
      viewCount: 890,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: "4",
      message: "I forgot my own birthday once until my mom called me in the evening.",
      category: "Personal",
      reactions: { like: 67, love: 45, funny: 89, sad: 12 },
      viewCount: 1560,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: "5",
      message: "I use AI to write all my emails because I have social anxiety even over text.",
      category: "Tech",
      reactions: { like: 230, love: 110, funny: 45, sad: 34 },
      viewCount: 2100,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    }
  ];

  const reactionDistribution = [
    { name: 'Like', value: 2400, color: '#3b82f6' },
    { name: 'Love', value: 1800, color: '#ef4444' },
    { name: 'Funny', value: 900, color: '#f59e0b' },
    { name: 'Wow', value: 200, color: '#8b5cf6' },
    { name: 'Sad', value: 132, color: '#6b7280' },
  ];

  const activityData = period === '30d' 
    ? Array.from({ length: 30 }).map((_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        confessions: Math.floor(Math.random() * 50) + 20,
        users: Math.floor(Math.random() * 30) + 10,
        reactions: Math.floor(Math.random() * 200) + 100,
      }))
    : Array.from({ length: 7 }).map((_, i) => ({
        date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        confessions: Math.floor(Math.random() * 40) + 10,
        users: Math.floor(Math.random() * 20) + 5,
        reactions: Math.floor(Math.random() * 150) + 50,
      }));

  return NextResponse.json({
    metrics,
    trendingConfessions,
    reactionDistribution,
    activityData,
  });
}
