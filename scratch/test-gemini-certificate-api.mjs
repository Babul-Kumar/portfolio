import { geminiCertificateExtractionSchema } from '../lib/validations/index.js'

console.log('=== RUNNING GEMINI CERTIFICATE EXTRACTION SCHEMA TESTS ===\n')

// Test 1: Perfect Full Extraction Output
const sampleGeminiOutput1 = {
  title: 'Machine Learning Specialization',
  issuer: 'Stanford Online & DeepLearning.AI',
  category: 'AI / ML',
  issue_date: '2026-01-10',
  expiry_date: null,
  credential_id: 'STAN-ML-89241',
  verification_url: 'https://coursera.org/verify/specialization',
  description: 'Comprehensive 3-course specialization covering supervised learning, neural networks, and reinforcement learning.',
  skills: ['Python', 'Supervised Learning', 'Neural Networks', 'Unsupervised Learning'],
  confidence: {
    title: 0.98,
    issuer: 0.99,
    category: 0.95,
    issue_date: 0.92,
    expiry_date: 0.0,
    credential_id: 0.88,
    verification_url: 0.9,
    description: 0.95,
    skills: 0.92,
  },
}

try {
  const result1 = geminiCertificateExtractionSchema.parse(sampleGeminiOutput1)
  console.log('✔ Test 1 Passed: Full valid extraction parsed successfully.')
  console.log('  Extracted Title:', result1.title)
  console.log('  Extracted Category:', result1.category)
  console.log('  Extracted Skills:', result1.skills.join(', '))
} catch (e) {
  console.error('❌ Test 1 Failed:', e)
}

// Test 2: Partial Extraction with Missing Optional Fields and Inferred Category
const sampleGeminiOutput2 = {
  title: 'Full Stack Web Development with React and Node',
  issuer: 'University of Helsinki',
  category: 'Full Stack',
  issue_date: '2024-12',
  expiry_date: null,
  credential_id: null,
  verification_url: null,
  description: 'Deep dive into modern web development with React, Node.js, and TypeScript.',
  skills: ['React', 'Node.js', 'TypeScript', 'GraphQL'],
  confidence: {
    title: 0.95,
    issuer: 0.92,
    category: 0.9,
    issue_date: 0.85,
    expiry_date: 0.0,
    credential_id: 0.0,
    verification_url: 0.0,
    description: 0.88,
    skills: 0.9,
  },
}

try {
  const result2 = geminiCertificateExtractionSchema.parse(sampleGeminiOutput2)
  console.log('\n✔ Test 2 Passed: Partial extraction with nulls parsed successfully.')
  console.log('  Extracted Title:', result2.title)
  console.log('  Null Credential ID:', result2.credential_id === null)
  console.log('  Null Verification URL:', result2.verification_url === null)
} catch (e) {
  console.error('❌ Test 2 Failed:', e)
}

// Test 3: Resilience to invalid categories (falls back safely)
const sampleGeminiOutput3 = {
  title: 'Kubernetes Cloud Native Architecture',
  issuer: 'Linux Foundation',
  category: 'UNKNOWN_CATEGORY_XYZ',
  issue_date: null,
  expiry_date: null,
  credential_id: null,
  verification_url: null,
  description: null,
  skills: ['Kubernetes', 'Docker'],
  confidence: {
    title: 0.8,
    issuer: 0.85,
    category: 0.4,
    issue_date: 0,
    expiry_date: 0,
    credential_id: 0,
    verification_url: 0,
    description: 0,
    skills: 0.8,
  },
}

try {
  const result3 = geminiCertificateExtractionSchema.parse(sampleGeminiOutput3)
  console.log('\n✔ Test 3 Passed: Invalid category handled gracefully (fallback applied).')
  console.log('  Fallback Category:', result3.category)
} catch (e) {
  console.error('❌ Test 3 Failed:', e)
}

console.log('\n=== ALL SCHEMA TESTS COMPLETE ===')
