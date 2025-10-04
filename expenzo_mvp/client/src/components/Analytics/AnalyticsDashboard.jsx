import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import KPICards from './KPICards';
import TimeSeriesChart from './TimeSeriesChart';
import CategoryChart from './CategoryChart';
import TopMerchantsChart from './TopMerchantsChart';
import ApprovalFunnel from './ApprovalFunnel';
import PendingApprovalsPanel from './PendingApprovalsPanel';
import FiltersPanel from './FiltersPanel';
import DrilldownDrawer from './DrilldownDrawer';

const AnalyticsDashboard = () => {
  const [kpis, setKpis] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    groupBy: 'day'
  });
  const [selectedData, setSelectedData] = useState(null);
  const [showDrilldown, setShowDrilldown] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [kpisRes, timeseriesRes, categoriesRes, merchantsRes, funnelRes, approvalsRes] = await Promise.all([
        api.get(`/analytics/kpis`),
        api.get(`/analytics/timeseries`),
        api.get(`/analytics/categories`),
        api.get(`/analytics/merchants?limit=10`),
        api.get(`/analytics/approval-funnel`),
        api.get(`/expenses?status=pending&limit=5`)
      ]);

      setKpis(kpisRes.data);
      setTimeseries(timeseriesRes.data);
      setCategories(categoriesRes.data);
      setMerchants(merchantsRes.data);
      setFunnel(funnelRes.data);
      setPendingApprovals(approvalsRes.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchAnalyticsData, 30000); // 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleChartClick = (data) => {
    setSelectedData(data);
    setShowDrilldown(true);
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await api.post('/analytics/export', {
        format,
        from: filters.from,
        to: filters.to
      }, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `expenses.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading && !kpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium ${
                autoRefresh 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}
            >
              {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <FiltersPanel filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* KPI Cards */}
      <div className="mb-6">
        <KPICards kpis={kpis} loading={loading} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Time Series Chart */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Spend Over Time</h2>
            <TimeSeriesChart 
              data={timeseries} 
              onPointClick={handleChartClick}
              loading={loading}
            />
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pending Approvals</h2>
            <PendingApprovalsPanel 
              approvals={pendingApprovals} 
              onApprovalAction={fetchAnalyticsData}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <CategoryChart 
            data={categories} 
            onSliceClick={handleChartClick}
            loading={loading}
          />
        </div>

        {/* Top Merchants */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Merchants</h2>
          <TopMerchantsChart 
            data={merchants} 
            onBarClick={handleChartClick}
            loading={loading}
          />
        </div>
      </div>

      {/* Approval Funnel */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Approval Funnel</h2>
          <ApprovalFunnel data={funnel} loading={loading} />
        </div>
      </div>

      {/* Drilldown Drawer */}
      {showDrilldown && (
        <DrilldownDrawer
          data={selectedData}
          onClose={() => setShowDrilldown(false)}
          onAction={fetchAnalyticsData}
        />
      )}
    </div>
  );
};

export default AnalyticsDashboard;

