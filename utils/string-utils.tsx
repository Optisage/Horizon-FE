/**
 * Escapes special characters in a string for use in a regular expression
 */
export function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  }
  
  /**
   * Highlights occurrences of a search term in a text string
   */
  export function highlightText(text: string, search: string) {
    if (!search.trim()) return text
  
    const regex = new RegExp(`(${escapeRegExp(search)})`, "gi")
    const parts = text.split(regex)
  
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return (
          <span key={index} className="bg-green-200">
            {part}
          </span>
        )
      } else {
        return part
      }
    })
  }
  