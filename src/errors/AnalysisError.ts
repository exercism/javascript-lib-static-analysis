export abstract class AnalysisError extends Error {
  constructor(message: string) {
    super(message)

    Error.captureStackTrace(this, this.constructor)
  }
}
