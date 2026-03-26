/**
 * @jest-environment jsdom
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { TrendingDashboard } from '../TrendingDashboard';

jest.mock('../TrendingConfessionCard', () => ({
  TrendingConfessionCard: ({
    confession,
    rank,
  }: {
    confession: { content: string };
    rank: number;
  }) => <div>{`${rank}. ${confession.content}`}</div>,
}));

jest.mock('../ReactionChart', () => ({
  ReactionChart: ({ data }: { data: unknown[] }) => <div>{`reaction-chart:${data.length}`}</div>,
}));

jest.mock('../ActivityChart', () => ({
  ActivityChart: ({ data }: { data: unknown[] }) => <div>{`activity-chart:${data.length}`}</div>,
}));

jest.mock('../MetricsOverview', () => ({
  MetricsOverview: ({ metrics }: { metrics: { totalConfessions: number } }) => (
    <div>{`metrics:${metrics.totalConfessions}`}</div>
  ),
}));

const emptyTrendingResponse = {
  trending: [],
  reactionDistribution: [],
  dailyActivity: [],
  totalMetrics: {
    totalConfessions: 0,
    totalReactions: 0,
    totalUsers: 0,
  },
  period: '7days',
};

const populatedTrendingResponse = {
  trending: [
    {
      id: 'conf-1',
      content: 'A recovered confession',
      createdAt: '2025-01-01T00:00:00.000Z',
      reactions: {
        like: 2,
        love: 1,
      },
      reactionCount: 3,
    },
  ],
  reactionDistribution: [{ type: 'like', count: 3, percentage: 100 }],
  dailyActivity: [{ date: '2025-01-01', confessions: 1, reactions: 3, activeUsers: 1 }],
  totalMetrics: {
    totalConfessions: 1,
    totalReactions: 3,
    totalUsers: 1,
  },
  period: '7days',
};

describe('TrendingDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading fallback while analytics are pending', () => {
    global.fetch = jest.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => emptyTrendingResponse,
            });
          }, 50);
        }),
    ) as jest.Mock;

    render(<TrendingDashboard />);

    expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
  });

  it('renders empty fallback UI when there are no trending confessions', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => emptyTrendingResponse,
    }) as jest.Mock;

    render(<TrendingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('No trending confessions yet')).toBeInTheDocument();
    });
  });

  it('renders server-error fallback and retries successfully', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => populatedTrendingResponse,
      }) as jest.Mock;

    render(<TrendingDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to Load Analytics')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(screen.getByText('1. A recovered confession')).toBeInTheDocument();
    });
  });
});
