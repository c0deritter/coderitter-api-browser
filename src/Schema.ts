import { Schema } from 'knight-object-db'

/**
 * The schema as demanded from the object database. It is needed to also be able to update
 * the relationships between the objects. For example if you delete an object it also has
 * to be deleted on any other object that references it. Take a look at the documentation
 * if knight-object-db for further instructions: https://github.com/c0deritter/knight-object-db#readme
 */
export const schema = {
} as Schema