import Generator from 'yeoman-generator';

export class Prompter {
  constructor(private generator: Generator) {}

  async askProjectName(): Promise<string> {
    const { name } = await this.generator.prompt({
      type: 'input',
      name: 'name',
      message: 'Your project name',
      default: this.generator.determineAppname()
    });

    if (this._isString(name) && name.trim()) {
      return name.trim();
    }

    return this.askProjectName();
  }

  async askDescription() {
    const { description } = await this.generator.prompt({
      type: 'input',
      name: 'description',
      message: 'Your project description'
    });

    return this._isString(description) ? description.trim() : '';
  }

  async askAuthorName() {
    const { authorName } = await this.generator.prompt({
      type: 'input',
      name: 'authorName',
      message: 'Author name',
      default: this.generator.user.git.name()
    });

    return this._isString(authorName) ? authorName.trim() : '';
  }

  async askAuthorEmail() {
    const { authorEmail } = await this.generator.prompt({
      type: 'input',
      name: 'authorEmail',
      message: 'Author email',
      default: this.generator.user.git.email()
    });

    return this._isString(authorEmail) ? authorEmail.trim() : '';
  }

  private _isString(variable: any): variable is string {
    return typeof variable === 'string';
  }
}
