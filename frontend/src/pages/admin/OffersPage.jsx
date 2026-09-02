import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { Gift } from 'lucide-react';

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/offers').then(res => setOffers(res.data.offers)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading offers..." />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Offers</h1>
          <p className="text-gray-400 text-sm">{offers.length} offers generated</p>
        </div>

        {offers.length === 0 ? (
          <EmptyState icon={Gift} title="No offers yet" description="Offers are auto-generated when students pass all rounds" />
        ) : (
          <Card hover={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-surface-600">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">Branch</th>
                    <th className="pb-3 pr-4">Company</th>
                    <th className="pb-3 pr-4">CTC (LPA)</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o.offer_id} className="border-b border-surface-700/50 text-gray-300 hover:bg-surface-700/30 transition-colors">
                      <td className="py-3 pr-4 font-medium text-white">{o.student?.name}</td>
                      <td className="py-3 pr-4">{o.student?.branch}</td>
                      <td className="py-3 pr-4">{o.application?.drive?.company?.name}</td>
                      <td className="py-3 pr-4">₹{o.final_ctc ? parseFloat(o.final_ctc).toFixed(1) : '-'}</td>
                      <td className="py-3 pr-4"><Badge status={o.offer_status} /></td>
                      <td className="py-3 text-gray-400">{new Date(o.offer_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
