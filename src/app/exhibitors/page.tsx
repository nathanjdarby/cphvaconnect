"use client";

import { useAuth } from "@/hooks/use-auth";
import type { ExhibitorType } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ExternalLink, Building2, MapPin } from "lucide-react";

export default function ExhibitorsPage() {
  const { allExhibitors, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-10">
        <p>Loading exhibitors...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <Building2 className="mx-auto h-12 w-12 text-primary mb-4" />
        <h1 className="text-4xl font-bold text-primary">
          Conference Exhibitors
        </h1>
        <p className="mt-2 text-lg text-foreground/80">
          Discover innovative companies and solutions in our exhibition hall.
        </p>
      </section>

      {allExhibitors.length === 0 ? (
        <Card className="text-center py-10">
          <CardContent>
            <p className="text-muted-foreground">
              Exhibitor information is being updated or no exhibitors have been
              added yet. Please check back soon!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allExhibitors.map((ex) => (
            <Card
              key={ex.id}
              className="shadow-lg flex flex-col overflow-hidden h-full"
            >
              <CardHeader className="p-0 relative aspect-[16/9] bg-muted">
                <Image
                  src={
                    ex.logoUrl ||
                    `https://placehold.co/400x225.png?text=${ex.name
                      .substring(0, 3)
                      .toUpperCase()}`
                  }
                  alt={`${ex.name} logo`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain p-4"
                  data-ai-hint={ex.dataAiHint || "company logo"}
                />
              </CardHeader>
              <CardContent className="p-4 md:p-6 flex-grow">
                <CardTitle className="text-xl md:text-2xl text-primary">
                  {ex.name}
                </CardTitle>
                {ex.boothNumber && (
                  <CardDescription className="text-md text-accent font-semibold mt-1 flex items-center">
                    <MapPin className="mr-1.5 h-5 w-5 text-muted-foreground" />{" "}
                    Booth: {ex.boothNumber}
                  </CardDescription>
                )}
                <p className="mt-3 text-sm text-foreground/80 leading-relaxed line-clamp-4">
                  {ex.description}
                </p>
              </CardContent>
              {ex.websiteUrl && (
                <CardFooter className="border-t p-4 md:p-6">
                  <Button
                    variant="link"
                    asChild
                    className="p-0 h-auto text-sm text-primary hover:underline"
                  >
                    <a
                      href={ex.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit Website <ExternalLink className="ml-1.5 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
