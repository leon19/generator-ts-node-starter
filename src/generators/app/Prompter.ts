import { isString, kebabCase } from 'lodash';
import Generator from 'yeoman-generator';

export class Prompter {
  constructor(private generator: Generator) {}

  async askProjectName(): Promise<string> {
    const { name } = await this.generator.prompt({
      default: kebabCase(this.generator.determineAppname()),
      message: 'Your project name',
      name: 'name',
      type: 'input'
    });

    if (isString(name) && name.trim()) {
      return name.trim();
    }

    return this.askProjectName();
  }

  async askDescription() {
    const { description } = await this.generator.prompt({
      message: 'Your project description',
      name: 'description',
      type: 'input'
    });

    return isString(description) ? description.trim() : '';
  }

  async askAuthorName() {
    const { authorName } = await this.generator.prompt({
      default: this.generator.user.git.name(),
      message: 'Author name',
      name: 'authorName',
      type: 'input'
    });

    return isString(authorName) ? authorName.trim() : '';
  }

  async askAuthorEmail() {
    const { authorEmail } = await this.generator.prompt({
      default: this.generator.user.git.email(),
      message: 'Author email',
      name: 'authorEmail',
      type: 'input'
    });

    return isString(authorEmail) ? authorEmail.trim() : '';
  }
}
