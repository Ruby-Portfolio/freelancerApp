import { registerDecorator, ValidationOptions } from 'class-validator';

/**
 * 페이지 번호 값 검증 Validator
 * @param validationOptions
 */
export const IsPage = (
  validationOptions?: ValidationOptions & { nullable?: boolean },
): Function => {
  return (object: Object, propertyName: string): void => {
    registerDecorator({
      name: 'isPage',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: number): boolean | Promise<boolean> {
          return value >= 0;
        },
      },
    });
  };
};
