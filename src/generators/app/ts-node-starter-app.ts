import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import Generator from 'yeoman-generator';
import type { Cli, CliArguments, CliOptions } from './cli.js';
import { Options } from './options.js';
import { Prompter } from './prompter.js';

export class TsNodeStarterApp extends Generator {
  #options = new Options();
  #prompter = new Prompter(this.prompt.bind(this));
  #repoClonePath = mkdtempSync(join(tmpdir(), 'ts-node-starter-'));
  #repoUrl = 'https://github.com/leon19/ts-node-starter';
  #repoBranch = 'main';
  #start = new Date();

  readonly #cli: Cli;

  constructor(args: CliArguments[], opts: CliOptions) {
    super(args, opts);

    this.#cli = { args, opts };
  }

  private get cliName(): string | undefined {
    const name = this.#cli?.opts?.name && kebabCase(this.#cli.opts.name.trim());

    return name || undefined;
  }

  async prompting(): Promise<void> {
    this.#options.project.name = await this.#prompter.askProjectName(this.cliName);
    this.#options.project.description = await this.#prompter.askDescription();
    this.#options.author.name = await this.#prompter.askAuthorName(await this.git.name());
    this.#options.author.email = await this.#prompter.askAuthorEmail(await this.git.email());
  }

  configuring(): void {
    const start = new Date();
    this.log();
    this.log(green('> Fetching base repository...'));

    this._cloneRepository();

    const duration = getDuration(start);
    this.log(green(`> Repository fetched after${Math.ceil(duration)}seconds`));

    this.destinationPath(this.destinationRoot(this.destinationPath(this.#options.project.name)));

    this.log();

    this.log(green('> Initializing git...'));
    this.spawnSync('git', ['init', '--quiet', '--initial-branch', 'main']);
  }

  writing(): void {
    this._copyRepository();
    this._updateReadme();
    this._removeExampleFiles();
    this._updatePackageJson();
  }

  end(): void {
    this._gitCommit();

    const duration = getDuration(this.#start);

    this.log();
    this.log(green(`> Finished after${Math.ceil(duration)}seconds`));
    this.log();
    this.log(green('> Add a git remote'));
    this.log(white(`  cd ${this.#options.project.name}`));
    this.log(white('  git remote add origin [url]'));
    this.log(white('  git push --set-upstream origin main'));
    this.log();
  }

  private _gitCommit() {
    this.spawnSync('git', ['add', '.']);
    this.spawnSync('git', ['commit', '--quiet', '-am', 'chore: initial commit', '--no-verify']);
  }

  private _cloneRepository() {
    this.spawnSync('git', [
      'clone',
      '--quiet',
      '--depth=1',
      '-b',
      this.#repoBranch,
      this.#repoUrl,
      this.#repoClonePath,
    ]);
    rmSync(join(this.#repoClonePath, '.git'), { force: true, recursive: true });
  }

  private _copyRepository() {
    this.fs.copy(join(this.#repoClonePath, '.*'), this.destinationPath());
    this.fs.copy(join(this.#repoClonePath, '.husky/*'), this.destinationPath('.husky'));
    this.fs.copy(join(this.#repoClonePath, '.github/workflows/*'), this.destinationPath('.github/workflows'));
    this.fs.copy(join(this.#repoClonePath, '.vscode/*'), this.destinationPath('.vscode'));
    this.fs.copy(this.#repoClonePath, this.destinationPath());
  }

  private _updatePackageJson() {
    this.fs.extendJSON(this.destinationPath('package.json'), {
      author: this._getAuthor(),
      description: this.#options.project.description || undefined,
      license: 'UNLICENSED',
      name: this.#options.project.name,
      repository: undefined,
    });
  }

  private _updateReadme() {
    const readmePath = this.destinationPath('README.md');
    const readmeContents = this.fs.read(readmePath);

    if (!readmeContents) {
      return;
    }

    const readmeContent = [`# ${this.#options.project.name}`, ...readmeContents.split('\n').slice(1)].join('\n');

    this.fs.write(readmePath, readmeContent);
  }

  private _removeExampleFiles() {
    this.fs.delete(this.destinationPath('src/sum.ts'));
    this.fs.delete(this.destinationPath('src/sum.test.ts'));
    this.fs.delete(this.destinationPath('LICENSE'));
    this.fs.write(this.destinationPath('src/index.ts'), '\n');
  }

  private _getAuthor() {
    const author = {
      email: this.#options.author.email || undefined,
      name: this.#options.author.name || undefined,
    };

    return author.name || author.email ? author : undefined;
  }
}

function getDuration(start: Date): number {
  return (Date.now() - start.getTime()) / 1000;
}

function green(text: string): string {
  return `\u001b[32m${text}\u001b[39m`;
}

function white(text: string): string {
  return `\u001b[37m${text}\u001b[39m`;
}

function kebabCase(value: string): string {
  return value
    .replace(/\s+/, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}
