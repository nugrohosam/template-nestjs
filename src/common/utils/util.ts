import * as _ from 'lodash';
import * as crypto from 'crypto';

export class Utils {
    static md5(contents: string): string {
        return crypto.createHash('md5').update(contents).digest('hex');
    }

    /**
     * snake case object key
     * @param obj
     */
    static snakeCaseKey(obj: { [x: string]: any }): { [x: string]: any } {
        if (typeof obj != 'object') return obj;

        for (const oldName in obj) {
            // Camel to underscore
            const newName = _.snakeCase(oldName);

            // Only process if names are different
            if (newName != oldName) {
                // Check for the old property name to avoid a ReferenceError in strict mode.
                if (obj.hasOwnProperty(oldName)) {
                    obj[newName] = obj[oldName];
                    delete obj[oldName];
                }
            }

            // Recursion
            if (typeof obj[newName] == 'object') {
                obj[newName] = Utils.snakeCaseKey(obj[newName]);
            }
        }
        return obj;
    }
}
