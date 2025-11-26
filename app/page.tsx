"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Navigation from "@/components/navigation"
import { Suspense, lazy, useMemo } from "react"
import { LazyImage } from "@/components/ui/lazy-image"

const PricingSection = lazy(() => import("@/components/sections/pricing-section"))
const FooterSection = lazy(() => import("@/components/sections/footer-section"))

export default function HomePage() {
  const storyCards = useMemo(
    () => [
      {
        href: "/story/river-adventure-x7k9",
        image: "/serene-fishing-scene-with-tackle-box-by-lake-at-su.jpg",
        alt: "Jake's Fishing Adventures - Serene fishing scene with tackle box by lake at sunset",
        title: "Jake's Fishing Adventures",
        bio: "Lifelong angler sharing stories",
        emoji: "🎣",
        memories: 4,
        views: 127,
      },
      {
        href: "/story/tigers-soccer-2024",
        image: "/kids-soccer-team-celebrating-goal-on-field.jpg",
        alt: "Emma's Soccer Season 2024 - Kids soccer team celebrating goal on field",
        title: "Emma's Soccer Season",
        bio: "Championship winning season",
        emoji: "🏆",
        memories: 4,
        views: 156,
      },
      {
        href: "/story/mountain-journey-b3m5",
        image: "/beautiful-mountain-landscape-scenic-destination.jpg",
        alt: "Emma's Mountain Adventures - Beautiful mountain landscape scenic destination",
        title: "Mountain Adventures",
        bio: "Exploring Colorado's peaks",
        emoji: "⛰️",
        memories: 3,
        views: 89,
      },
      {
        href: "/story/wilderness-hunt-d7p4",
        image: "/hunter-with-trophy-buck-in-autumn-forest-wildernes.jpg",
        alt: "Mike's Hunting Chronicles - Hunter with trophy buck in autumn forest wilderness",
        title: "Hunting Chronicles",
        bio: "Tracking wilderness adventures",
        emoji: "🦌",
        memories: 5,
        views: 142,
      },
      {
        href: "/story/pet-adventures-k5m8",
        image: "/golden-retriever-dog-playing-outdoors-in-nature.jpg",
        alt: "Max's Pet Adventures - Golden retriever dog playing outdoors in nature",
        title: "Pet Adventures",
        bio: "Cherished moments with Max",
        emoji: "🐾",
        memories: 6,
        views: 218,
      },
      {
        href: "/story/meadow-celebration-q8w2",
        image: "/happy-multi-generational-family-enjoying-outdoor-f.jpg",
        alt: "Johnson Family Reunion 2024 - Multi-generational family gathering with outdoor activities",
        title: "Family Reunion 2024",
        bio: "Three generations together",
        emoji: "👨‍👩‍👧‍👦",
        memories: 8,
        views: 245,
      },
    ],
    [],
  )

  // Story cards prepared
  const storyCardsCount = storyCards.length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative min-h-screen flex items-center overflow-hidden" aria-labelledby="hero-heading">
        {/* Left Side - Content */}
        <div className="w-full lg:w-1/2 px-4 sm:px-6 lg:px-12 xl:px-16 py-20 lg:py-32 relative z-10">
          <div className="max-w-2xl">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-8 border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              PRESERVE YOUR LEGACY
            </div>

            {/* Main Headline */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black text-foreground mb-8 leading-[0.9] tracking-tight"
            >
              Turn your
              <span className="block text-primary">Memories</span>
              <span className="block text-muted-foreground text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-normal mt-4">
                into living stories
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-lg leading-relaxed">
              Perfect for hunting trophies, fishing memories, hiking adventures, kids sports seasons, pet memories and
              anything where you can stick the tag to. Preserve your legacy with QR-enabled memory collections.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl min-h-[60px]"
              >
                Start Your Collection
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary text-primary hover:bg-primary/5 px-8 py-6 text-lg font-semibold rounded-lg transition-all duration-200 min-h-[60px] bg-transparent"
                asChild
              >
                <a href="#browse-stories">View Examples</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-primary mb-1">10K+</div>
                <div className="text-sm text-muted-foreground font-medium">Memories</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-primary mb-1">50K+</div>
                <div className="text-sm text-muted-foreground font-medium">Stories</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-primary mb-1">99%</div>
                <div className="text-sm text-muted-foreground font-medium">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Photo Collage */}
        <div className="hidden lg:block lg:w-1/2 relative">
          {/* Photo Collage Grid */}
          <div className="h-full flex items-center justify-center p-8">
            <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
              {/* Top Left - Kids Sports */}
              <div className="relative overflow-hidden rounded-xl shadow-lg group aspect-square">
                <LazyImage
                  src="/kids-soccer-team-celebrating-goal-on-field.jpg"
                  alt="Kids sports memories - soccer team celebrating"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-foreground shadow-sm">
                    Kids Sports
                  </span>
                </div>
              </div>

              {/* Top Right - Mountain Adventure */}
              <div className="relative overflow-hidden rounded-xl shadow-lg group aspect-square">
                <LazyImage
                  src="/beautiful-mountain-landscape-scenic-destination.jpg"
                  alt="Mountain adventure memories - scenic landscape destination"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-foreground shadow-sm">
                    Adventures
                  </span>
                </div>
              </div>

              {/* Bottom Left - Hunters Hiking */}
              <div className="relative overflow-hidden rounded-xl shadow-lg group aspect-square">
                <LazyImage
                  src="/hunters-hiking-through-forest-trail-with-backpacks.jpg"
                  alt="Hunting and hiking memories - forest trail adventure"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-foreground shadow-sm">
                    Hunting Trips
                  </span>
                </div>
              </div>

              {/* Bottom Right - Fishing */}
              <div className="relative overflow-hidden rounded-xl shadow-lg group aspect-square">
                <LazyImage
                  src="/happy-multi-generational-family-outdoors-with-fish.jpg"
                  alt="Family fishing memories - lake and sunset fishing"
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  priority
                  sizes="25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-foreground shadow-sm">
                    Fishing Trips
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-16 right-12 bg-background/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-border max-w-xs z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary text-sm">🏆</span>
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">Nebo Hike</div>
                <div className="text-xs text-muted-foreground">2 minutes ago</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">"Just added another amazing memory!"</p>
          </div>

          <div className="lg:hidden absolute inset-0 opacity-5">
            <LazyImage
              src="/serene-fishing-scene-with-tackle-box-by-lake-at-su.jpg"
              alt=""
              width={400}
              height={600}
              className="w-full h-full object-cover"
              sizes="100vw"
            />
          </div>
        </div>
      </section>

      <section
        id="browse-stories"
        className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30"
        aria-labelledby="stories-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-accent/20">
              REAL STORIES
            </div>
            <h2 id="stories-heading" className="text-3xl sm:text-4xl md:text-6xl font-black text-foreground mb-6">
              MEMORIES IN ACTION
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium">
              Explore real memory pages to see how champions bring their adventures to life
            </p>
          </div>

          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10"
            role="list"
            aria-label="Example story collections"
          >
            {storyCards.map((story, index) => (
              <Link key={story.href} href={story.href} className="group" role="listitem">
                <Card className="bg-card border-border hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-105 overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 shadow-lg">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <LazyImage
                        src={story.image}
                        alt={story.alt}
                        width={400}
                        height={240}
                        className="w-full h-60 group-hover:scale-110 transition-transform duration-500"
                        aspectRatio="landscape"
                        priority={index < 3}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div
                        className="absolute top-4 right-4 bg-primary/90 p-2 rounded-full shadow-lg"
                        aria-hidden="true"
                      >
                        <span
                          className="text-primary-foreground text-xl"
                          role="img"
                          aria-label={`${story.title} category icon`}
                        >
                          {story.emoji}
                        </span>
                      </div>
                      <div className="absolute bottom-6 left-6 text-white z-10">
                        <h3 className="font-bold text-xl mb-2">{story.title}</h3>
                        <p className="text-sm text-white/90 font-medium">{story.bio}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div
                        className="flex justify-between items-center text-sm text-muted-foreground mb-4 font-medium"
                        aria-label="Story statistics"
                      >
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          {story.memories} memories
                        </span>
                        <span>{story.views} views</span>
                      </div>
                      <div className="flex items-center text-primary text-sm font-bold group-hover:text-accent transition-colors">
                        VIEW MEMORY TAG{" "}
                        <span
                          className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                          aria-hidden="true"
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - 3 Easy Steps */}
      <section
        id="how-it-works"
        className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background"
        aria-labelledby="how-it-works-heading"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="how-it-works-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Get started with your memory collection in just three simple steps
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12"
            role="list"
            aria-label="Steps to get started"
          >
            {/* Step 1: Order Your Tag */}
            <div className="text-center" role="listitem">
              <div className="relative mb-6">
                <div
                  className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-4"
                  aria-label="Step 1"
                >
                  <span className="text-primary-foreground text-2xl font-bold">1</span>
                </div>
                <div
                  className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center -mt-10 border-4 border-background"
                  aria-hidden="true"
                >
                  <span className="text-primary text-2xl" role="img" aria-label="Tag icon">
                    🏷️
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Order Your Tag</h3>
              <p className="text-muted-foreground text-pretty">
                Choose your plan and receive a durable metal QR tag with strong adhesive backing. Perfect for trophies,
                equipment, or any memorable item.
              </p>
            </div>

            {/* Step 2: Scan and Setup */}
            <div className="text-center" role="listitem">
              <div className="relative mb-6">
                <div
                  className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-4"
                  aria-label="Step 2"
                >
                  <span className="text-primary-foreground text-2xl font-bold">2</span>
                </div>
                <div
                  className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center -mt-10 border-4 border-background"
                  aria-hidden="true"
                >
                  <span className="text-primary text-2xl" role="img" aria-label="Mobile phone icon">
                    📱
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Scan and Setup</h3>
              <p className="text-muted-foreground text-pretty">
                Scan your QR tag with any smartphone to claim it and create your memory collection. Choose a theme and
                give your collection a meaningful name.
              </p>
            </div>

            {/* Step 3: Add Memories and Share */}
            <div className="text-center" role="listitem">
              <div className="relative mb-6">
                <div
                  className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-4"
                  aria-label="Step 3"
                >
                  <span className="text-primary-foreground text-2xl font-bold">3</span>
                </div>
                <div
                  className="w-16 h-16 mx-auto bg-background rounded-full flex items-center justify-center -mt-10 border-4 border-background"
                  aria-hidden="true"
                >
                  <span className="text-primary text-2xl" role="img" aria-label="Camera icon">
                    📸
                  </span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Add Memories & Share</h3>
              <p className="text-muted-foreground text-pretty">
                Upload photos, videos, and stories to your collection. Anyone can scan your tag to view and enjoy your
                memories instantly.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Start Your Memory Collection
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Tag My Trophy Section */}
      <section
        id="why-choose-tag-my-trophy"
        className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background"
        aria-labelledby="why-choose-heading"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h2 id="why-choose-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-8">
                Why Choose Tag My Trophy
              </h2>
              <ul className="space-y-6" role="list" aria-label="Benefits of Tag My Trophy">
                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-primary text-xl mt-1" aria-hidden="true">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Durable Metal Construction</h3>
                    <p className="text-muted-foreground">Weather-resistant engraved tags that last for years</p>
                  </div>
                </li>

                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-primary text-xl mt-1" aria-hidden="true">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Easy Adhesive Application</h3>
                    <p className="text-muted-foreground">Strong adhesive backing sticks to any clean surface</p>
                  </div>
                </li>

                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-primary text-xl mt-1" aria-hidden="true">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Unlimited Photo & Video Storage</h3>
                    <p className="text-muted-foreground">Add as many memories as you want to your collection</p>
                  </div>
                </li>

                <li className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-primary text-xl mt-1" aria-hidden="true">
                      ✓
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Share Your Story</h3>
                    <p className="text-muted-foreground">Anyone can scan and view your curated memories</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative">
              <LazyImage
                src="/happy-multi-generational-family-enjoying-outdoor-f.jpg"
                alt="Happy multi-generational family enjoying outdoor fishing activities together, showcasing the memories that can be preserved with Tag My Trophy"
                width={600}
                height={400}
                className="rounded-lg shadow-lg w-full h-auto"
                aspectRatio="landscape"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-background" aria-label="Loading pricing section">
            <div className="max-w-6xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-background/80 rounded w-1/3 mx-auto mb-4"></div>
                <div className="h-4 bg-background/80 rounded w-1/2 mx-auto mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
                  <div className="h-96 bg-background/80 rounded-lg"></div>
                  <div className="h-96 bg-background/80 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <PricingSection />
      </Suspense>

      <Suspense
        fallback={
          <div className="bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8" aria-label="Loading footer">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <div className="h-6 bg-muted/80 rounded w-3/4 mx-auto mb-4"></div>
                    <div className="h-4 bg-muted/80 rounded w-1/2 mx-auto mb-8"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-muted/80 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="h-4 bg-muted/80 rounded w-3/4 mx-auto mb-8"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-6 bg-muted/80 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="h-4 bg-muted/80 rounded w-3/4 mx-auto mb-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <FooterSection />
      </Suspense>
    </div>
  )
}
