import chalk from 'chalk';
import fs from 'fs-extra';
import { kebabCase } from 'lodash';
import os from 'os';
import path from 'path';
import Generator from 'yeoman-generator';
import { Cli, CliArguments, CliOptions } from './cli';
import { Options } from './options';
import { Prompter } from './Prompter';

export class TsNodeStarterApp extends Generator {
  private _options = new Options();
  private _prompter = new Prompter(this.prompt.bind(this));
  private _repoClonePath = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-node-starter-'));
  private _repoUrl = 'https://github.com/leon19/ts-node-starter';
  private _repoBranch = 'master';
  private _start = new Date();

  private readonly _cli: Cli;

  constructor(args: CliArguments[], opts: CliOptions) {
    super(args, opts);

    this._cli = { args, opts };
  }

  private get cliName(): string | undefined {
    const name = this._cli && this._cli.opts && this._cli.opts.name && kebabCase(this._cli.opts.name.trim());

    return name || undefined;
  }

  private get gitUser(): string | undefined {
    return this.user.git.name() || undefined;
  }

  private get gitEMail(): string | undefined {
    return this.user.git.email() || undefined;
  }

  async prompting() {
    this._options.project.name = await this._prompter.askProjectName(this.cliName);
    this._options.project.description = await this._prompter.askDescription();
    this._options.author.name = await this._prompter.askAuthorName(this.gitUser);
    this._options.author.email = await this._prompter.askAuthorEmail(this.gitEMail);
  }

  async configuring() {
    const start = new Date();
    this.log();
    this.log(chalk.green('> Fetching base repository...'));

    await this._cloneRepository();

    const duration = getDuration(start);
    this.log(chalk.green('> Repository fetched after', Math.round(duration).toString(), 'seconds'));

    this.destinationPath(this.destinationRoot(this.destinationPath(this._options.project.name)));

    this.log();
    this.log(chalk.green('> Initializing git...'));
    this._gitInit();
  }

  writing() {
    this._copyRepository();
    this._updateReadme();
    this._removeExampleFiles();
    this._updatePackageJson();
  }

  install() {
    // do not make this function async or return the generated promise because it will fail for some unknown reason
    this.installDependencies({ yarn: false, npm: true, bower: false });
  }

  end() {
    this._gitCommit();

    const duration = getDuration(this._start);

    this.log();
    this.log(chalk.green('> Finished after', Math.round(duration).toString(), 'seconds'));
    this.log();
    this.log(chalk.green('> Add a git remote'));
    this.log(chalk.white(`  cd ${this._options.project.name}`));
    this.log(chalk.white('  git remote add origin [url]'));
    this.log(chalk.white('  git push --set-upstream origin master'));
    this.log();
  }

  private _gitInit() {
    this.spawnCommandSync('git', ['init', '--quiet']);
  }

  private _gitCommit() {
    this.spawnCommandSync('git', ['add', '.']);
    this.spawnCommandSync('git', ['commit', '--quiet', '-am', 'chore: initial commit', '--no-verify']);
  }

  private async _cloneRepository() {
    this.spawnCommandSync('git', ['clone', '--quiet', '--depth=1', '-b', this._repoBranch, this._repoUrl, this._repoClonePath]);
    await fs.remove(path.join(this._repoClonePath, '.git'));
  }

  private _copyRepository() {
    this.fs.copy(this._repoClonePath, this.destinationPath());
    this.fs.copy(path.join(this._repoClonePath, '.*'), this.destinationPath());
  }

  private _updatePackageJson() {
    this.fs.extendJSON(this.destinationPath('package.json'), {
      author: this._getAuthor(),
      description: this._options.project.description || undefined,
      license: 'UNLICENSED',
      name: this._options.project.name,
      repository: undefined,
      version: '0.0.0'
    });
  }

  private _updateReadme() {
    const readmePath = this.destinationPath('README.md');
    const readmeContent = ['# ' + this._options.project.name, ...this.fs.read(readmePath).split('\n').slice(1)].join('\n');

    this.fs.write(readmePath, readmeContent);
  }

  private _removeExampleFiles() {
    this.fs.delete(this.destinationPath('src/sum.ts'));
    this.fs.delete(this.destinationPath('LICENSE'));
    this.fs.delete(this.destinationPath('tests/unit'));
    this.fs.write(this.destinationPath('src/index.ts'), '');
  }

  private _getAuthor() {
    const author = {
      email: this._options.author.email || undefined,
      name: this._options.author.name || undefined
    };

    return author.name || author.email ? author : undefined;
  }
}

function getDuration(start: Date): number {
  return (Date.now() - start.getTime()) / 1000;
}
