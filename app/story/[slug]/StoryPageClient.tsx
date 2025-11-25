"use client"
import MemoryGallery from "@/components/memory-gallery"
import Link from "next/link"
import Navigation from "@/components/navigation"

import EnhancedShareModal from "@/components/enhanced-share-modal"
import GuestComments from "@/components/guest-comments"
import { useState } from "react"
import BackButton from "@/components/back-button"
import { Button } from "@/components/ui/button"

console.log("[v0] StoryPageClient module loaded")

// Sample data for demo stories
const demoStories = {
  "demo-setup-guide": {
    id: "demo-setup-guide",
    claimed: true,
    owner: {
      name: "Tag My Trophy Tutorial",
      bio: "Complete guide to creating and customizing your memory profile",
      avatar: "/smartphone-scanning-qr-code-on-trophy-with-app-inte.jpg",
      createdAt: "January 2025",
    },
    viewCount: 1247,
    memories: [
      {
        id: 1,
        type: "story",
        title: "Step 1: Choose Your Theme",
        content:
          "Welcome to your profile setup! First, select a theme that matches your memory type. We offer specialized themes for fishing adventures, hunting trips, sports victories, family celebrations, pet memories, and more. Each theme features custom colors, layouts, and design elements optimized to showcase your specific type of story beautifully.",
        date: "Getting Started",
      },
      {
        id: 2,
        type: "photo",
        url: "/team-celebration-with-trophy-and-cheering-players.jpg",
        caption: "Sports theme example - perfect for championship trophies and team victories",
        date: "Theme Preview",
        location: "Sports Theme",
      },
      {
        id: 3,
        type: "story",
        title: "Step 2: Create Your Profile",
        content:
          "Give your memory collection a name and write a bio that captures the essence of your story. This is the first thing visitors see when they scan your tag. Make it personal and meaningful - it's your story's introduction. You can also upload a profile photo that represents your achievement or memory.",
        date: "Profile Setup",
      },
      {
        id: 4,
        type: "photo",
        url: "/happy-multi-generational-family-outdoors-with-fish.jpg",
        caption: "Your profile header welcomes visitors and sets the tone for your story",
        date: "Profile Example",
        location: "Profile Page",
      },
      {
        id: 5,
        type: "story",
        title: "Step 3: Add Photos & Videos",
        content:
          "Upload unlimited photos and videos to bring your memories to life. Each one can have a caption, date, and location. Our system automatically optimizes images for fast loading while maintaining quality. Videos are supported too - perfect for capturing the excitement of the moment or sharing a message with future viewers.",
        date: "Adding Media",
      },
      {
        id: 6,
        type: "photo",
        url: "/golden-retriever-dog-playing-outdoors-in-nature.jpg",
        caption: "Photos with captions tell the complete story - who, what, when, and where",
        date: "Media Example",
        location: "Photo Gallery",
      },
      {
        id: 7,
        type: "story",
        title: "Step 4: Write Your Stories",
        content:
          "Add text stories to share the details that photos can't capture. Describe the challenge, the emotions, the lessons learned, or the funny moments. These written memories add depth and context that make your collection truly special. Tell the story behind the trophy, the fish, the game, or the celebration in your own words.",
        date: "Adding Stories",
      },
      {
        id: 8,
        type: "story",
        title: "Step 5: Organize Your Memories",
        content:
          "Your photos and stories appear in chronological order, creating a timeline of your journey. You can add dates and locations to each memory to help tell the complete story. Mix photos and text stories to create a rich, engaging narrative that visitors will love exploring.",
        date: "Organization",
      },
      {
        id: 9,
        type: "photo",
        url: "/forest-hunting-scene-with-hunter-and-deer-in-natur.jpg",
        caption: "Each memory can include location data to show where your adventure took place",
        date: "Location Example",
        location: "Rocky Mountain National Park",
      },
      {
        id: 10,
        type: "story",
        title: "What Visitors Experience",
        content:
          "When someone scans your tag, they're instantly taken to your beautiful profile page. They can scroll through your photos, read your stories, and even leave comments (if you enable them). No app required - it works on any smartphone. They'll see your view count grow as more people discover your story. It's like having a digital guestbook for your achievement!",
        date: "Visitor Experience",
      },
      {
        id: 11,
        type: "photo",
        url: "/smartphone-scanning-qr-code-on-trophy-with-app-inte.jpg",
        caption: "Visitors simply scan your tag with their phone camera - no app needed",
        date: "Scanning Demo",
        location: "Easy Access",
      },
      {
        id: 12,
        type: "story",
        title: "Enable Guest Comments",
        content:
          "Want to let visitors share their thoughts? Enable guest comments to create an interactive experience. Friends and family can leave congratulations, share their own memories of the event, or simply let you know they stopped by. You can moderate comments and choose what appears on your profile.",
        date: "Interactive Features",
      },
      {
        id: 13,
        type: "story",
        title: "Keep Your Story Growing",
        content:
          "The best part? Your memory collection is never finished. Come back anytime to add new photos, update stories, or add fresh memories. Your QR tag stays the same, but your story keeps evolving. Perfect for ongoing collections like fishing logs, hunting seasons, or family traditions that grow year after year.",
        date: "Ongoing Updates",
      },
      {
        id: 14,
        type: "photo",
        url: "/beautiful-mountain-landscape-scenic-destination-wi.jpg",
        caption: "Your memories stay online forever - accessible anytime, anywhere",
        date: "Forever Memories",
        location: "Cloud Hosted",
      },
      {
        id: 15,
        type: "story",
        title: "What You Get With Tag My Trophy",
        content:
          "✓ Physical QR tag (weatherproof, adhesive-backed)\n✓ Personal online profile with custom theme\n✓ Unlimited photo and video uploads\n✓ Unlimited text stories and captions\n✓ View counter to see your reach\n✓ Optional guest comments\n✓ Mobile-optimized viewing experience\n✓ 1st year hosting FREE, then $5.99/year\n✓ No app required - works on any device\n✓ Easy updates anytime from any device",
        date: "Your Benefits",
      },
      {
        id: 16,
        type: "story",
        title: "Ready to Start Your Story?",
        content:
          "Choose your memory plan (Basic or Premium) and we'll ship your QR tag within 2-3 business days. You can start building your profile immediately after ordering - your tag will arrive ready to scan and attach. Join thousands of others who are preserving their memories in a modern, shareable way. Your story deserves to be told!",
        date: "Get Started",
      },
    ],
  },
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
  "mountain-journey-b3m5": {
    id: "mountain-journey-b3m5",
    claimed: true,
    owner: {
      name: "Emma's Mountain Adventures",
      bio: "Exploring Colorado's peaks one trail at a time",
      avatar: "/beautiful-mountain-landscape-scenic-destination-wi.jpg",
      createdAt: "February 2024",
    },
    viewCount: 89,
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/beautiful-mountain-landscape-scenic-destination-wi.jpg",
        caption: "Summit of Mount Elbert - 14,440 feet of pure accomplishment",
        date: "February 28, 2024",
        location: "Mount Elbert, Colorado",
      },
      {
        id: 2,
        type: "story",
        title: "Above the Clouds",
        content:
          "Standing at 14,000 feet, looking down at the clouds below, I realized that every step of the challenging climb was worth this moment of pure serenity and achievement. The thin air made every breath precious, just like every moment of this incredible journey.",
        date: "February 28, 2024",
      },
      {
        id: 3,
        type: "story",
        title: "The Pre-Dawn Start",
        content:
          "4:30 AM alarm, headlamp on, and the trail ahead disappearing into darkness. Starting this early meant I'd catch the sunrise from the summit - a reward that made every cold step worth it.",
        date: "February 28, 2024",
      },
    ],
  },
  "meadow-celebration-q8w2": {
    id: "meadow-celebration-q8w2",
    claimed: true,
    owner: {
      name: "The Johnson Family Reunion",
      bio: "Five generations coming together in Colorado",
      avatar: "/multi-generational-family-gathering-celebration-wi.jpg",
      createdAt: "July 2024",
    },
    viewCount: 203,
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/multi-generational-family-gathering-celebration-wi.jpg",
        caption: "Five generations together - from great-grandma to the newest baby",
        date: "July 4, 2024",
        location: "Johnson Family Ranch, Colorado",
      },
      {
        id: 2,
        type: "story",
        title: "Stories Across Generations",
        content:
          "Listening to great-grandma tell stories of the old days while watching the youngest cousins play in the same meadow where their parents grew up - this is what family legacy looks like. Her stories of homesteading this land in the 1940s brought tears to everyone's eyes.",
        date: "July 4, 2024",
      },
      {
        id: 3,
        type: "story",
        title: "The Annual Pie Contest",
        content:
          "Aunt Martha's apple pie won again this year - her 12th consecutive victory! The secret ingredient isn't cinnamon or nutmeg, it's the love and tradition baked into every slice.",
        date: "July 4, 2024",
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
  "graduation-memories-2024": {
    id: "graduation-memories-2024",
    claimed: true,
    owner: {
      name: "Sarah's Graduation Journey",
      bio: "From freshman fears to senior year success - what a ride!",
      avatar: "/graduation-ceremony-with-cap-and-gown-celebration.jpg",
      createdAt: "May 2024",
    },
    viewCount: 94,
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/graduation-ceremony-with-cap-and-gown-celebration.jpg",
        caption: "Walking across the stage - four years of hard work paying off",
        date: "May 18, 2024",
        location: "University Stadium",
      },
      {
        id: 2,
        type: "story",
        title: "The Moment My Name Was Called",
        content:
          "Hearing 'Sarah Michelle Thompson, Magna Cum Laude' echo through the stadium was surreal. All those late nights studying, the stress, the doubt - it all melted away in that perfect moment of achievement.",
        date: "May 18, 2024",
      },
      {
        id: 3,
        type: "story",
        title: "Mom's Proud Tears",
        content:
          "Looking into the crowd and seeing Mom crying happy tears was the best part of the whole ceremony. She sacrificed so much to help me get here, and sharing this moment with her made it complete.",
        date: "May 18, 2024",
      },
    ],
  },
  "unclaimed-adventure-abc123": {
    id: "unclaimed-adventure-abc123",
    claimed: false,
  },
  "waiting-story-xyz789": {
    id: "waiting-story-xyz789",
    claimed: false,
  },
  "wilderness-hunt-d7p4": {
    id: "wilderness-hunt-d7p4",
    claimed: true,
    owner: {
      name: "Mike's Hunting Chronicles",
      bio: "Tracking wilderness adventures and conservation stories",
      avatar: "/hunter-with-trophy-buck-in-autumn-forest-wildernes.jpg",
      createdAt: "October 2024",
    },
    viewCount: 142,
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/hunter-with-trophy-buck-in-autumn-forest-wildernes.jpg",
        caption: "10-point buck - the culmination of years of patience and respect for the wilderness",
        date: "October 22, 2024",
        location: "Rocky Mountain Wilderness, Colorado",
      },
      {
        id: 2,
        type: "story",
        title: "The Perfect Morning",
        content:
          "Three hours before dawn, I was already in my stand. The forest was silent except for the occasional owl. As the sun began to paint the sky orange, I spotted him - a magnificent 10-point buck moving through the clearing. Every hunter dreams of this moment, and I was blessed to experience it.",
        date: "October 22, 2024",
      },
      {
        id: 3,
        type: "photo",
        url: "/hunters-hiking-through-forest-trail-with-backpacks.jpg",
        caption: "The journey in - miles of hiking before dawn with my hunting partner",
        date: "October 22, 2024",
        location: "Trail to Base Camp",
      },
      {
        id: 4,
        type: "story",
        title: "Conservation and Respect",
        content:
          "Hunting isn't just about the harvest - it's about conservation, understanding wildlife, and respecting nature. Every tag I purchase supports wildlife management programs that keep these populations healthy. This buck lived a full life in the wild, and I'm honored to be part of that circle.",
        date: "October 22, 2024",
      },
      {
        id: 5,
        type: "story",
        title: "Passing Down the Tradition",
        content:
          "My grandfather taught me to hunt when I was 12. He taught me patience, respect for the animal, and the importance of ethical hunting. Now I'm teaching my son these same values. It's not about the trophy - it's about the connection to nature and our heritage.",
        date: "October 22, 2024",
      },
    ],
    customFields: [
      {
        id: 1,
        field_label: "Location",
        field_value: "Rocky Mountain Wilderness, Colorado",
      },
      {
        id: 2,
        field_label: "Season",
        field_value: "Fall",
      },
    ],
  },
  "pet-adventures-k5m8": {
    id: "pet-adventures-k5m8",
    claimed: true,
    owner: {
      name: "Max's Pet Adventures",
      bio: "Cherished moments with my golden retriever best friend",
      avatar: "/golden-retriever-dog-playing-outdoors-in-nature.jpg",
      createdAt: "January 2024",
    },
    viewCount: 218,
    memories: [
      {
        id: 1,
        type: "photo",
        url: "/golden-retriever-dog-playing-outdoors-in-nature.jpg",
        caption: "Max's favorite spot - the meadow where he runs free every morning",
        date: "January 10, 2024",
        location: "Riverside Park, Colorado",
      },
      {
        id: 2,
        type: "story",
        title: "The Day We Met",
        content:
          "Eight years ago, I walked into the shelter 'just to look.' Max was in the corner, wagging his tail hopefully. When our eyes met, I knew he was coming home with me. Best decision I ever made. He's been my loyal companion through everything life has thrown at us.",
        date: "January 10, 2024",
      },
      {
        id: 3,
        type: "story",
        title: "Morning Ritual",
        content:
          "Every single morning, rain or shine, Max brings me his leash at 6 AM sharp. Our morning walks have become sacred time - just me, Max, and the quiet world waking up. These simple moments are the ones I treasure most.",
        date: "January 15, 2024",
      },
      {
        id: 4,
        type: "story",
        title: "The Swimming Lesson",
        content:
          "Max was terrified of water until he was three years old. One summer day, a tennis ball rolled into the lake, and his love for fetch overcame his fear. He jumped in, and from that day forward, you couldn't keep him out of the water. Now he's a swimming champion!",
        date: "January 20, 2024",
      },
      {
        id: 5,
        type: "story",
        title: "Therapy Dog Certification",
        content:
          "Last year, Max became a certified therapy dog. Watching him bring joy to hospital patients and nursing home residents showed me that his gentle spirit was meant to be shared with the world. He has a gift for knowing exactly who needs a furry friend.",
        date: "January 25, 2024",
      },
      {
        id: 6,
        type: "story",
        title: "Growing Old Together",
        content:
          "Max is getting gray around his muzzle now, and he moves a little slower on our walks. But his tail still wags just as enthusiastically, and his love is as boundless as ever. Every day with him is a gift I don't take for granted.",
        date: "January 30, 2024",
      },
    ],
  },
}

function UnclaimedStoryPage({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      <Navigation isStoryPage={true} storySlug={slug} />

      <div className="container mx-auto px-4 pt-6">
        <BackButton />
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-[#c44c3a] rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13m0-13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-[#2c2c2c] mb-4">This story is waiting to be told</h1>
            <p className="text-lg text-[#2c2c2c]/70 mb-8">
              Scan this QR code from your Tag My Trophy to create your memory page and start sharing your adventures.
            </p>
          </div>

          {/* QR Code Display */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto bg-[#2c2c2c] rounded-lg mb-2"></div>
                <p className="text-sm text-gray-500">QR Code: {slug}</p>
              </div>
            </div>
            <p className="text-[#2c2c2c]/60">This unique code is waiting for its owner to claim it</p>
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <Button
              asChild
              className="w-full bg-[#c44c3a] text-white px-8 py-4 rounded-xl font-semibold hover:bg-[#a63d2e] transition-colors bg-orange-700"
            >
              <Link href={`/claim/${slug}`}>Claim This Tag</Link>
            </Button>
            <p className="text-sm text-[#2c2c2c]/60">Don't have a Tag My Trophy yet?</p>
            <Button
              asChild
              className="w-full border-2 border-[#c44c3a] text-[#c44c3a] px-8 py-4 rounded-xl font-semibold hover:bg-[#c44c3a] hover:text-white transition-colors text-background bg-orange-700"
            >
              <Link href="/">Get Your Tag - $29.99</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClaimedStoryPage({ story }: { story: any }) {
  console.log("[v0] ClaimedStoryPage rendering", { storyId: story.id, memoriesCount: story.memories?.length })

  return (
    <div className="min-h-screen bg-[#f5f0e8]">
      {console.log("[v0] Rendering Navigation")}
      <Navigation isStoryPage={true} storySlug={story.id} />

      <div className="container mx-auto px-4 pt-6">
        {console.log("[v0] Rendering BackButton")}
        <BackButton />
      </div>

      {/* Header Section */}
      {console.log("[v0] Rendering Header Section")}
      <div className="bg-gradient-to-b from-[#2c2c2c] to-[#2c2c2c]/90 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                <img
                  src={story.owner.avatar || "/placeholder.svg"}
                  alt={story.owner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-5xl font-bold mb-3">{story.owner.name}</h1>
                <p className="text-xl text-white/80 mb-4 max-w-2xl">{story.owner.bio}</p>

                {story.customFields && story.customFields.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                    {story.customFields.map((field: any) => (
                      <div key={field.id} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                        <p className="text-xs text-white/60 mb-1">{field.field_label}</p>
                        <p className="text-sm font-medium">{field.field_value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 text-sm text-white/60 mt-4">
                  <span>Created {story.owner.createdAt}</span>
                  <span className="hidden sm:block">•</span>
                  <span>{story.viewCount} people have shared in this story</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Gallery */}
      {console.log("[v0] About to render MemoryGallery with memories:", story.memories?.length)}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <MemoryGallery memories={story.memories} />

          {/* Interactive Elements */}
          {console.log("[v0] Rendering InteractiveStoryFooter")}
          <InteractiveStoryFooter story={story} />
        </div>
      </div>
      {console.log("[v0] ClaimedStoryPage render complete")}
    </div>
  )
}

function InteractiveStoryFooter({ story }: { story: any }) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [showMessageForm, setShowMessageForm] = useState(false)
  const storyUrl = typeof window !== "undefined" ? window.location.href : ""

  return (
    <>
      <div className="mt-16 text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold text-[#2c2c2c] mb-6">Share This Story</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Button
              onClick={() => setShowShareModal(true)}
              className="bg-[#c44c3a] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#a63d2e] transition-colors"
            >
              Share Link
            </Button>
            <Button
              onClick={() => setShowMessageForm(!showMessageForm)}
              className="border-2 border-[#c44c3a] text-[#c44c3a] px-8 py-3 rounded-xl font-semibold hover:bg-[#c44c3a] hover:text-white transition-colors"
            >
              Send Message
            </Button>
          </div>

          {/* Message Form */}
          {showMessageForm && (
            <div className="mt-6 p-4 bg-[#f5f0e8] rounded-xl">
              <textarea
                placeholder={`Send a message to ${story.owner.name.split("'s")[0] || story.owner.name}...`}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none h-24 mb-3"
              />
              <div className="flex gap-2">
                <Button className="flex-1 bg-[#c44c3a] text-white py-2 rounded-lg hover:bg-[#a63d2e] transition-colors">
                  Send Message
                </Button>
                <Button
                  onClick={() => setShowMessageForm(false)}
                  className="px-4 py-2 text-[#2c2c2c]/60 hover:text-[#2c2c2c] transition-colors"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          <p className="text-sm text-[#2c2c2c]/60">
            Inspired by this story?{" "}
            <Button asChild className="text-[#c44c3a] hover:underline font-medium">
              <Link href="/">Get your own Tag My Trophy</Link>
            </Button>
          </p>
        </div>
      </div>

      {/* Guest Comments Section */}
      <GuestComments
        storyId={story.id}
        storyTitle={story.owner.name}
        ownerName={story.owner.name}
        commentsEnabled={true}
      />

      {/* Enhanced Share Modal */}
      <EnhancedShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        storyTitle={story.owner.name}
        storyUrl={storyUrl}
        storyId={story.id}
        ownerName={story.owner.name}
      />
    </>
  )
}

export default function StoryPageClient({ story, slug }: { story: any; slug: string }) {
  console.log("[v0] StoryPageClient rendering", { slug, storyClaimed: story?.claimed, storyId: story?.id })

  // Handle unclaimed slugs
  if (!story.claimed) {
    console.log("[v0] Rendering unclaimed story page")
    return <UnclaimedStoryPage slug={slug} />
  }

  // Handle claimed stories
  console.log("[v0] Rendering claimed story page", { memoriesCount: story.memories?.length })
  return <ClaimedStoryPage story={story} />
}
