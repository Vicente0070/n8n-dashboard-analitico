import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";

interface Instance {
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
  ownerJid?: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
  counts?: {
    messages: number;
    contacts: number;
    chats: number;
  };
  hasChatwoot?: boolean;
  rabbitmq?: {
    enabled: boolean;
    events: string[];
    updatedAt: string;
  };
  settings?: {
    groupsIgnore: boolean;
    alwaysOnline: boolean;
    readMessages: boolean;
    readStatus: boolean;
  };
  disconnectionAt?: string | null;
  profilePicUrl?: string;
}

interface InstanceMonitorProps {
  instances: Instance[];
  total: number;
}

export const InstanceMonitor = ({ instances, total }: InstanceMonitorProps) => {
  const [selectedInstance, setSelectedInstance] = useState<Instance | null>(null);
  const connectedCount = instances.filter(i => i.connectionStatus === "open").length;

  const formatDate = (date?: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("pt-BR");
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="section-title">Instâncias</h2>
            <span className="text-xs text-muted-foreground terminal-text">
              {connectedCount}/{total} conectadas
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {instances.map((instance) => {
            const isConnected = instance.connectionStatus === "open";

            return (
              <Card
                key={instance.id}
                onClick={() => setSelectedInstance(instance)}
                className="p-3 sm:p-4 bg-card border-border cursor-pointer fast-transition active:bg-secondary hover:bg-secondary"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium terminal-text truncate text-foreground text-xs sm:text-sm">
                      {instance.name}
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground terminal-text truncate">
                      {instance.profileName || instance.number}
                    </p>
                  </div>
                  {isConnected ? (
                    <Wifi className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 ml-1 sm:ml-2" />
                  ) : (
                    <WifiOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive flex-shrink-0 ml-1 sm:ml-2" />
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`status-dot ${isConnected ? "status-dot-success" : "status-dot-error"}`} />
                  <span className={`text-[10px] sm:text-xs terminal-text ${isConnected ? "text-primary" : "text-destructive"}`}>
                    {isConnected ? "Online" : "Offline"}
                  </span>
                </div>

                {!isConnected && instance.disconnectionReasonCode && (
                  <div className="mt-1.5 sm:mt-2 flex items-start gap-1 text-[10px] sm:text-xs text-muted-foreground">
                    <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0 mt-0.5 text-destructive/60" />
                    <span className="terminal-text truncate">
                      Código {instance.disconnectionReasonCode}
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={!!selectedInstance} onOpenChange={(open) => !open && setSelectedInstance(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-xl font-semibold terminal-text text-foreground">
              Diagnóstico: {selectedInstance?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground terminal-text text-xs sm:text-sm">
              Informações detalhadas da instância
            </DialogDescription>
          </DialogHeader>

          {selectedInstance && (
            <div className="space-y-4 mt-4">
              {/* Connection Status */}
              <div className={`p-4 rounded border ${
                selectedInstance.connectionStatus === "open" 
                  ? "border-primary/30 bg-primary/5" 
                  : "border-destructive/30 bg-destructive/5"
              }`}>
                <p className="text-xs text-muted-foreground terminal-text mb-2">STATUS DE CONEXÃO</p>
                <div className="flex items-center gap-2">
                  <span className={`status-dot ${selectedInstance.connectionStatus === "open" ? "status-dot-success" : "status-dot-error"}`} />
                  <p className={`text-2xl font-bold terminal-text ${
                    selectedInstance.connectionStatus === "open" ? "text-primary" : "text-destructive"
                  }`}>
                    {selectedInstance.connectionStatus === "open" ? "Conectado" : "Desconectado"}
                  </p>
                </div>
                
                {selectedInstance.disconnectionReasonCode && (
                  <div className="mt-3 p-3 border border-destructive/20 rounded bg-destructive/5">
                    <p className="text-sm font-medium terminal-text text-destructive mb-1">
                      Código de erro: {selectedInstance.disconnectionReasonCode}
                    </p>
                    {selectedInstance.disconnectionObject?.error?.output?.payload?.message && (
                      <p className="text-xs terminal-text text-muted-foreground">
                        {selectedInstance.disconnectionObject.error.output.payload.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="p-4 rounded border border-border bg-secondary/30">
                <p className="text-xs text-muted-foreground terminal-text mb-3">INFORMAÇÕES BÁSICAS</p>
                <div className="grid grid-cols-2 gap-2 text-sm terminal-text">
                  <div><span className="text-muted-foreground">ID:</span> <span className="text-foreground font-mono">{selectedInstance.id}</span></div>
                  <div><span className="text-muted-foreground">Nome:</span> <span className="text-foreground">{selectedInstance.name}</span></div>
                  <div><span className="text-muted-foreground">Perfil:</span> <span className="text-foreground">{selectedInstance.profileName || "N/A"}</span></div>
                  <div><span className="text-muted-foreground">Número:</span> <span className="text-foreground font-mono">{selectedInstance.number}</span></div>
                  <div><span className="text-muted-foreground">Criado:</span> <span className="text-foreground">{formatDate(selectedInstance.createdAt)}</span></div>
                  <div><span className="text-muted-foreground">Atualizado:</span> <span className="text-foreground">{formatDate(selectedInstance.updatedAt)}</span></div>
                </div>
              </div>

              {/* Counts */}
              {selectedInstance.counts && (
                <div className="p-4 rounded border border-border bg-secondary/30">
                  <p className="text-xs text-muted-foreground terminal-text mb-3">ESTATÍSTICAS</p>
                  <div className="grid grid-cols-3 gap-4 text-sm terminal-text">
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">{selectedInstance.counts.messages.toLocaleString()}</p>
                      <p className="text-muted-foreground text-xs">Mensagens</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">{selectedInstance.counts.contacts.toLocaleString()}</p>
                      <p className="text-muted-foreground text-xs">Contatos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-foreground">{selectedInstance.counts.chats.toLocaleString()}</p>
                      <p className="text-muted-foreground text-xs">Chats</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Settings */}
              {selectedInstance.settings && (
                <div className="p-4 rounded border border-border bg-secondary/30">
                  <p className="text-xs text-muted-foreground terminal-text mb-3">CONFIGURAÇÕES</p>
                  <div className="grid grid-cols-2 gap-2 text-sm terminal-text">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Ignorar grupos:</span>
                      <Badge variant={selectedInstance.settings.groupsIgnore ? "default" : "secondary"} className="text-xs">
                        {selectedInstance.settings.groupsIgnore ? "Sim" : "Não"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Sempre online:</span>
                      <Badge variant={selectedInstance.settings.alwaysOnline ? "default" : "secondary"} className="text-xs">
                        {selectedInstance.settings.alwaysOnline ? "Sim" : "Não"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Ler mensagens:</span>
                      <Badge variant={selectedInstance.settings.readMessages ? "default" : "secondary"} className="text-xs">
                        {selectedInstance.settings.readMessages ? "Sim" : "Não"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Ler status:</span>
                      <Badge variant={selectedInstance.settings.readStatus ? "default" : "secondary"} className="text-xs">
                        {selectedInstance.settings.readStatus ? "Sim" : "Não"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* RabbitMQ */}
              {selectedInstance.rabbitmq && (
                <div className="p-4 rounded border border-border bg-secondary/30">
                  <p className="text-xs text-muted-foreground terminal-text mb-3">RABBITMQ</p>
                  <div className="space-y-2 text-sm terminal-text">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Habilitado:</span>
                      <Badge variant={selectedInstance.rabbitmq.enabled ? "default" : "secondary"} className="text-xs">
                        {selectedInstance.rabbitmq.enabled ? "Sim" : "Não"}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Eventos:</span>{" "}
                      <span className="text-foreground text-xs">{selectedInstance.rabbitmq.events.join(", ")}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chatwoot */}
              <div className="p-4 rounded border border-border bg-secondary/30">
                <p className="text-xs text-muted-foreground terminal-text mb-3">CHATWOOT</p>
                <Badge variant={selectedInstance.hasChatwoot ? "default" : "secondary"} className="text-xs">
                  {selectedInstance.hasChatwoot ? "Integrado" : "Não integrado"}
                </Badge>
              </div>

              {/* Raw Disconnection Object */}
              {selectedInstance.disconnectionObject && (
                <div className="p-4 rounded border border-destructive/20 bg-destructive/5">
                  <p className="text-xs text-muted-foreground terminal-text mb-3">OBJETO DE DESCONEXÃO (RAW)</p>
                  <pre className="text-xs terminal-text text-foreground overflow-x-auto bg-background/50 p-3 rounded">
                    {JSON.stringify(selectedInstance.disconnectionObject, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
