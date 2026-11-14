/**
 * 星河视图 · 宿主侧
 *
 * 浏览器里的行星连线只存在 localStorage，模型看不到。这里把链接表同步到宿主，
 * 并在会话每一轮开始时，把它自己链接的邻居会话的最近动态写成一条旁注，
 * 追加到**它自己**的日志里 —— 谁都不写别人的日志，也就不会替别人下指令。
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const STORE = join(homedir(), '.dsh', 'xinghe-view', 'links.json')
const TAG = '⟦星河互读⟧'

let state = loadState()

function loadState() {
  try {
    const raw = JSON.parse(readFileSync(STORE, 'utf8'))
    const pairs = Array.isArray(raw && raw.pairs) ? raw.pairs.filter(isPair) : []
    const settings = raw && raw.settings && typeof raw.settings === 'object' ? raw.settings : {}
    return { pairs, settings }
  } catch {
    return { pairs: [], settings: {} }
  }
}

function isPair(value) {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'string' &&
    value[0] &&
    value[1] &&
    value[0] !== value[1]
  )
}

let saving = false
let saveAgain = false

function saveState() {
  // 并发 POST 会各自覆盖整份文件丢更新；串行化，并 write+rename 原子替换。
  if (saving) {
    saveAgain = true
    return
  }
  saving = true
  const temp = `${STORE}.${process.pid}.tmp`
  try {
    mkdirSync(dirname(STORE), { recursive: true })
    writeFileSync(temp, JSON.stringify(state, null, 2), 'utf8')
    renameSync(temp, STORE)
  } catch {
    /* 落盘失败不影响内存里的链接关系 */
  } finally {
    saving = false
    if (saveAgain) {
      saveAgain = false
      queueMicrotask(saveState)
    }
  }
}

function neighborsOf(id) {
  const out = new Set()
  for (const [a, b] of state.pairs) {
    if (a === id) out.add(b)
    if (b === id) out.add(a)
  }
  out.delete(id)
  return [...out]
}

function textOf(message) {
  const parts = []
  const content = message && message.content
  if (!Array.isArray(content)) return ''
  for (const block of content) {
    if (block && block.type === 'text' && typeof block.text === 'string' && block.text.trim()) {
      parts.push(block.text)
    }
  }
  return parts.join('\n').trim()
}

function truncate(text, max) {
  const s = String(text || '').replace(/\s+/g, ' ').trim()
  return s.length > max ? `${s.slice(0, max)}…` : s
}

function safeMessages(session) {
  try {
    return typeof session.deriveMessages === 'function' ? session.deriveMessages() : []
  } catch {
    return []
  }
}

export const name = 'dsh-xinghe-view'
export const inject = ['sessions', 'webServer', 'tools']

export function apply(ctx) {

  /* 只读工具：让模型自己按需翻阅链接会话，而不是把全部内容塞进上下文。 */
  ctx.effect(() =>
    ctx.tools.register({
      name: 'xinghe_read',
      description:
        '读取与当前会话通过「星河视图」链接的其他会话的最近消息。不传 session 时列出全部链接会话及最近动态。',
      parameters: {
        type: 'object',
        properties: {
          session: { type: 'string', description: '链接会话的 id 或其前缀；省略则读取全部链接会话。' },
          limit: { type: 'number', description: '每个会话返回的最近消息条数，默认 8，上限 40。' },
        },
        required: [],
      },
      output: {
        schema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'] },
        render: (_args, value) => [{ type: 'text', text: String((value && value.text) || '') }],
      },
      async execute(args, exec) {
        const self = exec && exec.agent && exec.agent.id
        if (!self) return { text: '无法确定当前会话，读不到链接内容。' }
        if (state.settings && state.settings.mode === 'off') {
          return { text: '会话互通当前是「仅连线」模式。需要读链接会话的内容时，请在星河视图顶栏把模式切到「会话互通」。' }
        }
        const neighbors = neighborsOf(self)
        if (!neighbors.length) return { text: '当前会话还没有链接任何其他会话。' }
        const limit = Math.max(1, Math.min(40, Number(args && args.limit) || 8))
        const want = args && typeof args.session === 'string' ? args.session.trim() : ''
        const targets = want
          ? neighbors.filter((id) => id === want || id.startsWith(want))
          : neighbors
        if (!targets.length) {
          return { text: `没有匹配 "${want}" 的链接会话。已链接：${neighbors.join(', ')}` }
        }
        const blocks = []
        for (const id of targets) {
          const session = ctx.sessions.get(id)
          if (!session) {
            blocks.push(`会话 ${id}：当前未加载，读不到消息。`)
            continue
          }
          const lines = safeMessages(session)
            .slice(-limit)
            .map((m) => textOf(m))
            .filter(Boolean)
            .map((t) => `- ${truncate(t, 600)}`)
          blocks.push(`会话 ${id}（最近 ${lines.length} 条）：\n${lines.join('\n') || '（空）'}`)
        }
        return { text: blocks.join('\n\n') }
      },
    }),
  )

  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'exact',
      path: '/xinghe/links',
      handler: async (req, res) => {
        const send = (status, data) => {
          res.writeHead(status, {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          })
          res.end(req.method === 'HEAD' ? undefined : JSON.stringify(data))
        }

        if (req.method === 'GET' || req.method === 'HEAD') return send(200, state)
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'GET, POST' })
          return res.end()
        }

        const chunks = []
        let size = 0
        for await (const chunk of req) {
          size += chunk.length
          if (size > 1 << 20) {
            /* 链接表最多几百条，超过 1MB 一定是异常输入。 */
            res.writeHead(413)
            return res.end()
          }
          chunks.push(chunk)
        }
        let body = null
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        } catch {
          body = null
        }
        if (!body || typeof body !== 'object') return send(400, { error: 'bad-request' })

        const keyOf = (pair) => (pair[0] < pair[1] ? `${pair[0]}|${pair[1]}` : `${pair[1]}|${pair[0]}`)
        let pairs
        if (Array.isArray(body.pairs)) {
          /* 整份同步：首次载入或老客户端，按提交内容完全替换。 */
          pairs = []
          const seen = new Set()
          for (const pair of body.pairs) {
            if (!isPair(pair)) continue
            const key = keyOf(pair)
            if (seen.has(key)) continue
            seen.add(key)
            pairs.push([pair[0], pair[1]])
          }
        } else if (Array.isArray(body.add) || Array.isArray(body.remove)) {
          /* 增量同步：只增删这一条，别的窗口 concurrently 加的线不会被覆盖。 */
          const map = new Map(state.pairs.map((pair) => [keyOf(pair), pair]))
          for (const pair of Array.isArray(body.add) ? body.add : []) {
            if (isPair(pair)) map.set(keyOf(pair), [pair[0], pair[1]])
          }
          for (const pair of Array.isArray(body.remove) ? body.remove : []) {
            if (isPair(pair)) map.delete(keyOf(pair))
          }
          pairs = [...map.values()]
        } else {
          return send(400, { error: 'bad-request' })
        }

        state = {
          pairs,
          settings: {
            ...state.settings,
            ...(body.settings && typeof body.settings === 'object' ? body.settings : {}),
          },
        }
        saveState()
        return send(200, { ok: true, count: pairs.length })
      },
    }),
  )

  /* 这里曾经有 session/event 实时转发：把 A 的消息写进 B 的日志。
     两个问题都致命——写对方日志等于替对方下了一条指令，而且 developer/message
     必须带 turn/step，实时事件里拿不到，校验直接让该轮失败。
     现在只保留下面按轮注入：谁都不写别人的日志。 */

  /* 这里曾经在 agent/pre-step 里 append('developer/message')，把邻居动态写成
     自己的一条旁注。但 pre-step 发生的时刻 step 还没 start，事件会落在
     step/end 与下一个 step/start 之间；宿主要求 developer/message 的 turn/step
     必须与当前打开的轮次完全一致（dsh-session-format-v3-to-v4/lib/index.js:574），
     于是整份日志被判 corrupt：
       stored log is corrupt: developer/message does not match an open turn and step
     现在不再写任何会话事件，互读只走 xinghe_read 工具（按需读取，零副作用）。 */
}
