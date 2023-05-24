import { join } from 'node:path';
import { faker } from '@faker-js/faker';
import assert from 'yeoman-assert';
import helpers, { type RunResult } from 'yeoman-test';

const generatorDir = join(__dirname, '../src/generators/app');

describe('Generator ts-node-starter', () => {
  let runResult: RunResult;

  describe('when all the questions are answered', () => {
    const name = faker.lorem.word();
    const description = faker.lorem.sentence();
    const authorName = faker.person.firstName() + faker.person.lastName();
    const authorEmail = faker.internet.email();
    const author = { email: authorEmail, name: authorName };

    before(async function installGenerator() {
      this.timeout(30000);

      runResult = await helpers
        .run(generatorDir)
        .withPrompts({
          authorEmail: author.email,
          authorName: author.name,
          description,
          name
        })
        .withOptions({ skipInstall: true });

      process.chdir(join(runResult.cwd, name));
    });

    it('should remove the LICENSE file', () => {
      assert.noFile('LICENSE');
    });

    it('should set UNLICENSED in package.json', () => {
      assert.jsonFileContent('package.json', { license: 'UNLICENSED' });
    });

    it('should set the "version" to "1.0.0" in package.json', () => {
      assert.jsonFileContent('package.json', { version: '0.0.0-development' });
    });

    it('should update the "name" in the package.json', () => {
      assert.jsonFileContent('package.json', { name });
    });

    it('should update the "description" in the package.json', () => {
      assert.jsonFileContent('package.json', { description });
    });

    it('should update the "author" in the package.json', () => {
      assert.jsonFileContent('package.json', { author });
    });

    it('should remove the "repository" from package.json', () => {
      assert.jsonFileContent('package.json', { repository: undefined });
    });

    it('should remove example files', () => {
      assert.noFile('src/sum.ts');
      assert.noFile('src/sum.test.ts');
      assert.fileContent('src/index.ts', '');
    });

    it('should update the README.md', () => {
      assert.fileContent('README.md', '# ' + name);
    });

    it('should initialize a git repository', () => {
      assert.file('.git');
    });

    it('should copy the .husky folder', () => {
      assert.file('.husky/commit-msg');
      assert.file('.husky/pre-commit');
      assert.file('.husky/post-commit');
    });

    it('should copy the .github folder', () => {
      assert.file('.github/workflows/release.yml');
      assert.file('.github/workflows/test.yml');
    });
  });

  context('when the description is empty', () => {
    before(async function installGenerator() {
      this.timeout(30000);

      const name = faker.lorem.word();

      runResult = await helpers
        .run(generatorDir)
        .withPrompts({
          description: '',
          name
        })
        .withOptions({ skipInstall: true });

      process.chdir(join(runResult.cwd, name));
    });

    it('should not set description in the "package.json"', () => {
      assert.jsonFileContent('package.json', { description: undefined });
    });
  });
});
