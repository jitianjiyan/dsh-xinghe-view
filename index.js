/**
 * 星河视图 · 宿主侧
 *
 * 浏览器里的行星连线只存在 localStorage，模型看不到。这里把链接表同步到宿主，
 * 并在某条链接会话收到用户消息时，把内容追加到它的邻居会话日志里 —— 邻居下次
 * 组装上下文时就能读到另一边的对话。
 */
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

const STORE = join(homedir(), '.dsh', 'xinghe-view', 'links.json')
const TAG = '⟦星河互读⟧'
const MAX_SEEN = 4096

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

/** 把若干邻居会话的最近消息收成一段纯文本，供 prompt 注入或工具返回。 */
function digestFor(ctx, neighbors, limit) {
  const blocks = []
  for (const id of neighbors) {
    const session = ctx.sessions.get(id)
    if (!session) continue
    const lines = safeMessages(session)
      .slice(-limit)
      .map((m) => textOf(m))
      .filter(Boolean)
      .map((t) => `- ${truncate(t, 280)}`)
    if (lines.length) blocks.push(`会话 ${id}：\n${lines.join('\n')}`)
  }
  return blocks.join('\n\n')
}

export const name = 'dsh-xinghe-view'
export const inject = ['sessions', 'webServer', 'tools']

export function apply(ctx) {
  const seen = new Set()
  const turnSeen = new Set()

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
        for await (const chunk of req) chunks.push(chunk)
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

  ctx.on('session/event', (session, event) => {
    if (!event || event.type !== 'user/message') return
    if (state.settings.mode === 'turn') return
    if (state.settings.broadcast === false) return
    const source = event.data && event.data.source
    if (!source || source.kind !== 'user') return

    const text = textOf(event.data)
    if (!text || text.startsWith(TAG)) return

    const key = `${session.id}:${event.seq}`
    if (seen.has(key)) return
    seen.add(key)
    if (seen.size > MAX_SEEN) {
      // 直接 clear 会让刚被丢掉的事件在下一轮重复转发一次；逐出最早的一条即可。
      const oldest = seen.values().next().value
      if (oldest !== undefined) seen.delete(oldest)
    }

    const targets = neighborsOf(session.id)
    if (!targets.length) return

    const label = session.id
    for (const id of targets) {
      const target = ctx.sessions.get(id)
      if (!target) continue
      try {
        target.append(
          'user/message',
          {
            id: `xinghe-${session.id}-${event.seq}`,
            role: 'user',
            content: [{ type: 'text', text: `${TAG} 来自会话 ${label}：\n${text}` }],
            source: { kind: 'user' },
          },
          { surfaceOp: 'append' },
        )
      } catch (error) {
        ctx.logger?.warn?.(`[xinghe-view] 转发到 ${id} 失败: ${String(error)}`)
      }
    }
  })

  /* 「每轮刷新」模式：不改对方日志，只在每轮开始时把邻居最近的动态注入一次。 */
  ctx.on('agent/pre-step', async (payload, next) => {
    const decision = await next()
    if (!decision || decision.kind !== 'enter') return decision
    if (state.settings.mode !== 'turn') return decision
    const id = payload && payload.agent && payload.agent.id
    if (!id) return decision
    const neighbors = neighborsOf(id)
    if (!neighbors.length) return decision

    const stamp = `${id}:${payload.turn}`
    if (turnSeen.has(stamp)) return decision
    const digest = digestFor(ctx, neighbors, 6)
    if (!digest) return decision
    turnSeen.add(stamp)
    if (turnSeen.size > MAX_SEEN) turnSeen.clear()

    const injected = {
      id: `xinghe-turn-${id}-${payload.turn}`,
      role: 'user',
      content: [
        {
          type: 'text',
          text: `${TAG} 与你链接的会话最近动态（仅供了解，不必回复）：\n${digest}`,
        },
      ],
      source: { kind: 'user' },
    }
    return {
      kind: 'enter',
      messages: [...decision.messages, injected],
      ...(decision.startsRequestSeries ? { startsRequestSeries: true } : {}),
    }
  })
}
