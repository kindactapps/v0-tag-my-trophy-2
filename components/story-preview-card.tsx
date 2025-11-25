import Link from "next/link"
import { LazyImage } from "@/components/ui/lazy-image"

interface StoryPreviewProps {
  slug: string
  title: string
  bio: string
  avatar: string
  memoryCount: number
  viewCount: number
}

export default function StoryPreviewCard({ slug, title, bio, avatar, memoryCount, viewCount }: StoryPreviewProps) {
  return (
    <Link href={`/story/${slug}`} className="group">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
        <div className="aspect-video relative overflow-hidden">
          <LazyImage
            src={avatar || "/placeholder.svg?height=225&width=400&query=story preview"}
            alt={title}
            width={400}
            height={225}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            aspectRatio="video"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm text-white/80">{bio}</p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center text-sm text-[#2c2c2c]/60">
            <span>{memoryCount} memories</span>
            <span>{viewCount} views</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
