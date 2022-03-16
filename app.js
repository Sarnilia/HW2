const express = require('express')
const path = require('path')
const hbs = require('hbs')
const sessions = require('express-session')
const res = require('express/lib/response')
const { db } = require('./DB')
const { checkAuth } = require('./src/middlewares/checkAuth')
const bcrypt = require('bcrypt')
const async = require('hbs/lib/async')

const app = express()
const PORT = process.env.PORT || 3000

const saltRounds = 10

app.set('view engine', 'hbs')
app.set('views', path.join(process.env.PWD, 'src', 'views'))
app.set('cookieName', 'sid')

hbs.registerPartials(path.join(process.env.PWD, 'src', 'views', 'partials'))

const secretKey = 'asdksaakflgdfkvdlfkmdfb'

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(sessions({
  name: app.get('cookieName'),
  secret: secretKey,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 86400 * 1e3,
  }
}))
app.use(express.static(path.join(process.env.PWD, 'public')))

app.use((req, res, next) => {
  const currentEmail = req.session?.user?.email

  if (currentEmail) {
    const currentUserName = db.users.find((user) => user.email === currentEmail)
    res.locals.name = currentUserName.name
  }

  next()
})

app.get('/', (req, res) => {
  res.render('main')
})

app.get('/auth/signup', async (req, res) => {
  res.render('signUp')
})

app.post('/auth/signup', async (req, res) => {
  const { name, email, password } = req.body

  const hashPass = await bcrypt.hash(password, saltRounds)

  db.users.push({
    name,
    email,
    password: hashPass,
  })

  req.session.user = {
    email
  }

  res.redirect('/posts')
})

app.get('/auth/signin', async (req, res) => {
  res.render('signIn')
})

app.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body

  const currentUser = db.users.find((user) => user.email === email)

  if (currentUser) {
    if (await bcrypt.compare(password, currentUser.password)) {
      req.session.user = {
        email
      }

      return res.redirect('/posts')
    }
  }
  res.redirect('/auth/signin')
})

app.get('/auth/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.redirect('/')

    res.clearCookie(req.app.get('cookieName'))
    return res.redirect('/')
  })
})

app.get('/posts', checkAuth, (req, res) => {
  const postsQuery = req.query
  let postsForRender = db.posts
  if (postsQuery.limit !== undefined && Number.isNaN(+postsQuery.limit) === false) {
    postsForRender = db.posts.slice(0, postsQuery.limit)
  }

  if (postsQuery.reverse === '') {
    postsForRender = postsForRender.reverse()
  }

  res.render('posts', { listOfPosts: postsForRender })
})

app.post('/newpost', (req, res) => {
  const dataFromUser = req.body
  const currentEmail = req.session?.user?.email
  const userId = { id: currentEmail }
  const dataFromUserWithId = Object.assign(dataFromUser, userId)
  db.posts.unshift(dataFromUserWithId)
  res.redirect('/posts')

})

app.delete('/post', (req, res) => {
  const currentEmail = req.session?.user?.email
  const { action } = req.body
  const currentPostIndex = db.posts.findIndex((post) => post.id === action)
  const currentPost = db.posts[currentPostIndex]
  const currentPostId = currentPost.id
  if (currentPostId == currentEmail) {
    db.posts.splice(currentPostIndex, 1)
    return res.sendStatus(200)
  } else {
    res.sendStatus(403)
  }
})

app.listen(PORT, () => {
})