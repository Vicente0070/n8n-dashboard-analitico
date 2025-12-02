import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Filter } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Execution {
  id: string;
  finished: boolean;
  status: string;
  startedAt: string;
  stoppedAt: string;
  workflowId: string;
}

interface Workflow {
  id: string;
  name: string;
}

interface ErrorLogsTableProps {
  execs: Execution[];
  workflows: Workflow[];
  n8nUrl: string;
}

export const ErrorLogsTable = ({ execs, workflows, n8nUrl }: ErrorLogsTableProps) => {
  const [displayCount, setDisplayCount] = useState(30);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>("all");

  const errorExecs = execs.filter((exec) => exec.status !== "success");

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    return workflow?.name || workflowId;
  };

  const formatDuration = (start: string, stop: string) => {
    const duration = new Date(stop).getTime() - new Date(start).getTime();
    
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${(duration / 1000).toFixed(2)}s`;
    if (duration < 3600000) {
      const minutes = Math.floor(duration / 60000);
      const seconds = ((duration % 60000) / 1000).toFixed(0);
      return `${minutes}m ${seconds}s`;
    }
    const hours = Math.floor(duration / 3600000);
    const minutes = Math.floor((duration % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const openExecution = (workflowId: string, execId: string) => {
    const url = `${n8nUrl}/workflow/${workflowId}/executions/${execId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Filter by workflow
  const filteredExecs = selectedWorkflow === "all" 
    ? errorExecs 
    : errorExecs.filter((exec) => exec.workflowId === selectedWorkflow);

  const displayedExecs = filteredExecs.slice(0, displayCount);

  // Get workflows that have errors
  const workflowsWithErrors = workflows.filter((w) => 
    errorExecs.some((e) => e.workflowId === w.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:gap-0 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="section-title">Logs de Erros</h2>
          {errorExecs.length > 0 && (
            <Badge variant="destructive" className="terminal-text text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
              {errorExecs.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none">
            <Filter className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
            <Select value={selectedWorkflow} onValueChange={setSelectedWorkflow}>
              <SelectTrigger className="w-full sm:w-[200px] terminal-text bg-card border-border text-[10px] sm:text-sm h-8">
                <SelectValue placeholder="Filtrar por Workflow" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all" className="terminal-text text-xs sm:text-sm">
                  Todos os Workflows
                </SelectItem>
                {workflowsWithErrors.map((workflow) => (
                  <SelectItem key={workflow.id} value={workflow.id} className="terminal-text text-xs sm:text-sm">
                    {workflow.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground terminal-text whitespace-nowrap">
            {displayedExecs.length}/{filteredExecs.length}
          </span>
        </div>
      </div>

      {filteredExecs.length === 0 ? (
        <Card className="bg-card border-border p-6">
          <div className="flex items-center justify-center gap-3 text-primary">
            <span className="status-dot status-dot-success" />
            <p className="terminal-text text-sm">Nenhum erro registrado</p>
          </div>
          <p className="text-muted-foreground terminal-text text-xs mt-2 text-center">
            Todas as execuções foram bem-sucedidas
          </p>
        </Card>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="md:hidden space-y-2 max-h-[400px] overflow-y-auto">
            {displayedExecs.map((exec) => (
              <div
                key={exec.id}
                onClick={() => openExecution(exec.workflowId, exec.id)}
                className="mobile-log-card border-l-2 border-l-destructive/50 active:bg-destructive/10"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-xs terminal-text truncate font-medium">
                      {getWorkflowName(exec.workflowId)}
                    </p>
                    <p className="text-destructive text-[10px] terminal-text font-mono">
                      #{exec.id}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot status-dot-error" />
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground terminal-text">
                  <span>{formatTime(exec.startedAt)}</span>
                  <span className="font-mono">{formatDuration(exec.startedAt, exec.stoppedAt)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <Card className="hidden md:block bg-card border-border overflow-hidden border-l-2 border-l-destructive/50">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-secondary border-b border-border">
                  <tr className="terminal-text text-muted-foreground">
                    <th className="px-4 py-3 text-left font-medium text-xs">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-xs">WORKFLOW</th>
                    <th className="px-4 py-3 text-left font-medium text-xs">STATUS</th>
                    <th className="px-4 py-3 text-right font-medium text-xs">DURAÇÃO</th>
                    <th className="px-4 py-3 text-left font-medium text-xs">INICIADO</th>
                    <th className="px-4 py-3 text-center font-medium text-xs">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedExecs.map((exec) => (
                    <tr
                      key={exec.id}
                      onClick={() => openExecution(exec.workflowId, exec.id)}
                      className="hover:bg-destructive/5 cursor-pointer fast-transition terminal-text"
                    >
                      <td className="px-4 py-2.5 text-destructive font-mono text-xs">{exec.id}</td>
                      <td className="px-4 py-2.5 text-foreground truncate max-w-xs text-xs">
                        {getWorkflowName(exec.workflowId)}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="status-dot status-dot-error" />
                          <span className="text-xs text-destructive">
                            {exec.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground font-mono text-xs">
                        {formatDuration(exec.startedAt, exec.stoppedAt)}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground font-mono text-xs">
                        {formatTime(exec.startedAt)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground inline-block" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {filteredExecs.length > displayCount && (
            <div className="text-center">
              <button
                onClick={() => setDisplayCount(prev => prev + 30)}
                className="text-xs text-primary hover:text-primary/80 terminal-text"
              >
                Carregar mais ({filteredExecs.length - displayCount} restantes)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
