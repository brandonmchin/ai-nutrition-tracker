#!/usr/bin/env node

/**
 * Deploy script that waits for database and runs migrations
 * This handles the case where the database isn't ready immediately
 */

require('dotenv').config();
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function waitForDatabase(maxRetries = 30, delayMs = 2000) {
  console.log('Waiting for database to be ready...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`✓ Database connection successful (attempt ${i + 1})`);
      await prisma.$disconnect();
      return true;
    } catch (error) {
      const attempt = i + 1;
      if (attempt < maxRetries) {
        console.log(`Attempt ${attempt}/${maxRetries}: Database not ready yet, retrying in ${delayMs}ms...`);
        console.log(`  Error: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error(`✗ Database not available after ${maxRetries} attempts`);
        console.error('Last error:', error.message);
        await prisma.$disconnect();
        return false;
      }
    }
  }
  
  await prisma.$disconnect();
  return false;
}

async function runMigrations() {
  try {
    console.log('Running Prisma migrations...');
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      env: process.env
    });
    console.log('✓ Migrations completed successfully');
    return true;
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('Starting deployment process...');
  console.log('');
  
  const dbReady = await waitForDatabase();
  
  if (!dbReady) {
    console.error('');
    console.error('❌ Deployment failed: Database not available');
    console.error('');
    console.error('Troubleshooting steps:');
    console.error('1. Verify PostgreSQL service is running in Railway');
    console.error('2. Check that services are properly linked');
    console.error('3. Verify DATABASE_URL is set correctly');
    console.error('4. Check Railway service logs for database errors');
    process.exit(1);
  }
  
  console.log('');
  const migrationsSuccess = await runMigrations();
  
  if (!migrationsSuccess) {
    console.error('');
    console.error('❌ Deployment failed: Migrations failed');
    process.exit(1);
  }
  
  console.log('');
  console.log('✅ Deployment completed successfully!');
  process.exit(0);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

