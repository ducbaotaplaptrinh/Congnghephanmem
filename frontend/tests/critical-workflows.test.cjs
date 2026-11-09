const test = require('node:test')
const assert = require('node:assert/strict')
const vm = require('node:vm')
const fs = require('node:fs')
const path = require('node:path')

async function setup(handler) {
  const values = new Map()
  const calls = []
  const localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  }
  const context = vm.createContext({ localStorage, URLSearchParams, console, fetch: async (url, options) => {
    calls.push({ url, options })
    return handler(url, options)
  } })
  const load = (file) => new vm.SourceTextModule(fs.readFileSync(path.join(__dirname, '../src/services', file), 'utf8'), {
    context, initializeImportMeta(meta) { meta.env = {} }
  })
  const api = load('api.js')
  await api.link(() => { throw new Error('Unexpected import') })
  await api.evaluate()
  async function service(file) {
    const mod = load(file)
    await mod.link(() => api)
    await mod.evaluate()
    return mod.namespace.default
  }
  return { api: api.namespace, service, calls, values }
}
const response = (status, data) => ({ ok: status >= 200 && status < 300, status, json: async () => data })

test('401 does not cause automatic admin login or retry', async () => {
  const env = await setup(() => response(401, { message: 'Không được phép' }))
  await assert.rejects(env.api.request('/patients'), /Không được phép/)
  assert.equal(env.calls.length, 1)
  assert.equal(env.calls[0].options.headers.Authorization, undefined)
})

test('failed login and registration never create a session or report success', async () => {
  const env = await setup(() => response(401, { message: 'Sai thông tin' }))
  const auth = await env.service('authService.js')
  await assert.rejects(auth.login('admin', 'wrong'), /Sai thông tin/)
  await assert.rejects(auth.register({ username: 'a', password: 'b' }), /Sai thông tin/)
  assert.equal(env.values.size, 0)
})

test('mock sessions cannot be restored or sent', async () => {
  const env = await setup(() => response(200, {}))
  env.values.set('clinic_token', 'mock-jwt-token')
  env.values.set('clinic_user', '{"role":"ADMIN"}')
  const auth = await env.service('authService.js')
  assert.equal(auth.getCurrentUser(), null)
  await env.api.request('/patients')
  assert.equal(env.calls[0].options.headers.Authorization, undefined)
})

test('patient list preserves empty responses and propagates failures', async () => {
  let failed = false
  const env = await setup(() => failed ? response(500, { message: 'CSDL lỗi' }) : response(200, { data: [] }))
  const patients = await env.service('patientService.js')
  assert.equal((await patients.getAll()).length, 0)
  failed = true
  await assert.rejects(patients.getAll(), /CSDL lỗi/)
  await assert.rejects(patients.delete(1), /CSDL lỗi/)
})
