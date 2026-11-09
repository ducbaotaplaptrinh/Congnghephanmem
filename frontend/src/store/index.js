// Simple state management store
export const store = {
  state: {
    sidebarOpen: true,
    theme: 'light'
  },
  listeners: new Set(),
  subscribe(fn) {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  },
  setState(updater) {
    this.state = typeof updater === 'function' ? updater(this.state) : { ...this.state, ...updater }
    this.listeners.forEach(fn => fn(this.state))
  }
}

export default store
