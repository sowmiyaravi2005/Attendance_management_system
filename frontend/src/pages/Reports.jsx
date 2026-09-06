import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, Filter, Calendar, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export default function Reports() {
  const [departments, setDepartments] = useState([]);
  const [startDate, setStartDate] = useState('2026-09-01');
  const [endDate, setEndDate] = useState('2026-09-06');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [previewData, setPreviewData] = useState([]);

  useEffect(() => {
    api.get('/employees/departments').then(res => setDepartments(res.data.data)).catch(console.error);
    fetchPreview();
  }, []);

  const fetchPreview = async () => {
    try {
      const res = await api.get('/attendance', {
        params: {
          startDate,
          endDate,
          department: selectedDept,
          status: selectedStatus,
          limit: 10
        }
      });
      setPreviewData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [startDate, endDate, selectedDept, selectedStatus]);

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/reports/export-attendance', {
        params: {
          startDate,
          endDate,
          department: selectedDept,
          status: selectedStatus
        },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download CSV report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Reports & Data Export</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Generate custom CSV / Excel reports for audit and payroll processing
        </p>
      </div>

      {/* Exporter Form Card */}
      <div className="glass-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <FileSpreadsheet size={24} color="#10b981" />
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Attendance Audit Log Exporter</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Configure filters below to download CSV reports</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">End Date</label>
            <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Department Filter</label>
            <select className="form-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Attendance Status</label>
            <select className="form-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
              <option value="Absent">Absent</option>
              <option value="Half Day">Half Day</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>

        <button 
          className="btn btn-primary"
          onClick={handleDownloadCSV}
          disabled={downloading}
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <Download size={18} />
          <span>{downloading ? 'Generating Report...' : 'Download CSV Report'}</span>
        </button>
      </div>

      {/* Live Preview Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Report Sample Preview (First 10 Rows)</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Emp Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {previewData.length === 0 ? (
                <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No records match report parameters.</td></tr>
              ) : (
                previewData.map(row => (
                  <tr key={row.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#a5b4fc' }}>{row.employee_code}</td>
                    <td style={{ fontWeight: 700 }}>{row.employee_name}</td>
                    <td>{row.department}</td>
                    <td>{row.designation}</td>
                    <td>{row.attendance_date}</td>
                    <td style={{ color: '#10b981' }}>{row.check_in_time || 'N/A'}</td>
                    <td style={{ color: '#38bdf8' }}>{row.check_out_time || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${row.status.toLowerCase().replace(' ', '')}`}>{row.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
