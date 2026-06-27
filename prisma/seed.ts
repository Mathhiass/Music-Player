import "dotenv/config"
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing data
  await prisma.puzzleScore.deleteMany()
  await prisma.librarySong.deleteMany()
  await prisma.playlistSong.deleteMany()
  await prisma.playlist.deleteMany()
  await prisma.song.deleteMany()
  await prisma.album.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.user.deleteMany()

  // Create mock artists
  const artist1 = await prisma.artist.create({ data: { name: 'Felix Carter' } })
  const artist2 = await prisma.artist.create({ data: { name: 'Ella Hunt' } })
  const artist3 = await prisma.artist.create({ data: { name: 'Lana Rivers' } })
  const artist4 = await prisma.artist.create({ data: { name: 'Mia Lowell' } })
  const artist5 = await prisma.artist.create({ data: { name: 'Ryan Miles' } })
  const artist6 = await prisma.artist.create({ data: { name: 'Jon Hickman' } })

  // Create mock albums
  const album1 = await prisma.album.create({ data: { title: 'Golden Days', artistId: artist1.id, artworkUrl: '/artwork/golden_days.png' } })
  const album2 = await prisma.album.create({ data: { title: 'Fading Horizon', artistId: artist2.id, artworkUrl: '/artwork/fading_horizon.png' } })
  const album3 = await prisma.album.create({ data: { title: 'Waves of Time', artistId: artist3.id, artworkUrl: '/artwork/waves_of_time.png' } })
  const album4 = await prisma.album.create({ data: { title: 'Electric Dreams', artistId: artist4.id, artworkUrl: '/artwork/electric_dreams.png' } })
  const album5 = await prisma.album.create({ data: { title: 'Shadows & Light', artistId: artist5.id, artworkUrl: '/artwork/shadows_and_light.png' } })
  const album6 = await prisma.album.create({ data: { title: 'Echoes of Midnight', artistId: artist6.id, artworkUrl: '/artwork/echoes_of_midnight.png' } })

  // Create mock songs
  await prisma.song.create({
    data: {
      title: 'Golden Days',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      artworkUrl: '/artwork/golden_days.png',
      durationSeconds: 232,
      artistId: artist1.id,
      albumId: album1.id
    }
  })

  await prisma.song.create({
    data: {
      title: 'Fading Horizon',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      artworkUrl: '/artwork/fading_horizon.png',
      durationSeconds: 254,
      artistId: artist2.id,
      albumId: album2.id
    }
  })

  await prisma.song.create({
    data: {
      title: 'Waves of Time',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      artworkUrl: '/artwork/waves_of_time.png',
      durationSeconds: 185,
      artistId: artist3.id,
      albumId: album3.id
    }
  })

  await prisma.song.create({
    data: {
      title: 'Electric Dreams',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      artworkUrl: '/artwork/electric_dreams.png',
      durationSeconds: 218,
      artistId: artist4.id,
      albumId: album4.id
    }
  })

  await prisma.song.create({
    data: {
      title: 'Shadows & Light',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      artworkUrl: '/artwork/shadows_and_light.png',
      durationSeconds: 202,
      artistId: artist5.id,
      albumId: album5.id
    }
  })

  await prisma.song.create({
    data: {
      title: 'Echoes of Midnight',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
      artworkUrl: '/artwork/echoes_of_midnight.png',
      durationSeconds: 238,
      artistId: artist6.id,
      albumId: album6.id
    }
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
