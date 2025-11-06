import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample texts for entries
const journalTexts = [
  "Today was productive. Made significant progress on the dashboard feature and helped a colleague debug their authentication issue. Feeling good about the week ahead.",
  "Struggling with focus today. Too many context switches between meetings. Need to block out more deep work time. Maybe mornings are better for complex problems.",
  "Great brainstorming session with the team. We came up with some innovative solutions to the performance bottleneck. Excited to implement these ideas next week.",
  "Feeling burned out. Need to take a proper break this weekend. Reminder to self: rest is productive too.",
  "Learned a lot from the code review today. My approach to error handling needed improvement. Grateful for constructive feedback.",
  "Celebrated shipping the new feature! Users are already giving positive feedback. This is why I love building products.",
  "Difficult conversation with a stakeholder about timeline expectations. Need to get better at saying no and setting boundaries.",
  "Weekend reading: finished that book on system design. Some great insights on distributed systems and trade-offs.",
]

const beliefTexts = [
  "I believe strongly that TypeScript adoption will continue to grow across the industry. The benefits of type safety are too compelling.",
  "Remote work is here to stay, but I think hybrid models will become the norm. People want flexibility but also connection.",
  "AI tools will augment developers rather than replace them. The creative problem-solving aspect of engineering remains uniquely human.",
  "Code quality matters more than speed for long-term project success. Technical debt compounds quickly.",
  "The best teams have psychological safety. People need to feel comfortable taking risks and making mistakes.",
  "Documentation is undervalued. Good docs save more time than they take to write.",
  "Testing is an investment, not a cost. Automated tests pay dividends in confidence and velocity.",
]

const noteTexts = [
  "TODO: Research better state management patterns for the new dashboard. Redux might be overkill.",
  "Idea: Build a CLI tool to automate our deployment checks. Would save the team hours each week.",
  "Bug to investigate: Users reporting slow load times on mobile. Might be related to image optimization.",
  "Meeting notes: Product wants to prioritize the analytics feature next quarter. Need to break down requirements.",
  "Resource: Found an excellent article on database indexing strategies. Bookmark for later reference.",
  "Question: Should we migrate to a monorepo structure? Need to evaluate pros and cons with the team.",
  "Quick win: Noticed we can simplify the authentication flow by removing a redundant API call.",
  "Learning goal: Deep dive into WebAssembly this month. Curious about performance benefits.",
  "Feedback received: Users want dark mode. Should be straightforward to implement with our current setup.",
  "Performance note: The word frequency calculation could be optimized with a trie data structure.",
]

// Sample bet statements
const betStatements = [
  "Next.js 15 will be released before the end of Q2 2026",
  "Our team will complete the migration to TypeScript 5 by end of month",
  "The new dashboard feature will increase user engagement by at least 15%",
  "I will read 20 technical books this year",
  "Bitcoin will reach $100k before June 2026",
  "The company will hire at least 5 new engineers this quarter",
  "React 19 will include built-in state management",
  "I will contribute to an open-source project at least once per month",
  "Our main competitor will launch a similar feature within 3 months",
  "The refactoring project will take less than 2 weeks",
  "TypeScript will surpass JavaScript in npm download statistics by 2027",
  "I will maintain a daily journaling habit for the next 6 months",
  "The new API design will reduce response times by 30%",
  "Remote work will still be common in 5 years",
  "I will give a tech talk at a conference this year",
  "The team will adopt a new framework for the mobile app",
  "Code coverage will reach 80% by end of quarter",
  "The database migration will complete without major issues",
  "I will learn Rust well enough to build a production service",
  "The product will reach 10k active users by year end",
]

async function main() {
  console.log('Starting seed...')

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
    },
  })
  console.log('Created user:', user.email)

  // Create entries over the last 14 days
  const entryKinds: Array<'journal' | 'belief' | 'note'> = ['journal', 'belief', 'note']
  const now = new Date()
  
  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 14)
    const hoursAgo = Math.floor(Math.random() * 24)
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(createdAt.getHours() - hoursAgo)

    let text = ''
    const kind = entryKinds[i % entryKinds.length]
    
    if (kind === 'journal') {
      text = journalTexts[Math.floor(Math.random() * journalTexts.length)]
    } else if (kind === 'belief') {
      text = beliefTexts[Math.floor(Math.random() * beliefTexts.length)]
    } else {
      text = noteTexts[Math.floor(Math.random() * noteTexts.length)]
    }

    await prisma.entry.create({
      data: {
        userId: user.id,
        kind,
        text,
        createdAt,
      },
    })
  }
  console.log('Created 25 entries')

  // Create bets with mix of open and resolved
  for (let i = 0; i < 20; i++) {
    const daysAgo = Math.floor(Math.random() * 14)
    const hoursAgo = Math.floor(Math.random() * 24)
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(createdAt.getHours() - hoursAgo)

    const isResolved = Math.random() > 0.5
    const probability = Math.round((Math.random() * 0.8 + 0.1) * 100) / 100 // 0.1 to 0.9, rounded

    let outcome = null
    let resolvedAt = null

    if (isResolved) {
      outcome = Math.random() > 0.5
      resolvedAt = new Date(createdAt)
      resolvedAt.setDate(resolvedAt.getDate() + Math.floor(Math.random() * 7) + 1)
    }

    await prisma.bet.create({
      data: {
        userId: user.id,
        source: 'personal',
        statement: betStatements[i % betStatements.length],
        probability,
        status: isResolved ? 'resolved' : 'open',
        outcome,
        createdAt,
        resolvedAt,
      },
    })
  }
  console.log('Created 20 bets')

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


