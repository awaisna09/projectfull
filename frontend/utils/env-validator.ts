/**
 * Environment Variable Validator
 * 
 * Validates that all required environment variables are present
 * and properly configured before the app starts.
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Supabase Configuration
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  
  // Optional Configuration
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_DEBUG?: string;
  readonly NODE_ENV?: string;
  readonly PROD: boolean;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface EnvConfig {
  // Supabase Configuration
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
  
  // Optional Configuration
  VITE_API_BASE_URL?: string;
  VITE_ENABLE_DEBUG?: string;
  NODE_ENV?: string;
}

export class EnvValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvValidationError';
  }
}

/**
 * List of required environment variables
 */
const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

/**
 * List of optional environment variables with their defaults
 */
const OPTIONAL_ENV_VARS: Record<string, string> = {
  VITE_API_BASE_URL: 'http://localhost:8000',
  VITE_ENABLE_DEBUG: 'false',
  NODE_ENV: 'development',
};

/**
 * Validates that required environment variables are present
 * @throws {EnvValidationError} If any required env var is missing
 */
export function validateEnv(): void {
  const env = import.meta.env as EnvConfig;
  const missing: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const key of REQUIRED_ENV_VARS) {
    if (!env[key] || env[key]?.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new EnvValidationError(
      `Missing required environment variables:\n${missing.map(v => `  - ${v}`).join('\n')}\n\n` +
      `Please create a .env file in the project root with these variables.`
    );
  }

  // Check for common mistakes
  if (env.VITE_SUPABASE_URL && !env.VITE_SUPABASE_URL.startsWith('http')) {
    warnings.push('VITE_SUPABASE_URL should start with http:// or https://');
  }

  if (env.VITE_SUPABASE_ANON_KEY && env.VITE_SUPABASE_ANON_KEY.length < 100) {
    warnings.push('VITE_SUPABASE_ANON_KEY seems too short. Are you sure it\'s correct?');
  }

  // Log warnings in development
  if (warnings.length > 0 && env.NODE_ENV === 'development') {
    console.warn('⚠️ Environment Configuration Warnings:');
    warnings.forEach(warning => console.warn(`   - ${warning}`));
  }

  // Log success
  console.log('✅ Environment variables validated successfully');
}

/**
 * Gets an environment variable with type safety
 * @param key - The environment variable key
 * @param defaultValue - Optional default value if not found
 * @returns The environment variable value or default
 */
export function getEnv(key: keyof EnvConfig, defaultValue?: string): string {
  const env = import.meta.env as EnvConfig;
  const value = env[key];
  
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    
    // Check if it's optional with a default
    if (key in OPTIONAL_ENV_VARS) {
      return OPTIONAL_ENV_VARS[key];
    }
    
    throw new EnvValidationError(`Environment variable ${key} is not set and has no default`);
  }
  
  return value;
}

/**
 * Gets a boolean environment variable
 * @param key - The environment variable key
 * @param defaultValue - Default value if not found
 * @returns Boolean value
 */
export function getEnvBool(key: keyof EnvConfig, defaultValue = false): boolean {
  try {
    const value = getEnv(key, defaultValue.toString());
    return value.toLowerCase() === 'true' || value === '1';
  } catch {
    return defaultValue;
  }
}

/**
 * Gets a number environment variable
 * @param key - The environment variable key
 * @param defaultValue - Default value if not found
 * @returns Number value
 */
export function getEnvNumber(key: keyof EnvConfig, defaultValue = 0): number {
  try {
    const value = getEnv(key, defaultValue.toString());
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  } catch {
    return defaultValue;
  }
}

/**
 * Checks if the app is running in production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD || import.meta.env.NODE_ENV === 'production';
}

/**
 * Checks if the app is running in development
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV || import.meta.env.NODE_ENV === 'development';
}

/**
 * Gets all environment variables for debugging (masks sensitive values)
 */
export function getEnvSummary(): Record<string, string> {
  const env = import.meta.env as EnvConfig;
  const summary: Record<string, string> = {};
  
  for (const key in env) {
    if (key.startsWith('VITE_')) {
      // Mask sensitive keys
      if (key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')) {
        summary[key] = '***MASKED***';
      } else {
        summary[key] = env[key as keyof EnvConfig] || '';
      }
    }
  }
  
  return summary;
}
