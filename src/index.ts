import express from 'express'
import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(express.json())

const prisma = new PrismaClient()

app.post('/wishes', async (req, res) => {
  const { name, item, price, revealDate } = req.body
  if (!name || !item || typeof price !== 'number') {
    return res.status(400).json({ error: 'name, item and numeric price required' })
  }

  try {
    const created = await prisma.wish.create({ data: {
      id: uuidv4(),
      name,
      item,
      price,
      revealDate: revealDate ? new Date(revealDate) : null
    }})
    res.status(201).json(created)
  } catch (err) {
    console.error('Create wish error:', err)
    res.status(500).json({ error: 'internal' })
  }
})

app.get('/wishes', async (req, res) => {
  try {
    const wishes = await prisma.wish.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(wishes)
  } catch (err) {
    console.error('List wishes error:', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Note: the SPA `public/index.html` is served by express.static and the
// fallback route below. Removed the inline root HTML so the UI can be used.

app.post('/wishes/:id/buy', async (req, res) => {
  const { id } = req.params
  const { boughtBy, anonymous } = req.body
  try {
    const existing = await prisma.wish.findUnique({ where: { id } })
    if (!existing) return res.status(404).json({ error: 'wish not found' })

    const updated = await prisma.wish.update({ where: { id }, data: {
      bought: true,
      boughtBy: anonymous ? null : (boughtBy ?? 'anonymous')
    }})
    res.json(updated)
  } catch (err) {
    console.error('Buy wish error:', err)
    res.status(500).json({ error: 'internal' })
  }
})

// Serve static SPA from /public
app.use(express.static('public'))

// Fallback to index.html for SPA routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/wishes')) return next()
  res.sendFile('index.html', { root: 'public' })
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Wisher API + UI listening on http://localhost:${PORT}`)
})
