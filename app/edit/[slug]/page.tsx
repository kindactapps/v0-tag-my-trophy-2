import type { Metadata } from "next"
import { notFound } from "next/navigation"
import EditPageClient from "./EditPageClient"

interface EditPageProps {
  params: {
    slug: string
  }
}

// Sample data for demo stories (same as story page)
const demoStories = {
  "river-adventure-x7k9": {
    id: "river-adventure-x7k9",
    claimed: true,
    owner: {
      name: "Jake's Fishing Adventures",
      bio: "Lifelong angler sharing the stories behind the catch",
      avatar: "/happy-multi-generational-family-outdoors-with-fish.jpg",
      createdAt: "March 2024",
    },
    viewCount: 127,
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/serene-fishing-scene-with-tackle-box-by-lake-at-su.jpg",
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
        caption: "Teaching my grandson the art of fly fishing - passing down the tradition",
        date: "March 20, 2024",
        location: "Mountain Stream, Colorado",
      },
      {
        id: 4,
        type: "story",
        title: "Passing Down the Legacy",
        content:
          "Watching Tommy cast his first perfect line brought tears to my eyes. Four generations of our family have fished these waters, and seeing him connect with that same peaceful rhythm reminded me why these moments matter so much.",
        date: "March 20, 2024",
      },
    ],
  },
  "tigers-soccer-2024": {
    id: "tigers-soccer-2024",
    claimed: true,
    owner: {
      name: "Emma's Soccer Season 2024",
      bio: "Midfielder #12 for the Tigers - this season was magical",
      avatar: "/kids-soccer-team-celebrating-goal-on-field.jpg",
      createdAt: "November 2024",
    },
    viewCount: 156,
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/kids-soccer-team-celebrating-goal-on-field.jpg",
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
      {
        id: 3,
        type: "story",
        title: "Coach Martinez's Pep Talk",
        content:
          "Before the championship game, Coach Martinez told us, 'You've worked all season for this moment. Trust your training, trust each other, and play with your hearts.' Those words carried us to victory.",
        date: "November 15, 2024",
      },
      {
        id: 4,
        type: "story",
        title: "Team Pizza Celebration",
        content:
          "After the game, the whole team went to Tony's Pizza to celebrate. Seeing everyone's faces covered in cheese and smiles, I knew this was a memory I'd treasure forever. We earned every slice!",
        date: "November 15, 2024",
      },
    ],
  },
}

export async function generateMetadata({ params }: EditPageProps): Promise<Metadata> {
  const story = demoStories[params.slug as keyof typeof demoStories]

  if (!story || !story.claimed) {
    return {
      title: "Story Not Found - Tag My Trophy",
    }
  }

  return {
    title: `Edit ${story.owner.name} - Tag My Trophy`,
    description: "Edit your story and see how it appears to visitors",
  }
}

export default function EditPage({ params }: EditPageProps) {
  const story = demoStories[params.slug as keyof typeof demoStories]

  // Handle unknown slugs or unclaimed stories
  if (!story || !story.claimed) {
    notFound()
  }

  return <EditPageClient story={story} slug={params.slug} />
}
