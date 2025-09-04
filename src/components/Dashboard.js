import React from 'react';
import { format, subDays } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import MetricCard from './MetricCard';
import RecentUsers from './RecentUsers';
import './Dashboard.css';

const Dashboard = ({ users }) => {
  // Calculate total users
  const totalUsers = users.length;

  // Calculate users created per day (last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const usersLast30Days = users.filter(user => {
    const userDate = new Date(user.createdAt);
    return userDate >= thirtyDaysAgo;
  });

  const dailySignups = {};
  usersLast30Days.forEach(user => {
    const date = format(new Date(user.createdAt), 'yyyy-MM-dd');
    dailySignups[date] = (dailySignups[date] || 0) + 1;
  });

  const chartData = Object.entries(dailySignups)
    .map(([date, count]) => ({
      date: format(new Date(date), 'MMM dd'),
      users: count
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Calculate avatar distribution
  const usersWithAvatars = users.filter(user => user.avatar && user.avatar.trim() !== '').length;
  const usersWithoutAvatars = totalUsers - usersWithAvatars;

  const avatarData = [
    { name: 'With Avatar', value: usersWithAvatars, color: '#3b82f6' },
    { name: 'No Avatar', value: usersWithoutAvatars, color: '#e2e8f0' }
  ];

  // Calculate signup time distribution
  const hourlySignups = {};
  users.forEach(user => {
    const hour = new Date(user.createdAt).getHours();
    hourlySignups[hour] = (hourlySignups[hour] || 0) + 1;
  });

  // Note: heatmap below uses hourlySignups directly

  // Get recently joined users (last 5)
  const recentUsers = [...users]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome to your user analytics dashboard</p>
      </div>

      {/* KPI Cards */}
      <div className="dashboard-grid">
        <MetricCard
          title="Total Users"
          value={totalUsers}
          trend={usersLast30Days.length > 0 ? 'positive' : 'neutral'}
          trendValue={`+${usersLast30Days.length} this month`}
        />
        <MetricCard
          title="New This Month"
          value={usersLast30Days.length}
          trend="positive"
          trendValue="Active growth"
        />
        <MetricCard
          title="With Avatars"
          value={usersWithAvatars}
          trend={usersWithAvatars > usersWithoutAvatars ? 'positive' : 'neutral'}
          trendValue={`${Math.round((usersWithAvatars / totalUsers) * 100)}% completion`}
        />
      </div>

      {/* Charts Section */}
      <div className="dashboard-grid-large">
        {/* Daily Signups Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Daily Signups (Last 30 Days)</h3>
          <p className="chart-subtitle">Track user growth over time</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="date" 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#1e293b', fontWeight: '600' }}
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Avatar Distribution Chart */}
        <div className="chart-container">
          <h3 className="chart-title">Avatar Distribution</h3>
          <p className="chart-subtitle">Profile picture completion rate</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={avatarData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {avatarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [value, name]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            {avatarData.map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-color" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="legend-label">{item.name}</span>
                <span className="legend-value">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signup Time Distribution */}
      <div className="chart-container">
        <h3 className="chart-title">Signup Time Distribution</h3>
        <p className="chart-subtitle">Peak signup hours throughout the day</p>
        <div className="time-heatmap">
          {Array.from({ length: 24 }, (_, hour) => {
            const count = hourlySignups[hour] || 0;
            const maxCount = Math.max(...Object.values(hourlySignups));
            const intensity = maxCount > 0 ? count / maxCount : 0;
            
            return (
              <div
                key={hour}
                className="time-slot"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${0.2 + intensity * 0.8})`,
                  border: `1px solid rgba(59, 130, 246, ${0.3 + intensity * 0.7})`
                }}
                title={`${hour}:00 - ${count} signups`}
              >
                <span className="time-hour">{hour}</span>
                <span className="time-count">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Users */}
      <RecentUsers users={recentUsers} />
    </div>
  );
};

export default Dashboard;
