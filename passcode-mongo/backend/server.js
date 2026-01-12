const express = require('express')
const dotenv = require('dotenv')
const { MongoClient, ObjectId } = require('mongodb')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const validator = require('validator')

dotenv.config()

// Validate required env vars
if (!process.env.MONGO_URI) {
	console.error('MONGO_URI is not set')
	process.exit(1)
}
if (!process.env.DB_NAME) {
	console.error('DB_NAME is not set')
	process.exit(1)
}
if (!process.env.JWT_SECRET) {
	console.error('JWT_SECRET is not set')
	process.exit(1)
}

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors({
	origin: 'http://localhost:5173',
	credentials: true
}))

// Session configuration
app.use(session({
	secret: process.env.JWT_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: {
		secure: false, // Set to true in production with HTTPS
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000 // 24 hours
	}
}))

// Authentication middleware
const authenticateToken = (req, res, next) => {
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]

	if (!token) {
		return res.status(401).json({ success: false, error: 'Access token required' })
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			return res.status(403).json({ success: false, error: 'Invalid or expired token' })
		}
		req.user = user
		next()
	})
}

let client
let db

async function start() {
	try {
		client = new MongoClient(process.env.MONGO_URI)
		await client.connect()
		db = client.db(process.env.DB_NAME)

		// API Routes
		app.use('/api', (req, res, next) => {
			// Add API prefix handling
			next()
		})

		// Authentication Routes
		// Register
		app.post('/api/auth/register', async (req, res, next) => {
			try {
				const { username, email, phone, password } = req.body

				// Validation
				if (!username || !password) {
					return res.status(400).json({ success: false, error: 'Username and password are required' })
				}

				if (!email && !phone) {
					return res.status(400).json({ success: false, error: 'Email or phone number is required' })
				}

				if (email && !validator.isEmail(email)) {
					return res.status(400).json({ success: false, error: 'Invalid email format' })
				}

				if (phone && !validator.isMobilePhone(phone)) {
					return res.status(400).json({ success: false, error: 'Invalid phone number format' })
				}

				// Check if user already exists
				const existingUser = await db.collection('users').findOne({
					$or: [
						{ username: username },
						...(email ? [{ email: email }] : []),
						...(phone ? [{ phone: phone }] : [])
					]
				})

				if (existingUser) {
					return res.status(400).json({ success: false, error: 'User already exists with this username, email, or phone' })
				}

				// Hash password
				const saltRounds = 10
				const hashedPassword = await bcrypt.hash(password, saltRounds)

				// Create user
				const user = {
					username,
					email: email || null,
					phone: phone || null,
					password: hashedPassword,
					createdAt: new Date()
				}

				const result = await db.collection('users').insertOne(user)
				const userId = result.insertedId

				// Generate JWT token
				const token = jwt.sign(
					{ userId: userId.toString(), username },
					process.env.JWT_SECRET,
					{ expiresIn: '24h' }
				)

				res.status(201).json({
					success: true,
					token,
					user: { id: userId, username, email, phone }
				})
			} catch (err) {
				next(err)
			}
		})

		// Login
		app.post('/api/auth/login', async (req, res, next) => {
			try {
				const { identifier, password } = req.body // identifier can be username, email, or phone

				if (!identifier || !password) {
					return res.status(400).json({ success: false, error: 'Identifier and password are required' })
				}

				// Find user by username, email, or phone
				const user = await db.collection('users').findOne({
					$or: [
						{ username: identifier },
						{ email: identifier },
						{ phone: identifier }
					]
				})

				if (!user) {
					return res.status(401).json({ success: false, error: 'Invalid credentials' })
				}

				// Verify password
				const isValidPassword = await bcrypt.compare(password, user.password)
				if (!isValidPassword) {
					return res.status(401).json({ success: false, error: 'Invalid credentials' })
				}

				// Generate JWT token
				const token = jwt.sign(
					{ userId: user._id.toString(), username: user.username },
					process.env.JWT_SECRET,
					{ expiresIn: '24h' }
				)

				res.json({
					success: true,
					token,
					user: { id: user._id, username: user.username, email: user.email, phone: user.phone }
				})
			} catch (err) {
				next(err)
			}
		})

		// Get current user
		app.get('/api/auth/me', authenticateToken, async (req, res, next) => {
			try {
				const user = await db.collection('users').findOne(
					{ _id: new ObjectId(req.user.userId) },
					{ projection: { password: 0 } }
				)

				if (!user) {
					return res.status(404).json({ success: false, error: 'User not found' })
				}

				res.json({ success: true, user })
			} catch (err) {
				next(err)
			}
		})

		// Protected Password Routes
		app.get('/api/passwords', authenticateToken, async (req, res, next) => {
			try {
				const passwords = await db.collection('passwords').find({ userId: req.user.userId }).toArray()
				res.json(passwords)
			} catch (err) {
				next(err)
			}
		})

		app.post('/api/passwords', authenticateToken, async (req, res, next) => {
			try {
				const password = { ...req.body, userId: req.user.userId }
				const result = await db.collection('passwords').insertOne(password)
				res.status(201).json({ success: true, result })
			} catch (err) {
				next(err)
			}
		})

		app.delete('/api/passwords/:id', authenticateToken, async (req, res, next) => {
			try {
				const { id } = req.params
				if (!ObjectId.isValid(id)) {
					return res.status(400).json({ success: false, error: 'Invalid id' })
				}

				// Verify the password belongs to the user
				const password = await db.collection('passwords').findOne({ _id: new ObjectId(id) })
				if (!password || password.userId !== req.user.userId) {
					return res.status(404).json({ success: false, error: 'Password not found' })
				}

				const result = await db.collection('passwords').deleteOne({ _id: new ObjectId(id) })
				res.json({ success: true, result })
			} catch (err) {
				next(err)
			}
		})

		// Legacy routes for backward compatibility (redirect to protected routes)
		app.get('/', authenticateToken, async (req, res, next) => {
			try {
				const passwords = await db.collection('passwords').find({ userId: req.user.userId }).toArray()
				res.json(passwords)
			} catch (err) {
				next(err)
			}
		})

		app.post('/', authenticateToken, async (req, res, next) => {
			try {
				const password = { ...req.body, userId: req.user.userId }
				const result = await db.collection('passwords').insertOne(password)
				res.status(201).json({ success: true, result })
			} catch (err) {
				next(err)
			}
		})

		app.delete('/:id', authenticateToken, async (req, res, next) => {
			try {
				const { id } = req.params
				if (!ObjectId.isValid(id)) {
					return res.status(400).json({ success: false, error: 'Invalid id' })
				}

				// Verify the password belongs to the user
				const password = await db.collection('passwords').findOne({ _id: new ObjectId(id) })
				if (!password || password.userId !== req.user.userId) {
					return res.status(404).json({ success: false, error: 'Password not found' })
				}

				const result = await db.collection('passwords').deleteOne({ _id: new ObjectId(id) })
				res.json({ success: true, result })
			} catch (err) {
				next(err)
			}
		})

		// Error handler
		app.use((err, req, res, next) => {
			console.error(err)
			res.status(500).json({ success: false, error: 'Internal Server Error' })
		})

		const server = app.listen(port, () => {
			console.log(`Backend listening on http://localhost:${port}`)
		})

		// Graceful shutdown
		const shutdown = async () => {
			console.log('Shutting down...')
			server.close(() => console.log('HTTP server closed'))
			try {
				if (client) await client.close()
			} finally {
				process.exit(0)
			}
		}
		process.on('SIGINT', shutdown)
		process.on('SIGTERM', shutdown)
	} catch (err) {
		console.error('Failed to start server', err)
		process.exit(1)
	}
}

start()