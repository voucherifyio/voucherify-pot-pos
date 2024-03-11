import { DefaultUser, type DefaultSession } from 'next-auth'
import { DefaultJWT, JWT } from 'next-auth/jwt'
declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    id?: string
    loggedIn?: boolean
    sub?: string
    localisation?: string
    user?: {
      // id: string
      phoneNumber?: string
      voucherifyId?: string
      sourceId?: string
      registrationDate?: string
      registeredCustomer?: boolean
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    phoneNumber?: string
    voucherifyId?: string
    sourceId?: string
    registrationDate?: string
    registeredCustomer?: boolean
    localisation?: string
  }
}
declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** OpenID ID Token */
    idToken?: string
    phoneNumber?: string
    voucherifyId?: string
    sourceId?: string
    registrationDate?: string
    registeredCustomer?: boolean
    localisation?: string
  }
}
