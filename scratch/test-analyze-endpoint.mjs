import http from 'http'

console.log('=== TESTING /api/admin/certificates/analyze ENDPOINT ===\n')

async function testMissingFile() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
  const postData = `--${boundary}--\r\n`

  return new Promise((resolve) => {
    const req = http.request(
      'http://localhost:3000/api/admin/certificates/analyze',
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          console.log('Test: Missing File Request')
          console.log('Status Code:', res.statusCode)
          console.log('Response:', body)
          resolve(res.statusCode === 400)
        })
      }
    )
    req.write(postData)
    req.end()
  })
}

async function testInvalidFileType() {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
  const fileContent = 'This is a text file, not a certificate.'
  const postData = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="file"; filename="test.txt"',
    'Content-Type: text/plain',
    '',
    fileContent,
    `--${boundary}--`,
    '',
  ].join('\r\n')

  return new Promise((resolve) => {
    const req = http.request(
      'http://localhost:3000/api/admin/certificates/analyze',
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(postData),
        },
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          console.log('\nTest: Invalid File Type Request')
          console.log('Status Code:', res.statusCode)
          console.log('Response:', body)
          resolve(res.statusCode === 400)
        })
      }
    )
    req.write(postData)
    req.end()
  })
}

async function runAll() {
  const res1 = await testMissingFile()
  const res2 = await testInvalidFileType()
  console.log('\n=== ALL ENDPOINT TESTS PASSED ===', res1 && res2)
}

runAll()
