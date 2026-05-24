import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import * as customerAdminService from '../../services/admin/customerAdminService';
import { toast } from '../../components/ui/ToastProvider';

export default function CustomersManager() {
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load customers and stats in parallel
      const [customersResult, statsResult] = await Promise.all([
        customerAdminService.getAllCustomers(),
        customerAdminService.getCustomerStats(),
      ]);

      if (customersResult.error) {
        toast(customersResult.error, 'error');
      } else {
        setCustomers(customersResult.data || []);
      }

      if (statsResult.error) {
        console.error('Stats error:', statsResult.error);
      } else {
        setStats(statsResult.data);
      }
    } catch (error) {
      toast('Failed to load customers', 'error');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const visible = customers.filter(c =>
    !search || 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate totals from actual data
  const totalCustomers = customers.length;
  const totalRevenue = 0; // Will be calculated from orders
  const avgOrderValue = 0; // Will be calculated from orders

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-1">Admin</p>
          <h1 className="font-unica text-5xl uppercase tracking-tighter text-bone">CUSTOMERS</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <p className="font-plex text-sm text-concrete">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="font-grotesk font-bold text-[10px] uppercase tracking-widest text-concrete mb-1">Admin</p>
        <h1 className="font-unica text-5xl uppercase tracking-tighter text-bone">CUSTOMERS</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: stats?.total || 0 },
          { label: 'With Orders', value: stats?.withOrders || 0 },
          { label: 'New This Month', value: stats?.newThisMonth || 0 },
        ].map(s => (
          <div key={s.label} className="border border-[#2a2a26] p-5">
            <p className="font-unica text-4xl tracking-tighter text-bone mb-1">{s.value}</p>
            <p className="font-grotesk font-bold text-[9px] uppercase tracking-widest text-concrete">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-concrete" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full bg-[#1c1c18] border border-[#2a2a26] text-bone font-plex text-sm pl-9 pr-4 py-2 outline-none focus:border-bone" />
      </div>

      {/* Table */}
      <div className="border border-[#2a2a26] overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-[#0f0f0c] border-b border-[#2a2a26]">
              {['Customer', 'Email', 'Orders', 'Total Spend', 'Last Order', 'Member Since'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-grotesk font-bold text-[9px] uppercase tracking-widest text-concrete">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center font-unica text-2xl uppercase tracking-tighter text-concrete/30">
                  {search ? 'NO CUSTOMERS FOUND' : 'NO CUSTOMERS YET'}
                </td>
              </tr>
            ) : (
              visible.map((c, i) => (
                <tr key={c.id} className={`border-b border-[#2a2a26] hover:bg-[#1c1c18] transition-colors ${i % 2 === 0 ? 'bg-[#141412]' : 'bg-[#0f0f0c]'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#2a2a26] flex items-center justify-center text-bone font-unica text-sm">
                        {c.full_name?.[0] || c.email?.[0] || '?'}
                      </div>
                      <span className="font-plex text-sm text-bone">{c.full_name || 'No name'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-plex text-xs text-concrete">{c.email}</td>
                  <td className="px-5 py-4 font-grotesk font-bold text-sm text-bone">{c.order_count || 0}</td>
                  <td className="px-5 py-4 font-grotesk font-bold text-sm text-[#D4AF37]">—</td>
                  <td className="px-5 py-4 font-plex text-xs text-concrete">—</td>
                  <td className="px-5 py-4 font-plex text-xs text-concrete">{new Date(c.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
