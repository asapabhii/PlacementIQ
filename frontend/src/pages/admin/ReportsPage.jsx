import { useState } from 'react';
import api from '../../api/axios';
import PageTransition from '../../components/ui/PageTransition';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Select } from '../../components/ui/FormControls';
import toast from 'react-hot-toast';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';

export default function ReportsPage() {
  const [batchYear, setBatchYear] = useState('');
  const [branch, setBranch] = useState('');
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);

  const downloadReport = async (type) => {
    const setter = type === 'pdf' ? setLoadingPdf : setLoadingExcel;
    setter(true);
    try {
      const params = new URLSearchParams();
      if (batchYear) params.append('batch_year', batchYear);
      if (branch) params.append('branch', branch);

      const endpoint = type === 'pdf' ? '/reports/placement-pdf' : '/reports/placement-excel';
      const res = await api.get(`${endpoint}?${params.toString()}`, { responseType: 'blob' });

      const ext = type === 'pdf' ? 'pdf' : 'xlsx';
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PlacementReport_${batchYear || 'All'}_${branch || 'All'}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${type.toUpperCase()} report downloaded`);
    } catch (err) {
      toast.error('Failed to generate report');
    } finally { setter(false); }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Exports</h1>
          <p className="text-gray-400 text-sm">Generate placement reports in PDF or Excel format</p>
        </div>

        <Card hover={false} className="space-y-5">
          <h3 className="font-semibold text-white">Filter Options</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Batch Year" value={batchYear} onChange={e => setBatchYear(e.target.value)}>
              <option value="">All Years</option>
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
            <Select label="Branch" value={branch} onChange={e => setBranch(e.target.value)}>
              <option value="">All Branches</option>
              {['BCA', 'CSE', 'ECE', 'ME'].map(b => <option key={b} value={b}>{b}</option>)}
            </Select>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="text-center space-y-4">
            <div className="w-14 h-14 rounded-xl bg-danger-500/15 flex items-center justify-center mx-auto">
              <FileText size={28} className="text-danger-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">PDF Report</h3>
              <p className="text-sm text-gray-400 mt-1">Download formatted placement report as PDF</p>
            </div>
            <Button onClick={() => downloadReport('pdf')} loading={loadingPdf} className="w-full">
              <Download size={16} /> Download PDF
            </Button>
          </Card>

          <Card className="text-center space-y-4">
            <div className="w-14 h-14 rounded-xl bg-success-500/15 flex items-center justify-center mx-auto">
              <FileSpreadsheet size={28} className="text-success-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg">Excel Report</h3>
              <p className="text-sm text-gray-400 mt-1">Download detailed spreadsheet with all student data</p>
            </div>
            <Button onClick={() => downloadReport('excel')} loading={loadingExcel} variant="success" className="w-full">
              <Download size={16} /> Download Excel
            </Button>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
