"use client";

import SpeakerCard from "../../components/conference/speaker-card";
import { useAuth } from "../../hooks/use-auth";
import { Card, CardContent } from "../../components/ui/card";

export default function SpeakersPage() {
  const { allSpeakers, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading speakers...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <h1 className="text-4xl font-bold text-primary">Meet Our Speakers</h1>
        <p className="mt-2 text-lg text-foreground/80">
          Learn from industry experts and thought leaders.
        </p>
      </section>

      {allSpeakers.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">
              Speaker information is being updated or no speakers have been
              added yet. Please check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allSpeakers.map((speaker) => (
            <SpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>
      )}
    </div>
  );
}
