import { User, Phone, Instagram, Globe, ExternalLink } from "lucide-react";

interface DashboardHeaderProps {
  devData: {
    empresa: string;
    nome: string;
    whatsapp: string;
    n8nurl: string;
    instagram: string;
    site: string;
  };
}

export const DashboardHeader = ({ devData }: DashboardHeaderProps) => {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-baseline gap-2 sm:gap-3 mb-2 sm:mb-3">
        <h1 className="text-lg sm:text-2xl font-bold text-foreground terminal-text truncate">
          {devData.empresa}
        </h1>
        <span className="text-[10px] sm:text-xs text-muted-foreground terminal-text flex-shrink-0">
          ANALYTICS
        </span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 md:gap-6 text-[10px] sm:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
          <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="terminal-text">{devData.nome}</span>
        </div>
        
        <a
          href={`https://wa.me/${devData.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground fast-transition active:text-foreground"
        >
          <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="terminal-text hidden xs:inline">{devData.whatsapp}</span>
          <span className="terminal-text xs:hidden">WhatsApp</span>
        </a>
        
        <a
          href={`https://instagram.com/${devData.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground fast-transition active:text-foreground"
        >
          <Instagram className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="terminal-text">@{devData.instagram}</span>
        </a>
        
        <a
          href={devData.site}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground fast-transition active:text-foreground"
        >
          <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="terminal-text">Site</span>
        </a>
        
        <a
          href={devData.n8nurl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 sm:gap-2 text-primary hover:text-primary/80 fast-transition active:text-primary/80"
        >
          <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span className="terminal-text font-medium">n8n</span>
        </a>
      </div>
    </div>
  );
};
