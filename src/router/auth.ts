// src/router/auth.ts
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

// --- JWT発行の共通関数 ---
const createToken = async (user: { id: string, email: string }, secret: string) => {
  return await sign({ sub: user.id, email: user.email, exp: Math.floor(Date.now()/1000)+86400 }, secret)
}//ユーザIDと有効期限、秘密鍵で署名

// 1. メアド登録
const authSchema = z.object({ email: z.email(), password: z.string().min(8) })

//zValidator→門番　ミドルウェア→メインの処理{}の中身が走る前の門番。送られてきたデータが決めて置いたルールauthSchemaを守っているかをチェック
authApp.post('/signup', zValidator('json', authSchema), async (c) => { //cって何モノ？contextの頭文字の箱　リクエストからレスポンスまでの一階のやり取りに必要な全ての情報と道具
  const { email, password } = c.req.valid('json') //データの受け取り 片がちゃんと付いた安全なデータを受け取る
  try {//try→安全装置　try{まずはこれをやってみて}もしエラーが起きたらcatch(e)に飛び、エラーを返す。
    const user = await authService.registerEmail(c.var.db, email, password)
    const token = await createToken(user, c.env.JWT_SECRET)
    return c.json({ token, user })
  } catch (e) {
    return c.json({ error: 'User already exists' }, 409)
  }
})

// 2. メアドログイン
authApp.post('/login', zValidator('json', authSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  const user = await authService.verifyEmailUser(c.var.db, email, password)
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)
  
  const token = await createToken(user, c.env.JWT_SECRET)
  return c.json({ token, user })
})

// 3. Google認証開始
authApp.get('/google', async (c) => {
  // console.log('🚀 Auth Start Clicked! Time:', new Date().toISOString())

  const google = new Google(c.env.GOOGLE_CLIENT_ID, c.env.GOOGLE_CLIENT_SECRET, 'http://localhost:8787/auth/google/callback')
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const scopes = ["profile","email"]
  const url = await google.createAuthorizationURL(state, codeVerifier, scopes);

  //stateとcodeVerifierをCookieブラウザに一時保存しておく
  setCookie(c, 'state', state, { 
    httpOnly: true, 
    secure: false, //localhostではfalseにしておく。本番はtrue
    path: '/',
    sameSite: 'Lax',
    maxAge: 60 * 10 // 10分間有効など、時間を設定しておくと安心
  })
  setCookie(c, 'code_verifier', codeVerifier, { 
    httpOnly: true, 
    secure: false,
    path: '/', 
    sameSite: 'Lax',
    maxAge: 60 * 10
  })
  
  return c.redirect(url.toString())
})

// 4. Googleコールバックがうまくいってないっぽい
authApp.get('/google/callback', async (c) => {
  const google = new Google(c.env.GOOGLE_CLIENT_ID, c.env.GOOGLE_CLIENT_SECRET, 'http://localhost:8787/auth/google/callback')
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
    return c.json({ token, user }) // 本番ではフロントエンドへリダイレクト推奨
  } catch (e) {
    console.error('認証エラー発生!!!')
    console.error(e)
    return c.json({ error: 'Auth failed' }, 500)
  }
})

export default authApp