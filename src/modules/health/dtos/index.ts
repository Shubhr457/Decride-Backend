export interface HealthStatusDto {
  service: string;
  status: string;
  environment: string;
  timestamp: string;
  uptime: number;
}

export interface DatabaseHealthStatusDto {
  service: string;
  readyState: number;
  status: string;
  name: string | null;
  host: string | null;
  timestamp: string;
}
