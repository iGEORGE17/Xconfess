import React, { useEffect, useState } from "react";

interface Props { userId: string; }

const ConfessionHistory = ({ userId }: Props) => {
  const [confessions, setConfessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Replace with real API call later
    const fetchHistory = async () => {
      setLoading(true);
      const res = await fetch(`/api/confessions?userId=${userId}`);
      const data = await res.json();
      setConfessions(data);
      setLoading(false);
    };
    fetchHistory();
  }, [userId]);

  if (loading) return <p>Loading confessions...</p>;
  if (!confessions.length) return <p>No confessions yet.</p>;

  return (
    <div className="space-y-4">
      {confessions.map((confession) => (
        <div key={confession.id} className="p-4 bg-gray-800 rounded">
          {confession.content}
        </div>
      ))}
    </div>
  );
};

export default ConfessionHistory;
