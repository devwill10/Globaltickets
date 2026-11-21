import DOMPurify from 'dompurify'

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') node.setAttribute('rel', 'noopener noreferrer nofollow')
})

// Event descriptions are organiser-written HTML: always clean before showing.
export const cleanHtml = (html) => DOMPurify.sanitize(html || '', { ADD_ATTR: ['target'] })
