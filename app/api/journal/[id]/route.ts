import { analyze } from '@/utils/ai'
import { getUserByClerkID } from '@/utils/auth'
import { prisma } from '@/utils/db'
import { NextResponse } from 'next/server'

export const PATCH = async (request, { params }) => {
  const user = await getUserByClerkID()
  const { content } = await request.json()

  const updatedEntry = await prisma.journalEntry.update({
    where: {
      userId_id: {
        userId: user.id as string,
        id: params.id,
      },
    },
    data: {
      content,
    },
    include: {
      analysis: true,
    },
  })

  const updated = await prisma.entryAnalysis.update({
    where: {
      entryId: updatedEntry.id,
    },
    data: {
      ...(await analyze(updatedEntry.content)),
    },
  })
  return NextResponse.json({ data: { ...updatedEntry, analysis: updated } })
}
