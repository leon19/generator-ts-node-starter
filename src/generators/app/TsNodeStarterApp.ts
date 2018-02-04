import os from 'os';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import moment from 'moment';
import Generator from 'yeoman-generator';
import { Prompter } from './Prompter';
import { Options } from './options';

export class TsNodeStarterApp extends Generator {
  private _prompter = new Prompter(this);
  private _options = new Options();
  private _repoClonePath = fs.mkdtempSync(path.join(os.tmpdir(), 'ts-node-starter-'));
  private _repoUrl = 'https://github.com/leon19/ts-node-starter';
  private _repoBranch = 'master';
  private _start = moment();

  async prompting() {
    this._options.project.name = await this._prompter.askProjectName();
    this._options.project.description = await this._prompter.askDescription();
    this._options.author.name = await this._prompter.askAuthorName();
    this._options.author.email = await this._prompter.askAuthorEmail();
  }

  async configuring() {
    const start = moment();
    this.log();
    this.log(chalk.green('> Fetching base repository...'));

    await this._cloneRepository();

    const duration = moment.duration(moment().diff(start)).asSeconds();
    this.log(chalk.green('> Repository fetched after', Math.round(duration).toString(), 'seconds'));
  }

  writing() {
    this._copyRepository();
    this._updateReadme();
    this._removeExampleFiles();
    this._updatePackageJson();
  }

  install() {
    this.installDependencies({ yarn: true, npm: false, bower: false });
  }

  end() {
    this.log();
    this.log(chalk.green('> Initializing git...'));
    this._initGit();

    const duration = moment.duration(moment().diff(this._start)).asSeconds();

    this.log();
    this.log(chalk.green('> Finished after', Math.round(duration).toString(), 'seconds'));
    this.log();
    this.log(chalk.green('> Add a git remote'));
    this.log(chalk.white('  git remote set-url origin [url]'));
    this.log(chalk.white('  git push --set-upstream origin master'));
    this.log();
  }

  private _initGit() {
    this.spawnCommandSync('git', ['init', '--quiet']);
    this.spawnCommandSync('git', ['add', '.']);
    this.spawnCommandSync('git', ['commit', '--quiet', '-m', 'chore: initial commit']);
    this.spawnCommandSync('yarn', ['--silent', 'git:hooks']);
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
      version: '0.0.0',
      name: this._options.project.name,
      description: this._options.project.description || undefined,
      author: this._getAuthor(),
      license: 'UNLICENSED',
      repository: undefined
    });
  }

  private _updateReadme() {
    const readmePath = this.destinationPath('README.md');
    const readmeContent = [
      '# ' + this._options.project.name,
      ...this.fs
        .read(readmePath)
        .split('\n')
        .slice(1)
    ].join('\n');

    this.fs.write(readmePath, readmeContent);
  }

  private _removeExampleFiles() {
    this.fs.delete(this.destinationPath('src/sum.ts'));
    this.fs.delete(this.destinationPath('LICENSE'));
    this.fs.delete(this.destinationPath('tests/unit'));
    this.fs.write(this.destinationPath('src/index.ts'), '\n\n');
  }

  private _getAuthor() {
    const author = {
      name: this._options.author.name || undefined,
      email: this._options.author.email || undefined
    };

    return author.name || author.email ? author : undefined;
  }
}
