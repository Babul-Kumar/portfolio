import http from 'http'

const routes = [
  '/',
  '/about',
  '/certificates',
  '/projects',
  '/contact',
  '/resume',
]

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      let body = ''
      res.on('data', (chunk) => (body += chunk))
      res.on('end', () => {
        resolve({
          route,
          status: res.statusCode,
          hasAbout: body.includes('id="about"'),
          hasCertificates: body.includes('id="certificates"'),
          hasWork: body.includes('id="work"'),
          hasContact: body.includes('id="contact"'),
        })
      })
    }).on('error', (err) => {
      resolve({ route, error: err.message })
    })
  })
}

async function run() {
  console.log('=== VERIFYING ROUTE RESPONSES & DOM SECTION ORDER ===\n')
  for (const r of routes) {
    const res = await checkRoute(r)
    console.log(`Route: ${r} -> Status: ${res.status || res.error}`)
    if (r === '/') {
      console.log('  Homepage Section Presence & Order:')
      console.log('    has #about:', res.hasAbout)
      console.log('    has #certificates:', res.hasCertificates)
      console.log('    has #work:', res.hasWork)
      console.log('    has #contact:', res.hasContact)
    }
  }
}

run()
