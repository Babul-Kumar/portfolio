import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gmlgzuiuyhinxhjsbfkk.supabase.co'
const supabaseAnonKey = 'sb_publishable_UwdX7y3LAs238MpzSqGPbA_tyOJoEQO'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

const CERTIFICATES = [
  {
    title: 'Machine Learning Specialization',
    slug: 'machine-learning-specialization',
    issuer: 'Stanford Online & DeepLearning.AI',
    category: 'AI / ML',
    issue_date: '2026-01-10',
    expiry_date: null,
    credential_id: 'STAN-ML-89241',
    verification_url: 'https://coursera.org/verify/specialization',
    description:
      'Comprehensive 3-course specialization covering supervised learning (linear regression, logistic regression, neural networks), unsupervised learning (clustering, anomaly detection, recommender systems), and reinforcement learning.',
    skills: ['Supervised Learning', 'Neural Networks', 'Decision Trees', 'Unsupervised Learning', 'Python'],
    featured: true,
    published: true,
  },
  {
    title: 'Deep Learning Specialization',
    slug: 'deep-learning-specialization',
    issuer: 'DeepLearning.AI',
    category: 'AI / ML',
    issue_date: '2025-10-15',
    expiry_date: null,
    credential_id: 'DLAI-DL-44812',
    verification_url: 'https://coursera.org/verify/specialization',
    description:
      'Deep dive into neural network architectures, hyperparameter tuning, Convolutional Neural Networks (CNNs), and Sequence Models (RNNs, LSTMs, Transformers).',
    skills: ['Deep Learning', 'CNN', 'RNN', 'Transformers', 'TensorFlow', 'PyTorch'],
    featured: true,
    published: true,
  },
  {
    title: 'TensorFlow Developer Certificate',
    slug: 'tensorflow-developer-certificate',
    issuer: 'Google',
    category: 'AI / ML',
    issue_date: '2025-06-20',
    expiry_date: null,
    credential_id: 'TF-DEV-77192',
    verification_url: 'https://certificate.google.com/verify',
    description:
      'Demonstrated proficiency in building and training computer vision models, NLP tokenization pipelines, and time-series forecasting models using TensorFlow 2.x.',
    skills: ['TensorFlow', 'Computer Vision', 'NLP', 'Time Series', 'Python'],
    featured: true,
    published: true,
  },
  {
    title: 'Full Stack Open',
    slug: 'full-stack-open',
    issuer: 'University of Helsinki',
    category: 'Full Stack',
    issue_date: '2024-12-05',
    expiry_date: null,
    credential_id: 'UH-FSO-30918',
    verification_url: 'https://studies.helsinki.fi/verify',
    description:
      'Modern JavaScript-based web development covering React, Redux, Node.js, Express, REST APIs, GraphQL, TypeScript, and CI/CD pipelines.',
    skills: ['React', 'Node.js', 'Express', 'TypeScript', 'GraphQL', 'PostgreSQL'],
    featured: true,
    published: true,
  },
]

const ACHIEVEMENTS = [
  {
    title: 'Finalist — Global AI Hackathon 2026',
    slug: 'global-ai-hackathon-2026',
    organization: 'MLH & OpenAI',
    category: 'Hackathon',
    date: '2026-01-28',
    rank: 'Top 10 Finalist',
    description: 'Built an autonomous multi-modal agent for automated code refactoring and architecture analysis.',
    featured: true,
    published: true,
  },
  {
    title: '1st Place — University CodeSprint',
    slug: 'university-codesprint',
    organization: 'Lovely Professional University',
    category: 'Competition',
    date: '2025-11-12',
    rank: '1st Place Winner',
    description: 'Solved algorithmic data structures and competitive programming challenges under strict time constraints.',
    featured: true,
    published: true,
  },
  {
    title: 'Dean’s Academic Honor List',
    slug: 'deans-honor-list',
    organization: 'Lovely Professional University',
    category: 'Award',
    date: '2025-06-30',
    rank: 'Honor Roll',
    description: 'Awarded for academic excellence and outstanding performance in Computer Science coursework.',
    featured: true,
    published: true,
  },
]

const EXPERIENCE = [
  {
    company: 'AI Research & Open Source',
    role: 'Software & Machine Learning Engineer',
    start_date: '2024-01-01',
    end_date: null,
    is_current: true,
    description:
      'Designing and developing open-source developer tools, AST analyzers, and machine learning models for computer vision and NLP.',
    technologies: ['Python', 'TypeScript', 'Next.js', 'PyTorch', 'PostgreSQL'],
    location: 'Remote',
    type: 'Project & Research',
    sort_order: 1,
    published: true,
  },
]

async function sync() {
  console.log('=== SYNCING SUPABASE DATA ===')

  // 1. Sync Certificates
  for (const cert of CERTIFICATES) {
    const { data: existing } = await supabase.from('certificates').select('id').eq('slug', cert.slug).single()
    if (!existing) {
      const { error } = await supabase.from('certificates').insert(cert)
      console.log(`Inserted certificate "${cert.title}":`, error ? error.message : 'SUCCESS')
    } else {
      console.log(`Certificate "${cert.title}" already exists.`)
    }
  }

  // 2. Sync Achievements
  for (const ach of ACHIEVEMENTS) {
    const { data: existing } = await supabase.from('achievements').select('id').eq('slug', ach.slug).single()
    if (!existing) {
      const { error } = await supabase.from('achievements').insert(ach)
      console.log(`Inserted achievement "${ach.title}":`, error ? error.message : 'SUCCESS')
    } else {
      console.log(`Achievement "${ach.title}" already exists.`)
    }
  }

  // 3. Sync Experience
  for (const exp of EXPERIENCE) {
    const { data: existing } = await supabase.from('experience').select('id').eq('company', exp.company).eq('role', exp.role).single()
    if (!existing) {
      const { error } = await supabase.from('experience').insert(exp)
      console.log(`Inserted experience "${exp.role} at ${exp.company}":`, error ? error.message : 'SUCCESS')
    } else {
      console.log(`Experience "${exp.role}" already exists.`)
    }
  }

  // 4. Clean up Education placeholder values
  const { data: eduList } = await supabase.from('education').select('*')
  if (eduList) {
    for (const edu of eduList) {
      if (edu.institution === 'Add School Name' || edu.grade === 'Add CGPA' || edu.grade === 'Add percentage') {
        const cleaned = {
          institution: edu.institution === 'Add School Name' ? '' : edu.institution,
          grade: (edu.grade === 'Add CGPA' || edu.grade === 'Add percentage') ? null : edu.grade,
          location: edu.location === 'Add location' ? null : edu.location,
        }
        await supabase.from('education').update(cleaned).eq('id', edu.id)
        console.log(`Cleaned placeholder values in education item ID ${edu.id}`)
      }
    }
  }

  console.log('=== SYNC COMPLETE ===')
}

sync()
