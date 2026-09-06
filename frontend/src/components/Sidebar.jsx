import React from 'react';
import { LayoutDashboard, Users, CalendarCheck, FileText, Code2, ExternalLink } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance', label: 'Attendance Logs', icon: CalendarCheck },
    { id: 'reports', label: 'Export Reports', icon: FileText },
  ];

  return (
    <aside style={{
      width: '260px',
      minHeight: 'calc(100vh - 70px)',
      background: 'rgba(11, 15, 25, 0.7)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 12px 12px' }}>
          Main Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)' 
                  : 'transparent',
                color: isActive ? '#a5b4fc' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={18} color={isActive ? '#818cf8' : '#94a3b8'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* API Documentation Link Section */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '14px',
        padding: '16px',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Code2 size={18} color="#6366f1" />
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>Swagger REST API</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.4 }}>
          Interactive OpenAPI documentation & endpoint specs.
        </p>
        <a 
          href="http://localhost:5000/api-docs" 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.775rem' }}
        >
          <span>Open API Docs</span>
          <ExternalLink size={12} />
        </a>
      </div>
    </aside>
  );
}
