import { CliArguments } from './CliArguments';
import { CliOptions } from './CliOptions';

export interface Cli {
  readonly args: CliArguments[];
  readonly opts: CliOptions;
}
