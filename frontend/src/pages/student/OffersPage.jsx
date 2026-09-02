import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { Trophy, IndianRupee, Building2 } from 'lucide-react';

export default function StudentOffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);

  const fetchOffers = () => {
    api.get('/student/offers').then(res => setOffers(res.data.offers)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOffers(); }, []);

  const respondToOffer = async (offerId, status) => {
    setResponding(offerId);
    try {
      await api.put(`/student/offers/${offerId}`, { offer_status: status });
      toast.success(`Offer ${status.toLowerCase()}`);
      fetchOffers();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setResponding(null); }
  };

  if (loading) return <LoadingSpinner text="Loading offers..." />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">My Offers</h1>
          <p className="text-gray-400 text-sm">{offers.length} offer(s) received</p>
        </div>

        {offers.length === 0 ? (
          <EmptyState icon={Trophy} title="No offers yet" description="Offers will appear here once you're selected in a drive" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offers.map((o, i) => (
              <motion.div key={o.offer_id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-accent-500/15 flex items-center justify-center">
                        <Building2 size={20} className="text-accent-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{o.application?.drive?.company?.name}</h3>
                        <p className="text-sm text-gray-400">{o.application?.drive?.role_offered}</p>
                      </div>
                    </div>
                    <Badge status={o.offer_status} />
                  </div>

                  <div className="flex items-center gap-2 text-lg font-bold text-white">
                    <IndianRupee size={18} /> ₹{o.final_ctc ? parseFloat(o.final_ctc).toFixed(1) : '-'} LPA
                  </div>

                  <p className="text-xs text-gray-500">Offered on {new Date(o.offer_date).toLocaleDateString()}</p>

                  {o.offer_status === 'Pending' && (
                    <div className="flex gap-3">
                      <Button onClick={() => respondToOffer(o.offer_id, 'Accepted')} loading={responding === o.offer_id} variant="success" className="flex-1">
                        Accept
                      </Button>
                      <Button onClick={() => respondToOffer(o.offer_id, 'Declined')} variant="danger" className="flex-1">
                        Decline
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
