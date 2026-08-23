-- ============================================================
-- BABUL KUMAR PORTFOLIO — SEED DATA
-- Migration 003: Initial Data
-- Based on known information — placeholders marked clearly
-- ============================================================

-- Profile
INSERT INTO profiles (
  name, display_name, tagline, bio, bio_extended,
  location, university, degree, graduation_year,
  github_url, available_for
) VALUES (
  'Babul Kumar',
  'BABUL KUMAR',
  'Computer Science · AI / ML · Full Stack',
  'B.Tech Computer Science & Engineering student at Lovely Professional University, exploring Artificial Intelligence, Machine Learning and Full-Stack Development.',
  'I am deeply interested in building intelligent systems that solve real-world problems — from training ML models to architecting full-stack applications. I thrive at the intersection of research and engineering.',
  'India',
  'Lovely Professional University',
  'B.Tech Computer Science & Engineering',
  2026,
  'https://github.com/babul-kumar',
  'Internships, Research Collaborations, Open Source'
) ON CONFLICT DO NOTHING;

-- Projects
INSERT INTO projects (title, slug, short_desc, category, technologies, featured, published, sort_order) VALUES
  ('BotBro', 'botbro',
   'An AI coding agent powered by MCP and AST analysis that assists developers with intelligent code generation and refactoring.',
   'AI / ML', ARRAY['Python','AI','AST','MCP','LLM'],
   TRUE, TRUE, 1),

  ('Flight Delay Prediction', 'flight-delay-prediction',
   'A machine learning system that predicts flight delays using historical airline data, weather patterns, and route information.',
   'Machine Learning', ARRAY['Python','Scikit-learn','Streamlit','Pandas','NumPy'],
   TRUE, TRUE, 2),

  ('Smart System Monitor', 'smart-system-monitor',
   'A real-time system monitoring dashboard with anomaly detection and performance analytics.',
   'Tools', ARRAY['Python','psutil','Streamlit','Plotly'],
   TRUE, TRUE, 3),

  ('Pollution Monitoring Website', 'pollution-monitoring',
   'A web platform for visualizing and analyzing air quality and pollution data across geographic regions.',
   'Full Stack', ARRAY['HTML','CSS','JavaScript','Python','API'],
   FALSE, TRUE, 4),

  ('Steganography Detector', 'steganography-detector',
   'A computer vision tool that detects hidden data embedded within digital images using statistical analysis.',
   'AI / ML', ARRAY['Python','OpenCV','NumPy','PIL'],
   TRUE, TRUE, 5),

  ('AI Product Review Analyzer', 'ai-product-review-analyzer',
   'An NLP system that performs sentiment analysis and insight extraction from customer product reviews.',
   'AI / ML', ARRAY['Python','NLP','Transformers','Streamlit'],
   TRUE, TRUE, 6),

  ('Page Replacement Simulator', 'page-replacement-simulator',
   'An educational simulator visualizing OS page replacement algorithms (FIFO, LRU, Optimal) with step-by-step animation.',
   'Tools', ARRAY['Python','Simulation','OS Concepts'],
   FALSE, TRUE, 7),

  ('Secure OS Authenticator', 'secure-os-authenticator',
   'A multi-factor authentication system demonstrating OS-level security patterns and access control mechanisms.',
   'Security', ARRAY['Python','Cryptography','OS Security'],
   FALSE, TRUE, 8)
ON CONFLICT (slug) DO NOTHING;

-- Skills
INSERT INTO skills (name, category, level, featured, sort_order) VALUES
  -- Programming
  ('Python', 'Programming', 'Advanced', TRUE, 1),
  ('JavaScript', 'Programming', 'Intermediate', TRUE, 2),
  ('TypeScript', 'Programming', 'Intermediate', TRUE, 3),
  ('C++', 'Programming', 'Intermediate', FALSE, 4),
  ('Java', 'Programming', 'Beginner', FALSE, 5),
  ('SQL', 'Programming', 'Intermediate', TRUE, 6),

  -- AI / ML
  ('Machine Learning', 'AI / ML', 'Intermediate', TRUE, 1),
  ('Deep Learning', 'AI / ML', 'Intermediate', TRUE, 2),
  ('Natural Language Processing', 'AI / ML', 'Intermediate', TRUE, 3),
  ('Computer Vision', 'AI / ML', 'Intermediate', TRUE, 4),
  ('Generative AI', 'AI / ML', 'Intermediate', TRUE, 5),
  ('Scikit-learn', 'AI / ML', 'Intermediate', FALSE, 6),
  ('TensorFlow', 'AI / ML', 'Beginner', FALSE, 7),
  ('PyTorch', 'AI / ML', 'Beginner', FALSE, 8),
  ('Hugging Face', 'AI / ML', 'Intermediate', FALSE, 9),
  ('LangChain', 'AI / ML', 'Intermediate', FALSE, 10),

  -- Frontend
  ('React', 'Frontend', 'Intermediate', TRUE, 1),
  ('Next.js', 'Frontend', 'Intermediate', TRUE, 2),
  ('HTML/CSS', 'Frontend', 'Advanced', TRUE, 3),
  ('Tailwind CSS', 'Frontend', 'Intermediate', FALSE, 4),
  ('Three.js', 'Frontend', 'Beginner', FALSE, 5),

  -- Backend
  ('Node.js', 'Backend', 'Intermediate', TRUE, 1),
  ('FastAPI', 'Backend', 'Intermediate', TRUE, 2),
  ('Flask', 'Backend', 'Intermediate', FALSE, 3),
  ('REST APIs', 'Backend', 'Intermediate', TRUE, 4),

  -- Database
  ('PostgreSQL', 'Database', 'Intermediate', TRUE, 1),
  ('Supabase', 'Database', 'Intermediate', TRUE, 2),
  ('MongoDB', 'Database', 'Beginner', FALSE, 3),

  -- Tools
  ('Git', 'Tools', 'Intermediate', TRUE, 1),
  ('GitHub', 'Tools', 'Intermediate', TRUE, 2),
  ('Streamlit', 'Tools', 'Advanced', TRUE, 3),
  ('Jupyter Notebook', 'Tools', 'Advanced', FALSE, 4),
  ('VS Code', 'Tools', 'Advanced', FALSE, 5),
  ('Linux', 'Tools', 'Intermediate', FALSE, 6)
ON CONFLICT DO NOTHING;

-- Education (placeholder — update via admin)
INSERT INTO education (institution, degree, field, is_current, grade, location, sort_order, published) VALUES
  ('Lovely Professional University', 'B.Tech', 'Computer Science & Engineering', TRUE, 'Add CGPA', 'Phagwara, Punjab, India', 1, TRUE),
  ('Add School Name', 'Class XII', 'Science (PCM)', FALSE, 'Add percentage', 'Add location', 2, TRUE),
  ('Add School Name', 'Class X', 'General', FALSE, 'Add percentage', 'Add location', 3, TRUE)
ON CONFLICT DO NOTHING;

-- Social Links
INSERT INTO social_links (platform, url, label, sort_order) VALUES
  ('GitHub', 'https://github.com/babul-kumar', 'GitHub', 1),
  ('LinkedIn', 'https://linkedin.com/in/babul-kumar', 'LinkedIn', 2),
  ('Kaggle', 'https://kaggle.com/babul-kumar', 'Kaggle', 3),
  ('Email', 'mailto:Add your email', 'Email', 4)
ON CONFLICT DO NOTHING;
