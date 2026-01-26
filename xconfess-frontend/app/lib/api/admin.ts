import apiClient from './client';
import { mockAdminData } from './admin.mock';

function isMockAdminEnabled(): boolean {
  // build-time flag for local testing
  if (process.env.NEXT_PUBLIC_ADMIN_MOCK === 'true') return true;
  // runtime toggle
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('adminMock') === 'true';
}

export interface Report {
  id: string;
  confessionId: string;
  confession?: {
    id: string;
    message: string;
    created_at: string;
  };
  reporterId: number | null;
  reporter?: {
    id: number;
    username: string;
  };
  type: 'spam' | 'harassment' | 'hate_speech' | 'inappropriate_content' | 'copyright' | 'other';
  reason: string | null;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  resolvedBy: number | null;
  resolver?: {
    id: number;
    username: string;
  };
  resolvedAt: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  adminId: number;
  admin?: {
    id: number;
    username: string;
  };
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  notes: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalConfessions: number;
    totalReports: number;
    bannedUsers: number;
    hiddenConfessions: number;
    deletedConfessions: number;
  };
  reports: {
    byStatus: Array<{ status: string; count: string }>;
    byType: Array<{ type: string; count: string }>;
  };
  trends: {
    confessionsOverTime: Array<{ date: string; count: string }>;
  };
  period: {
    start: string;
    end: string;
  };
}

export const adminApi = {
  // Reports
  getReports: async (params?: {
    status?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => {
    if (isMockAdminEnabled()) {
      const all = mockAdminData.reports();
      const filtered = all.filter((r) => {
        if (params?.status && r.status !== params.status) return false;
        if (params?.type && r.type !== params.type) return false;
        return true;
      });
      const offset = params?.offset ?? 0;
      const limit = params?.limit ?? 50;
      return {
        reports: filtered.slice(offset, offset + limit),
        total: filtered.length,
        limit,
        offset,
      };
    }

    const response = await apiClient.get('/api/admin/reports', { params });
    return response.data;
  },

  getReport: async (id: string) => {
    if (isMockAdminEnabled()) {
      const report = mockAdminData.reports().find((r) => r.id === id);
      if (!report) throw new Error('Mock report not found');
      return report;
    }
    const response = await apiClient.get(`/api/admin/reports/${id}`);
    return response.data;
  },

  resolveReport: async (id: string, resolutionNotes?: string) => {
    if (isMockAdminEnabled()) {
      return { id, status: 'resolved', resolutionNotes: resolutionNotes ?? null };
    }
    const response = await apiClient.patch(`/api/admin/reports/${id}/resolve`, {
      resolutionNotes,
    });
    return response.data;
  },

  dismissReport: async (id: string, notes?: string) => {
    if (isMockAdminEnabled()) {
      return { id, status: 'dismissed', resolutionNotes: notes ?? null };
    }
    const response = await apiClient.patch(`/api/admin/reports/${id}/dismiss`, {
      resolutionNotes: notes,
    });
    return response.data;
  },

  bulkResolveReports: async (reportIds: string[], notes?: string) => {
    if (isMockAdminEnabled()) {
      return { resolved: reportIds.length, notes: notes ?? null };
    }
    const response = await apiClient.patch('/api/admin/reports/bulk-resolve', {
      reportIds,
      notes,
    });
    return response.data;
  },

  // Confessions
  deleteConfession: async (id: string, reason?: string) => {
    if (isMockAdminEnabled()) {
      return { message: 'Confession deleted successfully (mock)', id, reason: reason ?? null };
    }
    const response = await apiClient.delete(`/api/admin/confessions/${id}`, {
      data: { reason },
    });
    return response.data;
  },

  hideConfession: async (id: string, reason?: string) => {
    if (isMockAdminEnabled()) {
      return { id, isHidden: true, reason: reason ?? null };
    }
    const response = await apiClient.patch(`/api/admin/confessions/${id}/hide`, {
      reason,
    });
    return response.data;
  },

  unhideConfession: async (id: string) => {
    if (isMockAdminEnabled()) {
      return { id, isHidden: false };
    }
    const response = await apiClient.patch(`/api/admin/confessions/${id}/unhide`);
    return response.data;
  },

  // Users
  searchUsers: async (query: string, limit = 50, offset = 0) => {
    if (isMockAdminEnabled()) {
      const all = mockAdminData.users();
      const filtered = all.filter((u) =>
        u.username.toLowerCase().includes(query.toLowerCase()),
      );
      return {
        users: filtered.slice(offset, offset + limit),
        total: filtered.length,
      };
    }
    const response = await apiClient.get('/api/admin/users/search', {
      params: { q: query, limit, offset },
    });
    return response.data;
  },

  getUserHistory: async (id: string) => {
    if (isMockAdminEnabled()) {
      const user = mockAdminData.users().find((u) => u.id === Number(id));
      return {
        user,
        confessions: [],
        reports: mockAdminData.reports().filter((r) => r.reporterId === Number(id)),
        note: 'Mock mode: confessions are anonymized',
      };
    }
    const response = await apiClient.get(`/api/admin/users/${id}/history`);
    return response.data;
  },

  banUser: async (id: string, reason?: string) => {
    if (isMockAdminEnabled()) {
      return { id, is_active: false, reason: reason ?? null };
    }
    const response = await apiClient.patch(`/api/admin/users/${id}/ban`, {
      reason,
    });
    return response.data;
  },

  unbanUser: async (id: string) => {
    if (isMockAdminEnabled()) {
      return { id, is_active: true };
    }
    const response = await apiClient.patch(`/api/admin/users/${id}/unban`);
    return response.data;
  },

  // Analytics
  getAnalytics: async (startDate?: string, endDate?: string) => {
    if (isMockAdminEnabled()) {
      return mockAdminData.analytics();
    }
    const response = await apiClient.get('/api/admin/analytics', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params?: {
    adminId?: number;
    action?: string;
    entityType?: string;
    entityId?: string;
    limit?: number;
    offset?: number;
  }) => {
    if (isMockAdminEnabled()) {
      const all = mockAdminData.auditLogs();
      const filtered = all.filter((l) => {
        if (params?.action && l.action !== params.action) return false;
        if (params?.entityType && l.entityType !== params.entityType) return false;
        if (params?.entityId && l.entityId !== params.entityId) return false;
        if (params?.adminId && l.adminId !== params.adminId) return false;
        return true;
      });
      const offset = params?.offset ?? 0;
      const limit = params?.limit ?? 100;
      return {
        logs: filtered.slice(offset, offset + limit),
        total: filtered.length,
        limit,
        offset,
      };
    }
    const response = await apiClient.get('/api/admin/audit-logs', { params });
    return response.data;
  },
};
