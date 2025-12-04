export class PublicError extends Error {}

export class ValidationError extends Error {
  title: string
  description: string

  constructor(title: string, description: string) {
    super(description)
    this.title = title
    this.description = description
  }
}
