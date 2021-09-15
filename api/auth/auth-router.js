const router = require('express').Router();
const Users = require('../users/users-model');
const bcrypt = require('bcryptjs');

const {
  checkPasswordLength,
  checkUsernameExists,
  checkUsernameFree
} = require('./auth-middleware');


// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!

router.post('/register', checkUsernameFree, checkPasswordLength, (req,res,next) => {
  const { username, password } = req.body;
  // console.log(req.body)
  const hash = bcrypt.hashSync(password, 5)
  Users.add({ username: username, password: hash })
  .then(newUser =>{
    res.status(201).json(newUser)
  })
  .catch(next)
})
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

router.post('/login', checkUsernameExists, (req,res,next) => {
  const { password } = req.body;
  if (bcrypt.compareSync(password, req.user.password)){
    req.session.user = req.user
    res.json({ message: `Welcome ${req.user.username}`})
  } else {
    next({ status: 401, message: "Invalid credentials" })
  }
})

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

router.get('/logout', (req,res) => {
  if (req.session.user) {
    req.session.destroy(err => {
      if(err) {
        res.json({
          message: 'Error logging out'
        })
      } else {
        res.json({ 
          status: 200, message: 'logged out'
        })
      }
    })
  } else {
    res.json({
      status: 200, message: 'no session'
    })
  }
})

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */

 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router;  