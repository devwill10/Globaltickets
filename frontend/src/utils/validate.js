// Returns an error message, or '' if the password is acceptable.
export function passwordError(pw) {
  if (!pw) return 'Create a password.'
  if (pw.length < 8 || !/[a-zA-Z]/.test(pw) || !/\d/.test(pw)) return 'Use at least 8 characters, with letters and numbers.'
  return ''
}
