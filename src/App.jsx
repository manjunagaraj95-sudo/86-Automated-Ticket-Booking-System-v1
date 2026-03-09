
import React, { useState, useEffect } from 'react';

// --- Global Configuration & RBAC ---
const ROLES = {
  EVENT_MANAGER: 'EVENT_MANAGER',
  CUSTOMER: 'CUSTOMER',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
};

// Simulate current user role
const currentUserRole = ROLES.EVENT_MANAGER; // Can be changed to test different roles

const ROLE_BASED_UI = {
  [ROLES.EVENT_MANAGER]: {
    canCreateEvent: true,
    canEditEvent: true,
    canApproveTicket: true,
    canViewAllTickets: true,
    canViewAuditLogs: true,
    dashboardSections: ['KPIs', 'MyEvents', 'PendingApprovals'],
  },
  [ROLES.CUSTOMER]: {
    canCreateEvent: false,
    canEditEvent: false,
    canApproveTicket: false,
    canViewAllTickets: false,
    canBookTicket: true,
    dashboardSections: ['MyBookings', 'UpcomingEvents'],
  },
  [ROLES.SYSTEM_ADMIN]: {
    canCreateEvent: true,
    canEditEvent: true,
    canApproveTicket: true,
    canViewAllTickets: true,
    canViewAuditLogs: true,
    canManageUsers: true,
    dashboardSections: ['KPIs', 'AllEvents', 'SystemHealth', 'AuditOverview'],
  },
};

// --- Sample Data ---
const sampleEvents = [
  {
    id: 'EVT001',
    name: 'Tech Innovate Summit 2024',
    date: '2024-10-26',
    location: 'Virtual',
    status: 'Approved',
    ticketsSold: 1250,
    totalTickets: 2000,
    revenue: 125000,
    description: 'A global summit showcasing the latest in AI, blockchain, and sustainable tech.',
    workflow: [
      { name: 'Drafted', status: 'completed', date: '2024-01-15', sla: null },
      { name: 'Reviewed', status: 'completed', date: '2024-02-10', sla: null },
      { name: 'Approved', status: 'active', date: '2024-02-28', sla: 'Due by 2024-03-05' },
      { name: 'Published', status: 'pending', date: null, sla: null },
      { name: 'Completed', status: 'pending', date: null, sla: null },
    ],
    relatedTickets: [
      { id: 'TKT001', customer: 'Alex Johnson', status: 'Approved' },
      { id: 'TKT002', customer: 'Maria Garcia', status: 'Pending' },
    ],
    documents: [{ name: 'Event Brief.pdf', url: '#' }, { name: 'Marketing Plan.docx', url: '#' }],
  },
  {
    id: 'EVT002',
    name: 'Annual Charity Run',
    date: '2024-09-15',
    location: 'City Park',
    status: 'In Progress',
    ticketsSold: 320,
    totalTickets: 500,
    revenue: 6400,
    description: 'Run for a cause! All proceeds go to local charities.',
    workflow: [
      { name: 'Drafted', status: 'completed', date: '2024-03-01', sla: null },
      { name: 'Reviewed', status: 'active', date: '2024-03-10', sla: 'Due by 2024-03-12' },
      { name: 'Approved', status: 'pending', date: null, sla: null },
      { name: 'Published', status: 'pending', date: null, sla: null },
      { name: 'Completed', status: 'pending', date: null, sla: null },
    ],
    relatedTickets: [
      { id: 'TKT003', customer: 'John Doe', status: 'Approved' },
      { id: 'TKT004', customer: 'Jane Smith', status: 'In Progress' },
    ],
    documents: [{ name: 'Race Route.pdf', url: '#' }],
  },
  {
    id: 'EVT003',
    name: 'Music Fest Summer Jam',
    date: '2024-08-01',
    location: 'Open Air Arena',
    status: 'Pending',
    ticketsSold: 0,
    totalTickets: 10000,
    revenue: 0,
    description: 'Three days of non-stop music from top artists.',
    workflow: [
      { name: 'Drafted', status: 'completed', date: '2024-01-20', sla: null },
      { name: 'Reviewed', status: 'completed', date: '2024-02-05', sla: null },
      { name: 'Approved', status: 'pending', date: null, sla: 'Overdue by 5 days' }, // SLA breach example
      { name: 'Published', status: 'pending', date: null, sla: null },
      { name: 'Completed', status: 'pending', date: null, sla: null },
    ],
    relatedTickets: [],
    documents: [],
  },
  {
    id: 'EVT004',
    name: 'Cooking Masterclass',
    date: '2024-07-20',
    location: 'Culinary Institute',
    status: 'Rejected',
    ticketsSold: 0,
    totalTickets: 50,
    revenue: 0,
    description: 'Learn gourmet cooking from award-winning chefs.',
    workflow: [
      { name: 'Drafted', status: 'completed', date: '2024-04-01', sla: null },
      { name: 'Reviewed', status: 'completed', date: '2024-04-10', sla: null },
      { name: 'Approved', status: 'rejected', date: '2024-04-15', sla: null },
      { name: 'Published', status: 'pending', date: null, sla: null },
      { name: 'Completed', status: 'pending', date: null, sla: null },
    ],
    relatedTickets: [],
    documents: [],
  },
];

const sampleTickets = [
  { id: 'TKT001', eventId: 'EVT001', customerName: 'Alex Johnson', email: 'alex@example.com', quantity: 2, status: 'Approved', bookingDate: '2024-03-01', price: 100, paymentStatus: 'Paid' },
  { id: 'TKT002', eventId: 'EVT001', customerName: 'Maria Garcia', email: 'maria@example.com', quantity: 1, status: 'Pending', bookingDate: '2024-03-02', price: 50, paymentStatus: 'Pending' },
  { id: 'TKT003', eventId: 'EVT002', customerName: 'John Doe', email: 'john@example.com', quantity: 3, status: 'Approved', bookingDate: '2024-03-05', price: 60, paymentStatus: 'Paid' },
  { id: 'TKT004', eventId: 'EVT002', customerName: 'Jane Smith', email: 'jane@example.com', quantity: 1, status: 'In Progress', bookingDate: '2024-03-06', price: 20, paymentStatus: 'Refund Processing' },
];

const sampleAuditLogs = [
  { id: 'AL001', recordId: 'EVT001', recordType: 'Event', action: 'Created', user: 'Lisa Green (Event Manager)', timestamp: '2024-01-15T10:00:00Z', details: 'Initial event draft created for Tech Innovate Summit.' },
  { id: 'AL002', recordId: 'EVT001', recordType: 'Event', action: 'Reviewed', user: 'Sarah Admin (System Admin)', timestamp: '2024-02-10T11:30:00Z', details: 'Event details reviewed and sent for approval.' },
  { id: 'AL003', recordId: 'EVT001', recordType: 'Event', action: 'Approved', user: 'Lisa Green (Event Manager)', timestamp: '2024-02-28T14:00:00Z', details: 'Event approved by manager. Ready for publishing.' },
  { id: 'AL004', recordId: 'TKT001', recordType: 'Ticket', action: 'Booked', user: 'Alex Johnson (Customer)', timestamp: '2024-03-01T15:00:00Z', details: 'Ticket TKT001 booked for EVT001.' },
  { id: 'AL005', recordId: 'EVT003', recordType: 'Event', action: 'Approval Overdue', user: 'System', timestamp: '2024-03-10T08:00:00Z', details: 'Approval for Music Fest Summer Jam is overdue by 5 days.' },
  { id: 'AL006', recordId: 'EVT004', recordType: 'Event', action: 'Rejected', user: 'Sarah Admin (System Admin)', timestamp: '2024-04-15T09:15:00Z', details: 'Event Cooking Masterclass rejected due to budget constraints.' },
];

// --- Helper Functions ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const getStatusClassName = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'status-approved';
    case 'in progress':
      return 'status-in-progress';
    case 'pending':
      return 'status-pending';
    case 'rejected':
      return 'status-rejected';
    case 'exception':
      return 'status-exception';
    default:
      return '';
  }
};

// --- App Component ---
function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [globalFilters, setGlobalFilters] = useState({}); // For dashboard-level filters
  const [formData, setFormData] = useState({}); // For forms (conceptual)

  // Handlers
  const handleCardClick = (screen, params) => {
    setView({ screen, params });
  };

  const handleBackClick = () => {
    if (view.screen === 'DETAIL' || view.screen === 'EDIT_FORM') {
      setView({ screen: 'DASHBOARD', params: {} });
    }
  };

  const handleGlobalSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      const results = [
        ...sampleEvents.filter(event => event.name?.toLowerCase().includes(query.toLowerCase())).map(event => ({ type: 'Event', id: event.id, name: event.name })),
        ...sampleTickets.filter(ticket => ticket.customerName?.toLowerCase().includes(query.toLowerCase()) || ticket.id?.toLowerCase().includes(query.toLowerCase())).map(ticket => ({ type: 'Ticket', id: ticket.id, name: `${ticket.customerName} - ${ticket.id}` })),
      ];
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSuggestionClick = (type, id) => {
    setSearchQuery('');
    setSearchResults([]);
    if (type === 'Event') {
      handleCardClick('DETAIL', { type: 'Event', id });
    } else if (type === 'Ticket') {
      handleCardClick('DETAIL', { type: 'Ticket', id });
    }
  };

  const handleEditRecord = (type, id) => {
    // Simulate loading data into form
    if (type === 'Event') {
      const event = sampleEvents.find(e => e.id === id);
      setFormData(event || {});
    } else if (type === 'Ticket') {
      const ticket = sampleTickets.find(t => t.id === id);
      setFormData(ticket || {});
    }
    setView({ screen: 'EDIT_FORM', params: { type, id } });
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    // Simulate form submission (e.g., update state, return to detail view)
    console.log('Form submitted with:', formData);
    // In a real app, you'd update sampleData here and navigate back
    if (view.params.type === 'Event') {
      // Update event in sampleEvents (immutably)
      const updatedEvents = sampleEvents.map(evt => evt.id === view.params.id ? { ...evt, ...formData } : evt);
      // This is a simplified update, in a real app, this would trigger a state update
      // setSampleEvents(updatedEvents);
      handleCardClick('DETAIL', { type: 'Event', id: view.params.id });
    } else if (view.params.type === 'Ticket') {
      // Update ticket in sampleTickets (immutably)
      const updatedTickets = sampleTickets.map(tkt => tkt.id === view.params.id ? { ...tkt, ...formData } : tkt);
      // setSampleTickets(updatedTickets);
      handleCardClick('DETAIL', { type: 'Ticket', id: view.params.id });
    }
    setFormData({});
  };

  // Components (Inline for simplicity as per request, but can be extracted)
  const DashboardScreen = () => {
    const userPermissions = ROLE_BASED_UI[currentUserRole];
    const availableEvents = currentUserRole === ROLES.CUSTOMER
      ? sampleEvents.filter(e => e.status === 'Approved' || e.status === 'In Progress')
      : sampleEvents;

    const ticketsForUser = currentUserRole === ROLES.CUSTOMER
      ? sampleTickets.filter(t => t.customerName === 'Alex Johnson') // Simulate Alex's bookings
      : sampleTickets;

    return (
      <div className="main-content">
        <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Welcome, {currentUserRole === ROLES.EVENT_MANAGER ? 'Lisa' : currentUserRole === ROLES.CUSTOMER ? 'Alex' : 'Sarah'}!</h1>

        {userPermissions.dashboardSections.includes('KPIs') && (
          <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Key Performance Indicators</h2>
            <div className="dashboard-grid mb-xl">
              <div className="card kpi-card kpi-pulse-animation">
                <div className="kpi-title">Total Events</div>
                <div className="kpi-value">{sampleEvents.length}</div>
                <div className="kpi-trend positive">▲ 5% last month</div>
                <div className="chart-placeholder">Bar Chart</div>
              </div>
              <div className="card kpi-card kpi-pulse-animation">
                <div className="kpi-title">Tickets Sold</div>
                <div className="kpi-value">{sampleEvents.reduce((acc, e) => acc + (e.ticketsSold || 0), 0)}</div>
                <div className="kpi-trend positive">▲ 12% last month</div>
                <div className="chart-placeholder">Line Chart</div>
              </div>
              <div className="card kpi-card kpi-pulse-animation">
                <div className="kpi-title">Total Revenue</div>
                <div className="kpi-value">{formatCurrency(sampleEvents.reduce((acc, e) => acc + (e.revenue || 0), 0))}</div>
                <div className="kpi-trend positive">▲ 8% last month</div>
                <div className="chart-placeholder">Donut Chart</div>
              </div>
              {currentUserRole === ROLES.SYSTEM_ADMIN && (
                <div className="card kpi-card kpi-pulse-animation">
                  <div className="kpi-title">SLA Compliance</div>
                  <div className="kpi-value">95%</div>
                  <div className="kpi-trend negative">▼ 2% last month</div>
                  <div className="chart-placeholder">Gauge Chart</div>
                </div>
              )}
            </div>
          </>
        )}

        {userPermissions.dashboardSections.includes('MyEvents') && (
          <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>My Events</h2>
            <div className="dashboard-grid mb-xl">
              {availableEvents.length > 0 ? (
                availableEvents.map(event => (
                  <div key={event.id} className="card" onClick={() => handleCardClick('DETAIL', { type: 'Event', id: event.id })}>
                    <div className={getStatusClassName(event.status)} style={{ display: 'inline-block', marginBottom: 'var(--spacing-sm)' }}>
                      {event.status}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xs)' }}>{event.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{formatDate(event.date)} - {event.location}</p>
                    <p>Tickets Sold: {event.ticketsSold}/{event.totalTickets}</p>
                    {event.status === 'Pending' && (
                        <div style={{ color: 'var(--error-color)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                            <span className="icon icon-sm">⚠️</span> Approval pending
                        </div>
                    )}
                    <div style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', display: 'none' }} className="card-hover-actions">
                      {userPermissions.canEditEvent && (
                        <button className="button button-secondary" onClick={(e) => { e.stopPropagation(); handleEditRecord('Event', event.id); }}>Edit</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon">🎟️</span>
                  <div className="empty-state-title">No Events Found</div>
                  <div className="empty-state-description">It looks like you haven't created or been assigned any events yet.</div>
                  {userPermissions.canCreateEvent && (
                    <button className="button button-primary" onClick={() => handleEditRecord('Event', 'new')}>
                      Create New Event
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {userPermissions.dashboardSections.includes('MyBookings') && (
          <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>My Bookings</h2>
            <div className="dashboard-grid mb-xl">
              {ticketsForUser.length > 0 ? (
                ticketsForUser.map(ticket => (
                  <div key={ticket.id} className="card" onClick={() => handleCardClick('DETAIL', { type: 'Ticket', id: ticket.id })}>
                    <div className={getStatusClassName(ticket.status)} style={{ display: 'inline-block', marginBottom: 'var(--spacing-sm)' }}>
                      {ticket.status}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xs)' }}>Ticket {ticket.id} for {sampleEvents.find(e => e.id === ticket.eventId)?.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Customer: {ticket.customerName}</p>
                    <p>Quantity: {ticket.quantity} | Total: {formatCurrency(ticket.price * ticket.quantity)}</p>
                    <div style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', display: 'none' }} className="card-hover-actions">
                      <button className="button button-secondary" onClick={(e) => { e.stopPropagation(); handleEditRecord('Ticket', ticket.id); }}>View Details</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon">🎫</span>
                  <div className="empty-state-title">No Bookings Found</div>
                  <div className="empty-state-description">You haven't booked any tickets yet. Explore upcoming events!</div>
                  <button className="button button-primary" onClick={() => {/* navigate to events listing */}}>
                    Explore Events
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {userPermissions.dashboardSections.includes('PendingApprovals') && (
          <>
            <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>Pending Approvals</h2>
            <div className="dashboard-grid mb-xl">
              {sampleEvents.filter(e => e.status === 'Pending').length > 0 ? (
                sampleEvents.filter(e => e.status === 'Pending').map(event => (
                  <div key={event.id} className="card" onClick={() => handleCardClick('DETAIL', { type: 'Event', id: event.id })}>
                    <div className={getStatusClassName(event.status)} style={{ display: 'inline-block', marginBottom: 'var(--spacing-sm)' }}>
                      {event.status}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xs)' }}>{event.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{formatDate(event.date)} - {event.location}</p>
                    <p style={{ color: 'var(--error-color)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                        <span className="icon icon-sm">⚠️</span> Action Required
                    </p>
                    <div style={{ position: 'absolute', top: 'var(--spacing-md)', right: 'var(--spacing-md)', display: 'none' }} className="card-hover-actions">
                      {userPermissions.canApproveTicket && ( // Assuming approval logic extends to events
                        <button className="button button-primary" onClick={(e) => { e.stopPropagation(); alert(`Approving ${event.name}`); }}>Approve</button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <span className="empty-state-icon">✅</span>
                  <div className="empty-state-title">No Pending Approvals</div>
                  <div className="empty-state-description">All items are up-to-date and approved.</div>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    );
  };

  const DetailScreen = () => {
    const { type, id } = view.params;
    const isEvent = type === 'Event';
    const record = isEvent
      ? sampleEvents.find(e => e.id === id)
      : sampleTickets.find(t => t.id === id);

    const userPermissions = ROLE_BASED_UI[currentUserRole];

    if (!record) {
      return (
        <div className="main-content">
          <div className="empty-state">
            <span className="empty-state-icon">🚫</span>
            <div className="empty-state-title">Record Not Found</div>
            <div className="empty-state-description">The requested {type?.toLowerCase()} could not be found.</div>
            <button className="button button-primary" onClick={handleBackClick}>Back to Dashboard</button>
          </div>
        </div>
      );
    }

    const recordAuditLogs = sampleAuditLogs.filter(log => log.recordId === id);
    const breadcrumbs = [
      { label: 'Dashboard', onClick: () => handleCardClick('DASHBOARD', {}) },
      { label: `${type}s`, onClick: () => handleCardClick('DASHBOARD', {}) }, // Simplified for now
      { label: record.name || record.id, active: true },
    ];

    const currentWorkflowStage = record?.workflow?.find(stage => stage.status === 'active');
    const slaBreachStages = record?.workflow?.filter(stage => stage.sla?.includes('Overdue'));

    return (
      <div className="main-content">
        <div className="breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={index}>
              {crumb.active ? (
                <span>{crumb.label}</span>
              ) : (
                <a href="#" onClick={crumb.onClick}>{crumb.label}</a>
              )}
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>

        <div className="record-header">
          <div className="record-title">
            {isEvent ? '🎟️' : '🎫'} {record?.name || `Ticket ${record?.id}`}
            <div className={getStatusClassName(record?.status)}>{record?.status}</div>
          </div>
          <div className="record-actions">
            {(isEvent ? userPermissions.canEditEvent : userPermissions.canEditTicket) && (
              <button className="button button-secondary" onClick={() => handleEditRecord(type, id)}>
                Edit {type}
              </button>
            )}
            {currentUserRole === ROLES.EVENT_MANAGER && record?.status === 'Pending' && (
              <button className="button button-primary">
                Approve {type}
              </button>
            )}
            {currentUserRole === ROLES.EVENT_MANAGER && record?.status === 'Approved' && (
              <button className="button button-danger">
                Cancel {type}
              </button>
            )}
          </div>
        </div>

        {record?.workflow && (
          <div className="section-card">
            <h3 className="section-title">Workflow Progress</h3>
            <div className="milestone-tracker">
              {record.workflow.map((stage, index) => (
                <div
                  key={stage.name}
                  className={`milestone-stage ${stage.status === 'completed' ? 'completed' : ''} ${stage.status === 'active' ? 'active' : ''} ${stage.sla?.includes('Overdue') ? 'sla-breach' : ''}`}
                >
                  <div className="milestone-dot"></div>
                  <div className="milestone-title">{stage.name}</div>
                  {stage.sla && <div className="milestone-sla">{stage.sla}</div>}
                </div>
              ))}
            </div>
            {currentWorkflowStage && (
              <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                Current Stage: <strong>{currentWorkflowStage.name}</strong>
                {currentWorkflowStage.sla && <span style={{ marginLeft: 'var(--spacing-sm)' }}> ({currentWorkflowStage.sla})</span>}
              </p>
            )}
          </div>
        )}

        <div className="grid-2-col">
          <div className="section-card">
            <h3 className="section-title">{type} Details</h3>
            <p><strong>ID:</strong> {record?.id}</p>
            <p><strong>Name:</strong> {record?.name || 'N/A'}</p>
            <p><strong>Status:</strong> <span className={getStatusClassName(record?.status)}>{record?.status}</span></p>
            {isEvent ? (
              <>
                <p><strong>Date:</strong> {formatDate(record?.date)}</p>
                <p><strong>Location:</strong> {record?.location}</p>
                <p><strong>Tickets Sold:</strong> {record?.ticketsSold} / {record?.totalTickets}</p>
                <p><strong>Revenue:</strong> {formatCurrency(record?.revenue)}</p>
                <p><strong>Description:</strong> {record?.description}</p>
              </>
            ) : (
              <>
                <p><strong>Event:</strong> {sampleEvents.find(e => e.id === record?.eventId)?.name || 'N/A'}</p>
                <p><strong>Customer:</strong> {record?.customerName}</p>
                <p><strong>Email:</strong> {record?.email}</p>
                <p><strong>Quantity:</strong> {record?.quantity}</p>
                <p><strong>Booking Date:</strong> {formatDate(record?.bookingDate)}</p>
                <p><strong>Price:</strong> {formatCurrency(record?.price)}</p>
                <p><strong>Payment Status:</strong> {record?.paymentStatus}</p>
              </>
            )}
          </div>

          <div className="section-card">
            <h3 className="section-title">News & Audit Feed</h3>
            {recordAuditLogs.length > 0 && userPermissions.canViewAuditLogs ? (
              recordAuditLogs.map(log => (
                <div key={log.id} className="news-feed-item">
                  <div className="news-feed-icon">
                    {log.action === 'Created' && '➕'}
                    {log.action === 'Reviewed' && '👁️'}
                    {log.action === 'Approved' && '✅'}
                    {log.action === 'Rejected' && '❌'}
                    {log.action === 'Booked' && '🎫'}
                    {log.action === 'Approval Overdue' && '🚨'}
                    {!['Created', 'Reviewed', 'Approved', 'Rejected', 'Booked', 'Approval Overdue'].includes(log.action) && '⚙️'}
                  </div>
                  <div className="news-feed-content">
                    <div className="news-feed-meta">
                      {log.user} on {formatDate(log.timestamp)} at {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="news-feed-description">
                      <strong>{log.action}:</strong> {log.details}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ border: 'none', minHeight: '100px', padding: 0 }}>
                <span className="empty-state-icon" style={{ fontSize: 'var(--font-size-xl)' }}>📋</span>
                <div className="empty-state-description" style={{ marginBottom: 0 }}>No audit logs available for this record.</div>
              </div>
            )}
          </div>
        </div>

        {isEvent && record?.relatedTickets && record.relatedTickets.length > 0 && (
          <div className="section-card">
            <h3 className="section-title">Related Tickets</h3>
            {record.relatedTickets.map(ticket => (
              <div key={ticket.id} className="related-record-card" onClick={() => handleCardClick('DETAIL', { type: 'Ticket', id: ticket.id })}>
                <span className="related-record-card-icon icon-md">🎫</span>
                <div>
                  <div className="related-record-card-title">Ticket {ticket.id}</div>
                  <div className="related-record-card-subtitle">{ticket.customer} - <span className={getStatusClassName(ticket.status)} style={{border: 'none', padding: '0 4px', fontSize: 'var(--font-size-xs)'}}>{ticket.status}</span></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {record?.documents && record.documents.length > 0 && (
          <div className="section-card">
            <h3 className="section-title">Documents</h3>
            <div className="grid-2-col">
              {record.documents.map(doc => (
                <div key={doc.name} className="document-preview-placeholder">
                  📄 Document Preview: {doc.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const EditFormScreen = () => {
    const { type, id } = view.params;
    const isNew = id === 'new';
    const currentRecord = isNew
      ? {}
      : (type === 'Event' ? sampleEvents.find(e => e.id === id) : sampleTickets.find(t => t.id === id));

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = (e) => {
      // Simulate file upload
      console.log('File uploaded:', e.target.files[0]?.name);
      alert('File upload simulated!');
    };

    // Simple validation (conceptual)
    const validateField = (fieldName, value) => {
      if (['name', 'date', 'location', 'customerName', 'email', 'quantity'].includes(fieldName) && !value) {
        return 'This field is mandatory.';
      }
      if (fieldName === 'email' && value && !value.includes('@')) {
        return 'Invalid email format.';
      }
      if (fieldName === 'quantity' && value && (isNaN(value) || parseInt(value) <= 0)) {
        return 'Quantity must be a positive number.';
      }
      return null;
    };

    const errors = {};
    Object.keys(formData).forEach(key => {
        const error = validateField(key, formData[key]);
        if (error) errors[key] = error;
    });

    return (
      <div className="main-content" style={{ maxWidth: '800px' }}>
        <div className="breadcrumb">
          <a href="#" onClick={handleBackClick}>Back to {view.params.id ? (view.params.type === 'Event' ? 'Event Details' : 'Ticket Details') : 'Dashboard'}</a>
          <span>/</span>
          <span>{isNew ? `Create New ${type}` : `Edit ${type} ${id}`}</span>
        </div>

        <h1 style={{ marginBottom: 'var(--spacing-lg)' }}>{isNew ? `Create New ${type}` : `Edit ${currentRecord?.name || currentRecord?.id}`}</h1>

        <div className="section-card">
          <form onSubmit={handleSubmitForm}>
            {type === 'Event' ? (
              <>
                <div className="form-group">
                  <label htmlFor="eventName" className="form-label">Event Name <span style={{color: 'var(--error-color)'}}>*</span></label>
                  <input
                    type="text"
                    id="eventName"
                    name="name"
                    className="form-input"
                    value={formData?.name || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Tech Innovate Summit"
                    required
                  />
                  {errors.name && <div className="form-error-message">{errors.name}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="eventDate" className="form-label">Date <span style={{color: 'var(--error-color)'}}>*</span></label>
                  <input
                    type="date"
                    id="eventDate"
                    name="date"
                    className="form-input"
                    value={formData?.date || ''}
                    onChange={handleInputChange}
                    required
                  />
                   {errors.date && <div className="form-error-message">{errors.date}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="eventLocation" className="form-label">Location <span style={{color: 'var(--error-color)'}}>*</span></label>
                  <input
                    type="text"
                    id="eventLocation"
                    name="location"
                    className="form-input"
                    value={formData?.location || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., Virtual, City Park"
                    required
                  />
                   {errors.location && <div className="form-error-message">{errors.location}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="eventDescription" className="form-label">Description</label>
                  <textarea
                    id="eventDescription"
                    name="description"
                    className="form-textarea"
                    value={formData?.description || ''}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Provide a detailed description of the event..."
                  ></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="totalTickets" className="form-label">Total Tickets Available <span style={{color: 'var(--error-color)'}}>*</span></label>
                  <input
                    type="number"
                    id="totalTickets"
                    name="totalTickets"
                    className="form-input"
                    value={formData?.totalTickets || ''}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="e.g., 1000"
                    required
                  />
                   {errors.totalTickets && <div className="form-error-message">{errors.totalTickets}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="eventStatus" className="form-label">Status</label>
                  <select
                    id="eventStatus"
                    name="status"
                    className="form-select"
                    value={formData?.status || 'Draft'}
                    onChange={handleInputChange}
                    disabled={!ROLE_BASED_UI[currentUserRole].canApproveTicket} // Only approver can change final status
                  >
                    <option value="Draft">Draft</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="eventFiles" className="form-label">Event Files (File Upload)</label>
                  <div className="file-upload-area">
                    <input type="file" id="eventFiles" name="eventFiles" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                    <label htmlFor="eventFiles" style={{ cursor: 'pointer', display: 'block', padding: 'var(--spacing-md)' }}>
                      Drag & Drop files here or <u>click to browse</u>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Max file size 10MB</p>
                    </label>
                  </div>
                </div>
              </>
            ) : (
              // Ticket Form (simplified)
              <>
                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">Customer Name <span style={{color: 'var(--error-color)'}}>*</span></label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    className="form-input"
                    value={formData?.customerName || ''}
                    onChange={handleInputChange}
                    required
                  />
                   {errors.customerName && <div className="form-error-message">{errors.customerName}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="customerEmail" className="form-label">Email <span style={{color: 'var(--error-color)'}}>*</span></label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="email"
                    className="form-input"
                    value={formData?.email || ''}
                    onChange={handleInputChange}
                    required
                  />
                   {errors.email && <div className="form-error-message">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="quantity" className="form-label">Quantity <span style={{color: 'var(--error-color)'}}>*</span></label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="form-input"
                    value={formData?.quantity || ''}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                   {errors.quantity && <div className="form-error-message">{errors.quantity}</div>}
                </div>
                {/* Auto-populated field example */}
                <div className="form-group">
                    <label htmlFor="bookingDate" className="form-label">Booking Date (Auto-populated)</label>
                    <input
                        type="text"
                        id="bookingDate"
                        name="bookingDate"
                        className="form-input"
                        value={formData?.bookingDate || new Date().toISOString().split('T')[0]} // Auto-populate with current date
                        readOnly
                        style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-secondary)' }}
                    />
                </div>
                <div className="form-group">
                  <label htmlFor="paymentStatus" className="form-label">Payment Status</label>
                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    className="form-select"
                    value={formData?.paymentStatus || 'Pending'}
                    onChange={handleInputChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Refund Processing">Refund Processing</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-xl)' }}>
              <button type="button" className="button button-secondary" onClick={handleBackClick}>
                Cancel
              </button>
              <button type="submit" className="button button-primary">
                Save {type}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-title">Automated Ticket Booking</div>
        <div className="global-search">
          <input
            type="text"
            placeholder="Global search (Events, Tickets...)"
            value={searchQuery}
            onChange={handleGlobalSearch}
          />
          {searchResults.length > 0 && searchQuery.length > 2 && (
            <div className="search-suggestions">
              {searchResults.map(result => (
                <div key={`${result.type}-${result.id}`} onClick={() => handleSearchSuggestionClick(result.type, result.id)}>
                  {result.type}: {result.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <span>Hello, {currentUserRole === ROLES.EVENT_MANAGER ? 'Lisa' : currentUserRole === ROLES.CUSTOMER ? 'Alex' : 'Sarah'}</span>
        </div>
      </header>

      {view.screen === 'DASHBOARD' && <DashboardScreen />}
      {view.screen === 'DETAIL' && <DetailScreen />}
      {view.screen === 'EDIT_FORM' && <EditFormScreen />}
    </div>
  );
}

export default App;