// This file handles environment configuration

// Function to get environment variables with validation
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue

  if (!value) {
    throw new Error(`Environment variable ${key} is not set`)
  }

  return value
}

// Export environment variables
export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || "",
  },
}
