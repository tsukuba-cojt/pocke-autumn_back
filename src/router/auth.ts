import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'
import { sign } from 'hono/jwt'
import { Google } from 'arctic'
import { generateState, generateCodeVerifier } from 'arctic'
import { getCookie, setCookie } from 'hono/cookie'

import { AppEnv } from '../middleware/db'
import { authService } from '../features/auth/service'

export const authApp = new Hono<AppEnv>()

//JWT発行の共通関数
const createToken = async (user: { id: string, email: string }, secret: string) => {
  return await sign({ sub: user.id, email: user.email, exp: Math.floor(Date.now()/1000)+86400 }, secret)
}

const authSchema = z.object({ email: z.email(), password: z.string().min(8) })
//新規登録
authApp.post('/signup', zValidator('json', authSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  try {
    const user = await authService.registerEmail(c.var.db, email, password)
    const token = await createToken(user, c.env.JWT_SECRET)
    return c.json({ token, user })
  } catch (e) {
    return c.json({ error: 'User already exists' }, 409)
  }
})



// メアドログイン
authApp.post('/login', zValidator('json', authSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const user = await authService.verifyEmailUser(c.var.db, email, password)

  if (!user) {
    console.log(`[Login Failed] ${email}: User not found or Password mismatch`)
    
    return c.json({ 
      error: 'メールアドレスまたはパスワードが違います' 
    }, 401)
  }

  const token = await createToken(user, c.env.JWT_SECRET)
  return c.json({ token, user })
})

// 3. Google認証開始
authApp.get('/google', async (c) => {
  // console.log('🚀 Auth Start Clicked! Time:', new Date().toISOString())

  const google = new Google(c.env.GOOGLE_CLIENT_ID, c.env.GOOGLE_CLIENT_SECRET, 'http://127.0.0.1:8787/auth/google/callback')
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const scopes = ["profile","email"]
  const url = await google.createAuthorizationURL(state, codeVerifier, scopes);

  //stateとcodeVerifierをCookieブラウザに一時保存しておく
  setCookie(c, 'state', state, { 
    secure: false, //localhostではfalseにしておく。本番はtrue
    path: '/',
    httpOnly: true, 
    sameSite: 'Lax',
    maxAge: 60 * 10
  })

  setCookie(c, 'code_verifier', codeVerifier, {   
    secure: false,
    path: '/', 
    httpOnly: true, 
    sameSite: 'Lax',
    maxAge: 60 * 10
  })
  
  return c.redirect(url.toString())
})

// 4. Googleコールバック
authApp.get('/google/callback', async (c) => {
  const google = new Google(c.env.GOOGLE_CLIENT_ID, c.env.GOOGLE_CLIENT_SECRET, 'http://127.0.0.1:8787/auth/google/callback')
  const url = new URL(c.req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const storedState = getCookie(c, 'state')
  const storedVerifier = getCookie(c, 'code_verifier')

  // console.log('Debug Auth:', { 
  //     codeExists: !!code, 
  //     stateMatches: state === storedState, 
  //     storedVerifier,
  //     receivedState: state,
  //     cookieState: storedState
  // });

  if (!code || !storedVerifier || state !== storedState) return c.json({ error: 'Invalid request' }, 400)

  try {
    const tokens = await google.validateAuthorizationCode(code, storedVerifier)
    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.accessToken()}` }
    })
    const googleUser = await res.json() as any

    // Serviceで保存 or 取得
    const user = await authService.loginWithGoogle(c.var.db, {
      id: googleUser.sub, email: googleUser.email, picture: googleUser.picture
    })

    const token = await createToken(user, c.env.JWT_SECRET)
    return c.redirect("http://127.0.0.1:8787/") // 本番ではフロントエンドへリダイレクト推奨
  } catch (e) {
    console.error('認証エラー発生')
    console.error(e)
    return c.json({ error: 'Auth failed' }, 500)
  }
})

export default authApp