import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { KPICards } from "@/components/dashboard/KPICards";
import { InstanceMonitor } from "@/components/dashboard/InstanceMonitor";
import { TokenUsagePanel } from "@/components/dashboard/TokenUsagePanel";
import { ExecutionLogsTable } from "@/components/dashboard/ExecutionLogsTable";
import { ErrorLogsTable } from "@/components/dashboard/ErrorLogsTable";
import { WorkflowsList } from "@/components/dashboard/WorkflowsList";
import { PWAInstallPrompt } from "@/components/dashboard/PWAInstallPrompt";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { useErrorNotifications } from "@/hooks/useErrorNotifications";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { config } from "@/config";

interface DashboardData {
  execs: Array<{
    id: string;
    finished: boolean;
    status: string;
    startedAt: string;
    stoppedAt: string;
    workflowId: string;
  }>;
  workflows: Array<{
    id: string;
    name: string;
    updatedAt: string;
    tags: Array<{ id: string; name: string }>;
  }>;
  instances: Array<{
    id: string;
    name: string;
    profileName: string;
    number: string;
    connectionStatus: string;
    disconnectionReasonCode: number | null;
    disconnectionObject: {
      error?: {
        output?: {
          payload?: {
            message?: string;
          };
        };
      };
    } | null;
  }>;
  total: number;
  dados_dev: {
    empresa: string;
    nome: string;
    whatsapp: string;
    n8nurl: string;
    instagram: string;
    site: string;
  };
}

const Index = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const response = await fetch(config.DASHBOARD_WEBHOOK_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }
      const rawData = await response.json();

      const parsedData: DashboardData = {
        execs: rawData[0]?.execs || [],
        workflows: rawData[1]?.workflows || [],
        instances: rawData[2]?.instances || [],
        total: rawData[2]?.total || 0,
        dados_dev: rawData[3]?.dados_dev || {},
      };

      return parsedData;
    },
    refetchInterval: config.REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: false,
  });

  // Error notifications with sound
  useErrorNotifications(
    data?.execs || [],
    data?.workflows || [],
    data?.dados_dev?.n8nurl || ''
  );

  useEffect(() => {
    if (data) {
      setLastUpdate(new Date());
    }
  }, [data]);

  const handleManualRefresh = async () => {
    toast.info("Recarregando dados...");
    await refetch();
    toast.success("Dados atualizados");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground terminal-text text-sm">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <p className="text-destructive text-lg terminal-text">Erro na conexão</p>
          <Button onClick={handleManualRefresh} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4 md:p-6 pb-safe">
      <div className="max-w-[1920px] mx-auto space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <header className="flex flex-col gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <DashboardHeader devData={data.dados_dev} />
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <span className="text-[10px] sm:text-xs text-muted-foreground terminal-text">
                {lastUpdate.toLocaleTimeString("pt-BR")}
              </span>
              <Button
                onClick={handleManualRefresh}
                variant="outline"
                size="sm"
                disabled={isFetching}
                className="gap-1.5 sm:gap-2 h-8 text-[10px] sm:text-xs px-2 sm:px-3"
              >
                <RefreshCw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span className="hidden xs:inline">Atualizar</span>
              </Button>
            </div>
          </div>
        </header>

        {/* KPI Cards */}
        <section>
          <KPICards execs={data.execs} workflows={data.workflows} n8nUrl={data.dados_dev.n8nurl} />
        </section>

        {/* Instance Monitor */}
        <section>
          <InstanceMonitor instances={data.instances} total={data.total} />
        </section>

        {/* Token Usage Panel */}
        <section>
          <TokenUsagePanel />
        </section>

        {/* Logs Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <section>
            <ExecutionLogsTable execs={data.execs} workflows={data.workflows} n8nUrl={data.dados_dev.n8nurl} />
          </section>

          <section>
            <ErrorLogsTable execs={data.execs} workflows={data.workflows} n8nUrl={data.dados_dev.n8nurl} />
          </section>
        </div>

        {/* Workflows List */}
        <section>
          <WorkflowsList workflows={data.workflows} />
        </section>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default Index;
