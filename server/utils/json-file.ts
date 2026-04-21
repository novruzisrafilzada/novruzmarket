import { promises as fs } from 'node:fs'

export const replaceJsonFile = async (filePath: string, value: unknown) => {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8')
}
