import { AnalysisError } from './AnalysisError'
import { STRUCTURE_ERROR_UNCAUGHT } from './codes'

export class StructureError extends AnalysisError {
  public readonly code: typeof STRUCTURE_ERROR_UNCAUGHT

  constructor(message: string) {
    super(message)

    Error.captureStackTrace(this, this.constructor)
    this.code = STRUCTURE_ERROR_UNCAUGHT
  }
}
