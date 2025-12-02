import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowDownRight, ArrowUpRight, CalendarIcon } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { config } from "@/config";

interface TokenData {
  data: string;
  id_projeto: string;
  tokens_input: number;
  tokens_output: number;
  tokens_total_dia: number;
}

interface CostData {
  data: string;
  id_projeto: string;
  valor_gasto_usd: number;
}

interface TokenUsageResponse {
  relatorio_tokens_raw: TokenData[];
  total_dias_processados: number;
}

interface CostResponse {
  relatorio_custos_raw: CostData[];
  custo_total_geral: string;
  total_dias_processados: number;
}

interface ProjectMapping {
  mapeamento_projetos: Record<string, string>;
}

const TokenUsagePanel = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState<Date>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<Date>(today);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["token-usage"],
    queryFn: async () => {
      const response = await fetch(config.TOKEN_USAGE_WEBHOOK_URL);
      if (!response.ok) throw new Error("Failed to fetch");
      const rawData = await response.json();
      return {
        tokens: rawData[0] as TokenUsageResponse,
        costs: rawData[1] as CostResponse,
        projects: rawData[2] as ProjectMapping,
      };
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const projectIdToName = useMemo(() => {
    if (!data?.projects?.mapeamento_projetos) return {};
    const mapping: Record<string, string> = {};
    Object.entries(data.projects.mapeamento_projetos).forEach(([name, id]) => {
      mapping[id] = name;
    });
    return mapping;
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return { byProject: [], totalTokens: 0, totalCost: 0, totalInput: 0, totalOutput: 0, daysCount: 0 };
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    let tokens = (data.tokens.relatorio_tokens_raw || []).filter((t) => {
      const d = new Date(t.data);
      return d >= start && d <= end;
    });
    let costs = (data.costs.relatorio_custos_raw || []).filter((c) => {
      const d = new Date(c.data);
      return d >= start && d <= end;
    });
    const projectStats: Record<
      string,
      { tokens: number; input: number; output: number; cost: number; days: Set<string> }
    > = {};
    tokens.forEach((t) => {
      if (!projectStats[t.id_projeto])
        projectStats[t.id_projeto] = { tokens: 0, input: 0, output: 0, cost: 0, days: new Set() };
      projectStats[t.id_projeto].tokens += t.tokens_total_dia;
      projectStats[t.id_projeto].input += t.tokens_input;
      projectStats[t.id_projeto].output += t.tokens_output;
      projectStats[t.id_projeto].days.add(t.data);
    });
    costs.forEach((c) => {
      if (!projectStats[c.id_projeto])
        projectStats[c.id_projeto] = { tokens: 0, input: 0, output: 0, cost: 0, days: new Set() };
      projectStats[c.id_projeto].cost += c.valor_gasto_usd;
    });
    const byProject = Object.entries(projectStats).map(([id, stats]) => ({
      id,
      name: projectIdToName[id] || id.slice(0, 8),
      ...stats,
      daysCount: stats.days.size,
    }));
    const totalTokens = byProject.reduce((sum, p) => sum + p.tokens, 0);
    const totalCost = byProject.reduce((sum, p) => sum + p.cost, 0);
    const totalInput = byProject.reduce((sum, p) => sum + p.input, 0);
    const totalOutput = byProject.reduce((sum, p) => sum + p.output, 0);
    const allDays = new Set<string>();
    byProject.forEach((p) => p.days.forEach((d) => allDays.add(d)));
    return { byProject, totalTokens, totalCost, totalInput, totalOutput, daysCount: allDays.size };
  }, [data, startDate, endDate, projectIdToName]);

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000000) return `${(tokens / 1000000000).toFixed(2)}B`;
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(2)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };
  const formatUSD = (value: number): string => `$${value.toFixed(2)}`;
  const formatBRL = (value: number): string => `R$${(value * config.USD_TO_BRL).toFixed(2)}`;

  if (isLoading)
    return (
      <div className="space-y-4">
        <h2 className="section-title">Consumo OpenAI</h2>
        <Card className="bg-card border-border p-6">
          <div className="text-muted-foreground terminal-text text-sm text-center">Carregando...</div>
        </Card>
      </div>
    );
  if (isError || !data)
    return (
      <div className="space-y-4">
        <h2 className="section-title">Consumo OpenAI</h2>
        <Card className="bg-card border-border p-6">
          <div className="text-destructive terminal-text text-sm text-center">Erro ao carregar</div>
        </Card>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center justify-between">
        <h2 className="section-title">Consumo OpenAI</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal border-border bg-card terminal-text text-[10px] sm:text-sm h-8 px-2 sm:px-3"
              >
                <CalendarIcon className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                {format(startDate, "dd/MM/yy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(d) => d && setStartDate(d)}
                locale={ptBR}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground text-[10px] sm:text-xs">até</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="justify-start text-left font-normal border-border bg-card terminal-text text-[10px] sm:text-sm h-8 px-2 sm:px-3"
              >
                <CalendarIcon className="mr-1.5 sm:mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                {format(endDate, "dd/MM/yy", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card border-border" align="end">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(d) => d && setEndDate(d)}
                locale={ptBR}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4">
            <p className="kpi-label mb-1 sm:mb-2">TOKENS TOTAIS</p>
            <p className="kpi-value text-foreground terminal-text">{formatTokens(filteredData.totalTokens)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{filteredData.daysCount} dias</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4">
            <p className="kpi-label mb-1 sm:mb-2">CUSTO TOTAL</p>
            <p className="kpi-value text-primary terminal-text">{formatUSD(filteredData.totalCost)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              {formatBRL(filteredData.totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
              <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
              <p className="kpi-label">INPUT</p>
            </div>
            <p className="kpi-value text-foreground terminal-text">{formatTokens(filteredData.totalInput)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-1 sm:gap-1.5 mb-1 sm:mb-2">
              <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
              <p className="kpi-label">OUTPUT</p>
            </div>
            <p className="kpi-value text-foreground terminal-text">{formatTokens(filteredData.totalOutput)}</p>
          </CardContent>
        </Card>
      </div>
      {filteredData.byProject.length > 0 && (
        <div className="space-y-2">
          {filteredData.byProject.map((project) => (
            <Card key={project.id} className="bg-card border-border hover:bg-secondary/50 fast-transition">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-[120px] sm:min-w-[140px]">
                    <span className="status-dot status-dot-success" />
                    <span className="terminal-text text-foreground font-medium text-xs sm:text-base truncate">
                      {project.name}
                    </span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">({project.daysCount}d)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3 sm:gap-8 text-center sm:text-left">
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">TOKENS</p>
                      <p className="text-xs sm:text-base font-semibold text-foreground">
                        {formatTokens(project.tokens)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">INPUT</p>
                      <p className="text-xs sm:text-base font-semibold text-foreground">
                        {formatTokens(project.input)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">OUTPUT</p>
                      <p className="text-xs sm:text-base font-semibold text-foreground">
                        {formatTokens(project.output)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">CUSTO</p>
                      <p className="text-xs sm:text-base font-semibold text-primary">{formatUSD(project.cost)}</p>
                      <p className="text-[10px] text-muted-foreground hidden sm:block">{formatBRL(project.cost)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {filteredData.byProject.length === 0 && (
        <Card className="bg-card border-border p-4 sm:p-6">
          <div className="text-center text-muted-foreground text-xs sm:text-sm">Nenhum dado para o período</div>
        </Card>
      )}
      <p className="text-[10px] sm:text-xs text-muted-foreground text-right">
        Taxa: 1 USD = {config.USD_TO_BRL.toFixed(2)} BRL
      </p>
    </div>
  );
};

export { TokenUsagePanel };
