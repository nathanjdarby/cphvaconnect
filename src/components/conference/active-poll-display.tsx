
"use client";

import { useAuth } from '@/hooks/use-auth';
import { Poll, PollOption, UserVote } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useMemo } from 'react';
import { BarChart3, Check, X } from 'lucide-react';

export default function ActivePollDisplay() {
  const { user, allPolls, userVotes, castVote, loading } = useAuth();
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showResultsForPollId, setShowResultsForPollId] = useState<string | null>(null);

  const activePoll = useMemo(() => {
    if (loading || !allPolls) return null;
    // Find the most recently created open poll
    return allPolls
      .filter(p => p.isOpen)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;
  }, [allPolls, loading]);

  const hasVotedInActivePoll = useMemo(() => {
    if (!user || !activePoll || !userVotes) return false;
    return userVotes.some(vote => vote.userId === user.id && vote.pollId === activePoll.id);
  }, [user, activePoll, userVotes]);

  useEffect(() => {
    // Reset selection if active poll changes
    setSelectedOptionId(null);
    // If user has already voted in new active poll, or if it's closed for display, show its results
    if (activePoll && (hasVotedInActivePoll || !activePoll.isOpen)) {
        setShowResultsForPollId(activePoll.id);
    } else {
        setShowResultsForPollId(null);
    }
  }, [activePoll, hasVotedInActivePoll]);

  const handleVoteSubmit = async () => {
    if (!activePoll || !selectedOptionId || !user) return;
    const success = await castVote(activePoll.id, selectedOptionId);
    if (success) {
        setShowResultsForPollId(activePoll.id); // Show results after successful vote
    }
  };

  if (loading || !user) { // Don't show for logged-out users or while loading
    return null;
  }

  const pollToDisplayResults = showResultsForPollId ? allPolls.find(p => p.id === showResultsForPollId) : activePoll;


  if (!pollToDisplayResults) {
    return null; // No active poll to display
  }

  const totalVotes = pollToDisplayResults.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <Card className="shadow-2xl border-primary/50">
        <CardHeader className="bg-primary/10 dark:bg-primary/20">
          <CardTitle className="flex items-center text-primary">
            <BarChart3 className="mr-2 h-5 w-5" /> 
            {pollToDisplayResults.isOpen && !hasVotedInActivePoll && !showResultsForPollId ? "Live Poll" : "Poll Results"}
          </CardTitle>
          <CardDescription>{pollToDisplayResults.question}</CardDescription>
        </CardHeader>
        <CardContent className="py-4 space-y-3">
          {(!pollToDisplayResults.isOpen || hasVotedInActivePoll || showResultsForPollId === pollToDisplayResults.id) ? (
            // Show results
            <div className="space-y-2">
              {pollToDisplayResults.options.map(option => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const userVotedForThisOption = userVotes.find(v => v.userId === user?.id && v.pollId === pollToDisplayResults.id && v.optionId === option.id);
                return (
                  <div key={option.id} className="text-sm">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={`font-medium ${userVotedForThisOption ? 'text-primary' : ''}`}>
                        {option.text} {userVotedForThisOption && <Check className="inline h-4 w-4 ml-1" />}
                      </span>
                      <span className="text-muted-foreground">{option.votes} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-accent transition-all duration-500 ease-out" 
                            style={{ width: `${percentage}%`}}
                        />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-muted-foreground pt-1 text-right">Total Votes: {totalVotes}</p>
              {!pollToDisplayResults.isOpen && <p className="text-xs text-center text-destructive font-medium mt-2">This poll is now closed.</p>}
            </div>
          ) : (
            // Show voting options
            <RadioGroup value={selectedOptionId ?? ""} onValueChange={setSelectedOptionId}>
              {activePoll!.options.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`poll-${activePoll!.id}-opt-${option.id}`} />
                  <Label htmlFor={`poll-${activePoll!.id}-opt-${option.id}`} className="cursor-pointer flex-1">
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </CardContent>
        {activePoll && activePoll.isOpen && !hasVotedInActivePoll && !showResultsForPollId && (
          <CardFooter className="flex justify-end">
            <Button onClick={handleVoteSubmit} disabled={!selectedOptionId}>
              Submit Vote
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
