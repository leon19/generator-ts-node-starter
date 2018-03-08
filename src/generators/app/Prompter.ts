import { isString, kebabCase } from 'lodash';
import Generator from 'yeoman-generator';

export class Prompter {
  constructor(private generator: Generator) {}

  async askProjectName(): Promise<string> {
    const { name } = await this.generator.prompt({
      type: 'input',
      name: 'name',
      message: 'Your project name',
      default: kebabCase(this.generator.determineAppname())
    });

    if (isString(name) && name.trim()) {
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

    return isString(description) ? description.trim() : '';
  }

  async askAuthorName() {
    const { authorName } = await this.generator.prompt({
      type: 'input',
      name: 'authorName',
      message: 'Author name',
      default: this.generator.user.git.name()
    });

    return isString(authorName) ? authorName.trim() : '';
  }

  async askAuthorEmail() {
    const { authorEmail } = await this.generator.prompt({
      type: 'input',
      name: 'authorEmail',
      message: 'Author email',
      default: this.generator.user.git.email()
    });

    return isString(authorEmail) ? authorEmail.trim() : '';
  }
}
