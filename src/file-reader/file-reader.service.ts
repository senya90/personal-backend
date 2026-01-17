import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { readFile, access, constants } from 'fs/promises'

@Injectable()
export class FileReaderService {
  private readonly logger = new Logger(FileReaderService.name)

  async readFile(filePath: string): Promise<string | null> {
    if (!filePath) return null

    try {
      await access(filePath, constants.R_OK)
      const content = await readFile(filePath, 'utf8')
      return content.trim()
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        const message = `File not found: ${filePath}`
        this.logger.warn(message)
        throw new NotFoundException(message)
      }

      const message = `Error reading file ${filePath}`
      this.logger.error(message, error)
      throw new InternalServerErrorException(
        error instanceof Error ? `${message}: ${error.message}` : message
      )
    }
  }
}
