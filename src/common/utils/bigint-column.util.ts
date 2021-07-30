import BN from 'bn.js';
import { DataType, Model, ModelCtor } from 'sequelize-typescript';
import { ModelAttributeColumnOptions } from 'sequelize/types';

export const useBigIntColumn = <M extends Model>(
    model: ModelCtor<M>,
    attribute: keyof M,
    field?: string,
): Partial<ModelAttributeColumnOptions> => {
    return {
        field,
        type: DataType.BIGINT,
        allowNull: false,
        defaultValue: 0,
        get(this: M): BN {
            return new BN(this.getDataValue(attribute).toString());
        },
    };
};
