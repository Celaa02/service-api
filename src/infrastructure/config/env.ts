export type AppConfig = {
  stage: string;      // dev | prod
  region: string;     // us-east-1, etc.
  tableName: string;  // inyectada por params -> TABLE_NAME
  logLevel: "DEBUG" | "INFO" | "WARN" | "ERROR";
};

export const EnvKeys = {
  STAGE: "STAGE",
  TABLE_NAME: "TABLE_NAME",
  LOG_LEVEL: "LOG_LEVEL",
  AWS_REGION: "AWS_REGION"
} as const;
