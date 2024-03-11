import { randomUUID } from 'crypto'
import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { NextApiRequest, NextApiResponse } from 'next'
import { getCRSFCookieInfo } from 'server/auth-utils'
import { getCustomer, getCustomerByLoyaltyCard } from '@composable/voucherify'
import { Analytics } from '@segment/analytics-node'
import dayjs from 'dayjs'

const getAnalitics = () => {
  if (!process.env.SEGMENTIO_SOURCE_WRITE_KEY) {
    throw new Error('SEGMENTIO_SOURCE_WRITE_KEY not defined in env variables')
  }

  return new Analytics({ writeKey: process.env.SEGMENTIO_SOURCE_WRITE_KEY })
}

export const rawAuthOptions: NextAuthOptions = {
  pages: {},
  providers: [
    CredentialsProvider({
      id: 'anon',
      name: 'Anonymous',
      credentials: {
        localisation: { label: 'Localisation', type: 'text' },
      },
      async authorize(credentials) {
        const anonymousUser = {
          id: randomUUID(),
          name: `anonymous_user`,
          email: `anonymous_user`,
          image: '',
          phoneNumber: '',
          localisation: credentials?.localisation,
        }
        //anyone can do an anonymous login
        return anonymousUser
      },
    }),
    CredentialsProvider({
      id: 'only-loyalty-card',
      name: 'Only loyalty card',
      credentials: {
        code: { label: 'Loyalty card code', type: 'text' },
        localisation: { label: 'Localisation', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.code) {
          return null
        }

        const voucherifyCustomer = await getCustomerByLoyaltyCard(
          credentials.code
        )

        if (!voucherifyCustomer) {
          return null
        }

        const customer = {
          id: voucherifyCustomer.id,
          voucherifyId: voucherifyCustomer.id,
          sourceId: voucherifyCustomer.source_id,
          name: voucherifyCustomer.name,
          email: voucherifyCustomer.email,
          phoneNumber: voucherifyCustomer.phone,
          registeredCustomer: voucherifyCustomer.registeredCustomer,
          registrationDate: voucherifyCustomer.registrationDate,
          image: '',
          localisation: credentials?.localisation,
        }
        return customer
      },
    }),

    CredentialsProvider({
      id: 'only-phone',
      name: 'Only phone',
      credentials: {
        phone: { label: 'Phone number', type: 'text' },
        localisation: { label: 'Localisation', type: 'text' },
      },
      async authorize(credentials, req) {
        if (!credentials?.phone) {
          return null
        }

        let voucherifyCustomer = await getCustomer(credentials.phone)

        if (!voucherifyCustomer) {
          voucherifyCustomer = {
            id: '',
            source_id: credentials.phone,
            email: undefined,
            registeredCustomer: false,
            registrationDate: dayjs().format('YYYY-MM-DD'),
            phone: credentials.phone,
            name: undefined,
          }

          // Integration between segment and Voucherify creates the customer in Voucherify base on this event
          const analytics = getAnalitics()
          analytics.identify({
            userId: credentials.phone,
            traits: {
              phone: credentials.phone,
            },
          })
        }

        if (!voucherifyCustomer) {
          return null
        }

        const customer = {
          id: voucherifyCustomer.id,
          voucherifyId: voucherifyCustomer.id,
          sourceId: voucherifyCustomer.source_id,
          name: voucherifyCustomer.name,
          email: voucherifyCustomer.email,
          phoneNumber: voucherifyCustomer.phone,
          registeredCustomer: voucherifyCustomer.registeredCustomer,
          registrationDate: voucherifyCustomer.registrationDate,
          image: '',
          localisation: credentials?.localisation,
        }
        return customer
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const user = {
          id: randomUUID(),
          name: 'Test User',
          email: 'test@email.com',
          image: '',
        }

        if (
          credentials?.username === 'test@email.com' &&
          credentials?.password === 'password'
        ) {
          // Any object returned will be saved in `user` property of the JWT
          return user
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      // console.log('JWT', { user, token, session})

      if (token?.name === 'anonymous_user') {
        const newToken = {
          ...token,
          id: token.sub,
          loggedIn: false,
        }
        if (session?.localisation) {
          newToken.localisation = session.localisation
        }
        return newToken
      }
      const newToken = {
        ...token,
        id: token.sub,
        loggedIn: true,
      }

      if (trigger === 'update' && session?.localisation) {
        newToken.localisation = session.localisation
      }

      if (user?.phoneNumber) {
        newToken.phoneNumber = user.phoneNumber
      }
      if (user?.localisation) {
        newToken.localisation = user.localisation
      }
      if (user?.sourceId) {
        newToken.sourceId = user.sourceId
      }
      if (user?.voucherifyId) {
        newToken.voucherifyId = user.voucherifyId
      }
      if (user?.registeredCustomer) {
        newToken.registeredCustomer = user.registeredCustomer
      }
      if (user?.registrationDate) {
        newToken.registrationDate = user.registrationDate
      }

      return newToken
    },
    session: async ({ session, user, token, newSession, trigger }) => {
      // console.log('SESSION', {session, user, token})

      const newSessionObj = {
        ...session,
        id: token?.sub,
        loggedIn: (token?.loggedIn as boolean) ?? false,
      }

      if (trigger === 'update' && newSession?.localisation) {
        newSessionObj.localisation = newSession.localisation
      }

      if (newSessionObj?.user && token.phoneNumber) {
        newSessionObj.user.phoneNumber = token.phoneNumber
      }
      if (newSessionObj?.user && token.sourceId) {
        newSessionObj.user.sourceId = token.sourceId
      }
      if (newSessionObj?.user && token.voucherifyId) {
        newSessionObj.user.voucherifyId = token.voucherifyId
      }
      if (newSessionObj?.user && token.registrationDate) {
        newSessionObj.user.registrationDate = token.registrationDate
      }
      if (newSessionObj?.user && token.registeredCustomer) {
        newSessionObj.user.registeredCustomer = token.registeredCustomer
      }

      if (token.localisation) {
        newSessionObj.localisation = token.localisation
      }

      return newSessionObj
    },
  },
  session: {
    updateAge: 0,
  },
}

const authOptions = async (req: NextApiRequest, res: NextApiResponse) => {
  const actionList = req.query.nextauth || []

  if (
    actionList?.includes('signout') ||
    actionList?.includes('credentials') ||
    actionList?.includes('anon') ||
    actionList?.includes('only-phone')
  ) {
    res.setHeader('Set-Cookie', getCRSFCookieInfo(req).cookieExpire)
  }

  return await NextAuth(req, res, rawAuthOptions)
}

export default authOptions
