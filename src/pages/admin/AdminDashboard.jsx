import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingCart, DollarSign, Users,
  AlertTriangle, Plus, Image, Home, ArrowRight,
  TrendingUp, Clock, CheckCircle, XCircle
} from 'lucide-react';
import {
  getDashboardStats,
  getRevenueTrend,
  getTopSellingProducts,
  getRecentOrders,
  getLowStockAlerts,
} from '../../services/admin/dashboardService';

const STATUS_STYLES = {
  ORDERED:    { bg: 'bg-blue-500/10',   text: 'text-blue-400',   dot: 'bg-blue-400' },
  DISPATCHED: { bg: 'bg-amber-500/10',  text: 'text-amber-400',  dot: 'bg-amber-400' },
  DELIVERED:  { bg: 'bg-emerald-500/10',text: 'text-emerald-400',dot: 'bg-emerald-400' },
  CANCELLED:  { bg: 'bg-red-500/10',    text: 'text-red-400',    dot: 'bg-red-400' },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.ORDERED;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function StatCard({ label, value, subtext, icon: Icon, accent, trend }) {
  return (
    <div className="bg-[#141410] border border-white/[0.06] rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${accent.bg}`}>
          <Icon size={16} className={accent.text} />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-semibold flex items-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <TrendingUp size={10} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-0.5 tracking-tight">{value}</p>
      <p className="text-[11px] text-white/40 font-medium uppercase tracking-wider">{label}</p>
      {subtext && <p className="text-[10px] text-white/25 mt-1">{subtext}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trendDays, setTrendDays] = useState(7);

  useEffect(() => {
    loadAll();
  }, [trendDays]);

  const loadAll = async () => {
    setLoading(true);
    const [statsRes, trendRes, productsRes, ordersRes, stockRes] = await Promise.all([
      getDashboardStats(),
      getRevenueTrend(trendDays),
      getTopSellingProducts(5),
      getRecentOrders(6),
      getLowStockAlerts(),
    ]);
    if (statsRes.stats)        setStats(statsRes.stats);
    if (trendRes.trend)        setRevenueTrend(trendRes.trend);
    if (productsRes.products)  setTopProducts(productsRes.products);
    if (ordersRes.orders)      setRecentOrders(ordersRes.orders);
    if (stockRes.products)     setLowStock(stockRes.products);
    setLoading(false);
  };

  const formatCurrency = (val) => {
    if (!val) return '₦0';
    if (val >= 1000000) return `₦${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000)    return `₦${(val / 1000).toFixed(0)}K`;
    return `₦${val.toLocaleString()}`;
  };

  const quickActions = [
    { label: 'Add New Product', desc: 'Create a product listing', icon: Plus, to: '/admin/products', color: 'text-[#c9a96e]', bg: 'bg-[#c9a96e]/10' },
    { label: 'Edit Homepage', desc: 'Update banners & sections', icon: Home, to: '/admin/homepage', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Upload Media', desc: 'Add images to library', icon: Image, to: '/admin/media', color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { label: 'View Orders', desc: 'Manage order statuses', icon: ShoppingCart, to: '/admin/orders', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...revenueTrend.map(d => d.revenue), 1);

  return (
    <div className="p-8 max-w-[1400px]">
      {/* Page Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 mb-1">Welcome back</p>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickActions.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.to}
              to={a.to}
              className="bg-[#141410] border border-white/[0.06] rounded-xl p-4 hover:border-white/10 hover:bg-[#1a1a16] transition-all group flex items-start gap-3"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${a.bg}`}>
                <Icon size={16} className={a.color} />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-white/80 group-hover:text-white transition-colors">{a.label}</p>
                <p className="text-[10px] text-white/30 mt-0.5">{a.desc}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats?.revenue?.total)}
          subtext={`Today: ${formatCurrency(stats?.revenue?.today)}`}
          icon={DollarSign}
          accent={{ bg: 'bg-[#c9a96e]/10', text: 'text-[#c9a96e]' }}
        />
        <StatCard
          label="Total Orders"
          value={stats?.orders?.total ?? 0}
          subtext={`${stats?.orders?.pending ?? 0} pending`}
          icon={ShoppingCart}
          accent={{ bg: 'bg-blue-500/10', text: 'text-blue-400' }}
        />
        <StatCard
          label="Active Products"
          value={stats?.products?.active ?? 0}
          subtext={`${stats?.products?.total ?? 0} total`}
          icon={Package}
          accent={{ bg: 'bg-emerald-500/10', text: 'text-emerald-400' }}
        />
        <StatCard
          label="Customers"
          value={stats?.customers?.total ?? 0}
          subtext={`${stats?.products?.lowStock ?? 0} low stock`}
          icon={Users}
          accent={{ bg: 'bg-purple-500/10', text: 'text-purple-400' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart + Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="bg-[#141410] border border-white/[0.06] rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[13px] font-semibold text-white">Revenue Trend</h2>
                <p className="text-[10px] text-white/30 mt-0.5">Last {trendDays} days</p>
              </div>
              <div className="flex gap-1">
                {[7, 14, 30].map(d => (
                  <button
                    key={d}
                    onClick={() => setTrendDays(d)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                      trendDays === d
                        ? 'bg-[#c9a96e] text-[#0a0a08]'
                        : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                    }`}
                  >
                    {d}D
                  </button>
                ))}
              </div>
            </div>
            {revenueTrend.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <p className="text-white/25 text-sm">No revenue data yet</p>
              </div>
            ) : (
              <div className="flex items-end gap-1.5 h-40">
                {revenueTrend.map((item, i) => {
                  const h = (item.revenue / maxRevenue) * 100;
                  const isHighest = item.revenue === maxRevenue;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                      <div
                        className="w-full rounded-t transition-all duration-300 cursor-default"
                        style={{
                          height: `${Math.max(h, 4)}%`,
                          background: isHighest ? '#c9a96e' : 'rgba(255,255,255,0.06)',
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-white text-[#0a0a08] px-2.5 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap shadow-xl">
                            {formatCurrency(item.revenue)}
                          </div>
                        </div>
                      </div>
                      <p className="text-[8px] text-white/25 font-medium">{item.date}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-[#141410] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-[13px] font-semibold text-white">Recent Orders</h2>
              <Link to="/admin/orders" className="text-[10px] font-semibold text-white/30 hover:text-[#c9a96e] transition-colors flex items-center gap-1 uppercase tracking-wider">
                View All <ArrowRight size={10} />
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingCart size={28} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No orders yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-white">#{order.order_number}</p>
                      <p className="text-[10px] text-white/40 truncate mt-0.5">{order.customer_name}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-[12px] font-semibold text-white">₦{order.total?.toLocaleString()}</p>
                      <p className="text-[10px] text-white/30 mt-0.5 flex items-center gap-1 justify-end">
                        <Clock size={9} />
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusPill status={order.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          {lowStock.length > 0 && (
            <div className="bg-[#141410] border border-red-500/20 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-red-500/10">
                <AlertTriangle size={14} className="text-red-400" />
                <h2 className="text-[12px] font-semibold text-red-400 uppercase tracking-wider">Low Stock Alert</h2>
              </div>
              <div className="divide-y divide-white/[0.04]">
                {lowStock.slice(0, 5).map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3">
                    <p className="text-[11px] text-white/60 truncate flex-1">{p.name}</p>
                    <span className={`text-[11px] font-bold ml-3 shrink-0 ${p.stock === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                      {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
              {lowStock.length > 5 && (
                <Link to="/admin/products" className="flex items-center justify-center gap-1.5 py-3 text-[10px] font-semibold text-red-400/70 hover:text-red-400 transition-colors border-t border-red-500/10 uppercase tracking-wider">
                  View all {lowStock.length} alerts <ArrowRight size={10} />
                </Link>
              )}
            </div>
          )}

          {/* Top Products */}
          <div className="bg-[#141410] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h2 className="text-[13px] font-semibold text-white">Top Sellers</h2>
              <Link to="/admin/products" className="text-[10px] font-semibold text-white/30 hover:text-[#c9a96e] transition-colors uppercase tracking-wider">
                All Products
              </Link>
            </div>
            {topProducts.length === 0 ? (
              <div className="py-10 text-center">
                <Package size={28} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/30 text-sm">No sales data yet</p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {topProducts.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <img
                      src={item.product?.images?.[0] || 'https://via.placeholder.com/40'}
                      alt={item.product?.name}
                      className="w-10 h-10 object-cover rounded-lg bg-white/5 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-white/80 truncate">{item.product?.name}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">{item.totalQuantity} sold</p>
                    </div>
                    <p className="text-[11px] font-semibold text-[#c9a96e] shrink-0">
                      {formatCurrency(item.totalRevenue)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
