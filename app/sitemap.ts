import { MetadataRoute } from 'next'
import {
  getAllProjectSlugs,
  getAllCertificateSlugs,
  getAllTrainingSlugs,
  getAllCoCurricularSlugs,
} from '@/lib/data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://babul.dev'

  const [projectSlugs, certificateSlugs, trainingSlugs, coCurrSlugs] = await Promise.all([
    getAllProjectSlugs(),
    getAllCertificateSlugs(),
    getAllTrainingSlugs(),
    getAllCoCurricularSlugs(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/training`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/co-curricular`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/certificates`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/achievements`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/education`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
  ]

  const dynamicProjectRoutes: MetadataRoute.Sitemap = projectSlugs.map((slug) => ({
    url: `${baseUrl}/projects/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const dynamicCertificateRoutes: MetadataRoute.Sitemap = certificateSlugs.map((slug) => ({
    url: `${baseUrl}/certificates/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  const dynamicTrainingRoutes: MetadataRoute.Sitemap = trainingSlugs.map((slug) => ({
    url: `${baseUrl}/training/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  const dynamicCoCurricularRoutes: MetadataRoute.Sitemap = coCurrSlugs.map((slug) => ({
    url: `${baseUrl}/co-curricular/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
  }))

  return [
    ...staticRoutes,
    ...dynamicProjectRoutes,
    ...dynamicCertificateRoutes,
    ...dynamicTrainingRoutes,
    ...dynamicCoCurricularRoutes,
  ]
}
