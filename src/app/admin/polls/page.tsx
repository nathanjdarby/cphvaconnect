
"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/use-auth';
import type { Poll, User } from '../../../types';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '../../../components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { PollForm } from '../../../components/admin/poll-form';
import { Progress } from "../../../components/ui/progress";
import { PlusCircle, ShieldAlert, BarChart3, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AdminPollsPage() {
  const { user, loading, allPolls, closePoll, deletePoll } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [pollToDeleteId, setPollToDeleteId] = useState<string | null>(null);

  const authorizedRoles: User['role'][] = ['admin', 'organiser'];

  const sortedPolls = useMemo(() => {
    return [...(allPolls || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allPolls]);

  const handleClosePoll = async (pollId: string) => {
    await closePoll(pollId);
  };
  
  const handleDeleteConfirmation = (pollId: string) => {
    setPollToDeleteId(pollId);
    setIsAlertOpen(true);
  };

  const executeDeletePoll = async () => {
    if (pollToDeleteId) {
      await deletePoll(pollToDeleteId);
      setPollToDeleteId(null);
      setIsAlertOpen(false);
    }
  };


  if (loading) {
    return <div className="text-center py-10"><p>Loading admin polls...</p></div>;
  }

  if (!user || !authorizedRoles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Homepage</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
              <BarChart3 className="mr-3 h-8 w-8 text-accent" />
              Manage Polls
            </CardTitle>
            <CardDescription>Create, view results, and manage conference polls.</CardDescription>
          </div>
          <Button onClick={() => setIsSheetOpen(true)} size="lg">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Poll
          </Button>
        </CardHeader>
        <CardContent>
          {sortedPolls.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No polls created yet. Create one to get started!</p>
          ) : (
            <div className="space-y-4">
              {sortedPolls.map((poll) => {
                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
                return (
                  <Card key={poll.id} className="shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl text-primary">{poll.question}</CardTitle>
                          <CardDescription>
                            Created: {format(parseISO(poll.createdAt), 'MMM d, yyyy p')} - 
                            <span className={`ml-2 font-semibold ${poll.isOpen ? 'text-green-600' : 'text-red-600'}`}>
                              {poll.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </CardDescription>
                        </div>
                        {poll.isOpen && (
                          <Button variant="outline" size="sm" onClick={() => handleClosePoll(poll.id)}>
                            <XCircle className="mr-1 h-4 w-4" /> Close Poll
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Results:</h4>
                      {poll.options.length > 0 ? poll.options.map(option => {
                        const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                        return (
                          <div key={option.id} className="text-sm">
                            <div className="flex justify-between items-center mb-0.5">
                              <span>{option.text}</span>
                              <span className="text-muted-foreground">{option.votes} vote(s)</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                            <p className="text-xs text-right text-muted-foreground">{percentage.toFixed(1)}%</p>
                          </div>
                        );
                      }) : <p className="text-xs text-muted-foreground">No options for this poll.</p>}
                       <p className="text-xs text-muted-foreground pt-1">Total Votes: {totalVotes}</p>
                    </CardContent>
                    <CardFooter className="border-t pt-3 flex justify-end">
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteConfirmation(poll.id)}>
                            <Trash2 className="mr-1 h-4 w-4" /> Delete Poll
                        </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Poll</SheetTitle>
            <SheetDescription>
              Fill in the details for the new poll. Add at least two options.
            </SheetDescription>
          </SheetHeader>
          <PollForm
            isOpen={isSheetOpen}
            setIsOpen={setIsSheetOpen}
          />
        </SheetContent>
      </Sheet>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the poll and all its votes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeletePoll}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
