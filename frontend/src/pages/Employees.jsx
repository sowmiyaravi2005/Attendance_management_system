import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Users, Plus, Search, Filter, ArrowUpDown, Edit, Trash2, Eye, 
  X, Check, AlertTriangle, Mail, Phone, Building2, Briefcase, Calendar
} from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    designation: '',
    status: 'Active',
    hire_date: new Date().toISOString().split('T')[0]
  });

  const [formError, setFormError] = useState('');

  // Fetch departments list
  useEffect(() => {
    api.get('/employees/departments').then(res => setDepartments(res.data.data)).catch(console.error);
  }, []);

  // Fetch employees on filter changes
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.get('/employees', {
        params: {
          search,
          department: selectedDept,
          status: selectedStatus,
          sortBy,
          order,
          page,
          limit: 8
        }
      });
      setEmployees(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [search, selectedDept, selectedStatus, sortBy, order, page]);

  // Handle Add Form Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/employees', formData);
      setIsAddModalOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create employee');
    }
  };

  // Handle Edit Form Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.put(`/employees/${currentEmployee.id}`, formData);
      setIsEditModalOpen(false);
      resetForm();
      fetchEmployees();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update employee');
    }
  };

  // Handle Delete
  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/employees/${currentEmployee.id}`);
      setIsDeleteModalOpen(false);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (emp) => {
    setCurrentEmployee(emp);
    setFormData({
      employee_code: emp.employee_code,
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      designation: emp.designation,
      status: emp.status,
      hire_date: emp.hire_date
    });
    setFormError('');
    setIsEditModalOpen(true);
  };

  const openViewModal = async (emp) => {
    try {
      const res = await api.get(`/employees/${emp.id}`);
      setCurrentEmployee(res.data.data);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const openDeleteModal = (emp) => {
    setCurrentEmployee(emp);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      employee_code: `EMP${Math.floor(100 + Math.random() * 900)}`,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: 'Engineering',
      designation: '',
      status: 'Active',
      hire_date: new Date().toISOString().split('T')[0]
    });
    setFormError('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Employee Directory</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Manage staff profiles, department assignments, and status
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <Plus size={18} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '40px' }}
            placeholder="Search by name, email, code..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <select 
            className="form-select" 
            style={{ width: '180px' }}
            value={selectedDept} 
            onChange={(e) => { setSelectedDept(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select 
            className="form-select" 
            style={{ width: '150px' }}
            value={selectedStatus} 
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button 
            className="btn btn-secondary"
            onClick={() => { setOrder(order === 'ASC' ? 'DESC' : 'ASC'); }}
            title="Toggle Sort Order"
          >
            <ArrowUpDown size={16} />
            <span>Sort: {order}</span>
          </button>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="glass-card">
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Email & Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Loading employee database...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No employees found matching criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#a5b4fc' }}>{emp.employee_code}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{emp.first_name} {emp.last_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Hired {emp.hire_date}</div>
                    </td>
                    <td>{emp.department}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{emp.designation}</td>
                    <td>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{emp.email}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{emp.phone}</div>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openViewModal(emp)} title="View Profile">
                          <Eye size={14} color="#06b6d4" />
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(emp)} title="Edit Employee">
                          <Edit size={14} color="#6366f1" />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(emp)} title="Delete Employee">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="pagination">
          <div>
            Showing page <strong style={{ color: '#fff' }}>{page}</strong> of <strong style={{ color: '#fff' }}>{pagination.totalPages}</strong> ({pagination.total} total employees)
          </div>
          <div className="pagination-controls">
            <button 
              className="btn btn-secondary btn-sm"
              disabled={page <= 1} 
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </button>
            <button 
              className="btn btn-secondary btn-sm"
              disabled={page >= pagination.totalPages} 
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Employee Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                {isAddModalOpen ? 'Add New Employee' : `Edit Employee - ${currentEmployee?.employee_code}`}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleAddSubmit : handleEditSubmit}>
              <div className="modal-body">
                {formError && (
                  <div style={{ background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', padding: '10px 14px', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '16px' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Employee Code *</label>
                    <input type="text" className="form-input" value={formData.employee_code} onChange={e => setFormData({...formData, employee_code: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status *</label>
                    <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input type="text" className="form-input" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input type="text" className="form-input" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <input type="text" className="form-input" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required placeholder="e.g. Engineering" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation *</label>
                    <input type="text" className="form-input" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} required placeholder="e.g. Software Engineer" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Date of Joining *</label>
                  <input type="date" className="form-input" value={formData.hire_date} onChange={e => setFormData({...formData, hire_date: e.target.value})} required />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Check size={16} />
                  <span>{isAddModalOpen ? 'Save Employee' : 'Update Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} />
                <span>Confirm Deletion</span>
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsDeleteModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Are you sure you want to delete <strong style={{ color: '#fff' }}>{currentEmployee?.first_name} {currentEmployee?.last_name}</strong> ({currentEmployee?.employee_code})?
                This action will remove all historical attendance records as well.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDeleteSubmit}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && currentEmployee && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>
                  {currentEmployee.first_name?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>{currentEmployee.first_name} {currentEmployee.last_name}</h3>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#a5b4fc' }}>{currentEmployee.employee_code}</span>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setIsViewModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Department & Role</div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentEmployee.department}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentEmployee.designation}</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Contact Info</div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{currentEmployee.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{currentEmployee.phone}</div>
                </div>
              </div>

              {/* Attendance Stats Summary */}
              {currentEmployee.attendanceStats && (
                <div style={{ background: 'rgba(99, 102, 241, 0.08)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: '#a5b4fc' }}>Attendance Performance</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{currentEmployee.attendanceStats.attendancePercentage}%</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Attendance %</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{currentEmployee.attendanceStats.presentDays}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Days Present</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{currentEmployee.attendanceStats.lateDays}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Late Days</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsViewModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
