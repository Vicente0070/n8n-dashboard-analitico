import { useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { config } from '@/config';

interface Execution {
  id: string;
  status: string;
  stoppedAt: string;
  workflowId: string;
}

interface Workflow {
  id: string;
  name: string;
}

// Generate a subtle notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for a soft beep
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Soft, subtle sound settings
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    // Volume from config
    gainNode.gain.setValueAtTime(config.NOTIFICATION_SOUND_VOLUME, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.15);
    
    // Cleanup
    setTimeout(() => {
      audioContext.close();
    }, 200);
  } catch (error) {
    console.log('Audio notification not supported');
  }
};

export const useErrorNotifications = (
  execs: Execution[],
  workflows: Workflow[],
  n8nUrl: string
) => {
  const notifiedErrorsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef(true);

  const getWorkflowName = useCallback((workflowId: string) => {
    return workflows.find(w => w.id === workflowId)?.name || 'Workflow desconhecido';
  }, [workflows]);

  useEffect(() => {
    // Skip first load to avoid notifications on page refresh
    if (isFirstLoadRef.current) {
      // Mark existing errors as already notified
      execs
        .filter(exec => exec.status === 'error')
        .forEach(exec => notifiedErrorsRef.current.add(exec.id));
      isFirstLoadRef.current = false;
      return;
    }

    const now = new Date();
    const thresholdMs = config.ERROR_NOTIFICATION_THRESHOLD_MINUTES * 60000;
    const thresholdTime = new Date(now.getTime() - thresholdMs);

    // Find recent errors that haven't been notified
    const recentErrors = execs.filter(exec => {
      if (exec.status !== 'error') return false;
      if (notifiedErrorsRef.current.has(exec.id)) return false;
      
      const stoppedAt = new Date(exec.stoppedAt);
      return stoppedAt > thresholdTime;
    });

    if (recentErrors.length === 0) return;

    // Mark all as notified
    recentErrors.forEach(exec => notifiedErrorsRef.current.add(exec.id));

    // Play notification sound (only once for all errors)
    playNotificationSound();

    // Show single notification for all errors
    if (recentErrors.length === 1) {
      const error = recentErrors[0];
      const workflowName = getWorkflowName(error.workflowId);
      
      toast.error(`Erro em: ${workflowName}`, {
        duration: 4000,
        action: {
          label: 'Ver',
          onClick: () => {
            window.open(
              `${n8nUrl}/workflow/${error.workflowId}/executions/${error.id}`,
              '_blank'
            );
          },
        },
      });
    } else {
      toast.error(`${recentErrors.length} novos erros detectados`, {
        duration: 4000,
        description: 'Verifique a seção de erros abaixo',
      });
    }
  }, [execs, workflows, n8nUrl, getWorkflowName]);
};
