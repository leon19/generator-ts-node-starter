export type CliArguments = string;

export interface CliOptions {
  name: string;
}

export interface Cli {
  readonly args: CliArguments[];
  readonly opts: CliOptions;
}
