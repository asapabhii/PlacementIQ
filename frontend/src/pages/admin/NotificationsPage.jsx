import { useState, useEffect } from 'react';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Textarea } from '../../components/ui/FormControls';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import { Send, Bell, Users } from 'lucide-react';

export default function AdminNotificationsPage() {
  const [message, setMessage] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState('all');
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/students').then(res => setStudents(res.data.students)).catch(console.error).finally(() => setStudentsLoading(false));
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return toast.error('Message is required');
    setLoading(true);
    try {
      const student_ids = selectedIds === 'all' ? 'all' : selectedIds;
      await api.post('/admin/notifications', { student_ids, message });
      toast.success('Notification sent!');
      setMessage('');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Send Notifications</h1>
          <p className="text-gray-400 text-sm">Broadcast messages to students</p>
        </div>

        <Card hover={false} className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-primary-500/15">
              <Bell size={18} className="text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Compose Notification</h3>
              <p className="text-xs text-gray-400">This will be sent to {selectedIds === 'all' ? 'all students' : `selected students`}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setSelectedIds('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedIds === 'all' ? 'bg-primary-600 text-white' : 'bg-surface-700 text-gray-400 hover:text-gray-200'
              }`}>
              <Users size={14} /> All Students ({students.length})
            </button>
          </div>

          <Textarea label="Message" placeholder="Type your notification message..." value={message} onChange={e => setMessage(e.target.value)} />

          <div className="flex justify-end">
            <Button onClick={handleSend} loading={loading}>
              <Send size={16} /> Send Notification
            </Button>
          </div>
        </Card>
      </div>
    </PageTransition>
  );
}
