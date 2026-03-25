'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    sectionRefs.current.forEach((section) => {
      if (section) {
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              once: true,
            },
          }
        );
      }
    });
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/hero-background.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <main className="relative z-10 container mx-auto flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Introduction Container */}
          <Card 
            ref={(el) => (sectionRefs.current[0] = el)}
            className="bg-gray-900 border-gray-700"
          >
            <CardHeader>
              <CardTitle className="text-3xl text-white">About the Makerspace Hub</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed text-gray-200">
                <strong>The University Makerspace Hub</strong> is a hands-on innovation environment built for experimentation, prototyping, and collaborative problem-solving. It exists to bridge the gap between theory and practice—giving students and innovators a place to turn ideas into tangible results.
              </p>
              <p className="italic text-gray-300">
                This is not just a room with tools. It is a working laboratory for creativity, engineering, design, and interdisciplinary collaboration.
              </p>
            </CardContent>
          </Card>

          {/* Mission Container */}
          <Card 
            ref={(el) => (sectionRefs.current[1] = el)}
            className="bg-gray-900 border-gray-700"
          >
            <CardHeader>
              <CardTitle className="text-2xl text-white">🎯 Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg leading-relaxed text-gray-200">
                Our mission is to cultivate a culture of making—where curiosity is encouraged, failure is part of learning, and innovation is driven by practical engagement.
              </p>
              <p className="font-medium text-gray-200">We aim to empower our members to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-200">
                <li><strong>Build</strong> real-world solutions.</li>
                <li><strong>Develop</strong> technical confidence.</li>
                <li><strong>Collaborate</strong> across disciplines.</li>
                <li><strong>Transform</strong> concepts into functional prototypes.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Differentiator Container */}
          <Card 
            ref={(el) => (sectionRefs.current[2] = el)}
            className="bg-gray-900 border-gray-700"
          >
            <CardHeader>
              <CardTitle className="text-2xl text-white">🚀 What Makes This Hub Different?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-gray-200">
                <li>
                  <strong>Access to Advanced Tools:</strong> From fabrication equipment to electronics workstations, members gain access to industry-relevant tools in a supervised and structured environment.
                </li>
                <li>
                  <strong>Skill Development:</strong> Workshops, peer-led sessions, and guided training programs help members move from beginner to competent maker.
                </li>
                <li>
                  <strong>Collaborative Innovation:</strong> The hub brings together students from engineering, computer science, design, and other disciplines to work on shared challenges.
                </li>
                <li>
                  <strong>Project Incubation:</strong> Members are encouraged to develop personal, academic, and entrepreneurial projects within the space.
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Community Container */}
          <Card 
            ref={(el) => (sectionRefs.current[3] = el)}
            className="bg-gray-900 border-gray-700"
          >
            <CardHeader>
              <CardTitle className="text-2xl text-white">🤝 Our Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-lg text-gray-200">The Makerspace Hub thrives on its community. It is built specifically for:</p>
              <ul className="list-disc pl-6 space-y-2 mb-6 text-gray-200">
                <li><strong>Students</strong> eager to apply classroom knowledge.</li>
                <li><strong>Innovators</strong> exploring new technologies.</li>
                <li><strong>Teams</strong> building capstone or research projects.</li>
                <li><strong>Creators</strong> who learn best by doing.</li>
              </ul>
              <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-500/20 text-blue-100 font-semibold rounded-r-lg">
                Here, ideas move beyond discussion and into creation.
              </blockquote>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

