export interface User {
  id: string
  name: string
  email: string
  address: string
}

export interface UserSession {
  sourceId: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoyaltyCard {
  id: string
  code: string
  holderId: string
  customerPhone?: string
}
