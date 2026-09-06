import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  CalendarCheck, Calendar, Clock, Filter, Plus, Search, 
  CheckCircle2, XCircle, AlertCircle, History, X, Check, FileSpreadsheet
} from 'lucide-react';

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDate, setSelectedDate] = useState('2026-09-06');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Modals
  const [isMarkModalOpen, setIsMarkModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState(null);

  const [markForm, setMarkForm] = useState({
    employee_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    check_in_time: '09:00',
    check_out_time: '17:30',
    status: 'Present',
    notes: ''
  });

  const [markError, setMarkError] = useState('');

  // Fetch initial active employee dropdown list for modal
  useEffect(() => {
    api.get('/employees?limit=100&status=Active').then(res => setEmployees(res.data.data)).catch(console.error);
  }, []);

  // Fetch Attendance records & Summary
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        api.get('/attendance', {
          params: {
            date: selectedDate,
            status: statusFilter,
            department: departmentFilter,
            search,
            page,
            limit: 10
          }
        }),
        api.get('/attendance/summary', { params: { date: selectedDate } })
      ]);

      setRecords(recordsRes.data.data);
      setPagination(recordsRes.data.pagination);
      setSummary(summaryRes.data.data);
    } catch (err) {
      console.error('Error loading attendance logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate, statusFilter, departmentFilter, search, page]);

  // Handle Mark Attendance Submit
  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    setMarkError('');
    try {
      await api.post('/attendance', markForm);
      setIsMarkModalOpen(false);
      fetchAttendanceData();
    } catch (err) {
      setMarkError(err.response?.data?.message || 'Failed to record attendance');
    }
  };

  const openHistoryModal = async (empId) => {
    try {
      const res = await api.get(`/attendance/employee/${empId}`);
      setHistoryData(res.data.data);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const openMarkModalForEmployee = (empId = '') => {
    setMarkForm({
      employee_id: empId || (employees[0]?.id || ''),
      attendance_date: selectedDate || new Date().toISOString().split('T')[0],
      check_in_time: '09:00',
      check_out_time: '17:30',
      status: 'Present',
      notes: ''
    });
    setMarkError('');
    setIsMarkModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Attendance Management</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Daily check-in / check-out logs and employee attendance tracking
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openMarkModalForEmployee()}>
          <Plus size={18} />
          <span>Mark Attendance</span>
        </button>
      </div>

      {/* Summary Metrics Bar */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Logged</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{summary.totalRecordsLogged}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Present</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>{summary.present}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Late</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>{summary.late}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Absent</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>{summary.absent}</div>
          </div>
          <div className="glass-card" style={{ padding: '16px', textAlign: 'center', background: 'rgba(99, 102, 241, 0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginBottom: '4px' }}>Attendance Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8' }}>{summary.attendancePercentage}%</div>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} color="#818cf8" />
          <input 
            type="date" 
            className="form-input" 
            style={{ width: '170px' }}
            value={selectedDate} 
            onChange={(e) => { setSelectedDate(e.target.value); setPage(1); }}
          />
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search employee..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <select 
            className="form-select" 
            style={{ width: '150px' }}
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Half Day">Half Day</option>
            <option value="Leave">Leave</option>
          </select>
        </div>
      </div>

      {/* Attendance Logs Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
                <th>Notes</th>
                <th style={{ textAlign: 'right' }}>History</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading attendance records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No attendance records logged for this date/filter.
                  </td>
                </tr>
              ) : (
                records.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{rec.attendance_date}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#a5b4fc' }}>{rec.employee_code}</td>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>{rec.employee_name}</td>
                    <td>{rec.department}</td>
                    <td style={{ color: rec.check_in_time ? '#10b981' : 'var(--text-dim)' }}>
                      {rec.check_in_time || '--:--'}
                    </td>
                    <td style={{ color: rec.check_out_time ? '#38bdf8' : 'var(--text-dim)' }}>
                      {rec.check_out_time || '--:--'}
                    </td>
                    <td>
                      <span className={`badge badge-${rec.status.toLowerCase().replace(' ', '')}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{rec.notes || '-'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openHistoryModal(rec.employee_id)} title="View Employee History">
                        <History size={14} color="#8b5cf6" />
                        <span>Logs</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div>
            Showing page <strong style={{ color: '#fff' }}>{page}</strong> of <strong style={{ color: '#fff' }}>{pagination.totalPages}</strong> ({pagination.total} total logs)
          </div>
          <div className="pagination-controls">
            <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </button>
            <button className="btn btn-secondary btn-sm" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Mark Attendance Modal */}
      {isMarkModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Mark Employee Attendance</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsMarkModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleMarkSubmit}>
              <div className="modal-body">
                {markError && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {markError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Select Employee *</label>
                  <select 
                    className="form-select" 
                    value={markForm.employee_id} 
                    onChange={e => setMarkForm({...markForm, employee_id: e.target.value})}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.employee_code} - {e.first_name} {e.last_name} ({e.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Attendance Date *</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={markForm.attendance_date} 
                      onChange={e => setMarkForm({...markForm, attendance_date: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Attendance Status *</label>
                    <select 
                      className="form-select" 
                      value={markForm.status} 
                      onChange={e => setMarkForm({...markForm, status: e.target.value})}
                    >
                      <option value="Present">Present</option>
                      <option value="Late">Late</option>
                      <option value="Absent">Absent</option>
                      <option value="Half Day">Half Day</option>
                      <option value="Leave">Leave</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Check-In Time</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="09:00" 
                      value={markForm.check_in_time} 
                      onChange={e => setMarkForm({...markForm, check_in_time: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Check-Out Time</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="17:30" 
                      value={markForm.check_out_time} 
                      onChange={e => setMarkForm({...markForm, check_out_time: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks / Notes</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. On-time check in or reason for leave" 
                    value={markForm.notes} 
                    onChange={e => setMarkForm({...markForm, notes: e.target.value})} 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsMarkModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>Save Attendance</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Attendance History Modal */}
      {isHistoryModalOpen && historyData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Attendance History</h3>
                <p style={{ fontSize: '0.8rem', color: '#a5b4fc', margin: 0 }}>
                  {historyData.employee.name} ({historyData.employee.employee_code}) - {historyData.employee.department}
                </p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsHistoryModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="table-container" style={{ maxHeight: '350px' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.history.length === 0 ? (
                      <tr><td colSpan="5" style={{ textAlign: 'center' }}>No log history recorded.</td></tr>
                    ) : (
                      historyData.history.map(h => (
                        <tr key={h.id}>
                          <td style={{ fontWeight: 600 }}>{h.attendance_date}</td>
                          <td>{h.check_in_time || '-'}</td>
                          <td>{h.check_out_time || '-'}</td>
                          <td>
                            <span className={`badge badge-${h.status.toLowerCase().replace(' ', '')}`}>{h.status}</span>
                          </td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{h.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsHistoryModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
