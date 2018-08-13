export function isLoggedIn() {
  if (window.localStorage['auth']) {
    return true
  }
	return false
}
