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
    id: 'port_customer_management',
    name: 'Port & Customer Management',
    privileges: [
      { id: 'CREATE_PORT', name: 'CREATE_PORT', description: 'Create new port' },
      { id: 'UPDATE_PORT', name: 'UPDATE_PORT', description: 'Update port details' },
      { id: 'VIEW_PORT', name: 'VIEW_PORT', description: 'View port information' },
      { id: 'CREATE_CUSTOMER', name: 'CREATE_CUSTOMER', description: 'Create new customer' },
      { id: 'UPDATE_CUSTOMER', name: 'UPDATE_CUSTOMER', description: 'Update customer details' },
      { id: 'VIEW_CUSTOMER', name: 'VIEW_CUSTOMER', description: 'View customer information' },
    ]
  },
  {
    id: 'company_management',
    name: 'Company Management',
    privileges: [
      { id: 'CREATE_COMPANY', name: 'CREATE_COMPANY', description: 'Create new company' },
      { id: 'UPDATE_COMPANY', name: 'UPDATE_COMPANY', description: 'Update company details' },
      { id: 'VIEW_COMPANY', name: 'VIEW_COMPANY', description: 'View company information' },
      { id: 'DELETE_COMPANY', name: 'DELETE_COMPANY', description: 'Delete company' },
    ]
  },
  {
    id: 'shipment_order_management',
    name: 'Shipment Order Management',
    privileges: [
      { id: 'CREATE_SHIPMENT', name: 'CREATE_SHIPMENT', description: 'Create new shipment order' },
      { id: 'UPDATE_SHIPMENT', name: 'UPDATE_SHIPMENT', description: 'Update shipment details' },
      { id: 'VIEW_SHIPMENT', name: 'VIEW_SHIPMENT', description: 'View shipment information' },
      { id: 'CANCEL_SHIPMENT', name: 'CANCEL_SHIPMENT', description: 'Cancel shipment order' },
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
    id: 'carrier_management',
    name: 'Carrier Management',
    privileges: [
      { id: 'CREATE_CARRIER', name: 'CREATE_CARRIER', description: 'Create new carrier' },
      { id: 'UPDATE_CARRIER', name: 'UPDATE_CARRIER', description: 'Update carrier details' },
      { id: 'VIEW_CARRIER', name: 'VIEW_CARRIER', description: 'View carrier information' },
      { id: 'DELETE_CARRIER', name: 'DELETE_CARRIER', description: 'Delete carrier' },
    ]
  },
  {
    id: 'supplier_management',
    name: 'Supplier Management',
    privileges: [
      { id: 'CREATE_SUPPLIER', name: 'CREATE_SUPPLIER', description: 'Create new supplier' },
      { id: 'UPDATE_SUPPLIER', name: 'UPDATE_SUPPLIER', description: 'Update supplier details' },
      { id: 'VIEW_SUPPLIER', name: 'VIEW_SUPPLIER', description: 'View supplier information' },
      { id: 'DELETE_SUPPLIER', name: 'DELETE_SUPPLIER', description: 'Delete supplier' },
    ]
  },
  {
    id: 'company_customer_mappings',
    name: 'Company Customer Mappings',
    privileges: [
      { id: 'CREATE_MAPPING', name: 'CREATE_MAPPING', description: 'Create company-customer mapping' },
      { id: 'UPDATE_MAPPING', name: 'UPDATE_MAPPING', description: 'Update mapping details' },
      { id: 'VIEW_MAPPING', name: 'VIEW_MAPPING', description: 'View mapping information' },
      { id: 'DELETE_MAPPING', name: 'DELETE_MAPPING', description: 'Delete mapping' },
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
