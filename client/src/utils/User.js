export function getName(data) {
  const { firstName, lastName, fullName } = data
  if (fullName) return fullName
  if (!firstName && !lastName) return '-'
  if (firstName && lastName) return `${firstName} ${lastName}`
  if (lastName) return lastName
  return firstName
}

export function getFirstLetter(data) {
  const name = getName(data)
  return name.charAt(0).toUpperCase()
}
