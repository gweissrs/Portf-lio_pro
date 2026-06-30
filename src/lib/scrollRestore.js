const KEY = 'project_scroll_y'

export const saveProjectScroll = (y) => sessionStorage.setItem(KEY, String(y))

export const peekProjectScroll = () => {
  const raw = sessionStorage.getItem(KEY)
  return raw !== null ? parseFloat(raw) : null
}

export const clearProjectScroll = () => sessionStorage.removeItem(KEY)
