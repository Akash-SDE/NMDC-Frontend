// Privilege Modules - Categories with their individual privileges
export const PRIVILEGE_MODULES = [
  {
    id: 'role_management',
    name: 'Role Management',
    privileges: [
      { id: 'CREATE_ROLE', name: 'CREATE_ROLE', description: 'New Role is created successfully!' },
      { id: 'DELETE_ROLE', name: 'DELETE_ROLE', description: 'Role is deleted!' },
      { id: 'UPDATE_ROLE', name: 'UPDATE_ROLE', description: 'Role is updated!' },
      { id: 'VIEW_ROLE', name: 'VIEW_ROLE', description: 'Viewed a specific Role details!' },
      { id: 'VIEW_ROLE_LIST', name: 'VIEW_ROLE_LIST', description: 'Viewed all Roles!' },
      { id: 'VIEW_ROLE_MANAGEMENT', name: 'VIEW_ROLE_MANAGEMENT', description: 'Manage system roles and role configurations' },
    ]
  },
  {
    id: 'user_management',
    name: 'User Management',
    privileges: [
      { id: 'CREATE_USER', name: 'CREATE_USER', description: 'Created a new user successfully!' },
      { id: 'DELETE_USER', name: 'DELETE_USER', description: 'User details deleted successfully!' },
      { id: 'UPDATE_USER', name: 'UPDATE_USER', description: 'User details updated successfully!' },
      { id: 'UPDATE_USER_PASSWORD', name: 'UPDATE_USER_PASSWORD', description: 'User password updated successfully!' },
      { id: 'UPDATE_USER_STATUS', name: 'UPDATE_USER_STATUS', description: 'User status updated successfully!' },
      { id: 'VIEW_USER', name: 'VIEW_USER', description: 'Viewed user detail!' },
    ]
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    privileges: [
      { id: 'VIEW_DASHBOARD', name: 'VIEW_DASHBOARD', description: 'View dashboard metrics' },
      { id: 'VIEW_ANALYTICS', name: 'VIEW_ANALYTICS', description: 'View analytics data' },
      { id: 'EXPORT_REPORTS', name: 'EXPORT_REPORTS', description: 'Export dashboard reports' },
    ]
  },
  {
    id: 'rake-offering',
    name: 'Rake Offering Management',
    privileges: [
      { id: 'CREATE_RAKE_OFFERING', name: 'CREATE_RAKE_OFFERING', description: 'View dashboard metrics' },
      { id: 'EDIT_RAKE_DETAILS', name: 'EDIT_RAKE_DETAILS', description: 'View analytics data' },
      { id: 'OVERRIDE_VALIDATIONS', name: 'OVERRIDE_VALIDATIONS', description: 'Export dashboard reports' },
      { id: 'CANCEL_RAKE_ENTRY', name: 'CANCEL_RAKE_ENTRY', description: 'Export dashboard reports' },
      { id: 'VIEW_ALL_RAKES', name: 'VIEW_ALL_RAKES', description: 'Export dashboard reports' },
      { id: 'EDIT_RAKE_BEFORE_LOADING', name: 'EDIT_RAKE_BEFORE_LOADING', description: 'Export dashboard reports' },
      { id: 'FORCE_EDIT_AFTER_LOADING', name: 'FORCE_EDIT_AFTER_LOADING', description: 'Export dashboard reports' },
    ]
  },
  {
    id: 'loading-offering',
    name: 'Loading Management',
    privileges: [
      { id: 'VIEW_LOADING_PROGRESS', name: 'VIEW_LOADING_PROGRESS', description: 'View dashboard metrics' },
      { id: 'UPDATE_LOADING_DETAILS', name: 'UPDATE_LOADING_DETAILS', description: 'View analytics data' },
      { id: 'MODIFY_COMPLETION_CLEARANCE_TIME', name: 'MODIFY_COMPLETION_CLEARANCE_TIME', description: 'Export dashboard reports' },
      { id: 'ADD_ADJUSTMENT', name: 'ADD_ADJUSTMENT', description: 'View analytics data' },
      { id: 'MODIFY_ADJUSTMENT', name: 'MODIFY_ADJUSTMENT', description: 'View analytics data' },
      { id: 'VIEW_ADJUSTMENT_HISTORY', name: 'VIEW_ADJUSTMENT_HISTORY', description: 'View analytics data' },
    ]
  },
  {
    id: 'delay',
    name: 'Delay Management',
    privileges: [
      { id: 'RECORD_DELAY_CATEGORY_AND_DURATION', name: 'Record delay category and duration', description: 'View dashboard metrics' },
      { id: 'ALLOW_MULTIPLE_DELAY_ENTRIES', name: 'ALLOW_MULTIPLE_DELAY_ENTRIES', description: 'View analytics data' },
      { id: 'LINK_DELAY_WITH_LOADING_TIMELINE', name: 'LINK_DELAY_WITH_LOADING_TIMELINE', description: 'Export dashboard reports' },
      { id: 'RESTRICT_DELAY_AFTER_TRACK_CLEARANCE', name: 'RESTRICT_DELAY_AFTER_TRACK_CLEARANCE', description: 'Export dashboard reports' },
    ]
  },
  {
    id: 'e-demand',
    name: 'E-Demand Management',
    privileges: [
      { id: 'CREATE_DEMAND', name: 'CREATE_DEMAND', description: 'View dashboard metrics' },
      { id: 'MODIFY_DEMAND', name: 'MODIFY_DEMAND', description: 'View analytics data' },
      { id: 'ALLOCATE_RAKE_TO_DEMAND', name: 'ALLOCATE_RAKE_TO_DEMAND', description: 'Export dashboard reports' },
    ]
  },
  {
    id: 'permit',
    name: 'Permit Management',
    privileges: [
      { id: 'RECORD_PERMIT_NUMBER_AND_VALIDITY', name: 'RECORD_PERMIT_NUMBER_AND_VALIDITY', description: 'View dashboard metrics' },
      { id: 'LINK_PERMIT_WITH_RAKE_DISPATCH', name: 'LINK_PERMIT_WITH_RAKE_DISPATCH', description: 'View analytics data' },
      { id: 'VIEW_PERMIT_COMPLIANCE_DETAILS', name: 'VIEW_PERMIT_COMPLIANCE_DETAILS', description: 'Export dashboard reports' },
    ]
  },
  {
    id: 'reports',
    name: 'Reports Management',
    privileges: [
      { id: 'VIEW_DASHBOARD', name: 'VIEW_DASHBOARD', description: 'View dashboard metrics' },
      { id: 'VIEW_ANALYTICS', name: 'VIEW_ANALYTICS', description: 'View analytics data' },
      { id: 'EXPORT_REPORTS', name: 'EXPORT_REPORTS', description: 'Export dashboard reports' },
    ]
  },
];

// Get total privilege count
export const getTotalPrivilegeCount = () => {
  return PRIVILEGE_MODULES.reduce((total, module) => total + module.privileges.length, 0);
};

// Mock Roles Data
export const MOCK_ROLES = [
  {
    id: 1,
    name: 'Admin',
    description: 'All Access',
    privileges: ['VIEW_DASHBOARD', 'VIEW_ROLE_LIST', 'VIEW_USER'],
    createdBy: 'NMDC',
    createdOn: '12/11/2025',
    modifiedBy: 'NMDC',
    modifiedOn: '12/11/2025',
    status: 'active'
  },
  {
    id: 2,
    name: 'Operator',
    description: 'Full Access',
    privileges: ['VIEW_DASHBOARD', 'CREATE_ROLE', 'UPDATE_ROLE', 'VIEW_ROLE', 'CREATE_USER', 'UPDATE_USER'],
    createdBy: 'NMDC',
    createdOn: '12/10/2025',
    modifiedBy: 'NMDC',
    modifiedOn: '12/12/2025',
    status: 'active'
  },
  {
    id: 3,
    name: 'Viewer',
    description: 'Handles customs, clearance and delivery at destination',
    privileges: ['VIEW_SHIPMENT', 'UPDATE_SHIPMENT', 'VIEW_CUSTOMER'],
    createdBy: 'NMDC',
    createdOn: '12/5/2025',
    modifiedBy: 'NMDC',
    modifiedOn: '12/5/2025',
    status: 'active'
  },
];

// Mock Users Data
export const MOCK_USERS = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 234 567 8900',
    role: 'NMDC Administrator',
    status: 'active',
    avatar: 'JS',
    createdOn: '12/1/2025',
    createdBy: 'System'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '+1 234 567 8901',
    role: 'Admin',
    status: 'active',
    avatar: 'SJ',
    createdOn: '12/3/2025',
    createdBy: 'John Smith'
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike.w@example.com',
    phone: '+1 234 567 8902',
    role: 'Viewer',
    status: 'active',
    avatar: 'MW',
    createdOn: '12/5/2025',
    createdBy: 'John Smith'
  },
  {
    id: 4,
    name: 'Emily Brown',
    email: 'emily.b@example.com',
    phone: '+1 234 567 8903',
    role: 'Viewer',
    status: 'inactive',
    avatar: 'EB',
    createdOn: '12/7/2025',
    createdBy: 'Sarah Johnson'
  },
  {
    id: 5,
    name: 'David Lee',
    email: 'david.l@example.com',
    phone: '+1 234 567 8904',
    role: 'Viewer',
    status: 'pending',
    avatar: 'DL',
    createdOn: '12/10/2025',
    createdBy: 'Sarah Johnson'
  },
];

// Status colors
export const STATUS_COLORS = {
  active: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  inactive: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  pending: { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' },
};

export const ROUTE_LABELS = {
  "sa-roles": "Role Management",
  "sa-add-role": "Add Role",
  "sa-users": "User Management",
  "sa-add-user": "Add User",
  "sa-edit-user": "Edit User",
};