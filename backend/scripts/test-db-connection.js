#!/usr/bin/env node

/**
 * Test database connection script
 * Usage: node scripts/test-db-connection.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (hidden)' : 'Not set');
  console.log('');

  try {
    // Test 1: Simple query
    console.log('Test 1: Running SELECT 1...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✓ Query successful:', result);
    console.log('');

    // Test 2: Check database version
    console.log('Test 2: Getting PostgreSQL version...');
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('✓ PostgreSQL version:', version[0]?.version || 'Unknown');
    console.log('');

    // Test 3: List tables
    console.log('Test 3: Listing tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('✓ Tables found:', tables.length);
    tables.forEach((table, i) => {
      console.log(`  ${i + 1}. ${table.table_name}`);
    });
    console.log('');

    // Test 4: Check Prisma migrations
    console.log('Test 4: Checking Prisma migrations...');
    const migrations = await prisma.$queryRaw`
      SELECT * FROM "_prisma_migrations" 
      ORDER BY finished_at DESC 
      LIMIT 5
    `;
    console.log('✓ Recent migrations:', migrations.length);
    migrations.forEach((migration, i) => {
      console.log(`  ${i + 1}. ${migration.migration_name} (${migration.finished_at || 'pending'})`);
    });
    console.log('');

    console.log('✅ All database tests passed!');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('');
    console.error('Full error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

