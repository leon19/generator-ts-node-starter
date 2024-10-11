import type Generator from 'yeoman-generator';

export class Prompter {
  constructor(private prompt: Generator['prompt']) {}

  async askProjectName(defaultName = ''): Promise<string> {
    const { name } = await this.prompt({
      default: defaultName,
      message: 'Your project name',
      name: 'name',
      type: 'input',
    });

    if (isString(name) && name.trim()) {
      return name.trim();
    }

    return this.askProjectName();
  }

  async askDescription(): Promise<string> {
    const { description } = await this.prompt({
      message: 'Your project description',
      name: 'description',
      type: 'input',
    });

    return isString(description) ? description.trim() : '';
  }

  async askAuthorName(defaultAuthorName = ''): Promise<string> {
    const { authorName } = await this.prompt({
      default: defaultAuthorName,
      message: 'Author name',
      name: 'authorName',
      type: 'input',
    });

    return isString(authorName) ? authorName.trim() : '';
  }

  async askAuthorEmail(defaultAuthorEmail = ''): Promise<string> {
    const { authorEmail } = await this.prompt({
      default: defaultAuthorEmail,
      message: 'Author email',
      name: 'authorEmail',
      type: 'input',
    });

    return isString(authorEmail) ? authorEmail.trim() : '';
  }
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}
