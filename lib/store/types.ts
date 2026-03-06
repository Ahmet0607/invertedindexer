// Core entity types for Equipment Management SaaS

export interface Company {
  id: string
  name: string
  createdAt: string
}

export interface Department {
  id: string
  companyId: string
  name: string
  description?: string
}

export interface Employee {
  id: string
  companyId: string
  departmentId: string
  name: string
  position: string
  email: string
  status: "active" | "inactive"
}

export type EquipmentStatus =
  | "available"
  | "assigned"
  | "maintenance"
  | "damaged"
  | "lost"

export interface Equipment {
  id: string
  companyId: string
  name: string
  brand: string
  serialNumber: string
  purchaseDate: string
  purchasePrice: number
  warrantyMonths?: number
  maintenanceIntervalMonths?: number
  departmentId?: string
  assignedEmployeeId?: string
  status: EquipmentStatus
  notes?: string
  imageUrl?: string
}

export interface AssignmentHistory {
  id: string
  equipmentId: string
  employeeId: string
  employeeName: string
  departmentId: string
  departmentName: string
  assignedDate: string
  returnedDate?: string
  conditionWhenAssigned: string
  conditionWhenReturned?: string
  notes?: string
}

// Data store state
export interface DataState {
  company: Company
  departments: Department[]
  employees: Employee[]
  equipment: Equipment[]
  assignmentHistory: AssignmentHistory[]
}

// Actions
export interface DataActions {
  // Equipment CRUD
  addEquipment: (equipment: Omit<Equipment, "id" | "companyId">) => Equipment
  updateEquipment: (id: string, updates: Partial<Equipment>) => void
  deleteEquipment: (id: string) => void

  // Employee CRUD
  addEmployee: (employee: Omit<Employee, "id" | "companyId">) => Employee
  updateEmployee: (id: string, updates: Partial<Employee>) => void
  deleteEmployee: (id: string) => void

  // Department CRUD
  addDepartment: (department: Omit<Department, "id" | "companyId">) => Department
  updateDepartment: (id: string, updates: Partial<Department>) => void
  deleteDepartment: (id: string) => void

  // Assignments
  assignEquipment: (
    equipmentId: string,
    employeeId: string,
    condition: string,
    notes?: string
  ) => void
  returnEquipment: (
    equipmentId: string,
    condition: string,
    notes?: string
  ) => void

  // Getters
  getEquipmentById: (id: string) => Equipment | undefined
  getEmployeeById: (id: string) => Employee | undefined
  getDepartmentById: (id: string) => Department | undefined
  getAssignmentHistoryByEquipment: (equipmentId: string) => AssignmentHistory[]
  getAssignmentHistoryByEmployee: (employeeId: string) => AssignmentHistory[]
  getEquipmentByEmployee: (employeeId: string) => Equipment[]
  getEquipmentByDepartment: (departmentId: string) => Equipment[]

  // Stats
  getEquipmentStats: () => {
    total: number
    assigned: number
    available: number
    maintenance: number
    damaged: number
    lost: number
  }
}

export type DataStore = DataState & DataActions
