const express = require('express')
const path = require('path')
const hbs = require('hbs')
const cookieParser = require('cookie-parser')
const res = require('express/lib/response')
const { db } = require('./DB')
const { join } = require('path')
const { sessions } = require('./sessions')
const { checkAuth } = require('./src/middlewares/checkAuth')
const { v4: uuidv4 } = require('uuid')

const app = express()
const PORT = process.env.PORT || 3000


app.set('view engine', 'hbs')
app.set('views', path.join(process.env.PWD, 'src', 'views'))
hbs.registerPartials(path.join(process.env.PWD, 'src', 'views', 'partials'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(process.env.PWD, 'public')))

app.use((req, res, next) => {
  const sidFromUser = req.cookies.sid
  const currentEmail = sessions[sidFromUser]

  if (currentEmail) {
    const currentUserName = db.users.find((user) => user.email === currentEmail.email)
    res.locals.name = currentUserName.name
  }

  next()
})

app.get('/', (req, res) => {
  res.render('main')
})

app.get('/auth/signup', (req, res) => {
  res.render('signUp')
})

app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body

  db.users.push({
    name,
    email,
    password,
  })

  const sid = Date.now()

  sessions[sid] = {
    email,
  }

  res.cookie('sid', sid, {
    httpOnly: true,
  })

  res.redirect('/posts')
})

app.get('/auth/signin', (req, res) => {
  res.render('signIn')
})

app.post('/auth/signin', (req, res) => {
  const { email, password } = req.body

  const currentUser = db.users.find((user) => user.email === email)

  if (currentUser) {
    if (currentUser.password === password) {

      const sid = Date.now()
      sessions[sid] = {
        email,
      }

      res.cookie('sid', sid, {
        httpOnly: true,
      })

      return res.redirect('/posts')
    }
  }
  res.redirect('/auth/signin')
})

app.get('/auth/signout', (req, res) => {
  const sidFromUserCookie = req.cookies.sid

  delete sessions[sidFromUserCookie]

  res.clearCookie('sid')
  res.redirect('/')
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
  const sidFromUserCookie = req.cookies.sid
  const dataFromUser = req.body
  const userId = { id: [sidFromUserCookie] }
  const rndmId = uuidv4()
  const postId = { postId: [rndmId] }
  const dataFromUserWithId = Object.assign(dataFromUser, userId, postId)
  db.posts.unshift(dataFromUserWithId)
  res.redirect('/posts')

})

app.delete('/post', (req, res) => {
  const sidFromUserCookie = req.cookies.sid
  const { action } = req.body
  const currentPostIndex = db.posts.findIndex((post) => post.postId == action)
  const currentPost = db.posts[currentPostIndex]
  const currentPostId = currentPost.id
  if (currentPostId == sidFromUserCookie) {
    db.posts.splice(currentPostIndex, 1)
    return res.sendStatus(200)
  } else {
    res.sendStatus(403)
  }
})

app.listen(PORT, () => {
})