import { registerDecorator, ValidationOptions } from 'class-validator';
import { Position } from './freelancer.enum';

export const IsPosition: Function = (
  validationOptions?: ValidationOptions & { nullable?: boolean },
): Function => {
  const isEmpty: Function = (value): boolean => {
    return validationOptions.nullable && !value;
  };

  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isPosition',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any): boolean | Promise<boolean> {
          if (isEmpty(value)) {
            return true;
          }

          return Object.values(Position).includes(value);
        },
      },
    });
  };
};
