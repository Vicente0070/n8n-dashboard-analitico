import { Card } from "@/components/ui/card";
import { Activity, BarChart3, Zap, AlertTriangle, TrendingUp } from "lucide-react";

interface Execution {
  id: string;
  status: string;
  startedAt: string;
  stoppedAt: string;
  workflowId: string;
}

interface Workflow {
  id: string;
  name: string;
}

interface KPICardsProps {
  execs: Execution[];
  workflows: Workflow[];
  n8nUrl: string;
}

export const KPICards = ({ execs, workflows, n8nUrl }: KPICardsProps) => {
  const latestStatus = execs[0]?.status || "unknown";
  const totalExecs = execs.length;
  const errorExecs = execs.filter((e) => e.status !== "success");
  const successRate = totalExecs > 0 ? ((totalExecs - errorExecs.length) / totalExecs) * 100 : 0;

  const lastError = errorExecs[0];

  const avgLatency =
    execs.length > 0
      ? execs.reduce((acc, exec) => {
          const duration = new Date(exec.stoppedAt).getTime() - new Date(exec.startedAt).getTime();
          return acc + duration;
        }, 0) / execs.length
      : 0;

  const getWorkflowName = (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    return workflow?.name || workflowId;
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const openExecution = (workflowId: string, execId: string) => {
    const url = `${n8nUrl}/workflow/${workflowId}/executions/${execId}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {/* Status Card */}
      <Card className="p-3 sm:p-4 bg-card border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="kpi-label mb-1 sm:mb-2">STATUS</p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className={`status-dot ${latestStatus === "success" ? "status-dot-success" : "status-dot-error"}`} />
              <p className={`text-sm sm:text-lg font-semibold terminal-text ${
                latestStatus === "success" ? "text-primary" : "text-destructive"
              }`}>
                {latestStatus === "success" ? "Online" : "Erro"}
              </p>
            </div>
          </div>
          <Activity className={`h-5 w-5 sm:h-8 sm:w-8 ${latestStatus === "success" ? "text-primary/40" : "text-destructive/40"}`} />
        </div>
      </Card>

      {/* Total Executions Card */}
      <Card className="p-3 sm:p-4 bg-card border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="kpi-label mb-1 sm:mb-2">EXECUÇÕES</p>
            <p className="kpi-value text-foreground terminal-text">{totalExecs.toLocaleString()}</p>
          </div>
          <BarChart3 className="h-5 w-5 sm:h-8 sm:w-8 text-muted-foreground/30" />
        </div>
      </Card>

      {/* Success Rate Card */}
      <Card className="p-3 sm:p-4 bg-card border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="kpi-label mb-1 sm:mb-2">TAXA SUCESSO</p>
            <p className="kpi-value text-primary terminal-text">{successRate.toFixed(1)}%</p>
          </div>
          <TrendingUp className="h-5 w-5 sm:h-8 sm:w-8 text-primary/30" />
        </div>
      </Card>

      {/* Average Latency Card */}
      <Card className="p-3 sm:p-4 bg-card border-border">
        <div className="flex items-center justify-between">
          <div>
            <p className="kpi-label mb-1 sm:mb-2">LATÊNCIA</p>
            <p className="kpi-value text-foreground terminal-text">{formatLatency(avgLatency)}</p>
          </div>
          <Zap className="h-5 w-5 sm:h-8 sm:w-8 text-muted-foreground/30" />
        </div>
      </Card>

      {/* Last Error Card - Clickable */}
      <Card
        className={`p-3 sm:p-4 bg-card border-border fast-transition col-span-2 sm:col-span-1 ${
          lastError ? "cursor-pointer active:bg-secondary hover:bg-secondary" : ""
        }`}
        onClick={() => lastError && openExecution(lastError.workflowId, lastError.id)}
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="kpi-label mb-1 sm:mb-2">ÚLTIMO ERRO</p>
            {lastError ? (
              <>
                <p className="text-sm sm:text-lg font-semibold terminal-text text-destructive truncate">
                  #{lastError.id}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground terminal-text truncate mt-0.5 sm:mt-1">
                  {getWorkflowName(lastError.workflowId)}
                </p>
              </>
            ) : (
              <p className="text-sm sm:text-lg font-semibold terminal-text text-muted-foreground">Nenhum</p>
            )}
          </div>
          <AlertTriangle className={`h-5 w-5 sm:h-8 sm:w-8 flex-shrink-0 ${lastError ? "text-destructive/40" : "text-muted-foreground/20"}`} />
        </div>
      </Card>
    </div>
  );
};
