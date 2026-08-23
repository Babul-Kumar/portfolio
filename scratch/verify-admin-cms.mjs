import {
  getProjects,
  getCertificates,
  getAchievements,
  getEducation,
  getExperience,
  getSkills,
  getProfile,
  getAdminProjects,
  getAdminCertificates,
  getAdminAchievements,
  getAdminEducation,
  getAdminExperience,
  getAdminSkills,
  getAdminProfile,
  getAdminDashboardStats,
} from '../lib/data.ts'

async function runVerification() {
  console.log('==============================================')
  console.log('  PORTFOLIO CMS DATA CONSISTENCY VERIFICATION')
  console.log('==============================================')

  const [
    pubProjects,
    pubCerts,
    pubAchievements,
    pubEducation,
    pubExperience,
    pubSkills,
    pubProfile,
    admProjects,
    admCerts,
    admAchievements,
    admEducation,
    admExperience,
    admSkills,
    admProfile,
    admStats,
  ] = await Promise.all([
    getProjects(),
    getCertificates(),
    getAchievements(),
    getEducation(),
    getExperience(),
    getSkills(),
    getProfile(),
    getAdminProjects(),
    getAdminCertificates(),
    getAdminAchievements(),
    getAdminEducation(),
    getAdminExperience(),
    getAdminSkills(),
    getAdminProfile(),
    getAdminDashboardStats(),
  ])

  console.log(`\n1. Projects:`)
  console.log(`   - Public Count : ${pubProjects.length}`)
  console.log(`   - Admin Count  : ${admProjects.length}`)
  console.log(`   - First Project: "${pubProjects[0]?.title}" (slug: /${pubProjects[0]?.slug})`)

  console.log(`\n2. Certificates:`)
  console.log(`   - Public Count : ${pubCerts.length}`)
  console.log(`   - Admin Count  : ${admCerts.length}`)
  console.log(`   - First Cert   : "${pubCerts[0]?.title}" (issuer: ${pubCerts[0]?.issuer})`)

  console.log(`\n3. Achievements:`)
  console.log(`   - Public Count : ${pubAchievements.length}`)
  console.log(`   - Admin Count  : ${admAchievements.length}`)
  console.log(`   - First Achiev : "${pubAchievements[0]?.title}" (${pubAchievements[0]?.rank})`)

  console.log(`\n4. Education:`)
  console.log(`   - Public Count : ${pubEducation.length}`)
  console.log(`   - Admin Count  : ${admEducation.length}`)
  console.log(`   - Institution  : "${pubEducation[0]?.institution}" (${pubEducation[0]?.degree})`)

  console.log(`\n5. Experience:`)
  console.log(`   - Public Count : ${pubExperience.length}`)
  console.log(`   - Admin Count  : ${admExperience.length}`)
  console.log(`   - Role/Company : "${pubExperience[0]?.role}" at ${pubExperience[0]?.company}`)

  console.log(`\n6. Skills:`)
  console.log(`   - Public Count : ${pubSkills.length}`)
  console.log(`   - Admin Count  : ${admSkills.length}`)

  console.log(`\n7. Profile:`)
  console.log(`   - Name         : "${pubProfile?.name}"`)
  console.log(`   - Admin Profile: "${admProfile?.name}"`)

  console.log(`\n8. Admin Dashboard Stats:`)
  console.log(`   - Projects     : ${admStats.projects}`)
  console.log(`   - Certificates : ${admStats.certificates}`)
  console.log(`   - Achievements : ${admStats.achievements}`)
  console.log(`   - Education    : ${admStats.education}`)
  console.log(`   - Experience   : ${admStats.experience}`)
  console.log(`   - Skills       : ${admStats.skills}`)

  console.log('\n==============================================')
  const passed =
    pubProjects.length > 0 &&
    admProjects.length > 0 &&
    pubCerts.length > 0 &&
    admCerts.length > 0 &&
    pubAchievements.length > 0 &&
    admAchievements.length > 0 &&
    pubEducation.length > 0 &&
    admEducation.length > 0 &&
    pubExperience.length > 0 &&
    admExperience.length > 0 &&
    pubSkills.length > 0 &&
    admSkills.length > 0 &&
    pubProfile?.name === admProfile?.name

  if (passed) {
    console.log('✅ ALL DATA CONSISTENCY CHECKS PASSED SUCCESSFULLY')
  } else {
    console.error('❌ DATA CONSISTENCY CHECKS FAILED')
    process.exit(1)
  }
}

runVerification()
