import { useEffect, useRef, useState } from 'react';
import { LayoutDashboard, MessageSquare, Package, RotateCcw, ShoppingCart, Star, Tag, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/client';
import DashLayout from '../components/DashLayout';

const ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/returns', label: 'Returns and refunds', icon: RotateCcw },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/users', label: 'Users and sellers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
];

/** Polls for new confirmed orders so the admin sees them without refreshing. */
export default function AdminShell() {
  const [newCount, setNewCount] = useState(0);
  const [retCount, setRetCount] = useState(0);
  const last = useRef(null);

  useEffect(() => {
    let stop = false;
    const tick = async () => {
      try {
        const { data } = await api.get('/api/admin/orders/alerts');
        if (stop) return;
        setNewCount(data.newOrders);
        setRetCount(data.pendingReturns || 0);
        if (last.current !== null && data.totalOrders > last.current) {
          const n = data.totalOrders - last.current;
          toast(`${n} new order${n > 1 ? 's' : ''} received`, { icon: '🛍️', duration: 6000 });
          window.dispatchEvent(new Event('orders:changed'));
        }
        last.current = data.totalOrders;
      } catch { /* ignore transient errors */ }
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  return <DashLayout role="ADMIN" items={ITEMS} badges={{ '/admin/orders': newCount, '/admin/returns': retCount }} />;
}
