
import Image from 'next/image';
import type { Speaker } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SpeakerCardProps {
  speaker: Speaker;
}

export default function SpeakerCard({ speaker }: SpeakerCardProps) {
  // Removed useAuth and getSpeakerEvents as session details are no longer shown here

  return (
    <Card id={speaker.id} className="flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      <CardHeader className="p-0">
        <Link href={`/speakers/${speaker.id}`} aria-label={`View profile of ${speaker.name}`}>
          <div className="aspect-square relative w-full cursor-pointer">
            <Image
              src={speaker.imageUrl || `https://placehold.co/400x400.png?text=${speaker.name.substring(0,1)}`}
              alt={speaker.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              data-ai-hint={speaker.dataAiHint || "professional person"}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 md:p-6 flex-grow">
        <CardTitle className="text-xl md:text-2xl">
          <Link href={`/speakers/${speaker.id}`} className="hover:text-primary transition-colors">
            {speaker.name}
          </Link>
        </CardTitle>
        <CardDescription className="text-accent font-semibold mt-1 text-sm md:text-base">{speaker.title}</CardDescription>
        {/* Session details section removed from here */}
        <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-3">{speaker.bio}</p>
      </CardContent>
      <CardFooter className="p-4 md:p-6">
        <Button variant="link" asChild className="p-0 text-sm">
          <Link href={`/speakers/${speaker.id}`}>View Full Profile <ArrowRight className="ml-1 h-4 w-4" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
