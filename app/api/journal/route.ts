import { analyze } from '@/utils/ai'
import { getUserByClerkID } from '@/utils/auth'
import { prisma } from '@/utils/db'
import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export const POST = async () => {
  const user = await getUserByClerkID()
  const entry = await prisma.journalEntry.create({
    data: {
      userId: user.id,
      content: 'Write about your day!',
    },
  })
  const analysis = await analyze(entry.content)
  // const analysis = {
  //   mood: 'happy',
  //   subject: 'My Day',
  //   negative: false,
  //   summary: 'Today was a great day filled with laughter and joy.',
  //   color: '#ffcc00',
  //   sentimentScore: 8.5,
  // }

  await prisma.entryAnalysis.create({
    data: {
      ...analysis,
      entry: {
        connect: {
          id: entry.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  })
  revalidatePath('/journal')
  return NextResponse.json({ data: entry })
}
