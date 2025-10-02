import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, ArrowRight, Award } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface CourseDisplayProps {
  title: string;
  instructions: string;
  isComplete: boolean;
  onNextCourse: () => void;
  isLastCourse: boolean;
  onClaimCertificate: () => void;
}

export default function CourseDisplay({ title, instructions, isComplete, onNextCourse, isLastCourse, onClaimCertificate }: CourseDisplayProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (isComplete && !isLastCourse) {
      setShowConfetti(true);
      setShowCongrats(true);
      audioRef.current?.play();
      setTimeout(() => {
        setShowConfetti(false);
        setShowCongrats(false);
      }, 5000); // Stop effects after 5 seconds
    }
  }, [isComplete, isLastCourse]);

  return (
    <Card className="bg-panel-bg border-border-color h-full flex flex-col">
      {showConfetti && <Confetti width={width} height={height} />}
      {showCongrats && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <h1 className="text-white text-5xl font-bold fade-in-out">Congratulations!</h1>
        </div>
      )}
      <audio ref={audioRef} src="https://www.myinstants.com/media/sounds/tada-fanfare-a-6312.mp3" />
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {isComplete ? (
            <CheckCircle className="text-accent-green" />
          ) : (
            <XCircle className="text-accent-red" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <p className="text-text-secondary whitespace-pre-wrap">{instructions}</p>
        {isComplete && (
          <div className="mt-4">
            <p className="text-white font-bold">Level Complete!</p>
            {isLastCourse ? (
              <Button onClick={onClaimCertificate} className="mt-2 w-full">
                Claim Certificate <Award className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={onNextCourse} className="mt-2 w-full">
                Next Level <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
