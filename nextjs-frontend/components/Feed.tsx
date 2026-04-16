"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

export interface Video {
  _id: string;
  title: string;
  thumbnailUrl: string;
  user: {
    name: string;
    avatar?: string;
  };
  views: number;
  duration: string;
}

export default function Feed() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setTimeout(() => {
          setVideos([
            { _id: '1', title: 'Epic Sunset Rollerblading 🌅✨ in Downtown', thumbnailUrl: 'https://images.unsplash.com/photo-1498144846853-6ccaca2afddc?w=600&h=800&fit=crop', views: 8402, duration: '0:45', user: { name: 'Sarah Cruz', avatar: 'https://ui-avatars.com/api/?name=Sarah+Cruz' } },
            { _id: '2', title: 'Making the perfect Latte Art ☕️ satisfying moments', thumbnailUrl: 'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=600&h=800&fit=crop', views: 12530, duration: '1:12', user: { name: 'Barista John', avatar: 'https://ui-avatars.com/api/?name=Barista+John' } },
            { _id: '3', title: 'Mountain Bike Trail POV 🚲💨 Extreme!', thumbnailUrl: 'https://images.unsplash.com/photo-1544198365-f5d62b6f12e1?w=600&h=800&fit=crop', views: 2410, duration: '2:30', user: { name: 'Mike MTB', avatar: 'https://ui-avatars.com/api/?name=Mike+MTB' } },
            { _id: '4', title: 'Street Food in Tokyo 🍜🤤 Midnight snacks', thumbnailUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600&h=800&fit=crop', views: 45000, duration: '3:05', user: { name: 'Foodie Travels', avatar: 'https://ui-avatars.com/api/?name=Foodie+Travels' } },
            { _id: '5', title: 'Guitar Solo Cover - Sweet Child O Mine 🔥', thumbnailUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&h=800&fit=crop', views: 9820, duration: '1:50', user: { name: 'RockStar123', avatar: 'https://ui-avatars.com/api/?name=RockStar' } },
            { _id: '6', title: 'My Morning Skincare Routine 🧴✨ glass skin secrets', thumbnailUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=800&fit=crop', views: 320500, duration: '4:20', user: { name: 'BeautyByJess', avatar: 'https://ui-avatars.com/api/?name=Jessica+G' } },
            { _id: '7', title: 'Cyberpunk City Walk 4K ☂️🌃', thumbnailUrl: 'https://images.unsplash.com/photo-1518558997970-4fdcb6ae1286?w=600&h=800&fit=crop', views: 5600, duration: '5:00', user: { name: 'Neon Walker', avatar: 'https://ui-avatars.com/api/?name=Neon+Walker' } },
            { _id: '8', title: 'Baking perfectly flaky croissants 🥐', thumbnailUrl: 'https://images.unsplash.com/photo-1509365465985-25d11c17e0b2?w=600&h=800&fit=crop', views: 89000, duration: '0:59', user: { name: 'Chef Marie', avatar: 'https://ui-avatars.com/api/?name=Chef+Marie' } },
          ]);
          setIsLoading(false);
        }, 1200);
      } catch (err) {
        setIsLoading(false);
        console.error(err);
      }
    };
    
    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-4 py-8 max-w-[1400px] mx-auto">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-[9/16] rounded-3xl bg-white/5 animate-pulse overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            <div className="absolute bottom-0 left-0 w-full p-5 flex items-end gap-3 h-1/3">
               <div className="w-12 h-12 rounded-full bg-white/10 shrink-0" />
               <div className="flex-1 space-y-3 pb-1">
                 <div className="h-4 bg-white/10 rounded-md w-full" />
                 <div className="h-3 bg-white/10 rounded-md w-2/3" />
               </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-8 max-w-[1400px] mx-auto">
      <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
        <span className="w-2 h-8 rounded-full bg-gradient-to-t from-purple-500 to-rose-500 inline-block"></span>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          Trending <span className="text-white">Now</span>
        </span>
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <Link href={`/video/${video._id}`} key={video._id} className="group block">
            <div className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-black border border-white/5 shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-[0_25px_50px_-12px_rgba(255,255,255,0.1)] group-hover:border-white/10">
              
              <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/95 pointer-events-none" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-75">
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white text-[11px] font-bold px-2 py-1 rounded-lg border border-white/10 shadow-lg">
                {video.duration}
              </div>

              <div className="absolute bottom-0 left-0 w-full p-5 flex items-end gap-3 transform transition-transform duration-300 translate-y-1 group-hover:translate-y-0">
                <div className="relative">
                  <img 
                    src={video.user.avatar} 
                    alt={video.user.name} 
                    className="w-11 h-11 rounded-full border-2 border-white/20 shadow-xl object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm leading-snug drop-shadow-lg mb-1.5 line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-[11px] font-medium text-gray-300">
                    <span className="truncate pr-2">{video.user.name}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      {video.views > 1000 ? `${(video.views / 1000).toFixed(1)}k` : video.views}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
