import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UserModel } from 'src/entities/dblocaltest';

@ValidatorConstraint({ name: '', async: true })
@Injectable()
class UserEmailUniqueConstraint implements ValidatorConstraintInterface {
    async validate(value: string) {
        return value
            ? UserModel.count({ where: { email: value } }).then(
                  (count) => count === 0,
              )
            : true;
    }

    defaultMessage(args: ValidationArguments) {
        return `Email ${args.value} has been used`;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function UserEmailUnique(
    validationOptions?: ValidationOptions,
): (object?: any, propertyName?: string) => void {
    return function (object?: any, propertyName?: string) {
        registerDecorator({
            name: 'UserEmailUnique',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: UserEmailUniqueConstraint,
        });
    };
}
