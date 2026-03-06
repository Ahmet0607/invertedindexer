"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import type {
  DataStore,
  DataState,
  Equipment,
  Employee,
  Department,
  AssignmentHistory,
} from "./types"
import {
  mockCompany,
  mockDepartments,
  mockEmployees,
  mockEquipment,
  mockAssignmentHistory,
} from "./mock-data"

const STORAGE_KEY = "equipment-management-data"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getInitialState(): DataState {
  if (typeof window === "undefined") {
    return {
      company: mockCompany,
      departments: mockDepartments,
      employees: mockEmployees,
      equipment: mockEquipment,
      assignmentHistory: mockAssignmentHistory,
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Invalid JSON, use defaults
    }
  }

  return {
    company: mockCompany,
    departments: mockDepartments,
    employees: mockEmployees,
    equipment: mockEquipment,
    assignmentHistory: mockAssignmentHistory,
  }
}

const DataContext = createContext<DataStore | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(getInitialState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setState(JSON.parse(stored))
      } catch {
        // Keep initial state
      }
    }
    setIsHydrated(true)
  }, [])

  // Persist to localStorage on state change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state, isHydrated])

  // Equipment CRUD
  const addEquipment = useCallback(
    (equipmentData: Omit<Equipment, "id" | "companyId">): Equipment => {
      const newEquipment: Equipment = {
        ...equipmentData,
        id: generateId(),
        companyId: state.company.id,
      }
      setState((prev) => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment],
      }))
      return newEquipment
    },
    [state.company.id]
  )

  const updateEquipment = useCallback(
    (id: string, updates: Partial<Equipment>) => {
      setState((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }))
    },
    []
  )

  const deleteEquipment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      equipment: prev.equipment.filter((e) => e.id !== id),
      assignmentHistory: prev.assignmentHistory.filter(
        (h) => h.equipmentId !== id
      ),
    }))
  }, [])

  // Employee CRUD
  const addEmployee = useCallback(
    (employeeData: Omit<Employee, "id" | "companyId">): Employee => {
      const newEmployee: Employee = {
        ...employeeData,
        id: generateId(),
        companyId: state.company.id,
      }
      setState((prev) => ({
        ...prev,
        employees: [...prev.employees, newEmployee],
      }))
      return newEmployee
    },
    [state.company.id]
  )

  const updateEmployee = useCallback(
    (id: string, updates: Partial<Employee>) => {
      setState((prev) => ({
        ...prev,
        employees: prev.employees.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      }))
    },
    []
  )

  const deleteEmployee = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      employees: prev.employees.filter((e) => e.id !== id),
      // Unassign equipment from deleted employee
      equipment: prev.equipment.map((eq) =>
        eq.assignedEmployeeId === id
          ? { ...eq, assignedEmployeeId: undefined, status: "available" as const }
          : eq
      ),
    }))
  }, [])

  // Department CRUD
  const addDepartment = useCallback(
    (departmentData: Omit<Department, "id" | "companyId">): Department => {
      const newDepartment: Department = {
        ...departmentData,
        id: generateId(),
        companyId: state.company.id,
      }
      setState((prev) => ({
        ...prev,
        departments: [...prev.departments, newDepartment],
      }))
      return newDepartment
    },
    [state.company.id]
  )

  const updateDepartment = useCallback(
    (id: string, updates: Partial<Department>) => {
      setState((prev) => ({
        ...prev,
        departments: prev.departments.map((d) =>
          d.id === id ? { ...d, ...updates } : d
        ),
      }))
    },
    []
  )

  const deleteDepartment = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      departments: prev.departments.filter((d) => d.id !== id),
    }))
  }, [])

  // Assignments
  const assignEquipment = useCallback(
    (
      equipmentId: string,
      employeeId: string,
      condition: string,
      notes?: string
    ) => {
      const employee = state.employees.find((e) => e.id === employeeId)
      const department = state.departments.find(
        (d) => d.id === employee?.departmentId
      )

      if (!employee || !department) return

      const historyEntry: AssignmentHistory = {
        id: generateId(),
        equipmentId,
        employeeId,
        employeeName: employee.name,
        departmentId: department.id,
        departmentName: department.name,
        assignedDate: new Date().toISOString().split("T")[0],
        conditionWhenAssigned: condition,
        notes,
      }

      setState((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) =>
          e.id === equipmentId
            ? {
                ...e,
                status: "assigned" as const,
                assignedEmployeeId: employeeId,
                departmentId: department.id,
              }
            : e
        ),
        assignmentHistory: [...prev.assignmentHistory, historyEntry],
      }))
    },
    [state.employees, state.departments]
  )

  const returnEquipment = useCallback(
    (equipmentId: string, condition: string, notes?: string) => {
      const equipment = state.equipment.find((e) => e.id === equipmentId)
      if (!equipment || !equipment.assignedEmployeeId) return

      // Find the current active assignment
      const activeAssignment = state.assignmentHistory.find(
        (h) =>
          h.equipmentId === equipmentId &&
          h.employeeId === equipment.assignedEmployeeId &&
          !h.returnedDate
      )

      // Determine new status based on condition
      let newStatus: Equipment["status"] = "available"
      const conditionLower = condition.toLowerCase()
      if (
        conditionLower.includes("damaged") ||
        conditionLower.includes("broken")
      ) {
        newStatus = "damaged"
      } else if (
        conditionLower.includes("maintenance") ||
        conditionLower.includes("repair")
      ) {
        newStatus = "maintenance"
      }

      setState((prev) => ({
        ...prev,
        equipment: prev.equipment.map((e) =>
          e.id === equipmentId
            ? {
                ...e,
                status: newStatus,
                assignedEmployeeId: undefined,
              }
            : e
        ),
        assignmentHistory: prev.assignmentHistory.map((h) =>
          h.id === activeAssignment?.id
            ? {
                ...h,
                returnedDate: new Date().toISOString().split("T")[0],
                conditionWhenReturned: condition,
                notes: notes || h.notes,
              }
            : h
        ),
      }))
    },
    [state.equipment, state.assignmentHistory]
  )

  // Getters
  const getEquipmentById = useCallback(
    (id: string) => state.equipment.find((e) => e.id === id),
    [state.equipment]
  )

  const getEmployeeById = useCallback(
    (id: string) => state.employees.find((e) => e.id === id),
    [state.employees]
  )

  const getDepartmentById = useCallback(
    (id: string) => state.departments.find((d) => d.id === id),
    [state.departments]
  )

  const getAssignmentHistoryByEquipment = useCallback(
    (equipmentId: string) =>
      state.assignmentHistory
        .filter((h) => h.equipmentId === equipmentId)
        .sort(
          (a, b) =>
            new Date(b.assignedDate).getTime() -
            new Date(a.assignedDate).getTime()
        ),
    [state.assignmentHistory]
  )

  const getAssignmentHistoryByEmployee = useCallback(
    (employeeId: string) =>
      state.assignmentHistory
        .filter((h) => h.employeeId === employeeId)
        .sort(
          (a, b) =>
            new Date(b.assignedDate).getTime() -
            new Date(a.assignedDate).getTime()
        ),
    [state.assignmentHistory]
  )

  const getEquipmentByEmployee = useCallback(
    (employeeId: string) =>
      state.equipment.filter((e) => e.assignedEmployeeId === employeeId),
    [state.equipment]
  )

  const getEquipmentByDepartment = useCallback(
    (departmentId: string) =>
      state.equipment.filter((e) => e.departmentId === departmentId),
    [state.equipment]
  )

  // Stats
  const getEquipmentStats = useCallback(() => {
    const stats = {
      total: state.equipment.length,
      assigned: 0,
      available: 0,
      maintenance: 0,
      damaged: 0,
      lost: 0,
    }

    state.equipment.forEach((e) => {
      switch (e.status) {
        case "assigned":
          stats.assigned++
          break
        case "available":
          stats.available++
          break
        case "maintenance":
          stats.maintenance++
          break
        case "damaged":
          stats.damaged++
          break
        case "lost":
          stats.lost++
          break
      }
    })

    return stats
  }, [state.equipment])

  const store: DataStore = {
    ...state,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    assignEquipment,
    returnEquipment,
    getEquipmentById,
    getEmployeeById,
    getDepartmentById,
    getAssignmentHistoryByEquipment,
    getAssignmentHistoryByEmployee,
    getEquipmentByEmployee,
    getEquipmentByDepartment,
    getEquipmentStats,
  }

  return <DataContext.Provider value={store}>{children}</DataContext.Provider>
}

export function useData(): DataStore {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
