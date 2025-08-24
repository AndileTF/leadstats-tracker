import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock } from 'lucide-react';

interface SessionTimeoutDialogProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  warningTime: number; // in seconds
}

export const SessionTimeoutDialog = ({
  isOpen,
  onExtendSession,
  onLogout,
  warningTime = 300 // 5 minutes default
}: SessionTimeoutDialogProps) => {
  const [timeLeft, setTimeLeft] = useState(warningTime);

  useEffect(() => {
    if (!isOpen) {
      setTimeLeft(warningTime);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, warningTime, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressValue = ((warningTime - timeLeft) / warningTime) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">\
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Session Timeout Warning
          </DialogTitle>
          <DialogDescription>
            Your session will expire due to inactivity. You will be automatically logged out in:
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="flex items-center gap-2 text-2xl font-mono font-bold text-destructive">
            <Clock className="h-6 w-6" />
            {formatTime(timeLeft)}
          </div>
          
          <div className="w-full space-y-2">
            <Progress value={progressValue} className="h-2" />
            <p className="text-sm text-muted-foreground text-center">
              Session will expire automatically
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="flex-1"
          >
            Logout Now
          </Button>
          <Button
            onClick={onExtendSession}
            className="flex-1"
          >
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};