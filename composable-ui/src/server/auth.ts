import { type GetServerSidePropsContext } from 'next'
import { getServerSession } from 'next-auth'

import { rawAuthOptions } from '../pages/api/auth/[...nextauth]'

/**
 * Wrapper for getServerSession, used in trpc createContext and the
 * restricted API route
 *
 * Don't worry too much about the "unstable", it's safe to use but the syntax
 * may change in future versions
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return await getServerSession(ctx.req, ctx.res, rawAuthOptions)
}
