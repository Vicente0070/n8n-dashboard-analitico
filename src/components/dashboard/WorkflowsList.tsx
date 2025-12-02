import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch } from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  updatedAt: string;
  tags: Array<{ id: string; name: string }>;
}

interface WorkflowsListProps {
  workflows: Workflow[];
}

export const WorkflowsList = ({ workflows }: WorkflowsListProps) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Registro de Fluxos</h2>
        <span className="text-[10px] sm:text-xs text-muted-foreground terminal-text">
          {workflows.length} fluxos
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
        {workflows.map((workflow) => (
          <Card
            key={workflow.id}
            className="p-3 sm:p-4 bg-card border-border hover:bg-secondary/50 fast-transition"
          >
            <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
              <GitBranch className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium terminal-text text-foreground text-xs sm:text-sm truncate">
                  {workflow.name}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground terminal-text font-mono mt-0.5">
                  ID: {workflow.id}
                </p>
              </div>
            </div>

            {workflow.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
                {workflow.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="terminal-text text-[10px] sm:text-xs px-1.5 sm:px-2 py-0"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-[10px] sm:text-xs text-muted-foreground terminal-text">
              Atualizado: {formatDate(workflow.updatedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
