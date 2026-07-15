import { historyRepository } from './historyRepository';

export const analyticsRepository = {
  async getDashboardStats(userId?: string) {
    const scans = await historyRepository.getScansByUser(userId);
    
    // Group by day for the last 7 days
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const activityByDay = scans.reduce((acc, scan) => {
      const date = new Date(scan.timestamp).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trend = last7Days.map(date => ({
      date,
      count: activityByDay[date] || 0
    }));

    // Categories Breakdown
    const categories = scans.reduce((acc, scan) => {
      acc[scan.category] = (acc[scan.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalScans: scans.length,
      trend,
      categories
    };
  }
};
