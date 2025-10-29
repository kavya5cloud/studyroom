import { Button } from "@/components/ui/button";
import { Volume2, ChevronRight } from "lucide-react";
import characterBanner from "@/assets/character-banner.png";

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#8B6F47] to-[#5C4A3A] p-4">
      <div className="relative w-full max-w-4xl">
        {/* Main content card with vintage paper effect */}
        <div 
          className="relative bg-[#EDE4D4] rounded-lg overflow-hidden shadow-2xl border-8 border-[#8B6F47]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix values='0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.02 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }}
        >
          {/* Character image */}
          <div className="relative h-[400px] md:h-[500px]">
            <img 
              src={characterBanner} 
              alt="Study companion character" 
              className="w-full h-full object-cover"
            />
            
            {/* Vintage badge overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
              <div className="bg-[#6B1010] text-[#F5E6D3] px-12 py-6 rounded-full shadow-2xl border-4 border-[#8B6F47] transform hover:scale-105 transition-all duration-300">
                  <h1 className="text-4xl md:text-5xl font-bold text-center italic font-playfair">
                    Chill Times
                  </h1>
                  <p className="text-xl md:text-2xl text-center mt-1 italic font-playfair">
                    Study Companion
                  </p>
                </div>
                <ChevronRight className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 text-[#6B1010] animate-pulse" />
              </div>
            </div>
          </div>

          {/* Bottom section */}
          <div className="relative bg-gradient-to-b from-transparent to-[#8B6F47]/20 p-8 md:p-12">
            {/* Volume indicator */}
            <div className="flex items-center gap-2 mb-6 text-[#5C4A3A]">
              <Volume2 className="w-5 h-5" />
              <div className="flex-1 h-2 bg-[#5C4A3A]/20 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-[#6B1010] rounded-full" />
              </div>
            </div>

            {/* Dialogue box */}
            <div className="bg-[#F5E6D3] border-4 border-[#8B6F47] rounded-lg p-6 mb-8 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6B1010] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#F5E6D3] text-sm">♪</span>
                </div>
                <p className="text-lg md:text-xl text-[#5C4A3A] italic font-playfair">
                  "What's the plan for today? Let's make the most of our study session..."
                </p>
              </div>
            </div>

            {/* Start button */}
            <div className="text-center">
              <Button 
                variant="vintage" 
                size="xl"
                onClick={onStart}
                className="font-bold italic font-playfair"
              >
                Click anywhere to begin
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
