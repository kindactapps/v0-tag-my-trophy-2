import type { Metadata } from "next"
import { notFound } from "next/navigation"
import CollectionClient from "./CollectionClient"

interface CollectionPageProps {
  params: {
    slug: string
  }
}

// Sample collections data
const collections = {
  "river-adventure-x7k9": {
    id: "river-adventure-x7k9",
    title: "Jake's Fishing Adventures",
    theme: "fishing",
    description: "Lifelong angler sharing the stories behind the catch",
    slug: "river-adventure-x7k9",
    isPrivate: false,
    coverImage: "/serene-fishing-scene-with-tackle-box-by-lake-at-su.jpg",
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/serene-fishing-scene-with-tackle-box-by-lake-at-su.jpg",
        title: "Perfect morning at Crystal Lake",
        caption: "Perfect morning at Crystal Lake - caught my personal best bass!",
        date: "March 15, 2024",
        location: "Crystal Lake, Colorado",
      },
      {
        id: 2,
        type: "story",
        title: "The One That Almost Got Away",
        content:
          "After three hours of patient waiting, I felt the strongest tug I've ever experienced. The fight lasted twenty minutes, and when I finally reeled it in, I knew this was a moment I'd never forget. This 8-pound bass taught me that patience and persistence always pay off in fishing and in life.",
        date: "March 15, 2024",
      },
      {
        id: 3,
        type: "photo",
        url: "/happy-multi-generational-family-outdoors-with-fish.jpg",
        title: "Teaching my grandson",
        caption: "Teaching my grandson the art of fly fishing - passing down the tradition",
        date: "March 20, 2024",
        location: "Mountain Stream, Colorado",
      },
    ],
  },
  "tigers-soccer-2024": {
    id: "tigers-soccer-2024",
    title: "Emma's Soccer Season 2024",
    theme: "sports",
    description: "Midfielder #12 for the Tigers - this season was magical",
    slug: "tigers-soccer-2024",
    isPrivate: false,
    coverImage: "/kids-soccer-team-celebrating-goal-on-field.jpg",
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/kids-soccer-team-celebrating-goal-on-field.jpg",
        title: "Championship winning goal",
        caption: "Championship game winning goal - we did it Tigers!",
        date: "November 15, 2024",
        location: "Central Park Soccer Fields",
      },
      {
        id: 2,
        type: "story",
        title: "The Goal That Changed Everything",
        content:
          "With 3 minutes left and the score tied 2-2, I received the pass from Sarah and knew this was my moment. The shot felt perfect leaving my foot, and when it hit the back of the net, our whole team erupted. We were champions!",
        date: "November 15, 2024",
      },
    ],
  },
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = collections[params.slug as keyof typeof collections]

  if (!collection) {
    return {
      title: "Collection Not Found - Tag My Trophy",
    }
  }

  return {
    title: `${collection.title} - Collection Manager - Tag My Trophy`,
    description: collection.description,
  }
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const collection = collections[params.slug as keyof typeof collections]

  if (!collection) {
    notFound()
  }

  return <CollectionClient collection={collection} />
}
