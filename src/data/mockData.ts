export interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  trips: number;
  earnings: number;
  status: 'active' | 'offline';
  performanceScore: number;
  joinDate: string;
  location: { lat: number; lng: number };
  vehicleId?: string;
  contractId?: string;
}

export interface Fine {
  id: string;
  driverId: number;
  vehiclePlate: string;
  violation: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid' | 'deducted';
  location?: string;
}

export interface Contract {
  id: string;
  driverId: number;
  vehicleId: string;
  startDate: string;
  endDate: string;
  depositAmount: number;
  dailyKmLimit: number;
  monthlyRent: number;
  status: 'active' | 'expired' | 'terminated';
  terms: string[];
}

export const mockDriversData: Driver[] = [
  {
    id: 1,
    name: 'Ahmed Al-Rashid',
    email: 'ahmed@example.com',
    phone: '+971 50 123 4567',
    avatar: 'AR',
    trips: 24,
    earnings: 1250,
    status: 'active',
    performanceScore: 92,
    joinDate: '2024-01-15',
    location: { lat: 25.2048, lng: 55.2708 },
    vehicleId: 'DXB-A-12345',
    contractId: 'CNT-001'
  },
  {
    id: 2,
    name: 'Mohammed Hassan',
    email: 'mohammed@example.com',
    phone: '+971 55 987 6543',
    avatar: 'MH',
    trips: 18,
    earnings: 980,
    status: 'active',
    performanceScore: 88,
    joinDate: '2023-11-20',
    location: { lat: 25.1972, lng: 55.2744 },
    vehicleId: 'DXB-B-67890',
    contractId: 'CNT-002'
  },
  {
    id: 3,
    name: 'Omar Khalil',
    email: 'omar@example.com',
    phone: '+971 52 456 7890',
    avatar: 'OK',
    trips: 31,
    earnings: 1680,
    status: 'active',
    performanceScore: 95,
    joinDate: '2024-02-10',
    location: { lat: 25.2084, lng: 55.2719 },
    vehicleId: 'DXB-C-11111',
    contractId: 'CNT-003'
  },
  {
    id: 4,
    name: 'Yusuf Ahmad',
    email: 'yusuf@example.com',
    phone: '+971 56 789 0123',
    avatar: 'YA',
    trips: 15,
    earnings: 820,
    status: 'offline',
    performanceScore: 78,
    joinDate: '2024-03-05',
    location: { lat: 25.2011, lng: 55.2762 },
    vehicleId: 'DXB-D-22222',
    contractId: 'CNT-004'
  },
  {
    id: 5,
    name: 'Khalid Saeed',
    email: 'khalid@example.com',
    phone: '+971 54 345 6789',
    avatar: 'KS',
    trips: 22,
    earnings: 1150,
    status: 'active',
    performanceScore: 90,
    joinDate: '2023-12-01',
    location: { lat: 25.2103, lng: 55.2681 },
    vehicleId: 'DXB-E-33333',
    contractId: 'CNT-005'
  },
  {
    id: 6,
    name: 'Hassan Ali',
    email: 'hassan@example.com',
    phone: '+971 58 901 2345',
    avatar: 'HA',
    trips: 19,
    earnings: 1020,
    status: 'active',
    performanceScore: 85,
    joinDate: '2024-01-20',
    location: { lat: 25.1995, lng: 55.2790 },
    vehicleId: 'DXB-F-44444',
    contractId: 'CNT-006'
  }
];

export const mockFinesData: Fine[] = [
  {
    id: 'FN-001',
    driverId: 1,
    vehiclePlate: 'DXB-A-12345',
    violation: 'Speeding (80 km/h in 60 zone)',
    amount: 600,
    date: '2024-01-20',
    status: 'pending',
    location: 'Sheikh Zayed Road'
  },
  {
    id: 'FN-002',
    driverId: 2,
    vehiclePlate: 'DXB-B-67890',
    violation: 'Illegal Parking',
    amount: 200,
    date: '2024-01-18',
    status: 'deducted',
    location: 'Dubai Mall'
  },
  {
    id: 'FN-003',
    driverId: 3,
    vehiclePlate: 'DXB-C-11111',
    violation: 'Running Red Light',
    amount: 1000,
    date: '2024-01-15',
    status: 'paid',
    location: 'Al Wasl Road'
  },
  {
    id: 'FN-004',
    driverId: 1,
    vehiclePlate: 'DXB-A-12345',
    violation: 'Mobile Phone Usage',
    amount: 800,
    date: '2024-01-22',
    status: 'pending',
    location: 'Business Bay'
  },
  {
    id: 'FN-005',
    driverId: 5,
    vehiclePlate: 'DXB-E-33333',
    violation: 'Lane Violation',
    amount: 400,
    date: '2024-01-19',
    status: 'deducted',
    location: 'Emirates Road'
  }
];

export const mockContractsData: Contract[] = [
  {
    id: 'CNT-001',
    driverId: 1,
    vehicleId: 'DXB-A-12345',
    startDate: '2024-01-15',
    endDate: '2024-08-22', // ~180 days from now
    depositAmount: 5000,
    dailyKmLimit: 300,
    monthlyRent: 1200,
    status: 'active',
    terms: [
      'Driver must maintain valid UAE driving license',
      'Vehicle must be returned in same condition',
      'Fines will be deducted from deposit',
      'Monthly rent due by 1st of each month'
    ]
  },
  {
    id: 'CNT-002',
    driverId: 2,
    vehicleId: 'DXB-B-67890',
    startDate: '2023-11-20',
    endDate: '2024-05-15', // ~90 days from now
    depositAmount: 6000,
    dailyKmLimit: 350,
    monthlyRent: 1500,
    status: 'active',
    terms: [
      'Driver must maintain valid UAE driving license',
      'Vehicle must be returned in same condition',
      'Fines will be deducted from deposit',
      'Monthly rent due by 1st of each month'
    ]
  },
  {
    id: 'CNT-003',
    driverId: 3,
    vehicleId: 'DXB-C-11111',
    startDate: '2024-02-10',
    endDate: '2024-12-30', // ~330 days from now
    depositAmount: 4500,
    dailyKmLimit: 280,
    monthlyRent: 1100,
    status: 'active',
    terms: [
      'Driver must maintain valid UAE driving license',
      'Vehicle must be returned in same condition',
      'Fines will be deducted from deposit',
      'Monthly rent due by 1st of each month'
    ]
  },
  {
    id: 'CNT-004',
    driverId: 4,
    vehicleId: 'DXB-D-22222',
    startDate: '2024-03-05',
    endDate: '2024-07-18', // ~150 days from now
    depositAmount: 4000,
    dailyKmLimit: 250,
    monthlyRent: 1000,
    status: 'active',
    terms: [
      'Driver must maintain valid UAE driving license',
      'Vehicle must be returned in same condition',
      'Fines will be deducted from deposit',
      'Monthly rent due by 1st of each month'
    ]
  },
  {
    id: 'CNT-005',
    driverId: 5,
    vehicleId: 'DXB-E-33333',
    startDate: '2023-12-01',
    endDate: '2024-09-10', // ~220 days from now
    depositAmount: 5500,
    dailyKmLimit: 320,
    monthlyRent: 1300,
    status: 'active',
    terms: [
      'Driver must maintain valid UAE driving license',
      'Vehicle must be returned in same condition',
      'Fines will be deducted from deposit',
      'Monthly rent due by 1st of each month'
    ]
  },
  {
    id: 'CNT-006',
    driverId: 6,
    vehicleId: 'DXB-F-44444',
    startDate: '2024-01-20',
    endDate: '2024-06-25', // ~120 days from now
    depositAmount: 4800,
    dailyKmLimit: 290,
    monthlyRent: 1150,
    status: 'active',
    terms: [
      'Driver must maintain valid UAE driving license',
      'Vehicle must be returned in same condition',
      'Fines will be deducted from deposit',
      'Monthly rent due by 1st of each month'
    ]
  }
];