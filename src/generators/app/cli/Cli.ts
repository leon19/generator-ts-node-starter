import type { CliArguments } from './CliArguments';
import type { CliOptions } from './CliOptions';

export interface Cli {
  readonly args: CliArguments[];
  readonly opts: CliOptions;
}
