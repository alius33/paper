export interface CommandTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  defaultContextFiles: string[];
}

export interface GeneratedCommand {
  command: string;
  description: string;
  timestamp: string;
}
