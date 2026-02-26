import {
  renderTemplate,
  TemplateVariableValidationError,
} from './email.service';
import { EmailTemplateVersion } from '../config/email.config';

describe('EmailService template variable schema validation', () => {
  const template: EmailTemplateVersion = {
    version: 'v-test',
    subject: 'Hello {{username}}',
    html: '<p>{{username}} is {{age}}</p>',
    text: '{{username}}',
    requiredVars: ['username'],
    variableSchema: {
      required: {
        username: 'string',
      },
      optional: {
        age: 'number',
      },
    },
    lifecycleState: 'active',
  };

  it('renders successfully for a valid payload', () => {
    const rendered = renderTemplate('welcome', template, {
      username: 'Alice',
      age: 30,
    });

    expect(rendered.subject).toContain('Alice');
    expect(rendered.html).toContain('30');
    expect(rendered.text).toContain('Alice');
  });

  it('fails for missing required keys', () => {
    expect(() =>
      renderTemplate('welcome', template, {
        age: 30,
      }),
    ).toThrow(TemplateVariableValidationError);

    try {
      renderTemplate('welcome', template, { age: 30 });
    } catch (error) {
      const validationError = error as TemplateVariableValidationError;
      expect(validationError.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'missing',
            key: 'username',
          }),
        ]),
      );
    }
  });

  it('fails for unknown keys', () => {
    expect(() =>
      renderTemplate('welcome', template, {
        username: 'Alice',
        unknownField: 'unexpected',
      }),
    ).toThrow(TemplateVariableValidationError);

    try {
      renderTemplate('welcome', template, {
        username: 'Alice',
        unknownField: 'unexpected',
      });
    } catch (error) {
      const validationError = error as TemplateVariableValidationError;
      expect(validationError.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'unknown',
            key: 'unknownField',
          }),
        ]),
      );
    }
  });

  it('fails for primitive type mismatches', () => {
    expect(() =>
      renderTemplate('welcome', template, {
        username: 'Alice',
        age: 'not-a-number',
      }),
    ).toThrow(TemplateVariableValidationError);

    try {
      renderTemplate('welcome', template, {
        username: 'Alice',
        age: 'not-a-number',
      });
    } catch (error) {
      const validationError = error as TemplateVariableValidationError;
      expect(validationError.violations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: 'type_mismatch',
            key: 'age',
            expected: 'number',
            actual: 'string',
          }),
        ]),
      );
    }
  });
});
